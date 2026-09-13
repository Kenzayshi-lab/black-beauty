/**
 * Configuration Auth.js **Edge-compatible**.
 *
 * ⚠️ Ce fichier est importe par middleware.ts qui tourne en Edge runtime.
 * IL NE DOIT PAS importer:
 *   - @node-rs/argon2 (module natif)
 *   - ioredis (utilise node:crypto, node:diagnostics_channel)
 *   - lib/password, lib/users, lib/audit-log, lib/redis, lib/env
 *
 * La config complete (avec verification mot de passe, acces Redis, etc.)
 * est dans auth.ts et n'est chargee que par les route handlers Node.
 *
 * Voir: https://authjs.dev/guides/edge-compatibility
 */

import type { NextAuthConfig } from "next-auth";

const SESSION_TTL = 15 * 60; // 15 min — matche env().SESSION_TTL cote Node

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_TTL,
    updateAge: 60 * 5
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  cookies: {
    sessionToken: {
      name: "__Host-bb.session",
      options: {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/"
      }
    }
  },
  providers: [
    // Vide ici — le vrai provider Credentials est defini dans auth.ts
    // (necessaire pour l'authorize() qui appelle Argon2 + Redis).
    // Auth.js merge les providers correctement au chargement.
  ],
  callbacks: {
    // Enrichit le JWT — pas d'IO ici, safe pour Edge
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "editor";
      }
      return token;
    },
    // Expose id et role dans la session — pas d'IO
    session: async ({ session, token }) => {
      if (session.user && token) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    // Gate d'acces appele par le middleware — pas d'IO, uniquement de la
    // logique de routing basee sur la session
    authorized: async ({ auth: session, request }) => {
      const isLoggedIn = !!session?.user;
      const path = request.nextUrl.pathname;
      const isLoginPage = path === "/login";
      const isAuthEndpoint = path.startsWith("/api/auth");

      if (isAuthEndpoint) return true;
      if (isLoginPage) return true;
      return isLoggedIn;
    }
  },
  trustHost: true
} satisfies NextAuthConfig;
