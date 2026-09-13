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

**Nouveau (13 sept.)** : la cliente veut que les clientes puissent réserver **directement** sur le site.
Décision : on **intègre un service tiers** (Cal.com, GlossGenius, Setmore, Booksy, Square Appointments)
plutôt que de développer un système custom (paiement + dépôts = hors périmètre).

| Champ | Type | Notes |
|---|---|---|
| Titre de la page | T | ✏️ |
| Introduction | RTF | ✏️ |
| Service de réservation choisi | SEL | ✏️ Cal.com / GlossGenius / Setmore / Booksy / Square |
| URL/embed du service | URL | ✏️ Injectable dans un iframe scellé |
| Widget visible ? | BOOL | ✏️ Bouton « vacances » pour désactiver temporairement |
| Fallback si widget bloqué | URL | Lien IG DM par défaut |
| Politique d'annulation | RTF | ✏️ Miroir de ce qui est dans le service tiers |
| Politique de dépôt | RTF | ✏️ Miroir |
| Politique de retard | RTF | ✏️ Miroir |
| Coordonnées d'urgence | T | ✏️ Optionnel |

### Comparatif rapide des services (pour aider Aalie à choisir)

| Service | Coût | Beauté-friendly | Dépôts | SMS | Marque blanche | Loi 25/PIPEDA |
|---|---|---|---|---|---|---|
| **Cal.com** self-host | 0 $ | Moyen | via Stripe | non | ✅ complète | ✅ (à vérifier hébergement CA) |
| **Cal.com** cloud | 15 $/mois | Moyen | via Stripe | payant | ✅ | ✅ EU / à vérifier CA |
| **GlossGenius** | 24 $/mois | ⭐ excellent | intégré | ✅ | partielle | ✅ US, à vérifier CA |
| **Booksy** | ~30 $/mois | ⭐ excellent | intégré | ✅ | non (branding visible) | ✅ |
| **Setmore** | gratuit (4 users) | Bon | Square/Stripe | payant | non | ✅ |
| **Square Appointments** | gratuit + frais | Bon | intégré natif | ✅ | non | ✅ |

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

## 🚨 Questions ouvertes pour Aalie

Ces points sont à décider avec elle avant de finaliser :

1. **Téléphone public** — l'ajouter ou rester DM Instagram seulement ?
2. **Adresse du studio** — publique ou sur demande uniquement ?
3. **Section avant/après** — activer maintenant, plus tard, ou jamais ?
4. **Photos épilation (aisselles)** reçues mais non publiées — les intégrer avec un filtre discret, ou les garder de côté ?
5. **Système de tags/catégories sur la galerie** — utile ou trop compliqué ?
6. **Blog / actualités** — pertinent pour le studio (nouveautés, promos) ?
7. **Témoignages / avis clients** — vouloir un module dédié ?
8. **Newsletter** — capter les emails pour promos ? (déclenche des obligations Loi 25)
9. **Bouton WhatsApp** — en complément d'Instagram ?
10. **Multilingue** — anglais un jour, ou 100 % français ?
11. **Service de réservation en ligne** — Cal.com / GlossGenius / Setmore / Booksy / Square ?
    Priorités à préciser : budget max/mois, présence d'une app cliente, gestion des dépôts, langue française.
12. **Politique de dépôt** — montant fixe (ex. 20 $) ou pourcentage (ex. 30 %) du service ?
13. **Délai d'annulation gratuite** — 24 h ? 48 h ? 72 h ?
14. **Frais no-show** — 100 % du dépôt perdu ? Frais additionnel ?
15. **Google Calendar personnel d'Aalie** — connecté à l'outil de réservation pour éviter les doubles bookings ?

---

## ✍️ Ce qui reste à préciser côté toi (Louis)

- [ ] Ajouter/retirer des champs ci-dessus.
- [ ] Trancher les 10 questions ouvertes avec Aalie.
- [ ] Valider les couleurs actuelles ou en proposer d'autres.
- [ ] Fournir 1 ou 2 exemples de tarifs à insérer (juste pour tester le CMS).
