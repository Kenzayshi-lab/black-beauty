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

// ---------- epilation.json ----------

export const EpilationSchema = z.object({
  hero: z.object({
    eyebrow:    OptStr(120),
    title:      NonEmptyStr(80),
    script_sub: OptStr(120)
  }).strict(),
  prices_section: z.object({
    eyebrow: OptStr(120),
    title:   NonEmptyStr(80)
  }).strict(),
  visage: z.object({
    title:            NonEmptyStr(40),
    sourcils:         PriceStr,
    levre_superieure: PriceStr,
    menton:           PriceStr,
    joues:            PriceStr,
    visage_complet:   PriceStr
  }).strict(),
  corps: z.object({
    title:         NonEmptyStr(40),
    aisselles:     PriceStr,
    bras_complets: PriceStr,
    demi_bras:     PriceStr,
    mains_doigts:  PriceStr,
    torse:         PriceStr,
    ventre:        PriceStr,
    bas_dos:       PriceStr,
    dos_complet:   PriceStr
  }).strict(),
  maillot: z.object({
    title:                 NonEmptyStr(40),
    classique:             PriceStr,
    echancre:              PriceStr,
    integral:              PriceStr,
    bresilien:             PriceStr,
    integral_interfessier: PriceStr,
    interfessier:          PriceStr
  }).strict(),
  jambes: z.object({
    title:            NonEmptyStr(40),
    demi_jambes:      PriceStr,
    jambes_completes: PriceStr,
    cuisses:          PriceStr,
    genoux:           PriceStr,
    pieds_orteils:    PriceStr
  }).strict(),
  a_savoir: z.object({
    title:  NonEmptyStr(40),
    line_1: OptStr(200),
    line_2: OptStr(200),
    merci:  OptStr(120)
  }).strict(),
  info_before: z.object({
    eyebrow: OptStr(120),
    title:   NonEmptyStr(120)
  }).strict(),
  info_reserve: z.object({
    eyebrow: OptStr(120),
    title:   NonEmptyStr(120)
  }).strict()
}).strict();

// ---------- apropos.json ----------

const ValueCard = z.object({
  title:       NonEmptyStr(40),
  description: OptStr(400)
}).strict();

export const AproposSchema = z.object({
  hero: z.object({
    eyebrow:    OptStr(120),
    title:      NonEmptyStr(80),
    script_sub: OptStr(120)
  }).strict(),
  story_section: z.object({
    eyebrow:     OptStr(80),
    title:       NonEmptyStr(120),
    paragraph_1: OptStr(800),
    paragraph_2: OptStr(800)
  }).strict(),
  values_section: z.object({
    eyebrow: OptStr(80),
    title:   NonEmptyStr(120)
  }).strict(),
  values: z.object({
    excellence:    ValueCard,
    hygiene:       ValueCard,
    bienveillance: ValueCard
  }).strict(),
  contact_section: z.object({
    eyebrow: OptStr(80),
    title:   NonEmptyStr(120)
  }).strict(),
  contact_card: z.object({
    title:             NonEmptyStr(60),
    label_address:     OptStr(40),
    label_email:       OptStr(40),
    label_appointment: OptStr(40),
    appointment_text:  OptStr(120),
    label_instagram:   OptStr(40),
    label_tiktok:      OptStr(40)
  }).strict(),
  appointment_card: z.object({
    title:       NonEmptyStr(60),
    description: OptStr(400),
    button_text: NonEmptyStr(60)
  }).strict()
}).strict();

// ---------- galerie.json ----------

