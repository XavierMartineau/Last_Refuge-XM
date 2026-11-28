/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 5 : hangar principal (acte 2).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═════════ ACTE 2 : HANGAR (40×40×8 m), ENTREPÔT (40×30×6 m), SILO (30×30×12 m) ═════════
   Ces trois salles sont immenses (≈ 3 700 m² au total) et sont remplies automatiquement de décor (fonction scatter). */
const EXTRA_COLLIDERS = []; // collisions des grandes salles (testées dans blocked())
const pushC = (x, z, hx, hz) => EXTRA_COLLIDERS.push([x - hx, x + hx, z - hz, z + hz]);
const hideObj = (o) => {
  o.visible = false;
  o.traverse((c) => {
    c.raycast = () => {};
  });
};
const bigLights = [0, 1, 2].map(() => {
  const L = new THREE.PointLight(0xdfffe8, 0, 34, 2);
  scene.add(L);
  return L;
}); // 3 lumières « suiveuses » pour les grandes salles
const sandbag = (x, y, z, s = 1) => {
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), mats.cloth);
  b.scale.set(0.62 * s, 0.2 * s, 0.36 * s);
  b.position.set(x, y, z);
  b.rotation.y = (rnd() - 0.5) * 0.3;
  b.castShadow = b.receiveShadow = true;
  scene.add(b);
};
const PROPS = {
  crates(x, z) {
    const n = 1 + ((rnd() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const w = 0.8 + rnd() * 0.5,
        h = 0.6 + rnd() * 0.5,
        d = 0.7 + rnd() * 0.4,
        ox = (rnd() - 0.5) * 0.5,
        oz = (rnd() - 0.5) * 0.5;
      box(w, h, d, mats.crate, x + ox, h / 2, z + oz).rotation.y = rnd() * 0.5;
      if (i > 0 && rnd() < 0.6)
        box(w * 0.8, 0.5, d * 0.8, mats.crate, x + ox * 0.5, h + 0.25, z + oz * 0.5).rotation.y = rnd();
    }
    pushC(x, z, 0.95, 0.95);
  },
  barrels(x, z) {
    const n = 2 + ((rnd() * 3) | 0);
    for (let i = 0; i < n; i++)
      cyl(0.32, 0.95, mats.rustpipe, x + (i % 2) * 0.7 - 0.35, 0.475, z + ((i / 2) | 0) * 0.7 - 0.3);
    pushC(x, z, 0.8, 0.8);
  },
  pallet(x, z) {
    box(1.2, 0.14, 1, mats.wood, x, 0.07, z);
    for (let i = 0; i < 2; i++)
      box(1.1 - i * 0.2, 0.5, 0.9 - i * 0.2, mats.crate, x, 0.14 + 0.25 + i * 0.5, z);
    pushC(x, z, 0.75, 0.65);
  },
  sand(x, z) {
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 5 - r; i++) sandbag(x - 1.5 + i * 0.62 + r * 0.31, 0.2 + r * 0.36, z);
    pushC(x, z, 1.7, 0.6);
  },
  drum(x, z) {
    cyl(0.32, 0.95, mats.rustpipe, x, 0.475, z);
    cyl(0.34, 0.05, mats.dark, x, 0.97, z);
    pushC(x, z, 0.45, 0.45);
  },
  tarp(x, z) {
    box(1.6, 0.5, 1.2, mats.cloth, x, 0.25, z);
    box(1, 0.35, 0.9, mats.cloth, x + 0.1, 0.62, z);
    pushC(x, z, 0.9, 0.7);
  },
  machine(x, z) {
    box(1.3, 1.2, 0.8, mats.dark, x, 0.6, z);
    box(1.1, 0.5, 0.05, mats.steel, x, 0.9, z + 0.43);
    for (let i = 0; i < 4; i++) box(0.7, 0.035, 0.02, mats.dark, x, 0.75 + i * 0.1, z + 0.46);
    cyl(0.2, 0.15, mats.rustpipe, x, 1.28, z);
    pushC(x, z, 0.75, 0.55);
  },
  stretcher(x, z) {
    box(1.8, 0.09, 0.75, mats.steel, x, 0.75, z);
    box(1.65, 0.15, 0.65, mats.cloth, x, 0.87, z);
    [-0.75, 0.75].forEach((dx) => [-0.3, 0.3].forEach((dz) => {
      box(0.05, 0.65, 0.05, mats.dark, x + dx, 0.38, z + dz);
      cyl(0.1, 0.06, mats.rubber, x + dx, 0.1, z + dz).rotation.z = Math.PI / 2;
    }));
    pushC(x, z, 1, 0.5);
  },
  workbench(x, z) {
    box(1.8, 0.12, 0.75, mats.wood, x, 0.85, z);
    [-0.75, 0.75].forEach((dx) => box(0.1, 0.8, 0.6, mats.dark, x + dx, 0.4, z));
    box(0.45, 0.2, 0.3, mats.rustpipe, x + 0.4, 1.01, z);
    box(0.6, 0.04, 0.06, mats.steel, x - 0.35, 0.94, z + 0.15);
    pushC(x, z, 1, 0.5);
  }
};
function scatter(x0, x1, z0, z1, n, avoid = [], kinds = Object.keys(PROPS)) {
  let done = 0,
    tries = 0;
  const taken = [];
  while (done < n && tries < n * 40) {
    tries++;
    const x = x0 + rnd() * (x1 - x0),
      z = z0 + rnd() * (z1 - z0);
    if (Math.abs(x) < 3) continue; // couloir central toujours libre
    if (avoid.some((a) => x > a[0] - 1.2 && x < a[1] + 1.2 && z > a[2] - 1.2 && z < a[3] + 1.2)) continue;
    if (taken.some((t) => Math.hypot(t[0] - x, t[1] - z) < 2.6)) continue;
    taken.push([x, z]);
    done++;
    PROPS[kinds[(rnd() * kinds.length) | 0]](x, z);
  }
}
const posterTex = (n, d) => {
  const sf = new Surface(256)
    .base('#b9ad8a', 0.9, 0.5)
    .grain(30)
    .blob(40, 200, 60, '110,80,30', 0.4)
    .blob(210, 60, 50, '110,80,30', 0.35);
  sf.write('ALLÉE ' + n, 128, 50, 'bold 32px Arial', 'rgba(30,24,16,.9)');
  sf.write(d, 128, 150, 'bold 150px Georgia', 'rgba(88,8,7,.95)');
  sf.blood(2, { drip: true });
  return pbr(sf, { bump: 0.6 });
};
function makeFuse(id, x, y, z, lying) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  scene.add(g);
  if (lying) g.rotation.z = Math.PI / 2;
  cyl(
    0.03,
    0.11,
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xffb347,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.85
    }),
    0,
    0,
    0,
    g,
    12
  );
  cyl(0.034, 0.03, mats.steel, 0, 0.07, 0, g, 12);
  cyl(0.034, 0.03, mats.steel, 0, -0.07, 0, g, 12);
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.4, 0.4),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  g.add(hit); // zone de clic agrandie (le fusible est petit)
  interactive(g, id, 'Prendre le fusible', 'pickup', { focusDist: 0.7 });
  return g;
}
function makeSlotBox() {
  const g = new THREE.Group();
  g.position.set(3.6, 1.5, -71.76);
  scene.add(g);
  box(0.8, 0.9, 0.14, mats.dark, 0, 0, 0, g);
  box(0.7, 0.8, 0.02, mats.steel, 0, 0, 0.08, g);
  const leds = [];
  for (let i = 0; i < 3; i++) {
    cyl(0.045, 0.12, mats.dark, -0.22 + i * 0.22, 0.1, 0.1, g, 12).rotation.x = Math.PI / 2;
    leds.push(box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), -0.22 + i * 0.22, -0.22, 0.1, g));
  }
  decal(bloodDecal(2), 0.7, 0.8, 0, 0, 0.092, g);
  interactive(g, 'fusebox_01', 'Utiliser la boîte à fusibles', 'use', { leds, focusDist: 1.3 });
  return g;
}

