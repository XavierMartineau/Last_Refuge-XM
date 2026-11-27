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
import * as CL from '../../../assets/creation-personnage/personnage_armes.js?v=20261126l';
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

const loading = document.getElementById('game-loading');
const loadingStatus = document.getElementById('game-load-status');
const loadingProgress = document.getElementById('game-load-progress');
function progress(label, done, total) {
  loadingStatus.textContent = label;
  if (Number.isFinite(done) && Number.isFinite(total) && total > 0) {
    loadingProgress.max = total;
    loadingProgress.value = Math.min(done, total);
  } else loadingProgress.removeAttribute('value');
}
const waitForPaint = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
function blockGameKeys(event) {
  if (loading.contains(event.target)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}
window.addEventListener('keydown', blockGameKeys, true);
window.addEventListener('keyup', blockGameKeys, true);

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

try {
  progress('Chargement des polices et des éléments d’interface…');
  await waitForPaint();
  if (document.fonts) await Promise.race([
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
  ]);

// Les fichiers sont lus puis exécutés comme un seul script, dans l’ordre :
// les fonctions déclarées plus loin restent utilisables plus haut (comme dans le fichier d’origine).
const base = new URL('./', import.meta.url);
const version = new URL(import.meta.url).searchParams.get('v');
let loaded = 0;
progress('Téléchargement des fichiers du jeu…', 0, FICHIERS.length);
const sources = await Promise.all(
  FICHIERS.map(async (f) => {
    const url = new URL(f, base);
    if (version) url.searchParams.set('v', version);
    const r = await fetch(url);
    if (!r.ok) throw new Error('Chargement impossible : ' + f + ' (' + r.status + ')');
    const source = await r.text();
    progress('Fichiers du jeu : ' + ++loaded + ' / ' + FICHIERS.length + ' · ' + f, loaded, FICHIERS.length);
    return '\n/* ===== ' + f + ' ===== */\n' + source;
  })
);
progress('Construction du bunker, des objets et des textures…');
await waitForPaint();
const jeu = document.createElement('script');
jeu.textContent =
  "'use strict';" + sources.join('\n') + '\n//# sourceURL=' + new URL('sas-07-jeu.js', base).href;
let startupError = null;
const captureStartupError = (event) => { startupError = event.error || new Error(event.message); };
window.addEventListener('error', captureStartupError);
try {
  document.body.appendChild(jeu);
} finally {
  window.removeEventListener('error', captureStartupError);
}
if (startupError) throw startupError;
if (typeof window.prepareSas07 !== 'function' || typeof window.startSas07 !== 'function')
  throw new Error('Initialisation du jeu incomplète.');
await window.prepareSas07(progress);
loading.hidden = true;
window.removeEventListener('keydown', blockGameKeys, true);
window.removeEventListener('keyup', blockGameKeys, true);
window.startSas07();
document.documentElement.dataset.ready = '1';
} catch (error) {
  console.error('Chargement du jeu impossible :', error);
  progress('Chargement impossible : ' + error.message + '. Vérifiez la connexion et réessayez.');
  document.getElementById('game-load-retry').hidden = false;
}
