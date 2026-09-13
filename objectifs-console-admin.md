# 🎯 Objectifs — Console Admin Black & Beauty Studio

> Feuille de route **complète et honnête** pour livrer une console d'administration
> de niveau professionnel à Aalie. Chaque case cochée = travail **réellement fait,
> testé et validé** — pas de raccourci, pas de stub, pas de « ça devrait marcher ».
>
> Règle d'or : **rien n'est coché tant que ce n'est pas prouvé en production.**

---

## 📌 Définitions de « fini »

Un objectif est considéré comme terminé **uniquement si** :
1. Le code est mergé sur `main` et déployé sur Vercel.
2. Il a été testé sur **au moins 3 navigateurs** (Chrome, Firefox, Safari iOS).
3. Il a été testé sur **au moins 3 tailles d'écran** (360 px, 768 px, 1440 px).
4. Aalie l'a **essayé elle-même** et confirmé que ça répond à son besoin.
5. La documentation cliente est à jour.
6. Aucune erreur console, aucun avertissement critique Lighthouse.

---

## 🏗️ Phase 0 — Cadrage & décisions

**Statut** : décisions verrouillées le 13 septembre 2026.

- [x] Réunion avec Aalie faite (hors ligne, avant cette session).
- [x] **Architecture** : Decap CMS (git-based, gratuit, garde le stack statique Vercel actuel).
- [x] **Auth** : email + mot de passe **100 % custom** (voie 2 — Auth.js + Vercel KV, aucun compte GitHub côté cliente).
- [x] **URL admin** : sous-domaine `admin.blackandbeautystudio.ca`.
- [ ] Liste exhaustive et écrite des champs éditables (`docs/liste-exhaustive.md`) — **en cours, à finaliser avec la cliente**.
- [ ] DNS : ajout d'un `CNAME admin` pointant vers Vercel chez le registrar du domaine.
- [ ] Configuration Vercel : ajout du domaine `admin.blackandbeautystudio.ca` au projet (ou projet séparé dédié à l'admin).
- [ ] Création d'un **GitHub PAT fine-grained** (nom : `bbstudio-admin-writer`), scope limité au seul repo `Kenzayshi-lab/black-beauty`, permission `contents: write` uniquement, expiration 90 jours avec rotation planifiée.
- [ ] Provisionnement de **Vercel KV** (tier gratuit) — clé `USERS`, `SESSIONS`, `RATE_LIMITS`, `AUDIT_LOG`.
- [ ] Variables d'environnement Vercel à créer : `GITHUB_PAT`, `AUTH_SECRET` (32 octets aléatoires), `SESSION_TTL`, `KV_URL`, `KV_REST_API_TOKEN`.
- [ ] Compte-rendu écrit envoyé par courriel à Aalie et archivé dans le repo (`docs/cadrage.md`).
- [ ] Approbation écrite de la cliente avant de démarrer la Phase 1.

---

## 🧩 Phase 1 — Extraction du contenu vers JSON

**But** : sortir tout le contenu éditable du HTML pour le rendre pilotable.

- [ ] Créer `public/content/` avec un fichier par domaine :
  - [ ] `site.json` (identité, coordonnées, réseaux sociaux)
  - [ ] `theme.json` (couleurs, polices, tailles, ombres)
  - [ ] `home.json` (hero, sections accueil, CTA)
  - [ ] `onglerie.json` (services, prix, descriptions, durée)
  - [ ] `epilation.json` (services, prix, descriptions, durée)
  - [ ] `apropos.json` (histoire, valeurs, équipe)
  - [ ] `faq.json` (liste de Q/R)
  - [ ] `gallery.json` (liste photos avec `src`, `alt`, `lien IG`)
  - [ ] `reservation.json` (politiques, contact)
- [ ] Chaque JSON est **schématisé** (JSON Schema dans `public/content/_schemas/`).
- [ ] Créer `public/assets/hydrate.js` — lit les JSON et remplit les zones marquées `data-cms="path.to.field"`.
- [ ] Marquer chaque zone éditable dans les 9 pages HTML avec les bons `data-cms`.
- [ ] Tester : chaque page charge le contenu **identique à l'actuel** après hydratation.
- [ ] Fallback : si `content/*.json` ne charge pas, le contenu par défaut reste dans le HTML (dégradation gracieuse).
- [ ] Vérification Lighthouse : **pas de régression** de performance (CLS < 0.1, LCP < 2.5 s).

---

## 🎨 Phase 2 — Thème dynamique via variables CSS

- [ ] Refondre `styles.css` pour n'utiliser **que** des `var(--…)` sur toutes les couleurs.
- [ ] Toutes les polices exposées comme `--font-title`, `--font-body`, `--font-script`.
- [ ] Espacements et rayons de bordure exposés comme variables.
- [ ] `hydrate.js` injecte les valeurs de `theme.json` dans `document.documentElement.style`.
- [ ] Test : changer `--color-primary` dans `theme.json` → toute la charte suit.
- [ ] Vérifier contraste **WCAG AA** (ratio ≥ 4.5:1 texte, ≥ 3:1 gros texte) sur toute palette générée — bloquer les combinaisons illisibles côté admin.
- [ ] Mode « prévisualisation » utilisable sans sauvegarder.

---

## 🔐 Phase 3 — Authentification custom (Auth.js + Vercel KV)

**Voie 2 retenue** : login 100 % maison, aucun compte GitHub côté cliente.

**Stack** :
- Framework : Next.js 15 (App Router) sur `admin.blackandbeautystudio.ca` — projet Vercel séparé.
- Auth : Auth.js (ex-NextAuth) v5, provider `Credentials`.
- Storage utilisateurs / sessions : Vercel KV (Upstash Redis sous le capot).
- Hash mots de passe : Argon2id (paramètres OWASP 2024 : `t=3, m=64 MiB, p=4`).

**Livrables** :
- [ ] Bootstrap Next.js dans `/admin-app/` (nouveau dossier, projet Vercel séparé du site public).
- [ ] Route `/api/auth/[...nextauth]` avec provider `Credentials` — email + mot de passe.
- [ ] Table KV `USERS` : `{ id, email, passwordHash, role, mfaSecret?, createdAt, lastLogin }`.
- [ ] Script CLI (`scripts/create-user.mjs`) pour créer/réinitialiser un utilisateur — jamais de UI publique de signup.
- [ ] Middleware Next.js qui protège toutes les routes sauf `/login` et les assets publics.
- [ ] Session JWT signée avec `AUTH_SECRET`, TTL 15 min, refresh silencieux via cookie `Secure` 24 h.
- [ ] Cookies session : `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `__Host-` prefix.
- [ ] Rate limit sur `/api/auth/callback/credentials` : 5 tentatives / 15 min / IP (Vercel KV avec TTL).
- [ ] Rate limit sur `/api/auth/callback/credentials` : 10 tentatives / 24 h / email (verrouillage temporaire).
- [ ] **2FA (TOTP)** obligatoire — activation forcée à la 1re connexion (secret stocké chiffré côté KV).
- [ ] Écran de récupération : uniquement par toi (Louis) — pas de « mot de passe oublié » automatique, pour éviter le pishing.
- [ ] Bouton **Déconnexion** visible en permanence dans le layout admin.
- [ ] Test : accès direct à `/admin`, `/api/gateway/*` sans session → 401 + redirection login.
- [ ] Audit log dans KV : `{ userId, action, target, ip, userAgent, timestamp }` — toute écriture GitHub tracée.
- [ ] Rétention audit 90 jours (Loi 25) — job cron Vercel qui purge les entrées plus vieilles.
- [ ] Rotation du `GITHUB_PAT` tous les 90 j — procédure écrite dans `docs/rotation-secrets.md`.
- [ ] Aucun secret dans le repo — tout dans les env vars Vercel (chiffrées).

---

## 🚪 Phase 3bis — Proxy GitHub (gateway custom)

Decap CMS attend un backend git-gateway. On l'implémente nous-mêmes.

- [ ] Route `/api/gateway/*` qui reproduit l'API git-gateway attendue par Decap CMS.
- [ ] Chaque requête vérifie la session Auth.js **avant** de faire quoi que ce soit.
- [ ] Le proxy signe les requêtes avec le `GITHUB_PAT` (jamais renvoyé au client).
- [ ] Whitelist stricte des paths modifiables : `public/content/*.json`, `public/assets/images/**` — refus des writes sur `.github/`, `.claude/`, `vercel.json`, code source.
- [ ] Whitelist stricte des branches accessibles : `main` uniquement (ou une branche de brouillon dédiée si on ajoute plus tard un workflow de publication).
- [ ] Limite de taille par écriture : 5 MB (protection contre uploads massifs).
- [ ] Vérification MIME + magic number pour tout upload d'image (refus des `.php`, `.exe`, `.js` déguisés).
- [ ] Commits automatiques signés avec un auteur `Aalie via Admin <blackandbeauty.studio@gmail.com>` — journal Git propre.
- [ ] Tests d'intrusion basiques : appel direct à `/api/gateway/*` sans cookie → 401.
- [ ] Tests d'intrusion basiques : appel avec cookie valide mais path hors whitelist → 403 + audit log.

---

## 🧭 Phase 4 — Installation Decap CMS branché sur le proxy

- [ ] `/admin/index.html` : bootstrap Decap CMS depuis CDN cdnjs (SRI pinning).
- [ ] `/admin/config.yml` : `backend.name: git-gateway`, `backend.gateway_url: /api/gateway`.
- [ ] Ne pas activer `local_backend` en prod.
- [ ] Collections définies :
  - [ ] Thème (color pickers, sélecteurs de police limités à la charte gothique).
  - [ ] Accueil.
  - [ ] Onglerie (liste de services répétable).
  - [ ] Épilation (liste répétable).
  - [ ] Galerie (widget image custom avec crop 1080×1080 côté navigateur).
  - [ ] FAQ (liste Q/R répétable).
  - [ ] À propos.
  - [ ] Coordonnées & réseaux.
  - [ ] Réservation & politiques.
  - [ ] Politiques légales (édition rare, verrouillée par confirmation).
- [ ] Champs typés (`color`, `image`, `list`, `markdown`, `number`, `boolean`, `select`).
- [ ] Validation par champ (regex prix, longueurs min/max, obligatoires, alt-text image).
- [ ] Test bout-en-bout : Aalie se log → change un prix → commit visible sur GitHub → Vercel redeploy → site à jour.

---

## 👀 Phase 5 — Aperçu live intégré

- [ ] Iframe du site dans le panneau admin.
- [ ] Communication `postMessage` entre l'admin et l'iframe pour appliquer les modifs **avant** sauvegarde.
- [ ] Bouton « Annuler les modifs non enregistrées ».
- [ ] Confirmation avant de quitter une page avec modifs non sauvegardées.
- [ ] Aperçu **responsive switcher** : mobile / tablette / desktop.

---

## 🖼️ Phase 6 — Gestion des médias

- [ ] Upload avec **compression + redim côté navigateur** (Canvas API) :
  - Cible galerie : carré 1080×1080 JPEG q82.
  - Cible affiches : max 1600 px côté long, WebP q80.
  - Cible logo : PNG original conservé + version WebP générée.
- [ ] Aperçu du crop avant upload (centre ajustable).
- [ ] Nommage automatique séquentiel (`g14.jpg`, `g15.jpg`…) avec vérification de collision.
- [ ] Bibliothèque d'images consultable (grille + recherche par nom).
- [ ] Suppression **protégée** : refus si l'image est référencée quelque part, avec la liste des références.
- [ ] Alt-text **obligatoire** pour l'accessibilité — bloquer la sauvegarde sinon.
- [ ] Optimisation vérifiée : chaque image finale < 300 Ko.

---

## 📱 Phase 7 — UX de l'admin

- [ ] UI en **français** intégralement.
- [ ] Responsive complet (utilisable depuis un téléphone).
- [ ] Toast de confirmation à chaque sauvegarde.
- [ ] Messages d'erreur en langage naturel (pas de code d'erreur brut).
- [ ] Icônes claires, hiérarchie visuelle nette.
- [ ] Bouton **« Retour au site »** toujours visible.
- [ ] Champs auto-sauvegardés en brouillon local (`localStorage`) → aucune perte en cas de crash.

---

## 🧪 Phase 8 — Tests & qualité

- [ ] Playwright : suite E2E qui couvre les 5 parcours principaux :
  - [ ] Login → change une couleur → vérifie la propagation.
  - [ ] Upload photo galerie → apparaît en front.
  - [ ] Modifie un prix → visible en onglerie/épilation.
  - [ ] Ajoute une FAQ → visible sur la page FAQ.
  - [ ] Déconnexion → accès admin refusé.
- [ ] Test manuel sur : Chrome desktop, Firefox desktop, Safari iPhone, Chrome Android.
- [ ] Test 360 px, 768 px, 1440 px — aucun débordement.
- [ ] Lighthouse admin ≥ 90 en Performance / Accessibilité / Best Practices / SEO(N/A).
- [ ] Aucune erreur console sur les 9 pages publiques ni sur l'admin.
- [ ] Test réseau lent (Slow 3G) : l'admin reste utilisable.

---

## 🛡️ Phase 9 — Sécurité complète (défense en profondeur)

### 9.1 En-têtes HTTP (site public + admin)
- [ ] `Content-Security-Policy` avec **nonces** dynamiques — aucun `unsafe-inline`, aucun `unsafe-eval`.
- [ ] `Strict-Transport-Security` : `max-age=63072000; includeSubDomains; preload` — soumission à hstspreload.org après validation.
- [ ] `X-Content-Type-Options: nosniff`.
- [ ] `X-Frame-Options: DENY` (site public) ; sur admin, seul `admin.blackandbeautystudio.ca` peut s'auto-encadrer.
- [ ] `Referrer-Policy: no-referrer` sur `/admin/*`, `strict-origin-when-cross-origin` ailleurs.
- [ ] `Permissions-Policy` restrictive — désactive caméra, micro, géoloc, USB, etc.
- [ ] `Cross-Origin-Opener-Policy: same-origin`.
- [ ] `Cross-Origin-Embedder-Policy: require-corp` (admin uniquement).
- [ ] `Cross-Origin-Resource-Policy: same-origin` (admin uniquement).
- [ ] `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` sur `/admin/*`.
- [ ] Header `Server` masqué (`Server: -`).

### 9.2 Réseau & DNS
- [ ] **DNSSEC** activé sur `blackandbeautystudio.ca` chez le registrar.
- [ ] **CAA** records : autorise uniquement Let's Encrypt (`letsencrypt.org`) à émettre pour ce domaine.
- [ ] Certificat TLS ECDSA P-256, HTTPS/2 + HTTPS/3 (déjà par défaut Vercel).
- [ ] `robots.txt` : `Disallow: /admin/`, `Disallow: /api/`.
- [ ] Sous-domaine `admin.` séparé physiquement du site public — pas de fuite de cookie entre les deux (attribut `Domain` explicite).

### 9.3 Ressources externes
- [ ] **SRI (Subresource Integrity)** obligatoire sur tous les `<script>` et `<link rel=stylesheet>` chargés d'un CDN externe (Decap CMS inclus).
- [ ] Version épinglée + hash SHA-384 stocké.
- [ ] Fonts Google en self-host (aucune requête cross-origin depuis le navigateur des visiteurs).

### 9.4 Auth & sessions (renforcement)
- [ ] Politique mot de passe : ≥ 12 car., pas dans HaveIBeenPwned (API `pwnedpasswords.com` avec k-anonymity).
- [ ] **2FA TOTP** obligatoire (Google Authenticator, Authy, 1Password…).
- [ ] Détection de nouveau device/IP → email d'alerte à Aalie **avant** de laisser passer.
- [ ] **Kill switch** : bouton « Déconnecter tous mes appareils » dans les préférences.
- [ ] Page « Journal de mes connexions » consultable par Aalie (dernières 30 sessions).
- [ ] Compte verrouillé automatiquement après 10 tentatives échouées / 24 h — déblocage manuel par toi (Louis).
- [ ] Timing-attack safe comparaison sur les hashes (`crypto.timingSafeEqual`).

### 9.5 Application (défense proactive)
- [ ] **CSRF tokens** double-submit sur toutes les mutations non-GET (Auth.js le fait, à valider).
- [ ] **CORS strict** : uniquement `admin.blackandbeautystudio.ca` autorisé.
- [ ] Toutes les entrées utilisateur sanitizées avec **DOMPurify** avant rendu.
- [ ] Toutes les sorties HTML échappées côté serveur.
- [ ] Test XSS : injection `<script>alert(1)</script>` dans chaque champ → jamais exécutée.
- [ ] Test SSRF : URL utilisateur dans un champ → aucun fetch côté serveur d'un domaine non whitelisté.
- [ ] Test path traversal : `../../etc/passwd` dans un chemin d'image → refusé.
- [ ] Upload : vérif MIME **+** magic number **+** re-encoding via Sharp/Pillow (pas de passthrough du binaire original).
- [ ] Taille max upload : 5 MB par fichier, 50 MB par session.

### 9.6 Secrets & chiffrement
- [ ] Aucun secret dans le repo — vérifié par `gitleaks` en pre-commit hook + GitHub Action.
- [ ] `TOTP_SECRET` (2FA) chiffré au repos avec AES-256-GCM en KV, clé dérivée de `AUTH_SECRET`.
- [ ] Adresses IP dans les logs → hashées SHA-256 avec sel (Loi 25 : donnée personnelle).
- [ ] Rotation `GITHUB_PAT` tous les 90 j (calendrier + doc).
- [ ] Rotation `AUTH_SECRET` documentée (invalide toutes les sessions).

### 9.7 Supply chain
- [ ] **Dependabot** activé sur le repo (npm + GitHub Actions).
- [ ] `npm audit` bloquant en CI — 0 vuln critique/haute.
- [ ] **Semgrep** ou **CodeQL** en CI (SAST).
- [ ] Toutes les deps épinglées à un range serré (`^` uniquement, jamais `*`).
- [ ] `package-lock.json` commité et vérifié en CI.

### 9.8 Surveillance & incident
- [ ] Logs de sécurité (login, écritures) dans Vercel KV, purge après 90 j.
- [ ] Alertes email à Aalie **et** toi (Louis) pour : nouveau device, ≥ 3 échecs de login, upload refusé, path non whitelisté.
- [ ] `security.txt` déjà en place — vérifier qu'il mentionne admin.
- [ ] Page `/security` publique décrivant les mesures (rassurant pour les clientes).
- [ ] Procédure de réponse à incident écrite (`docs/incident-response.md`) : qui appeler, comment invalider les sessions, comment restaurer.

### 9.9 Conformité Loi 25
- [ ] Registre des traitements écrit (`docs/registre-loi25.md`).
- [ ] Consentement explicite pour tout traitement de données personnelles.
- [ ] Droit d'accès, rectification, portabilité, effacement — procédure documentée pour Aalie.
- [ ] Politique de confidentialité déjà en place — à revalider après ajouts (rendez-vous, audit log).
- [ ] Notification de bris à la CAI (Commission d'accès à l'information) — procédure documentée.

### 9.10 Tests & audit externes
- [ ] **Mozilla Observatory** : note ≥ A (idéalement A+).
- [ ] **SSL Labs** : note A+.
- [ ] **securityheaders.com** : note A+.
- [ ] Scan **OWASP ZAP baseline** sur `admin.blackandbeautystudio.ca` — 0 alerte high/critical.
- [ ] Scan **Nuclei** sur les templates publics (fingerprints, exposures) — 0 finding.
- [ ] Test manuel des **OWASP Top 10 2024** documenté avec captures.
- [ ] Pentest externe léger (optionnel, ~500 $) avant lancement.

### 9.11 Sauvegarde & continuité
- [ ] Git = sauvegarde principale (historique complet, rollback trivial).
- [ ] Export automatique hebdomadaire de la KV vers stockage cold (Vercel Blob chiffré ou GitHub secret gist).
- [ ] Test de restauration documenté et **effectué au moins une fois** avant lancement.
- [ ] RTO cible : < 4 h. RPO cible : < 24 h.

---

## 📅 Phase 9bis — Système de réservation en ligne

**Décision** : intégration d'un service tiers, **pas** de dev interne.

Justifications :
- Gestion des dépôts, no-shows, PCI-DSS : hors périmètre d'un site vitrine.
- Chaque service tiers listé ci-dessous a déjà résolu le problème.
- On garde la responsabilité paiement chez un prestataire spécialisé.

### 9bis.1 Choix du service (à trancher avec Aalie)

Comparatif dans `docs/liste-exhaustive.md`. Options recommandées :
- **Cal.com** — self-host ou 15 $/mois, marque blanche complète.
- **GlossGenius** — 24 $/mois, tout-en-un beauté (dépôts + SMS + POS).
- **Setmore** — gratuit jusqu'à 4 utilisateurs.

- [ ] Décision écrite d'Aalie sur le service choisi.
- [ ] Compte créé, abonnement souscrit si nécessaire.
- [ ] Services / durées / prix / photos alignés avec le contenu du site.
- [ ] Politique de dépôt et d'annulation configurée (montant, délai).
- [ ] Notifications email + SMS activées pour Aalie **et** la cliente.
- [ ] Calendriers connectés (Google Calendar d'Aalie) — synchronisation testée.

### 9bis.2 Intégration technique dans le site

- [ ] Page dédiée `/reservation.html` retravaillée avec :
  - [ ] Introduction (déjà là).
  - [ ] Widget d'embed du service choisi (iframe scellée avec `sandbox` + `allow`).
  - [ ] Fallback : bouton IG DM si le widget ne charge pas.
- [ ] Bouton « Réserver » ajouté dans le hero accueil, la nav, chaque fiche service.
- [ ] `Content-Security-Policy` mise à jour pour autoriser uniquement le domaine du service (frame-src).
- [ ] Analytics : suivi anonyme des clics « Réserver » (pas de tracking personnel).
- [ ] Test sur mobile (le widget doit être responsive et pas déborder à 360 px).
- [ ] Test parcours complet : réservation → email confirmation → apparaît dans Google Calendar d'Aalie.

### 9bis.3 Conformité & confidentialité

- [ ] Vérifier que le service est **PIPEDA / Loi 25 compliant** (contrat de sous-traitance signé si nécessaire).
- [ ] Politique de confidentialité mise à jour pour mentionner ce nouveau sous-traitant.
- [ ] Consentement explicite recueilli avant transmission des données au service tiers.
- [ ] Documenter dans le registre Loi 25 : nature des données, base légale, durée de conservation.

### 9bis.4 Gestion côté admin

- [ ] Section dans la console admin : « Réservations » — lien direct vers le tableau de bord du service tiers.
- [ ] Champ éditable : lien de réservation (au cas où on change de service plus tard).
- [ ] Aalie peut désactiver temporairement le widget (mode « vacances ») depuis l'admin.

---

## 📚 Phase 10 — Documentation

- [ ] `docs/admin-guide.md` — guide cliente pas-à-pas avec captures d'écran :
  - [ ] Se connecter / se déconnecter.
  - [ ] Ajouter/modifier/supprimer une photo.
  - [ ] Changer une couleur du site.
  - [ ] Modifier un prix.
  - [ ] Ajouter une FAQ.
  - [ ] Rétablir une version précédente (rollback).
- [ ] `docs/admin-dev.md` — doc technique pour reprise par un autre dev :
  - [ ] Schéma des JSON et de leur chargement.
  - [ ] Endpoints/collections Decap ou API.
  - [ ] Procédure de rotation des secrets.
  - [ ] Procédure d'ajout d'un nouveau champ éditable.
- [ ] `passation.md` mis à jour pour référencer la console admin.
- [ ] Vidéo screencast (5–7 min) déposée sur Google Drive privé, lien dans `docs/`.

---

## 🚀 Phase 11 — Mise en production & formation

- [ ] Déploiement final vérifié sur Vercel.
- [ ] Aalie crée son compte / reçoit ses identifiants **par un canal sécurisé** (pas de mot de passe en clair par courriel simple).
- [ ] Session de formation en direct (visio ou en personne), **1 h**.
- [ ] Aalie fait elle-même **3 modifications réelles** pendant la formation.
- [ ] Aalie confirme par écrit qu'elle est autonome.
- [ ] Snapshot git tagué `v1.0-admin` pour référence.

---

## 🔧 Phase 12 — Suivi post-lancement (30 j)

- [ ] Vérification hebdomadaire : les modifs d'Aalie se déploient bien.
- [ ] 1 canal de feedback simple (courriel dédié).
- [ ] Correctifs bugs en priorité **haute** (< 48 h).
- [ ] Récolte des 3 principales demandes d'évolution → priorisation avec la cliente.
- [ ] Bilan final écrit à J+30 : ce qui marche, ce qui coince, ce qui vient ensuite.

---

## ❌ Ce qu'on **ne fait pas** (pour être honnête)

- Pas d'A/B testing intégré (pas justifié pour un studio local).
- Pas de multi-utilisateurs pour l'instant (Aalie seule).
- Pas de paiement en ligne **hébergé chez nous** (le service de réservation tiers gère les dépôts).
- Pas d'i18n (site FR uniquement, aligné avec la clientèle Montréal).

Ces points peuvent être ajoutés plus tard, dans une **v2** documentée à part.

---

## 🎯 Critères de succès global

Le projet est **réussi** quand :
- Aalie peut faire **au moins 5 types de modifs** sans jamais demander d'aide.
- Un changement pris depuis son téléphone est **en ligne en moins de 2 minutes**.
- Le site reste **rapide, accessible, sécurisé** — aucun régression mesurable.
- La cliente dit d'elle-même : « je gère mon site comme mon Instagram ».

---

_Ce document est vivant : chaque case cochée doit être datée et référencer le
commit ou la PR qui l'a validée. Aucune case n'est cochée « par avance »._
