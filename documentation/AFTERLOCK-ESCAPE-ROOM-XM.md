# **Documentation — LAST REFUGE XM : Zone de quarantaine**

> **Direction actuelle :** escape room Point & Click de survie post-apocalyptique, dans une zone de quarantaine envahie par les infectés.
>
> Les sections techniques et exemples historiques ci-dessous décrivent des idées issues de l'ancienne direction steampunk. Ils sont conservés comme références de conception, mais leur univers, leurs visuels et leurs couleurs ne constituent plus la direction actuelle.

## **1. Vision du Jeu & Direction Artistique de Survie**

### **Concept Général**

Le projet **LAST REFUGE XM** est une expérience d'évasion (*Escape Room*) et de survie au format Point & Click 2D, dans un monde post-apocalyptique. Un survivant explore des zones abandonnées, résout des énigmes et cherche une issue face à la menace des infectés. Les salles et mécaniques de jeu restent à concevoir. L'interface actuelle fonctionne dans un navigateur et utilise des illustrations SVG.

Ce choix technique offre plusieurs avantages stratégiques :

* Scalabilité vectorielle parfaite (*crisp renders*) quelle que soit la résolution de l'écran (Full HD, 4K, 8K, écrans rétina) sans dégradation ni flou de texture.

* Poids des assets ultra-réduit et temps de chargement instantanés comparés à des rendus 3D ou à des sprites rasters haute résolution.

* Manipulation directe de la hiérarchie DOM des éléments SVG via CSS, JavaScript/TypeScript et la bibliothèque GSAP.

### **Boucle de Jeu (Game Loop)**

Le jeu s'articule autour de la création d'un survivant, du choix d'une zone, de l'exploration et de l'évasion :

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 1 : PRÉPARER LE SURVIVANT                     │
│       Personnalisation vectorielle du personnage (SVG)                 │
│  - Choix du visage, des vêtements et accessoires                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              PHASE 1.5 : SÉLECTION DE LA SALLE / MAP                   │
│         Choix parmi plusieurs salles et styles d'ambiance              │
│  - Quartier évacué, station abandonnée, laboratoire, refuge            │
│  - Zones et difficultés en cours de conception                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                PHASE 2 : EXPLORATION DE LA SALLE CHOISIE               │
│              Exploration Point & Click & Zoom viewBox                  │
│  - Inspection de l'environnement vectoriel                             │
│  - Utilisation de l'outil de l'avatar & objets de l'inventaire         │
│  - Résolution des mécaniques / énigmes (à définir)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    DÉVERROUILLAGE DE LA PORTE                          │
│                      Échappée réussie !                                │
└────────────────────────────────────────────────────────────────────────┘
```

> **Note d'avancement (WIP) :** Les mécaniques de jeu et les énigmes **ne sont pas encore finalisées à 100 %**. Elles restent en cours de conception et d'ajustement au fil du développement dans VS Code.

### **Palette officielle — survie militaire (20 couleurs)**

| # | Nom | HEX | Usage |
|---|---|---|---|
| 1 | Nuit de quarantaine | `#101512` | Fond principal |
| 2 | Forêt profonde | `#171F1A` | Panneaux sombres |
| 3 | Bunker | `#1A251E` | Cartes et surfaces |
| 4 | Olive blindé | `#253128` | Surfaces surélevées |
| 5 | Kaki usé | `#596C59` | Bordures et équipements |
| 6 | Toile militaire | `#7D9780` | Détails secondaires |
| 7 | Vert délavé | `#A3BC94` | Indicateurs disponibles |
| 8 | Sauge claire | `#C4D2B9` | Texte secondaire contrasté |
| 9 | Os | `#EDF0E3` | Texte principal |
| 10 | Poussière | `#B6C1B0` | Texte discret lisible |
| 11 | Noir asphalte | `#0C1410` | Ombres et silhouettes |
| 12 | Béton | `#758076` | Structures abandonnées |
| 13 | Acier | `#AAB5AB` | Détails métalliques |
| 14 | Terre | `#4A3F32` | Sols et sacs |
| 15 | Sable | `#B5A17B` | Marquages et équipements |
| 16 | Rouille | `#763D32` | Dégradations et signaux |
| 17 | Alerte rouge | `#BC654F` | Menace et avertissements |
| 18 | Signal corail | `#E8896A` | Actions et accents |
| 19 | Signal clair | `#F1B090` | Survol et focus |
| 20 | Jaune sécurité | `#D7A254` | Barricades et zones de danger |

