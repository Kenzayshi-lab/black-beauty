"use client";

/**
 * Vue cliente du journal:
 *   - Table des N derniers events (date, action, IP hachee tronquee, browser)
 *   - Bouton "Deconnecter tous mes appareils" avec modale de confirmation
 *   - Appelle POST /api/session/kill-all puis signOut client-side
 */

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";

type AuditEvent = {
  id: string;
  timestamp: string;
  action:
    | "login.success"
    | "login.failure"
    | "login.rate_limited"
    | "logout"
    | "content.update"
    | "content.create"
    | "content.delete"
    | "media.upload"
    | "media.delete"
    | "user.created"
    | "user.password_reset"
    | "user.mfa_enabled"
    | "user.mfa_disabled";
  ipHash: string;
  userAgent: string | null;
  details?: Record<string, unknown>;
};

const ACTION_LABELS: Record<AuditEvent["action"], { label: string; kind: "ok" | "warn" | "err" | "info" }> = {
  "login.success":       { label: "Connexion réussie", kind: "ok" },
  "login.failure":       { label: "Échec de connexion", kind: "err" },
  "login.rate_limited":  { label: "Trop de tentatives (bloqué)", kind: "warn" },
  "logout":              { label: "Déconnexion", kind: "info" },
  "content.update":      { label: "Modification de contenu", kind: "info" },
  "content.create":      { label: "Création de contenu", kind: "info" },
  "content.delete":      { label: "Suppression de contenu", kind: "info" },
  "media.upload":        { label: "Upload de photo", kind: "info" },
  "media.delete":        { label: "Suppression de photo", kind: "info" },
  "user.created":        { label: "Utilisateur créé", kind: "info" },
  "user.password_reset": { label: "Mot de passe réinitialisé", kind: "warn" },
  "user.mfa_enabled":    { label: "2FA activé", kind: "info" },
  "user.mfa_disabled":   { label: "2FA désactivé", kind: "warn" }
};

function parseBrowser(ua: string | null): string {
  if (!ua) return "Inconnu";
  // Detection basique — pas de dep externe
  if (/iPhone|iPad|iPod/.test(ua)) return "iPhone/iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Macintosh|Mac OS X/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Autre";
}

function parseAgent(ua: string | null): string {
  if (!ua) return "—";
  if (/Chrome\/(\d+)/.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\/(\d+)/.test(ua)) return "Firefox";
  if (/Safari\/(\d+)/.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Autre";
}

function shortIp(hash: string): string {
  if (!hash || hash === "unknown") return "—";
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-CA", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

export function JournalView({ events }: { events: AuditEvent[] }) {
  const [pending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  async function killAll() {
    setShowConfirm(false);
    setFeedback(null);
    const res = await fetch("/api/session/kill-all", { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setFeedback({
        kind: "err",
        msg: err.error ?? `Erreur HTTP ${res.status}`
      });
      return;
    }
    // Sign out la session courante — la redirect vers /login
    await signOut({ callbackUrl: "/login" });
  }

  function onKillAll() {
    startTransition(() => killAll());
  }

  return (
    <div className="space-y-6">
      {/* Kill switch */}
      <section className="bg-noir-velours border border-rouge-rubis/30 rounded p-6">
        <h2 className="font-titre text-argent-givre text-base mb-2 tracking-wide">
          🚨 Kill switch — Déconnecter tous mes appareils
        </h2>
        <p className="text-argent-doux text-sm mb-4">
          Si tu penses que quelqu&apos;un s&apos;est connecté sans autorisation (téléphone volé,
          ordinateur partagé, doute), déclenche cette action. <strong className="text-argent-givre">Toutes tes sessions
          en cours seront invalidées</strong>, y compris la tienne — tu devras te reconnecter.
        </p>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={pending}
          className="px-4 py-2 bg-rouge-rubis text-argent-givre text-xs tracking-widest uppercase border border-rouge-rubis hover:bg-rouge-sang disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Déconnecter tous mes appareils
        </button>
        {feedback && (
          <div
            className={`mt-4 p-3 rounded text-sm ${
              feedback.kind === "ok"
                ? "bg-green-500/10 border border-green-500/30 text-green-300"
                : "bg-rouge-sang/10 border border-rouge-rubis/30 text-rouge-rubis"
            }`}
          >
            {feedback.msg}
          </div>
        )}
      </section>

      {/* Journal */}
      <section className="bg-noir-velours border border-white/5 rounded">
        <header className="px-6 py-4 border-b border-white/5">
          <h2 className="font-titre text-argent-givre text-base tracking-wide">
            Activité récente ({events.length})
          </h2>
          <p className="text-argent-doux/70 text-xs mt-1">
            Les entrées expirent automatiquement après 90 jours (conformité Loi 25).
          </p>
        </header>

        {events.length === 0 ? (
          <p className="p-6 text-argent-doux text-sm italic text-center">
            Aucune activité récente enregistrée.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {events.map((e) => {
              const meta = ACTION_LABELS[e.action] ?? { label: e.action, kind: "info" as const };
              const dot = {
                ok: "bg-green-400",
                warn: "bg-yellow-400",
                err: "bg-rouge-rubis",
                info: "bg-argent-doux/60"
              }[meta.kind];
              return (
                <li key={e.id} className="px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} aria-hidden />
                  <span className="text-argent-givre text-sm flex-1 min-w-[180px]">
                    {meta.label}
                  </span>
                  <span className="text-argent-doux text-xs">
                    {formatDate(e.timestamp)}
                  </span>
                  <span className="text-argent-doux/70 text-[11px] font-mono">
                    {parseBrowser(e.userAgent)} · {parseAgent(e.userAgent)}
                  </span>
                  <span
                    className="text-argent-doux/50 text-[10px] font-mono"
                    title={`IP hachée : ${e.ipHash}`}
                  >
                    ip: {shortIp(e.ipHash)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-argent-doux/60 text-[11px] italic">
        Ton adresse IP réelle n&apos;est jamais stockée — seul un hash cryptographique est
        gardé (conformité Loi 25 Québec).
      </p>

      {/* Modal confirmation kill switch */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-kill-title"
        >
          <div className="bg-noir-velours border border-rouge-rubis/40 max-w-md w-full p-6 rounded">
            <h3 id="confirm-kill-title" className="font-titre text-lg text-argent-givre mb-3">
              Déconnecter tous les appareils ?
            </h3>
            <p className="text-argent-doux text-sm mb-4">
              Cette action va invalider <strong>toutes tes sessions en cours</strong>, y compris
              sur ce navigateur. Tu devras te reconnecter avec ton mot de passe.
            </p>
            <p className="text-argent-doux/70 text-xs mb-6">
              Utile si tu as perdu ton téléphone, si tu t&apos;es connectée depuis un ordi
              public, ou si tu as le moindre doute sur la sécurité de ton compte.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-argent-doux text-xs tracking-widest uppercase border border-white/10 hover:border-white/20 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onKillAll}
                disabled={pending}
                className="px-4 py-2 bg-rouge-rubis text-argent-givre text-xs tracking-widest uppercase border border-rouge-rubis hover:bg-rouge-sang disabled:opacity-40 transition-colors"
              >
                {pending ? "…" : "Oui, tout déconnecter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
