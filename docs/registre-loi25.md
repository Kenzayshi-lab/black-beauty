# 📋 Registre des traitements de renseignements personnels

> **Black & Beauty Studio** — Studio privé d'onglerie et d'épilation à Montréal (Québec)
>
> Document conforme à l'**article 3.2 de la Loi 25** (Loi modernisant des
> dispositions législatives en matière de protection des renseignements
> personnels, Québec).
>
> Responsable des renseignements personnels : **Aalie Joseph**
> Coordonnées : blackandbeauty.studio@gmail.com
>
> Dernière mise à jour : **14 septembre 2026**

---

## 📖 Comment lire ce registre

Chaque section liste **un traitement** de renseignements personnels distinct.
Pour chaque traitement :
- **Finalité** : pourquoi les données sont collectées
- **Base légale** (Loi 25) : consentement / contrat / obligation légale / intérêt légitime
- **Catégories de personnes** concernées
- **Catégories de données** traitées
- **Destinataires** : qui a accès (interne + sous-traitants)
- **Transferts hors Québec** : le cas échéant
- **Durée de conservation** : combien de temps les données sont gardées
- **Mesures de sécurité** appliquées

En cas de bris de sécurité affectant l'un de ces traitements, la procédure
`docs/procedure-incident-loi25.md` s'applique.

---

## Traitement 01 — Réservation de rendez-vous (Square Appointments)

