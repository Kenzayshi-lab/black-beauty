/**
 * Validation des variables d'environnement au demarrage.
 * Fail-fast: si une variable requise manque en runtime, on plante clairement
 * plutot que d'echouer plus tard avec un message obscur.
 *
 * Note: ce fichier est importe uniquement en runtime Node (jamais cote client).
 * Toutes les valeurs listees ici sont des SECRETS.
 */

import { z } from "zod";

const envSchema = z.object({
  // Requis en production
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET doit faire au moins 32 caracteres (openssl rand -base64 32)"),
  AUTH_URL: z.string().url("AUTH_URL doit etre une URL complete (ex: https://admin.blackandbeautystudio.ca)"),
  REDIS_URL: z.string().url("REDIS_URL est requis (fourni automatiquement par Vercel/Upstash)"),
  IP_HASH_SALT: z.string().min(16, "IP_HASH_SALT doit faire au moins 16 caracteres (openssl rand -base64 16)"),

  // Optionnels ici — utilises par le chunk 23 (proxy GitHub)
  GITHUB_PAT: z.string().optional(),
  GITHUB_OWNER: z.string().default("Kenzayshi-lab"),
  GITHUB_REPO: z.string().default("black-beauty"),
  GITHUB_DEFAULT_BRANCH: z.string().default("main"),

  // Duree de session en secondes (defaut: 15 min)
  SESSION_TTL: z.coerce.number().int().positive().default(900),

  NODE_ENV: z.enum(["development", "production", "test"]).default("production")
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("[env] Variables d'environnement invalides:", parsed.error.flatten().fieldErrors);
    throw new Error("Configuration invalide — voir logs pour details");
  }
  cached = parsed.data;
  return cached;
}
