# LAST-REFUGE-XM

Escape room de survie dans un **pénitencier militaire tombé aux mains des infectés** (thème prison / bunker / zombie post-apocalyptique). Le site prépare l’évasion (fiche d’écrou 3D, choix de la salle) puis lance l’escape room 3D en immersion complète, jouable au **clavier / souris** et à la **manette Xbox**.

## Lancer le projet

Les pages 3D (créateur, escape room) utilisent des modules JavaScript et chargent des données JSON : ouvrez le projet avec un **serveur HTTP local**, pas en `file://`.

```bash
python -m http.server 8000
# puis http://localhost:8000/index.html
```

three.js est chargé depuis le CDN jsDelivr (connexion Internet requise).

## Parcours

1. `index.html` — portail du pénitencier.
2. `docs/html/mode/mode.html` — choix du plan d’évasion (solo ; multijoueur à venir).
3. `docs/html/info/info.html` — plan d’évasion en 3 étapes verrouillées :
   - **01 Fiche d’écrou** : créateur 3D intégré ; son dernier bouton « Trouver sa salle d’évasion » débloque l’étape 02 ;
   - **02 Salle d’évasion** : ouvre `docs/html/choix-salle/choix-salle.html` (catalogue classé par difficulté, nombre de salles et durée, avec description et rapport de situation) ;
   - **03 Lancement** : débloquée quand une salle est choisie, lance le jeu en plein écran.
4. `docs/html/escape-room/Sas-07/escape-room.html` — escape room 3D « Sas 07 » (12 salles).

Autres pages : `docs/html/createur-personnage/createur-personnage.html` (créateur seul), `docs/html/options/options.html` (réglages, bouton ✕ qui ramène à la page d’origine), `docs/html/dev/dev.html` (poste de garde / DEV), `404.html`.

La progression (fiche terminée, salle choisie) est enregistrée dans le navigateur (`lastrefuge.progress`), ainsi que les réglages (`lastrefuge.reglages`) et le détenu (`lastrefuge-3d-character`).

## Réglages et manette

`docs/js/commun/reglages.js` + `docs/css/commun/reglages.css` forment la console de réglages commune à la page Options et au menu Échap du jeu : affichage, audio, clavier & souris, manette, accessibilité (et « Partie » en jeu). Toutes les touches clavier et tous les boutons de manette sont **réaffectables** ; les indices du jeu affichent les touches choisies.

Par défaut : **WASD** pour marcher, souris pour regarder (un clic initial autorise la capture du curseur, puis il n’est plus nécessaire de maintenir le clic ; Échap libère le curseur). Maintenez le **clic droit** pour viser avec une arme à feu. Le navigateur doit autoriser le verrouillage du pointeur. À la manette : sticks pour marcher / regarder, A interagir, B s’accroupir, X recharger, Y lampe, RT tirer, LT viser, L3 courir, LB inventaire, RB carnet, View carte, R3 vue, Menu réglages. `docs/js/commun/manette-menus.js` gère la navigation des menus à la manette.

Dans le créateur, la croix ou le stick gauche navigue entre les choix, A valide, B revient et le stick droit tourne l’aperçu. Les manettes compatibles avec la disposition standard de l’API Gamepad sont prises en charge ; leur disponibilité dépend du navigateur et de la console.

Les réglages d’accessibilité proposent une correction ou une simulation des couleurs et une intensité ajustable. Les planches proposées sont des repères visuels, pas un test médical. Les coiffures longues se balancent pendant les mouvements du personnage ; cet effet est réduit avec la préférence de réduction des animations.

Le HUD affiche le portrait et le nom du détenu, avec la police, la couleur et le style choisis, ainsi que sa vie sur 100. Une attaque d’infecté inflige 5 PV avant la réduction accordée par l’équipement renforcé.

En première personne, les mains et l'arme équipée reprennent l'apparence et les accessoires du personnage. Le compteur en bas à droite indique les balles restantes dans le chargeur et sa capacité, y compris pendant le rechargement ; les armes blanches sont indiquées séparément.

Dans l’arène, les 13 infectés arrivent en six vagues successives de 1, 1, 2, 2, 3 et 4. Leurs PV valent respectivement 3, 4, 5, 6, 7 et 8 fois les dégâts effectifs de l’arme équipée, accessoires compris. Leur vitesse augmente aussi à chaque vague et dépend des dégâts, de la cadence et du type d’arme : les infectés sont plus lents face aux armes de mêlée. Changer d’arme rééquilibre les infectés encore vivants en conservant leur proportion de vie.

Les trois modèles animés d'infectés sont chargés à l'équipement de l'arme et partagent leurs ressources ; leurs collisions de tir utilisent des volumes simplifiés. Le blob n'a pas de zone de tête.

L'entrée de l'arène comprend une zone sûre délimitée : les infectés ne peuvent pas y entrer ni blesser le joueur, et aucune arme ne peut y être utilisée. Deux trousses à usage unique restaurent progressivement jusqu'à 100 PV à raison de 10 PV par seconde ; deux boîtes à usage unique remplissent instantanément le chargeur. Le rechargement normal reste gratuit et illimité. Les ressources se ramassent avec la commande de prise habituelle et restent disponibles si elles ne sont pas utiles. L'arène comprend des marches praticables, des postes thématiques et des néons moins éblouissants ; plusieurs autres salles ont également reçu des décors adaptés à leur fonction.

## Ajouter une escape room

Ajoutez une entrée dans `docs/js/commun/escape-rooms.js` (code, nom, difficulté 1–5, nombre de salles, durée, description, narration, `url`). Sans `url`, le dossier s’affiche « en préparation ».

## Organisation

```text
LAST-REFUGE-XM/
├── index.html · 404.html            points d’entrée à la racine
└── docs/
    ├── assets/
    │   ├── creation-personnage/      bibliothèque 3D du détenu (partagée créateur + jeu)
    │   ├── zombie/                   modèles et animations des infectés
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
            └── salles/               salle-01-sas.js … salle-12-armurerie-arene.js
```

Les modèles du détenu sont **générés par le code**, ce qui permet toutes les combinaisons de couleurs et de pièces. Les fichiers `.glb` exportés sont des instantanés statiques ; le mouvement des cheveux est calculé dans le jeu et n’est pas inclus dans ces exports. Le créateur peut exporter un détenu en `.glb` ou en `.png`.

### Crédits des infectés

- "ANIMATION ZOMBIE" (https://skfb.ly/pNsAw) by MUD is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
- [Living Flesh Blob - Free Organic Horror Asset](https://skfb.ly/pGOHv), par Yury Misiyuk — [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
- [Animated Zombie Cop Running Loop](https://skfb.ly/o9xXZ), par LasquetiSpice — [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

Les fichiers du Sas 07 partagent la même portée : `escape-room.js` les lit dans l’ordre de sa liste `FICHIERS` et les exécute comme un seul script. Pour ajouter du code au jeu, créez un fichier dans `docs/js/escape-room/Sas-07/` et ajoutez-le à cette liste.

L’interface vise les ordinateurs, tablettes et consoles dès 768 px de largeur ; les animations respectent le réglage « Animations » et la préférence système de réduction du mouvement.

La documentation de conception se trouve dans [documentation/AFTERLOCK-ESCAPE-ROOM-XM.md](documentation/AFTERLOCK-ESCAPE-ROOM-XM.md).
