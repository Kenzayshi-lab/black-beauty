/**
 * Page /onglerie — editeur du contenu et des prix de la page onglerie.
 */

import { readJson } from "@/lib/github";
import { TextContentEditor, type SectionsMeta } from "../_shared/text-content-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OnglerieData = Record<string, Record<string, string>>;

const SCHEMA: SectionsMeta = {
  hero: {
    label: "En-tête (hero)",
    hint: "Le gros bloc en haut de la page onglerie.",
    fields: {
      eyebrow:    { label: "Sur-titre", maxLength: 120 },
      title:      { label: "Titre principal", maxLength: 80 },
      script_sub: { label: "Note manuscrite (en dessous)", maxLength: 120 }
    }
  },
  prices_section: {
    label: "Section « Tarifs »",
    fields: {
      eyebrow:     { label: "Sur-titre", maxLength: 120 },
      title:       { label: "Titre", maxLength: 80 },
      footer_note: { label: "Note en bas de la grille de prix", longText: true, maxLength: 200 },
      thank_you:   { label: "Message de remerciement", maxLength: 120 }
    }
  },
  longueurs: {
    label: "Prix par longueur d’ongles",
    hint: "Prix en dollars (juste le chiffre, ex : 30 pour 30$).",
    fields: {
      small:    { label: "Small (S)",       maxLength: 20 },
      medium:   { label: "Medium (M)",      maxLength: 20 },
      large:    { label: "Large (L)",       maxLength: 20 },
      xlarge:   { label: "Extra-large (XL)", maxLength: 20 },
      xxlarge:  { label: "XXL",             maxLength: 20 },
      xxxlarge: { label: "XXXL",            maxLength: 20 }
    }
  },
  extras: {
    label: "Extras",
    hint: "Peuvent contenir des fourchettes (ex : « 5$ – 25$ »).",
    fields: {
      title:          { label: "Titre de la section", maxLength: 40 },
      nail_art:       { label: "Nail art",           maxLength: 30 },
      decorations:    { label: "Décorations",         maxLength: 30 },
      matte_top_coat: { label: "Top coat matte",      maxLength: 30 },
      french:         { label: "French",              maxLength: 30 }
    }
  },
  reparations: {
    label: "Réparations et dépose",
    fields: {
      title:           { label: "Titre de la section",     maxLength: 60 },
      reparation:      { label: "Réparation (à l’unité)",  maxLength: 30 },
      depose:          { label: "Dépose sur mes poses",    maxLength: 30 },
      depose_ailleurs: { label: "Dépose faite ailleurs",   maxLength: 30 }
    }
  },
  portfolio_section: {
    label: "Section « Portfolio »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 60 },
      title:   { label: "Titre", maxLength: 120 }
    }
  }
};

export default async function OngleriePage() {
  let data: OnglerieData;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<OnglerieData>("public/content/onglerie.json");
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
          ✠ Services · Onglerie ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Onglerie
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Modifie les textes et les prix de la page onglerie du site public.
          Chaque sauvegarde déclenche un redéploiement automatique (environ 1 minute).
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
          path="onglerie.json"
          initialData={data}
          initialSha={sha}
          schema={SCHEMA}
          publicUrl="https://blackandbeautystudio.ca/onglerie.html"
        />
      )}
    </div>
  );
}
