# 🎨 Procédure de reset des couleurs — Urgence manuelle

> À utiliser **uniquement en attendant que la console admin (Phase 3) soit prête**.
> Une fois l'admin en ligne, Aalie pourra faire un reset elle-même en un clic.
>
> Cette procédure est destinée à toi (Louis) si Aalie appelle en disant
> « j'ai touché aux couleurs, le site ne ressemble plus à rien ».

---

## ⏱️ Reset d'urgence en 30 secondes (depuis GitHub)

### 1. Ouvrir le fichier `theme.default.json` sur GitHub
Va à cette URL :
```
https://github.com/Kenzayshi-lab/black-beauty/blob/main/public/content/theme.default.json
```

### 2. Copier son contenu
Bouton **Raw** (en haut à droite) → Ctrl+A → Ctrl+C.

### 3. Ouvrir le fichier `theme.json`
```
https://github.com/Kenzayshi-lab/black-beauty/blob/main/public/content/theme.json
```

### 4. Éditer (icône crayon en haut à droite)
- **Coller** le contenu copié
- ⚠️ Retirer la section `"_meta": {...}` (le fichier `theme.json` n'a pas de meta)
- Commit direct sur `main` avec le message :
  ```
  chore(theme): reset couleurs d'origine (urgence)
  ```

### 5. Attendre 60 secondes
Vercel redéploie automatiquement. Le site revient à la palette gothique originale.

---

## 🔄 Reset via ligne de commande (si tu as le repo cloné)

```bash
cd black-beauty
git checkout main
git pull

# Copier le default vers l'actif (retire aussi la meta)
python3 -c "
import json
with open('public/content/theme.default.json') as f:
    data = json.load(f)
data.pop('_meta', None)
with open('public/content/theme.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
"

git add public/content/theme.json
git commit -m "chore(theme): reset couleurs d'origine (urgence)"
git push origin main
```

---

## 🕐 Restaurer une version antérieure (rollback partiel)

Si tu veux revenir à une modif d'Aalie plus ancienne (ex. celle d'hier matin, pas celle de ce matin) :

```bash
# Lister les 20 derniers changements du theme.json
git log -20 --oneline -- public/content/theme.json

# Copier la version d'un commit spécifique (remplace HASH)
git checkout HASH -- public/content/theme.json
git commit -m "chore(theme): rollback vers version <date>"
git push origin main
```

---

## 🧠 Rappel — ce qui sera dans l'admin (Phase 3)

Quand la console admin sera en ligne, Aalie aura :

| Bouton | Action |
|---|---|
| **↺ Couleurs d'origine** | Reset instantané aux valeurs de `theme.default.json` |
| **⬅️ Annuler la dernière modif** | Rollback du dernier commit du theme |
| **🕐 Voir l'historique** | Liste des 30 dernières versions, avec preview |
| **✋ Sauvegarde bloquée** | Si contraste WCAG < AA, refus automatique |

---

## 🔒 Règle absolue

Le fichier `theme.default.json` **ne doit JAMAIS être modifié**, sauf changement officiel de charte graphique validé par Aalie (rare, ~1 fois par an au max).

Le processus pour changer la palette de référence :
1. Aalie valide par écrit une nouvelle charte
2. Tu bumps `_meta.version` (1.0 → 2.0)
3. Tu commit avec un message clair `refactor(theme): nouvelle charte v2.0 validée par Aalie`

_Document créé le 13 sept. 2026._
