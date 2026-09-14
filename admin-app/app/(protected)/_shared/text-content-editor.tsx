"use client";

/**
 * Composant generique pour editer un JSON de contenu structure
 * en sections (niveau 1) contenant des champs texte.
 *
 * Supporte deux formes:
 *   - fields terminaux (niveau 2): `data[section][field] = "string"`
 *   - fields groupes (niveau 3): `data[section][field][subfield] = "string"`
 *
 * Compatible home.json, onglerie.json, faq.json, epilation.json,
 * apropos.json et tout JSON de meme forme.
 *
 * schema decrit uniquement les LABELS d'affichage — la validation reelle
 * est faite par le proxy /api/content/[...path] avec le schema Zod.
 */

import { useState, useTransition } from "react";

export type FieldMeta = {
  label: string;
  hint?: string;
  longText?: boolean; // rend un textarea au lieu d'un input
  maxLength?: number;
  // Si present, ce field n'est pas un input direct mais un groupe qui
  // contient d'autres fields. Data path: data[section][field][subKey].
  subfields?: Record<string, FieldMeta>;
};

export type SectionMeta = {
  label: string;
  hint?: string;
  fields: Record<string, FieldMeta>;
};

export type SectionsMeta = Record<string, SectionMeta>;

// Value stockee dans data[section][field] est soit une string (field terminal)
// soit un objet { subkey: string } (field groupe).
type FieldValue = string | Record<string, string>;
type DataShape = Record<string, Record<string, FieldValue>>;

function equalValue(a: FieldValue | undefined, b: FieldValue | undefined): boolean {
  if (typeof a === "string" || typeof b === "string") return a === b;
  if (!a && !b) return true;
  if (!a || !b) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if (a[k] !== b[k]) return false;
  return true;
}

function equalData(a: DataShape, b: DataShape): boolean {
  const sections = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const s of sections) {
    const av = a[s] ?? {};
    const bv = b[s] ?? {};
    const keys = new Set([...Object.keys(av), ...Object.keys(bv)]);
    for (const k of keys) if (!equalValue(av[k], bv[k])) return false;
  }
  return true;
}

function getString(v: FieldValue | undefined, subKey?: string): string {
  if (v === undefined) return "";
  if (typeof v === "string") return v;
  if (subKey) return v[subKey] ?? "";
  return "";
}

