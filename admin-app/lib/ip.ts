/**
 * Utilitaires pour extraire et anonymiser l'IP du client.
 *
 * Loi 25 (Quebec): les adresses IP sont des donnees personnelles.
 * On stocke uniquement un hash sale, jamais l'IP en clair.
 * Cela permet:
 *   - detection de patterns d'attaque (rate limit par IP)
 *   - audit log conforme
 *   - impossibilite de "re-identifier" l'IP a partir du hash seul
 */

import { createHash } from "node:crypto";
import { env } from "./env";

export function getClientIp(headers: Headers): string | null {
  // Vercel definit x-forwarded-for et x-real-ip
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    // Prend la premiere IP (client d'origine, avant les proxies)
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = headers.get("x-real-ip");
  if (xri) return xri.trim();
  return null;
}

/**
 * Hash SHA-256 sale de l'IP. Le sel est un secret d'env
 * (IP_HASH_SALT) — rotation le rendrait les hashes precedents
 * incomparables, ce qui est acceptable (l'audit log expire a 90j).
 *
 * Retourne une chaine hex de 64 caracteres.
 */
export function hashIp(ip: string): string {
  if (typeof ip !== "string" || ip.length === 0) return "unknown";
  const salt = env().IP_HASH_SALT;
  return createHash("sha256").update(salt).update(":").update(ip).digest("hex");
}

/**
 * Helper: extrait + hash en une fois. Retourne "unknown" si IP
 * introuvable (rare, mais peut arriver si les headers de proxy sont
 * absents en local).
 */
export function getHashedIp(headers: Headers): string {
  const ip = getClientIp(headers);
  return ip ? hashIp(ip) : "unknown";
}
