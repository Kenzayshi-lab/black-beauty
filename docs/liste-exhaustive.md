# 📝 Liste exhaustive des champs éditables — Console admin

> Première proposition à valider avec Aalie.
> Chaque ligne = un champ qui apparaîtra dans l'admin.
> Notation :
> - `T` = texte court (max ~120 car.)
> - `TL` = texte long / paragraphe (markdown autorisé)
> - `RTF` = texte riche (mise en forme, listes, liens)
> - `NUM` = nombre
> - `IMG` = image (upload)
> - `URL` = lien web
> - `COL` = couleur (color picker)
> - `SEL` = choix parmi une liste fixe
> - `BOOL` = oui / non
> - `LIST[…]` = liste répétable d'éléments
>
> Statut : ✅ validé · ✏️ à discuter · ❌ retiré

---

## 1. 🎨 Thème global (`theme.json`)

| Champ | Type | Valeur actuelle | Notes |
|---|---|---|---|
| Couleur de fond principale | COL | `#0a0000` (noir) | ✏️ |
| Couleur primaire (rubis) | COL | `#b8002e` | ✏️ Utilisée sur boutons, titres |
| Couleur d'accent (rose métal) | COL | `#d4a5a5` | ✏️ |
| Couleur des liens | COL | `#b8002e` | ✏️ |
| Police des titres | SEL | Cinzel | ✏️ Liste restreinte |
| Police de corps | SEL | Montserrat | ✏️ |
| Police script (signature) | SEL | Italianno | ✏️ |
| Rayon des coins | NUM | 8 px | ✏️ Facultatif |

---

## 2. 🌐 Identité du site (`site.json`)

| Champ | Type | Actuel | Notes |
|---|---|---|---|
| Nom du studio | T | Black & Beauty Studio | ✏️ |
| Slogan / accroche | T | Studio privé d'onglerie & épilation à Montréal | ✏️ |
| Ville | T | Montréal (Québec) | ✏️ |
| Adresse | T | *non affichée publiquement* | ✏️ Garder privée ? |
| Courriel | T | blackandbeauty.studio@gmail.com | ✏️ |
| Téléphone | T | *aucun* | ✏️ Ajouter ou non ? |
| Instagram (@) | T | black_and_beauty_studio | ✏️ |
| TikTok (@) | T | blackandbeautystudio | ✏️ |
| Lien DM Instagram | URL | `https://ig.me/m/black_and_beauty_studio` | ✏️ |
| Responsable Loi 25 | T | Aalie Joseph | ✏️ |

---

## 3. 🏠 Page d'accueil (`home.json`)

| Champ | Type | Actuel | Notes |
|---|---|---|---|
| Titre hero (grand titre) | T | *ex : Black & Beauty Studio* | ✏️ |
| Sous-titre hero | T | *ex : Onglerie & épilation à Montréal* | ✏️ |
| Logo hero | IMG | `logo_nobg.png` | ✏️ |
| Texte du bouton CTA principal | T | *ex : Réserver via Instagram* | ✏️ |
| Lien du bouton CTA | URL | Lien DM IG | ✏️ |
| Bloc « Services » — titre | T | Nos services | ✏️ |
| Services vedettes | LIST[T + IMG + URL] | Onglerie, Épilation | ✏️ Ajouter d'autres ? |
| Bloc « Aperçu prix » — titre | T | *à définir* | ✏️ |
| Bloc « Instagram » — titre | T | Suivez-nous sur Instagram | ✏️ |
| Nb de photos IG affichées | NUM | 6 | ✏️ |

---

## 4. 💅 Page Onglerie (`onglerie.json`)

Chaque service est un item d'une liste :

| Champ (par service) | Type |
|---|---|
| Nom du service | T |
| Description | TL |
| Prix | T (ex : « 55 $ ») |
| Durée | T (ex : « 1 h 30 ») |
| Image (facultative) | IMG |
| Visible sur le site ? | BOOL |

**Autres champs de la page** :
- Titre principal (T)
- Introduction (TL)
- Section « Portfolio » — nb photos affichées (NUM, actuellement 8)

---

## 5. 🪒 Page Épilation (`epilation.json`)

Même structure que onglerie :

| Champ (par service) | Type |
|---|---|
| Nom du service | T |
| Description | TL |
| Prix | T |
| Durée | T |
| Image | IMG |
| Visible ? | BOOL |

**Autres** :
- Titre principal (T)
- Introduction (TL)
- Affiche « Waxing » (IMG)
- ✏️ Section « avant/après » à activer ? (BOOL + LIST[paire IMG])

---

## 6. 🖼️ Galerie (`gallery.json`)

Chaque photo :

| Champ | Type |
|---|---|
| Image | IMG (auto-crop 1080×1080) |
| Texte alternatif (accessibilité) | T |
| Lien Instagram (facultatif) | URL |
| Ordre d'affichage | NUM |
| Visible ? | BOOL |
| Tag / catégorie | SEL (onglerie, épilation, événement…) |

**Autres** :
- Titre de la page (T)
- Sous-titre (T)
- Nb de photos par ligne (NUM, actuellement 3)

---

## 7. 📖 À propos (`apropos.json`)

| Champ | Type | Notes |
|---|---|---|
| Titre | T | ✏️ |
| Photo de couverture | IMG | ✏️ |
| Notre histoire | RTF | ✏️ |
| Nos valeurs (liste) | LIST[T + TL] | ✏️ |
| Portrait Aalie | IMG | ✏️ Facultatif |
| Bio Aalie | RTF | ✏️ |
| Citation / phrase clé | T | ✏️ |

---

## 8. ❓ FAQ (`faq.json`)

Liste répétable de Q/R :

