# 📋 Passation — Site Black & Beauty Studio

> Document de reprise pour une nouvelle session (Claude Code ou autre dev).
> Dernière mise à jour : 13 septembre 2026.

---

## 1. Le projet en bref

Site **vitrine statique** pour **Black & Beauty Studio** — studio privé d'onglerie
acrylique et d'épilation à la cire à **Montréal (Québec)**.

- **Type** : HTML/CSS/JS pur (aucun framework, aucune étape de build).
- **Hébergement** : **Vercel** (déploiement automatique à chaque merge sur `main`).
- **Domaine** : `blackandbeautystudio.ca`
- **Style** : « Gothique moderne & royal » — fond noir, rouge rubis, rose métal,
  polices Cinzel / Cinzel Decorative / Italianno / Montserrat (Google Fonts).

### Coordonnées officielles (déjà dans le site)
| | |
|---|---|
| Responsable (Loi 25) | **Aalie Joseph** |
| Courriel | **blackandbeauty.studio@gmail.com** |
| Instagram | **@black_and_beauty_studio** (DM : `https://ig.me/m/black_and_beauty_studio`) |
| TikTok | **@blackandbeautystudio** |

---

## 2. Structure des fichiers

```
/
├── vercel.json              → rewrites (cleanUrls) + en-têtes de sécurité HTTP
├── passation.md             → ce document
└── public/
    ├── index.html           → Accueil (hero, services, aperçu prix, Instagram…)
    ├── onglerie.html        → Tarifs onglerie + portfolio « Quelques créations »
    ├── epilation.html       → Tarifs épilation (affiche « Waxing »)
    ├── galerie.html         → Galerie photo (13 réalisations)
    ├── apropos.html         → Histoire, valeurs, coordonnées
    ├── faq.html             → Questions fréquentes
    ├── reservation.html     → Réservation via Instagram + politiques
    ├── politique-confidentialite.html  → Conforme Loi 25 (Québec)
    ├── politique-securite.html         → Mesures + divulgation responsable
    ├── favicon.ico, site.webmanifest, .well-known/security.txt
    └── assets/
        ├── styles.css       → design system global + responsive
        ├── decor.js         → animations + MENU MOBILE + liens légaux (injectés)
        └── images/
            ├── logo.png, logo_nobg.png, affiche-*.jpg, gallery-1/2.jpg
            ├── favicon-*, icon-192/512, apple-touch-icon
            └── insta/g01.jpg … g13.jpg  → 13 photos optimisées (carré 1080px)
```

### Points d'architecture importants
- **Chaque page** charge `styles.css` puis a un `<style>` inline pour ses styles
  spécifiques, puis charge `decor.js` en fin de `<body>`.
- **`decor.js` est partagé et auto-initialisé** : il construit le **menu mobile
  (hamburger)** à partir des `.nav-links` existants (donc AUCUNE modif du HTML de
  nav nécessaire) et injecte les **liens légaux** (Confidentialité · Sécurité)
  dans chaque `.footer-bottom`. Fonctions clés : `initMobileNav()`,
  `initLegalFooterLinks()`, `seedAmbiance()`, `initFadeUps()`, `setActiveNav()`.
- **Nav identique sur toutes les pages** ; chaque page appelle
  `setActiveNav('<page>')` dans son script inline.
- **Breakpoints responsive** : global à `900px` (menu mobile), plus des règles
  `600px` / `560px` pour les petits téléphones (ex. Samsung A7 ~360px).

---

## 3. Ce qui a été fait (PR #1 → #6, toutes mergées)

1. **Responsive** — menu mobile hamburger (était totalement absent), logo hero
   redimensionné, corrections de débordement.
2. **Politiques légales** — pages Confidentialité (Loi 25) + Sécurité, liens en
   pied de page.
3. **Cybersécurité** — en-têtes HTTP dans `vercel.json` (CSP, HSTS,
   X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy,
   COOP) + `/.well-known/security.txt` (RFC 9116).
4. **Favicon** + icônes PWA + `site.webmanifest`.
5. **Coordonnées** — courriel cliquable (objet pré-rempli), Instagram, TikTok.
6. **Photos** — 13 réalisations intégrées : grille Instagram accueil (6), galerie
   (13), portfolio onglerie (8). Chaque photo est cliquable vers Instagram.
7. **Heures d'ouverture retirées** (remplacées par une carte « Prendre rendez-vous »).
8. **Corrections mobile ~360px** — titres « Waxing »/onglerie qui étaient coupés.

