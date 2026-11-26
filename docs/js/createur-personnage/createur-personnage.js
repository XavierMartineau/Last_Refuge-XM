/* LAST REFUGE · XM — Fiche d’écrou 3D (créateur de détenu).
   Scène, caméra, interface et exports. Les modèles du personnage (tête, cheveux, tenues, armes…)
   sont rangés par type dans docs/assets/creation-personnage/ et importés via son index. */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const $ = (id) => document.getElementById(id),
  clamp = (v, a, b) => Math.max(a, Math.min(b, v));
import * as CL from '../../assets/creation-personnage/personnage_armes.js';
const {
  D,
  NAMES,
  LABEL,
  STEPS,
  STEP_DETAILS,
  GENDERS,
  REGS,
  sanitize,
  choiceName,
  labelOf,
  emptyChoices,
  buildCharacter,
  weaponStats,
  WSLOTS,
  WCTX,
  BOOTCOL,
  GLOVECOL,
  WFIN,
  SPX
} = CL;
/* ════════════════════════════════════════════════════════════════
   7. SCÈNE : rendu, studio (lumières), décor du fond, caméra, nom
   ════════════════════════════════════════════════════════════════ */
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // reflets réalistes sur cuir, métal et tissu
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x3a3028, 0.35));
const key = new THREE.DirectionalLight(0xfff0dd, 2.4);
key.position.set(2.2, 3.2, 3);
key.castShadow = true;
key.shadow.mapSize.set(4096, 4096);
Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 2.4, bottom: -0.4, near: 0.5, far: 10 });
key.shadow.bias = -0.0003;
key.shadow.normalBias = 0.02;
scene.add(key);
const rim = new THREE.DirectionalLight(0x9fc4ff, 1.4);
rim.position.set(-3, 2.4, -2.5);
scene.add(rim);
const kick = new THREE.DirectionalLight(0xffc98a, 0.9);
kick.position.set(3, 1.6, -2);
scene.add(kick);
const topS = new THREE.SpotLight(0xffffff, 22, 9, 0.55, 0.75, 2);
topS.position.set(0, 4.2, 0.6);
topS.target.position.set(0, 1, 0);
scene.add(topS, topS.target);
const fillL = new THREE.PointLight(0xffd9c0, 0.8, 8, 2);
fillL.position.set(-1.6, 1.4, 2.4);
scene.add(fillL);
// sol-socle
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(1.5, 48),
  new THREE.MeshStandardMaterial({ color: 0x1c1b19, roughness: 0.6, metalness: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const ring = new THREE.Mesh(
  new THREE.RingGeometry(0.62, 0.64, 64),
  new THREE.MeshBasicMaterial({ color: 0xf2b705, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.002;
scene.add(ring);

/* Fond : dôme dégradé + motif (7 motifs) dessiné sur canvas à partir des palettes BGP de la version 2D */
const dome = new THREE.Mesh(
  new THREE.SphereGeometry(20, 32, 16),
  new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false })
);
dome.position.y = 2;
scene.add(dome);
function paintBackdrop(bi, pi) {
  const [c0, c1] = D.BGP[bi] || D.BGP[0],
    cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 512;
  const x = cv.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, c0);
  gr.addColorStop(1, c1);
  x.fillStyle = gr;
  x.fillRect(0, 0, 1024, 512);
  x.globalAlpha = 0.16;
  x.strokeStyle = x.fillStyle = '#ffffff';
  x.lineWidth = 3;
  const pat = [
    () => {}, // 0 uni
    () => {
      for (let i = -512; i < 1024; i += 44) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i + 512, 512);
        x.stroke();
      }
    }, // 1 diagonales
    () => {
      for (let i = 0; i < 1024; i += 56) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, 512);
        x.stroke();
      }
    }, // 2 verticales
    () => {
      for (let i = 0; i < 1024; i += 48)
        for (let j = 0; j < 512; j += 48) {
          x.beginPath();
          x.arc(i + 24, j + 24, 5, 0, 6.3);
          x.fill();
        }
    }, // 3 points
    () => {
      for (let i = 0; i < 1024; i += 64)
        for (let j = 0; j < 512; j += 64) {
          x.strokeRect(i + 8, j + 8, 48, 48);
        }
    }, // 4 carreaux
    () => {
      for (let i = 0; i < 12; i++) {
        x.beginPath();
        x.arc(512, 512, 40 + i * 46, Math.PI, 0);
        x.stroke();
      }
    }, // 5 arcs
    () => {
      for (let i = 0; i < 260; i++) {
        x.beginPath();
        x.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 3 + 1, 0, 6.3);
        x.fill();
      }
    }
  ]; // 6 poussière
  (pat[pi] || pat[0])();
  x.globalAlpha = 1;
  const vg = x.createRadialGradient(512, 300, 60, 512, 300, 520);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.55)');
  x.fillStyle = vg;
  x.fillRect(0, 0, 1024, 512);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  if (dome.material.map) dome.material.map.dispose();
  dome.material.map = t;
  dome.material.needsUpdate = true;
  scene.background = null;
  const c = new THREE.Color(c1).lerp(new THREE.Color(0x000000), 0.35);
  floor.material.color.copy(c);
}

