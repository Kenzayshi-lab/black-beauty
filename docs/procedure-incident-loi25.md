# 🚨 Procédure de gestion d'incident de confidentialité

> **Black & Beauty Studio** — Conforme à la **Loi 25, article 3.5** et
> **article 3.7** (notification à la Commission d'accès à l'information
> et aux personnes concernées).
>
> Dernière mise à jour : **14 septembre 2026**

---

## 📖 Ce document sert à quoi ?

En cas d'**incident de confidentialité** (bris de sécurité, fuite de données,
accès non autorisé, perte, vol), la Loi 25 impose des délais et des étapes
précises. Ce document liste **qui fait quoi**, **dans quel ordre**, avec les
seuils légaux.

---

## 🎯 Définitions clés (Loi 25)

**Incident de confidentialité** : accès à un renseignement personnel non
autorisé par la loi, utilisation non autorisée, communication non autorisée,
perte ou toute autre atteinte à la protection.

**Risque de préjudice sérieux** : appréciation du responsable qui tient
compte notamment de la sensibilité du renseignement, des conséquences
appréhendées et de la probabilité qu'il soit utilisé à des fins préjudiciables.

Exemples d'incidents à traiter :
- Mot de passe admin fuité (email de phishing réussi, téléphone volé)
- Base de données Redis compromise (accès non autorisé)
- Fichiers du site (photos, JSON) modifiés/exfiltrés par un tiers
- Compte Square Appointments piraté
- Compte Instagram d'Aalie piraté
- Publication accidentelle d'une photo non consentie

---

## 🚑 Procédure — 5 phases

### Phase 1 — Détection & confinement (dans l'heure)

**Qui** : Aalie ou Kengsley (celui qui détecte)

1. **Ne rien effacer**. Prendre des captures d'écran de l'anomalie.
2. **Confiner immédiatement** :
   - Compromission compte admin → **Kill switch** depuis `/journal` de la console (déconnecte toutes les sessions). Si impossible, contacter Kengsley pour rotation d'`AUTH_SECRET` en urgence.
   - Compromission Square → Changer le mot de passe Square + activer/vérifier 2FA + révoquer les sessions actives.
   - Compromission Instagram → Meta Business Suite → Sécurité → Se déconnecter partout + changer le mot de passe.
   - Site public défiguré → Rollback Git immédiat via `git revert` du dernier commit + redéploiement Vercel.
3. **Alerter l'autre** (Aalie ↔ Kengsley) par un canal sûr (Signal, appel — **pas** l'email si l'email est compromis).

### Phase 2 — Évaluation (dans les 24 heures)

**Qui** : Aalie + Kengsley ensemble

1. **Établir les faits** :
   - Quand l'incident a-t-il eu lieu ? (regarder l'audit log `/journal`)
   - Quelle est l'étendue ? (nombre de personnes, catégories de données)
   - Quelle est la cause ? (phishing, mot de passe faible, faille technique)
2. **Consulter le registre `docs/registre-loi25.md`** pour identifier les traitements affectés.
3. **Évaluer le risque de préjudice sérieux** — grille de décision :

| Critère | Faible | Élevé |
|---|---|---|
| Sensibilité des données | Nom + email | Coordonnées + photos identifiantes |
| Nb de personnes | 1-5 | > 5 |
| Nature de l'accès | Interne, contenu | Externe malveillant, exfiltration |
| Publication publique | Non | Oui |
| Données financières | ❌ (jamais collecté) | — |
| Données de santé | ❌ (jamais collecté) | — |

Si **≥ 2 colonnes "Élevé"** → risque sérieux confirmé → phase 3 obligatoire.

### Phase 3 — Notification à la CAI (si risque sérieux, dans les meilleurs délais)

**Qui** : Aalie (responsable Loi 25) — Kengsley aide à rédiger.

**Formulaire officiel** : https://www.cai.gouv.qc.ca/entreprises/incident-de-confidentialite/

**Informations à fournir** :
- Nom et coordonnées de l'entreprise (Black & Beauty Studio)
- Description de l'incident
- Date et durée de l'incident
- Renseignements en cause (catégories)
- Nombre de personnes touchées
- Mesures prises pour diminuer les risques
- Mesures pour éviter que ça se reproduise
- Personne à contacter pour un suivi

**Délai** : « dans les meilleurs délais » — en pratique **72 heures** est le standard raisonnable.

### Phase 4 — Notification aux personnes concernées (si risque sérieux)

**Qui** : Aalie

