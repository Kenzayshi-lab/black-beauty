# 📋 Passation — Black & Beauty Studio (site + console admin)

> Document de reprise pour toute nouvelle session (Claude Code ou autre dev).
> **Dernière mise à jour : 14 septembre 2026** (après merge PR #18 — chunk 25).

---

## 1. Vue d'ensemble

**Client** : Aalie Joseph — studio privé d'onglerie acrylique + épilation à la
cire à **Montréal (Québec)**.

Deux projets déployés depuis **le même monorepo GitHub** :

| Projet | URL | Vercel project | Root Directory | Runtime |
|---|---|---|---|---|
| **Site public** | `blackandbeautystudio.ca` | `black-beauty` | racine du repo | HTML/CSS/JS pur, aucun build |
| **Console admin** | `admin.blackandbeautystudio.ca` | `bbstudio-admin` | `admin-app/` | Next.js 15 (App Router) |

Repo GitHub : **`Kenzayshi-lab/black-beauty`**. Branche par défaut : **`main`**.

### Style « Gothique moderne & royal »
Fond noir, rouge rubis, rose métal, argent givré, polices **Cinzel** /
**Cinzel Decorative** / **Italianno** / **Montserrat** (Google Fonts).

### Coordonnées officielles (déjà dans le site)

| | |
|---|---|
| Responsable (Loi 25) | **Aalie Joseph** |
| Courriel | **blackandbeauty.studio@gmail.com** |
| Instagram | **@black_and_beauty_studio** (DM : `https://ig.me/m/black_and_beauty_studio`) |
| TikTok | **@blackandbeautystudio** |

---

## 2. Structure du repo

```
/
├── passation.md                    → ce document
├── objectifs-console-admin.md      → feuille de route en 12 phases
├── vercel.json                     → headers HTTP + rewrites du site public
├── docs/
│   ├── liste-exhaustive.md         → catalogue des champs éditables
│   ├── planning-square-integration.md
│   ├── politiques-rdv.md           → 3 politiques (annulation, retard, no-show)
│   └── reset-couleurs.md           → procédure d'urgence
├── public/                         → SITE PUBLIC
│   ├── index.html · onglerie.html · epilation.html · galerie.html
│   ├── apropos.html · faq.html · reservation.html
│   ├── politique-confidentialite.html · politique-securite.html
│   ├── content/                    → JSON éditables via console admin
│   │   ├── site.json · theme.json · theme.default.json
│   │   ├── home.json · onglerie.json · epilation.json
│   │   ├── apropos.json · faq.json · galerie.json · reservation.json
│   │   ├── politique-*.json
│   │   └── _schemas/*.schema.json  → validation JSON Schema draft-07
│   └── assets/
│       ├── styles.css              → tokens CSS via var(--x), color-mix() gradients
│       ├── hydrate.js              → hydratation sécurisée du DOM depuis les JSON
│       ├── decor.js                → menu mobile + liens légaux (auto-init)
│       └── images/                 → logos + galerie insta/g01..g13.jpg
└── admin-app/                      → CONSOLE ADMIN (Next.js 15)
    ├── package.json · next.config.mjs · tsconfig.json · tailwind.config.ts
    ├── vercel.json                 → headers HTTP statiques (CSP dynamique dans middleware)
    ├── .env.example                → template des vars requises
    ├── auth.config.ts              → NextAuthConfig Edge-safe (utilisé par middleware)
    ├── auth.ts                     → NextAuth complet Node (Credentials + Argon2 + Redis)
    ├── proxy.ts                    → Auth.js + CSP nonces dynamiques par requête (Next 16 ; ex-middleware.ts)
    ├── app/
    │   ├── layout.tsx              → root (injecte le nonce dans <meta property="csp-nonce">)
    │   ├── api/auth/[...nextauth]/route.ts → handlers Auth.js
    │   ├── api/content/[...path]/route.ts  → proxy GitHub sécurisé GET/PUT
    │   ├── login/                  → page + formulaire + server action
    │   └── (protected)/            → tout ce qui requiert une session
    │       ├── layout.tsx          → header + bouton déconnexion + logo → dashboard
    │       ├── page.tsx            → dashboard (grille de cartes)
    │       ├── _shared/text-content-editor.tsx → composant générique éditeur JSON
    │       ├── theme/              → éditeur des couleurs (chunk 24)
    │       ├── home/               → éditeur page accueil (chunk 25)
    │       ├── onglerie/           → éditeur page onglerie (chunk 25)
    │       └── faq/                → éditeur des questions FAQ (chunk 25)
    ├── lib/
    │   ├── env.ts                  → validation Zod des vars d'env
    │   ├── redis.ts                → singleton ioredis + helpers KEY
    │   ├── password.ts             → hash/verify Argon2id (OWASP 2024)
    │   ├── ip.ts                   → extraction + hash SHA-256 avec sel (Loi 25)
    │   ├── rate-limit.ts           → INCR+EXPIRE fixed window, fail-open
    │   ├── users.ts                → CRUD utilisateurs Zod
    │   ├── audit-log.ts            → LPUSH+LTRIM+TTL 90j, 8 actions
    │   ├── github.ts               → client GitHub Contents API (SHA locking)
    │   ├── content-paths.ts        → whitelist stricte des paths éditables
    │   └── content-schemas.ts      → schémas Zod pour home/onglerie/faq
    └── scripts/
        └── create-user.ts          → CLI `npm run create-user -- --email X --password Y [--reset]`
```

---

## 3. État d'avancement (source de vérité : `objectifs-console-admin.md`)

### Chunks livrés (mergés sur `main`)

| # | PR | Contenu | Statut |
|---|---|---|---|
| 1-6 | #1-#6 | Site public : responsive, politiques légales, sécurité HTTP, favicon, photos | ✅ |
| 7-19 | multiples | Phase 1 (JSON extraction) + Phase 2 (thème dynamique) | ✅ |
| 20 | #7-#10 | Bootstrap Next.js admin + CSS + login static | ✅ |
| 21 | #11 | Auth.js + Redis + Argon2 + CLI + middleware nonces | ✅ |
| 21b | #12-#16 | Fixes cascadés : split Edge/Node, runtime nodejs, webpack externals, const enum, imports .ts, top-level await CJS | ✅ |
| 23-24 | #17 | Proxy GitHub sécurisé + éditeur de thème (color pickers + preview live) | ✅ |
| 25 | #18 | Éditeurs Home / Onglerie / FAQ (framework `<TextContentEditor>` réutilisable) | ✅ |

### Chunks restants

| # | Contenu | Priorité |
|---|---|---|
| **22** | 2FA TOTP (enrollment + verification + codes de récupération) | 🔴 avant remise à Aalie |
| **25b** | Épilation + Apropos (mêmes patterns qu'Onglerie/Home) | 🟠 rapide |
| **25c** | Politiques (nécessite mini éditeur markdown) | 🟡 |
| **26** | Gestion photos (upload + compression navigateur + galerie) | 🟠 |
| **27** | UI audit log + journal connexions + kill switch | 🟡 |
| **28** | Tests Playwright E2E + doc cliente | 🟢 avant lancement officiel |
| **9bis** | Widget Square Appointments intégré (attente du lien d'Aalie) | 🟡 |

Pour l'état par phase (13 phases dans le fichier objectifs), voir
`objectifs-console-admin.md` — encore désynchronisé avec ce qui est fait
(document non re-coché après chaque chunk).

---

## 4. Comptes & secrets — CE QUI EST DANS VERCEL

### Projet `bbstudio-admin` → Settings → Environment Variables

| Nom | Rôle | Où le trouver |
|---|---|---|
| `AUTH_SECRET` | Signe les JWT de session | généré à la main (`openssl rand -base64 32`) |
| `AUTH_URL` | `https://admin.blackandbeautystudio.ca` | fixe |
| `REDIS_URL` | Upstash Redis (Vercel Storage) | auto via l'intégration Upstash |
| `IP_HASH_SALT` | Sel pour hasher IPs (Loi 25) | généré à la main (`openssl rand -base64 16`) |
| `GITHUB_PAT` | Fine-grained PAT pour écrire dans `public/content/` | GitHub → Settings → Personal access tokens → fine-grained |

**Rotation `GITHUB_PAT`** : tous les 90 jours (expire, à renouveler). Scope
minimal : `Kenzayshi-lab/black-beauty` **uniquement**, permission `Contents:
Read and write` **uniquement**. Rien d'autre.

### Utilisateur admin créé

- Email : `blackandbeauty.studio@gmail.com`
- ID Redis : `5807436d-73f1-4feb-b83a-7b08ccb256e3`
- Rôle : `admin`
- Mot de passe : **transmis à Aalie via canal sécurisé** (Bitwarden Send ou Signal)

---

## 5. Sécurité en place

### Site public (`vercel.json` racine)
HSTS preload 2 ans, X-Frame-Options DENY, X-Content-Type-Options nosniff,
Referrer-Policy no-referrer, Permissions-Policy restrictive,
Cross-Origin-Opener-Policy/Resource-Policy same-origin, `security.txt` RFC 9116.

### Console admin
- **Auth.js v5** — provider Credentials, sessions JWT 15 min avec refresh 5 min
- **Cookies** `__Host-bb.session` : HttpOnly + Secure + SameSite=Strict + `__Host-` prefix
- **Argon2id** (OWASP 2024 : m=64MiB, t=3, p=4, hashLength=32)
- **Rate limit double** : 5 tentatives / 15 min / IP + 10 / 24h / email
- **Timing-safe** : `DUMMY_HASH` si user absent → aucune énumération d'emails par le temps de réponse
- **Middleware CSP** avec nonce cryptographique **par requête** + `strict-dynamic`, plus de `unsafe-inline` sur script-src
- **IP hachée** SHA-256 avec sel dans tous les logs (Loi 25 Québec)
- **Audit log** Redis 90 jours (`LPUSH` + `LTRIM 5000` + `EXPIRE 7776000` par entrée)
- **Proxy GitHub** avec 7 couches : session, whitelist paths (regex stricte, rejet `..`), validation Zod, rate limit 30/5min/user, audit log, optimistic locking SHA, path sanitize

### Ce qui manque (chunk 22 + 27)
- 2FA TOTP
- Détection nouveau device → alerte email
- Kill switch (déconnecter tous les appareils)
- UI journal des connexions

---

## 6. Workflow Git — ⚠️ IMPORTANT

- **Branche de travail** : `claude/elegant-franklin-3xqfjo`
- **Toutes les PR mergées** sont finies — ne JAMAIS empiler de commits sur leur historique
- **Pour repartir sur un nouveau chunk** :

```bash
git fetch origin main
git reset --soft origin/main   # si tu as des commits ahead de main déjà squashés
# ... modifs ...
git add -A
git commit -m "feat(admin): chunk N - description"
git push -u origin claude/elegant-franklin-3xqfjo --force-with-lease
# puis créer PR → merger squash → répéter
```

**Attribution des commits** (imposée par le hook Claude Code) :
```
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017kJx33ReXD6Tv5HdU6DVaz
```

**Attribution des PR** (imposée) :
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_017kJx33ReXD6Tv5HdU6DVaz
```

---

## 7. Comment reprendre le développement

### Étape 1 — Cloner et installer

```bash
git clone https://github.com/Kenzayshi-lab/black-beauty.git
cd black-beauty/admin-app
npm install
```

### Étape 2 — Configurer `.env.local`

```bash
cp .env.example .env.local
# Remplir avec les vraies valeurs :
#   AUTH_SECRET      → openssl rand -base64 32
#   AUTH_URL         → http://localhost:3000
#   REDIS_URL        → copier depuis Vercel bbstudio-admin Settings
#   IP_HASH_SALT     → copier depuis Vercel
#   GITHUB_PAT       → copier depuis Vercel (ou en régénérer un neuf)
```

### Étape 3 — Lancer en local

```bash
npm run dev
# → http://localhost:3000 (redirige vers /login)
```

### Étape 4 — Créer/reset un utilisateur

```bash
npm run create-user -- --email X --password "Y" [--reset]
```

### Étape 5 — Pousser en prod

Merge sur `main` → Vercel redéploie automatiquement les deux projets (site public + admin).

---

## 8. Contraintes d'environnement à connaître

- **Le proxy sortant bloque tous les hôtes Google** (drive.google.com → 403). Pour ajouter des photos : Aalie doit les uploader dans le repo GitHub via l'UI web, PUIS on les optimise (recette dans §9), PUIS on les branche dans le HTML. Le chunk 26 automatisera ça côté admin.
- **Google Fonts** peut échouer dans l'environnement de test (proxy) — c'est normal, marche en prod.
- **`@node-rs/argon2` et `ioredis`** sont marqués `externals` webpack — ne PAS retirer cette config de `next.config.mjs` sinon le build casse (node:crypto, node:diagnostics_channel).
- **`isolatedModules: true`** est actif dans tsconfig → interdit les `const enum` cross-module. Voir `lib/password.ts` (Argon2id = 2 en dur).
- **`scripts/` est exclu du tsconfig Next.js** — le CLI tourne via tsx qui accepte ses propres imports.
- **`tsx` compile en CJS par défaut** → pas de top-level await dans les scripts CLI (mettre dans une fonction `main()`).

---

## 9. Recette : optimiser des photos pour le web

Les photos de galerie sont des **carrés 1080×1080, JPEG qualité 82** (~150–250 Ko).

```python
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
sq = ImageOps.fit(im, (1080,1080), Image.LANCZOS, centering=(0.5,0.45))
sq.save('public/assets/images/insta/gNN.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
```

Emplacements des grilles :
- `index.html` (`.insta-grid`, 6 photos)
- `galerie.html` (`.gallery-grid`, 13 photos)
- `onglerie.html` (`.gallery-strip`, 8 photos)

Ce workflow sera **automatisé côté admin dans le chunk 26** (upload + compression + assignation aux grilles depuis le navigateur).

---

## 10. Tester le responsive du site public

Chromium à `/opt/pw-browsers/chromium`, Playwright global `/opt/node22/lib/node_modules/playwright`.

```bash
cd public && python3 -m http.server 8099 &
# puis Playwright avec viewport {width:360,height:740}
# document.documentElement.scrollWidth - clientWidth → doit valoir 0
```

Objectif : **0 débordement horizontal à 360px** sur toutes les pages (état actuel ✅).

---

## 11. TODOs & points ouverts

### Site public
- 📸 2 photos d'épilation (aisselles) reçues mais NON publiées (intimes) — Aalie décidera
- 🖼️ 1 collage reçu avec filigrane `aaliyah_nailed_it_` — exclu tant qu'Aalie ne confirme pas que c'est son compte
- 🕐 Horaires retirés à la demande (pas de réintégration prévue sauf demande)
- Améliorations possibles : lightbox galerie, section « avant/après » réelle, balises Open Graph

### Console admin
- **CHUNK 22 URGENT avant lancement officiel** : 2FA TOTP obligatoire
- Chunks 25b/25c : Épilation, Apropos, Politiques (markdown)
- Chunk 26 : upload photos
- Chunk 27 : UI audit log + kill switch
- Chunk 28 : tests E2E + guide écrit Aalie
- Écran édition responsive à valider sur téléphone (~360px)
- Ajouter `home.json`, `onglerie.json`, `faq.json` au chunk 27 (audit log par écran)

### Sécurité (Phase 9)
- DNSSEC à activer chez le registrar
- CAA records (Let's Encrypt only)
- SRI sur ressources externes (fonts, si un jour on load des libs CDN)
- Fonts Google en self-host
- HaveIBeenPwned check sur nouveau mot de passe
- Dependabot + npm audit CI + gitleaks pre-commit
- Test Mozilla Observatory (viser A+)

### Loi 25
- Registre des traitements à écrire (`docs/registre-loi25.md`)
- Procédure de bris à la CAI à documenter

### Documentation
- `docs/admin-guide.md` avec captures d'écran (cliente)
- `docs/admin-dev.md` (reprise par autre dev)
- Vidéo screencast 5-7 min sur Google Drive privé

---

## 12. Notes de style (à respecter)

- **Ne pas moderniser** ou changer le thème gothique/textes/décor sans demande explicite — Aalie y tient (retour reçu : « ne dégrade pas le style/déco »)
- **Rester additif** : ajouter des règles responsive plutôt que réécrire le desktop
- **Répondre à Aalie en français** — pas de jargon technique
- **Louis (Kengsley) valide chaque commit** avant push (pattern « je vérifie derrière avant que tu envoies »)

---

## 13. Prochaines actions côté cliente

1. **Aalie** — configurer Square Appointments et envoyer le lien du widget
2. **Aalie** — proposer 2-3 créneaux pour la formation en visio (~1h)
3. **Louis** — planifier la formation, transmettre le mot de passe via canal sécurisé
4. **Louis** — attaquer le chunk 22 (2FA) avant la formation

---

**Fin du document.** En cas de doute, consulter `objectifs-console-admin.md` pour
la vision complète des 12 phases et de leurs critères de « fini ».
