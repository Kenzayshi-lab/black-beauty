"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-rouge-rubis text-rose-poudre font-titre text-xs tracking-[0.25em] uppercase py-4 mt-2 border border-rose-metal/30 hover:bg-rouge-sang disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      aria-busy={pending}
    >
      {pending ? "Connexion..." : "Se connecter"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} aria-label="Formulaire de connexion" className="space-y-5">
      {state.error && (
        <p
          role="alert"
          className="text-rose-poudre text-sm border-l-2 border-rouge-rubis pl-4 py-2 bg-rouge-rubis/10"
        >
          {state.error}
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
          placeholder="votre@courriel.com"
          className="w-full bg-noir-profond border border-white/10 px-4 py-3 text-argent-givre placeholder:text-argent-doux/40 focus:border-rose-metal focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-argent-doux text-xs tracking-[0.2em] uppercase mb-2"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={4096}
          placeholder="••••••••"
          className="w-full bg-noir-profond border border-white/10 px-4 py-3 text-argent-givre placeholder:text-argent-doux/40 focus:border-rose-metal focus:outline-none"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