**Comment** : chaque personne touchée reçoit une notification **directe**
(courriel, SMS, message Instagram — selon le canal de contact disponible).

**Contenu obligatoire** (article 3.7) :
- Description de l'incident
- Renseignements en cause
- Circonstances de l'incident (date, cause si connue)
- Mesures prises par le studio pour réduire les risques
- **Ce que la personne peut faire** pour se protéger (ex : changer un mot de passe partagé, surveiller ses comptes)
- Coordonnées de la personne responsable au studio (Aalie)
- Rappel du droit de porter plainte à la CAI

**Modèle de message** : à préparer AVANT un incident (voir `templates/notification-incident.txt` à créer si besoin).

### Phase 5 — Suivi & registre interne (dans les 30 jours)

**Qui** : Aalie + Kengsley

1. **Enregistrer l'incident** dans un registre interne (obligatoire — art. 3.8 Loi 25) :
   - Date, description, gravité
   - Personnes touchées
   - Actions correctives prises
   - Notifications émises (CAI + personnes)
   - Leçons apprises

   Le registre peut être un simple document texte dans un Drive privé accessible aux 2.

2. **Corriger la faille** :
   - Rotation des secrets (`AUTH_SECRET`, `GITHUB_PAT`, `IP_HASH_SALT`)
   - Mise à jour du code si faille technique
   - Formation renforcée si erreur humaine
3. **Suivi 90 jours** : vérifier qu'aucune conséquence n'apparaît (nouvelles connexions suspectes, plaintes de clientes).

---

## 🔧 Rotation d'urgence des secrets

À déclencher si `AUTH_SECRET`, `GITHUB_PAT`, `IP_HASH_SALT` ou `REDIS_URL` ont pu fuiter.

### `AUTH_SECRET`
1. Kengsley génère un nouveau : `openssl rand -base64 32`
2. Vercel → projet `bbstudio-admin` → Settings → Environment Variables → remplacer `AUTH_SECRET`
3. Redeploy automatique
4. **Impact** : toutes les sessions Auth.js sont invalidées → Aalie doit se reconnecter

### `GITHUB_PAT`
1. Aalie révoque l'ancien token : https://github.com/settings/personal-access-tokens
2. Kengsley génère un nouveau fine-grained token (scope : `contents:write` sur `Kenzayshi-lab/black-beauty` uniquement)
3. Vercel → Settings → remplacer `GITHUB_PAT`
4. Redeploy
5. **Impact** : les éditions admin sont possibles avec le nouveau token

### `IP_HASH_SALT`
1. Générer nouveau : `openssl rand -base64 16`
2. Vercel → remplacer
3. Redeploy
4. **Impact** : les vieux hash IP dans l'audit log deviennent incomparables aux nouveaux, mais l'audit log expire à 90 jours donc problème auto-résolu

### `REDIS_URL`
Rotation gérée par Upstash / Vercel Storage. Contact Vercel Support si compromission suspectée.

---

## 📞 Contacts d'urgence

| Contact | Rôle | Canal |
|---|---|---|
| **Aalie Joseph** | Responsable Loi 25 | blackandbeauty.studio@gmail.com |
| **Kengsley** | Développeur / support technique | louissaintkengsleys@gmail.com |
| **CAI (Commission d'accès à l'information)** | Autorité de contrôle | https://www.cai.gouv.qc.ca/ · 418-528-7741 |
| **Vercel Support** | Hébergeur | https://vercel.com/support |
| **Upstash Support** | Base Redis | support@upstash.com |
| **Square Support** | Système réservation | https://squareup.com/help |

---

## 🧪 Test de la procédure

**Simulation annuelle recommandée** (article 3.5 Loi 25 — obligation de
politiques et pratiques encadrant la gouvernance).

Scénario type : « Aalie a laissé sa session admin ouverte sur un ordinateur
d'ami et pense qu'il a peut-être touché à quelque chose. »

Étapes :
1. Aalie déclenche le kill switch depuis `/journal`
2. Aalie regarde son audit log — cherche des actions non-elle
3. Elle change son mot de passe (CLI `npm run create-user -- --email ... --password "..." --reset`)
4. Si actions suspectes trouvées, elle contacte Kengsley

Documenter l'exercice dans le registre interne.

---

## 📅 Historique des révisions

| Date | Changement | Auteur |
|---|---|---|
| 14 sept. 2026 | Création initiale | Kengsley + Aalie |

**À revoir** : dans 12 mois ou après tout incident réel.
