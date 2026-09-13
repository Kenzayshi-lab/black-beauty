import { redirect } from "next/navigation";

/**
 * Racine de l'admin.
 * A ce stade (bootstrap), l'auth n'est pas encore branchee — on redirige
 * simplement vers /login. Une fois Auth.js integre (chunk 21), cette route
 * verifiera la session et renverra soit vers /login soit vers le dashboard.
 */
export default function Home() {
  redirect("/login");
}
