# 📅 Planning — Setmore + intégration site (tâche connexe)

> Fenêtre visée : **1 à 2 jours ouvrables** entre la création du compte
> et la validation finale d'Aalie, avant d'attaquer la Phase 1.
>
> Légende propriétaire : 👤 = Louis · 🤖 = Claude · 💅 = Aalie

---

## Vue d'ensemble en 4 blocs

```
Bloc A — Configuration Setmore                (~90 min, Louis)
   ↓
Bloc B — Intégration technique au site        (~2 h, Claude)
   ↓
Bloc C — Test + déploiement                   (~30 min, Louis + Claude)
   ↓
Bloc D — Ajustements Aalie                    (variable, Aalie + Louis)
   ↓
   → Attaquer Phase 1 (extraction contenu vers JSON)
```

---

## Bloc A — Configuration Setmore (👤 Louis)

**Créneau conseillé** : 1 h 30 en une seule fois, éviter les interruptions.
**Pré-requis** : accès au courriel `blackandbeauty.studio@gmail.com` et au
Google Calendar d'Aalie (ou faire cette session avec elle en visio).

| # | Tâche | Temps | Notes |
|---|---|---|---|
| A1 | Créer compte Setmore sur setmore.com | 10 min | Email `blackandbeauty.studio@gmail.com`, mdp fort stocké dans Bitwarden. Activer 2FA. |
| A2 | Remplir profil business | 10 min | Nom : Black & Beauty Studio · adresse : « Sur demande » · téléphone : privé · langue : français · fuseau : America/Toronto |
| A3 | Uploader logo | 2 min | `public/assets/images/logo.png` du repo |
| A4 | Configurer horaires hebdomadaires | 10 min | À vérifier avec Aalie — quelques jours/heures approximatifs suffisent, on ajustera |
| A5 | Configurer buffer entre RDV | 3 min | 15 min recommandé (temps de nettoyage/préparation) |
| A6 | Créer les services **onglerie** (estimations) | 20 min | Nom + durée + prix indicatif. On ajustera avec Aalie. |
| A7 | Créer les services **épilation** (estimations) | 15 min | Idem |
| A8 | Copier-coller les 3 politiques (annulation, retard, no-show) | 5 min | Textes prêts dans `docs/politiques-setmore.md` |
| A9 | Activer rappels email + SMS auto 24 h avant | 5 min | Cocher dans les paramètres notifications |
| A10 | Connecter Google Calendar d'Aalie | 10 min | Nécessite son consentement OAuth ; à faire avec elle si possible |
| A11 | Récupérer l'**URL du widget** d'embed | 2 min | Dans Setmore : Booking Page → Get Booking Widget → copier l'URL iframe |
| A12 | Envoyer l'URL du widget à Claude | 1 min | Coller ici, on l'utilise pour l'intégration |

**Livrable de sortie** : URL du widget Setmore.

---

## Bloc B — Intégration technique au site (🤖 Claude)

**Démarre dès que le Bloc A est terminé et que j'ai l'URL du widget.**

| # | Tâche | Temps | Fichiers touchés |
|---|---|---|---|
| B1 | Retravailler `public/reservation.html` — remplacer le bouton IG par le widget Setmore + fallback IG | 30 min | `reservation.html` |
| B2 | Ajouter un bouton « Réserver » (rubis, style gothique) dans le hero de l'accueil | 15 min | `index.html`, `styles.css` |
| B3 | Ajouter le bouton « Réserver » dans la nav principale de **toutes** les pages | 15 min | `decor.js` (car nav construite dynamiquement) |
| B4 | Ajouter le bouton « Réserver » sur chaque fiche service | 15 min | `onglerie.html`, `epilation.html` |
| B5 | Mettre à jour la `Content-Security-Policy` dans `vercel.json` : `frame-src https://booking.setmore.com https://*.setmore.com` | 5 min | `vercel.json` |
| B6 | Mettre à jour `politique-confidentialite.html` — mentionner Setmore comme sous-traitant (Loi 25) | 15 min | `politique-confidentialite.html` |
| B7 | Test responsive 360 px / 768 px / 1440 px — widget lisible partout | 10 min | Playwright (déjà installé) |
| B8 | Test des 3 navigateurs : Chrome, Firefox, Safari iOS | 15 min | manuel |
| B9 | Commit + push + PR vers `main` | 10 min | git |

