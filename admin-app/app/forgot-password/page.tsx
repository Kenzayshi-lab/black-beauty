/**
 * Page publique /forgot-password — demande de réinitialisation.
 * L'utilisatrice saisit son courriel ; un lien de reset lui est envoyé.
 */

import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <header className="text-center mb-10">
          <p className="text-rose-metal text-xs tracking-[0.4em] uppercase mb-3">
            ✠ Console admin ✠
          </p>
          <h1 className="font-titre text-3xl md:text-4xl text-argent-givre tracking-wide">
            Black &amp; Beauty
          </h1>
          <p className="font-script text-3xl text-rose-metal mt-2">
            mot de passe oublié
          </p>
        </header>

        <div
          className="bg-noir-velours border border-white/5 p-8 md:p-10"
          style={{ boxShadow: "0 20px 60px rgba(161, 11, 27, 0.15)" }}
        >
          <ForgotForm />
        </div>

        <footer className="text-center mt-8">
          <a
            href="/login"
            className="text-argent-doux/60 text-xs tracking-[0.15em] uppercase hover:text-rose-metal transition-colors"
          >
            ← Retour à la connexion
          </a>
        </footer>
      </div>
    </main>
  );
}
