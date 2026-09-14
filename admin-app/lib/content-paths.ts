/**
 * Whitelist stricte des fichiers editables via le proxy GitHub.
 *
 * ⚠️ Modifier cette liste avec precaution: chaque entree autorise
 * l'ecriture d'un fichier du repo public. Un mauvais path pourrait
 * permettre d'ecraser du code source.
 *
 * Regles:
 *   - Uniquement des fichiers JSON dans public/content/
 *   - Pas de traversal (..), pas de chemins absolus
 *   - Le validator est un schema Zod applique au JSON avant ecriture
 */

import { z } from "zod";

// Schema pour theme.json — chaque valeur est une couleur hex OU une valeur
// typographique/geometrique selon le prefixe de la cle.
const HexColor = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Doit etre une couleur hex (#RGB, #RRGGBB, #RRGGBBAA)");
const FontStack = z.string().min(1).max(100);
const CssLength = z.string().regex(/^\d+(\.\d+)?(px|rem|em)$/, "Doit etre une longueur CSS (px, rem, em)");

const ThemeSchema = z.object({
  "--noir-profond":  HexColor,
  "--noir-velours":  HexColor,
  "--noir-marbre":   HexColor,
  "--rouge-rubis":   HexColor,
  "--rouge-sang":    HexColor,
  "--rose-metal":    HexColor,
  "--rose-poudre":   HexColor,
  "--argent-givre":  HexColor,
  "--argent-doux":   HexColor,
  "--titre":         FontStack,
  "--titre-deco":    FontStack,
  "--script":        FontStack,
  "--corps":         FontStack,
  "--r-sm":          CssLength,
  "--r-md":          CssLength,
  "--r-lg":          CssLength
}).strict();

export type Theme = z.infer<typeof ThemeSchema>;

// Whitelist. Cle = path relatif dans le repo, valeur = schema de validation.
// Les chemins listes ici sont les SEULS que le proxy accepte.
export const ALLOWED_CONTENT = {
  "public/content/theme.json": ThemeSchema
} as const satisfies Record<string, z.ZodTypeAny>;

export type AllowedPath = keyof typeof ALLOWED_CONTENT;

/**
 * Normalise et valide un path recu du client.
 * Retourne le path canonique si autorise, null sinon.
 *
 * Rejette:
 *   - Segments contenant "..", "\\", ou vides
 *   - Chemins absolus (commencant par "/")
 *   - Toute cle non listee dans ALLOWED_CONTENT
 */
export function resolveAllowedPath(rawSegments: string[]): AllowedPath | null {
  for (const seg of rawSegments) {
    if (!seg || seg === "." || seg === ".." || seg.includes("\\") || seg.includes("/")) {
      return null;
    }
    // Autorise uniquement: lettres, chiffres, tiret, underscore, point
    if (!/^[A-Za-z0-9._-]+$/.test(seg)) return null;
  }
  const joined = `public/content/${rawSegments.join("/")}`;
  if (joined in ALLOWED_CONTENT) return joined as AllowedPath;
  return null;
}

export function validatorFor(path: AllowedPath): z.ZodTypeAny {
  return ALLOWED_CONTENT[path];
}

/**
 * Read-only: liste les chemins "sources" additionnels que le proxy peut
 * LIRE mais pas ECRIRE (utile pour theme.default.json qu'on veut afficher
 * dans le bouton "Reset couleurs d'origine").
 */
export const ALLOWED_READONLY = new Set<string>([
  "public/content/theme.default.json"
]);

export function resolveReadableOnly(rawSegments: string[]): string | null {
  for (const seg of rawSegments) {
    if (!seg || seg === "." || seg === ".." || seg.includes("\\") || seg.includes("/")) {
      return null;
    }
    if (!/^[A-Za-z0-9._-]+$/.test(seg)) return null;
  }
  const joined = `public/content/${rawSegments.join("/")}`;
  return ALLOWED_READONLY.has(joined) ? joined : null;
}