Les couleurs de peau et les fonds de choix du créateur restent distincts pour préserver
la lisibilité. Les préférences de contraste et de réduction des animations restent actives.

### **Techniques de Rendu Vectoriel Avancées**

Afin d'éviter l'aspect plat ou figé des graphismes SVG, le projet s'appuie sur des définitions réutilisables dans la section `<defs>` du SVG principal :

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" id="main-svg">
  <defs>
    
    <linearGradient id="brass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C4D2B9" />
      <stop offset="40%" stop-color="#7D9780" />
      <stop offset="70%" stop-color="#253128" />
      <stop offset="100%" stop-color="#596C59" />
    </linearGradient>

    
    <linearGradient id="copper-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#B5A17B" />
      <stop offset="50%" stop-color="#763D32" />
      <stop offset="100%" stop-color="#4A3F32" />
    </linearGradient>

    
    <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComponentTransfer in="blur" result="glow">
        <feFuncA type="linear" slope="1.5" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    
    <filter id="steam-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise">
        <animate attributeName="baseFrequency" dur="10s" values="0.01;0.04;0.01" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
    </filter>

    
    <pattern id="rivet-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="2.5" fill="#171F1A" stroke="#7D9780" stroke-width="0.8" />
    </pattern>
  </defs>
</svg>
```

## **2. Contrôles, Raccourcis Clavier (Keybinds) & Caméra SVG**

### **Matrice des Commandes Hybrides (Souris + Clavier)**

| Action | Contrôle Souris | Raccourci Clavier | Effet dans la Scène | 
| ----- | ----- | ----- | ----- | 
| **Interagir / Inspecter** | Clic Gauche | — | Active un hotspot, prend un objet, manipule un levier ou déclenche un zoom. | 
| **Fermer Zoom / Annuler** | Clic Droit | Échap (`Esc`) | Réinitialise le `viewBox` vers la vue d'ensemble (`1920x1080`). | 
| **Zoom Dynamique** | Molette (`Scroll Up/Down`) | `+` / `-` | Modifie progressivement le ratio du `viewBox` centré sur le curseur. | 
| **Pan / Panoramique** | Clic Milieu maintenu / Glisser | `W A S D` ou Flèches | Déplace la fenêtre d'observation quand le zoom est supérieur à `x1.5`. | 
| **Radar d'Interactions** | Appui court / Maintenu | `Tab` ou `H` | Déclenche un halo ambré pulsant sur tous les éléments cliquables découverts. | 
| **Outil de l'Avatar** | — | `F` | Active/désactive l'outil équipé (Monocle, Lampe, Clé) à la position du curseur. | 
| **Afficher l'inventaire** | — | `E` | Affiche ou masque l'inventaire. |
| **Raccourcis Inventaire** | Clic sur la barre UI | Touches `1` à `5` | Équipe directement l'objet correspondant au slot de l'inventaire. | 
| **Carnet / Journal** | Clic sur le bouton Carnet | `I` | Affiche ou masque le sous-panneau vectoriel des notes et schémas trouvés. | 
| **Gestion du Son** | Clic sur l'icône Audio | `M` | Mute / Unmute global pour la musique d'ambiance et les bruitages (SFX). | 

### **Architecture Technique de la Caméra SVG (Zoom & Pan)**

Le moteur de caméra contrôle directement l'attribut `viewBox` de l'élément `<svg>`. L'interpolation du `viewBox` préserve l'alignement parfait sur la grille d'événements DOM SVG.

```
// CameraController.ts
export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SVGCamera {
  private svgElement: SVGSVGElement;
  private currentViewBox: ViewBox = { x: 0, y: 0, width: 1920, height: 1080 };
  private targetViewBox: ViewBox = { x: 0, y: 0, width: 1920, height: 1080 };
  private isAnimating: boolean = false;
  private readonly DEFAULT_VIEWBOX: ViewBox = { x: 0, y: 0, width: 1920, height: 1080 };
  private easeFactor: number = 0.08;

  constructor(svgId: string) {
    this.svgElement = document.getElementById(svgId) as unknown as SVGSVGElement;
    this.initEventListeners();
  }

  public zoomTo(targetX: number, targetY: number, targetWidth: number, targetHeight: number): void {
    this.targetViewBox = {
      x: Math.max(0, Math.min(targetX, 1920 - targetWidth)),
      y: Math.max(0, Math.min(targetY, 1080 - targetHeight)),
      width: targetWidth,
      height: targetHeight
    };
    if (!this.isAnimating) {
      this.isAnimating = true;
      requestAnimationFrame(this.updateCameraLoop.bind(this));
    }
  }

  public resetView(): void {
    this.targetViewBox = { ...this.DEFAULT_VIEWBOX };
    if (!this.isAnimating) {
      this.isAnimating = true;
      requestAnimationFrame(this.updateCameraLoop.bind(this));
    }
  }

  public pan(deltaX: number, deltaY: number): void {
    if (this.currentViewBox.width >= 1920) return;

    const maxPanX = 1920 - this.currentViewBox.width;
    const maxPanY = 1080 - this.currentViewBox.height;

    this.targetViewBox.x = Math.max(0, Math.min(this.targetViewBox.x + deltaX, maxPanX));
    this.targetViewBox.y = Math.max(0, Math.min(this.targetViewBox.y + deltaY, maxPanY));

    if (!this.isAnimating) {
      this.isAnimating = true;
      requestAnimationFrame(this.updateCameraLoop.bind(this));
    }
  }

  private updateCameraLoop(): void {
    this.currentViewBox.x += (this.targetViewBox.x - this.currentViewBox.x) * this.easeFactor;
    this.currentViewBox.y += (this.targetViewBox.y - this.currentViewBox.y) * this.easeFactor;
    this.currentViewBox.width += (this.targetViewBox.width - this.currentViewBox.width) * this.easeFactor;
    this.currentViewBox.height += (this.targetViewBox.height - this.currentViewBox.height) * this.easeFactor;

    this.svgElement.setAttribute(
      'viewBox',
      `${this.currentViewBox.x} ${this.currentViewBox.y} ${this.currentViewBox.width} ${this.currentViewBox.height}`
    );

    const diff = Math.abs(this.targetViewBox.x - this.currentViewBox.x) +
                 Math.abs(this.targetViewBox.width - this.currentViewBox.width);

    if (diff > 0.1) {
      requestAnimationFrame(this.updateCameraLoop.bind(this));
    } else {
      this.isAnimating = false;
    }
  }

  private initEventListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.resetView();
      if (e.key === 'w' || e.key === 'ArrowUp') this.pan(0, -40);
      if (e.key === 's' || e.key === 'ArrowDown') this.pan(0, 40);
      if (e.key === 'a' || e.key === 'ArrowLeft') this.pan(-40, 0);
      if (e.key === 'd' || e.key === 'ArrowRight') this.pan(40, 0);
    });
  }
}

