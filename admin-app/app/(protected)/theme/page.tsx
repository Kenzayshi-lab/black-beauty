/**
 * Page /theme — editeur des couleurs et typographies du site public.
 *
 * Server component: charge theme.json + theme.default.json depuis le repo
 * GitHub, puis passe les valeurs au client component qui gere l'edition.
 */

import { readJson } from "@/lib/github";
import { ThemeEditor } from "./theme-editor";

export const runtime = "nodejs";
// Toujours dynamique — on doit voir la version la plus recente du repo,
// pas un cache Vercel.
export const dynamic = "force-dynamic";

type ThemeRecord = Record<string, string>;

export default async function ThemePage() {
  let current: ThemeRecord;
  let defaults: ThemeRecord;
  let currentSha: string;
  let loadError: string | null = null;

  try {
    const [themeRes, defRes] = await Promise.all([
      readJson<ThemeRecord>("public/content/theme.json"),
      readJson<ThemeRecord>("public/content/theme.default.json")
    ]);
    current = themeRes.data;
    currentSha = themeRes.sha;
    // theme.default.json peut contenir un _meta descriptif — on le retire
    // pour ne comparer/appliquer que les valeurs CSS.
    const raw = defRes.data as ThemeRecord & { _meta?: unknown };
    defaults = Object.fromEntries(
      Object.entries(raw).filter(([k]) => k !== "_meta")
    ) as ThemeRecord;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Erreur inconnue";
    current = {};
    defaults = {};
    currentSha = "";
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-rose-metal text-[10px] tracking-[0.4em] uppercase mb-2">
          ✠ Personnalisation ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Thème du site public
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Modifie les couleurs et polices utilisées sur{" "}
          <a
            href="https://blackandbeautystudio.ca"
            className="text-rose-metal underline underline-offset-4 hover:text-rose-poudre"
            target="_blank"
            rel="noreferrer"
          >
            blackandbeautystudio.ca
          </a>
          . Chaque sauvegarde crée un commit sur le dépôt et déclenche un
          redéploiement automatique (environ 1 minute).
        </p>
      </header>

      {loadError ? (
        <div className="bg-rouge-sang/10 border border-rouge-rubis/30 p-6 rounded">
          <p className="text-rouge-rubis text-sm font-medium mb-2">
            ❌ Impossible de charger le thème
          </p>
          <p className="text-argent-doux text-xs">{loadError}</p>
          <p className="text-argent-doux text-xs mt-3">
            Vérifie que <code className="bg-black/40 px-2 py-1 rounded">GITHUB_PAT</code> est
            bien renseigné dans les variables d’environnement Vercel du projet
            <code className="bg-black/40 px-2 py-1 rounded mx-1">bbstudio-admin</code>.
          </p>
        </div>
      ) : (
        <ThemeEditor
          initialTheme={current}
          initialSha={currentSha}
          defaultTheme={defaults}
        />
      )}
    </div>
  );
}
