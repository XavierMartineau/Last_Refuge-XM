/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 7 : le silo (40 × 30 × 12 m).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers.

   Trois silos A · B · C reliés par un convoyeur. La clé a été jetée dans le seul silo encore plein.
   Énigme : rallumer l’éclairage → frapper sur les silos (plein = son mat) → trouver le volant de la
   pompe sous la bâche → remettre la pompe hydraulique sous pression → ouvrir la bonne trappe au pupitre
   de vidange → récupérer la clé dans le tas de grain. Une mauvaise trappe ne vide que de la poussière. */
'use strict';

/* Registres communs aux salles 7 à 10 : objectif, sous-étapes, inventaire et raccourcis du dev mode. */
const ROOM_OBJ = {},
  ROOM_GOALS = {},
  ROOM_DEV = {},
  ROOM_INV = [];
const showObj = (o) => {
  o.visible = true;
  o.traverse((c) => {
    if (Object.prototype.hasOwnProperty.call(c, 'raycast')) delete c.raycast;
  });
};
function unlockDoor(door, hint) {
  door.userData.led.material = glow(0x30ff70, 3);
  door.userData.hint = hint;
}
/* ── Outils d’architecture des salles 7 à 10 : sols surélevés, escaliers, murs courbes, portes ──
   FLOORS est lu par GH() (hauteur du sol) : { x0, x1, z0, z1, y0, y1, axis, from } — axis null = sol plat,
   sinon rampe le long de 'x' ou 'z', de y0 (côté `from`) à y1. */