```

## **3. Système d'Animations SVG & Interactions**

### **Découpage Sémantique des Calques SVG**

Chaque SVG de salle respecte une hiérarchie stricte via des éléments `<g>` dotés d'identifiants univoques (`id`) et d'attributs `data-hotspot` pour la détection d'événements :

```
<svg viewBox="0 0 1920 1080" id="escape-room-svg">
  
  <g id="layer-background">
    <rect width="1920" height="1080" fill="#171F1A" />
    <path id="wall-panels" fill="url(#wood-gradient)" d="..." />
  </g>

  
  <g id="layer-ambient-mechanics">
    <g id="ambient-gear-group-1" class="css-spin-clockwise">
      <circle cx="400" cy="300" r="45" fill="url(#brass-gradient)" />
    </g>
    <g id="steam-pipe-vent" filter="url(#steam-filter)">
      <path id="steam-cloud-1" class="css-steam-float" d="..." fill="#AAB5AB" opacity="0.4" />
    </g>
  </g>

  
  <g id="layer-interactive-objects">
    <g id="hotspot-workbench" class="interactive-element">
      <rect x="200" y="600" width="350" height="200" fill="#4A3F32" />
      <g id="drawer-sliding-group">
        <rect x="220" y="650" width="140" height="60" fill="url(#copper-gradient)" />
        <circle id="drawer-keyhole" cx="290" cy="680" r="6" fill="#171F1A" />
      </g>
    </g>
  </g>

  
  <g id="layer-overlay-fx">
    <circle id="ether-lens-overlay" cx="0" cy="0" r="120" fill="none" stroke="#A3BC94" stroke-width="3" opacity="0" pointer-events="none" filter="url(#amber-glow)" />
  </g>
