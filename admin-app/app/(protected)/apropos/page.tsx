/**
 * Page /apropos — editeur du contenu de la page a propos.
 *
 * Utilise la fonctionnalite `subfields` du TextContentEditor pour la
 * section "values" qui contient 3 cartes de valeur (excellence, hygiene,
 * bienveillance) — chacune avec un titre + description.
 */

import { readJson } from "@/lib/github";
import { TextContentEditor, type SectionsMeta } from "../_shared/text-content-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// La forme reelle du JSON contient un niveau imbrique pour `values`.
// TextContentEditor traite ca via `subfields`.
type AproposData = Record<string, Record<string, string | Record<string, string>>>;

const VALUE_CARD_FIELDS = {
  title:       { label: "Titre",       maxLength: 40 },
  description: { label: "Description", longText: true, maxLength: 400 }
} as const;

const SCHEMA: SectionsMeta = {
  hero: {
    label: "En-tête (hero)",
    fields: {
      eyebrow:    { label: "Sur-titre", maxLength: 120 },
      title:      { label: "Titre principal", maxLength: 80 },
      script_sub: { label: "Note manuscrite", maxLength: 120 }
    }
  },
  story_section: {
    label: "Section « Notre histoire »",
    fields: {
      eyebrow:     { label: "Sur-titre", maxLength: 80 },
      title:       { label: "Titre", maxLength: 120 },
      paragraph_1: { label: "Paragraphe 1", longText: true, maxLength: 800 },
      paragraph_2: { label: "Paragraphe 2", longText: true, maxLength: 800 }
    }
  },
  values_section: {
    label: "Section « Valeurs » (en-tête)",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 80 },
      title:   { label: "Titre",     maxLength: 120 }
    }
  },
  values: {
    label: "Cartes de valeurs",
    hint: "Les trois cartes affichées côte à côte sur la page.",
    fields: {
      excellence: {
        label: "Carte : Excellence",
        subfields: VALUE_CARD_FIELDS
      },
      hygiene: {
        label: "Carte : Hygiène",
        subfields: VALUE_CARD_FIELDS
      },
      bienveillance: {
        label: "Carte : Bienveillance",
        subfields: VALUE_CARD_FIELDS
      }
    }
  },
  contact_section: {
    label: "Section « Contact » (en-tête)",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 80 },
      title:   { label: "Titre",     maxLength: 120 }
    }
  },
  contact_card: {
    label: "Carte de coordonnées",
    fields: {
      title:             { label: "Titre de la carte",       maxLength: 60 },
      label_address:     { label: "Étiquette « Adresse »",   maxLength: 40 },
      label_email:       { label: "Étiquette « Email »",     maxLength: 40 },
      label_appointment: { label: "Étiquette « Rendez-vous »", maxLength: 40 },
      appointment_text:  { label: "Texte du rendez-vous",    maxLength: 120 },
      label_instagram:   { label: "Étiquette « Instagram »", maxLength: 40 },
      label_tiktok:      { label: "Étiquette « TikTok »",    maxLength: 40 }
    }
  },
  appointment_card: {
    label: "Carte « Prendre rendez-vous »",
    fields: {
      title:       { label: "Titre",       maxLength: 60 },
      description: { label: "Description", longText: true, maxLength: 400 },
      button_text: { label: "Texte du bouton", maxLength: 60 }
    }
  }
};

export default async function AproposPage() {
  let data: AproposData;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<AproposData>("public/content/apropos.json");
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
          ✠ Le studio ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          À propos
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Modifie l’histoire du studio, les valeurs et les coordonnées affichées
          sur la page À propos. Chaque sauvegarde déclenche un redéploiement
          automatique (environ 1 minute).
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
          path="apropos.json"
          initialData={data}
          initialSha={sha}
          schema={SCHEMA}
          publicUrl="https://blackandbeautystudio.ca/apropos.html"
        />
      )}
    </div>
  );
}
