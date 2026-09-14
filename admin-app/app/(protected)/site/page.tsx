/**
 * Page /site — editeur du fichier site.json (identite + coordonnees).
 *
 * site.json est un objet plat (pas de sections), donc utilise un composant
 * dedie SiteEditor plutot que TextContentEditor.
 */

import { readJson } from "@/lib/github";
import { SiteEditor } from "./site-editor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SiteData = Record<string, string>;

export default async function SitePage() {
  let data: SiteData;
  let sha: string;
  let loadError: string | null = null;

  try {
    const res = await readJson<SiteData>("public/content/site.json");
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
          ✠ Identité du studio ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Coordonnées & liens
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Informations affichées partout sur le site (coordonnées, réseaux sociaux, lien de réservation Square).
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
        <SiteEditor initialData={data} initialSha={sha} />
      )}
    </div>
  );
}
