import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Console admin — Black & Beauty Studio",
  description: "Console d'administration privee",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true
  },
  openGraph: { images: [] },
  twitter: { card: "summary" },
  referrer: "no-referrer"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505"
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  // Nonce genere par le middleware — sera applique par Next.js
  // automatiquement a tous les scripts inline qu'il injecte pour
  // l'hydration et le streaming RSC.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="fr">
      <head>
        {nonce ? <meta property="csp-nonce" content={nonce} /> : null}
      </head>
      <body className="font-corps">{children}</body>
    </html>
  );
}