/* Nom du personnage : sprite canvas qui flotte au-dessus de la tête (polices, couleurs, styles, tailles et positions de la version 2D) */
const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false }));
nameSprite.renderOrder = 10;
scene.add(nameSprite);
function paintName(st) {
  const txt = st.name || '';
  nameSprite.visible = !!txt;
  if (!txt) return;
  const cv = document.createElement('canvas'),
    x = cv.getContext('2d');
  cv.width = 1024;
  cv.height = 256;
  const fnt = (D.NFONTS[st.nameFont] || D.NFONTS[0])[1],
    col = D.NCOL[st.nameColor] || '#ffffff',
    size = [70, 92, 118, 146][st.nameSize] || 92,
    style = st.nameStyle;
  x.font = `bold ${size}px ${fnt}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineJoin = 'round';
  const cx = 512,
    cy = 128;
  if (style === 0) {
    x.lineWidth = size * 0.14;
    x.strokeStyle = '#000';
    x.strokeText(txt, cx, cy);
  }
  if (style === 1) {
    x.shadowColor = 'rgba(0,0,0,.9)';
    x.shadowBlur = 14;
    x.shadowOffsetY = 6;
  }
  if (style === 2) {
    x.lineWidth = size * 0.22;
    x.strokeStyle = '#000';
    x.strokeText(txt, cx, cy);
  }
  if (style === 3) {
    x.fillStyle = 'rgba(8,10,8,.78)';
    const w = x.measureText(txt).width + 70;
    x.fillRect(cx - w / 2, cy - size * 0.62, w, size * 1.24);
    x.fillStyle = col;
    x.fillRect(cx - w / 2, cy + size * 0.52, w, 6);
  }
  if (style === 4) {
    x.shadowColor = col;
    x.shadowBlur = 34;
    x.fillStyle = col;
    x.fillText(txt, cx, cy);
    x.fillText(txt, cx, cy);
  }
  x.fillStyle = col;
  x.fillText(txt, cx, cy);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  if (nameSprite.material.map) nameSprite.material.map.dispose();
  nameSprite.material.map = t;
  nameSprite.material.needsUpdate = true;
  nameSprite.scale.set(1.8, 0.45, 1);
  st.namePos ? nameSprite.position.set(0, 2.1, 0) : nameSprite.position.set(0, 0.14, 0.75);
}
const LAST = STEPS.length - 1;

/* ════════════════════════════════════════════════════════════════
   8. CAMÉRA : OrbitControls + cadrages (corps entier / buste / visage) avec transition douce
   ════════════════════════════════════════════════════════════════ */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.55;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI * 0.52;
controls.enablePan = false;
const SHOTS = {
  full: { p: [0, 1.15, 4.7], t: [0, 0.92, 0] },
  bust: { p: [0, 1.4, 2.3], t: [0, 1.28, 0] },
  face: { p: [0, 1.6, 1.05], t: [0, 1.58, 0] },
  back: { p: [0, 1.15, -4.7], t: [0, 0.92, 0] },
  legs: { p: [0, 0.55, 2.7], t: [0, 0.5, 0] },
  feet: { p: [0.5, 0.3, 1.5], t: [0, 0.1, 0.05] },
  arm: { p: [1.1, 1.1, 1.6], t: [0.25, 1.0, 0.1] },
  weapon: { p: [0.9, 1.3, 2.0], t: [0, 1.15, 0.35] }
};
let goal = null;
function shot(k) {
  const a = SHOTS[k];
  goal = { p: new THREE.Vector3(...a.p), t: new THREE.Vector3(...a.t) };
  document
    .querySelectorAll('[data-shot]')
    .forEach((b) => b.setAttribute('aria-pressed', b.dataset.shot === k));
}
controls.addEventListener('start', () => {
  goal = null;
});
camera.position.set(...SHOTS.full.p);
controls.target.set(...SHOTS.full.t);
function resize() {
  const r = stage.getBoundingClientRect(),
    w = Math.max(200, r.width),
    h = Math.max(200, r.height);
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = w + 'px';
  renderer.domElement.style.height = h + 'px';
  camera.aspect = w / h;
  camera.fov = w / h < 0.8 ? 44 : 32;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);

/* ════════════════════════════════════════════════════════════════
   9. ÉTAT DU PERSONNAGE + interface (étapes, onglets de type, galerie de choix, nom, JSON, sauvegardes)
   ════════════════════════════════════════════════════════════════ */
let state = sanitize({}),
  step = 0,
  character = null,
  lastBg = -1,
  lastPat = -1;
const KEY = 'lastrefuge-3d-character',
  GKEY = 'lastrefuge-3d-gallery';
const lsGet = (k) => {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  lsSet = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  };
const COLORS = {
  skin: () => (state.gender === 'other' ? D.FANT : D.HUMAN),
  eyeColor: () => D.EYECOL,
  hairColor: () => D.HAIRCOL,
  outfitColor: () => D.OUTCOL,
  accColor: () => D.ACCCOL,
  nameColor: () => D.NCOL,
  pantsColor: () => D.OUTCOL,
  bootsColor: () => BOOTCOL,
  glovesColor: () => GLOVECOL,
  wFinish: () => WFIN
};
function refresh() {
  state = sanitize(state);
  if (character) {
    scene.remove(character);
    character.userData.dispose && character.userData.dispose();
  }
  character = buildCharacter(state);
  scene.add(character);
  if (state.background !== lastBg || state.pattern !== lastPat) {
    paintBackdrop(state.background, state.pattern);
    lastBg = state.background;
    lastPat = state.pattern;
  }
  paintName(state);
  lsSet(KEY, JSON.stringify(state));
  $('json').value = JSON.stringify(state, null, 1);
  renderControls();
}
function setVal(k, v) {
  state[k] = v;
  if (k === 'species' && D.PRESETS[v]) {
    const reg = REGS(state.gender);
    for (const [pk, pv] of Object.entries(D.PRESETS[v])) if (pk in reg && pv < reg[pk]) state[pk] = pv;
  } // chaque espèce applique un look de départ
  refresh();
}
function setGender(g) {
  state.gender = g;
  state = sanitize(state);
  refresh();
}

/* ── colonne de droite ── */
function renderSteps() {
  $('steps').innerHTML = STEPS.map(
    (s, i) => `<button type="button" data-step="${i}" aria-current="${i === step}">${s.t}</button>`
  ).join('');
  $('steps')
    .querySelectorAll('button')
    .forEach(
      (b) =>
        (b.onclick = () => {
          step = +b.dataset.step;
          renderSteps();
          renderControls();
        })
    );
  $('step-title').textContent = STEP_DETAILS[step][0];
  $('step-description').textContent = STEP_DETAILS[step][1];
  $('step-label').textContent = `ÉTAPE 0${step + 1} / 0${STEPS.length}`;
  $('tabs').hidden = $('type-label').hidden = step !== 0;
  $('nameBox').hidden = $('jsonbox').hidden = step !== LAST;
  $('back').hidden = step === 0;
  $('next').hidden = step === LAST;
  $('finish').hidden = step !== LAST;
}
function swatchOf(k, i) {
  {
    const u = optThumb(k, i);
    if (u) return `<img class='thumb' alt='' src='${u}'>`;
  }
  if (COLORS[k]) return `<i class="sw" style="background:${COLORS[k]()[i]}"></i>`;
  if (k === 'background') {
    const p = D.BGP[i];
    return `<i class="sw" style="background:linear-gradient(${p[0]},${p[1]})"></i>`;
  }
  return '';
}
function renderControls() {
  WCTX.w = state.weapon;
  const reg = REGS(state.gender),
    keys = STEPS[step].keys.filter(
      (k) => k in reg && (k[0] !== 'w' || k === 'weapon' || (WSLOTS[state.weapon] || []).includes(k))
    ),
    box = $('controls');
  $('tabs').innerHTML = Object.entries(GENDERS)
    .map(([g, l]) => `<button type="button" data-g="${g}" aria-pressed="${state.gender === g}">${l}</button>`)
    .join('');
  $('tabs')
    .querySelectorAll('button')
    .forEach((b) => (b.onclick = () => setGender(b.dataset.g)));
  box.innerHTML = keys
    .map(
      (k) => `<div class="row"><span class="lab">${labelOf(k)}</span>
    <button type="button" class="arr" data-k="${k}" data-d="-1" aria-label="Précédent">‹</button>
    <button type="button" class="val" data-open="${k}">${swatchOf(k, state[k])}<span>${choiceName(k, state[k], state.gender)}</span><small>${state[k] + 1}/${reg[k]}</small></button>
    <button type="button" class="arr" data-k="${k}" data-d="1" aria-label="Suivant">›</button></div>`
    )
    .join('');
  box.querySelectorAll('.arr').forEach(
    (b) =>
      (b.onclick = () => {
        const k = b.dataset.k,
          n = reg[k];
        setVal(k, (state[k] + +b.dataset.d + n) % n);
      })
  );
  box.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => openGallery(b.dataset.open)));
  renderStats();
  $('name').value = state.name;
  armDirty = true;
}
function renderStats() {
  const e = $('wstats'),
    st = weaponStats(state),
    show = STEPS[step].keys.includes('weapon') && st;
  e.hidden = !show;
  if (!show) return;
  const row = (l, v, p, u = '') =>
    `<div class="st"><span>${l}</span><div><i style="width:${clamp(p, 0, 1) * 100}%"></i></div><b>${v}${u}</b></div>`;
  e.innerHTML =
    `<h3>${st.name} — ${st.cat}</h3>` +
    row('Dégâts', st.dmg, st.dmg / 150) +
    row('Cadence', st.rate, Math.sqrt(st.rate / 3000), ' c/min') +
    row('Portée', st.range, Math.sqrt(st.range / 400), ' m') +
    row('Précision', st.acc, st.acc / 100) +
    row('Recul', st.recoil, st.recoil / 100) +
    row('Bruit', st.noise, st.noise / 140) +
    row('Poids', st.wt, st.wt / 20, ' kg') +
    (st.mag ? row('Capacité', st.mag, Math.sqrt(st.mag / 200), ' coups') : '');
}
/* ── fenêtre de choix : grille d’options, l’aperçu 3D se met à jour en direct ── */
let galKey = null;
function openGallery(k) {
  galKey = k;
  WCTX.w = state.weapon;
  const reg = REGS(state.gender),
    dlg = $('gallery-dialog');
  $('gallery-title').textContent = labelOf(k);
  $('gallery-options').innerHTML = [...Array(reg[k]).keys()]
    .map(
      (i) =>
        `<button type="button" class="opt" data-i="${i}" aria-pressed="${state[k] === i}">${swatchOf(k, i)}<span>${choiceName(k, i, state.gender)}</span></button>`
    )
    .join('');
  $('gallery-options')
    .querySelectorAll('.opt')
    .forEach(
      (b) =>
        (b.onclick = () => {
          setVal(k, +b.dataset.i);
          $('gallery-options')
            .querySelectorAll('.opt')
            .forEach((o) => o.setAttribute('aria-pressed', +o.dataset.i === state[k]));
        })
    );
  shot(
    {
      eyes: 'face',
      hair: 'face',
      beard: 'face',
      mouth: 'face',
      nose: 'face',
      glasses: 'face',
      brows: 'face',
      headwear: 'face',
      extra: 'face',
      specialHead: 'face',
      specialFace: 'face',
      outfit: 'bust',
      outfitColor: 'bust',
      camo: 'bust',
      gear: 'bust',
      specialBack: 'back',
      backpack: 'back',
      pants: 'legs',
      pantsColor: 'legs',
      boots: 'feet',
      bootsColor: 'feet',
      gloves: 'arm',
      glovesColor: 'arm',
      arms: 'arm'
    }[k] || (k[0] === 'w' ? 'weapon' : 'full')
  );
  dlg.showModal();
  if (embedded) window.parent.postMessage({ type: 'afterlock-creator-modal', open: true }, '*');
}
$('gallery-close').onclick = () => $('gallery-dialog').close();
$('gallery-dialog').addEventListener('close', () => {
  if (embedded) window.parent.postMessage({ type: 'afterlock-creator-modal', open: false }, '*');
  galKey = null;
  shot('full');
});

$('back').onclick = () => {
  step = Math.max(0, step - 1);
  renderSteps();
  renderControls();
};
$('next').onclick = () => {
  step = Math.min(LAST, step + 1);
  renderSteps();
  renderControls();
};
$('name').addEventListener('input', (e) => {
  state.name = e.target.value.slice(0, 20);
  paintName(state);
  lsSet(KEY, JSON.stringify(state));
  $('json').value = JSON.stringify(state, null, 1);
});
$('rand').onclick = () => {
  const g = ['male', 'female', 'other'][(Math.random() * 3) | 0],
    reg = REGS(g),
    n = { gender: g, name: state.name };
  for (const k in reg) n[k] = emptyChoices.has(k) && Math.random() < 0.45 ? 0 : (Math.random() * reg[k]) | 0;
  if (g === 'other' && D.PRESETS[n.species]) Object.assign(n, D.PRESETS[n.species], { species: n.species });
  state = n;
  refresh();
};
$('reset').onclick = () => {
  state = sanitize({ gender: state.gender, name: state.name });
  refresh();
};
/* ── JSON : même format que la version 2D ── */
const msg = (t) => {
  $('msg').textContent = t;
};
$('load').onclick = () => {
  try {
    const raw = JSON.parse($('json').value);
    state = sanitize(raw);
    refresh();
    msg('Personnage chargé.');
  } catch (e) {
    msg('JSON invalide : ' + e.message);
  }
};
const dl = (blob, name) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
const fname = () => (state.name || 'personnage').replace(/[^\p{L}\p{N}_-]+/gu, '_');
$('dl').onclick = () => {
  dl(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }), fname() + '.json');
};
$('copy').onclick = async () => {
  try {
    await navigator.clipboard.writeText($('json').value);
    msg('JSON copié.');
  } catch (e) {
    $('json').select();
    msg('Sélectionné : faites Ctrl+C.');
  }
};
$('open-file').onclick = () => $('file').click();
$('file').onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    state = sanitize(JSON.parse(await f.text()));
    refresh();
    msg('Fichier chargé.');
  } catch (err) {
    msg('Fichier invalide.');
  }
  e.target.value = '';
};
/* ── exports 3D / image ── */
$('glb').onclick = () => {
  msg('Export .glb en cours…');
  try {
    new GLTFExporter().parse(
      character,
      (res) => {
        dl(new Blob([res], { type: 'model/gltf-binary' }), fname() + '.glb');
        msg('Fichier .glb téléchargé (modèle 3D complet).');
      },
      (err) => msg('Export impossible : ' + err.message),
      { binary: true, onlyVisible: true }
    );
  } catch (e) {
    msg('Export impossible : ' + e.message);
  }
};
$('png').onclick = () => {
  renderer.render(scene, camera);
  renderer.domElement.toBlob((b) => dl(b, fname() + '.png'));
};
$('spin').onclick = (e) => {
  controls.autoRotate = !controls.autoRotate;
  e.currentTarget.setAttribute('aria-pressed', controls.autoRotate);
};
document.querySelectorAll('[data-shot]').forEach((b) => (b.onclick = () => shot(b.dataset.shot)));
/* ── « Mes personnages » (stockés dans ce navigateur) ── */
const getGal = () => {
  try {
    return JSON.parse(lsGet(GKEY) || '[]');
  } catch (e) {
    return [];
  }
};
function thumb() {
  renderer.render(scene, camera);
  const c = document.createElement('canvas');
  c.width = 150;
  c.height = 190;
  const x = c.getContext('2d'),
    s = renderer.domElement,
    r = 150 / 190,
    h = s.height,
    w = Math.min(s.width, h * r);
  x.drawImage(s, (s.width - w) / 2, 0, w, h, 0, 0, 150, 190);
  return c.toDataURL('image/jpeg', 0.7);
}
function renderSaved() {
  const g = getGal();
  $('saved').innerHTML = g.length
    ? g
        .map(
          (c, i) =>
            `<div class="card2"><img alt="" src="${c.img}"><b>${(c.s.name || 'Sans nom').replace(/</g, '&lt;')}</b><div><button type="button" data-l="${i}">Charger</button><button type="button" data-x="${i}" class="no">✕</button></div></div>`
        )
        .join('')
    : '<p class="help">Aucun personnage enregistré.</p>';
  $('saved')
    .querySelectorAll('[data-l]')
    .forEach(
      (b) =>
        (b.onclick = () => {
          state = sanitize(getGal()[+b.dataset.l].s);
          refresh();
        })
    );
  $('saved')
    .querySelectorAll('[data-x]')
    .forEach(
      (b) =>
        (b.onclick = () => {
          const g2 = getGal();
          g2.splice(+b.dataset.x, 1);
          lsSet(GKEY, JSON.stringify(g2));
          renderSaved();
        })
    );
}
$('save').onclick = () => {
  const g = getGal();
  g.unshift({ s: state, img: thumb() });
  lsSet(GKEY, JSON.stringify(g.slice(0, 12)));
  renderSaved();
  msg('Personnage enregistré dans « Mes personnages ».');
};
/* ── intégration dans une page parente (même messages que la version 2D) ── */
const embedded = window.parent !== window;
if (embedded) document.documentElement.dataset.embedded = '1';
$('finish').addEventListener('click', (e) => {
  if (window.lastRefugeProgress) window.lastRefugeProgress.update({ characterDone: true });
  if (embedded) {
    e.preventDefault();
    window.parent.postMessage({ type: 'afterlock-creator-close', done: true }, '*');
  }
});

/* ════════════════════════════════════════════════════════════════
   10. DÉMARRAGE + BOUCLE
   ════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════
   8b. VUES PAR ÉTAPE
   • Étape « Arme à feu » : vue 3D dédiée à l’arme seule (glisser = tourner, molette = zoom), mise à jour en direct.
   • Dernière étape : récapitulatif, le personnage complet (avec son arme) tourne sur lui-même.
   • Ailleurs : vue normale (Corps entier / Buste / Visage / Dos + Rotation).
   ════════════════════════════════════════════════════════════════ */
var armDirty = true; // « var » : lu aussi par refresh() défini plus haut
const W_AUTOSPIN = false; // true = l’arme tourne toute seule dans la vue des armes
let viewMode = 'normal',
  wDrag = null,
  wYaw = 0.6,
  wZoom = 1,
  wAuto = W_AUTOSPIN;
const armScene = new THREE.Scene();
armScene.environment = scene.environment;
armScene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2a28, 0.7));
const aKey = new THREE.DirectionalLight(0xfff0dc, 2.2);
aKey.position.set(2, 3, 3);
armScene.add(aKey);
aKey.castShadow = true;
aKey.shadow.mapSize.set(1024, 1024);
Object.assign(aKey.shadow.camera, { left: -1.4, right: 1.4, top: 1.4, bottom: -1.4, near: 0.5, far: 9 });
aKey.shadow.bias = -0.0004;
const aRim = new THREE.DirectionalLight(0x8fb4ff, 1.3);
aRim.position.set(-3, 1.5, -2.5);
armScene.add(aRim);
armScene.background = (() => {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const x = c.getContext('2d'),
    g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#2e2c27');
  g.addColorStop(1, '#0b0b0a');
  x.fillStyle = g;
  x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const qCam = new THREE.PerspectiveCamera(30, 1, 0.02, 40),
  sz = new THREE.Vector2();
let wItem = null;
const WK = ['weapon', 'wMuzzle', 'wOptic', 'wUnder', 'wStock', 'wMag', 'wFinish'];
const WPARTS = [
  ['all', 'Arme entière'],
  ['wMuzzle', 'Embout'],
  ['wOptic', 'Optique'],
  ['wUnder', 'Sous le canon'],
  ['wStock', 'Crosse'],
  ['wMag', 'Chargeur']
];
let wFocus = 'all',
  wCur = { t: new THREE.Vector3(), z: 1 };
function makeGun(s) {
  // construit une arme (centrée) à partir d’un état ; null si « aucune arme »
  const k = s.weapon;
  if (!k) return null;
  s = { ...s };
  for (const sl of ['wMuzzle', 'wOptic', 'wUnder', 'wStock', 'wMag'])
    if (!(WSLOTS[k] || []).includes(sl)) s[sl] = 0;
  const inner = new THREE.Group(),
    anim = [];
  try {
    CL.gunModel(s, k, inner, anim);
  } catch (e) {
    console.warn('arme', k, e);
  }
  const box = new THREE.Box3().setFromObject(inner),
    c = box.getCenter(new THREE.Vector3()),
    size = box.getSize(new THREE.Vector3());
  inner.position.sub(c);
  const pivot = new THREE.Group();
  pivot.add(inner);
  const grp = new THREE.Group(),
    r = Math.max(size.x, size.y, size.z) * 0.5 + 0.1;
  grp.add(pivot);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.9, r * 0.95, 0.035, 64),
    new THREE.MeshStandardMaterial({ color: 0x1d1c19, metalness: 0.7, roughness: 0.35 })
  );
  base.position.y = -size.y / 2 - 0.12;
  base.receiveShadow = true;
  grp.add(base);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(r * 0.91, 0.004, 6, 96),
    new THREE.MeshBasicMaterial({ color: 0xf2b705 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = base.position.y + 0.019;
  grp.add(ring);
  return { k, grp, pivot, anim, r, size, st: weaponStats(s) };
}
// cadrage d’une pièce : l’arme est dirigée vers +z (bouche) ; crosse vers -z, optique en haut, chargeur en bas
function focusParams(key, it) {
  const L = it.size.z,
    H = it.size.y,
    r = it.r;
  switch (key) {
    case 'wMuzzle':
      return { t: [0, 0, L * 0.5 - L * 0.07], z: 3.2 };
    case 'wOptic':
      return { t: [0, H * 0.22, L * 0.05], z: 2.6 };
    case 'wUnder':
      return { t: [0, -H * 0.2, L * 0.28], z: 2.8 };
    case 'wStock':
      return { t: [0, 0, -L * 0.5 + L * 0.12], z: 2.6 };
    case 'wMag':
      return { t: [0, -H * 0.28, -L * 0.02], z: 2.6 };
    default:
      return { t: [0, 0, 0], z: 1 };
  }
}
function camFor(it, fp, aspect, yaw) {
  const d = ((it.r / Math.tan((qCam.fov * Math.PI) / 360)) * 1.15) / fp.z / Math.min(1, aspect * 0.9 + 0.1);
  const t = new THREE.Vector3(...(fp.t.toArray ? fp.t.toArray() : fp.t)).applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    yaw
  );
  return { pos: new THREE.Vector3(t.x, t.y + (it.r * 0.28) / fp.z, d), tg: t };
}
function buildWeaponView() {
  if (wItem) {
    armScene.remove(wItem.grp);
    wItem = null;
  }
  armDirty = false;
  const it = makeGun(state);
  if (it) {
    armScene.add(it.grp);
    wItem = it;
  }
  document.querySelectorAll('#wshots button').forEach((b) => {
    const k = b.dataset.p;
    b.hidden = !(k === 'all' || (it && (WSLOTS[it.k] || []).includes(k)));
  });
}
function weaponFocus(k) {
  wFocus = WK.includes(k) && k !== 'weapon' && k !== 'wFinish' ? k : 'all';
  wAuto = W_AUTOSPIN && wFocus === 'all';
  document
    .querySelectorAll('#wshots button')
    .forEach((b) => b.setAttribute('aria-pressed', b.dataset.p === wFocus));
}
const wShots = document.createElement('div');
wShots.id = 'wshots';
wShots.className = 'hud';
wShots.style.cssText = 'left:12px;top:12px;display:none';
wShots.innerHTML = WPARTS.map(
  ([k, l]) => `<button data-p="${k}" aria-pressed="${k === 'all'}">${l}</button>`
).join('');
stage.appendChild(wShots);
wShots.querySelectorAll('button').forEach((b) => (b.onclick = () => weaponFocus(b.dataset.p)));
{
  const _sv = setVal;
  setVal = function (k, v) {
    _sv(k, v);
    if (WK.includes(k) && STEPS[step].keys.includes('weapon')) weaponFocus(k);
  };
} // changer une pièce zoome dessus
{
  const _og = openGallery;
  openGallery = function (k) {
    _og(k);
    if (WK.includes(k)) weaponFocus(k);
  };
}
// ── miniatures des options (rendues une fois, mises en cache) ──
const thumbCache = new Map();
function optThumb(k, i) {
  if (!WK.includes(k)) return null;
  const s = { ...state };
  if (k === 'weapon') s.weapon = i;
  else s[k] = i;
  if (!s.weapon) return null;
  if (k !== 'weapon' && k !== 'wFinish' && !(WSLOTS[s.weapon] || []).includes(k)) return null;
  const key = [k, i, s.weapon, s.wMuzzle, s.wOptic, s.wUnder, s.wStock, s.wMag, s.wFinish].join('|');
  if (thumbCache.has(key)) return thumbCache.get(key);
  let url = null;
  try {
    const it = makeGun(s);
    if (!it) return null;
    const W = 240,
      Hh = 150,
      pr = renderer.getPixelRatio(),
      prev = wItem && wItem.grp.visible;
    if (wItem) wItem.grp.visible = false;
    armScene.add(it.grp);
    it.pivot.rotation.y = Math.PI / 2 - 0.35;
    const asp = W / Hh;
    qCam.aspect = asp;
    const fp = focusParams(k === 'weapon' ? 'all' : k, it),
      c = camFor(it, { t: fp.t, z: fp.z }, asp, it.pivot.rotation.y);
    qCam.position.copy(c.pos);
    qCam.lookAt(c.tg);
    qCam.updateProjectionMatrix();
    renderer.setScissorTest(true);
    renderer.setViewport(0, 0, W / pr, Hh / pr);
    renderer.setScissor(0, 0, W / pr, Hh / pr);
    renderer.render(armScene, qCam);
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = Hh;
    cv.getContext('2d').drawImage(
      renderer.domElement,
      0,
      renderer.domElement.height - Hh,
      W,
      Hh,
      0,
      0,
      W,
      Hh
    );
    url = cv.toDataURL('image/jpeg', 0.88);
    armScene.remove(it.grp);
    it.grp.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
    });
    if (wItem) wItem.grp.visible = prev;
    renderer.setScissorTest(false);
    renderer.getSize(sz);
    renderer.setViewport(0, 0, sz.x, sz.y);
  } catch (e) {
    console.warn('miniature', e);
  }
  thumbCache.set(key, url);
  return url;
}
const wLab = document.createElement('div');
wLab.className = 'weapon-label';
wLab.style.display = 'none';
stage.appendChild(wLab);
function setWeaponLabel() {
  const st = wItem && wItem.st;
  wLab.style.display = viewMode === 'weapon' ? 'block' : 'none';
  wLab.innerHTML = st
    ? `<div style="font-size:18px;color:#f2b705">${st.name.toUpperCase()}</div><div>${st.cat} · dég ${st.dmg} · ${st.rate} c/min · ${st.range} m · ${st.wt} kg</div><div style="opacity:.6;font-size:11px">Glisser pour tourner · molette pour zoomer</div>`
    : '<div style="font-size:16px">AUCUNE ARME SÉLECTIONNÉE</div>';
}
function applyStepView() {
  const isW = STEPS[step].keys.includes('weapon'),
    isLast = step === STEPS.length - 1;
  viewMode = isW ? 'weapon' : 'normal';
  $('shots').style.display = isW ? 'none' : '';
  wShots.style.display = isW ? '' : 'none';
  controls.enabled = !isW;
  if (isW) {
    armDirty = true;
    wZoom = 1;
    weaponFocus('all');
  } else {
    vLab_hide();
    if (isLast) {
      shot('full');
      controls.autoRotate = true;
      $('spin').setAttribute('aria-pressed', 'true');
    }
  }
  setWeaponLabel();
}
function vLab_hide() {
  wLab.style.display = 'none';
}
{
  const _rs = renderSteps;
  renderSteps = function () {
    _rs();
    applyStepView();
  };
}
renderer.domElement.addEventListener('pointerdown', (e) => {
  if (viewMode === 'weapon') {
    wDrag = { x: e.clientX };
    wAuto = false;
    renderer.domElement.setPointerCapture(e.pointerId);
  }
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (wDrag) {
    wYaw += (e.clientX - wDrag.x) * 0.012;
    wDrag.x = e.clientX;
  }
});
['pointerup', 'pointercancel'].forEach((n) =>
  renderer.domElement.addEventListener(n, () => {
    if (wDrag) {
      wDrag = null;
      setTimeout(() => {
        if (!wDrag) wAuto = W_AUTOSPIN && wFocus === 'all';
      }, 2500);
    }
  })
);
renderer.domElement.addEventListener(
  'wheel',
  (e) => {
    if (viewMode === 'weapon') {
      e.preventDefault();
      wZoom = Math.min(2.2, Math.max(0.5, wZoom * (e.deltaY > 0 ? 1.08 : 0.92)));
    }
  },
  { passive: false }
);
function drawView(t) {
  if (viewMode !== 'weapon') {
    renderer.setScissorTest(false);
    renderer.render(scene, camera);
    return;
  }
  if (armDirty) {
    buildWeaponView();
    setWeaponLabel();
  }
  renderer.getSize(sz);
  qCam.aspect = sz.x / sz.y;
  if (wItem) {
    const fp = focusParams(wFocus, wItem),
      tg = new THREE.Vector3(...fp.t),
      k = 0.12;
    if (wAuto) wYaw += 0.008;
    else if (wFocus !== 'all' && !wDrag) {
      let dy = Math.PI / 2 - 0.35 - wYaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      wYaw += dy * 0.1;
    }
    wCur.t.lerp(tg, k);
    wCur.z += (fp.z * wZoom - wCur.z) * k;
    wItem.pivot.rotation.y = wYaw;
    wItem.anim.forEach((f) => f(t));
    const c = camFor(wItem, { t: wCur.t, z: wCur.z }, qCam.aspect, wYaw);
    qCam.position.copy(c.pos);
    qCam.lookAt(c.tg);
  } else {
    qCam.position.set(0, 0, 3);
    qCam.lookAt(0, 0, 0);
  }
  qCam.updateProjectionMatrix();
  renderer.render(armScene, qCam);
}

{
  const mq = matchMedia('(prefers-reduced-motion: reduce)'),
    pr = window.afterlockPreferences
      ? window.afterlockPreferences.load()
      : { motion: 'full', contrast: false };
  document.documentElement.dataset.motion = mq.matches ? 'off' : pr.motion;
  document.documentElement.dataset.contrast = pr.contrast ? 'high' : 'standard';
}
try {
  const sv = JSON.parse(lsGet(KEY) || 'null');
  if (sv) state = sanitize(sv);
} catch (e) {}
renderSteps();
renderSaved();
shot('full');
resize();
refresh();
{
  const l = $('stage-loading');
  if (l) l.hidden = true;
}
const clk = new THREE.Clock();
(function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clk.getDelta(), 0.05),
    t = clk.elapsedTime;
  if (goal) {
    const k = 1 - Math.exp(-dt * 6);
    camera.position.lerp(goal.p, k);
    controls.target.lerp(goal.t, k);
    if (camera.position.distanceTo(goal.p) < 0.01) goal = null;
  }
  controls.update();
  character && character.userData.update(t);
  drawView(t);
})();
window.Creator = {
  get state() {
    return state;
  },
  setState(s) {
    state = sanitize(s);
    refresh();
  },
  THREE,
  scene,
  camera,
  buildCharacter,
  D,
  NAMES,
  SPX
}; // pour la console / vos propres scripts
