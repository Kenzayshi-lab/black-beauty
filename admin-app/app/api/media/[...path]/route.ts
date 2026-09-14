/**
 * Proxy sécurisé pour uploader des images binaires vers le repo.
 *
 * PUT /api/media/insta/<filename>.jpg
 *   body: bytes bruts (Content-Type: image/jpeg)
 *   response: { contentSha, commitSha }
 *
 * Securite en couches:
 *   1. Session obligatoire
 *   2. Whitelist paths stricte (lib/media-paths.ts)
 *   3. Content-Length verifie AVANT lecture (evite le OOM)
 *   4. Bytes limites a 2 MB, verifies encore apres lecture
 *   5. MIME reel (Content-Type) doit etre image/jpeg
 *   6. Magic number JPEG verifie (bytes commencent par FF D8 FF)
 *   7. Rate limit: 10 uploads / 5 min / user
 *   8. Audit log media.upload
 *
 * Runtime Node explicite (Buffer + PAT GitHub).
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeBinary } from "@/lib/github";
import {
  resolveAllowedMediaPath,
  ACCEPTED_MIME,
  MAX_UPLOAD_BYTES,
  isValidJpegMagic
} from "@/lib/media-paths";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";
import { hashIp } from "@/lib/ip";

export const runtime = "nodejs";

type SessionUser = { id?: string; email?: string; role?: string };

function json(body: unknown, status = 200): Response {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function extractIpHash(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip === "unknown" ? "unknown" : hashIp(ip);
}

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const session = await auth();
  if (!session?.user) return json({ error: "Non authentifie" }, 401);
  const user = session.user as SessionUser;
  const userId = user.id ?? null;
  const userEmail = user.email ?? null;

  const { path: segments } = await ctx.params;
  const target = resolveAllowedMediaPath(segments);
  if (!target) return json({ error: "Path non autorise" }, 403);

  const ipHash = extractIpHash(request);
  const userAgent = request.headers.get("user-agent");

  // Rate limit
  const rl = await checkRateLimit({
    kind: "media-upload",
    subject: userId ?? ipHash,
    max: 10,
    windowSeconds: 5 * 60
  });
  if (!rl.ok) {
    await logAuditEvent({
      action: "media.upload",
      actorUserId: userId,
      actorEmail: userEmail,
      target,
      ipHash,
      userAgent,
      details: { blocked: "rate_limit" }
    });
    return json({ error: "Trop d'uploads — reessaie dans quelques minutes" }, 429);
  }

  // MIME check
  const mime = request.headers.get("content-type")?.toLowerCase().split(";")[0]?.trim() ?? "";
  if (!ACCEPTED_MIME.has(mime)) {
    return json({ error: `Type MIME non accepte (${mime || "vide"}). Attendu: image/jpeg` }, 415);
  }

  // Content-Length check AVANT lecture (evite OOM)
  const declaredLen = request.headers.get("content-length");
  if (declaredLen) {
    const n = parseInt(declaredLen, 10);
    if (!Number.isFinite(n) || n <= 0) {
      return json({ error: "Content-Length invalide" }, 400);
    }
    if (n > MAX_UPLOAD_BYTES) {
      return json({ error: `Fichier trop volumineux (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)` }, 413);
    }
  }

  // Lecture du body
  let bytes: Uint8Array;
  try {
    const buf = await request.arrayBuffer();
    bytes = new Uint8Array(buf);
  } catch {
    return json({ error: "Corps de requete illisible" }, 400);
  }

  // Double check taille apres lecture
  if (bytes.length > MAX_UPLOAD_BYTES) {
    return json({ error: `Fichier trop volumineux (${bytes.length} > ${MAX_UPLOAD_BYTES})` }, 413);
  }
  if (bytes.length === 0) {
    return json({ error: "Fichier vide" }, 400);
  }

  // Magic number check
  if (!isValidJpegMagic(bytes)) {
    await logAuditEvent({
      action: "media.upload",
      actorUserId: userId,
      actorEmail: userEmail,
      target,
      ipHash,
      userAgent,
      details: { blocked: "invalid_magic" }
    });
    return json({ error: "Le fichier n'est pas un JPEG valide (magic number invalide)" }, 415);
  }

  // Ecriture sur GitHub — pas de SHA car creation (nouveau fichier)
  try {
    const result = await writeBinary({
      path: target,
      bytes,
      message: `admin: upload ${target.replace("public/assets/images/", "")} via console`,
      authorName: "BB Studio Admin",
      authorEmail: userEmail ?? "admin@blackandbeautystudio.ca"
    });

    await logAuditEvent({
      action: "media.upload",
      actorUserId: userId,
      actorEmail: userEmail,
      target,
      ipHash,
      userAgent,
      details: { commitSha: result.commitSha, sizeBytes: bytes.length }
    });

    return json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur GitHub";
    await logAuditEvent({
      action: "media.upload",
      actorUserId: userId,
      actorEmail: userEmail,
      target,
      ipHash,
      userAgent,
      details: { failed: msg }
    });
    // 422 si fichier existe deja, 502 sinon
    const status = /existe deja/i.test(msg) ? 409 : 502;
    return json({ error: msg }, status);
  }
}
