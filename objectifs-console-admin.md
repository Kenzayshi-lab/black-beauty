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
- [x] **Auth** : email + mot de passe (voie 1 — compte GitHub caché pour la cliente ; login web classique en façade).
- [x] **URL admin** : sous-domaine `admin.blackandbeautystudio.ca`.
- [ ] Liste exhaustive et écrite des champs éditables (`docs/liste-exhaustive.md`) — **en cours, à finaliser avec la cliente**.
- [ ] DNS : ajout d'un `CNAME admin` pointant vers Vercel chez le registrar du domaine.
- [ ] Configuration Vercel : ajout du domaine `admin.blackandbeautystudio.ca` au projet (ou projet séparé dédié à l'admin).
- [ ] Création du compte GitHub dédié à Aalie (email `blackandbeauty.studio@gmail.com`, ajouté en collaborateur au repo `Kenzayshi-lab/black-beauty` avec droits d'écriture minimaux).
- [ ] 2FA activée sur ce compte GitHub, procédure de récupération notée dans un gestionnaire de mots de passe (Bitwarden ou équivalent).
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

## 🔐 Phase 3 — Authentification sécurisée

- [ ] Choisir et implémenter **une** solution :
  - Piste GitHub OAuth : créer une GitHub App dédiée, scope minimal (`contents:write` sur ce repo uniquement).
  - Piste Auth.js : provider email + magic link, session JWT courte (15 min), refresh 24 h.
- [ ] Mot de passe **JAMAIS** stocké en clair (hash Argon2id si custom).
- [ ] Rate limiting sur `/admin/login` (max 5 essais / 15 min / IP).
- [ ] Rotation des secrets documentée (procédure écrite).
- [ ] Session cookie `HttpOnly`, `Secure`, `SameSite=Strict`.
- [ ] Bouton **déconnexion** visible en permanence dans l'admin.
- [ ] Test intrusion basique : accès direct à `/admin/*` sans session → **redirection login** systématique.
- [ ] Journalisation (log) des connexions et modifications, conservée 90 j (Loi 25).

---

## 🧭 Phase 4 — Installation Decap CMS (si Option A)

- [ ] Créer `public/admin/index.html` avec la CDN officielle de Decap CMS.
- [ ] Créer `public/admin/config.yml` avec **toutes** les collections :
  - [ ] Thème (color pickers, sélecteurs de police Google Fonts limités à la charte).
  - [ ] Accueil.
  - [ ] Onglerie (liste de services répétable).
  - [ ] Épilation (liste répétable).
  - [ ] Galerie (widget image + lien IG).
  - [ ] FAQ (liste Q/R répétable).
  - [ ] À propos.
  - [ ] Coordonnées & réseaux.
- [ ] Champs typés correctement (`color`, `image`, `list`, `markdown`, `number`, `boolean`).
- [ ] Validation par champ (regex prix, longueurs min/max, obligatoires).
- [ ] Backend git-gateway ou GitHub OAuth branché et testé.
- [ ] Publier une modif de test → apparaît sur le site après redeploy.

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

## 🛡️ Phase 9 — Sécurité renforcée

- [ ] En-têtes HTTP mis à jour dans `vercel.json` pour couvrir `/admin` :
  - [ ] `Content-Security-Policy` restrictive et testée (aucun `unsafe-inline` non justifié).
  - [ ] `X-Robots-Tag: noindex, nofollow` sur `/admin/*`.
  - [ ] `Referrer-Policy: no-referrer` sur `/admin/*`.
- [ ] `robots.txt` : `Disallow: /admin/`.
- [ ] Scan `npm audit` (ou équivalent) à zéro vulnérabilité critique/haute.
- [ ] Test manuel : injection de balise `<script>` dans un champ texte → **échappée** correctement en front.
- [ ] Test manuel : upload d'un fichier `.php` renommé `.jpg` → refusé (vérif du magic number, pas juste l'extension).
- [ ] Politique de mots de passe minimale documentée (12+ car., mélange).
- [ ] Backup git automatique = historique complet, rollback en une commande documenté.

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
- Pas de gestion de rendez-vous en ligne (hors périmètre — Instagram DM reste le canal).
- Pas de paiement en ligne (hors périmètre).
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
