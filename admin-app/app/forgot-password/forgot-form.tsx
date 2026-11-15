"use client";

/**
 * Formulaire de demande de réinitialisation.
 * POST /api/auth/forgot-password avec l'email. La réponse est toujours
 * générique (anti-énumération) : on affiche le même message de succès quoi
 * qu'il arrive, pour ne jamais révéler si un compte existe.
 */

import { useState, useTransition } from "react";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function submit() {
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      // Même en cas d'erreur réseau légère, on affiche le message générique :
      // la route renvoie toujours 200 côté succès fonctionnel.
      if (res.ok) {
        setDone(true);
      } else {
        setError("Une erreur est survenue. Réessaie dans quelques instants.");
      }
    } catch {
      setError("Impossible de contacter le serveur. Vérifie ta connexion.");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => submit());
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-green-300 text-sm bg-green-500/10 border border-green-500/30 rounded p-4">
          Si un compte existe pour cette adresse, un courriel de
          réinitialisation vient d&apos;être envoyé. Vérifie ta boîte de
          réception (et tes indésirables).
        </p>
        <p className="text-argent-doux text-xs">
          Le lien reçu expire dans 30 minutes et ne fonctionne qu&apos;une
          seule fois.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label="Demande de réinitialisation" className="space-y-5">
      <p className="text-argent-doux text-sm">
        Saisis ton courriel. Si un compte existe, tu recevras un lien pour
        choisir un nouveau mot de passe.
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
          htmlFor="email"
          className="block text-argent-doux text-xs tracking-[0.2em] uppercase mb-2"
        >
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

      <button
        type="submit"
        disabled={pending || !email}
        className="w-full bg-rouge-rubis text-rose-poudre font-titre text-xs tracking-[0.25em] uppercase py-4 mt-2 border border-rose-metal/30 hover:bg-rouge-sang disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        aria-busy={pending}
      >
        {pending ? "Envoi..." : "Envoyer le lien"}
      </button>
    </form>
  );
}
