/**
 * Rate limiter simple base sur Redis INCR + EXPIRE.
 * Algorithme "fixed window counter" — simple et suffisant pour nos besoins:
 *   - protection contre brute-force login (par IP, par email)
 *   - future protection API (par user, par endpoint)
 *
 * Pour un rate limit plus sophistique (sliding window, token bucket),
 * migrer vers @upstash/ratelimit — pour l'instant, ceci est plus simple
 * et zero dependance supplementaire.
 */

import { redis, KEY } from "./redis";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetInSeconds: number;
}

export interface RateLimitOptions {
  /** Type de limite (utilise dans la cle Redis). Ex: "login-ip", "login-email" */
  kind: string;
  /** Identifiant de qui/quoi on limite. Ex: hash IP, email, user id */
  subject: string;
  /** Nombre max de requetes autorisees dans la fenetre */
  max: number;
  /** Duree de la fenetre en secondes */
  windowSeconds: number;
}

/**
 * Enregistre une tentative et retourne si la limite est atteinte.
 * A appeler AVANT l'operation sensible (login, ecriture, etc.).
 *
 * Comportement fail-open: si Redis est indisponible, on autorise
 * la requete (log l'erreur cote serveur). Ce compromis evite de
 * bloquer les utilisateurs legitimes en cas de panne — mais expose
 * temporairement a un brute-force. Alternative fail-closed possible
 * si on prefere blocker par prudence.
 */
export async function checkRateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const key = KEY.rateLimit(opts.kind, opts.subject);
  try {
    const count = await redis().incr(key);
    if (count === 1) {
      // Premiere requete dans la fenetre — pose l'expiration
      await redis().expire(key, opts.windowSeconds);
    }
    const ttl = await redis().ttl(key);
    return {
      ok: count <= opts.max,
      remaining: Math.max(0, opts.max - count),
      resetInSeconds: Math.max(0, ttl)
    };
  } catch (err) {
    // Fail-open — voir docstring
    // eslint-disable-next-line no-console
    console.error("[rate-limit] Redis error, fail-open:", err instanceof Error ? err.message : err);
    return { ok: true, remaining: opts.max, resetInSeconds: opts.windowSeconds };
  }
}

/**
 * Reset manuel d'une cle de rate limit. Utile apres une connexion
 * reussie pour re-autoriser des tentatives normales.
 */
export async function resetRateLimit(kind: string, subject: string): Promise<void> {
  try {
    await redis().del(KEY.rateLimit(kind, subject));
  } catch {
    // Silencieux — pas critique si le reset echoue
  }
}