| Champ | Type |
|---|---|
| Question | T |
| Réponse | RTF |
| Catégorie | SEL (onglerie, épilation, paiement, politique…) |
| Ordre | NUM |
| Visible ? | BOOL |

---

## 9. 📅 Réservation (`reservation.json`)

**Décision (13 sept. 2026)** : ✅ **Square Appointments** retenu.
✅ Aucun paiement via le site — la réservation confirme juste le créneau.
Paiement au studio, en personne, aucune transaction en ligne.

| Champ | Type | Notes |
|---|---|---|
| Titre de la page | T | ✏️ |
| Introduction courte | RTF | ✏️ |
| URL du widget Square Appointments | URL | ✏️ Fourni après création du compte Square Appointments |
| Widget visible ? | BOOL | ✏️ Bouton « mode vacances » côté admin |
| Message si vacances | RTF | ✏️ Ex : « Je reviens le [date], DM pour urgence » |
| Fallback si widget bloqué | URL | Lien IG DM par défaut |
| Politique d'annulation | RTF | ✏️ Miroir de ce qui est dans Square Appointments |
| Politique de retard | RTF | ✏️ Ex : plus de 15 min = RDV annulé |
| Politique no-show | RTF | ✏️ Ex : après 2 absences → blocage RDV en ligne |

### Note sur les no-shows (sans dépôt)

Square Appointments permet quand même de réduire les absences :
- **Rappels courriel automatiques** 24 h avant (tier gratuit).
- **Rappels SMS** disponibles uniquement avec Square Appointments **Plus** (~29 $/mois) — à envisager plus tard si les no-shows deviennent un problème.
- **Blocage manuel** d'une cliente récidiviste depuis le tableau de bord.
- **Politique écrite** visible avant confirmation du RDV.

Si Aalie change d'avis plus tard et veut activer les dépôts,
Square Appointments les gère nativement via l'écosystème Square — migration facile.

---

## 10. ⚖️ Politiques légales

**Confidentialité (Loi 25)** — presque fixe, à modifier rarement :
- Version (T)
- Date de dernière mise à jour (auto)
- Contenu (RTF long)
- Coordonnées du responsable (déjà dans `site.json`)

**Sécurité** — idem :
- Version (T)
- Date de dernière mise à jour (auto)
- Contenu (RTF long)
- Adresse de divulgation responsable (T)

---

## 11. 🔗 Pied de page (`footer.json`)

| Champ | Type |
|---|---|
| Texte de copyright | T (auto avec année) |
| Liens supplémentaires | LIST[T + URL] |
| Mention légale courte | T |

---

## ✅ Décisions verrouillées (13 septembre 2026)

| # | Sujet | Décision |
|---|---|---|
| 1 | Téléphone public | ❌ **Non** — email `blackandbeauty.studio@gmail.com` reste le seul contact non-IG |
| 2 | Adresse du studio | 🔒 **Sur demande** (jamais publique) |
| 3 | Section avant/après | 🕓 **Plus tard**, quand paires de photos validées disponibles |
| 4 | Photos aisselles reçues | 🕓 **De côté**, à re-évaluer avec Aalie |
| 5 | Tags/catégories galerie | ✅ **Oui** — onglerie / épilation / événement |
| 6 | Blog / actualités | ❌ **Non** — Instagram fait le job |
| 7 | Témoignages / avis | ✅ **Oui** — module simple, 3-5 avis rotatifs sur l'accueil |
| 8 | Newsletter | 🕓 **À vérifier plus tard** (obligations Loi 25 à peser) |
| 9 | Bouton WhatsApp | ❌ **Non** — un seul canal messagerie (IG DM) |
| 10 | Multilingue | 🇨🇦 **100 % français** — clientèle Québec uniquement |
| 11 | Service de réservation | ✅ **Square Appointments** (tier gratuit) |
| 12 | Paiement en ligne / dépôts | ❌ **Aucun** — paiement au studio, en personne |
| 13 | Délai d'annulation gratuite | ⏱️ **24 h** avant le RDV |
| 14 | Politique no-show | 🚫 **Après 3 absences** — blocage réservation en ligne (retour à IG DM avec justificatif) |
| 15 | Google Calendar sync | ✅ **Oui** — sync bidirectionnelle Square Appointments ↔ agenda perso d'Aalie |
| 16 | Rappels auto 24 h avant | ✅ **Oui — par courriel** (tier gratuit Square). SMS = upgrade Square Plus ~29 $/mois, à décider plus tard. |
| 17 | Retard maximum toléré | ⏱️ **20-30 min** — 20 min = tolérance douce (à la discrétion d'Aalie), 30 min = annulation automatique du RDV |

---

## ✍️ Ce qui reste à préciser côté toi (Louis)

- [x] Trancher les 17 questions ouvertes — **fait le 13 sept. 2026**.
- [ ] Valider avec Aalie le blocage/déblocage des points marqués « 🕓 » (Q3, Q4, Q8).
- [ ] Valider les couleurs actuelles ou en proposer d'autres.
- [ ] Fournir 1 ou 2 exemples de tarifs à insérer (juste pour tester le CMS).
- [ ] Confirmer la liste des services onglerie/épilation exacte (nom, durée, prix).

## 📋 Textes à préparer / obtenir d'Aalie

- [ ] Bio / présentation d'Aalie (page À propos).
- [ ] Histoire du studio (nom, création, mission).
- [ ] 3-5 valeurs du studio.
- [ ] Politique d'annulation rédigée (miroir de ce qui sera dans Square Appointments).
- [ ] Politique de retard rédigée.
- [ ] Politique no-show rédigée.
- [ ] 3-5 témoignages/avis clients (avec autorisation écrite ou anonymisés).