const FLOORS = [];
function floorAt(x, z) {
  let y = null;
  for (const f of FLOORS) {
    if (x < f.x0 || x > f.x1 || z < f.z0 || z > f.z1) continue;
    let h = f.y0;
    if (f.axis) {
      const a = f.axis === 'x' ? x : z,
        lo = f.axis === 'x' ? f.x0 : f.z0,
        hi = f.axis === 'x' ? f.x1 : f.z1,
        t = (a - lo) / (hi - lo);
      h = f.y0 + (f.y1 - f.y0) * (f.from === 'lo' ? t : 1 - t);
    }
    if (y === null || h > y) y = h;
  }
  return y;
}
const edgeCol = (x0, x1, z0, z1) => EXTRA_COLLIDERS.push([x0, x1, z0, z1]);
// plateforme pleine de hauteur y ; `open` = segments de bord laissés libres (escaliers) : [[côté, a, b], …]
// côtés : 'n' (z0), 's' (z1), 'w' (x0), 'e' (x1) ; les autres bords reçoivent une collision et un garde-corps
function platform(x0, x1, z0, z1, y, { open = [], rails = true, mat = mats.floor, skip = [] } = {}) {
  box(x1 - x0, y, z1 - z0, mats.band, (x0 + x1) / 2, y / 2, (z0 + z1) / 2).receiveShadow = true;
  const top = tiled(mat, (x1 - x0) / 4, (z1 - z0) / 4);
  noRay(plane(x1 - x0, z1 - z0, top, (x0 + x1) / 2, y + 0.005, (z0 + z1) / 2, scene, 0, -Math.PI / 2));
  FLOORS.push({ x0, x1, z0, z1, y0: y });
  const sides = { n: [x0, x1, z0], s: [x0, x1, z1], w: [z0, z1, x0], e: [z0, z1, x1] };
  Object.entries(sides).forEach(([k, [a, b, c]]) => {
    if (skip.includes(k)) return;
    const gaps = open.filter((o) => o[0] === k).sort((p, q) => p[1] - q[1]);
    let cur = a;
    const seg = (p, q) => {
      if (q - p < 0.05) return;
      if (k === 'n' || k === 's') edgeCol(p, q, c - 0.12, c + 0.12);
      else edgeCol(c - 0.12, c + 0.12, p, q);
      if (!rails) return;
      const len = q - p,
        mid = (p + q) / 2;
      [0.5, 1.0].forEach((h) =>
        k === 'n' || k === 's'
          ? box(len, 0.05, 0.05, mats.steel, mid, y + h, c)
          : box(0.05, 0.05, len, mats.steel, c, y + h, mid)
      );
      for (let t = p; t <= q + 0.01; t += 1.5)
        k === 'n' || k === 's' ? box(0.05, 1, 0.05, mats.steel, t, y + 0.5, c) : box(0.05, 1, 0.05, mats.steel, c, y + 0.5, t);
    };
    gaps.forEach(([, p, q]) => {
      seg(cur, p);
      cur = q;
    });
    seg(cur, b);
  });
}
// escalier entre y0 et y1 ; dir : sens de la montée ('+x', '-x', '+z', '-z')
function stairs(x0, x1, z0, z1, y0, y1, dir, { sides = true } = {}) {
  const alongX = dir[1] === 'x',
    len = alongX ? x1 - x0 : z1 - z0,
    n = Math.max(2, Math.round(Math.abs(y1 - y0) / 0.18)),
    up = dir[0] === '+';
  for (let i = 0; i < n; i++) {
    const h = y0 + ((y1 - y0) * (i + 1)) / n,
      t = (i + 0.5) / n,
      c = up ? (alongX ? x0 : z0) + len * t : (alongX ? x1 : z1) - len * t;
    if (alongX) box(len / n, h, z1 - z0, mats.lockerA, c, h / 2, (z0 + z1) / 2);
    else box(x1 - x0, h, len / n, mats.lockerA, (x0 + x1) / 2, h / 2, c);
  }
  FLOORS.push({ x0, x1, z0, z1, y0, y1, axis: alongX ? 'x' : 'z', from: up ? 'lo' : 'hi' });
  if (!sides) return;
  if (alongX) {
    edgeCol(x0, x1, z0 - 0.12, z0 + 0.08);
    edgeCol(x0, x1, z1 - 0.08, z1 + 0.12);
  } else {
    edgeCol(x0 - 0.12, x0 + 0.08, z0, z1);
    edgeCol(x1 - 0.08, x1 + 0.12, z0, z1);
  }
}
// mur courbe : arc de centre (cx, cz), rayon r, angles a0 → a1 (radians, 0 = +x, π/2 = +z)
function curveWall(cx, cz, r, a0, a1, h, { mat = mats.wall, y0 = 0, thick = 0.3 } = {}) {
  const n = Math.max(3, Math.ceil((Math.abs(a1 - a0) * r) / 0.7));
  for (let i = 0; i < n; i++) {
    const p = a0 + ((a1 - a0) * i) / n,
      q = a0 + ((a1 - a0) * (i + 1)) / n,
      ax = cx + Math.cos(p) * r,
      az = cz + Math.sin(p) * r,
      bx = cx + Math.cos(q) * r,
      bz = cz + Math.sin(q) * r,
      len = Math.hypot(bx - ax, bz - az) + 0.04;
    const m = box(len, h, thick, mat, (ax + bx) / 2, y0 + h / 2, (az + bz) / 2);
    m.rotation.y = Math.atan2(-(bz - az), bx - ax);
    edgeCol(Math.min(ax, bx) - 0.12, Math.max(ax, bx) + 0.12, Math.min(az, bz) - 0.12, Math.max(az, bz) + 0.12);
  }
}
// porte intérieure battante (s’ouvre au clic) ; axis 'x' = mur le long de x (porte centrée en x), 'z' = mur le long de z
function innerDoor(id, x, z, axis, hint, { y0 = 0, locked = null } = {}) {
  const pv = new THREE.Group();
  if (axis === 'x') pv.position.set(x - 0.93, y0, z);
  else {
    pv.position.set(x, y0, z + 0.93);
    pv.rotation.y = Math.PI / 2;
  }
  scene.add(pv);
  box(1.86, 2.45, 0.08, mats.door, 0.93, 1.23, 0, pv);
  box(0.6, 0.35, 0.03, glow(0x9fe8ff, 0.15), 0.93, 1.85, 0.05, pv);
  box(0.05, 0.22, 0.06, mats.steel, 1.6, 1.15, 0.07, pv);
  hitBox(1.9, 2.5, 0.3, 0.93, 1.25, 0, pv);
  const col = axis === 'x' ? [x - 0.95, x + 0.95, z - 0.12, z + 0.12] : [x - 0.12, x + 0.12, z - 0.95, z + 0.95];
  EXTRA_COLLIDERS.push(col);
  interactive(pv, id, hint, 'door', { focusDist: 2.2, col });
  Actions.register(id, (o) => {
    if (o.userData.opened) return;
    if (locked && locked()) return;
    o.userData.opened = true;
    SND.play('door');
    const r0 = pv.rotation.y;
    tween(0.9, (k) => (pv.rotation.y = r0 + 1.5 * k));
    const i = EXTRA_COLLIDERS.indexOf(col);
    if (i >= 0) EXTRA_COLLIDERS.splice(i, 1);
  });
  return pv;
}
function canvasMat(w, h, draw, emissive = 0) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 });
  if (emissive) {
    m.emissive.setHex(0xffffff);
    m.emissiveMap = t;
    m.emissiveIntensity = emissive;
  }
  m.userData.redraw = (fn) => {
    fn(c.getContext('2d'), w, h);
    t.needsUpdate = true;
  };
  return m;
}