---

## 4. Workflow Git ⚠️ IMPORTANT

- **Branche de dev** : `claude/site-responsive-design-ajovh6`
- **Toutes les PR ouvertes jusqu'ici (#1–#6) sont déjà MERGÉES dans `main`.**
- **Une PR mergée est terminée** — ne JAMAIS empiler de nouveaux commits sur son
  historique. Pour tout nouveau travail, **repartir de `main` à jour** :

  ```bash
  git fetch origin main
  git checkout -B claude/site-responsive-design-ajovh6 origin/main
  # ... modifs ...
  git add -A && git commit -m "..."
  git push -u origin claude/site-responsive-design-ajovh6
  # puis ouvrir une NOUVELLE PR vers main et la merger
  ```
- **Déploiement** : le merge sur `main` déclenche Vercel automatiquement.
  Rien à lancer à la main. (Prévoir un rafraîchissement/vidage de cache navigateur.)

---

## 5. ⚠️ Contraintes d'environnement (à connaître absolument)

- **Le proxy sortant bloque tous les hôtes Google** (drive.google.com, etc. → 403).
  Impossible de télécharger depuis Google Drive en direct.
- **Le connecteur Google Drive renvoie du base64** dans le contexte, mais le
  ré-écrire sur disque est **non fiable** (données corrompues sur >quelques Ko).
- **➡️ Pour AJOUTER DES PHOTOS** : la cliente doit les **uploader dans le dépôt
  GitHub** (via github.com → `public/assets/images` → « Add file » → « Upload files »).
  Ensuite : `git pull`, puis les **optimiser** (voir §6) et les brancher dans le HTML.
- **Google Fonts** peut échouer dans l'environnement de test (proxy) — c'est normal,
  ça marche en production.

---

## 6. Recette : optimiser des photos pour le web

Les photos de galerie sont des **carrés 1080×1080, JPEG qualité 82** (~150–250 Ko).
Script type (avec Pillow, `pip install Pillow` si besoin) :

```python
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
sq = ImageOps.fit(im, (1080,1080), Image.LANCZOS, centering=(0.5,0.45))
sq.save('public/assets/images/insta/gNN.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
```

Puis référencer dans le HTML : tuile = `<a class="gallery-item" href="<IG>"
target="_blank" rel="noopener"><img src="/assets/images/insta/gNN.jpg" alt="…"
loading="lazy"></a>`. Emplacements des grilles : `index.html` (`.insta-grid`, 6),
`galerie.html` (`.gallery-grid`, 13), `onglerie.html` (`.gallery-strip`, 8).

---

## 7. Tester le responsive (Playwright déjà installé)

Chromium est à `/opt/pw-browsers/chromium`, Playwright en global sous
`/opt/node22/lib/node_modules/playwright`. Servir le site puis mesurer le
débordement horizontal :

```bash
cd public && python3 -m http.server 8099 &
# script CommonJS : require('/opt/node22/lib/node_modules/playwright/index.js')
# newPage({viewport:{width:360,height:740}}) ; goto('http://localhost:8099/<page>.html')
# document.documentElement.scrollWidth - clientWidth  → doit valoir 0
```
Objectif : **0 débordement** à 360px sur toutes les pages (état actuel : ✅).

---

## 8. Points ouverts / TODO possibles

- 📸 **2 photos d'épilation (aisselles)** reçues mais NON publiées (intimes) — la
  cliente peut vouloir les mettre sur la page Épilation en « résultat ».
- 🖼️ **1 collage** reçu avec le filigrane « **aaliyah_nailed_it_** » (autre pseudo) —
  exclu tant que la cliente ne confirme pas que c'est son compte.
- 🕐 Les **horaires** ont été retirés à la demande de la cliente (pas de réintégration
  prévue sauf nouvelle demande).
- 💡 Améliorations futures possibles : lightbox sur la galerie, section
  « avant/après » réelle (dès qu'il y a des paires), balises Open Graph pour le
  partage sur réseaux sociaux.

---

## 9. Notes de style (à respecter)

- Ne pas « moderniser » ou changer le thème gothique/textes/décor sans demande
  explicite — la cliente y tient (retour reçu : « ne dégrade pas le style/déco »).
- Rester **additif** : ajouter des règles responsive/mobiles plutôt que réécrire
  le desktop.
- Répondre à la cliente en **français**.
