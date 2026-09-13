/**
 * Hash et verification des mots de passe avec Argon2id.
 * Parametres OWASP 2024 (memoire >= 47 MiB pour resistance GPU).
 *
 * ⚠️ Ce module utilise @node-rs/argon2 (bindings Rust natifs).
 * Ne peut PAS tourner en Edge runtime — uniquement Node.js.
 */

import { hash, verify, Algorithm } from "@node-rs/argon2";

const ARGON2_PARAMS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 65536, // 64 MiB — recommandation OWASP 2024
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 threads
  hashLength: 32     // 256 bits
} as const;

/**
 * Hash un mot de passe. Le sel est genere aleatoirement par la lib.
 * Le hash retourne inclut les parametres — verify() sait les relire.
 * Format: `$argon2id$v=19$m=65536,t=3,p=4$SALT$HASH`
 */
export async function hashPassword(plaintext: string): Promise<string> {
  if (typeof plaintext !== "string" || plaintext.length < 8) {
    throw new Error("Mot de passe trop court (min 8 caracteres)");
  }
  if (plaintext.length > 4096) {
    // Cap defensif contre DoS — hasher un GB de "AAAA" prendrait des heures
    throw new Error("Mot de passe trop long (max 4096 caracteres)");
  }
  return hash(plaintext, ARGON2_PARAMS);
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
