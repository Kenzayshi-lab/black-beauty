/**
 * Middleware combine: authentification Auth.js + CSP avec nonces dynamiques.
 *
 * Objectifs:
 *   1. Rediriger vers /login si non authentifie (via Auth.js authorized callback)
 *   2. Injecter un nonce cryptographique par requete pour securiser les
 *      scripts inline Next.js sans avoir a autoriser 'unsafe-inline'.
 *
 * ⚠️ Ce middleware tourne en Edge runtime. Il ne peut pas utiliser
 * ioredis, argon2, ou d'autres modules Node natifs. Auth.js verifie
 * uniquement la signature JWT ici (compatible Edge).
 */

import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((request) => {
  // Genere un nonce base64 aleatoire (crypto.randomUUID est disponible en Edge)
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // CSP avec nonce sur script-src + strict-dynamic pour laisser Next.js
  // charger ses chunks. strict-dynamic desactive script-src 'self' au profit
  // du systeme de nonces uniquement — plus sur.
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`, // Tailwind + inline styles React
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self' https://admin.blackandbeautystudio.ca`,
    `connect-src 'self' https://api.github.com`,
    `upgrade-insecure-requests`
  ].join("; ");

  // Passe le nonce au layout via un header custom (lu par headers() cote server)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  // Applique middleware sur toutes les routes SAUF assets statiques et API auth
  // (l'API auth a besoin d'un traitement special deja gere par Auth.js).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.woff2).*)"
  ]
};
