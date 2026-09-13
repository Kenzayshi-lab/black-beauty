"use server";

/**
 * Server action pour le formulaire de login.
 * Delegue a Auth.js signIn() qui appellera authorize() dans auth.ts.
 *
 * Retourne un objet { error: string } pour l'affichage cote UI.
 */

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Courriel et mot de passe requis." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/"
    });
    // signIn effectue une redirection — cette ligne n'est jamais atteinte.
    return { error: null };
  } catch (err) {
    // Auth.js throw AuthError sur echec — on catche et on renvoie un message generique
    // (jamais d'info sur si l'email existe ou pas, pour eviter l'enumeration).
    if (err instanceof AuthError) {
      return { error: "Courriel ou mot de passe incorrect." };
    }
    // Re-throw les redirections Next.js (comportement normal)
    throw err;
  }
}