/* ── Pièce 5 : le hangar ── */
shell(-52, { south: false, w: 120, d: 40, h: 8 });
wallWithDoor(-72, 120, 8);
const _r5 = scene.children.length;
const doorHangar = makeDoor('door_hangar', 0, -71.85, 'Examiner la porte du fond');
[-14, -5, 5, 14].forEach((x) => [-38, -46, -54, -62, -68].forEach((z) => addNeon(5, x, z, 4, 7.6)));
[-40, -52, -64].forEach((z) => box(40, 0.4, 0.6, mats.dark, 0, 7.4, z));
{
  const g = new THREE.Group();
  g.position.set(-9, 0, -46);
  scene.add(g); // camion militaire
  box(3, 0.5, 8, mats.dark, 0, 0.9, 0, g);
  box(2.8, 2.2, 5, mats.lockerA, 0, 2.2, -1.2, g);
  box(2.8, 1.9, 2.2, mats.door, 0, 1.95, 3.1, g);
  plane(2.4, 0.8, mats.glass, 0, 2.4, 4.21, g);
  [-3.2, 2.9].forEach((z) =>
    [-1.5, 1.5].forEach((x) => {
      const w = cyl(0.55, 0.45, mats.rubber, x, 0.55, z, g, 18);
      w.rotation.z = Math.PI / 2;
    })
  );
  decal(bloodDecal(3), 3, 2, 1.42, 1.9, -1.2, g, Math.PI / 2);
  pushC(-9, -46, 1.8, 4.3);
}
box(1.2, 1, 1, mats.crate, 14, 0.5, -40);
box(1, 0.9, 0.9, mats.crate, 14.1, 1.45, -40);
box(0.8, 0.7, 0.8, mats.crate, 14, 2.25, -40);
pushC(14, -40, 0.9, 0.8); // pile de caisses (fusible 1)
box(2.2, 0.08, 0.9, mats.wood, 16, 0.9, -64);
[
  [-1, -0.35],
  [1, -0.35],
  [-1, 0.35],
  [1, 0.35]
].forEach(([dx, dz]) => box(0.07, 0.9, 0.07, mats.dark, 16 + dx, 0.45, -64 + dz));
pushC(16, -64, 1.2, 0.6); // établi (fusible 3)
makeFuse('fuse_1', 14, 2.67, -39.75, false); // au bord de la caisse du haut : atteignable depuis l’allée
makeFuse('fuse_2', -9, 0.06, -50.9, true);
makeFuse('fuse_3', 15.5, 0.99, -64, true);
const fuseBox = makeSlotBox();
[-12, 12].forEach((x) =>
  [-42, -52, -62].forEach((z) => {
    box(0.8, 8, 0.8, mats.dark, x, 4, z);
    box(1.1, 0.3, 1.1, mats.band, x, 0.15, z);
    pushC(x, z, 0.5, 0.5);
  })
); // colonnes
// mur sud du hangar (z=-32) : le sas de la salle des machines n’en occupe que 12 m → on complète sur 40 m et sur 8 m de haut
[-13, 13].forEach((x) => box(14, 8, 0.3, tiled(mats.wall, 3.5, 2.35), x, 4, -32));
box(12, 4.6, 0.3, tiled(mats.wall, 3, 1.35), 0, 5.7, -32);
plane(2.4, 1.2, sign(['HANGAR', 'N°1']), 0, 3.4, -71.8, scene, 0, 0);
decal(bloodDecal(5), 5, 5, -4, 0.015, -56, scene, 0, -Math.PI / 2);
decal(bloodDecal(4), 4, 4, 10, 0.015, -48, scene, 0, -Math.PI / 2);
decal(bloodDecal(4), 4, 4, -14, 0.015, -66, scene, 0, -Math.PI / 2);
scatter(-18, 18, -70, -34, 95, [
  [11, 13, -63, -41],
  [-13, -11, -63, -41],
  [-11, -7, -50, -42],
  [13, 15, -41, -39],
  [14.8, 17.2, -65, -63],
  [-2, 6, -72, -69],
  [-4, 4, -35, -31]
], ['crates', 'barrels', 'pallet', 'drum', 'machine', 'workbench']);
beacon(-19, 6, -40, () => !State.power5);
beacon(19, 6, -60, () => !State.power5);

widenRoom(_r5, { room: 5, hw: 20, thr: 5, zs: [-32, -72], y: 7.6, fill: 28, kinds: ['crates', 'pallet', 'machine', 'workbench'] });
/* ── Pièce 6 : l’entrepôt (rayonnages) ── */
