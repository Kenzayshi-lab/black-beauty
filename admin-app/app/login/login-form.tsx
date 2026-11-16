"use client";

/**
 * Formulaire de connexion Firebase.
 *
 *  - Connexion : signInWithEmailAndPassword -> on dépose l'ID token dans un
 *    cookie de session serveur (POST /api/auth/session) -> redirection.
 *  - Mot de passe oublié : sendPasswordResetEmail (Firebase envoie le courriel,
 *    rien à configurer, aucun terminal).
 *
 * Si l'utilisateur est déjà connecté, on redirige directement.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "@firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";

async function postSession(idToken: string): Promise<boolean> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  return res.ok;
}

function frMessage(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Courriel ou mot de passe incorrect.";
    case "auth/invalid-email":
      return "Adresse courriel invalide.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Réessaie dans quelques minutes.";
    case "auth/user-disabled":
      return "Ce compte est désactivé.";
    case "auth/network-request-failed":
      return "Problème de connexion réseau.";
    default:
      return "Connexion impossible. Réessaie.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Déjà connecté ? -> on resynchronise le cookie et on redirige.
  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth(), async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          if (await postSession(token)) router.replace("/");
        } catch {
          /* ignore — l'utilisateur peut se reconnecter manuellement */
        }
      }
    });
    return () => unsub();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      const token = await cred.user.getIdToken();
      const ok = await postSession(token);
      if (!ok) {
        setError("Ce compte n'est pas autorisé pour cette console.");
        setBusy(false);
        return;
      }
      router.replace("/");
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setError(frMessage(code));
      setBusy(false);
    }
  }

  async function onForgot() {
    setError(null);
    setInfo(null);
    const target = email.trim();
    if (!target) {
      setError("Saisis d'abord ton courriel, puis reclique sur « mot de passe oublié ».");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(firebaseAuth(), target);
      setInfo(
        "Si un compte existe pour cette adresse, un courriel de réinitialisation vient d'être envoyé. Vérifie ta boîte (et les indésirables)."
      );
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      // On reste discret pour ne pas révéler l'existence d'un compte.
      if (code === "auth/invalid-email") setError("Adresse courriel invalide.");
      else
        setInfo(
          "Si un compte existe pour cette adresse, un courriel de réinitialisation vient d'être envoyé."
        );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="Formulaire de connexion" className="space-y-5">
      {error && (
        <p role="alert" className="text-rose-poudre text-sm border-l-2 border-rouge-rubis pl-4 py-2 bg-rouge-rubis/10">
          {error}
        </p>
      )}
      {info && (
        <p className="text-green-300 text-sm border-l-2 border-green-500 pl-4 py-2 bg-green-500/10">
          {info}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-argent-doux text-xs tracking-[0.2em] uppercase mb-2">
          Courriel
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@courriel.com"
          className="w-full bg-noir-profond border border-white/10 px-4 py-3 text-argent-givre placeholder:text-argent-doux/40 focus:border-rose-metal focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-argent-doux text-xs tracking-[0.2em] uppercase mb-2">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={4096}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-noir-profond border border-white/10 px-4 py-3 text-argent-givre placeholder:text-argent-doux/40 focus:border-rose-metal focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-rouge-rubis text-rose-poudre font-titre text-xs tracking-[0.25em] uppercase py-4 mt-2 border border-rose-metal/30 hover:bg-rouge-sang disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        aria-busy={busy}
      >
        {busy ? "Connexion..." : "Se connecter"}
      </button>

      <p className="text-center pt-2">
        <button
          type="button"
          onClick={onForgot}
          disabled={busy}
          className="text-argent-doux/70 text-xs tracking-[0.15em] uppercase hover:text-rose-metal transition-colors disabled:opacity-50"
        >
          Mot de passe oublié ?
        </button>
      </p>
    </form>
  );
}
