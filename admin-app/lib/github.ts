/**
 * Client GitHub Contents API pour lire/ecrire les JSON du site public.
 *
 * Securite:
 *   - PAT scope minimal: contents:write sur UN SEUL repo (fine-grained)
 *   - Whitelist des paths acceptes cote route handler (voir content-paths.ts)
 *   - SHA-optimistic locking: chaque PUT envoie le SHA de la version lue
 *     pour eviter d'ecraser une modification concurrente.
 *
 * ⚠️ Ne JAMAIS logger le PAT. Ne JAMAIS l'exposer cote client.
 */

import { env } from "./env";

const GITHUB_API = "https://api.github.com";

type GhFileResponse = {
  sha: string;
  content: string;      // base64
  encoding: "base64";
  path: string;
  size: number;
};

export type ReadResult<T> = {
  data: T;
  sha: string;
  path: string;
};

function auth(): { headers: Record<string, string>; owner: string; repo: string; branch: string } {
  const e = env();
  if (!e.GITHUB_PAT) {
    throw new Error("GITHUB_PAT manquant — configure-le dans Vercel > Environment Variables");
  }
  return {
    headers: {
      "Authorization": `Bearer ${e.GITHUB_PAT}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "bbstudio-admin/0.2.0"
    },
    owner: e.GITHUB_OWNER,
    repo: e.GITHUB_REPO,
    branch: e.GITHUB_DEFAULT_BRANCH
  };
}

/**
 * Lit un fichier JSON du repo. Retourne { data, sha } — le SHA est requis
 * pour un futur PUT sur le meme fichier (optimistic locking cote GitHub).
 */
export async function readJson<T = unknown>(path: string): Promise<ReadResult<T>> {
  const { headers, owner, repo, branch } = auth();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`;

  const res = await fetch(url, {
    headers,
    // Toujours frais — la console admin doit voir la version reelle du repo
    cache: "no-store"
  });

  if (res.status === 404) {
    throw new Error(`Fichier introuvable dans le repo: ${path}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status} sur GET ${path}: ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as GhFileResponse;
  if (json.encoding !== "base64") {
    throw new Error(`Encoding inattendu (${json.encoding}) pour ${path}`);
  }

  // Le contenu base64 peut contenir des \n — Buffer.from les ignore.
  const raw = Buffer.from(json.content, "base64").toString("utf8");
  let data: T;
  try {
    data = JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`JSON invalide dans ${path}: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { data, sha: json.sha, path: json.path };
}

/**
 * Ecrit un JSON dans le repo. Le SHA doit correspondre a la version que
 * l'appelant a lue et modifiee — sinon GitHub retourne 409 (conflict).
 *
 * Le contenu est serialise avec 2 espaces d'indentation et un newline final
 * pour rester lisible dans les diffs.
 */
export async function writeJson(input: {
  path: string;
  data: unknown;
  sha: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
}): Promise<{ commitSha: string; contentSha: string }> {
  const { headers, owner, repo, branch } = auth();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURI(input.path)}`;

  const serialized = JSON.stringify(input.data, null, 2) + "\n";
  const contentB64 = Buffer.from(serialized, "utf8").toString("base64");

  const body: Record<string, unknown> = {
    message: input.message,
    content: contentB64,
    sha: input.sha,
    branch
  };

  if (input.authorName && input.authorEmail) {
    body.committer = { name: input.authorName, email: input.authorEmail };
    body.author = { name: input.authorName, email: input.authorEmail };
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (res.status === 409 || res.status === 422) {
    throw new Error(
      `Conflit sur ${input.path}: le fichier a change depuis ta derniere lecture. ` +
      `Recharge la page pour recuperer la version courante.`
    );
  }
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status} sur PUT ${input.path}: ${errBody.slice(0, 200)}`);
  }

  const json = (await res.json()) as { commit: { sha: string }; content: { sha: string } };
  return { commitSha: json.commit.sha, contentSha: json.content.sha };
}
