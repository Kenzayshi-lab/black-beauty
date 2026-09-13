/**
 * Singleton client Redis (ioredis).
 * Une seule connexion par processus Node — reutilisee dans toutes les
 * routes et server actions.
 *
 * Note: NE PAS importer ce fichier depuis un composant client. Redis n'est
 * accessible qu'au runtime Node (route handlers, server actions, middleware
 * si necessaire — mais Redis en Edge middleware n'est pas supporte par
 * ioredis, il faut utiliser upstash/redis REST-based pour ca).
 */

import { Redis } from "ioredis";
import { env } from "./env";

let client: Redis | null = null;

export function redis(): Redis {
  if (client) return client;
  const url = env().REDIS_URL;

  client = new Redis(url, {
    // Timeout court en cas de latence anormale (evite de bloquer une
    // route serverless plus longtemps que necessaire).
    connectTimeout: 3000,
    commandTimeout: 2000,
    // Reconnecte automatiquement — utile en serverless ou la connexion
    // peut etre coupee entre deux invocations.
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: false,
    // TLS active si l'URL est en rediss:// (Upstash utilise rediss://)
    ...(url.startsWith("rediss://") ? { tls: {} } : {})
  });

  client.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[redis] erreur connexion:", err.message);
  });

  return client;
}

/**
 * Prefixe uniforme pour toutes les cles Redis. Permet de distinguer
 * les donnees de cette app d'autres apps qui pourraient partager le
 * meme datastore.
 */
export const KEY = {
  user: (id: string) => `bb:user:${id}`,
  userByEmail: (email: string) => `bb:user:email:${email.toLowerCase()}`,
  session: (id: string) => `bb:session:${id}`,
  rateLimit: (kind: string, subject: string) => `bb:rate:${kind}:${subject}`,
  auditLogList: () => `bb:audit:list`,
  auditLogEntry: (id: string) => `bb:audit:${id}`
} as const;
