# 🎓 Plan de formation — Console admin Black & Beauty Studio

> **Document interne** pour Kengsley. Structure la séance de formation
> en visio (Zoom, Google Meet ou Meet) prévue avec Aalie Joseph.
>
> **Durée cible** : 1 h · **Format** : visio partagée d'écran +
> exercices pratiques réels.

---

## 🎯 Objectifs pédagogiques

À la fin de la séance, Aalie doit être capable de :

1. Se connecter et se déconnecter en toute autonomie de sa console admin.
2. Modifier une couleur du site depuis l'écran **Thème**.
3. Modifier un prix ou un texte depuis n'importe quelle page.
4. Ajouter une nouvelle photo dans la **Galerie** depuis son téléphone.
5. Consulter le **Journal des connexions** et savoir quand utiliser le bouton d'urgence.
6. Vérifier que ses modifications apparaissent bien sur le site public.

---

## ⏱ Déroulement — Agenda 60 minutes

| Temps | Bloc | Contenu |
|:---:|---|---|
| **0–5 min** | Accueil & vérifications | Salutations, partage d'écran, vérifier qu'Aalie a bien reçu son mot de passe |
| **5–15 min** | Connexion & tour de la console | Login, présentation du tableau de bord, logique des 12 tuiles |
| **15–25 min** | Exercice 1 — Thème | Aalie change une couleur, teste l'aperçu, sauvegarde, vérifie sur le site |
| **25–35 min** | Exercice 2 — Contenu | Aalie modifie un prix d'onglerie, sauvegarde, vérifie |
| **35–45 min** | Exercice 3 — Photo | Aalie ajoute une photo depuis son téléphone, alt-text, sauvegarde |
| **45–55 min** | Sécurité & bonnes pratiques | Journal, kill switch, mot de passe, ce qu'il ne faut jamais faire |
| **55–60 min** | Questions & suivi | Réponses libres, planification du 2FA, contact en cas de doute |

---

## 📋 Préparation avant la séance (côté Kengsley)

À faire **la veille** :

- [ ] Vérifier que le site et l'admin sont bien en ligne (rapide test manuel).
- [ ] Ouvrir la console admin dans un onglet pour aller vite.
- [ ] Préparer une photo test à uploader (une photo générique — pas de vraie création client).
- [ ] Ouvrir `docs/admin-guide.md` pour l'avoir sous les yeux au besoin.
- [ ] Préparer le lien de la visio (Zoom, Meet…) et l'envoyer 24 h avant.

À faire **10 minutes avant** :

- [ ] Fermer les autres applications distrayantes.
- [ ] Vérifier que le micro et la caméra fonctionnent.
- [ ] Ouvrir le site public dans un second onglet (pour montrer les changements).

---

## 📖 Contenu détaillé par bloc

### Bloc 1 — Accueil & vérifications (5 min)

**À dire** :
> « Bonjour Aalie ! On va prendre une heure ensemble pour te montrer comment gérer ton site toute seule. Je vais partager mon écran d'abord, puis dans une dizaine de minutes ce sera ton tour de manipuler. Rien n'est cassable — le pire qui puisse arriver, c'est qu'on annule un changement. Prête ? »

**À vérifier** :

- Aalie a bien reçu son mot de passe (par Bitwarden Send ou Signal, jamais par courriel en clair).
- Elle est sur un ordinateur portable ou un ordinateur de bureau (pas seulement sur un téléphone pour cette première fois — l'écran est trop petit pour l'apprentissage).

---

### Bloc 2 — Connexion & tour du tableau de bord (10 min)

**Étapes** :

1. Aller sur `https://admin.blackandbeautystudio.ca`.
2. Saisir son courriel et son mot de passe.
3. Elle arrive sur le tableau de bord avec les 12 tuiles.

**Points à expliquer** :

