/**
 * Session côté serveur pour Firebase Auth.
 *
 * Firebase authentifie dans le NAVIGATEUR. Pour que le SERVEUR (middleware,
 * pages protégées, proxy GitHub) puisse vérifier la session, le client dépose
 * son ID token ici ; on le valide (clés publiques Google) + liste blanche,
 * puis on le pose dans un cookie httpOnly.
 *
 *   POST   { idToken }  -> vérifie + pose le cookie de session
 *   DELETE              -> efface le cookie (déconnexion)
 *
 * Le client re-POST à chaque rafraîchissement du token Firebase (~1 h) pour
 * garder le cookie frais (voir le composant AuthSync).
 *
 * Runtime Node (jose + cookies).
 */

import { NextResponse } from "next/server";
import { verifyFirebaseToken, SESSION_COOKIE } from "@/lib/firebase-token";
import { isAllowedAdmin } from "@/lib/admin-allowlist";

export const runtime = "nodejs";

// Durée de vie max du cookie. L'ID token lui-même expire en ~1 h ; le cookie
// peut vivre plus longtemps mais sera rejeté à la vérif une fois le token
// expiré, forçant un re-login. On cale à 1 h pour rester cohérent.
const COOKIE_MAX_AGE = 60 * 60;

export async function POST(request: Request): Promise<Response> {
  let idToken: string;
  try {
    const body = await request.json();
    idToken = String(body?.idToken ?? "");
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const user = await verifyFirebaseToken(idToken);
  if (!user) {
    return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 401 });
  }
  if (!isAllowedAdmin(user.email)) {
    // Compte Firebase valide mais non autorisé pour cette console.
    return NextResponse.json({ error: "Accès non autorisé pour ce compte" }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set(SESSION_COOKIE, idToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  });
  return res;
}

export async function DELETE(): Promise<Response> {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0
  });
  return res;
}
