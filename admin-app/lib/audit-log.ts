/**
 * Journal d'audit des actions sensibles.
 *
 * Stockage: liste Redis (LPUSH + LTRIM pour cap a 5000 entrees).
 * Retention: 90 jours (Loi 25). Nettoyage automatique via LTRIM
 * + expiration individuelle des entrees detaillees.
 *
 * ⚠️ Loi 25: les IPs sont hashees (voir ./ip.ts). Aucune donnee
 * personnelle en clair (email hache aussi pour les evenements
 * "tentative de login" ou l'email pourrait ne pas exister en base).
 */

import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { redis, KEY } from "./redis";

export const AuditEventSchema = z.object({
  id:         z.string().uuid(),
  timestamp:  z.string().datetime(),
  action:     z.enum([
    "login.success",
    "login.failure",
    "login.rate_limited",
    "logout",
    "content.update",
    "content.create",
    "content.delete",
    "media.upload",
    "media.delete",
    "user.created",
    "user.password_reset",
    "user.mfa_enabled",
    "user.mfa_disabled"
  ]),
  // ID de l'utilisateur qui a fait l'action, ou null si non authentifie
  actorUserId: z.string().uuid().nullable(),
  // Hash de l'email (pour tracer les tentatives de login sur un compte)
  actorEmailHash: z.string().nullable(),
  // Ressource cible (ex: chemin JSON, id photo, etc.)
  target:     z.string().max(500).nullable(),
  // IP hachee (Loi 25)
  ipHash:     z.string(),
  userAgent:  z.string().max(500).nullable(),
  // Details libres — objet JSON serialisable, max 2 KiB
  details:    z.record(z.string(), z.unknown()).optional()
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

const MAX_LIST_LENGTH = 5000;
const ENTRY_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 jours

/**
 * Hash SHA-256 d'un email (utilise le meme sel que hashIp pour
 * coherence; permet de re-identifier via re-hash si necessaire cote admin).
 * Retourne "unknown" pour null/vide.
 */
function hashEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(salt).update(":").update(email.toLowerCase()).digest("hex");
}

export async function logAuditEvent(input: {
  action: AuditEvent["action"];
  actorUserId: string | null;
  actorEmail?: string | null;
  target?: string | null;
  ipHash: string;
  userAgent?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  const event: AuditEvent = AuditEventSchema.parse({
    id:             randomUUID(),
    timestamp:      new Date().toISOString(),
    action:         input.action,
    actorUserId:    input.actorUserId,
    actorEmailHash: hashEmail(input.actorEmail ?? null),
    target:         input.target ?? null,
    ipHash:         input.ipHash,
    userAgent:      (input.userAgent ?? null)?.slice(0, 500) ?? null,
    details:        input.details
  });

  const serialized = JSON.stringify(event);
  if (serialized.length > 4096) {
    // Details trop gros — tronque pour eviter d'exploser Redis
    event.details = { _truncated: true };
  }

  try {
    await redis()
      .multi()
      .setex(KEY.auditLogEntry(event.id), ENTRY_TTL_SECONDS, JSON.stringify(event))
      .lpush(KEY.auditLogList(), event.id)
      .ltrim(KEY.auditLogList(), 0, MAX_LIST_LENGTH - 1)
      .exec();
  } catch (err) {
    // Fail-open — jamais bloquer une operation legitime si le log echoue.
    // En prod on aurait un log externe (Datadog, Sentry) pour rattraper.
    // eslint-disable-next-line no-console
    console.error("[audit] echec ecriture:", err instanceof Error ? err.message : err);
  }
}

/**
 * Lit les N derniers evenements. Utilise par un futur ecran admin
 * global (chunk 27b).
 */
export async function readRecentAuditEvents(limit: number = 30): Promise<AuditEvent[]> {
  const cap = Math.min(Math.max(limit, 1), 200);
  const ids = await redis().lrange(KEY.auditLogList(), 0, cap - 1);
  if (ids.length === 0) return [];
  const raws = await redis().mget(ids.map(KEY.auditLogEntry));
  const events: AuditEvent[] = [];
  for (const raw of raws) {
    if (!raw) continue;
    try {
      events.push(AuditEventSchema.parse(JSON.parse(raw)));
    } catch {
      // Entree expiree ou malformee — ignore
    }
  }
  return events;
}

/**
 * Lit les N derniers evenements filtrant pour un user donne.
 * On scan la liste globale (max scanLimit=500 pour ne pas exploser Redis)
 * puis on filtre en memoire. Pour un usage plus lourd on maintiendrait
 * une liste par-user, mais pour 1 admin ce simple filtrage suffit.
 */
export async function readRecentByUser(
  userId: string,
  limit: number = 30
): Promise<AuditEvent[]> {
  const cap = Math.min(Math.max(limit, 1), 100);
  const scanLimit = 500;
  const all = await readRecentAuditEvents(scanLimit);
  const filtered = all.filter((e) => e.actorUserId === userId);
  return filtered.slice(0, cap);
}
