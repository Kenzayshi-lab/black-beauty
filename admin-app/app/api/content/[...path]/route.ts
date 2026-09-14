/**
 * Proxy sécurisé pour lire/ecrire les JSON de public/content/ du site public
 * via l'API GitHub Contents.
 *
 * Endpoints:
 *   GET  /api/content/<path>   → renvoie { data, sha }
 *   PUT  /api/content/<path>   → body = { data, sha, message? } → { commitSha, contentSha }
 *
 * Securite en couches:
 *   1. Session obligatoire (auth Auth.js — sinon 401)
 *   2. Whitelist stricte des paths (voir lib/content-paths.ts)
 *   3. Validation Zod du JSON avant ecriture
 *   4. Rate limit: 30 ecritures / 5 min / user
 *   5. Audit log (content.update avec target = path)
 *
 * Runtime Node explicite (Redis + PAT GitHub).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { readJson, writeJson } from "@/lib/github";
import {
  resolveAllowedPath,
  resolveReadableOnly,
  validatorFor,
  type AllowedPath
} from "@/lib/content-paths";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";
import { hashIp } from "@/lib/ip";

export const runtime = "nodejs";

type SessionUser = { id?: string; email?: string; role?: string };

function unauthorized() {
  return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
}

function forbidden(reason: string) {
  return NextResponse.json({ error: reason }, { status: 403 });
}

function badRequest(reason: string) {
  return NextResponse.json({ error: reason }, { status: 400 });
}

function extractIpHash(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip === "unknown" ? "unknown" : hashIp(ip);
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { path: segments } = await ctx.params;
  const writable = resolveAllowedPath(segments);
  const readable = resolveReadableOnly(segments);
  const target = writable ?? readable;
  if (!target) return forbidden("Path non autorise");

  try {
    const result = await readJson(target);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur GitHub" },
      { status: 502 }
    );
  }
}

const PutBodySchema = z.object({
  data: z.unknown(),
  sha: z.string().min(1).max(200),
  message: z.string().max(200).optional()
});

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const user = session.user as SessionUser;
  const userId = user.id ?? null;
  const userEmail = user.email ?? null;

  const { path: segments } = await ctx.params;
  const target: AllowedPath | null = resolveAllowedPath(segments);
  if (!target) return forbidden("Path non autorise en ecriture");

  const ipHash = extractIpHash(request);
  const userAgent = request.headers.get("user-agent");

  // Rate limit: 30 ecritures / 5 min / user (ou IP si pas de user id)
  const rlSubject = userId ?? ipHash;
  const rl = await checkRateLimit({
    kind: "content-write",
    subject: rlSubject,
    max: 30,
    windowSeconds: 5 * 60
  });
  if (!rl.ok) {
    await logAuditEvent({
      action: "content.update",
      actorUserId: userId,
      actorEmail: userEmail,
      target,
      ipHash,
      userAgent,
      details: { blocked: "rate_limit" }
    });
    return NextResponse.json({ error: "Trop de modifications — reessaie dans quelques minutes" }, { status: 429 });
  }

  let body: z.infer<typeof PutBodySchema>;
  try {
    const raw = await request.json();
    body = PutBodySchema.parse(raw);
  } catch (err) {
    return badRequest(`Body invalide: ${err instanceof Error ? err.message : "JSON malforme"}`);
  }

  const validator = validatorFor(target);
  const validation = validator.safeParse(body.data);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Donnees invalides",
        details: validation.error.flatten()
      },
      { status: 400 }
    );
  }

  const message =
    body.message?.trim() ||
    `admin: update ${target.replace("public/content/", "")} via console`;

  try {
    const result = await writeJson({
      path: target,
      data: validation.data,
      sha: body.sha,
      message,
      authorName: "BB Studio Admin",
      authorEmail: userEmail ?? "admin@blackandbeautystudio.ca"
    });

    await logAuditEvent({
      action: "content.update",
      actorUserId: userId,
      actorEmail: userEmail,
      target,
      ipHash,
      userAgent,
      details: { commitSha: result.commitSha }
    });

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur GitHub";
    await logAuditEvent({
      action: "content.update",
      actorUserId: userId,
      actorEmail: userEmail,
      target,
      ipHash,
      userAgent,
      details: { failed: msg }
    });
    // 409 pour conflit (SHA obsolete), 502 sinon
    const status = /conflit/i.test(msg) ? 409 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
