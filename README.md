# LAST-REFUGE-XM

Escape room Point & Click de survie post-apocalyptique, conçu autour d’environnements et d’interactions SVG.

## Pages

- `index.html` : écran d’accueil.
- `docs/html/mode/mode.html` : choix du mode solo ou multijoueur (à venir).
- `docs/html/info/info.html` : hub solo de préparation de l’aventure, avec créateur intégré, salles et lancement à venir.
- `docs/html/createur-personnage/createur-personnage.html` : créateur de personnage.
- `docs/html/options/options.html` : réglages et commandes desktop prévues.
- `docs/html/dev/dev.html` : poste DEV, diagnostics locaux en direct et accès direct aux pages du projet.
- `404.html` : page introuvable avec retour à l’accueil et panneau DEV.

L’accueil et la page 404 restent à la racine pour l’hébergement statique. Les styles et scripts sont classés par page dans `docs/`, avec les éléments partagés dans `commun/`.

Les pages publiques partagent leur identité visuelle et leurs composants dans `docs/css/commun/site.css`; chaque feuille de page gère sa mise en page et ses illustrations. Le créateur utilise sa propre feuille de style. Le poste DEV est accessible depuis toutes les pages et ne transmet pas ses diagnostics : l’état réseau affiché est celui déclaré par le navigateur, sans test de connexion.

Les bandeaux de surveillance utilisent des SVG originaux de bunker et de périmètre. Le radar, ses échos et les mouvements des infectés respectent le réglage d’animation et la préférence système de réduction du mouvement, y compris dans le créateur.

L’interface est adaptée aux ordinateurs et aux tablettes dès 768 px de largeur. En dessous, les pages publiques affichent un message demandant un écran plus grand; cette limite dépend de la largeur, pas du type d’appareil.

Les textes principaux et les commandes des pages publiques sont chargés depuis `docs/data/content.json`. Les préférences sont enregistrées dans le navigateur. Certains navigateurs bloquent la lecture JSON en `file://` : un message apparaît alors et il faut utiliser un serveur local HTTP. Le créateur est intégré au hub et reste accessible directement.

Les éléments du créateur sont regroupés par catégorie dans `docs/assets/creation-personnage/`, sous forme de SVG indexés dans `manifest.json`. Les palettes et données non graphiques sont dans `donnees.json`. Après leur modification, exécuter `node docs/js/createur-personnage/build-assets.cjs` pour actualiser le fichier utilisé par la page, y compris en `file://`.

## Nomenclature

```text
LAST-REFUGE-XM/
├── .vscode/
│   └── settings.json
├── docs/
│   ├── assets/
│   │   ├── audio/
│   │   │   ├── ambient/
│   │   │   └── sound-effects/
│   │   │       ├── interface/
│   │   │       ├── mechanics/
│   │   │       └── tools/
│   │   ├── creation-personnage/
│   │   │   ├── cheveux/
│   │   │   ├── tenues/
│   │   │   └── ... (visages, accessoires, fonds et données)
│   │   ├── images/
│   │   └── svg/
│   │       ├── accueil/
│   │       ├── animations-depart/
│   │       ├── cles/
│   │       ├── connexion/
│   │       ├── fin/
│   │       ├── forge/
│   │       ├── ia/
│   │       ├── identite/
│   │       │   └── favicon.svg
│   │       └── motifs/
│   ├── css/
│   │   ├── 404/404.css
│   │   ├── accueil/accueil.css
│   │   ├── commun/site.css
│   │   ├── createur-personnage/createur-personnage.css
│   │   ├── dev/dev.css
│   │   ├── info/info.css
│   │   ├── mode/mode.css
│   │   └── options/options.css
│   ├── data/
│   │   └── content.json
│   ├── html/
│   │   ├── createur-personnage/
│   │   │   └── createur-personnage.html
│   │   ├── dev/
│   │   │   └── dev.html
│   │   ├── info/
│   │   │   └── info.html
│   │   ├── mode/
│   │   │   └── mode.html
│   │   └── options/
│   │       └── options.html
│   ├── js/
│   │   ├── 404/index.js
│   │   ├── accueil/index.js
│   │   ├── commun/
│   │   │   ├── content.js
│   │   │   └── preferences.js
│   │   ├── createur-personnage/createur-personnage.js
│   │   ├── createur-personnage/outils.js
│   │   ├── dev/index.js
│   │   ├── info/info.js
│   │   └── options/index.js
│   └── README.md
├── documentation/
│   ├── AFTERLOCK-ESCAPE-ROOM-XM.md
│   ├── AGENTS.md
│   └── ASSETS_MAP.md
├── lag-fix/
├── tests/
├── 404.html
├── index.html
└── README.md
```

`docs/assets/` rassemble les médias par format et usage; `docs/data/` contient les données des pages; `docs/css/`, `docs/html/` et `docs/js/` regroupent les ressources complémentaires. `documentation/` contient les guides, `lag-fix/` les correctifs de performance et `tests/` les vérifications. Les dossiers descriptifs utilisent le kebab-case; les points d’entrée d’hébergement restent à la racine.

La documentation principale se trouve dans [documentation/AFTERLOCK-ESCAPE-ROOM-XM.md](documentation/AFTERLOCK-ESCAPE-ROOM-XM.md).
