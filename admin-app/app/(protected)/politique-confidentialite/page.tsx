/**
 * Page /politique-confidentialite — editeur du hero et de la date de MAJ.
 *
 * Le CORPS de la politique reste en HTML dans public/politique-confidentialite.html
 * (contenu juridique verifie par Louis, edition rare).
 */

import { readJson } from "@/lib/github";
import { TextContentEditor, type SectionsMeta } from "../_shared/text-content-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Data = Record<string, Record<string, string>>;

const SCHEMA: SectionsMeta = {
  hero: {
    label: "En-tête",
    fields: {
      eyebrow:    { label: "Sur-titre", maxLength: 120 },
      title:      { label: "Titre principal", maxLength: 120 },
      script_sub: { label: "Note manuscrite", maxLength: 120 }
    }
  },
  meta: {
    label: "Métadonnées",
    fields: {
      last_update: { label: "Dernière mise à jour", hint: "Format libre (ex : 8 septembre 2026).", maxLength: 40 },
      toc_title:   { label: "Titre du sommaire", maxLength: 60 }
    }
  }
};

export default async function PolitiqueConfidentialitePage() {
  let data: Data;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<Data>("public/content/politique-confidentialite.json");
    data = res.data;
    sha = res.sha;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Erreur inconnue";
    data = {};
    sha = "";
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-rose-metal text-[10px] tracking-[0.4em] uppercase mb-2">
          ✠ Loi 25 · Québec ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Politique de confidentialité
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Modifie l’en-tête et la date de mise à jour affichés en haut de la page.
          Le corps juridique reste géré par Kengsley — contacte-le si tu veux le modifier
          (obligation légale de traçabilité).
        </p>
      </header>

      {loadError ? (
        <div className="bg-rouge-sang/10 border border-rouge-rubis/30 p-6 rounded">
          <p className="text-rouge-rubis text-sm font-medium mb-2">
            ❌ Impossible de charger le contenu
          </p>
          <p className="text-argent-doux text-xs">{loadError}</p>
        </div>
      ) : (
        <TextContentEditor
          path="politique-confidentialite.json"
          initialData={data}
          initialSha={sha}
          schema={SCHEMA}
          publicUrl="https://blackandbeautystudio.ca/politique-confidentialite.html"
        />
      )}
    </div>
  );
}
