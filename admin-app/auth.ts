/**
 * Configuration Auth.js **complete, cote Node uniquement**.
 *
 * Etend auth.config.ts (Edge-safe) avec le provider Credentials qui a
 * besoin de:
 *   - @node-rs/argon2 (verifie le mot de passe)
 *   - ioredis (lit l'utilisateur en base)
 *   - lib/rate-limit, lib/audit-log, lib/ip (Node uniquement)
 *
 * Utilise par:
 *   - app/api/auth/[...nextauth]/route.ts   (handlers)
 *   - app/login/actions.ts                   (signIn)
 *   - app/(protected)/**                     (auth() pour lire la session)
 *
 * NE PAS importer depuis proxy.ts (ex-middleware.ts sous Next <=15) — voir auth.config.ts pour ca.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { verifyPassword, dummyHash } from "@/lib/password";
import { getUserByEmail, getUserById, touchLastLogin, toPublic } from "@/lib/users";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";
import { hashIp } from "@/lib/ip";

const CredentialsSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(4096)
});

// Note: le hash timing-safe pour email inexistant est genere via dummyHash()
// (lib/password.ts) qui utilise les MEMES ARGON2_PARAMS que les vrais hashes,
// et cache le resultat en memoire apres le premier appel. Cela evite les
// timing attacks meme si on change les parametres Argon2 dans le futur
// (fix audit M6).

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // Override du callback jwt d'auth.config.ts pour ajouter le check
    // sessionVersion vs Redis. Ce callback tourne cote Node (route handlers,
    // server components) — le middleware Edge utilise celui d'auth.config
    // qui ne fait pas d'IO.
    jwt: async ({ token, user }) => {
      // Enrichissement au signIn (premiere fois: user est defini)
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "editor";
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 1;
        return token;
      }

      // Refresh subsequent: verifier sessionVersion vs Redis
      const tokenUserId = token.id as string | undefined;
      const tokenSessionVersion = (token as { sessionVersion?: number }).sessionVersion ?? 1;
      if (!tokenUserId) return null;

      try {
        const dbUser = await getUserById(tokenUserId);
        if (!dbUser) return null; // User supprime
        if ((dbUser.sessionVersion ?? 1) !== tokenSessionVersion) {
          // Kill switch declenche ou reset password: session invalidee
          return null;
        }
      } catch {
        // Fail-open sur erreur Redis (log serveur, mais on laisse passer):
        // preferer laisser l'user connecte plutot que le kicker en cas de
        // panne temporaire de Redis.
      }
      return token;
    }
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials, request) => {
        const parsed = CredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const emailKey = email.toLowerCase();

        // Extraction IP hachee (pour rate limit + audit)
        const ipHash = (() => {
          const fwd = request?.headers?.get("x-forwarded-for");
          const ip =
            fwd?.split(",")[0]?.trim() ??
            request?.headers?.get("x-real-ip") ??
            "unknown";
          return ip === "unknown" ? "unknown" : hashIp(ip);
        })();
        const userAgent = request?.headers?.get("user-agent") ?? null;

        // Rate limit par IP: 5 / 15 min
        const rlIp = await checkRateLimit({
          kind: "login-ip",
          subject: ipHash,
          max: 5,
          windowSeconds: 15 * 60
        });
        // Rate limit par email: 10 / 24h (verrou soft)
        const rlEmail = await checkRateLimit({
          kind: "login-email",
          subject: emailKey,
          max: 10,
          windowSeconds: 24 * 60 * 60
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

        const user = await getUserByEmail(email);
        const hashToCheck = user?.passwordHash ?? (await dummyHash());
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

        return toPublic(user);
      }
    })
  ]
});