shell(-117, { south: false, w: 40, d: 30, h: 12 });
wallWithDoor(-132, 50, 12);
const doorEnd = makeDoor('door_end', 0, -131.85, 'Examiner la porte de sortie');
Object.assign(State, { siloKnock: {}, siloWheel: false, siloTarp: false, siloPressure: false, siloHatch: {}, siloKeyOut: false });
const SILO_FULL = 'C';
const SILOS = [
  { id: 'A', x: -12, z: -116 },
  { id: 'B', x: 0, z: -119.5 },
  { id: 'C', x: 12, z: -116 }
];
[-12, 0, 12].forEach((x) => [-108, -124].forEach((z) => addNeon(7, x, z, 4, 11.6)));
{
  const L = new THREE.PointLight(0xffb060, 0, 12, 2); // lampe ambrée au-dessus du pupitre de vidange
  L.position.set(17, 4.4, -108.6);
  scene.add(L);
  neon.lights.push({ l: L, room: 7, base: 22 });
}

/* ── les trois silos (cuve, toit conique, trémie, pieds, trappe de vidange, plaque) ── */
const grainMat = new THREE.MeshStandardMaterial({ color: 0xb89a5a, roughness: 1 });
SILOS.forEach((s) => {
  const g = new THREE.Group();
  g.position.set(s.x, 0, s.z);
  scene.add(g);
  cyl(3, 6.4, mats.steel, 0, 6.6, 0, g, 36);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.2, 36), mats.dark);
  roof.position.y = 10.4;
  g.add(roof);
  const hopper = new THREE.Mesh(new THREE.ConeGeometry(3, 2, 36, 1, true), mats.steel);
  hopper.rotation.x = Math.PI;
  hopper.position.y = 2.4;
  g.add(hopper);
  [4.2, 6.6, 9].forEach((y) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.07, 6, 40), mats.dark);
    r.rotation.x = Math.PI / 2;
    r.position.y = y;
    g.add(r);
  });
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => box(0.28, 3.4, 0.28, mats.dark, a * 2.1, 1.7, b * 2.1, g));
  cyl(0.35, 0.5, mats.rustpipe, 0, 1.25, 0, g, 14);
  const hatch = new THREE.Group(); // trappe sous la goulotte
  hatch.position.set(0, 0.98, 0.36);
  g.add(hatch);
  box(0.7, 0.05, 0.7, mats.door, 0, 0, -0.36, hatch);
  plane(2.2, 1.1, sign(['SILO ' + s.id], '#b48a22', '#15171a'), 0, 5.2, 3.03, g);
  decal(rustDecal(), 2, 4, -0.8, 6.5, 3.04, g);
  // paroi : on frappe dessus pour savoir s’il est plein
  hitBox(6.4, 7.8, 6.4, 0, 5.9, 0, g); // de 2 m à 9,8 m : laisse libre le tas de grain au sol
  interactive(g, 'silo_' + s.id, 'Frapper sur la paroi du silo ' + s.id, 'inspect', { focusDist: 6 });
  const pile = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.1, 24), grainMat);
  pile.position.set(0, 0.55, 1.2);
  pile.scale.setScalar(0.001);
  pile.visible = false;
  pile.raycast = () => {};
  g.add(pile);
  s.group = g;
  s.hatch = hatch;
  s.pile = pile;
  pushC(s.x, s.z, 3.1, 3.1);
  Actions.register('silo_' + s.id, () => {
    State.siloKnock[s.id] = true;
    SND.play(s.id === SILO_FULL ? 'click' : 'clank');
    say(
      s.id === SILO_FULL
        ? 'Toc… toc. Un son sourd, étouffé : le silo ' + s.id + ' est encore plein de grain.'
        : 'BONG ! Le métal résonne longuement : le silo ' + s.id + ' est vide.',
      4500
    );
    setObjective(objectiveNow());
  });
});
// convoyeur qui relie les trois toits
box(24.5, 0.5, 1.2, mats.dark, 0, 11.1, -116.5);
box(24.5, 0.08, 1.0, mats.rubber, 0, 11.38, -116.5);
for (let x = -12; x <= 12; x += 2) box(0.12, 0.7, 1.3, mats.steel, x, 10.75, -116.5);