const PhotoRefSchema = z.object({
  src:  z.string().regex(/^(\/assets\/|https:\/\/)[A-Za-z0-9._/-]+$/, "Doit etre un path /assets/... ou une URL https://").max(500),
  alt:  z.string().min(1, "Le texte alternatif est obligatoire").max(200),
  link: z.string().regex(/^https:\/\//, "Doit etre une URL https://").max(500).optional()
}).strict();

export const GalerieSchema = z.object({
  hero: z.object({
    eyebrow:    OptStr(120),
    title:      NonEmptyStr(80),
    script_sub: OptStr(120)
  }).strict(),
  intro: OptStr(500),
  instagram_button_text: OptStr(60),
  cta_final: z.object({
    eyebrow:     OptStr(120),
    title:       NonEmptyStr(120),
    description: OptStr(400),
    button_text: NonEmptyStr(60)
  }).strict(),
  photos: z.array(PhotoRefSchema).max(200)
}).strict();

// ---------- site.json (identite globale du studio) ----------

const InstagramHandle = z.string().regex(/^@[a-zA-Z0-9_.]{1,30}$/, "Doit commencer par @ (max 30 caracteres).");
const InstagramUrl = z.string().regex(/^https:\/\/www\.instagram\.com\//, "Doit etre une URL https://www.instagram.com/...");
const InstagramDm = z.string().regex(/^https:\/\/ig\.me\/m\//, "Doit etre une URL https://ig.me/m/...");
const TiktokUrl = z.string().regex(/^https:\/\/www\.tiktok\.com\//, "Doit etre une URL https://www.tiktok.com/...");
const HttpsUrl = z.string().regex(/^https:\/\//, "Doit etre une URL https://").max(500);
const MailtoHref = z.string().regex(/^mailto:/, "Doit commencer par mailto:").max(500);

export const SiteSchema = z.object({
  name:              NonEmptyStr(120),
  tagline:           OptStr(200),
  city:              OptStr(80),
  email:             z.string().email().max(200),
  email_href:        MailtoHref,
  instagram_handle:  InstagramHandle,
  instagram_url:     InstagramUrl,
  instagram_dm:      InstagramDm,
  tiktok_handle:     InstagramHandle,
  tiktok_url:        TiktokUrl,
  square_url:        HttpsUrl,
  responsable_loi25: OptStr(120)
}).strict();

// ---------- reservation.json ----------

export const ReservationSchema = z.object({
  hero: z.object({
    eyebrow:    OptStr(120),
    title:      NonEmptyStr(80),
    script_sub: OptStr(120)
  }).strict(),
  reserv_section: z.object({
    eyebrow: OptStr(120),
    title:   NonEmptyStr(80)
  }).strict(),
  how_to: z.object({
    eyebrow: OptStr(120),
    title:   NonEmptyStr(200)
  }).strict(),
  policies_section: z.object({
    eyebrow: OptStr(120),
    title:   NonEmptyStr(80)
  }).strict(),
  policies: z.object({
    depot:      NonEmptyStr(60),
    retard:     NonEmptyStr(60),
    paiement:   NonEmptyStr(60),
    annulation: NonEmptyStr(60)
  }).strict()
}).strict();

// ---------- politique-confidentialite.json ----------

export const PolitiqueConfidentialiteSchema = z.object({
  hero: z.object({
    eyebrow:    OptStr(120),
    title:      NonEmptyStr(120),
    script_sub: OptStr(120)
  }).strict(),
  meta: z.object({
    last_update: OptStr(40),
    toc_title:   OptStr(60)
  }).strict()
}).strict();

// ---------- politique-securite.json ----------

export const PolitiqueSecuriteSchema = z.object({
  hero: z.object({
    eyebrow:    OptStr(120),
    title:      NonEmptyStr(120),
    script_sub: OptStr(120)
  }).strict(),
  meta: z.object({
    last_update: OptStr(40)
  }).strict()
}).strict();

export type Home = z.infer<typeof HomeSchema>;
export type Onglerie = z.infer<typeof OnglerieSchema>;
export type Faq = z.infer<typeof FaqSchema>;
export type Epilation = z.infer<typeof EpilationSchema>;
export type Apropos = z.infer<typeof AproposSchema>;
export type Galerie = z.infer<typeof GalerieSchema>;
export type PhotoRef = z.infer<typeof PhotoRefSchema>;
export type Reservation = z.infer<typeof ReservationSchema>;
export type PolitiqueConfidentialite = z.infer<typeof PolitiqueConfidentialiteSchema>;
export type PolitiqueSecurite = z.infer<typeof PolitiqueSecuriteSchema>;
export type Site = z.infer<typeof SiteSchema>;
