/* LAST REFUGE · XM — Escape room « Sas 07 » : chargeur.
   1. importe three.js et ses modules complémentaires, puis la bibliothèque du personnage (assets/creation-personnage) ;
   2. attend les polices utilisées par les textures ;
   3. exécute les fichiers du jeu dans l’ordre (ils partagent la même portée globale). */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import * as CL from '../../../assets/creation-personnage/personnage_armes.js';
import * as ZombieAssets from '../../../assets/zombie/zombie.js';

Object.assign(window, {
  THREE,
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  OutlinePass,
  OutputPass,
  ShaderPass,
  RoomEnvironment,
  RoundedBoxGeometry,
  GLTFLoader,
  Octree,
  Capsule,
  zombieMapBase: new URL('../../../assets/zombie-map/', import.meta.url).href,
  CL,
  ZombieAssets
});

if (document.fonts)
  await Promise.race([
    Promise.all(
      [
        '700 30px Caveat',
        '30px "Special Elite"',
        '30px "Rock Salt"',
        '700 30px "Stardos Stencil"',
        '30px VT323'
      ].map((f) => document.fonts.load(f))
    ),
    new Promise((r) => setTimeout(r, 3500))
  ]).catch(() => {});

export const FICHIERS = [
  '01-configuration.js',
  '02-textures.js',
  '03-materiaux.js',
  '04-moteur.js',
  '05-objets-interactifs.js',
  '06-niveau-structure.js',
  'salles/salle-01-sas.js',
  'salles/salle-02-controle.js',
  'salles/salle-03-dortoir.js',
  'salles/salle-04-distribution.js',
  'salles/salle-05-hangar.js',
  'salles/salle-06-hangar-sud.js',
  'salles/salle-07-entrepot.js',
  'salles/salle-08-commandement.js',
  'salles/salle-09-quartiers.js',
  'salles/sol-escaliers.js',
  'salles/salle-10-blocs-cellulaires.js',
  'salles/salle-11-ligne-de-coupure.js',
  '07-combat-infectes.js',
  '08-camera.js',
  '09-son.js',
  '10-controles.js',
  '11-lampe-torche.js',
  '12-raycasting.js',
  '13-hud.js',
  '14-enigmes.js',
  '15-quetes-annexes.js',
  '16-surveillance-carte.js',
  '23-cartes.js',
  '17-personnage-joueur.js',
  '18-post-traitement.js',
  '19-boucle.js',
  '20-visionneuse-objets.js',
  '21-dev-mode.js',
  '22-reglages-manette.js'
];

// Les fichiers sont lus puis exécutés comme un seul script, dans l’ordre :
// les fonctions déclarées plus loin restent utilisables plus haut (comme dans le fichier d’origine).
const base = new URL('./', import.meta.url);
const version = new URL(import.meta.url).searchParams.get('v');
const sources = await Promise.all(
  FICHIERS.map(async (f) => {
    const url = new URL(f, base);
    if (version) url.searchParams.set('v', version);
    const r = await fetch(url);
    if (!r.ok) throw new Error('Chargement impossible : ' + f + ' (' + r.status + ')');
    return '\n/* ===== ' + f + ' ===== */\n' + (await r.text());
  })
);
const jeu = document.createElement('script');
jeu.textContent =
  "'use strict';" + sources.join('\n') + '\n//# sourceURL=' + new URL('sas-07-jeu.js', base).href;
document.body.appendChild(jeu);
document.documentElement.dataset.ready = '1';
