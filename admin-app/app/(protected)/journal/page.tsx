/**
 * Page /journal — activité récente du compte (journal d'audit).
 *
 * Le journal n'est disponible que si une base Redis est configurée. Sinon la
 * liste est vide (l'app fonctionne quand même — c'est une fonctionnalité de
 * confort, pas critique).
 */

import { headers } from "next/headers";
import { readRecentAuditEvents } from "@/lib/audit-log";
import { JournalView } from "./journal-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const email = (await headers()).get("x-user-email") ?? undefined;
  const events = await readRecentAuditEvents(30);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-rose-metal text-[10px] tracking-[0.4em] uppercase mb-2">
          ✠ Sécurité & activité ✠
        </p>
        <h1 className="font-titre text-3xl text-argent-givre tracking-wide">
          Journal d&apos;activité
        </h1>
        <p className="text-argent-doux text-sm mt-2 max-w-2xl">
          Les dernières activités enregistrées
          {email ? <> pour <code className="text-argent-givre">{email}</code></> : null}.
        </p>
      </header>

      <JournalView events={events} />
    </div>
  );
}