/* ── architecture : quai de chargement (est), mur courbe derrière le silo B, bureau de pesée (nord-ouest) ── */
const DOCK_Y = 1.2;
platform(13.5, 19.9, -113, -102.2, DOCK_Y, { open: [['w', -108.6, -106.2]], skip: ['s', 'e'] });
stairs(10.6, 13.5, -108.6, -106.2, 0, DOCK_Y, '+x');
plane(2.4, 0.6, sign(['QUAI 2'], '#b48a22', '#15171a'), 19.85, DOCK_Y + 2.2, -105, scene, -Math.PI / 2);
curveWall(0, -119.5, 5.6, Math.PI * 1.12, Math.PI * 1.88, 3.4);
plane(2.2, 0.8, sign(['DANGER', 'TRÉMIE'], '#b83a22', '#f2e8d0'), 0, 2.2, -125.3, scene, Math.PI);
// bureau de pesée : murs, plafond bas, porte battante
wallX(-19.9, -11.5, -124.5, 3.2, -15.5);
wallZ(-11.5, -131.85, -124.5, 3.2);
box(8.4, 0.15, 7.4, mats.dark, -15.7, 3.27, -128.2);
addNeon(7, -15.7, -128.2, 2.4, 3.1);
innerDoor('silo_office_door', -15.5, -124.5, 'x', 'Ouvrir la porte du bureau de pesée');
plane(2.2, 0.45, sign(['PESÉE'], '#2b2e2a', '#e8e2c8'), -15.5, 2.85, -124.36, scene);
{
  // bascule (pont-bascule) et cadran de pesée
  box(2.6, 0.1, 1.6, mats.steel, -18.2, 0.05, -127.4);
  const sc = makeScreen(0.8, 0.4, '#ffb347');
  sc.draw(['POIDS', '0 000 kg'], '#ffb347');
  sc.mesh.position.set(-11.65, 1.7, -127.4);
  sc.mesh.rotation.y = -Math.PI / 2;
  scene.add(sc.mesh);
  box(1.6, 0.06, 0.7, mats.wood, -13, 0.8, -130.9);
  [-0.7, 0.7].forEach((dx) => box(0.06, 0.8, 0.6, mats.dark, -13 + dx, 0.4, -130.9));
  pushC(-13, -130.9, 0.85, 0.4);
}

