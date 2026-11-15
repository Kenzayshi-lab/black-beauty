/**
 * Tokens de reinitialisation de mot de passe (flux "mot de passe oublie").
 *
 * Principes de securite :
 *   - Le token envoye par courriel est 32 octets aleatoires (base64url).
 *   - On ne stocke JAMAIS le token en clair : la cle Redis contient son
 *     hash SHA-256. Une fuite de la base ne permet donc pas de reinitialiser
 *     un compte (il faudrait inverser le SHA-256).
 *   - Usage unique : le token est supprime des qu'il est consomme.
 *   - Expiration courte : TTL de 30 min (Redis EXPIRE).
 *   - Anti-enumeration : la couche appelante ne revele jamais si l'email
 *     existe (voir la route /api/auth/forgot-password).
 *
 * ⚠️ Runtime Node uniquement (node:crypto + ioredis).
 */

import { randomBytes, createHash } from "node:crypto";
import { redis, KEY } from "./redis";

// 30 minutes — assez pour relever ses courriels, assez court pour limiter
// la fenetre d'exploitation d'un lien intercepte.
export const RESET_TOKEN_TTL_SECONDS = 30 * 60;

/** Hash SHA-256 (hex) du token — c'est ce qui sert de cle Redis. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Cree un token de reset pour un utilisateur donne et le stocke (hashe)
 * dans Redis avec un TTL. Retourne le token EN CLAIR (a mettre dans le lien
 * du courriel) — il n'est plus jamais recuperable apres cet appel.
 */
export async function createResetToken(userId: string): Promise<string> {
  // 32 octets -> 43 caracteres base64url, impossible a deviner.
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  await redis().set(
    KEY.passwordReset(tokenHash),
    userId,
    "EX",
    RESET_TOKEN_TTL_SECONDS
  );
  return token;
}

/**
 * Consomme un token : verifie qu'il existe et n'a pas expire, le supprime
 * (usage unique) et retourne l'userId associe. Retourne null si le token
 * est invalide, expire ou deja utilise.
 *
 * On utilise GETDEL pour que la lecture et la suppression soient atomiques —
 * deux requetes concurrentes avec le meme token ne peuvent pas reussir
 * toutes les deux.
 */
export async function consumeResetToken(token: string): Promise<string | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 200) {
    return null;
  }
  const tokenHash = hashToken(token);
  const key = KEY.passwordReset(tokenHash);
  try {
    // GETDEL (Redis >= 6.2, supporte par Upstash) : atomique.
    const userId = await redis().getdel(key);
    return userId && userId.length > 0 ? userId : null;
  } catch {
    // Fallback si GETDEL indisponible : GET puis DEL (quasi-atomique).
    const userId = await redis().get(key);
    if (userId) await redis().del(key);
    return userId && userId.length > 0 ? userId : null;
  }
}

/**
 * Invalide tout token de reset en attente pour un utilisateur.
 * Appele apres une reinitialisation reussie par precaution (meme si le
 * token consomme est deja supprime) — couvre le cas ou l'utilisateur
 * aurait demande plusieurs liens.
 *
 * Note : on ne maintient pas d'index userId -> tokens (un seul admin,
 * volume negligeable). Les tokens residuels expirent seuls via leur TTL.
 * Cette fonction est donc un no-op volontaire, documente pour la clarte.
 */
export async function invalidateUserResetTokens(_userId: string): Promise<void> {
  // Volontairement vide : les tokens non consommes expirent via TTL (30 min).
  // Documente pour eviter qu'un futur dev croie a un oubli.
}
