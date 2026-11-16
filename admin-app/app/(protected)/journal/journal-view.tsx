"use client";

/**
 * Vue cliente du journal : liste des dernières activités enregistrées.
 * (Le "kill switch" de l'ancienne version dépendait d'Auth.js + Redis et a été
 * retiré lors du passage à Firebase.)
 */

type AuditEvent = {
  id: string;
  timestamp: string;
  action: string;
  ipHash: string;
  userAgent: string | null;
  details?: Record<string, unknown>;
};

const ACTION_LABELS: Record<string, { label: string; kind: "ok" | "warn" | "err" | "info" }> = {
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
  "user.password_reset": { label: "Mot de passe réinitialisé", kind: "warn" }
};

function parseBrowser(ua: string | null): string {
  if (!ua) return "Inconnu";
  if (/iPhone|iPad|iPod/.test(ua)) return "iPhone/iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Macintosh|Mac OS X/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Autre";
}

function shortIp(hash: string): string {
  if (!hash || hash === "unknown") return "—";
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-CA", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

export function JournalView({ events }: { events: AuditEvent[] }) {
  return (
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
                <span className="text-argent-givre text-sm flex-1 min-w-[180px]">{meta.label}</span>
                <span className="text-argent-doux text-xs">{formatDate(e.timestamp)}</span>
                <span className="text-argent-doux/70 text-[11px] font-mono">{parseBrowser(e.userAgent)}</span>
                <span className="text-argent-doux/50 text-[10px] font-mono" title={`IP hachée : ${e.ipHash}`}>
                  ip: {shortIp(e.ipHash)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
