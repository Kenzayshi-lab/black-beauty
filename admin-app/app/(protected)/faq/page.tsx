/**
 * Page /faq — editeur des questions frequentes.
 *
 * ⚠️ Seules les QUESTIONS sont editables ici. Les reponses sont dans le
 * HTML dur (faq.html) — les modifier necessite pour l'instant un ajustement
 * cote code par Louis. Un editeur complet Q/R viendra dans un prochain chunk.
 */

import { readJson } from "@/lib/github";
import { TextContentEditor, type SectionsMeta } from "../_shared/text-content-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FaqData = Record<string, Record<string, string>>;

const SCHEMA: SectionsMeta = {
  hero: {
    label: "En-tête (hero)",
    fields: {
      eyebrow:    { label: "Sur-titre", maxLength: 120 },
      title:      { label: "Titre principal", maxLength: 80 },
      script_sub: { label: "Note manuscrite", maxLength: 120 }
    }
  },
  reservation: {
    label: "Catégorie « Réservation »",
    fields: {
      title:         { label: "Titre de la catégorie", maxLength: 40 },
      q_prendre_rdv: { label: "Question : prendre RDV", longText: true, maxLength: 200 },
      q_depot:       { label: "Question : dépôt de 20$", longText: true, maxLength: 200 },
      q_retard:      { label: "Question : retard", longText: true, maxLength: 200 },
      q_paiement:    { label: "Question : modes de paiement", longText: true, maxLength: 200 }
    }
  },
  onglerie: {
    label: "Catégorie « Onglerie »",
    fields: {
      title:          { label: "Titre de la catégorie", maxLength: 40 },
      q_duree_pose:   { label: "Question : durée pose acrylique", longText: true, maxLength: 200 },
      q_duree_seance: { label: "Question : durée séance", longText: true, maxLength: 200 },
      q_inspiration:  { label: "Question : apporter une inspiration", longText: true, maxLength: 200 }
    }
  },
  epilation: {
    label: "Catégorie « Épilation »",
    fields: {
      title:       { label: "Titre de la catégorie", maxLength: 40 },
      q_douleur:   { label: "Question : douleur", longText: true, maxLength: 200 },
      q_longueur:  { label: "Question : longueur des poils", longText: true, maxLength: 200 },
      q_frequence: { label: "Question : fréquence", longText: true, maxLength: 200 }
    }
  },
  studio: {
    label: "Catégorie « Studio »",
    fields: {
      title:           { label: "Titre de la catégorie", maxLength: 40 },
      q_adresse:       { label: "Question : adresse", longText: true, maxLength: 200 },
      q_accompagnants: { label: "Question : enfants / accompagnants", longText: true, maxLength: 200 }
    }
  },
  cta: {
    label: "Appel à l’action (fin de page)",
    fields: {
      text:   { label: "Texte d’intro", longText: true, maxLength: 120 },
      button: { label: "Texte du bouton", maxLength: 60 }
    }
  }
};

export default async function FaqPage() {
  let data: FaqData;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<FaqData>("public/content/faq.json");
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
          ✠ Foire aux questions ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          FAQ
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Modifie les <strong>questions</strong> affichées sur la page FAQ du site public.
          Les <em>réponses</em> restent dans le code du site pour l’instant — si tu veux les modifier,
          contacte Kengsley.
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
          path="faq.json"
          initialData={data}
          initialSha={sha}
          schema={SCHEMA}
          publicUrl="https://blackandbeautystudio.ca/faq.html"
        />
      )}
    </div>
  );
}