/* ── pompe hydraulique (mur ouest) : il manque le volant ── */
const pump = (() => {
  const g = new THREE.Group();
  g.position.set(-19.5, 0, -108);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  box(1.6, 1.3, 0.8, mats.door, 0, 0.65, 0.2, g);
  cyl(0.35, 1.0, mats.rustpipe, -0.5, 1.8, 0.2, g, 16);
  cyl(0.06, 0.25, mats.steel, 0.45, 1.45, 0.62, g, 10).rotation.x = Math.PI / 2; // axe de la vanne
  const wheel = new THREE.Group();
  wheel.position.set(0.45, 1.45, 0.76);
  wheel.visible = false;
  g.add(wheel);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 24), mats.rustpipe);
  wheel.add(rim);
  for (let i = 0; i < 3; i++) box(0.42, 0.03, 0.03, mats.rustpipe, 0, 0, 0, wheel).rotation.z = (i * Math.PI) / 3;
  const gauge = canvasMat(256, 256, () => {}, 0.25);
  const drawGauge = (p) =>
    gauge.userData.redraw((x, w) => {
      x.fillStyle = '#dcd6c0';
      x.fillRect(0, 0, w, w);
      x.lineWidth = 22;
      [['#b02a1a', 0.75, 1.5], ['#c9a227', 1.5, 1.95], ['#2fa94f', 1.95, 2.25]].forEach(([c, a, b]) => {
        x.strokeStyle = c;
        x.beginPath();
        x.arc(128, 140, 90, a * Math.PI, b * Math.PI);
        x.stroke();
      });
      x.fillStyle = '#1c1c18';
      x.font = 'bold 30px Arial';
      x.textAlign = 'center';
      x.fillText('PRESSION', 128, 215);
      const ang = (0.75 + 1.5 * p) * Math.PI;
      x.strokeStyle = '#111';
      x.lineWidth = 7;
      x.beginPath();
      x.moveTo(128, 140);
      x.lineTo(128 + Math.cos(ang) * 80, 140 + Math.sin(ang) * 80);
      x.stroke();
    });
  drawGauge(0.04);
  cyl(0.3, 0.06, mats.steel, -0.3, 1.0, 0.61, g, 24).rotation.x = Math.PI / 2;
  plane(0.52, 0.52, gauge, -0.3, 1.0, 0.65, g);
  plane(1.4, 0.5, sign(['HYDRAULIQUE'], '#2b2e2a', '#e8e2c8'), 0, 2.6, -0.18, g);
  hitBox(1.8, 2.2, 1.0, 0, 1.1, 0.3, g);
  interactive(g, 'silo_pump', 'Utiliser la pompe hydraulique', 'use', { focusDist: 2.2 });
  pushC(-19.2, -108, 0.6, 0.9);
  return { g, wheel, drawGauge };
})();
cable(V3(-19, 2.3, -108.5), V3(-12, 2.6, -113.5), 0.4, 0.05);
cable(V3(-12, 2.6, -113.5), V3(0, 2.6, -117), 0.3, 0.05);
cable(V3(0, 2.6, -117), V3(12, 2.6, -113.5), 0.3, 0.05);
cable(V3(12, 2.6, -113.5), V3(17.6, 2.2, -108.6), 0.2, 0.05);

/* ── bâche (coin nord-est) : la caisse à outils et le volant sont dessous ── */
const tarp = (() => {
  const g = new THREE.Group();
  g.position.set(-18.4, 0, -130.6);
  scene.add(g);
  box(1.4, 0.55, 0.9, mats.lockerA, 0, 0.28, 0, g); // caisse à outils
  const cover = new THREE.Group();
  g.add(cover);
  box(2.2, 0.7, 1.6, mats.cloth, 0, 0.35, 0, cover);
  box(1.6, 0.25, 1.2, mats.cloth, 0.2, 0.8, -0.1, cover);
  hitBox(2.3, 1.1, 1.7, 0, 0.5, 0, cover);
  interactive(cover, 'silo_tarp', 'Soulever la bâche', 'inspect', { focusDist: 2.2 });
  pushC(-18.4, -130.6, 1.2, 0.9);
  return cover;
})();
const wheelItem = keyItem(-18.5, 0.6, -130.5, 'silo_wheel', 'Prendre le volant de vanne');
wheelItem.children.slice(0, 3).forEach((c) => (c.visible = false));
{
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.028, 8, 24), mats.rustpipe);
  rim.rotation.x = Math.PI / 2;
  wheelItem.add(rim);
  for (let i = 0; i < 3; i++) box(0.38, 0.03, 0.03, mats.rustpipe, 0, 0, 0, wheelItem).rotation.y = (i * Math.PI) / 3;
}
hideObj(wheelItem);

/* ── pupitre de vidange (est) : trois trappes ── */
const panel = (() => {
  const g = new THREE.Group();
  g.position.set(17.6, DOCK_Y, -108.6);
  g.rotation.y = -Math.PI / 2;
  scene.add(g);
  box(2.4, 1.0, 0.8, mats.dark, 0, 0.5, 0, g);
  const top = box(2.5, 0.06, 0.95, mats.steel, 0, 1.03, 0.05, g);
  top.rotation.x = -0.25;
  plane(2.2, 0.45, sign(['VIDANGE DES SILOS'], '#b48a22', '#15171a'), 0, 1.6, -0.35, g);
  box(2.4, 0.9, 0.06, mats.dark, 0, 1.55, -0.38, g);
  const btns = {};
  ['A', 'B', 'C'].forEach((id, i) => {
    const b = new THREE.Group();
    b.position.set(-0.7 + i * 0.7, 1.09, 0.1);
    b.rotation.x = -0.25;
    g.add(b);
    cyl(0.13, 0.05, mats.dark, 0, 0, 0, b, 18);
    const cap = cyl(0.1, 0.07, glow(0xff2a1a, 1.2), 0, 0.05, 0, b, 18);
    plane(0.3, 0.16, sign([id], '#e8e2c8', '#15171a'), 0, 0.005, 0.2, b, 0, -Math.PI / 2);
    hitBox(0.3, 0.2, 0.3, 0, 0.05, 0, b);
    interactive(b, 'silo_btn_' + id, 'Ouvrir la trappe du silo ' + id, 'press', { focusDist: 1.3, cap, silo: id });
    btns[id] = b;
  });
  const note = plane(0.32, 0.4, paperTex2(['Gégé a planqué', 'la clé dans le silo', 'encore plein.', 'Les deux autres', 'sonnent creux.']), 0.95, 1.1, 0.2, g, 0, -Math.PI / 2 - 0.25);
  interactive(note, 'silo_note', 'Lire la note tachée de graisse', 'inspect', { focusDist: 0.8 });
  pushC(17.6, -108.6, 0.6, 1.3);
  return { g, btns };
})();

