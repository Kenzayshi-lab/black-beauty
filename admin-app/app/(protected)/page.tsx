import { auth } from "@/auth";

export const runtime = "nodejs";

/**
 * Dashboard - placeholder pour l'instant.
 * Les ecrans reels (Theme, Home, Onglerie, etc.) arriveront aux chunks 24-26.
 */
export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as { email?: string } | undefined;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <p className="text-rose text-xs tracking-[0.4em] uppercase mb-3">
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
        {[
          { title: "Theme", desc: "Couleurs et polices" },
          { title: "Accueil", desc: "Textes et sections" },
          { title: "Onglerie", desc: "Services et prix" },
          { title: "Epilation", desc: "Services et prix" },
          { title: "Galerie", desc: "Photos" },
          { title: "FAQ", desc: "Questions frequentes" }
        ].map((item) => (
          <div
            key={item.title}
            className="border border-white/5 bg-noir-velours p-5 opacity-50 cursor-not-allowed"
            aria-disabled="true"
          >
            <h3 className="font-titre text-argent-givre text-sm tracking-wider uppercase mb-1">
              {item.title}
            </h3>
            <p className="text-argent-doux text-xs">{item.desc}</p>
            <p className="text-rose/60 text-[10px] tracking-[0.3em] uppercase mt-3">
              a venir
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
