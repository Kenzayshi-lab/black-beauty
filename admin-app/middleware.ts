/**
 * Middleware : protection d'accès (Firebase) + CSP avec nonce dynamique.
 *
 * Auth : lit le cookie de session (ID token Firebase), le vérifie contre les
 * clés publiques Google et la liste blanche d'admins. Si invalide :
 *   - requête de PAGE  -> redirection vers /login
 *   - requête d'API    -> 401 JSON
 * L'email vérifié est transmis en aval via l'en-tête x-user-email.
 *
 * Routes publiques (sans session) : /login et /api/auth/session (c'est par là
 * qu'on obtient justement une session). Le flux "mot de passe oublié" est géré
 * entièrement par Firebase (domaine Google), pas par cette app.
 *
 * Tourne en Edge. jose + fetch y sont compatibles.
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifyFirebaseToken, SESSION_COOKIE } from "./lib/firebase-token";
import { isAllowedAdmin } from "./lib/admin-allowlist";

function buildCsp(nonce: string): string {
  return [
    `default-src 'self'`,
    // Firebase Auth charge son SDK et appelle ses endpoints ; on autorise
    // les domaines Google/Firebase nécessaires.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://apis.google.com https://www.gstatic.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://*.googleusercontent.com`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    // Firebase Auth (identitytoolkit, securetoken) + GitHub API (proxy).
    `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://api.github.com`,
    // Firebase Auth peut ouvrir une iframe sur le authDomain pour certains flux.
    `frame-src 'self' https://blackandbeautystudio-464a9.firebaseapp.com`,
    `upgrade-insecure-requests`
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isApi = path.startsWith("/api/");
  const isLogin = path === "/login";
  const isSessionEndpoint = path === "/api/auth/session";

  // Nonce CSP (16 octets, 128 bits) — comme avant.
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = Buffer.from(nonceBytes).toString("base64");
  const csp = buildCsp(nonce);

  function attachCspAndNonce(res: NextResponse): NextResponse {
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  function nextWithContext(email?: string): NextResponse {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
    if (email) requestHeaders.set("x-user-email", email);
    return attachCspAndNonce(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Routes publiques : pas de session requise.
  if (isLogin || isSessionEndpoint) {
    return nextWithContext();
  }

  // Vérif de la session.
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await verifyFirebaseToken(token);
  const ok = !!user && isAllowedAdmin(user.email);

  if (!ok) {
    if (isApi) {
      return attachCspAndNonce(
        NextResponse.json({ error: "Non authentifié" }, { status: 401 })
      );
    }
    const loginUrl = new URL("/login", request.url);
    return attachCspAndNonce(NextResponse.redirect(loginUrl));
  }

  return nextWithContext(user!.email ?? undefined);
}

export const config = {
  matcher: [
    // Exclut les assets statiques du pipeline auth+CSP.
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)).*)"
  ]
};