- La barre supérieure (logo cliquable = retour au tableau de bord, bouton **Déconnexion** en haut à droite).
- Les 12 tuiles regroupées logiquement :
  - **Coordonnées** — infos qui apparaissent partout sur le site.
  - **Thème** — couleurs et polices.
  - **Accueil, Onglerie, Épilation, À propos, FAQ** — textes des pages.
  - **Réservation, Politiques (confidentialité et sécurité)** — pages spéciales.
  - **Galerie** — gestion des photos.
  - **Journal** — surveillance et sécurité.

**Insister sur** :

- La session dure 15 minutes d'inactivité. Si elle laisse son ordinateur, elle sera peut-être déconnectée en revenant — normal.
- Elle peut toujours revenir au tableau de bord en cliquant sur le logo.

---

### Bloc 3 — Exercice 1 : changer une couleur (10 min)

**Objectif** : Aalie change **Rose métallique** vers un rose légèrement différent, puis remet à l'original.

**Étapes guidées** :

1. Cliquer sur la tuile **Thème**.
2. Repérer les 9 pastilles de couleur.
3. Cliquer sur le carré coloré à côté de **Rose métallique** — un sélecteur de couleur s'ouvre.
4. Choisir un rose plus foncé (par exemple).
5. Observer l'aperçu miniature à droite qui se met à jour en temps réel.
6. Cliquer sur **Sauvegarder les changements**.
7. Attendre le message vert « ✅ Sauvegardé ».
8. Ouvrir l'onglet du site public, actualiser après une minute — la nouvelle couleur apparaît.
9. Revenir sur la console, cliquer sur **Réinitialiser aux couleurs d'origine**, confirmer.
10. Vérifier que le site revient à la palette de départ.

**À expliquer pendant l'exercice** :

- Le bouton **Annuler modifications** sert avant la sauvegarde.
- Le bouton **Réinitialiser aux couleurs d'origine** est un filet de sécurité — il ramène toujours à la palette gothique validée à la conception.
- Chaque sauvegarde crée un commit officiel sur GitHub (historique complet et réversible).

---

### Bloc 4 — Exercice 2 : modifier un prix (10 min)

**Objectif** : Aalie change un prix d'onglerie, sauvegarde, vérifie sur le site.

**Étapes guidées** :

1. Retour au tableau de bord (clic sur le logo).
2. Cliquer sur la tuile **Onglerie**.
3. Descendre jusqu'à la section **Prix par longueur d'ongles**.
4. Modifier la valeur du prix **Medium (M)** (par exemple).
5. Observer le badge jaune « modifié » qui apparaît à côté du champ.
6. Observer le compteur de caractères en bas à droite.
7. Cliquer **Sauvegarder** dans le bandeau du haut.
8. Cliquer sur le lien **Voir sur le site ↗** pour ouvrir la page onglerie du site public.
9. Actualiser après une minute — le nouveau prix apparaît.
10. Revenir, remettre l'ancien prix, sauvegarder.

**À expliquer** :

- Les compteurs de caractères deviennent jaunes quand on approche de la limite.
- Les prix peuvent contenir des symboles (`$`, `–`, etc.) — c'est prévu.
- Tous les autres écrans de contenu fonctionnent exactement pareil.

---

### Bloc 5 — Exercice 3 : ajouter une photo (10 min)

**Objectif** : Aalie ajoute une photo depuis un téléphone (ou depuis son ordinateur), avec description, sauvegarde et vérifie.

**Étapes guidées** :

1. Cliquer sur la tuile **Galerie**.
2. Observer la grille des photos actuelles.
3. Cliquer sur **+ Ajouter une photo** (bouton en haut).
4. Une fenêtre s'ouvre.
5. Cliquer **Choisir un fichier** et sélectionner une photo (`.jpg` ou `.png`).
6. Attendre la compression automatique (quelques secondes).
7. Vérifier l'aperçu.
8. Saisir un **texte alternatif obligatoire** (par exemple : « French rose et blanc sur ongles courts »).
9. Laisser le lien Instagram par défaut ou le modifier.
10. Cliquer **Ajouter à la galerie**.
11. La photo apparaît en dernier avec un badge jaune « À uploader ».
12. Cliquer **Sauvegarder** dans le bandeau du haut.
13. Attendre le message de confirmation.
14. Ouvrir le site public, page **Galerie**, actualiser après une minute — la photo est là.

