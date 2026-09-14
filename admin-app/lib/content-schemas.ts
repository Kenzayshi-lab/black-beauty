/**
 * Schemas Zod pour les JSON editables de public/content/.
 *
 * Regenerer manuellement si les schemas JSON dans
 * public/content/_schemas/ evoluent. On garde ces schemas ici plutot que
 * d'utiliser ajv sur les JSON Schema, pour rester minimal.
 */

import { z } from "zod";

const NonEmptyStr = (max: number) => z.string().min(1).max(max);
const OptStr = (max: number) => z.string().max(max);
const PriceStr = z.string().max(30); // ex: "30", "5$ – 25$", ou vide

// ---------- home.json ----------

export const HomeSchema = z.object({
  hero: z.object({
    eyebrow:            OptStr(120),
    title:              NonEmptyStr(120),
    tagline:            OptStr(200),
    subtitle:           OptStr(200),
    cta_secondary_text: OptStr(80)
  }).strict(),
  services_section: z.object({
    eyebrow: OptStr(80),
    title:   NonEmptyStr(120)
  }).strict(),
  prices_section: z.object({
    eyebrow: OptStr(80),
    title:   NonEmptyStr(120)
  }).strict(),
  about_teaser: z.object({
    eyebrow: OptStr(80),
    title:   NonEmptyStr(200)
  }).strict(),
  instagram_section: z.object({
    title:    NonEmptyStr(120),
    subtitle: OptStr(200)
  }).strict(),
  policies_section: z.object({
    eyebrow: OptStr(80),
    title:   NonEmptyStr(120)
  }).strict(),
  cta_final: z.object({
    eyebrow:     OptStr(120),
    title:       NonEmptyStr(120),
    script:      OptStr(120),
    button_text: NonEmptyStr(80)
  }).strict()
}).strict();

// ---------- onglerie.json ----------

export const OnglerieSchema = z.object({
  hero: z.object({
    eyebrow:    OptStr(120),
    title:      NonEmptyStr(80),
    script_sub: OptStr(120)
  }).strict(),
  prices_section: z.object({
    eyebrow:     OptStr(120),
    title:       NonEmptyStr(80),
    footer_note: OptStr(200),
    thank_you:   OptStr(120)
  }).strict(),
  longueurs: z.object({
    small:    PriceStr,
    medium:   PriceStr,
    large:    PriceStr,
    xlarge:   PriceStr,
    xxlarge:  PriceStr,
    xxxlarge: PriceStr
  }).strict(),
  extras: z.object({
    title:          OptStr(40),
    nail_art:       PriceStr,
    decorations:    PriceStr,
    matte_top_coat: PriceStr,
    french:         PriceStr
  }).strict(),
  reparations: z.object({
    title:           OptStr(60),
    reparation:      PriceStr,
    depose:          PriceStr,
    depose_ailleurs: PriceStr
  }).strict(),
  portfolio_section: z.object({
    eyebrow: OptStr(60),
    title:   NonEmptyStr(120)
  }).strict()
}).strict();

// ---------- faq.json ----------

export const FaqSchema = z.object({
  hero: z.object({
    eyebrow:    OptStr(120),
    title:      NonEmptyStr(80),
    script_sub: OptStr(120)
  }).strict(),
  reservation: z.object({
    title:         NonEmptyStr(40),
    q_prendre_rdv: OptStr(200),
    q_depot:       OptStr(200),
    q_retard:      OptStr(200),
    q_paiement:    OptStr(200)
  }).strict(),
  onglerie: z.object({
    title:          NonEmptyStr(40),
    q_duree_pose:   OptStr(200),
    q_duree_seance: OptStr(200),
    q_inspiration:  OptStr(200)
  }).strict(),
  epilation: z.object({
    title:       NonEmptyStr(40),
    q_douleur:   OptStr(200),
    q_longueur:  OptStr(200),
    q_frequence: OptStr(200)
  }).strict(),
  studio: z.object({
    title:           NonEmptyStr(40),
    q_adresse:       OptStr(200),
    q_accompagnants: OptStr(200)
  }).strict(),
  cta: z.object({
    text:   OptStr(120),
    button: NonEmptyStr(60)
  }).strict()
}).strict();

export type Home = z.infer<typeof HomeSchema>;
export type Onglerie = z.infer<typeof OnglerieSchema>;
export type Faq = z.infer<typeof FaqSchema>;
