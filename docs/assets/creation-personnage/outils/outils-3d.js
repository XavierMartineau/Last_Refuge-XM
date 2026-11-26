/* LAST REFUGE · XM — Outils 3D partagés : primitives, matériaux simples, textures canvas et aléatoire reproductible.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const QUALITY = { rounded: true, anisotropy: 16 };
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp = (a, b, t) => a + (b - a) * t;
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)),
  th = (v) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
const sh = (h, a) =>
  '#' +
  hx(h)
    .map((v) => th(a < 0 ? v * (1 + a) : v + (255 - v) * a))
    .join('');
let seed = 11;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const MC = new Map();
const mat = (c, o = {}) => {
  const k = c + '|' + JSON.stringify(o);
  let m = MC.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0, ...o });
    MC.set(k, m);
  }
  return m;
};
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z),
  UP = V(0, 1, 0);
const mk = (geo, m, x = 0, y = 0, z = 0, p = null) => {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  if (p) p.add(o);
  return o;
};
const grp = (x = 0, y = 0, z = 0, p = null) => {
  const o = new THREE.Group();
  o.position.set(x, y, z);
  if (p) p.add(o);
  return o;
};
const ell = (rx, ry, rz, m, x = 0, y = 0, z = 0, p = null) => {
  const o = mk(new THREE.SphereGeometry(1, 28, 20), m, x, y, z, p);
  o.scale.set(rx, ry, rz);
  return o;
};
const box = (w, h, d, m, x = 0, y = 0, z = 0, p = null) => {
  const r = Math.min(w, h, d) * 0.22;
  return mk(
    QUALITY.rounded && typeof RoundedBoxGeometry !== 'undefined'
      ? new RoundedBoxGeometry(w, h, d, 2, r)
      : new THREE.BoxGeometry(w, h, d),
    m,
    x,
    y,
    z,
    p
  );
};
const cyl = (rt, rb, h, m, x = 0, y = 0, z = 0, p = null, seg = 24, open = false) =>
  mk(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m, x, y, z, p);
const tube = (pts, r, m, p, seg = 24, rad = 6) =>
  mk(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts.map((a) => V(a[0], a[1], a[2]))),
      seg,
      r,
      rad,
      false
    ),
    m,
    0,
    0,
    0,
    p
  );
function limb(a, b, r0, r1, m, p, seg = 10) {
  // tronc de cône entre deux points (cornes, tentacules, os…)
  const A = V(a[0], a[1], a[2]),
    B = V(b[0], b[1], b[2]),
    d = B.clone().sub(A),
    L = d.length() || 0.001;
  const o = mk(new THREE.CylinderGeometry(r1, r0, L, seg), m);
  o.position.copy(A).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(UP, d.normalize());
  if (p) p.add(o);
  return o;
}
function chain(pts, r0, r1, m, p) {
  const n = pts.length - 1;
  for (let i = 0; i < n; i++) limb(pts[i], pts[i + 1], lerp(r0, r1, i / n), lerp(r0, r1, (i + 1) / n), m, p);
}
function spike(base, dir, r, h, m, p, seg = 8) {
  // cône posé par sa base, dirigé selon dir
  const d = V(dir[0], dir[1], dir[2]).normalize(),
    o = mk(new THREE.ConeGeometry(r, h, seg), m);
  o.position.set(base[0], base[1], base[2]).addScaledVector(d, h / 2);
  o.quaternion.setFromUnitVectors(UP, d);
  if (p) p.add(o);
  return o;
}
const safe = (fn, name) => {
  try {
    fn();
  } catch (e) {
    console.warn('Asset 3D « ' + name + ' » :', e);
  }
};
const glowM = (c, i = 1.6) => mat(c, { emissive: c, emissiveIntensity: i, roughness: 0.4 });
const TEXC = new Map(),
  cvs = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };
function mkTex(c, rx = 1, ry = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = QUALITY.anisotropy;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function noiseTex(key, size, amp, rx, ry) {
  if (TEXC.has(key)) return TEXC.get(key);
  const c = cvs(size, size),
    x = c.getContext('2d'),
    id = x.createImageData(size, size);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * amp;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
    id.data[i + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  const t = mkTex(c, rx, ry, false);
  TEXC.set(key, t);
  return t;
}
function weaveTex() {
  if (TEXC.has('weave')) return TEXC.get('weave');
  const c = cvs(32, 32),
    x = c.getContext('2d');
  x.fillStyle = '#808080';
  x.fillRect(0, 0, 32, 32);
  for (let i = 0; i < 32; i += 2) {
    x.fillStyle = '#9c9c9c';
    x.fillRect(i, 0, 1, 32);
    x.fillStyle = '#6c6c6c';
    x.fillRect(0, i, 32, 1);
  }
  const t = mkTex(c, 7, 7, false);
  TEXC.set('weave', t);
  return t;
}
const setSeed = (v) => {
  seed = v;
};

export {
  QUALITY,
  $,
  clamp,
  lerp,
  hx,
  th,
  sh,
  seed,
  rnd,
  MC,
  mat,
  V,
  UP,
  mk,
  grp,
  ell,
  box,
  cyl,
  tube,
  limb,
  chain,
  spike,
  safe,
  glowM,
  TEXC,
  cvs,
  mkTex,
  noiseTex,
  weaveTex,
  setSeed
};
