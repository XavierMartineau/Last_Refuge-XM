# LAST-REFUGE-XM

Escape room de survie dans un **pénitencier militaire tombé aux mains des infectés** (thème prison / bunker / zombie post-apocalyptique). Le site prépare l’évasion (fiche d’écrou 3D, choix de la salle) puis lance l’escape room 3D en immersion complète, jouable au **clavier / souris** et à la **manette Xbox**.

## Lancer le projet

Les pages 3D (créateur, escape room) utilisent des modules JavaScript et chargent des données JSON : ouvrez le projet avec un **serveur HTTP local**, pas en `file://`.
Ouvrer ou cliquer sur le lien suivant pour accéder au projet :
[Accéder au projet](https://xaviermartineau.github.io/Last_Refuge-XM/)

three.js est chargé depuis le CDN jsDelivr (connexion Internet requise).

## Parcours

1. `index.html` — portail du pénitencier.
2. `docs/html/mode/mode.html` — choix du plan d’évasion (solo ; multijoueur à venir).
3. `docs/html/info/info.html` — plan d’évasion en 3 étapes verrouillées :
   - **01 Fiche d’écrou** : créateur 3D intégré ; son dernier bouton « Trouver sa salle d’évasion » débloque l’étape 02 ;
   - **02 Salle d’évasion** : ouvre `docs/html/choix-salle/choix-salle.html` (catalogue classé par difficulté, nombre de salles et durée, avec description et rapport de situation) ;
   - **03 Lancement** : débloquée quand une salle est choisie, prépare le bunker avant de lancer le jeu dans toute la fenêtre du navigateur.
4. `docs/html/escape-room/Sas-07/escape-room.html` — escape room 3D « Sas 07 » (6 salles ; la porte du fond de la salle 6 est la sortie et termine la partie).

Autres pages : `docs/html/createur-personnage/createur-personnage.html` (créateur seul), `docs/html/options/options.html` (réglages, bouton ✕ qui ramène à la page d’origine), `docs/html/dev/dev.html` (poste de garde / DEV), `404.html`.

La progression (fiche terminée, salle choisie) est enregistrée dans le navigateur (`lastrefuge.progress`), ainsi que les réglages (`lastrefuge.reglages`) et le détenu (`lastrefuge-3d-character`).

## Réglages et manette

`docs/js/commun/reglages.js` + `docs/css/commun/reglages.css` forment la console de réglages commune à la page Options et au menu Échap du jeu : affichage, audio, clavier & souris, manette, accessibilité (et « Partie » en jeu). Toutes les touches clavier et tous les boutons de manette sont **réaffectables** ; les indices du jeu affichent les touches choisies.

Par défaut : **WASD** pour marcher, souris pour regarder (un clic initial autorise la capture du curseur, puis il n’est plus nécessaire de maintenir le clic ; Échap libère le curseur). F allume ou éteint la lampe. Le navigateur doit autoriser le verrouillage du pointeur. À la manette : sticks pour marcher / regarder, A interagir, B s’accroupir, Y lampe, L3 courir, LB inventaire, RB carnet, View carte, R3 vue, Menu réglages. `docs/js/commun/manette-menus.js` gère la navigation des menus à la manette.

Dans le créateur, « Continuer » déverrouille l’étape suivante ; les étapes déjà visitées restent accessibles. La croix ou le stick gauche navigue entre les choix, A valide, B revient et le stick droit tourne l’aperçu. Les manettes compatibles avec la disposition standard de l’API Gamepad sont prises en charge ; leur disponibilité dépend du navigateur et de la console.

Si le jeu ralentit, le contour lumineux des objets peut être temporairement désactivé avant de réduire la résolution ; le cadre de sélection reste visible.

Le menu des réglages met la partie en pause : le temps, les animations et leurs délais reprennent à sa fermeture.

**Options → Affichage → Mode PC peu puissant** adapte la résolution et réduit la distance d’affichage, le relief et la rugosité des textures du bunker, les lumières ; il désactive les ombres, le halo et le contour 3D en jeu. La sélection des objets reste visible ; désactiver ce mode rétablit les réglages graphiques précédents.
Le compteur **FPS** s’affiche dès le lancement ; le bouton **FPS** en jeu ou **Échap → Partie → Compteur FPS** permet de le masquer temporairement.
En cas d’erreur non gérée, d’échec de chargement ou de perte du contexte WebGL, le jeu tente de télécharger localement `crash.txt` avec les détails disponibles ; un lien permet de le télécharger si le navigateur bloque l’opération automatique. Vérifiez son contenu avant de le partager. Un arrêt complet du navigateur ou de la console ne permet pas de produire ce rapport.
Le moteur demande au navigateur un GPU haute performance et réutilise les géométries identiques du bunker. Le choix du GPU reste toutefois contrôlé par le navigateur et le système.

Les menus proposent une ambiance sonore générée en direct. Si le navigateur bloque la lecture automatique, elle démarre à la première interaction. **Options → Audio → Ambiance des menus** permet de la couper ; les volumes général et musique s’appliquent également.

Les réglages d’accessibilité proposent une correction ou une simulation des couleurs et une intensité ajustable. Les planches proposées sont des repères visuels, pas un test médical. Les coiffures longues se balancent pendant les mouvements du personnage ; cet effet est réduit avec la préférence de réduction des animations.

Le HUD affiche le portrait et le nom du détenu, avec la police, la couleur et le style choisis.

En première personne, les mains reprennent l'apparence et les accessoires du personnage. Le Sas 07 ne comporte ni arme ni combat.

## Ajouter une escape room

Ajoutez une entrée dans `docs/js/commun/escape-rooms.js` (code, nom, difficulté 1–5, nombre de salles, durée, description, narration, `url`). Sans `url`, le dossier s’affiche « en préparation ».

## Organisation

```text
LAST-REFUGE-XM/
├── index.html · 404.html            points d’entrée à la racine
└── docs/
    ├── assets/
    │   ├── creation-personnage/      bibliothèque 3D du détenu (partagée créateur + jeu)
    │   │   ├── personnage_armes.js   point d’entrée unique
    │   │   ├── donnees/              palettes.json, données, sélection/validation
    │   │   ├── outils/ · materiaux/ · tete/ · visage/ · cheveux/ · barbes/
    │   │   ├── lunettes/ · couvre-chefs/ · details-visage/ · especes/
    │   │   ├── corps/ · tenues/ · pantalons/ · bottes/ · gants/ · bras/
    │   │   ├── equipement/ · sacs-a-dos/ · armes/ · assemblage/
    │   └── svg/                      illustrations (pénitencier, enceinte, bloc cellulaire, bunker, favicon)
    ├── css/      commun/ (site.css, reglages.css) + une feuille par page ; escape-room/Sas-07/
    ├── data/     content.json (textes des pages)
    ├── html/     une page par dossier ; escape-room/Sas-07/
    └── js/
        ├── commun/                   préférences, contenu, progression, catalogue des salles, réglages, manette
        ├── createur-personnage/      scène et interface du créateur
        └── escape-room/Sas-07/       chargeur escape-room.js + fichiers du jeu dans l’ordre
            └── salles/               salle-01-sas.js … salle-06-hangar-sud.js
```

Les modèles du détenu sont **générés par le code**, ce qui permet toutes les combinaisons de couleurs et de pièces. Les détenus enregistrés restent disponibles dans le navigateur.

Les fichiers du Sas 07 partagent la même portée : `escape-room.js` les lit dans l’ordre de sa liste `FICHIERS` et les exécute comme un seul script. Pour ajouter du code au jeu, créez un fichier dans `docs/js/escape-room/Sas-07/` et ajoutez-le à cette liste.

L’interface vise les ordinateurs, tablettes et consoles dès 768 px de largeur ; les animations respectent le réglage « Animations » et la préférence système de réduction du mouvement.

La documentation de conception se trouve dans [documentation/AFTERLOCK-ESCAPE-ROOM-XM.md](documentation/AFTERLOCK-ESCAPE-ROOM-XM.md).
