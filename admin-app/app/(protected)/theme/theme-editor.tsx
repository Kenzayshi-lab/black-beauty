"use client";

/**
 * Editeur de theme client-side.
 *
 * State:
 *   - `theme`: la version en cours d'edition (locale)
 *   - `sha`: SHA GitHub de la version chargee (pour optimistic locking)
 *   - `saving` / `resetting`: verrous UI pendant les mutations
 *   - `feedback`: message succes/erreur
 *
 * Flux Save:
 *   1. PUT /api/content/theme.json avec { data, sha }
 *   2. Rebiaise `sha` sur le SHA retourne
 *   3. Confirme via feedback vert
 *
 * Flux Reset:
 *   1. Confirmation modale (evite un clic accidentel)
 *   2. Meme PUT mais avec les valeurs de theme.default.json
 */

import { useState, useTransition } from "react";
import { ThemePreview } from "./preview";

type ThemeRecord = Record<string, string>;

/**
 * Groupes de champs pour l'affichage. Le label est ce que Aalie voit;
 * les cles techniques (--rose-metal, etc.) restent en petit en dessous
 * pour reference.
 */
const COLOR_FIELDS: Array<{ key: string; label: string; hint: string }> = [
  { key: "--rouge-rubis",  label: "Rouge principal",       hint: "Accents, boutons, titres decoratifs" },
  { key: "--rouge-sang",   label: "Rouge profond",         hint: "Ombres et degradés du rouge principal" },
  { key: "--rose-metal",   label: "Rose metallique",       hint: "Sous-titres, liens, details fins" },
  { key: "--rose-poudre",  label: "Rose poudre",           hint: "Etat hover, halos discrets" },
  { key: "--argent-givre", label: "Argent brillant",       hint: "Texte principal sur fond noir" },
  { key: "--argent-doux",  label: "Argent doux",           hint: "Texte secondaire, legendes" },
  { key: "--noir-profond", label: "Noir profond",          hint: "Fond principal du site" },
  { key: "--noir-velours", label: "Noir velours",          hint: "Fond des sections et cartes" },
  { key: "--noir-marbre",  label: "Noir marbre",           hint: "Fond des zones d'accentuation" }
];

const TYPO_FIELDS: Array<{ key: string; label: string }> = [
  { key: "--titre",       label: "Police des titres" },
  { key: "--titre-deco",  label: "Police décorative" },
  { key: "--script",      label: "Police manuscrite" },
  { key: "--corps",       label: "Police du corps" }
];

const RADIUS_FIELDS: Array<{ key: string; label: string }> = [
  { key: "--r-sm", label: "Rayon petit" },
  { key: "--r-md", label: "Rayon moyen" },
  { key: "--r-lg", label: "Rayon grand" }
];

function equalRecords(a: ThemeRecord, b: ThemeRecord): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if (a[k] !== b[k]) return false;
  return true;
}