/* ── clé du silo (apparaît dans le tas de grain) ── */
const siloKey = keyItem(SILOS[2].x + 0.3, 0.78, SILOS[2].z + 1.65, 'silo_key', 'Prendre la clé du silo', 0.6);
siloKey.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.01), glow(0xffb020, 1.4)));
hideObj(siloKey);

/* ── actions ── */
Actions.register('silo_note', async (o) => {
  SND.play('paper');
  await focusOn(o);
  State.siloNote = true;
  say('« Gégé a planqué la clé dans le silo encore plein. Les deux autres sonnent creux. »', 6500);
  setObjective(objectiveNow());
});
Actions.register('silo_tarp', (o) => {
  if (State.siloTarp) return;
  State.siloTarp = true;
  SND.play('paper');
  tween(0.6, (k) => {
    o.position.set(1.6 * k, -0.2 * k, 0);
    o.rotation.z = -1.2 * k;
  }).then(() => hideObj(o));
  showObj(wheelItem);
  say('Sous la bâche : une caisse à outils… et un volant de vanne posé dessus.', 4500);
});
Actions.register('silo_wheel', (o) => {
  State.siloWheel = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  say('Un volant de vanne en fonte. Il doit manquer sur une vanne quelque part.', 4500);
  setObjective(objectiveNow());
});
Actions.register('silo_pump', () => {
  if (State.siloPressure) return say('La pompe ronronne : le circuit des trappes est sous pression.', 3000);
  if (!State.siloWheel) {
    SND.play('locked');
    return say('La vanne de la pompe n’a plus de volant : l’axe est nu. Il doit traîner dans la salle.', 5000);
  }
  State.siloPressure = true;
  pump.wheel.visible = true;
  renderInv();
  SND.play('lever');
  gameTimeout(() => SND.play('genstart'), 500);
  tween(2.4, (k) => {
    pump.wheel.rotation.z = -k * Math.PI * 6;
    pump.drawGauge(0.04 + 0.9 * k);
  }).then(() => {
    Object.values(panel.btns).forEach((b) => (b.userData.cap.material = glow(0x30ff70, 1.6)));
    say('L’aiguille passe au vert. Les voyants du pupitre de vidange s’allument.', 4500);
    setObjective(objectiveNow());
  });
  say('Vous vissez le volant et tournez : la pompe hydraulique se remet à cogner.', 4000);
});
['A', 'B', 'C'].forEach((id) =>
  Actions.register('silo_btn_' + id, (o) => {
    const s = SILOS.find((x) => x.id === id);
    if (!State.siloPressure) {
      SND.play('error');
      return say('Le bouton s’enfonce mollement : aucune pression dans le circuit hydraulique.', 4000);
    }
    if (State.siloHatch[id]) return say('La trappe du silo ' + id + ' est déjà ouverte.', 2500);
    State.siloHatch[id] = true;
    SND.play('click');
    gameTimeout(() => SND.play('door'), 200);
    tween(0.6, (k) => {
      s.hatch.rotation.x = 1.4 * k;
    });
    if (id !== SILO_FULL) return say('La trappe du silo ' + id + ' s’ouvre… un nuage de poussière, rien d’autre. Ce silo était vide.', 5000);
    s.pile.visible = true;
    SND.play('pour');
    tween(2.5, (k) => s.pile.scale.setScalar(Math.max(0.001, k))).then(() => {
      State.siloKeyOut = true;
      showObj(siloKey);
      say('Le grain se déverse en cascade… Quelque chose brille au sommet du tas : la clé !', 5000);
      setObjective(objectiveNow());
    });
    say('La trappe du silo ' + id + ' s’ouvre : le grain s’écoule dans un grondement.', 4000);
  })
);
Actions.register('silo_key', (o) => {
  State.key = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  unlockDoor(doorEnd, TEXTS.hints.door_end_unlocked);
  say('Vous prenez la clé du silo, encore pleine de poussière de grain.', 4500);
  setObjective(objectiveNow());
});

