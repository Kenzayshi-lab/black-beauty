/**
 * Configuration Auth.js v5 (next-auth beta).
 *
 * Provider: Credentials (email + mot de passe)
 * Storage session: JWT (stateless, pas de session en base)
 * Storage users: Redis (voir lib/users.ts)
 *
 * ⚠️ authorize() tourne en runtime Node (verifie mot de passe avec Argon2).
 * Le middleware Auth (voir middleware.ts) tourne en Edge — il verifie
 * uniquement la signature JWT, ce qui est compatible Edge.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyPassword } from "@/lib/password";
import { getUserByEmail, touchLastLogin, toPublic } from "@/lib/users";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";
import { hashIp } from "@/lib/ip";
import { env } from "@/lib/env";

const CredentialsSchema = z.object({
  email:    z.string().email().max(200),
  password: z.string().min(8).max(4096)
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge:   env().SESSION_TTL,
    updateAge: 60 * 5 // refresh cookie toutes les 5 min si actif
  },
  pages: {
    signIn: "/login",
    error:  "/login"
  },
  cookies: {
    sessionToken: {
      name: "__Host-bb.session",
      options: {
        httpOnly: true,
        secure:   true,
        sameSite: "strict",
        path:     "/"
      }
    }
  },
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",     type: "email" },
        password: { label: "Password",  type: "password" }
      },
      authorize: async (credentials, request) => {
        // Validation stricte des inputs
        const parsed = CredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const emailKey = email.toLowerCase();

        // Extraction de l'IP hachee (pour rate limit + audit)
        const ipHash = (() => {
          const fwd = request?.headers?.get("x-forwarded-for");
          const ip = fwd?.split(",")[0]?.trim() ?? request?.headers?.get("x-real-ip") ?? "unknown";
          return ip === "unknown" ? "unknown" : hashIp(ip);
        })();
        const userAgent = request?.headers?.get("user-agent") ?? null;

        // Rate limit par IP: 5 tentatives par 15 min
        const rlIp = await checkRateLimit({
          kind: "login-ip", subject: ipHash, max: 5, windowSeconds: 15 * 60
        });
        // Rate limit par email: 10 tentatives par 24h (verrou soft)
        const rlEmail = await checkRateLimit({
          kind: "login-email", subject: emailKey, max: 10, windowSeconds: 24 * 60 * 60
        });

        if (!rlIp.ok || !rlEmail.ok) {
          await logAuditEvent({
            action: "login.rate_limited",
            actorUserId: null,
            actorEmail: email,
            ipHash,
            userAgent,
            details: { reason: !rlIp.ok ? "ip" : "email" }
          });
          return null;
        }

        // Lecture utilisateur + verification mot de passe
        // ⚠️ On appelle verifyPassword MEME si l'utilisateur n'existe pas
        // (avec un hash bidon) pour eviter la timing attack qui permettrait
        // de decouvrir quels emails sont enregistres.
        const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        const user = await getUserByEmail(email);
        const hashToCheck = user?.passwordHash ?? DUMMY_HASH;
        const passwordOk = await verifyPassword(password, hashToCheck);

        if (!user || !passwordOk) {
          await logAuditEvent({
            action: "login.failure",
            actorUserId: user?.id ?? null,
            actorEmail: email,
            ipHash,
            userAgent
          });
          return null;
        }

        // Succes — reset rate limits + met a jour lastLoginAt + audit
        await Promise.all([
          resetRateLimit("login-ip", ipHash),
          resetRateLimit("login-email", emailKey),
          touchLastLogin(user.id),
          logAuditEvent({
            action: "login.success",
            actorUserId: user.id,
            actorEmail: user.email,
            ipHash,
            userAgent
          })
        ]);

        // Retourne uniquement les champs publics (jamais le hash!)
        return toPublic(user);
      }
    })
  ],
  callbacks: {
    // Enrichit le JWT avec le role et l'id
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "editor";
      }
      return token;
    },
    // Expose id et role dans la session cote client
    session: async ({ session, token }) => {
      if (session.user && token) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    // Gate d'acces — appele par le middleware sur chaque requete
    authorized: async ({ auth: session, request }) => {
      const isLoggedIn = !!session?.user;
      const path = request.nextUrl.pathname;
      const isLoginPage = path === "/login";
      const isAuthEndpoint = path.startsWith("/api/auth");

      if (isAuthEndpoint) return true; // Toujours autoriser Auth.js lui-meme
      if (isLoginPage) return true;    // Login accessible non-logue
      return isLoggedIn;               // Tout le reste requiert une session
    }
  },
  // trustHost=true necessaire quand AUTH_URL != la meme origin que le request
  trustHost: true
});
