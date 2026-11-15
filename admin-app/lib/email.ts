/**
 * Envoi d'e-mails transactionnels via l'API REST Resend.
 *
 * On appelle l'API directement en fetch (aucune dependance npm ajoutee,
 * coherent avec le reste du projet). Configure via deux variables d'env :
 *   - RESEND_API_KEY   : cle API Resend (secret)
 *   - RESET_FROM_EMAIL : adresse expeditrice, ex "Black & Beauty
 *                        <no-reply@blackandbeautystudio.ca>". Le domaine doit
 *                        etre verifie dans Resend (SPF/DKIM) pour la prod ;
 *                        "onboarding@resend.dev" fonctionne pour un test.
 *
 * Si ces variables manquent, sendEmail throw une erreur claire — la route
 * appelante la log cote serveur et renvoie un message generique au client
 * (jamais de detail technique expose).
 *
 * ⚠️ Runtime Node uniquement.
 */

import { env } from "./env";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail(input: SendEmailInput): Promise<void> {
  const e = env();
  if (!e.RESEND_API_KEY || !e.RESET_FROM_EMAIL) {
    throw new Error(
      "Envoi d'e-mail non configure (RESEND_API_KEY / RESET_FROM_EMAIL manquants)"
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${e.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: e.RESET_FROM_EMAIL,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text
      }),
      signal: controller.signal,
      cache: "no-store"
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Resend ${res.status}: ${body.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

/** Echappe le minimum pour injecter une valeur dans le HTML du courriel. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Envoie le courriel de reinitialisation de mot de passe.
 * `resetUrl` est le lien complet (avec token) vers /reset-password.
 * `ttlMinutes` sert juste a informer la destinataire.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  ttlMinutes: number
): Promise<void> {
  const safeUrl = escapeHtml(resetUrl);
  const subject = "Reinitialisation de votre mot de passe — Black & Beauty Studio";

  const text = [
    "Bonjour,",
    "",
    "Une reinitialisation de mot de passe a ete demandee pour votre console",
    "Black & Beauty Studio.",
    "",
    "Ouvrez ce lien pour choisir un nouveau mot de passe :",
    resetUrl,
    "",
    `Ce lien expire dans ${ttlMinutes} minutes et ne fonctionne qu'une seule fois.`,
    "",
    "Si vous n'avez PAS fait cette demande, ignorez ce courriel : votre mot de",
    "passe actuel reste valide et personne ne peut le changer sans ce lien.",
    "",
    "Black & Beauty Studio"
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;background:#050505;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;color:#D1D5DB;">
    <p style="letter-spacing:0.4em;text-transform:uppercase;font-size:11px;color:#E2A9B3;margin:0 0 6px;">&#10016; Console admin &#10016;</p>
    <h1 style="font-size:22px;color:#D1D5DB;margin:0 0 24px;">Black &amp; Beauty Studio</h1>
    <p>Bonjour,</p>
    <p>Une réinitialisation de mot de passe a été demandée pour votre console d'administration.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${safeUrl}" style="display:inline-block;background:#A10B1B;color:#f0c9d1;text-decoration:none;padding:14px 32px;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;border:1px solid rgba(226,169,179,0.3);">Choisir un nouveau mot de passe</a>
    </p>
    <p style="font-size:13px;color:#9ba0a8;">Ou copiez ce lien dans votre navigateur :<br>
      <span style="color:#E2A9B3;word-break:break-all;">${safeUrl}</span>
    </p>
    <p style="font-size:13px;color:#9ba0a8;">Ce lien expire dans <strong style="color:#E2A9B3;">${ttlMinutes} minutes</strong> et ne fonctionne qu'une seule fois.</p>
    <hr style="border:none;border-top:1px solid rgba(226,169,179,0.15);margin:28px 0;">
    <p style="font-size:12px;color:#9ba0a8;">Si vous n'avez <strong>pas</strong> fait cette demande, ignorez ce courriel. Votre mot de passe actuel reste valide et personne ne peut le changer sans ce lien.</p>
  </div>
</body>
</html>`;

  await sendEmail({ to, subject, html, text });
}
