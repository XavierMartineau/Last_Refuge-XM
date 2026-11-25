# ASSETS_MAP — créateur de personnage

Les dessins sont dans `docs/assets/creation-personnage/`, classés par catégorie et indexés
par `manifest.json`. `donnees.json` contient les palettes, les dimensions des visages,
les noms et les looks prédéfinis ; aucun dessin n'y est défini en JavaScript.

Après toute modification d'un SVG, du manifest ou des données, exécuter :

```text
node docs/js/createur-personnage/build-assets.cjs
```

Le fichier généré `docs/js/createur-personnage/assets-generes.js` permet aussi l'ouverture
directe en `file://`. Ne pas le modifier à la main.

## Catégories

| Dossier | Contenu |
|---|---|
| `visages/` | formes homme et femme, oreilles, cous et joues |
| `yeux/`, `sourcils/`, `nez/`, `bouches/` | traits du visage ; `yeux/cils.svg` contient les cils |
| `barbes/` | barbes avec variantes de visage dans un seul SVG par choix |
| `cheveux/{male,female,other}/` | coiffures et leurs calques arrière et avant |
| `tenues/{male,female,other}/` | vêtements selon le type |
| `lunettes/`, `couvre-chefs/`, `details/` | accessoires ; certains détails contiennent plusieurs variantes de visage |
| `especes/` | calques des styles Autres : oreilles, arrière, dessus, yeux et sourcils |
| `fonds-et-noms/fonds/`, `fonds-et-noms/motifs/` | fonds et motifs SVG |

Chaque position dans les tableaux du manifest est l'index sauvegardé dans les fichiers
JSON du personnage : conserver l'ordre, y compris les options vides. Les tableaux de
barbes, détails et oreilles d'espèces conservent leurs variantes dans un seul SVG par
choix. Les commentaires `<!-- variant:0,1 -->` et `<!-- end-variant -->` indiquent les
index de visage dans l'ordre de `FACES` dans `donnees.json`. Les dessins identiques sont
partagés entre catégories et types dans les dossiers `commun/` et `partages/`.
Les styles d'espèce gardent leurs propriétés `es` et `fe`.
Les cheveux conservent les commentaires `<!-- back -->` et `<!-- front -->` séparant les
deux calques.

Les SVG utilisent `var(--skin)`, `var(--hair)` et `var(--brow)` pour les couleurs du
personnage. Les yeux, lèvres, tenues et couvre-chefs utilisent `var(--choice-color, #123456)`
et, si nécessaire, les variantes `--choice-shade-*` : le catalogue généré les remplace
avec la couleur choisie et ses nuances. Conserver ces marqueurs lors d'une modification.

Le personnage utilise un `viewBox="0 0 300 360"`. Le rendu assemble ses calques dans
l'ordre défini dans `docs/html/createur-personnage/index.html` ; certains traits gauches
sont ensuite reproduits en miroir par le script. Les choix sont validés par `sanitize()`.
