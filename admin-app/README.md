# 🎛️ Console admin — Black & Beauty Studio

Application Next.js hebergee sur `admin.blackandbeautystudio.ca`.
Elle permet a Aalie d'editer le contenu du site public (JSON dans
`public/content/` du site principal) sans passer par le code.

**Etat actuel** : bootstrap (structure vide + page login placeholder).
Voir `objectifs-console-admin.md` a la racine du repo pour la roadmap
complete et l'avancement chunk par chunk.

---

## 🚀 Demarrage local (dev)

```bash
cd admin-app
npm install
cp .env.example .env.local
# Renseigner les variables minimums pour du dev :
#   AUTH_SECRET (openssl rand -base64 32)
#   AUTH_URL=http://localhost:3000
# Les autres (KV, GitHub PAT) restent vides tant que chunks 21+ pas faits.
npm run dev
```

Ouvre `http://localhost:3000` — redirige vers `/login`.

---

## 🏗️ Deploiement Vercel (a faire une fois par Louis)

Ce dossier `admin-app/` est destine a etre deploye comme un **projet Vercel
separe** du site public (les deux vivent dans le meme repo GitHub).

Etapes :

1. **Vercel Dashboard** → New Project → Import from GitHub (`Kenzayshi-lab/black-beauty`)
2. Dans les settings du nouveau projet :
   - **Root Directory** : `admin-app`
   - **Framework** : Next.js (auto-detecte)
   - **Node version** : 20 ou plus
3. **Environment Variables** — coller au minimum :
   - `AUTH_SECRET` (32 octets aleatoires)
   - `AUTH_URL=https://admin.blackandbeautystudio.ca`
   - Laisser les autres vides jusqu'aux chunks correspondants
4. **Deploy**.
5. **Domains** → assigner `admin.blackandbeautystudio.ca` a ce nouveau projet
   (le retirer de l'ancien projet public s'il l'a).
6. **Storage** → Connect KV → suivre l'assistant, les 4 variables `KV_*`
   sont ajoutees automatiquement aux env vars.

Une fois deploye, l'URL affichera l'ecran de login placeholder.

---

## 🔒 Securite du bootstrap

Le bootstrap est deja durci :

- **Headers HTTP** (`vercel.json`) : CSP stricte, HSTS preload, X-Frame-Options DENY,
  Cross-Origin-Opener-Policy, X-Robots-Tag noindex, Permissions-Policy restrictive.
- **Meta noindex** dans le layout (ceinture + bretelles).
- **Aucune CDN externe** (fonts et scripts self-hostes des l'ajout).
- **Placeholder** : le formulaire de login est en `disabled`, aucune action possible.

### ⚠️ TODO securite - chunk 21

La CSP actuelle contient `'unsafe-inline'` sur `script-src` — necessaire pour
que Next.js puisse executer ses scripts d'hydration au bootstrap. **C'est un
compromis temporaire acceptable** car :

- React echappe automatiquement le contenu des composants
- Aucune donnee utilisateur n'est rendue au bootstrap (page statique)
- Sera corrige AVANT le formulaire de login fonctionnel (chunk 21)

**Solution definitive (chunk 21)** : middleware.ts qui genere un nonce
cryptographique par requete, puis `script-src 'self' 'nonce-XXX' 'strict-dynamic'`.
Pattern officiel Next.js documente sur
[nextjs.org/docs/.../content-security-policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy).

---

## 📅 Prochains chunks

| # | Contenu |
|---|---|
| 21 | Auth.js + Vercel KV + Argon2 + script CLI `create-user` |
| 22 | 2FA TOTP (enrollment + verification) |
| 23 | Proxy GitHub `/api/gateway/*` avec whitelist paths |
| 24 | Layout admin + ecran Theme |
| 25 | Ecrans par page (Home, Onglerie, Epilation, etc.) |
| 26 | Gestion medias (upload photos) |
| 27 | Audit log + journal connexions + kill switch |
| 28 | Tests E2E + doc cliente |

Voir `../objectifs-console-admin.md` pour le detail complet.
