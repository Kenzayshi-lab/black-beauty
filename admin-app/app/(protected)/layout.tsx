import Link from "next/link";
import { headers } from "next/headers";
import { AuthSync, LogoutButton } from "./_shared/auth-client";

// L'accès est garanti par le middleware (Firebase) : si on arrive ici, la
// session est valide et autorisée. On lit l'email vérifié dans l'en-tête.
export const runtime = "nodejs";

export default async function ProtectedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const email = (await headers()).get("x-user-email") ?? undefined;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Garde le cookie de session frais + redirige si déconnecté */}
      <AuthSync />

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
              {email ?? "—"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
