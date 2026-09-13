import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Console admin — Black & Beauty Studio",
  description: "Console d'administration privee",
  // Ceinture + bretelles : noindex meta en plus des headers HTTP.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true
  },
  // Empeche les previews de lien (WhatsApp, iMessage, etc.)
  openGraph: { images: [] },
  twitter: { card: "summary" },
  referrer: "no-referrer"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="font-corps">{children}</body>
    </html>
  );
}
