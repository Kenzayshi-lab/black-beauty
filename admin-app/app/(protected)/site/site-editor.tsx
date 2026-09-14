"use client";

/**
 * Editeur pour site.json (structure plate).
 *
 * Regroupe les 12 champs en 4 groupes visuels pour la lisibilite, mais
 * la data reste plate au save (comme attendue par SiteSchema Zod cote proxy).
 */

import { useMemo, useState, useTransition } from "react";

type SiteData = Record<string, string>;

type FieldSpec = {
  key: string;
  label: string;
  hint?: string;
  maxLength?: number;
  placeholder?: string;
};

type GroupSpec = {
  label: string;
  hint?: string;
  fields: FieldSpec[];
};

const GROUPS: GroupSpec[] = [
  {
    label: "Identité",
    fields: [
      { key: "name",              label: "Nom du studio", maxLength: 120 },
      { key: "tagline",           label: "Slogan", maxLength: 200 },
      { key: "city",              label: "Ville", maxLength: 80, placeholder: "Montréal (Québec)" },
      { key: "responsable_loi25", label: "Responsable Loi 25", hint: "Nom affiché dans la politique de confidentialité.", maxLength: 120 }
    ]
  },
  {
    label: "Contact",
    fields: [
      { key: "email",      label: "Courriel", maxLength: 200, placeholder: "adresse@exemple.com" },
      { key: "email_href", label: "Lien mailto (avec sujet pré-rempli)", hint: "Doit commencer par mailto:", maxLength: 500 }
    ]
  },
  {
    label: "Réseaux sociaux",
    fields: [
      { key: "instagram_handle", label: "Handle Instagram", hint: "Format : @nom_utilisateur", maxLength: 40 },
      { key: "instagram_url",    label: "URL profil Instagram", hint: "https://www.instagram.com/...", maxLength: 200 },
      { key: "instagram_dm",     label: "Lien message privé Instagram", hint: "https://ig.me/m/...", maxLength: 200 },
      { key: "tiktok_handle",    label: "Handle TikTok", hint: "Format : @nom_utilisateur", maxLength: 40 },
      { key: "tiktok_url",       label: "URL profil TikTok", hint: "https://www.tiktok.com/@...", maxLength: 200 }
    ]
  },
  {
    label: "Réservation",
    hint: "Utilisé par tous les boutons « Réserver un rendez-vous » du site.",
    fields: [
      {
        key: "square_url",
        label: "Lien Square Appointments",
        hint: "URL complète de ton système de réservation. Doit commencer par https://",
        maxLength: 500,
        placeholder: "https://ahustlabeauty.square.site/"
      }
    ]
  }
];

function equalData(a: SiteData, b: SiteData): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if (a[k] !== b[k]) return false;
  return true;
}

export function SiteEditor(props: {
  initialData: SiteData;
  initialSha: string;
}) {
  const [baseline, setBaseline] = useState<SiteData>(props.initialData);
  const [data, setData] = useState<SiteData>(props.initialData);
  const [sha, setSha] = useState<string>(props.initialSha);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const dirty = useMemo(() => !equalData(data, baseline), [data, baseline]);

  function updateField(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  }

  function revert() {
    setData(baseline);
    setFeedback(null);
  }

  async function save() {
    setFeedback(null);
    const res = await fetch("/api/content/site.json", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        sha,
        message: "admin: mise à jour des coordonnées via console"
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setFeedback({
        kind: "err",
        msg: err.error ?? `Erreur HTTP ${res.status}`
      });
      return;
    }

    const json = (await res.json()) as { contentSha: string };
    setSha(json.contentSha);
    setBaseline(data);
    setFeedback({
      kind: "ok",
      msg: "✅ Sauvegardé. Le site public sera mis à jour dans environ 1 minute (déploiement Vercel)."
    });
  }

  function onSave() {
    startTransition(() => save());
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-noir-profond/95 backdrop-blur border-b border-white/5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={onSave}
          className="px-4 py-2 bg-rouge-rubis text-argent-givre text-xs tracking-widest uppercase border border-rouge-rubis hover:bg-rouge-sang disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Sauvegarde…" : "Sauvegarder"}
        </button>
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={revert}
          className="px-4 py-2 text-argent-doux text-xs tracking-widest uppercase border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Annuler modifs
        </button>
        {dirty && (
          <span className="text-yellow-400/90 text-xs">
            ⚠️ Modifications non sauvegardées
          </span>
        )}
        <div className="flex-1" />
        <a
          href="https://blackandbeautystudio.ca/"
          target="_blank"
          rel="noreferrer"
          className="text-rose-metal text-xs tracking-widest uppercase underline underline-offset-4 hover:text-rose-poudre"
        >
          Voir sur le site ↗
        </a>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded text-sm ${
            feedback.kind === "ok"
              ? "bg-green-500/10 border border-green-500/30 text-green-300"
              : "bg-rouge-sang/10 border border-rouge-rubis/30 text-rouge-rubis"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {GROUPS.map((group) => (
        <section
          key={group.label}
          className="bg-noir-velours border border-white/5 rounded"
        >
          <header className="px-6 py-4 border-b border-white/5">
            <h2 className="font-titre text-argent-givre text-base tracking-wide">
              {group.label}
            </h2>
            {group.hint && (
              <p className="text-argent-doux/70 text-xs mt-1">{group.hint}</p>
            )}
          </header>

          <div className="p-6 space-y-4">
            {group.fields.map((f) => {
              const value = data[f.key] ?? "";
              const changed = value !== (baseline[f.key] ?? "");
              const id = `site-${f.key}`;
              return (
                <div key={f.key}>
                  <label
                    htmlFor={id}
                    className="block text-argent-givre text-sm font-medium mb-1"
                  >
                    {f.label}
                    {changed && (
                      <span className="text-yellow-400/90 text-[10px] ml-2 uppercase tracking-widest">
                        modifié
                      </span>
                    )}
                  </label>
                  {f.hint && (
                    <p className="text-argent-doux/60 text-[11px] mb-2">{f.hint}</p>
                  )}
                  <input
                    id={id}
                    type="text"
                    value={value}
                    maxLength={f.maxLength}
                    placeholder={f.placeholder}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    className={`w-full bg-black/40 border rounded px-3 py-2 text-argent-givre text-sm focus:outline-none focus:border-rose-metal/40 ${
                      changed ? "border-rouge-rubis/60" : "border-white/10"
                    }`}
                    spellCheck={false}
                  />
                  <div className="flex justify-between mt-1">
                    <code className="text-argent-doux/40 text-[10px]">{f.key}</code>
                    {f.maxLength && (
                      <span
                        className={`text-[10px] ${
                          value.length > f.maxLength * 0.9
                            ? "text-yellow-400/70"
                            : "text-argent-doux/40"
                        }`}
                      >
                        {value.length} / {f.maxLength}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