| | |
|---|---|
| **Finalité** | Permettre à une cliente de réserver un créneau de service (onglerie / épilation) |
| **Base légale** | Contrat (exécution d'une prestation) + consentement lors de la saisie du formulaire Square |
| **Personnes concernées** | Clientes du studio |
| **Données traitées** | Prénom, nom, adresse courriel, numéro de téléphone (optionnel), service choisi, date et heure du rendez-vous |
| **Destinataires internes** | Aalie Joseph uniquement |
| **Sous-traitant** | **Square** (Square Canada, Inc.) — plateforme Square Appointments |
| **Transferts hors Québec** | ✅ Oui. Les données sont hébergées par Square (Canada + États-Unis). Square applique des mesures conformes aux exigences québécoises (contrat de sous-traitance implicite via les CGV Square) |
| **Durée de conservation** | Historique conservé dans Square selon leur politique. Aucune copie locale du studio |
| **Mesures de sécurité** | Chiffrement TLS de bout en bout (Square) · Compte Square protégé par mot de passe fort + 2FA côté Aalie · Aucune donnée de paiement (le paiement se fait au studio, en personne) |

---

## Traitement 02 — Prise de rendez-vous par message privé Instagram

| | |
|---|---|
| **Finalité** | Alternative de réservation (fallback si la cliente ne veut pas utiliser Square) |
| **Base légale** | Consentement (initiative de la cliente qui écrit) + contrat |
| **Personnes concernées** | Clientes du studio |
| **Données traitées** | Identifiant Instagram, contenu du message, informations volontairement partagées (téléphone, service souhaité, disponibilités) |
| **Destinataires internes** | Aalie Joseph |
| **Sous-traitant** | **Meta Platforms Inc.** (Instagram) |
| **Transferts hors Québec** | ✅ Oui. Meta stocke les données aux États-Unis principalement. Régi par la politique de confidentialité de Meta |
| **Durée de conservation** | Selon la politique de Meta (Aalie ne conserve pas de copie hors Instagram) |
| **Mesures de sécurité** | Chiffrement Instagram · Compte Aalie protégé par mot de passe + 2FA Meta · Aucune donnée sensible échangée |

---

## Traitement 03 — Envoi de photos client (portfolio Instagram / galerie)

| | |
|---|---|
| **Finalité** | Publication d'une photo réalisée sur la cliente (ongles, résultat cire) pour le portfolio Instagram et la galerie du site |
| **Base légale** | **Consentement libre, éclairé et distinct** demandé à la cliente au moment de la prise de vue (verbal, avec possibilité de refuser sans conséquence) |
| **Personnes concernées** | Clientes qui acceptent d'être photographiées |
| **Données traitées** | Image (mains, jambes, aisselles, etc.) — **jamais le visage sans consentement explicite additionnel** |
| **Destinataires** | Public (Instagram + site) |
| **Sous-traitant** | Meta (Instagram) pour la diffusion IG · **Vercel** pour l'hébergement des images du site |
| **Transferts hors Québec** | ✅ Oui (Meta US, Vercel US) |
| **Durée de conservation** | Tant que la publication reste en ligne. **Retrait à la demande de la cliente** dans un délai raisonnable |
| **Mesures de sécurité** | Contrôle visuel avant publication (pas d'élément identifiant) · Alt-text descriptif sans nom · Photo compressée 1080×1080 |

---

## Traitement 04 — Journal technique du serveur web (hébergement Vercel)

| | |
|---|---|
| **Finalité** | Sécurité (détection d'attaques), performance (résolution d'incidents), bon fonctionnement du site |
| **Base légale** | Intérêt légitime (article 12 al. 2 Loi 25) — sécurité de l'infrastructure |
| **Personnes concernées** | Tout **visiteur** du site (les clientes du studio sont un sous-ensemble ; personne n'est spécifiquement ciblé) |
| **Données traitées** | Adresse IP, user-agent, URL demandée, code de réponse, timestamp |
| **Destinataires** | Vercel (fournisseur de l'hébergement) + Aalie / Kengsley pour l'analyse en cas d'incident |
| **Sous-traitant** | **Vercel Inc.** |
| **Transferts hors Québec** | ✅ Oui (États-Unis, réseau CDN mondial) |
| **Durée de conservation** | Selon la politique Vercel (30-90 jours en général) |
| **Mesures de sécurité** | Accès aux logs limité au compte Vercel du studio · Aucune donnée sensible dans les URLs (pas de query strings avec info personnelle) |

---

## Traitement 05 — Compte administrateur de la console (Aalie)

| | |
|---|---|
| **Finalité** | Authentification d'Aalie sur la console `admin.blackandbeautystudio.ca` pour éditer le site |
| **Base légale** | Consentement (Aalie utilise sa propre console) + intérêt légitime (protection de l'accès admin) |
| **Personnes concernées** | Aalie Joseph (utilisatrice unique de la console) |
| **Données traitées** | Adresse courriel, hash du mot de passe (Argon2id, **jamais en clair**), rôle, date de création, date de dernière connexion |
| **Destinataires** | Kengsley (développeur, en cas d'assistance technique explicite) |
| **Sous-traitant** | **Upstash Inc.** (base de données Redis, via Vercel Storage) |
| **Transferts hors Québec** | ✅ Oui (Upstash — région configurable, actuellement US ou EU selon la région Vercel) |
| **Durée de conservation** | Tant qu'Aalie utilise la console. Suppression à la demande |
| **Mesures de sécurité** | Mot de passe hashé Argon2id (paramètres OWASP 2024) · Session JWT courte (15 min) + refresh silencieux · Cookies `__Host-` + HttpOnly + Secure + SameSite=Strict · Rate limiting (5/15min/IP, 10/24h/email) · Kill switch pour invalider toutes les sessions · Audit log de toute action sensible |

---

## Traitement 06 — Journal d'audit de la console admin

| | |
|---|---|
| **Finalité** | Traçabilité des actions sensibles sur la console (connexions, modifications de contenu, uploads photos) pour la sécurité et la conformité |
| **Base légale** | Intérêt légitime (sécurité) + obligation de tenue de registres (article 3.5 Loi 25) |
| **Personnes concernées** | Aalie (utilisatrice de la console) |
| **Données traitées** | ID utilisateur, hash de l'email (SHA-256 salé), **hash de l'IP** (SHA-256 salé), user-agent, action, ressource cible, timestamp |
| **Destinataires** | Aalie (via l'écran `/journal`) + Kengsley (en cas d'incident) |
| **Sous-traitant** | Upstash Redis |
| **Transferts hors Québec** | Idem traitement 05 |
| **Durée de conservation** | **90 jours** (LTRIM + TTL par entrée — expiration automatique) |
| **Mesures de sécurité** | **L'adresse IP n'est jamais stockée en clair** — uniquement un hash cryptographique SHA-256 avec sel secret (`IP_HASH_SALT`) impossible à inverser. Aucun logiciel externe n'a accès à ce log |

---

## Traitement 07 — Rate limiting (protection contre brute-force)

| | |
|---|---|
| **Finalité** | Empêcher les attaques par force brute sur le login admin |
| **Base légale** | Intérêt légitime (sécurité) |
| **Personnes concernées** | Toute personne tentant de se connecter à la console admin |
| **Données traitées** | Hash de l'IP (SHA-256 salé), hash de l'email tenté, compteur de tentatives |
| **Destinataires** | Aucune — usage interne technique |
| **Sous-traitant** | Upstash Redis |
| **Transferts hors Québec** | Idem 05 |
| **Durée de conservation** | 15 min (IP) à 24 h (email) — expiration automatique via TTL Redis |
| **Mesures de sécurité** | Hash uniquement · Pas de log détaillé des tentatives échouées (l'audit log couvre déjà ça) |

---

## Traitement 08 — Cookie de session admin

| | |
|---|---|
| **Finalité** | Maintenir la session d'Aalie connectée à la console |
| **Base légale** | Cookie **strictement nécessaire au fonctionnement du service** demandé par l'utilisatrice (dispense de consentement selon la Loi 25 — cookie technique) |
| **Personnes concernées** | Aalie |
| **Données traitées** | JWT signé contenant : ID utilisateur, rôle, sessionVersion, timestamps d'émission/expiration |
| **Destinataires** | Aucune (cookie côté client uniquement) |
| **Sous-traitant** | Aucun |
| **Transferts hors Québec** | Non |
| **Durée de conservation** | 15 min (avec refresh silencieux) puis expiration automatique |
| **Mesures de sécurité** | Cookie **`__Host-bb.session`** avec préfixe `__Host-` (empêche la substitution) · `HttpOnly` (inaccessible au JavaScript) · `Secure` (HTTPS uniquement) · `SameSite=Strict` (aucun envoi cross-site) · JWT signé avec `AUTH_SECRET` (32 bytes aléatoires) |

---

## Traitement 09 — Photos publiées sur le site (galerie)

Photos réalisées par Aalie sur des clientes qui ont **consenti** à la publication.

| | |
|---|---|
| **Finalité** | Portfolio public du studio (galerie du site + Instagram) |
| **Base légale** | Consentement libre, éclairé et distinct (voir Traitement 03) |
| **Personnes concernées** | Clientes ayant consenti à la prise + publication |
| **Données traitées** | Photo (fragment corporel non identifiant) + texte alternatif descriptif |
| **Destinataires** | Public |
| **Sous-traitant** | Vercel (hébergement fichiers) + GitHub (dépôt versionné) |
| **Transferts hors Québec** | ✅ Oui (Vercel US, GitHub US) |
| **Durée de conservation** | Tant que la photo reste dans le repo public. Suppression = commit qui retire le fichier |
| **Mesures de sécurité** | Contrôle visuel · Compression + redim 1080×1080 · Alt-text sans nom de la personne |

---

## 🌍 Récapitulatif des sous-traitants

| Sous-traitant | Rôle | Localisation | Contrat |
|---|---|---|---|
| **Vercel Inc.** | Hébergement du site + console admin | États-Unis (avec CDN mondial) | CGV Vercel + Data Processing Addendum |
| **Upstash Inc.** | Base de données Redis (compte admin + audit log + rate limits) | US ou EU (configurable) | CGV Upstash |
| **Square Canada, Inc.** | Système de réservation en ligne | Canada + États-Unis | CGV Square |
| **Meta Platforms, Inc.** | Instagram (messages privés + publication photos) | États-Unis | CGV Meta |
| **GitHub Inc.** | Dépôt de code + fichiers du site | États-Unis | CGV GitHub |
| **Google LLC** | Google Fonts (typographies du site) | États-Unis | CGV Google |

**Note transferts hors Québec** : conformément à l'article 17 de la Loi 25,
tous ces transferts font l'objet d'une évaluation adéquate. Aucun renseignement
personnel sensible n'est transféré vers ces sous-traitants — les données de
santé, les informations financières et les autres données sensibles ne sont
pas collectées.

---

## 📞 Droits des personnes concernées

Conformément aux articles 27 à 41 de la Loi 25, toute personne concernée par
un traitement peut exercer :

- **Droit d'accès** — obtenir la copie de ses renseignements personnels
- **Droit de rectification** — corriger un renseignement inexact
- **Droit de désindexation / effacement** — demander la suppression
- **Droit à la portabilité** — recevoir ses données dans un format structuré

**Comment exercer** : envoyer un courriel à `blackandbeauty.studio@gmail.com`
en précisant la demande. Réponse dans un délai de **30 jours** (article 32).

---

## 📅 Historique des révisions

| Date | Changement | Auteur |
|---|---|---|
| 14 sept. 2026 | Création initiale — 9 traitements + 6 sous-traitants | Kengsley (dev) + Aalie (validation) |

**À revoir** : dans 12 mois ou à chaque ajout/retrait de sous-traitant.
