/**
 * Page /galerie — editeur de la liste de photos + upload.
 */

import { readJson } from "@/lib/github";
import { GalleryEditor } from "./gallery-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GalerieData = {
  hero?: { eyebrow?: string; title?: string; script_sub?: string };
  intro?: string;
  instagram_button_text?: string;
  cta_final?: { eyebrow?: string; title?: string; description?: string; button_text?: string };
  photos: Array<{ src: string; alt: string; link?: string }>;
};

export default async function GaleriePage() {
  let data: GalerieData;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<GalerieData>("public/content/galerie.json");
    data = res.data;
    sha = res.sha;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Erreur inconnue";
    data = { photos: [] };
    sha = "";
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-rose-metal text-[10px] tracking-[0.4em] uppercase mb-2">
          ✠ Portfolio ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Galerie
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Gère les photos affichées sur la page galerie du site public.
          Ajoute, réordonne, modifie les descriptions et les liens Instagram.
          Chaque sauvegarde déclenche un redéploiement automatique (environ 1 minute).
        </p>
        <p className="text-argent-doux/60 text-xs mt-2 max-w-2xl italic">
          Note : la suppression retire la photo de la galerie mais laisse le fichier
          dans le dépôt (pas de perte définitive). Le nettoyage est manuel pour le moment.
        </p>
      </header>

      {loadError ? (
        <div className="bg-rouge-sang/10 border border-rouge-rubis/30 p-6 rounded">
          <p className="text-rouge-rubis text-sm font-medium mb-2">
            ❌ Impossible de charger la galerie
          </p>
          <p className="text-argent-doux text-xs">{loadError}</p>
        </div>
      ) : (
        <GalleryEditor
          initialGalerie={data}
          initialSha={sha}
          defaultInstagramLink="https://www.instagram.com/black_and_beauty_studio/"
        />
      )}
    </div>
  );
}
