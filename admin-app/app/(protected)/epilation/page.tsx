/**
 * Page /epilation — editeur du contenu et des prix de la page epilation.
 */

import { readJson } from "@/lib/github";
import { TextContentEditor, type SectionsMeta } from "../_shared/text-content-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EpilationData = Record<string, Record<string, string>>;

const SCHEMA: SectionsMeta = {
  hero: {
    label: "En-tête (hero)",
    fields: {
      eyebrow:    { label: "Sur-titre", maxLength: 120 },
      title:      { label: "Titre principal", maxLength: 80 },
      script_sub: { label: "Note manuscrite (en dessous)", maxLength: 120 }
    }
  },
  prices_section: {
    label: "Section « Tarifs »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 120 },
      title:   { label: "Titre", maxLength: 80 }
    }
  },
  visage: {
    label: "Prix — Visage",
    hint: "Prix en dollars (ex : 15$).",
    fields: {
      title:            { label: "Titre de la catégorie", maxLength: 40 },
      sourcils:         { label: "Sourcils",              maxLength: 20 },
      levre_superieure: { label: "Lèvre supérieure",       maxLength: 20 },
      menton:           { label: "Menton",                 maxLength: 20 },
      joues:            { label: "Joues",                  maxLength: 20 },
      visage_complet:   { label: "Visage complet",         maxLength: 20 }
    }
  },
  corps: {
    label: "Prix — Corps",
    fields: {
      title:         { label: "Titre de la catégorie", maxLength: 40 },
      aisselles:     { label: "Aisselles",              maxLength: 20 },
      bras_complets: { label: "Bras complets",          maxLength: 20 },
      demi_bras:     { label: "Demi-bras",              maxLength: 20 },
      mains_doigts:  { label: "Mains et doigts",        maxLength: 20 },
      torse:         { label: "Torse",                  maxLength: 20 },
      ventre:        { label: "Ventre",                 maxLength: 20 },
      bas_dos:       { label: "Bas du dos",             maxLength: 20 },
      dos_complet:   { label: "Dos complet",            maxLength: 20 }
    }
  },
  maillot: {
    label: "Prix — Maillot",
    fields: {
      title:                 { label: "Titre de la catégorie",       maxLength: 40 },
      classique:             { label: "Classique",                    maxLength: 20 },
      echancre:              { label: "Échancré",                     maxLength: 20 },
      integral:              { label: "Intégral",                     maxLength: 20 },
      bresilien:             { label: "Brésilien",                    maxLength: 20 },
      integral_interfessier: { label: "Intégral + interfessier",      maxLength: 20 },
      interfessier:          { label: "Interfessier seul",            maxLength: 20 }
    }
  },
  jambes: {
    label: "Prix — Jambes",
    fields: {
      title:            { label: "Titre de la catégorie", maxLength: 40 },
      demi_jambes:      { label: "Demi-jambes",           maxLength: 20 },
      jambes_completes: { label: "Jambes complètes",      maxLength: 20 },
      cuisses:          { label: "Cuisses",               maxLength: 20 },
      genoux:           { label: "Genoux",                maxLength: 20 },
      pieds_orteils:    { label: "Pieds et orteils",      maxLength: 20 }
    }
  },
  a_savoir: {
    label: "Bloc « À savoir »",
    fields: {
      title:  { label: "Titre",                                      maxLength: 40 },
      line_1: { label: "Ligne 1", longText: true,                    maxLength: 200 },
      line_2: { label: "Ligne 2", longText: true,                    maxLength: 200 },
      merci:  { label: "Message de remerciement",                    maxLength: 120 }
    }
  },
  info_before: {
    label: "Info « Avant votre séance »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 120 },
      title:   { label: "Titre",     maxLength: 120 }
    }
  },
  info_reserve: {
    label: "Info « Au moment de réserver »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 120 },
      title:   { label: "Titre",     maxLength: 120 }
    }
  }
};

export default async function EpilationPage() {
  let data: EpilationData;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<EpilationData>("public/content/epilation.json");
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
          ✠ Services · Épilation ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Épilation
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Modifie les textes et les prix de la page épilation du site public.
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
          path="epilation.json"
          initialData={data}
          initialSha={sha}
          schema={SCHEMA}
          publicUrl="https://blackandbeautystudio.ca/epilation.html"
        />
      )}
    </div>
  );
}
