/**
 * Variables d'environnement de la console admin.
 *
 * Depuis le passage a Firebase Auth, l'app ne depend plus d'Auth.js ni d'une
 * base Redis obligatoire. La SEULE chose vraiment necessaire au cœur metier
 * (edition du site) est le PAT GitHub. Tout le reste est optionnel et en
 * mode best-effort — si une variable manque, la fonctionnalite concernee se
 * desactive proprement au lieu de faire planter toute l'app.
 *
 * Note: importe uniquement en runtime Node (jamais cote client).
 */

import { z } from "zod";

const envSchema = z.object({
  // Proxy GitHub — requis pour ECRIRE les modifs du site public.
  GITHUB_PAT: z.string().optional(),
  GITHUB_OWNER: z.string().default("Kenzayshi-lab"),
  GITHUB_REPO: z.string().default("black-beauty"),
  GITHUB_DEFAULT_BRANCH: z.string().default("main"),

  // Optionnels / best-effort : si absents, rate-limit + journal d'audit
  // sont simplement desactives (voir lib/rate-limit.ts et lib/audit-log.ts).
  REDIS_URL: z.string().optional(),
  IP_HASH_SALT: z.string().optional(),

  NODE_ENV: z.enum(["development", "production", "test"]).default("production")
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  // Avec des champs optionnels/default uniquement, le parse ne peut plus
  // echouer sur une variable manquante — l'app demarre toujours.
  cached = envSchema.parse(process.env);
  return cached;
}

/** Vrai si une base Redis est configuree (rate-limit + audit actifs). */
export function hasRedis(): boolean {
  return !!env().REDIS_URL;
}
