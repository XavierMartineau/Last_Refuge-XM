# Créateur de personnage — guide pour l'IA

Ce fichier explique le projet à un assistant IA (VS Code, Claude Code, Copilot, etc.).
Lis-le en entier avant de modifier `docs/html/createur-personnage/index.html`.
**Lis aussi `ASSETS_MAP.md`** : il indique où se trouve chaque asset et comment conserver les index.

Le CSS et le script sont dans `docs/css/createur-personnage/createur-personnage.css`
et `docs/js/createur-personnage/`. Les dessins SVG sont rangés par catégorie et type
dans `docs/assets/creation-personnage/` et indexés dans `manifest.json` ; les données
non graphiques sont dans `donnees.json`. Après modification, lancer
`node docs/js/createur-personnage/build-assets.cjs`.

## But du projet

Un créateur de personnage 100 % SVG, en français, avec 3 types (Homme / Femme / Autres) et 3 étapes :

1. **Base** : style (Autres seulement), teint, visage, yeux, sourcils, nez, bouche, barbe, cheveux, haut + couleurs.
2. **Accessoires** : couvre-chef (+ sa couleur), lunettes, détails du visage.
3. **Fond & nom** : fond (dégradés), motif, nom du personnage, police, couleur, style, taille, position.

L'utilisateur final doit avoir **beaucoup de choix** dans chaque catégorie.

## Ta mission

### Mission A — Maintenir des assets propres

Les dessins sont des fichiers SVG classés par catégorie et référencés dans le manifest.

Règles :
- Garde les **mêmes index** qu'aujourd'hui (voir plus bas) pour que les anciens fichiers `.json` de personnage restent valides. Si tu changes l'ordre, ajoute une table de migration.
- Conserve les variables de couleur et les variantes de visage décrites dans `ASSETS_MAP.md`.
- Mets à jour le manifest et régénère le catalogue après toute modification des SVG.

### Mission B — Améliorer l'interface et le visuel

Tu as la liberté d'améliorer tout le design et l'expérience. Pistes :
- **Aperçus en miniature** pour chaque option (cheveux, chapeaux, lunettes, tenues…) au lieu des flèches ‹ ›.
- Grilles de choix avec défilement, recherche ou filtres, et un style plus soigné (thème sombre/clair déjà géré, à garder).
- Barre de progression des 3 étapes, transitions douces, vraie version mobile (le personnage ne doit pas manger tout l'écran).
- Annuler / rétablir, sauvegarde automatique du personnage, plusieurs personnages sauvegardés.
- Export **PNG** et **SVG** du personnage (en plus du `.json`), partage.
- Accessibilité : clavier, `aria-*`, contrastes.
- Plus d'options partout (plus de coiffures, de tenues, de polices de nom, de motifs de fond, etc.).

Garde l'interface **en français**.

## Architecture du créateur

Le code est réparti entre les outils, les catalogues et le script de rendu :

1. **OUTILS** : helpers (`ol` = contour, `both` = miroir gauche/droite autour de x=150, `sh` = éclaircir/assombrir, `call`).
2. **CATALOGUE** : toutes les listes d'options.
3. **RENDU** : `sanitize(raw)` valide l'état, `render(raw)` dessine le SVG et reconstruit les contrôles.
4. **INTERFACE** : événements (onglets, étapes, boutons, JSON).

### Le SVG (`viewBox="0 0 300 360"`)

Calques, du fond vers l'avant (ordre à respecter) :
`bg, back, hair-back, neck, outfit, head, beard, nose, eyes, brows, mouth, hair-front, over, top, extra, glasses, headwear, name`

### Où sont les catalogues

| Catégorie | Variable(s) | Remarque |
|---|---|---|
| Teint | `HUMAN` (homme/femme), `FANT` (autres) | couleurs hex |
| Visage | `FACES` | `[demi-largeur joues, demi-largeur mâchoire, y du menton]` |
| Yeux | `EYES`, `EYECOL` | fonctions `couleur → svg`, œil gauche en (128,128), le droit est le miroir |
| Sourcils | `BROWS` | chemins SVG |
| Nez | `NOSE` | |
| Bouche | `MOUTH` | fonctions `couleur des lèvres → svg` |
| Barbe | `BEARD` | homme et autres seulement |
| Cheveux | `HAIRS`, `HAIRCOL` | chaque coiffure = `[calque arrière, calque avant]` |
| Hauts | `OUTFITS`, `OUTCOL` | variantes SVG par type |
| Lunettes | `GLASSES` | |
| Couvre-chefs | `HEAD`, `ACCCOL` | fonctions `couleur → svg` |
| Détails visage | `EXTRA` | |
| Espèces | `SPECIES`, `SPNAMES`, `PRESETS` | traits ajoutés (`ears, back, over, top, eyes, brows`) + look complet appliqué au choix d'un style |
| Fond | `BGP` (paires de couleurs), `BGS`, `PAT` (motifs) | |
| Nom | `NFONTS`, `NCOL`, `NSTYLE`, `NSIZE`, `NPOS`, `nameSvg()` | polices système |
| Étapes | `STEPS` | quelles clés s'affichent à chaque étape |
| Règles par type | `REGS(genre)` | seules quelques listes changent entre homme / femme / autres |

### L'état du personnage (et du `.json`)

Tous les choix sont des **entiers à partir de 0** (0 = défaut ou « aucun »), plus `gender` (`male`, `female`, `other`) et `name` (texte, 20 caractères max). Clés :
`species, skin, face, eyes, eyeColor, brows, nose, mouth, beard, hair, hairColor, outfit, outfitColor, glasses, headwear, accColor, extra, background, pattern, nameFont, nameColor, nameStyle, nameSize, namePos`

`sanitize()` remet une valeur par défaut si un index est hors limites : ne casse pas ça.

## Règles à respecter

- Ne casse pas la compatibilité des fichiers `.json` déjà exportés.
- Une option ajoutée = une entrée de plus dans la liste (les bornes se déduisent de `.length`).
- Le résultat doit rester utilisable en ouvrant simplement le HTML dans un navigateur, ou via un petit serveur local si tu charges les assets par `fetch`. Explique dans un `README.md` comment le lancer.
- Après chaque changement, ouvre la page et vérifie : les 3 types, les 3 étapes, le bouton Aléatoire, le chargement du JSON, le thème sombre.
