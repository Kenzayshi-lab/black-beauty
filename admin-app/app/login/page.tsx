/**
 * Page de login — PLACEHOLDER (bootstrap).
 *
 * L'authentification n'est pas encore branchee. Ce composant sert a valider
 * le deploiement, la CSP et la mise en page. Le formulaire ne fait rien
 * a la soumission — voir chunk 21 pour l'integration Auth.js.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <header className="text-center mb-10">
          <p className="text-rose text-xs tracking-[0.4em] uppercase mb-3">
            ✠ Studio prive ✠
          </p>
          <h1 className="font-titre text-3xl md:text-4xl text-argent-givre tracking-wide">
            Black &amp; Beauty
          </h1>
          <p className="font-script text-3xl text-rose mt-2">
            console admin
          </p>
        </header>

        <div
          className="bg-noir-velours border border-white/5 p-8 md:p-10"
          style={{ boxShadow: "0 20px 60px rgba(161, 11, 27, 0.15)" }}
        >
          <p
            role="alert"
            className="text-argent-doux text-sm text-center mb-6 border-l-2 border-rubis pl-4 py-2"
          >
            Authentification en cours d&apos;installation. Cette page servira
            au login dans une prochaine mise a jour.
          </p>

          <form aria-label="Formulaire de connexion" className="space-y-5">
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
                disabled
                placeholder="votre@courriel.com"
                className="w-full bg-noir-profond border border-white/10 px-4 py-3 text-argent-givre placeholder:text-argent-doux/40 focus:border-rose focus:outline-none disabled:cursor-not-allowed"
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
                disabled
                placeholder="••••••••"
                className="w-full bg-noir-profond border border-white/10 px-4 py-3 text-argent-givre placeholder:text-argent-doux/40 focus:border-rose focus:outline-none disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full bg-rubis text-rose-poudre font-titre text-xs tracking-[0.25em] uppercase py-4 mt-2 border border-rose/30"
            >
              Se connecter
            </button>
          </form>
        </div>

        <footer className="text-center mt-8 text-argent-doux/60 text-xs tracking-[0.15em] uppercase">
          Acces reserve
        </footer>
      </div>
    </main>
  );
}
