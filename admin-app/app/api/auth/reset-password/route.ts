/**
 * POST /api/auth/reset-password
 *
 * Finalise une reinitialisation de mot de passe : l'utilisateur arrive avec
 * le token recu par courriel et choisit un nouveau mot de passe.
 *
 * Securite :
 *   1. Rate limit par IP (10 / heure) — anti brute-force sur les tokens.
 *   2. Token valide via consumeResetToken (hashe, TTL, USAGE UNIQUE atomique).
 *   3. Nouveau mot de passe soumis aux memes regles qu'ailleurs (>= 12 car.,
 *      pas dans la blacklist) via hashPassword.
 *   4. setPasswordByUserId bump sessionVersion -> toutes les anciennes
 *      sessions sont invalidees.
 *   5. Audit log de la reinitialisation reussie.
 *
 * Route publique (/api/auth/* autorise par le callback authorized).
 * Runtime Node explicite.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeResetToken } from "@/lib/password-reset";
import { setPasswordByUserId } from "@/lib/users";
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  validatePasswordStrength
} from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";
import { hashIp } from "@/lib/ip";

export const runtime = "nodejs";

const BodySchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH)
});

function extractIpHash(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip === "unknown" ? "unknown" : hashIp(ip);
}

export async function POST(request: Request): Promise<Response> {
  const ipHash = extractIpHash(request);
  const userAgent = request.headers.get("user-agent");

  // Rate limit par IP (10 / heure) — limite les tentatives de deviner un token.
  const rl = await checkRateLimit({
    kind: "pwreset-confirm-ip",
    subject: ipHash,
    max: 10,
    windowSeconds: 60 * 60
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives — réessaie dans une heure." },
      { status: 429 }
    );
  }

  // Parse + validation du nouveau mot de passe
  let token: string;
  let password: string;
  try {
    const raw = await request.json();
    const parsed = BodySchema.parse(raw);
    token = parsed.token;
    password = parsed.password;
  } catch {
    return NextResponse.json(
      {
        error: `Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`
      },
      { status: 400 }
    );
  }

  // Valider la FORCE du mot de passe AVANT de consommer le token : si la
  // saisie est trop faible, le token reste valide et la cliente peut
  // reessayer sans redemander un lien.
  const weak = validatePasswordStrength(password);
  if (weak) {
    return NextResponse.json({ error: weak }, { status: 400 });
  }

  // Consommation du token (atomique, usage unique)
  const userId = await consumeResetToken(token);
  if (!userId) {
    return NextResponse.json(
      {
        error:
          "Ce lien n'est plus valide (expiré ou déjà utilisé). Demande une nouvelle réinitialisation."
      },
      { status: 400 }
    );
  }

  try {
    const user = await setPasswordByUserId(userId, password);
    await logAuditEvent({
      action: "user.password_reset_completed",
      actorUserId: user.id,
      actorEmail: user.email,
      ipHash,
      userAgent,
      details: { via: "forgot_password_flow" }
    });
    return NextResponse.json({
      ok: true,
      message: "Mot de passe réinitialisé. Tu peux maintenant te connecter."
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    // hashPassword throw sur mot de passe trop previsible / trop court :
    // ce sont des messages actionnables cote UI, on les remonte tels quels.
    if (/pr[ée]visible|court|long|commun/i.test(msg)) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    // eslint-disable-next-line no-console
    console.error("[reset-password]", msg);
    return NextResponse.json(
      { error: "Impossible de réinitialiser — réessaie dans quelques instants." },
      { status: 500 }
    );
  }
}
