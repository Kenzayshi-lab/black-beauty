# 🎛️ Console admin — Black & Beauty Studio

Application Next.js hebergee sur `admin.blackandbeautystudio.ca`.
Elle permet a Aalie d'editer le contenu du site public (JSON dans
`public/content/` du site principal) sans passer par le code.

**Etat actuel** : chunks 20 (bootstrap) + 21 (auth + Redis + Argon2 + CLI).
Voir `../objectifs-console-admin.md` a la racine du repo pour la roadmap
complete et l'avancement chunk par chunk.

---

## 🚀 Demarrage local (dev)

```bash
cd admin-app
npm install
cp .env.example .env.local
# Renseigner les variables au minimum:
#   AUTH_SECRET      openssl rand -base64 32
#   AUTH_URL         http://localhost:3000
#   REDIS_URL        depuis Vercel > Settings > Environment Variables
#   IP_HASH_SALT     depuis Vercel (ou openssl rand -base64 16 en local)
npm run dev
```

Ouvre `http://localhost:3000` — redirige vers `/login`.

---

## 👤 Creer/reset un utilisateur (CLI)

Le CLI se connecte au Redis defini dans `.env.local` (donc au Redis
de PRODUCTION si tu y as colle les credentials Vercel).

```bash
# Creation
npm run create-user -- --email aalie@example.com --password "MotDePasseFort123!"

# Reset (si le user existe deja)
npm run create-user -- --email aalie@example.com --password "NouveauMdp456!" --reset

# Aide
npm run create-user -- --help
```

**⚠️ Regle** : le mot de passe DOIT etre transmis a Aalie via un canal
securise (Bitwarden Send, Signal, jamais par courriel en clair).
Elle DOIT le changer a sa premiere connexion (fonctionnalite prevue au chunk 22).

---

## 🏗️ Deploiement Vercel (deja fait pour bbstudio-admin)

Ce dossier `admin-app/` est deploye comme un **projet Vercel separe**
du site public (les deux vivent dans le meme repo GitHub).

Config Vercel actuelle:
  - Root Directory: `admin-app`
  - Framework: Next.js
  - Node: 20+

Environment variables Vercel (Settings > Environment Variables):
  - AUTH_SECRET       (chunk 20)
  - AUTH_URL          (chunk 20)
  - REDIS_URL         (Vercel > Storage > Upstash Redis, auto)
  - IP_HASH_SALT      (chunk 21, manuel)
  - GITHUB_PAT        (chunk 21, manuel — utilise au chunk 23)

---

## 🔒 Securite

- **Auth.js v5** — provider Credentials, sessions JWT 15 min, cookies
  `__Host-` + `HttpOnly` + `Secure` + `SameSite=Strict`
- **Argon2id** — parametres OWASP 2024 (m=64MiB, t=3, p=4)
- **Rate limit** double: 5 tentatives / 15 min / IP + 10 tentatives / 24h / email
- **Timing-safe** — meme temps de reponse email inconnu vs mot de passe
  incorrect (evite l'enumeration d'emails)
- **Middleware nonces** — CSP dynamique par requete, `strict-dynamic`
  active, plus de `unsafe-inline` sur script-src
- **IP hachee** dans les logs (Loi 25 Quebec)
- **Audit log** 90 jours (LPUSH+LTRIM+TTL par entree)

### En-tetes HTTP en place

Via `vercel.json` (statiques):
  - HSTS preload 2 ans
  - X-Frame-Options DENY, X-Content-Type-Options nosniff
  - Referrer-Policy no-referrer
  - Permissions-Policy restrictive
  - Cross-Origin-Opener/Resource-Policy same-origin
  - X-Robots-Tag noindex/nofollow/noimageindex

Via `middleware.ts` (dynamique):
  - Content-Security-Policy avec nonce cryptographique par requete
  - script-src 'self' 'nonce-XXX' 'strict-dynamic' (plus de unsafe-inline!)

---

## 📅 Prochains chunks

| # | Contenu |
|---|---|
| 22 | 2FA TOTP (enrollment + verification) |
| 23 | Proxy GitHub `/api/gateway/*` avec whitelist paths |
| 24 | Ecran Theme (color pickers + preview live) |
| 25 | Ecrans par page (Home, Onglerie, Epilation, etc.) |
| 26 | Gestion medias (upload photos) |
| 27 | Audit log UI + journal connexions + kill switch |
| 28 | Tests E2E + doc cliente |

Voir `../objectifs-console-admin.md` pour le detail complet.