**Livrable de sortie** : PR prête à merger.

---

## Bloc C — Test + déploiement (👤 Louis + 🤖 Claude)

| # | Tâche | Temps | Qui |
|---|---|---|---|
| C1 | Louis relit la PR | 10 min | 👤 |
| C2 | Merge de la PR → déploiement Vercel automatique | 2 min | 👤 |
| C3 | Vérification site en production (widget, boutons, CSP) | 5 min | 👤 + 🤖 |
| C4 | Test bout-en-bout **réel** : réserver un RDV depuis le site → recevoir email confirmation → RDV visible dans Google Calendar d'Aalie | 10 min | 👤 (ou 💅) |
| C5 | Créer un signet du tableau de bord Setmore dans le navigateur d'Aalie | 2 min | 👤 |

**Livrable de sortie** : réservation en ligne 100 % fonctionnelle sur le site.

---

## Bloc D — Ajustements Aalie (💅 Aalie + 👤 Louis)

**Durée : variable (1 h à quelques jours selon disponibilité d'Aalie).**
**Ne bloque pas la Phase 1.** Peut être fait en parallèle une fois Phase 1
démarrée si Aalie prend son temps.

| # | Tâche | Qui |
|---|---|---|
| D1 | Aalie valide ou ajuste les 3 politiques (dans l'email récap déjà envoyé) | 💅 |
| D2 | Aalie fournit la **liste exacte** de ses services onglerie (nom, durée, prix) | 💅 |
| D3 | Aalie fournit la **liste exacte** de ses services épilation (nom, durée, prix) | 💅 |
| D4 | Louis met à jour les services dans Setmore avec les vrais chiffres | 👤 |
| D5 | Aalie confirme ses horaires réels d'ouverture | 💅 |
| D6 | Louis ajuste les horaires dans Setmore | 👤 |
| D7 | Aalie fait une réservation test elle-même depuis son téléphone | 💅 |
| D8 | Aalie valide « c'est bon » par courriel | 💅 |

**Livrable de sortie** : validation écrite d'Aalie.

---

## Après ce sprint connexe

✅ **On attaque la Phase 1** — extraction du contenu vers JSON,
préparation du terrain pour la console admin.

Estimation Phase 1 : **1 jour de travail** (voir `objectifs-console-admin.md` §🧩).

---

## Planning suggéré (calendaire)

En supposant Aalie disponible :

| Jour | Actions |
|---|---|
| **J** (aujourd'hui, 13 sept.) | Louis boucle Bloc A (compte Setmore, 90 min) + envoie l'URL widget à Claude |
| **J+1** | Claude exécute Bloc B (intégration technique, ~2 h) + PR ouverte |
| **J+1 fin de journée** | Louis merge PR (Bloc C) → site en prod avec réservation |
| **J+2 à J+5** | Bloc D — ajustements en parallèle, sans bloquer la suite |
| **J+2** | Démarrage Phase 1 (Claude) — extraction du contenu |

**Total sprint connexe** : ~2 jours ouvrables pour avoir la réservation
en ligne fonctionnelle, avec ajustements possibles en continu.

---

## Risques & mitigations

| Risque | Mitigation |
|---|---|
| Aalie prend plusieurs jours à valider les politiques | On met en prod avec les politiques proposées ; ajustement instantané dès qu'elle répond (une modif texte dans Setmore = 30 secondes) |
| Widget Setmore ne charge pas dans certaines conditions (JS off, adblocker, réseau bloquant) | Fallback IG DM visible en permanence sous le widget |
| Google Calendar d'Aalie non connecté au moment du 1er RDV | Setmore fonctionne quand même ; sync activée dès qu'elle donne son OAuth |
| Frais SMS Setmore dépassent le tier gratuit (rare) | Alerte configurée dans Setmore ; possible upgrade Setmore Premium à 12 $/mois si nécessaire |
| CSP casse le widget en prod (frame blocked) | Test en preview Vercel avant merge sur `main` |

---

_Document créé le 13 sept. 2026. Sujet à révision selon la disponibilité d'Aalie._
