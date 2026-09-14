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
  // Nonce cryptographique — 16 bytes (128 bits d'entropie) encodes en base64.
  // crypto.getRandomValues est disponible en Edge; Buffer.from sur Uint8Array
  // encode les octets bruts (contrairement a Buffer.from sur string qui
  // encoderait l'UTF-8 des caracteres — fix audit M1).
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = Buffer.from(nonceBytes).toString("base64");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    // L'admin n'a jamais a etre iframe (fix audit M4).
    `frame-ancestors 'none'`,
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
    // Exclut les assets statiques du pipeline auth+CSP (fix audit F5:
    // ajout webp/avif/gif/ico/woff pour ne pas payer la CSP dynamique
    // sur des ressources sans exec context).
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)).*)"
  ]
};
