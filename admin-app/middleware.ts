/**
 * Middleware combine: authentification Auth.js + CSP avec nonces dynamiques.
 *
 * ⚠️ Ce middleware tourne en Edge runtime. Il importe UNIQUEMENT auth.config.ts
 * (config Edge-safe) — pas auth.ts qui charge Argon2 + ioredis.
 *
 * Objectifs:
 *   1. Rediriger vers /login si non authentifie (via authorized callback de config)
 *   2. Injecter un nonce cryptographique par requete pour securiser les
 *      scripts inline Next.js sans avoir a autoriser 'unsafe-inline'.
 */

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  // Nonce cryptographique — crypto.randomUUID est disponible en Edge
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self' https://admin.blackandbeautystudio.ca`,
    `connect-src 'self' https://api.github.com`,
    `upgrade-insecure-requests`
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.woff2).*)"
  ]
};
