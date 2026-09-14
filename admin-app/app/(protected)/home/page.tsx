/**
 * Page /home — editeur du contenu de la page d'accueil du site public.
 */

import { readJson } from "@/lib/github";
import { TextContentEditor, type SectionsMeta } from "../_shared/text-content-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HomeData = Record<string, Record<string, string>>;

const SCHEMA: SectionsMeta = {
  hero: {
    label: "En-tête (hero)",
    hint: "Le gros bloc en haut de la page d'accueil.",
    fields: {
      eyebrow:            { label: "Sur-titre", hint: "Petit texte au-dessus du titre principal.", maxLength: 120 },
      title:              { label: "Titre principal", maxLength: 120 },
      tagline:            { label: "Slogan", longText: true, maxLength: 200 },
      subtitle:           { label: "Sous-titre", longText: true, maxLength: 200 },
      cta_secondary_text: { label: "Texte du bouton secondaire", maxLength: 80 }
    }
  },
  services_section: {
    label: "Section « Services »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 80 },
      title:   { label: "Titre", maxLength: 120 }
    }
  },
  prices_section: {
    label: "Section « Tarifs »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 80 },
      title:   { label: "Titre", maxLength: 120 }
    }
  },
  about_teaser: {
    label: "Section « À propos »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 80 },
      title:   { label: "Titre", longText: true, maxLength: 200 }
    }
  },
  instagram_section: {
    label: "Section Instagram",
    fields: {
      title:    { label: "Titre", maxLength: 120 },
      subtitle: { label: "Sous-titre", longText: true, maxLength: 200 }
    }
  },
  policies_section: {
    label: "Section « Politiques »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 80 },
      title:   { label: "Titre", maxLength: 120 }
    }
  },
  cta_final: {
    label: "Appel à l'action final",
    hint: "Le bloc en bas de la page d'accueil pour inciter à réserver.",
    fields: {
      eyebrow:     { label: "Sur-titre", maxLength: 120 },
      title:       { label: "Titre", maxLength: 120 },
      script:      { label: "Note manuscrite (en dessous)", maxLength: 120 },
      button_text: { label: "Texte du bouton", maxLength: 80 }
    }
  }
};

export default async function HomePage() {
  let data: HomeData;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<HomeData>("public/content/home.json");
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
          ✠ Page d’accueil ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Accueil
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Modifie les textes affichés sur la page d’accueil du site public.
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
          path="home.json"
          initialData={data}
          initialSha={sha}
          schema={SCHEMA}
          publicUrl="https://blackandbeautystudio.ca/"
        />
      )}
    </div>
  );
}
