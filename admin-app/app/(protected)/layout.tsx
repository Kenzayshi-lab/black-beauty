import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

// Runtime Node explicite — auth.ts pull Argon2 + ioredis (incompatibles Edge)
export const runtime = "nodejs";

/**
 * Layout des routes protegees. Verifie la session cote server;
 * redirige vers /login si absente. Bouton de deconnexion permanent.
 */
export default async function ProtectedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { email?: string; role?: string };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/5 bg-noir-velours">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="block group">
            <p className="text-rose-metal text-[10px] tracking-[0.4em] uppercase mb-1 group-hover:text-rose-poudre transition-colors">
              ✠ Console admin ✠
            </p>
            <h1 className="font-titre text-lg text-argent-givre tracking-wide group-hover:text-white transition-colors">
              Black &amp; Beauty
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-argent-doux text-xs hidden sm:inline">
              {user.email ?? "—"}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-argent-doux text-xs tracking-[0.2em] uppercase border border-white/10 px-3 py-2 hover:border-rose-metal hover:text-rose-metal transition-colors"
              >
                Deconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