export function ThemeEditor(props: {
  initialTheme: ThemeRecord;
  initialSha: string;
  defaultTheme: ThemeRecord;
}) {
  const [baseline, setBaseline] = useState<ThemeRecord>(props.initialTheme);
  const [theme, setTheme] = useState<ThemeRecord>(props.initialTheme);
  const [sha, setSha] = useState<string>(props.initialSha);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const dirty = !equalRecords(theme, baseline);

  function updateField(key: string, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  }

  function revert() {
    setTheme(baseline);
    setFeedback(null);
  }

  async function save(next: ThemeRecord, message: string) {
    setFeedback(null);
    const res = await fetch("/api/content/theme.json", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next, sha, message })
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
    setTheme(next);
    setBaseline(next);
    setFeedback({
      kind: "ok",
      msg: "✅ Sauvegardé. Le site public sera mis à jour dans environ 1 minute (déploiement Vercel)."
    });
  }

  function onSave() {
    startTransition(() => save(theme, "admin: mise à jour du thème via console"));
  }

  function onReset() {
    setConfirmReset(false);
    startTransition(() =>
      save(props.defaultTheme, "admin: réinitialisation du thème aux couleurs d'origine")
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
      {/* Colonne gauche — editeurs */}
      <div className="space-y-8">
        {/* Section couleurs */}
        <section>
          <h2 className="font-titre text-lg text-argent-givre mb-4 tracking-wide">
            Couleurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COLOR_FIELDS.map((f) => {
              const value = theme[f.key] ?? "#000000";
              const changed = value !== baseline[f.key];
              return (
                <label
                  key={f.key}
                  className={`block bg-noir-velours border p-4 rounded transition-colors ${
                    changed
                      ? "border-rouge-rubis/60"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-argent-givre text-sm font-medium truncate">{f.label}</p>
                      <p className="text-argent-doux/70 text-[11px] mt-0.5">{f.hint}</p>
                    </div>
                    <code className="text-argent-doux/50 text-[10px] shrink-0 mt-0.5">
                      {f.key}
                    </code>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={value.slice(0, 7)}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-white/10 bg-transparent"
                      aria-label={`Choix de couleur pour ${f.label}`}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-argent-givre text-sm font-mono focus:outline-none focus:border-rose-metal/40"
                      spellCheck={false}
                      maxLength={9}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Section typo (lecture seule pour l'instant) */}
        <section>
          <h2 className="font-titre text-lg text-argent-givre mb-4 tracking-wide">
            Polices
          </h2>
          <div className="space-y-2">
            {TYPO_FIELDS.map((f) => (
              <div
                key={f.key}
                className="bg-noir-velours border border-white/5 px-4 py-3 rounded flex items-center gap-4"
              >
                <span className="text-argent-doux text-xs uppercase tracking-widest w-32 shrink-0">
                  {f.label}
                </span>
                <code className="text-argent-givre text-sm truncate">
                  {theme[f.key] ?? "—"}
                </code>
              </div>
            ))}
          </div>
          <p className="text-argent-doux/60 text-[11px] mt-2 italic">
            Modification des polices prévue dans une prochaine version — pour l’instant, contacte Kengsley si tu veux changer.
          </p>
        </section>

        {/* Section rayons (lecture seule) */}
        <section>
          <h2 className="font-titre text-lg text-argent-givre mb-4 tracking-wide">
            Rayons des angles
          </h2>
          <div className="flex gap-3 flex-wrap">
            {RADIUS_FIELDS.map((f) => (
              <div
                key={f.key}
                className="bg-noir-velours border border-white/5 px-4 py-3 rounded"
              >
                <p className="text-argent-doux text-[11px] uppercase tracking-widest">
                  {f.label}
                </p>
                <p className="text-argent-givre text-sm mt-1">{theme[f.key] ?? "—"}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Colonne droite — preview + actions (sticky pour rester visible en scroll) */}
      <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
        <div>
          <h2 className="font-titre text-lg text-argent-givre mb-3 tracking-wide">
            Aperçu
          </h2>
          <ThemePreview theme={theme} />
          <p className="text-argent-doux/60 text-[11px] mt-2 italic">
            Cet aperçu utilise les couleurs en cours d’édition. Pour voir le site réel après sauvegarde, ouvre{" "}
            <a
              href="https://blackandbeautystudio.ca"
              className="text-rose-metal underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              blackandbeautystudio.ca
            </a>{" "}
            dans un onglet séparé.
          </p>
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

        <div className="space-y-2">
          {dirty && (
            <p className="text-yellow-400/90 text-xs">
              ⚠️ Modifications non sauvegardées
            </p>
          )}
          <button
            type="button"
            disabled={!dirty || pending}
            onClick={onSave}
            className="w-full px-4 py-3 bg-rouge-rubis text-argent-givre font-medium tracking-wide uppercase text-sm border border-rouge-rubis hover:bg-rouge-sang disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? "Sauvegarde..." : "Sauvegarder les changements"}
          </button>
          <button
            type="button"
            disabled={!dirty || pending}
            onClick={revert}
            className="w-full px-4 py-2 text-argent-doux text-xs tracking-widest uppercase border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Annuler les modifications
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmReset(true)}
            className="w-full px-4 py-2 text-rouge-rubis text-xs tracking-widest uppercase border border-rouge-rubis/40 hover:bg-rouge-sang/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Réinitialiser aux couleurs d’origine
          </button>
        </div>
      </aside>

      {confirmReset && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-title"
        >
          <div className="bg-noir-velours border border-rouge-rubis/40 max-w-md w-full p-6 rounded">
            <h3 id="confirm-reset-title" className="font-titre text-lg text-argent-givre mb-3">
              Réinitialiser aux couleurs d’origine ?
            </h3>
            <p className="text-argent-doux text-sm mb-6">
              Toutes tes modifications personnelles seront écrasées et remplacées par la palette gothique d’origine du studio. Cette action est enregistrée dans l’historique et peut être annulée en modifiant à nouveau.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 text-argent-doux text-xs tracking-widest uppercase border border-white/10 hover:border-white/20 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2 bg-rouge-rubis text-argent-givre text-xs tracking-widest uppercase border border-rouge-rubis hover:bg-rouge-sang transition-colors"
              >
                Oui, réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
