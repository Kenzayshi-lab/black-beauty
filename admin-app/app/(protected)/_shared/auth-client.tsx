"use client";

/**
 * Pièces client de l'auth Firebase dans la zone protégée :
 *
 *  - <AuthSync/> : garde le cookie de session frais. Firebase rafraîchit l'ID
 *    token ~toutes les heures ; à chaque changement, on le re-dépose côté
 *    serveur. Si l'utilisateur est déconnecté (ailleurs, ou session expirée),
 *    on le renvoie vers /login.
 *
 *  - <LogoutButton/> : déconnexion Firebase + effacement du cookie serveur.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onIdTokenChanged, signOut } from "@firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";

async function syncSession(idToken: string): Promise<void> {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  }).catch(() => {});
}

async function clearSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
}

export function AuthSync() {
  const router = useRouter();
  useEffect(() => {
    const unsub = onIdTokenChanged(firebaseAuth(), async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          await syncSession(token);
        } catch {
          /* ignore */
        }
      } else {
        // Plus de session Firebase -> on nettoie et on renvoie au login.
        await clearSession();
        router.replace("/login");
      }
    });
    return () => unsub();
  }, [router]);
  return null;
}

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    try {
      await signOut(firebaseAuth());
    } catch {
      /* ignore */
    }
    await clearSession();
    router.replace("/login");
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="text-argent-doux text-xs tracking-[0.2em] uppercase border border-white/10 px-3 py-2 hover:border-rose-metal hover:text-rose-metal transition-colors"
    >
      Deconnexion
    </button>
  );
}