</svg>
```

### **Catalogue d'Animations**

#### **1. Animations d'Ambiance en Boucle (CSS Pures)**

```
.css-spin-clockwise {
  transform-box: fill-box;
  transform-origin: center;
  animation: spinClockwise 12s linear infinite;
}

.css-spin-counter-clockwise {
  transform-box: fill-box;
  transform-origin: center;
  animation: spinCounterClockwise 8s linear infinite;
}

@keyframes spinClockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spinCounterClockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.gauge-needle-oscillate {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: needleJitter 2.5s ease-in-out infinite alternate;
}

@keyframes needleJitter {
  0% { transform: rotate(-2deg); }
  50% { transform: rotate(3deg); }
  100% { transform: rotate(-1deg); }
}

.interactive-element {
  cursor: pointer;
  transition: filter 0.3s ease;
}

.interactive-element:hover {
  filter: drop-shadow(0px 0px 8px #D7A254);
}

.hotspot-highlight-pulse {
  animation: radarPulse 1.2s ease-in-out 3;
}

@keyframes radarPulse {
  0% { filter: drop-shadow(0px 0px 2px #D7A254); }
  50% { filter: drop-shadow(0px 0px 15px #D7A254); }
  100% { filter: drop-shadow(0px 0px 2px #D7A254); }
}

```

#### **2. Animations Événementielles (JS & GSAP)**

```
// AnimationFX.ts
import gsap from 'gsap';

export class AnimationManager {
  public static openDrawer(drawerGroupId: string): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(`#${drawerGroupId}`, {
        x: -80,
        y: 30,
        duration: 0.8,
        ease: 'back.out(1.4)',
        onComplete: () => resolve()
      });
    });
  }

  public static triggerLockedFeedback(elementId: string): void {
    gsap.to(`#${elementId}`, {
      x: '+=6',
      duration: 0.06,
      repeat: 5,
      yoyo: true,
      ease: 'power1.inOut',
      onComplete: () => {
        gsap.set(`#${elementId}`, { x: 0 });
      }
    });
  }
}

```

## **4. Customisation de Personnage Steampunk 100 % SVG**

### **Modèle de Données & Configuration TypeScript**

```
// AvatarTypes.ts
export type CoatColor = '#171F1A' | '#763D32' | '#758076' | '#596C59';
export type MetalFinish = 'brass' | 'copper' | 'dark-steel' | 'polished-gold';
export type HeadgearOption = 'top-hat-goggles' | 'aviator-helmet' | 'clockwork-monocle' | 'none';
export type MechanicalArmType = 'pneumatic-claw' | 'ether-injector' | 'precision-tweezers';
export type ActiveTool = 'magnifying-monocle' | 'ether-lamp' | 'clockwork-key';

export interface SteampunkAvatarConfig {
  coatColor: CoatColor;
  metalFinish: MetalFinish;
  headgear: HeadgearOption;
  armType: MechanicalArmType;
  equippedTool: ActiveTool;
  name: string;
}

```

### **Structure par Calques Superposés (`avatar-steampunk.svg`)**

```
<svg viewBox="0 0 400 600" id="avatar-customizer-svg">
  <defs>
    <linearGradient id="avatar-metal-finish" x1="0%" y1="0%" x2="100%" y2="100%">
      
    </linearGradient>
  </defs>

  <g id="avatar-base-body">
    <path id="avatar-coat" fill="#596C59" d="..." />
    <path id="avatar-vest" fill="#171F1A" d="..." />
  </g>

  <g id="avatar-mechanical-arm" transform-origin="120 250">
    <g id="arm-segment-shoulder" fill="url(#avatar-metal-finish)">
      <circle cx="120" cy="250" r="22" />
    </g>
    <g id="arm-segment-forearm" fill="url(#avatar-metal-finish)">
      <rect x="110" y="270" width="20" height="90" rx="5" />
    </g>
    <g id="arm-tool-attachment"></g>
  </g>

  <g id="avatar-head-group">
    <circle id="avatar-head" cx="200" cy="150" r="45" fill="#E5C3A6" />
    <g id="avatar-headgear">
      <g id="headgear-top-hat-goggles" class="avatar-layer-hidden">
        <path d="..." fill="#171F1A" />
        <circle cx="185" cy="140" r="14" fill="url(#brass-gradient)" />
        <circle cx="215" cy="140" r="14" fill="url(#brass-gradient)" />
      </g>
    </g>
  </g>
</svg>
```

### **Matrice d'Impact selon l'Outil Équipé**

| Outil Équipé | Effet Visuel en Jeu (Layer Overlay) | Impact Concret sur le Gameplay Point & Click | 
| ----- | ----- | ----- | 
| **Monocle d'Analyse** | Lentille avec bordure ambrée (`#D7A254`) | Révèle les micro-gravures, numéros de série secrets et indices dissimulés. |
| **Lampe à Éther** | Faisceau vert délavé (`#A3BC94`) | Révèle les fuites de vapeur invisibles, empreintes et flux d'énergie. |
| **Clé d'Horloger** | Icône d'outil mécanique liée au curseur | Permet de démonter directement certains boîtiers et petites vis. | 

### **Gestionnaire d'État & Sauvegarde `LocalStorage`**

```
// AvatarState.ts
import { SteampunkAvatarConfig } from './AvatarTypes';

export class AvatarManager {
  private static STORAGE_KEY = 'atherlock_avatar_config';

  private defaultConfig: SteampunkAvatarConfig = {
    coatColor: '#596C59',
    metalFinish: 'brass',
    headgear: 'top-hat-goggles',
    armType: 'pneumatic-claw',
    equippedTool: 'magnifying-monocle',
    name: 'Explorateur'
  };

  private currentConfig: SteampunkAvatarConfig;

  constructor() {
    this.currentConfig = this.loadConfig();
  }

  public getConfig(): SteampunkAvatarConfig {
    return { ...this.currentConfig };
  }

  public updateConfig(partialConfig: Partial<SteampunkAvatarConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...partialConfig };
    this.applyConfigToSVG();
    this.saveConfig();
  }

  public applyConfigToSVG(): void {
    const coatElement = document.getElementById('avatar-coat');
    if (coatElement) {
      coatElement.setAttribute('fill', this.currentConfig.coatColor);
    }

    const headgearGroups = ['top-hat-goggles', 'aviator-helmet', 'clockwork-monocle'];
    headgearGroups.forEach((id) => {
      const el = document.getElementById(`headgear-${id}`);
      if (el) {
        el.style.display = (this.currentConfig.headgear === id) ? 'block' : 'none';
      }
    });
  }

  private saveConfig(): void {
    localStorage.setItem(AvatarManager.STORAGE_KEY, JSON.stringify(this.currentConfig));
  }

  private loadConfig(): SteampunkAvatarConfig {
    const stored = localStorage.getItem(AvatarManager.STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.defaultConfig;
  }
}

```

### **Récapitulatif Technique de la Customisation Avatar**

* **Ordre d'empilement des calques SVG :** Arrière-plan -> Socle & Engrenages -> Corps & Manteau (`#avatar-base-body`) -> Tête & Visage (`#avatar-head-group`) -> Couvre-chef (`#avatar-headgear`) -> Prothèse de bras (`#avatar-mechanical-arm`).

* **6 options de customisation :** Nom de code (`name`), couleur du manteau (`coatColor`), alliage métallique (`metalFinish`), couvre-chef (`headgear`), prothèse de bras (`armType`) et outil actif (`equippedTool`).

* **Raccourcis clavier :** `R` pour tirage aléatoire, `Entrée` pour valider et lancer la suite, avec clonage du portrait vectoriel dans le médaillon HUD.

## **5. Nomenclature & Architecture des Dossiers (Assets, HTML, CSS, JavaScript, Documentation)**

Le projet **AFTERLOCK : L’Échappée** suit l’organisation montrée dans l’explorateur VS Code. Les pages destinées à l’hébergement restent à la racine; les ressources complémentaires sont regroupées dans `docs/`, avec les médias dans `docs/assets/` et les fichiers CSS, HTML et JavaScript complémentaires dans leurs dossiers dédiés.

### **Arborescence du Workspace**

```
AFTERLOCK-XM/
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
│   │   │   └── index.html
│   │   ├── dev/
│   │   │   └── index.html
│   │   ├── info/
│   │   │   └── index.html
│   │   ├── mode/
│   │   │   └── index.html
│   │   └── options/
│   │       └── index.html
│   ├── js/
│   │   ├── 404/index.js
│   │   ├── accueil/index.js
│   │   ├── commun/
│   │   │   ├── content.js
│   │   │   └── preferences.js
│   │   ├── createur-personnage/createur-personnage.js
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
├── index.html
├── 404.html
└── README.md

```

### **Tableau des Règles de Nomenclature par Section**

| Section | Rôle des Dossiers & Fichiers | Convention de Nommage | Exemples | 
| ----- | ----- | ----- | ----- | 
| **Assets** | Médias regroupés dans `docs/assets/`, puis classés par format et usage. | Dossiers en français et en `kebab-case`; noms d’assets descriptifs. | `docs/assets/svg/forge/`, `docs/assets/audio/sound-effects/`, `docs/assets/svg/identite/favicon.svg` | 
| **HTML** | Accueil et page 404 à la racine; un dossier par page complémentaire dans `docs/html/`. | Noms descriptifs en `kebab-case`; `index.html` comme point d’entrée. | `index.html`, `404.html`, `docs/html/info/index.html`, `docs/html/options/index.html` |
| **Données** | Textes principaux et commandes des pages publiques dans `docs/data/`. | JSON UTF-8; préférences personnelles enregistrées dans le navigateur. | `docs/data/content.json` |
| **CSS** | Styles par page dans `docs/css/`; styles partagés dans `commun/`. | Un dossier et un fichier nommés par page; feuille commune `site.css`. | `docs/css/accueil/accueil.css`, `docs/css/commun/site.css` |
| **JavaScript** | Scripts par page dans `docs/js/`; scripts partagés dans `commun/`. | Un dossier par page; fonctions en `camelCase`; classes en `PascalCase`. | `docs/js/accueil/index.js`, `docs/js/commun/preferences.js` |
| **Documentation** | Guides, nomenclature et cartes d’assets dans `documentation/`. | Garder le suffixe `XM` du document principal; conventions `README.md`, `AGENTS.md`. | `documentation/AFTERLOCK-ESCAPE-ROOM-XM.md` | 
| **Configuration VS Code** | Préférences communes à l’espace de travail. | Garder les réglages dans le dossier conventionnel `.vscode/`. | `.vscode/settings.json` | 
| **Performance / Tests** | Correctifs dans `lag-fix/`; vérifications dans `tests/`. | Noms courts et descriptifs en `kebab-case`. | `lag-fix/`, `tests/` | 

## **6. Choix de Salles & Styles de Maps**

Le jeu **AFTERLOCK : L’Échappée** proposera **plusieurs** choix de salles **/ maps** avec des styles d'ambiance variés (environnements Steampunk, ateliers, salles techniques, etc.), incluant notamment **un style crossover Call of Duty x Zombie** (ambiance sombre, bunker/zone infectée, éléments d'ambiance et mécaniques à définir).

> **Énigmes & Mécaniques (WIP) :** Aucune énigme n'est décrite ni figée pour l'instant. Les mécaniques et énigmes de chaque salle ne sont **pas encore finies à 100 %** et seront ajoutées ultérieurement.

## **7. Workflow VS Code & Feuille de Route**

### **Étapes de Développement**

1. **Squelette SVG & Personnalisation de l'Avatar** : structure Vite + TypeScript, calques SVG de l'avatar, écran de customisation et sauvegarde `SteampunkAvatarConfig`.

2. **Sélection de Salle, Caméra `viewBox` & Hotspots** : sélecteur multi-salles, interpolation fluide du `viewBox`, clic sur `data-hotspot` et radar (`Tab` / `H`).

3. **Logique des Énigmes & Inventaire (WIP)** : intégration progressive des énigmes et mécaniques au fur et à mesure de leur conception.

4. **Outils Spéciaux & Overlays** : raccourci `F`, calque suivant le curseur et révélation conditionnelle d'indices SVG.

5. **Audio (Howler.js), Effets & Optimisations** : boucle d'ambiance, SFX, filtre `<feTurbulence>` et maintien des performances.

### **Règles de Développement**

* **Isolation SVG** : séparer les styles globaux CSS des définitions/filtres réutilisables dans `<defs>`.

* **Précision des Transformations** : utiliser les coordonnées natives ou des propriétés compatibles avec `transform-box: fill-box`.

* **Modularité TypeScript** : séparer la manipulation directe du DOM SVG de la logique métier.

* **Clarté du Code** : privilégier des extraits complets et typés sans raccourcis implicites.