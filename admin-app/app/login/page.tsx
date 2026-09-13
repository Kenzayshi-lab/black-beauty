import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

// Runtime Node explicite — auth() charge auth.ts qui pull Argon2 + ioredis
export const runtime = "nodejs";

/**
 * Page login. Si deja authentifie, redirige vers le dashboard.
 */
export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

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
          <LoginForm />
        </div>

        <footer className="text-center mt-8 text-argent-doux/60 text-xs tracking-[0.15em] uppercase">
          Acces reserve
        </footer>
      </div>
    </main>
  );
}