export function TextContentEditor(props: {
  path: string;             // ex: "home.json"
  initialData: DataShape;
  initialSha: string;
  schema: SectionsMeta;
  publicUrl?: string;       // ex: "https://blackandbeautystudio.ca/"
}) {
  const [baseline, setBaseline] = useState<DataShape>(props.initialData);
  const [data, setData] = useState<DataShape>(props.initialData);
  const [sha, setSha] = useState<string>(props.initialSha);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const dirty = !equalData(data, baseline);

  function updateTerminal(section: string, field: string, value: string) {
    setData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] ?? {}), [field]: value }
    }));
    setFeedback(null);
  }

  function updateSubfield(section: string, field: string, subKey: string, value: string) {
    setData((prev) => {
      const sectionData = prev[section] ?? {};
      const existing = sectionData[field];
      const currentGroup: Record<string, string> =
        typeof existing === "object" && existing !== null ? { ...existing } : {};
      currentGroup[subKey] = value;
      return {
        ...prev,
        [section]: { ...sectionData, [field]: currentGroup }
      };
    });
    setFeedback(null);
  }

  function revert() {
    setData(baseline);
    setFeedback(null);
  }

  async function save() {
    setFeedback(null);
    const res = await fetch(`/api/content/${props.path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        sha,
        message: `admin: mise à jour de ${props.path} via console`
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
      {/* Bandeau d'actions sticky en haut */}
      <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-noir-profond/95 backdrop-blur border-b border-white/5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={onSave}
          className="px-4 py-2 bg-rouge-rubis text-argent-givre text-xs tracking-widest uppercase border border-rouge-rubis hover:bg-rouge-sang disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Sauvegarde..." : "Sauvegarder"}
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
        {props.publicUrl && (
          <a
            href={props.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-rose-metal text-xs tracking-widest uppercase underline underline-offset-4 hover:text-rose-poudre"
          >
            Voir sur le site ↗
          </a>
        )}
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

      {/* Sections */}
      {Object.entries(props.schema).map(([sectionKey, sectionMeta]) => {
        const sectionData = data[sectionKey] ?? {};
        const sectionBaseline = baseline[sectionKey] ?? {};

        return (
          <section
            key={sectionKey}
            className="bg-noir-velours border border-white/5 rounded"
          >
            <header className="px-6 py-4 border-b border-white/5">
              <h2 className="font-titre text-argent-givre text-base tracking-wide">
                {sectionMeta.label}
              </h2>
              {sectionMeta.hint && (
                <p className="text-argent-doux/70 text-xs mt-1">{sectionMeta.hint}</p>
              )}
              <code className="text-argent-doux/40 text-[10px] block mt-1">
                {sectionKey}
              </code>
            </header>

            <div className="p-6 space-y-4">
              {Object.entries(sectionMeta.fields).map(([fieldKey, fieldMeta]) => {
                // Field groupe (niveau 3)
                if (fieldMeta.subfields) {
                  const groupData = sectionData[fieldKey];
                  const groupBaseline = sectionBaseline[fieldKey];
                  return (
                    <fieldset
                      key={fieldKey}
                      className="border border-white/10 rounded p-4"
                    >
                      <legend className="px-2 text-argent-givre text-sm font-medium">
                        {fieldMeta.label}
                      </legend>
                      {fieldMeta.hint && (
                        <p className="text-argent-doux/60 text-[11px] mb-3">
                          {fieldMeta.hint}
                        </p>
                      )}
                      <code className="text-argent-doux/40 text-[10px] block mb-3">
                        {fieldKey}
                      </code>
                      <div className="space-y-3">
                        {Object.entries(fieldMeta.subfields).map(([subKey, subMeta]) => {
                          const value = getString(groupData, subKey);
                          const changed = value !== getString(groupBaseline, subKey);
                          const id = `${sectionKey}-${fieldKey}-${subKey}`;
                          return (
                            <TerminalField
                              key={subKey}
                              id={id}
                              value={value}
                              changed={changed}
                              meta={subMeta}
                              onChange={(v) => updateSubfield(sectionKey, fieldKey, subKey, v)}
                              rawKey={subKey}
                            />
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                }

                // Field terminal (niveau 2)
                const value = getString(sectionData[fieldKey]);
                const changed = value !== getString(sectionBaseline[fieldKey]);
                const id = `${sectionKey}-${fieldKey}`;
                return (
                  <TerminalField
                    key={fieldKey}
                    id={id}
                    value={value}
                    changed={changed}
                    meta={fieldMeta}
                    onChange={(v) => updateTerminal(sectionKey, fieldKey, v)}
                    rawKey={fieldKey}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/**
 * Rendu d'un field texte terminal (input ou textarea) + label + hint +
 * indicateur "modifié" + compteur de caracteres.
 */
function TerminalField(props: {
  id: string;
  value: string;
  changed: boolean;
  meta: FieldMeta;
  onChange: (value: string) => void;
  rawKey: string;
}) {
  const { id, value, changed, meta, onChange, rawKey } = props;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-argent-givre text-sm font-medium mb-1"
      >
        {meta.label}
        {changed && (
          <span className="text-yellow-400/90 text-[10px] ml-2 uppercase tracking-widest">
            modifié
          </span>
        )}
      </label>
      {meta.hint && (
        <p className="text-argent-doux/60 text-[11px] mb-2">{meta.hint}</p>
      )}
      {meta.longText ? (
        <textarea
          id={id}
          value={value}
          maxLength={meta.maxLength}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`w-full bg-black/40 border rounded px-3 py-2 text-argent-givre text-sm focus:outline-none focus:border-rose-metal/40 resize-y ${
            changed ? "border-rouge-rubis/60" : "border-white/10"
          }`}
          spellCheck={true}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          maxLength={meta.maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-black/40 border rounded px-3 py-2 text-argent-givre text-sm focus:outline-none focus:border-rose-metal/40 ${
            changed ? "border-rouge-rubis/60" : "border-white/10"
          }`}
          spellCheck={true}
        />
      )}
      <div className="flex justify-between mt-1">
        <code className="text-argent-doux/40 text-[10px]">{rawKey}</code>
        {meta.maxLength && (
          <span
            className={`text-[10px] ${
              value.length > meta.maxLength * 0.9
                ? "text-yellow-400/70"
                : "text-argent-doux/40"
            }`}
          >
            {value.length} / {meta.maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
