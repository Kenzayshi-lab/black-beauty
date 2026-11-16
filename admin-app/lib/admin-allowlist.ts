/**
 * Liste blanche des courriels autorises a acceder a la console admin.
 *
 * Seuls ces comptes Firebase peuvent se connecter ET ecrire via le proxy
 * GitHub. Meme si quelqu'un cree un compte Firebase sur le projet, il est
 * refuse s'il n'est pas dans cette liste.
 *
 * Pour ajouter un admin : ajoute son courriel ici (minuscules) ET cree
 * l'utilisateur dans la console Firebase (Authentication > Users).
 */

const ALLOWED = new Set<string>([
  "blackandbeauty.studio@gmail.com", // Aalie Joseph (proprietaire)
  "louissaintkengsleys@gmail.com"    // Kengsley (dev / support)
]);

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED.has(email.trim().toLowerCase());
}
