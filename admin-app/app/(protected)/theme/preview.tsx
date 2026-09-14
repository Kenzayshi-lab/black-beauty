"use client";

/**
 * Preview miniature du site public. Recoit le theme en cours d'edition
 * (Record<string, string>) et applique les valeurs comme variables CSS
 * inline sur le container racine.
 *
 * On ne charge pas les vraies polices Google Fonts (poids ~500KB) — on
 * utilise des stacks systeme avec l'italique/serif approprie pour donner
 * l'idee. La preview reste un mockup, pas un rendu 100% fidele.
 */

import type { CSSProperties } from "react";

type ThemeRecord = Record<string, string>;

function styleFrom(theme: ThemeRecord): CSSProperties {
  const styles: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme)) {
    // On ne pousse dans le style que les couleurs — les polices/rayons
    // sont utilises plus discretement, pas indispensables pour le mockup.
    if (typeof v === "string" && v.length > 0) styles[k] = v;
  }
  return styles as CSSProperties;
}

export function ThemePreview({ theme }: { theme: ThemeRecord }) {
  const style = styleFrom(theme);
  const noirProfond = theme["--noir-profond"] ?? "#050505";
  const noirVelours = theme["--noir-velours"] ?? "#0d0709";
  const rougeRubis = theme["--rouge-rubis"] ?? "#A10B1B";
  const rougeSang = theme["--rouge-sang"] ?? "#6b0510";
  const roseMetal = theme["--rose-metal"] ?? "#E2A9B3";
  const rosePoudre = theme["--rose-poudre"] ?? "#f0c9d1";
  const argentGivre = theme["--argent-givre"] ?? "#D1D5DB";
  const argentDoux = theme["--argent-doux"] ?? "#9ba0a8";

  return (
    <div
      style={{ ...style, borderColor: "rgba(255,255,255,0.1)" }}
      className="border rounded overflow-hidden"
    >
      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${noirProfond} 0%, ${rougeSang} 55%, ${noirVelours} 100%)`
        }}
        className="p-6 text-center"
      >
        <p
          style={{ color: roseMetal, letterSpacing: "0.4em" }}
          className="text-[9px] uppercase mb-2"
        >
          ✠ Studio Prive ✠
        </p>
        <h3
          style={{ color: argentGivre, fontFamily: "'Cinzel', serif" }}
          className="text-2xl mb-2"
        >
          Black &amp; Beauty
        </h3>
        <p
          style={{ color: rosePoudre, fontFamily: "'Italianno', cursive" }}
          className="text-lg italic"
        >
          l&apos;art de la beauté
        </p>
        <button
          type="button"
          disabled
          style={{
            background: rougeRubis,
            color: argentGivre,
            borderColor: rougeRubis,
            letterSpacing: "0.2em"
          }}
          className="mt-4 px-4 py-2 text-[10px] uppercase border cursor-default"
        >
          Réserver
        </button>
      </div>

      {/* Card service */}
      <div style={{ background: noirVelours }} className="p-4">
        <p
          style={{ color: roseMetal, letterSpacing: "0.3em" }}
          className="text-[9px] uppercase mb-1"
        >
          Onglerie
        </p>
        <p
          style={{ color: argentGivre, fontFamily: "'Cinzel', serif" }}
          className="text-sm mb-2"
        >
          Pose gel semi-permanent
        </p>
        <p style={{ color: argentDoux }} className="text-[11px] leading-relaxed mb-3">
          Manucure fine avec produits haute tenue.
        </p>
        <div className="flex items-center justify-between">
          <span style={{ color: rougeRubis }} className="text-sm font-medium">
            55 $
          </span>
          <span
            style={{ color: rosePoudre, letterSpacing: "0.15em" }}
            className="text-[9px] uppercase"
          >
            60 min
          </span>
        </div>
      </div>

      {/* Footer discret */}
      <div
        style={{ background: noirProfond, borderTop: `1px solid ${rougeSang}` }}
        className="p-3 text-center"
      >
        <p
          style={{ color: argentDoux, letterSpacing: "0.2em" }}
          className="text-[9px] uppercase"
        >
          Montréal · Qc
        </p>
      </div>
    </div>
  );
}
