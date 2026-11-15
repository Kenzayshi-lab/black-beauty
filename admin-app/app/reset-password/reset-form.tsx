"use client";

/**
 * Formulaire de choix du nouveau mot de passe.
 * POST /api/auth/reset-password avec { token, password }.
 * Double saisie pour éviter les typos. Sur succès, propose de se connecter.
 */

import { useState, useTransition } from "react";

const MIN_LENGTH = 12;

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const missingToken = !token;

  async function submit() {
    setError(null);
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < MIN_LENGTH) {
      setError(`Le mot de passe doit faire au moins ${MIN_LENGTH} caractères.`);
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error ?? `Erreur HTTP ${res.status}`);
      }
    } catch {
      setError("Impossible de contacter le serveur. Vérifie ta connexion.");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => submit());
  }

  if (missingToken) {
    return (
      <div className="text-center space-y-4">
        <p className="text-rose-poudre text-sm border-l-2 border-rouge-rubis pl-4 py-2 bg-rouge-rubis/10 text-left">
          Lien invalide : aucun jeton de réinitialisation trouvé. Utilise le
          lien complet reçu par courriel, ou demande-en un nouveau.
        </p>
        <a
          href="/forgot-password"
          className="inline-block text-rose-metal text-xs tracking-[0.2em] uppercase underline underline-offset-4 hover:text-rose-poudre"
        >
          Demander un nouveau lien
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-5">
        <p className="text-green-300 text-sm bg-green-500/10 border border-green-500/30 rounded p-4">
          ✅ Mot de passe réinitialisé. Toutes tes anciennes sessions ont été
          déconnectées par sécurité.
        </p>
        <a
          href="/login"
          className="inline-block w-full bg-rouge-rubis text-rose-poudre font-titre text-xs tracking-[0.25em] uppercase py-4 border border-rose-metal/30 hover:bg-rouge-sang transition-colors"
        >
          Se connecter
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label="Nouveau mot de passe" className="space-y-5">
      <p className="text-argent-doux text-sm">
        Choisis un nouveau mot de passe (au moins {MIN_LENGTH} caractères).
      </p>

      {error && (
        <p
          role="alert"
          className="text-rose-poudre text-sm border-l-2 border-rouge-rubis pl-4 py-2 bg-rouge-rubis/10"
        >
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-argent-doux text-xs tracking-[0.2em] uppercase mb-2"
        >
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_LENGTH}
          maxLength={4096}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full bg-noir-profond border border-white/10 px-4 py-3 text-argent-givre placeholder:text-argent-doux/40 focus:border-rose-metal focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="block text-argent-doux text-xs tracking-[0.2em] uppercase mb-2"
        >
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_LENGTH}
          maxLength={4096}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••••••"
          className="w-full bg-noir-profond border border-white/10 px-4 py-3 text-argent-givre placeholder:text-argent-doux/40 focus:border-rose-metal focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending || !password || !confirm}
        className="w-full bg-rouge-rubis text-rose-poudre font-titre text-xs tracking-[0.25em] uppercase py-4 mt-2 border border-rose-metal/30 hover:bg-rouge-sang disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        aria-busy={pending}
      >
        {pending ? "Enregistrement..." : "Réinitialiser mon mot de passe"}
      </button>
    </form>
  );
}