/* ── objectif, étapes, inventaire, dev mode ── */
ROOM_OBJ[7] = () =>
  State.key
    ? 'Vous avez la clé du silo. Ouvrez la porte du fond.'
    : State.siloKeyOut
      ? 'Récupérez la clé dans le tas de grain (touche E).'
      : State.siloPressure
        ? 'Au pupitre de vidange, ouvrez la trappe du silo encore plein.'
        : 'La clé est dans un des silos. Trouvez lequel est plein et remettez la pompe des trappes en marche.';
ROOM_GOALS[7] = () => [
  ['Rallumer l’éclairage (interrupteur général, mur d’entrée)', State.wareLight],
  ['Frapper sur les silos A, B et C pour trouver le plein', ['A', 'B', 'C'].every((k) => State.siloKnock[k]) || State.siloKeyOut],
  ['Trouver le volant de vanne', State.siloWheel],
  ['Remettre la pompe hydraulique sous pression (mur ouest)', State.siloPressure],
  ['Ouvrir la trappe du bon silo (pupitre de vidange, mur est)', State.siloKeyOut],
  ['Prendre la clé du silo', State.key]
];
ROOM_INV.push(() => State.siloWheel && !State.siloPressure && 'Volant de vanne');
ROOM_DEV[7] = () => {
  State.wareLight = true;
  if (!State.siloWheel) Actions.handlers.silo_wheel(wheelItem);
  if (!State.siloPressure) Actions.handlers.silo_pump();
  State.siloPressure = true;
  if (!State.siloKeyOut) Actions.handlers['silo_btn_' + SILO_FULL](panel.btns[SILO_FULL]);
  State.key = true;
  hideObj(siloKey);
  unlockDoor(doorEnd, TEXTS.hints.door_end_unlocked);
};

/* ── décor : sacs de grain, palettes, chariot élévateur, fûts ── */
PROPS.sand(-16.5, -112.5);
PROPS.pallet(-3.8, -106.4);
PROPS.barrels(8, -128.5);
PROPS.drum(-9, -129);
PROPS.crates(18, -119);
PROPS.crates(17.5, -127);
{
  const g = new THREE.Group(); // chariot élévateur, fourches levées
  g.position.set(-8, 0, -108.5);
  g.rotation.y = 0.6;
  scene.add(g);
  box(1.3, 0.9, 2.2, mats.door, 0, 0.75, 0.2, g);
  box(1.2, 1.2, 0.08, mats.dark, 0, 1.8, -0.4, g);
  [-0.45, 0.45].forEach((x) => {
    box(0.08, 2.6, 0.1, mats.dark, x, 1.3, -1.0, g);
    box(0.12, 0.05, 1.1, mats.steel, x, 1.4, -1.6, g);
  });
  [[-0.6, 0.8], [0.6, 0.8], [-0.6, -0.3], [0.6, -0.3]].forEach(([x, z]) => {
    cyl(0.28, 0.25, mats.rubber, x, 0.28, z, g, 14).rotation.z = Math.PI / 2;
  });
  pushC(-8, -108.5, 1.4, 1.5);
}
decal(bloodDecal(4), 3, 3, 5, 0.015, -110, scene, 0, -Math.PI / 2);
decal(bloodDecal(3), 2.4, 2.4, -14, 0.015, -120.5, scene, 0, -Math.PI / 2);
decal(bloodDecal(5), 3, 2.2, -19.85, 3, -120, scene, Math.PI / 2);
cable(V3(-19.8, 10.5, -104), V3(-19.8, 10, -130), 1.2, 0.03);
cable(V3(19.8, 10.6, -104), V3(19.8, 10.2, -130), 0.9, 0.03);
beacon(-19, 8, -126, () => !State.key);
beacon(19, 8, -126, () => !State.key);
