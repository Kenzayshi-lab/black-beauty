/**
 * POST /api/auth/forgot-password
 *
 * Demande de reinitialisation de mot de passe (flux "mot de passe oublie").
 *
 * Securite :
 *   1. Rate limit par IP (5 / heure) et par email (3 / heure) — anti-abus.
 *   2. Anti-enumeration : la reponse est TOUJOURS la meme (200 generique),
 *      que l'email existe ou non. On ne revele jamais si un compte existe.
 *   3. Si l'email existe : creation d'un token (hashe en Redis, TTL 30 min,
 *      usage unique) + envoi du lien par courriel.
 *   4. Audit log de la demande.
 *
 * ⚠️ Cette route est publique (pas de session requise). Elle est accessible
 * car /api/auth/* est autorise par le callback `authorized` (auth.config.ts).
 *
 * Runtime Node explicite (Redis + envoi email + Argon2 indirect).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getUserByEmail } from "@/lib/users";
import { createResetToken, RESET_TOKEN_TTL_SECONDS } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";
import { hashIp } from "@/lib/ip";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email().max(200)
});

function extractIpHash(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip === "unknown" ? "unknown" : hashIp(ip);
}

// Reponse unique, renvoyee dans TOUS les cas (succes, email inconnu, email
// non configure...) pour ne rien laisser fuiter sur l'existence d'un compte.
function genericOk() {
  return NextResponse.json({
    ok: true,
    message:
      "Si un compte existe pour cette adresse, un courriel de réinitialisation vient d'être envoyé."
  });
}

export async function POST(request: Request): Promise<Response> {
  const ipHash = extractIpHash(request);
  const userAgent = request.headers.get("user-agent");

  // Parse body
  let email: string;
  try {
    const raw = await request.json();
    email = BodySchema.parse(raw).email.trim().toLowerCase();
  } catch {
    // Meme reponse generique — ne pas distinguer "body invalide" du reste.
    return genericOk();
  }

  // Rate limit par IP (5 / heure)
  const rlIp = await checkRateLimit({
    kind: "pwreset-ip",
    subject: ipHash,
    max: 5,
    windowSeconds: 60 * 60
  });
  // Rate limit par email (3 / heure)
  const rlEmail = await checkRateLimit({
    kind: "pwreset-email",
    subject: email,
    max: 3,
    windowSeconds: 60 * 60
  });
  if (!rlIp.ok || !rlEmail.ok) {
    await logAuditEvent({
      action: "user.password_reset_requested",
      actorUserId: null,
      actorEmail: email,
      ipHash,
      userAgent,
      details: { blocked: "rate_limit" }
    });
    // Toujours la reponse generique (ne pas reveler le blocage).
    return genericOk();
  }

  try {
    const user = await getUserByEmail(email);
    if (user) {
      const token = await createResetToken(user.id);
      const base = env().AUTH_URL.replace(/\/+$/, "");
      const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail(
        user.email,
        resetUrl,
        Math.round(RESET_TOKEN_TTL_SECONDS / 60)
      );
      await logAuditEvent({
        action: "user.password_reset_requested",
        actorUserId: user.id,
        actorEmail: user.email,
        ipHash,
        userAgent,
        details: { sent: true }
      });
    } else {
      // Email inconnu — on log quand meme (tentative) mais on ne fait rien.
      await logAuditEvent({
        action: "user.password_reset_requested",
        actorUserId: null,
        actorEmail: email,
        ipHash,
        userAgent,
        details: { sent: false, reason: "unknown_email" }
      });
    }
  } catch (err) {
    // Erreur interne (Redis, envoi email non configure...) : on log cote
    // serveur mais on renvoie quand meme la reponse generique pour ne pas
    // transformer cette route en oracle d'existence de compte.
    // eslint-disable-next-line no-console
    console.error("[forgot-password]", err instanceof Error ? err.message : err);
    await logAuditEvent({
      action: "user.password_reset_requested",
      actorUserId: null,
      actorEmail: email,
      ipHash,
      userAgent,
      details: { failed: err instanceof Error ? err.message : "error" }
    }).catch(() => {});
  }

  return genericOk();
}
