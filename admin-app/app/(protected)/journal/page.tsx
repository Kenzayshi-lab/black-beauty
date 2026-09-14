/**
 * Page /journal — journal des connexions + kill switch.
 *
 * Affiche les 30 dernieres activites de session de l'utilisateur courant
 * (login.success, login.failure, login.rate_limited, logout). Permet de
 * declencher le kill switch (deconnecter tous les autres appareils).
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { readRecentByUser } from "@/lib/audit-log";
import { JournalView } from "./journal-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionUser = { id?: string; email?: string };

export default async function JournalPage() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) redirect("/login");

  const events = await readRecentByUser(user.id, 30);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-rose-metal text-[10px] tracking-[0.4em] uppercase mb-2">
          ✠ Sécurité & activité ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Journal de mes connexions
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Les 30 dernières activités liées à ton compte
          {user.email ? <> (<code className="text-argent-givre">{user.email}</code>)</> : null}.
          Regarde régulièrement pour repérer une connexion suspecte.
        </p>
      </header>

      <JournalView events={events} />
    </div>
  );
}
