/* LAST REFUGE · XM — Escape room « Sas 07 » · Moteur : renderer, scène, caméra et primitives 3D.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   4. MOTEUR : renderer, scène, post-processing
   ════════════════════════════════════════════════════════════════ */
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
const TOUCH =
  CONFIG.device.touch === 'auto'
    ? (typeof matchMedia === 'function' && matchMedia('(pointer:coarse)').matches) ||
      navigator.maxTouchPoints > 0
    : !!CONFIG.device.touch;
renderer.setPixelRatio(
  Math.min(devicePixelRatio, TOUCH ? CONFIG.device.pixelRatioMobile : CONFIG.device.pixelRatioDesktop)
);
renderer.shadowMap.enabled = !TOUCH || CONFIG.device.shadowsMobile;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true; // ombres rafraîchies manuellement (1 image sur 2, voir loop)
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
app.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030403);
scene.fog = new THREE.FogExp2(0x070a08, 0.04); // brouillard atmosphérique
const camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.05, 420);
camera.rotation.order = 'YXZ';
scene.add(new THREE.HemisphereLight(0x778877, 0x221a14, CONFIG.light.ambient));

/* petits constructeurs de géométrie */
const noRay = (o) => {
  o.raycast = () => {};
  return o;
};
const primitiveGeometries = new Map();
function primitiveGeometry(key, create) {
  let geometry = primitiveGeometries.get(key);
  if (!geometry) {
    geometry = create();
    primitiveGeometries.set(key, geometry);
  }
  return geometry;
}
const box = (w, h, d, m, x = 0, y = 0, z = 0, p = scene) => {
  const o = new THREE.Mesh(primitiveGeometry(`box:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d)), m);
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true;
  p.add(o);
  return o;
};
const cyl = (r, h, m, x = 0, y = 0, z = 0, p = scene, seg = 20) => {
  const o = new THREE.Mesh(primitiveGeometry(`cyl:${r}:${h}:${seg}`, () => new THREE.CylinderGeometry(r, r, h, seg)), m);
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true;
  p.add(o);
  return o;
};
const plane = (w, h, m, x, y, z, p = scene, ry = 0, rx = 0) => {
  const o = new THREE.Mesh(primitiveGeometry(`plane:${w}:${h}`, () => new THREE.PlaneGeometry(w, h)), m);
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, 0);
  o.receiveShadow = true;
  p.add(o);
  return o;
};
const decal = (m, w, h, x, y, z, p, ry = 0, rx = 0) => noRay(plane(w, h, m, x, y, z, p, ry, rx));
const bloodDecal = (n = 4) => decalMat(new Surface(512, true).base('', 0.6, 0.5).blood(n));
const rustDecal = () =>
  decalMat(new Surface(512, true).base('', 0.9, 0.5).streaks(6, '130,58,20', 0.8).rust(5));
function cable(a, b, sag = 0.5, r = 0.02) {
  const mid = a.clone().lerp(b, 0.5);
  mid.y -= sag;
  const t = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, r, 6),
    mats.rubber
  );
  t.castShadow = true;
  scene.add(t);
}

/* Écran dynamique (canvas → emissiveMap : brille grâce au Bloom) */
function makeScreen(w, h, col = '#5fe08a') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = Math.round((512 * h) / w);
  const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      color: 0x020302,
      emissive: 0xffffff,
      emissiveMap: tex,
      emissiveIntensity: 1.5,
      roughness: 0.2
    })
  );
  const api = {
    mesh,
    draw(lines, color = col) {
      x.fillStyle = '#030a05';
      x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = color;
      x.font = '38px VT323,"Courier New",monospace';
      x.textBaseline = 'top';
      x.shadowColor = color;
      x.shadowBlur = 6;
      lines.forEach((t, i) => x.fillText(t, 22, 20 + i * 40));
      x.shadowBlur = 0;
      x.fillStyle = 'rgba(0,0,0,.25)';
      for (let y = 0; y < c.height; y += 4) x.fillRect(0, y, c.width, 1);
      tex.needsUpdate = true;
    }
  };
  return api;
}
