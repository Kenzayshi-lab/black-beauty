import Link from "next/link";
import { auth } from "@/auth";

export const runtime = "nodejs";

type SectionCard = {
  title: string;
  desc: string;
  href?: string;
};

/**
 * Dashboard - liste des ecrans de gestion.
 * L'ecran Theme (chunk 24) est actif; les autres arriveront aux chunks 25-27.
 */
export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as { email?: string } | undefined;

  const sections: SectionCard[] = [
    { title: "Theme",     desc: "Couleurs et polices",         href: "/theme" },
    { title: "Accueil",   desc: "Textes de la page d'accueil", href: "/home" },
    { title: "Onglerie",  desc: "Textes et prix",              href: "/onglerie" },
    { title: "Epilation", desc: "Textes et prix",              href: "/epilation" },
    { title: "À propos",  desc: "Histoire, valeurs, contact",  href: "/apropos" },
    { title: "FAQ",       desc: "Questions frequentes",        href: "/faq" },
    { title: "Galerie",   desc: "Photos" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <p className="text-rose-metal text-xs tracking-[0.4em] uppercase mb-3">
          ✠ Bienvenue ✠
        </p>
        <h2 className="font-titre text-2xl md:text-3xl text-argent-givre mb-4">
          Bonjour {user?.email?.split("@")[0] ?? "Aalie"}
        </h2>
        <p className="text-argent-doux text-sm max-w-xl mx-auto">
          Votre console d&apos;administration est prete. Les ecrans de gestion
          (theme, contenu, prix, photos) arriveront dans les prochaines mises a jour.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sections.map((item) => {
          const cardClass =
            "border p-5 h-full transition-colors " +
            (item.href
              ? "border-white/10 bg-noir-velours hover:border-rose-metal/40 hover:bg-noir-marbre cursor-pointer"
              : "border-white/5 bg-noir-velours opacity-50 cursor-not-allowed");
          const content = (
            <>
              <h3 className="font-titre text-argent-givre text-sm tracking-wider uppercase mb-1">
                {item.title}
              </h3>
              <p className="text-argent-doux text-xs">{item.desc}</p>
              {!item.href && (
                <p className="text-rose-metal/60 text-[10px] tracking-[0.3em] uppercase mt-3">
                  a venir
                </p>
              )}
            </>
          );

          return item.href ? (
            <Link key={item.title} href={item.href} className={cardClass}>
              {content}
            </Link>
          ) : (
            <div key={item.title} className={cardClass} aria-disabled="true">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
