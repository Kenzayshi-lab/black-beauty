/**
 * Whitelist et validators pour les uploads d'images via /api/media/*.
 *
 * Regles de securite:
 *   - Uniquement les images de galerie insta pour l'instant
 *   - Pattern strict: g<N>.jpg (N >= 1, jusqu'a 4 chiffres)
 *   - Pas de "..", pas de "/", pas de caracteres exotiques
 *   - Extension imposee: .jpg (autres extensions rejetees)
 *
 * Le proxy /api/media verifie aussi:
 *   - MIME reel + magic number (pas de PHP/JS deguises)
 *   - Taille max (2 MB brut)
 *   - Rate limit + session + audit log
 */

const INSTA_PATTERN = /^g([1-9]\d{0,3})\.jpg$/;

/**
 * Retourne le chemin complet si autorise, null sinon.
 * Le rawSegments provient de Next.js catch-all: pour "/api/media/insta/g14.jpg"
 * on recoit ["insta", "g14.jpg"].
 */
export function resolveAllowedMediaPath(rawSegments: string[]): string | null {
  if (rawSegments.length !== 2) return null;
  const [dir, filename] = rawSegments;
  if (dir !== "insta") return null;
  if (!filename || !INSTA_PATTERN.test(filename)) return null;
  return `public/assets/images/${dir}/${filename}`;
}

/**
 * Trouve le prochain nom disponible pour la galerie insta a partir
 * de la liste des noms existants ("g01.jpg", "g13.jpg", ...).
 * Retourne p.ex. "g14.jpg".
 *
 * Le nom est zero-padde sur 2 chiffres si N < 100 (coherent avec l'existant).
 */
export function nextInstaFilename(existing: string[]): string {
  let max = 0;
  for (const name of existing) {
    const m = INSTA_PATTERN.exec(name);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  const next = max + 1;
  return next < 100 ? `g${String(next).padStart(2, "0")}.jpg` : `g${next}.jpg`;
}

// Types MIME acceptes en upload
export const ACCEPTED_MIME = new Set(["image/jpeg", "image/jpg"]);

// Taille max: 2 MB brut (le client compresse a ~200-300 KB en pratique)
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/**
 * Verifie le magic number d'un JPEG: doit commencer par FF D8 FF.
 * Empeche un attaquant d'uploader un fichier avec Content-Type: image/jpeg
 * qui contiendrait en realite du PHP/JS/HTML.
 */
export function isValidJpegMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}
