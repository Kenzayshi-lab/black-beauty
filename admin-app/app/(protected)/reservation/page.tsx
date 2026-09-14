/**
 * Page /reservation — editeur du contenu de la page reservation
 * (avant integration Square Appointments — chunk 9bis).
 */

import { readJson } from "@/lib/github";
import { TextContentEditor, type SectionsMeta } from "../_shared/text-content-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReservationData = Record<string, Record<string, string>>;

const SCHEMA: SectionsMeta = {
  hero: {
    label: "En-tête (hero)",
    fields: {
      eyebrow:    { label: "Sur-titre", maxLength: 120 },
      title:      { label: "Titre principal", maxLength: 80 },
      script_sub: { label: "Note manuscrite", maxLength: 120 }
    }
  },
  reserv_section: {
    label: "Section « Pour réserver »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 120 },
      title:   { label: "Titre",     maxLength: 80 }
    }
  },
  how_to: {
    label: "Section « Comment réserver »",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 120 },
      title:   { label: "Titre",     longText: true, maxLength: 200 }
    }
  },
  policies_section: {
    label: "Section « Politiques » (en-tête)",
    fields: {
      eyebrow: { label: "Sur-titre", maxLength: 120 },
      title:   { label: "Titre",     maxLength: 80 }
    }
  },
  policies: {
    label: "Libellés des 4 cartes de politiques",
    hint: "Ce sont les TITRES des cartes affichées. Les explications détaillées restent gérées dans le code — contacte Kengsley pour les changer.",
    fields: {
      depot:      { label: "Carte 1", maxLength: 60 },
      retard:     { label: "Carte 2", maxLength: 60 },
      paiement:   { label: "Carte 3", maxLength: 60 },
      annulation: { label: "Carte 4", maxLength: 60 }
    }
  }
};

export default async function ReservationPage() {
  let data: ReservationData;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<ReservationData>("public/content/reservation.json");
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
          ✠ Prise de rendez-vous ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Réservation
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Modifie les textes de la page réservation du site public.
          Le widget Square Appointments sera intégré plus tard (chunk séparé, dès que tu m’envoies le lien).
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
          path="reservation.json"
          initialData={data}
          initialSha={sha}
          schema={SCHEMA}
          publicUrl="https://blackandbeautystudio.ca/reservation.html"
        />
      )}
    </div>
  );
}
