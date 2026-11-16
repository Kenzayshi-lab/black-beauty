/**
 * Verification d'un ID token Firebase cote SERVEUR, sans cle privee.
 *
 * On verifie la signature RS256 du token contre les cles PUBLIQUES de Google
 * (JWKS), puis l'emetteur (iss), l'audience (aud = projectId) et l'expiration.
 * C'est la methode officielle de validation d'un ID token Firebase — elle ne
 * necessite aucun compte de service ni secret.
 *
 * Fonctionne en runtime Node ET Edge (jose + fetch sont compatibles des deux
 * cotes), donc utilisable dans le middleware comme dans les route handlers.
 *
 * Docs: https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
 */

import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";
import { FIREBASE_PROJECT_ID } from "./firebase-client";

// Cles publiques Google pour les ID tokens Firebase (format JWK).
// createRemoteJWKSet met en cache les cles et gere leur rotation.
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

const ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;

export interface VerifiedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

/**
 * Verifie un ID token Firebase. Retourne l'utilisateur si valide, null sinon.
 * Ne throw jamais — toute erreur (signature, expiration, format) => null.
 */
export async function verifyFirebaseToken(token: string | undefined | null): Promise<VerifiedUser | null> {
  if (!token || typeof token !== "string" || token.length < 20) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: FIREBASE_PROJECT_ID
    });
    const p = payload as JWTPayload & {
      email?: string;
      email_verified?: boolean;
      user_id?: string;
      sub?: string;
    };
    const uid = p.sub || p.user_id;
    if (!uid) return null;
    return {
      uid,
      email: typeof p.email === "string" ? p.email.toLowerCase() : null,
      emailVerified: p.email_verified === true
    };
  } catch {
    return null;
  }
}

// Nom du cookie de session (ID token Firebase stocke en httpOnly).
// Prefixe __Host- : lie a l'origine exacte, impossible a surcharger par un
// sous-domaine, Secure obligatoire.
export const SESSION_COOKIE = "__Host-bb.fbtoken";
