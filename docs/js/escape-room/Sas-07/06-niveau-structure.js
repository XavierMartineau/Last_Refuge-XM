/* LAST REFUGE · XM — Escape room « Sas 07 » · Construction du niveau : néons, murs, cloisons et portes.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   6. CONSTRUCTION DU NIVEAU
   ════════════════════════════════════════════════════════════════ */
const W = CONFIG.W,
  H = CONFIG.H;
const neon = {
  tubes: [],
  lights: [],
  k: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  spark: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  nextSpark: { 1: 2, 2: 4, 3: 3, 4: 5, 5: 3, 6: 6 },
  sw: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  was: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
}; // néons : éteints tant que le courant n’est pas rétabli
const haloTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d'),
    r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,.55)');
  r.addColorStop(0.6, 'rgba(255,255,255,.14)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
function addNeon(room, x, z, len = 2.4, y = 3.08) {
  const m = glow(0xd6ffe8, 0),
    t = cyl(0.035, len, m, x, y, z, scene, 8);
  t.rotation.z = Math.PI / 2;
  t.castShadow = false;
  const hm = new THREE.MeshBasicMaterial({
      map: haloTex,
      color: 0xcfe4ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    }),
    h = new THREE.Mesh(new THREE.PlaneGeometry(len + 1.1, 1.1), hm); // halo lumineux sous chaque tube : on voit qu'il est allumé
  h.rotation.x = Math.PI / 2;
  h.position.set(x, y - 0.05, z);
  h.raycast = () => {};
  h.renderOrder = 3;
  scene.add(h);
  neon.tubes.push({ m, room, t, hm });
  box(len + 0.2, 0.06, 0.14, mats.dark, x, y + 0.06, z).castShadow = false;
  return t;
}
const neonPool = Array.from({ length: 8 }, () => {
  const L = new THREE.PointLight(0xcfe4ff, 0, 30, 2);
  L.castShadow = false;
  scene.add(L);
  return { L, tx: 0, ty: 0, tz: 0, ti: 0 };
}); // 8 lampes qui se posent sous les néons les plus proches du joueur
const ambNeon = new THREE.AmbientLight(0xaec8ff, 0);
scene.add(ambNeon);
let _npF = 0,
  _npRoom = 0;
const _npV = new THREE.Vector3(),
  _npCache = {};
function neonPoolUpdate(rr, dt) {
  const k = neon.k[rr] || 0,
    lit = k > 0.6,
    col = lit ? 0xcfe4ff : 0xa9adb1;
  ambNeon.color.setHex(lit ? 0xaec8ff : 0x9a9ea3);
  ambNeon.intensity = (rr >= 5 ? 0.55 : 0.42) * k * CONFIG.light.neonPower;
  const list = _npCache[rr] || (_npCache[rr] = neon.tubes.filter((o) => o.room === rr));
  const changedRoom = rr !== _npRoom;
  if (changedRoom || _npF++ % 6 === 0) {
    _npRoom = rr;
    const arr = list
      .map((o) => {
        o.t.getWorldPosition(_npV);
        const distance = Math.hypot(_npV.x - rig.pos.x, _npV.z - rig.pos.z),
          retained = !changedRoom && neonPool.some((p) => p.tube === o.t);
        return { tube: o.t, x: _npV.x, y: _npV.y, z: _npV.z, d: distance - (retained ? 1.5 : 0) };
      })
      .sort((a, b) => a.d - b.d)
      .slice(0, neonPool.length);
    const assigned = neonPool.map((p) => !changedRoom && arr.find((a) => a.tube === p.tube));
    const available = arr.filter((a) => !assigned.includes(a));
    neonPool.forEach((p, i) => {
      let index = 0;
      if (!changedRoom && p.init && !assigned[i] && available.length) {
        let best = Infinity;
        available.forEach((a, j) => {
          const d = (a.x - p.tx) ** 2 + (a.z - p.tz) ** 2;
          if (d < best) {
            best = d;
            index = j;
          }
        });
      }
      const a = assigned[i] || available.splice(index, 1)[0];
      if (a) {
        p.tube = a.tube;
        p.tx = a.x;
        p.ty = a.y - 0.35;
        p.tz = a.z;
        p.ti = 1;
      } else {
        p.tube = null;
        p.ti = 0;
      }
      if ((!p.init || changedRoom) && a) {
        p.L.position.set(p.tx, p.ty, p.tz);
        p.init = 1;
      }
    });
  }
  const f = Math.min(1, dt * 6);
  neonPool.forEach((p) => {
    p.L.position.x += (p.tx - p.L.position.x) * f;
    p.L.position.y += (p.ty - p.L.position.y) * f;
    p.L.position.z += (p.tz - p.L.position.z) * f;
    p.L.color.setHex(col);
    const y = Math.max(2.5, p.ty + 0.35);
    p.L.intensity = p.ti * k * y * y * (rr >= 5 ? 3.1 : 1.2) * CONFIG.light.neonPower;
  });
}
const blinkers = [],
  rotors = [],
  beacons = [];
const alarms = []; // lumières rouges pulsantes
const spinners = []; // objets qui tournent (ventilateurs)

/* Coque d’une pièce : sol, plafond, murs latéraux, plinthes, poutres, tuyaux */
function shell(zc, { south = true, w = W, d = W, h = H } = {}) {
  const hw = w / 2,
    hd = d / 2,
    big = w > 12 || d > 12 || h > H;
  const mF = big ? tiled(mats.floor, w / 4, d / 4) : mats.floor,
    mC = big ? tiled(mats.ceil, w / 4, d / 4) : mats.ceil,
    mW = big ? tiled(mats.wall, d / 4, h / 3.4) : mats.wall,
    mB = big ? tiled(mats.band, d / 4, 1) : mats.band;
  const f = plane(w, d, mF, 0, 0, zc, scene, 0, -Math.PI / 2);
  plane(w, d, mC, 0, h, zc, scene, 0, Math.PI / 2);
  [
    [-hw, Math.PI / 2],
    [hw, -Math.PI / 2]
  ].forEach(([x, ry]) => {
    plane(d, h, mW, x, h / 2, zc, scene, ry);
    plane(d, 1.4, mB, x + (x < 0 ? 0.01 : -0.01), 0.7, zc, scene, ry);
  });
  if (south) {
    plane(w, h, mats.wall, 0, h / 2, zc + hd, scene, Math.PI);
    plane(w, 1.4, mats.band, 0, 0.7, zc + hd - 0.01, scene, Math.PI);
  }
  [-(hw - 0.08), hw - 0.08].forEach((x) => box(0.08, 0.07, d, mats.dark, x, 1.42, zc)); // lisse murale
  [zc - hd + 0.1, zc + hd - 0.1].forEach((z) =>
    [-(hw - 0.15), hw - 0.15].forEach((x) => box(0.3, h, 0.3, mats.dark, x, h / 2, z))
  ); // piliers d’angle
  const nb = Math.max(1, Math.round(d / 10));
  for (let i = 0; i < nb; i++) box(w, 0.28, 0.3, mats.dark, 0, h - 0.14, zc - hd + ((i + 0.5) * d) / nb); // poutres
  [
    [-1.5, 0.1],
    [-1.0, 0.06],
    [1.6, 0.08]
  ].forEach(([dz, r]) => {
    const p = cyl(r, w, mats.rustpipe, 0, h - 0.2 - r, zc + dz * (big ? d / 8 : 1));
    p.rotation.z = Math.PI / 2;
    for (let x = -hw + 1; x < hw; x += big ? 4 : 2)
      box(0.06, 0.16, 0.2, mats.dark, x, h - 0.2, zc + dz * (big ? d / 8 : 1));
  }); // tuyaux + colliers
  decal(rustDecal(), 1.4, 2.4, -2.6, 2.1, zc - hd + 0.02, scene);
  return f;
}

/* Mur mitoyen avec encadrement de porte (3 blocs : gauche, droite, linteau) */
function wallWithDoor(z, w = 8, h = H) {
  const sw = (w - 1.9) / 2,
    cx = 0.95 + sw / 2,
    mw = w > 12 || h > H ? tiled(mats.wall, sw / 4, h / 3.4) : mats.wall;
  box(sw, h, 0.3, mw, -cx, h / 2, z);
  box(sw, h, 0.3, mw, cx, h / 2, z);
  box(1.9, h - 2.5, 0.3, mats.wall, 0, 2.5 + (h - 2.5) / 2, z);
  box(0.12, 2.5, 0.34, mats.dark, -0.97, 1.25, z);
  box(0.12, 2.5, 0.34, mats.dark, 0.97, 1.25, z);
  box(2.06, 0.12, 0.34, mats.dark, 0, 2.52, z);
}

/* Porte blindée à pivot : peut s’ouvrir par rotation du groupe */
function makeDoor(id, x, z, hint) {
  const pivot = new THREE.Group();
  pivot.position.set(x - 0.93, 0, z);
  scene.add(pivot);
  box(1.86, 2.46, 0.14, mats.door, 0.93, 1.25, 0, pivot);
  const wheel = new THREE.Group();
  wheel.position.set(0.93, 1.3, 0.1);
  pivot.add(wheel);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 10, 28), mats.steel);
  ring.castShadow = true;
  wheel.add(ring);
  for (let i = 0; i < 3; i++) {
    const sp = cyl(0.018, 0.52, mats.steel, 0, 0, 0, wheel, 8);
    sp.rotation.z = (i * Math.PI) / 3;
  }
  const led = box(0.14, 0.07, 0.03, glow(0xff2a1a, 3), 1.5, 1.95, 0.08, pivot);
  decal(bloodDecal(3), 1.5, 1.5, 0.93, 1.25, 0.075, pivot);
  interactive(pivot, id, hint, 'door', { led, wheel, focusDist: 2.2 });
  return pivot;
}

/* ───────── PIÈCE 1 : SAS DE CONFINEMENT ───────── */