**À expliquer** :

- Le texte alternatif est **obligatoire** — pour l'accessibilité (personnes malvoyantes) et le référencement.
- Les flèches ↑ ↓ permettent de réorganiser l'ordre d'apparition.
- Le bouton **Retirer** enlève la photo de la galerie sans supprimer le fichier (rien n'est définitivement perdu).
- Les photos sont automatiquement recadrées en carré 1080 × 1080 et compressées à ~200 Ko.

---

### Bloc 6 — Sécurité & bonnes pratiques (10 min)

**Cliquer sur la tuile Journal**.

**À expliquer** :

- Le journal montre les 30 dernières activités liées à son compte (connexions, modifications, uploads).
- Chaque ligne indique : la nature de l'action, la date, le navigateur utilisé, et un identifiant technique (pas d'adresse IP en clair — conformité Loi 25).
- Une pastille verte = tout va bien. Rouge = un échec de connexion. Jaune = tentative bloquée.

**Le bouton d'urgence — kill switch** :

- Rôle : déconnecter **tous les appareils** connectés à son compte, y compris le sien.
- À utiliser si : téléphone perdu, ordinateur d'ami consulté, ou tout doute sur la sécurité.
- Après clic, elle est immédiatement déconnectée et devra saisir son mot de passe pour revenir.

**Bonnes pratiques** :

- Ne jamais partager son mot de passe.
- Ne jamais se connecter depuis un ordinateur public (café, hôtel).
- Signaler à Kengsley toute activité qui lui semble anormale.
- Changer son mot de passe si elle a le moindre doute (procédure à faire via Kengsley).

---

### Bloc 7 — Questions & suivi (5 min)

**Ouvertures possibles** :

- « As-tu des questions sur ce qu'on vient de voir ? »
- « Y a-t-il un écran ou une fonction dont on n'a pas parlé et qui t'intrigue ? »
- « Tu te sens à l'aise pour te lancer seule cette semaine ? »

**À annoncer** :

- Le **guide écrit** `docs/admin-guide.md` (à lui envoyer par courriel après la séance).
- Le **suivi actif de 30 jours** — elle peut envoyer une capture d'écran par courriel à tout moment.
- La **deuxième étape de sécurité (2FA)** — expliquer brièvement, planifier après la période de rodage.

---

## ✅ Checklist post-formation

À valider après la séance :

- [ ] Aalie s'est connectée seule à la fin de la séance.
- [ ] Elle a modifié au moins 3 éléments réels (une couleur, un texte, une photo).
- [ ] Elle a vérifié un changement sur le site public.
- [ ] Elle a testé le bouton **Réinitialiser aux couleurs d'origine**.
- [ ] Elle sait où trouver le **Journal** et le **kill switch**.
- [ ] Elle a reçu le lien vers `docs/admin-guide.md`.
- [ ] Un créneau de suivi (facultatif) est proposé pour 7 à 10 jours plus tard.

---

## 🚨 En cas de problème pendant la séance

**Elle n'arrive pas à se connecter** :

- Vérifier que le mot de passe est copié sans espace au début ni à la fin.
- Vérifier qu'elle est bien sur `admin.blackandbeautystudio.ca` (pas le site public).
- Si toujours bloquée : reset le mot de passe via le CLI, retransmettre par Bitwarden Send.

**Un écran ne se charge pas** :

- Actualiser la page (F5).
- Vérifier la console navigateur (F12) pour repérer une erreur.
- Se reconnecter (au cas où la session a expiré).

**Un changement n'apparaît pas sur le site** :

- Attendre 60 à 90 secondes (délai de redéploiement Vercel).
- Actualiser avec cache vidé (Ctrl + Shift + R sur Windows, Cmd + Shift + R sur Mac).
- Vérifier dans la console admin que la modification a bien été enregistrée (message vert « ✅ Sauvegardé »).

---

_Fin du plan de formation. Bonne séance._
