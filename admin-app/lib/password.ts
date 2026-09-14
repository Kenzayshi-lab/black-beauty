/**
 * Hash et verification des mots de passe avec Argon2id.
 * Parametres OWASP 2024 (memoire >= 47 MiB pour resistance GPU).
 *
 * ⚠️ Ce module utilise @node-rs/argon2 (bindings Rust natifs).
 * Ne peut PAS tourner en Edge runtime — uniquement Node.js.
 */

import { hash, verify } from "@node-rs/argon2";

// @node-rs/argon2 expose Algorithm comme const enum, incompatible avec
// isolatedModules (Next.js). On passe la valeur brute: Argon2id = 2.
const ALGORITHM_ARGON2ID = 2;

// Parametres OWASP 2024 pour Argon2id. Le DUMMY_HASH dans auth.ts DOIT
// utiliser ces memes parametres pour rester timing-safe — voir dummyHash().
export const ARGON2_PARAMS = {
  algorithm: ALGORITHM_ARGON2ID,
  memoryCost: 65536, // 64 MiB — recommandation OWASP 2024
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 threads
  hashLength: 32     // 256 bits
} as const;

// Longueur minimale conforme OWASP 2024 (fix audit E3).
export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 4096;

// Blacklist basique de mots de passe evidents. En pratique un check
// HaveIBeenPwned via API k-anonymity serait ideal (a implementer plus tard).
// Note: on cherche en LOWERCASE.
const COMMON_PASSWORDS = new Set<string>([
  "password", "passw0rd", "motdepasse",
  "12345678", "123456789", "1234567890", "123456789012",
  "azertyuiop", "qwertyuiop",
  "letmein", "welcome", "admin",
  "iloveyou", "monkey", "dragon", "football",
  "aalie2026", "blackandbeauty", "blackbeauty",
  "montreal", "quebec",
  "changeme", "changezmoi"
]);

function isCommonPassword(plaintext: string): boolean {
  const lower = plaintext.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) return true;
  // Simple pattern: chiffres seuls ou lettres seules < 20 chars
  if (/^\d+$/.test(plaintext) && plaintext.length < 20) return true;
  if (/^[a-z]+$/.test(lower) && lower.length < 20) return true;
  return false;
}

/**
 * Hash un mot de passe. Le sel est genere aleatoirement par la lib.
 * Le hash retourne inclut les parametres — verify() sait les relire.
 * Format: `$argon2id$v=19$m=65536,t=3,p=4$SALT$HASH`
 *
 * Refuse:
 *   - < 12 caracteres (OWASP 2024)
 *   - > 4096 caracteres (DoS defensif)
 *   - Mots de passe communs / previsibles (fix audit E3)
 */
export async function hashPassword(plaintext: string): Promise<string> {
  if (typeof plaintext !== "string") {
    throw new Error("Mot de passe manquant");
  }
  if (plaintext.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Mot de passe trop court (min ${MIN_PASSWORD_LENGTH} caracteres)`);
  }
  if (plaintext.length > MAX_PASSWORD_LENGTH) {
    // Cap defensif contre DoS — hasher un GB de "AAAA" prendrait des heures
    throw new Error(`Mot de passe trop long (max ${MAX_PASSWORD_LENGTH} caracteres)`);
  }
  if (isCommonPassword(plaintext)) {
    throw new Error(
      "Mot de passe trop previsible (dans la liste des mots de passe communs). " +
      "Choisis quelque chose de plus original."
    );
  }
  return hash(plaintext, ARGON2_PARAMS);
}

/**
 * Genere un hash Argon2 "muet" utilisable pour le comparateur timing-safe
 * quand l'utilisateur cherche n'existe pas. Le hash est genere UNE FOIS
 * lazy et cache en memoire — synchronise automatiquement avec les vrais
 * ARGON2_PARAMS (fix audit M6).
 */
let dummyHashCache: string | null = null;
export async function dummyHash(): Promise<string> {
  if (dummyHashCache) return dummyHashCache;
  // 32 bytes aleatoires converts en base64 (44 chars, > MIN_PASSWORD_LENGTH)
  const { randomBytes } = await import("node:crypto");
  const dummy = randomBytes(32).toString("base64");
  // On appelle `hash` directement pour bypass la blacklist (le contenu
  // aleatoire est safe par construction).
  dummyHashCache = await hash(dummy, ARGON2_PARAMS);
  return dummyHashCache;
}

/**
 * Verifie un mot de passe contre un hash stocke.
 * Retourne false sur mot de passe invalide OU sur hash malforme
 * (jamais throw pour des raisons de securite — timing consistant).
 */
export async function verifyPassword(plaintext: string, storedHash: string): Promise<boolean> {
  if (typeof plaintext !== "string" || typeof storedHash !== "string") return false;
  if (plaintext.length === 0 || plaintext.length > 4096) return false;
  if (!storedHash.startsWith("$argon2")) return false;
  try {
    return await verify(storedHash, plaintext);
  } catch {
    return false;
  }
}
