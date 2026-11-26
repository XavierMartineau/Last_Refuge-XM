/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 8 : salle de commandement (acte 3).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═════════ ACTE 3 : SALLE DE COMMANDEMENT (50×40×10 m) et AIRE D’ÉVACUATION (50×50×9 m) ═════════ */
const makeJeep = (x, z, ry = 0) => {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  scene.add(g);
  box(2, 0.5, 4.2, mats.lockerA, 0, 0.75, 0, g);
  box(1.9, 0.7, 1.5, mats.lockerA, 0, 1.3, -0.6, g);
  box(1.8, 0.06, 1.6, mats.cloth, 0, 1.7, -0.6, g);
  plane(1.7, 0.55, mats.glass, 0, 1.4, 0.16, g);
  [
    [-1, 1.3],
    [1, 1.3],
    [-1, -1.3],
    [1, -1.3]
  ].forEach(([dx, dz]) => {
    const w = cyl(0.42, 0.4, mats.rubber, dx * 1.02, 0.42, dz, g, 18);
    w.rotation.z = Math.PI / 2;
  });
  box(0.1, 0.5, 0.1, mats.dark, 0.8, 1.45, -0.1, g);
  decal(bloodDecal(3), 2, 1, 0, 1.01, 0.5, g, 0, -Math.PI / 2);
  pushC(x, z, 1.3, 2.3);
  return g;
};
const rack = (x, z, ry) => {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  scene.add(g);
  box(0.9, 2.1, 0.7, mats.dark, 0, 1.05, 0, g);
  for (let i = 0; i < 7; i++) {
    box(0.8, 0.1, 0.02, mats.steel, 0, 0.25 + i * 0.28, 0.36, g);
    const l = box(0.04, 0.04, 0.01, glow(i % 2 ? 0x30ff70 : 0xff7a2a, 2.5), 0.3, 0.25 + i * 0.28, 0.37, g);
    blinkers.push({ m: l.material, s: 2 + i * 0.7, p: i + x });
  }
  pushC(x, z, 0.6, 0.6);
  return g;
};
const desk = (x, z, w = 2.4, ry = 0) => {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  scene.add(g);
  box(w, 0.06, 1, mats.wood, 0, 0.78, 0, g);
  [-1, 1].forEach((dx) => box(0.08, 0.78, 0.8, mats.dark, dx * (w / 2 - 0.08), 0.39, 0, g));
  const m = box(0.7, 0.4, 0.05, mats.dark, 0, 1.05, -0.25, g);
  const sc = makeScreen(0.64, 0.34);
  sc.draw(['> LIAISON', '  PERDUE', '> CODE 7-7'], '#ff6a5a');
  sc.mesh.position.set(0, 1.05, -0.222);
  g.add(sc.mesh);
  pushC(x, z, ry ? 0.6 : w / 2 + 0.1, ry ? w / 2 + 0.1 : 0.6);
  return g;
};
PROPS.rackrow = (x, z) => {
  for (let i = 0; i < 3; i++) rack(x + i * 1.0 - 1, z, 0);
};
PROPS.deskset = (x, z) => {
  desk(x, z, 2.2, 0);
};
const wallDec = (x, y, z, ry, n) => decal(bloodDecal(n), 3, 2.2, x, y, z, scene, ry);

/* ── Pièce 8 : salle de commandement ── */
shell(-152, { south: false, w: 150, d: 40, h: 10 });
// murs : ouverture du silo (30 m) → on complète sur 50 m ; porte du fond
[-20, 20].forEach((x) => box(10, 12, 0.3, tiled(mats.wall, 2.5, 3.5), x, 6, -132));
wallWithDoor(-172, 150, 10);
const _r8 = scene.children.length;
const doorCmd = makeDoor('door_cmd', 0, -171.85, 'Examiner la porte du fond');
[-18, -9, 0, 9, 18].forEach((x) => [-140, -150, -160, -168].forEach((z) => addNeon(8, x, z, 4, 9.6)));
// grande table de situation au centre + écran géant
box(9, 0.12, 4, mats.wood, 0, 0.9, -152, scene);
[-4, 4].forEach((x) => [-1.6, 1.6].forEach((z) => box(0.2, 0.9, 0.2, mats.dark, x, 0.45, -152 + z)));
pushC(0, -152, 4.6, 2.1);
{
  const sf = new Surface(512)
    .base('#2a3a2a', 0.8, 0.5)
    .grain(30)
    .lines(64, 'rgba(180,220,160,.25)')
    .blob(150, 200, 70, '200,60,40', 0.35)
    .blob(360, 300, 80, '60,160,200', 0.25);
  sf.write('SECTEUR 7', 256, 60, 'bold 56px Courier New', 'rgba(210,235,200,.8)');
  plane(8.6, 3.8, pbr(sf, { bump: 0.4 }), 0, 0.965, -152, scene, 0, -Math.PI / 2);
}
[
  [-20, -171.7],
  [0, -171.7],
  [20, -171.7]
].forEach(([x, z], i) => {
  box(10, 5, 0.2, mats.dark, x, 6, z + 0.1);
  const sc = makeScreen(9.6, 4.6);
  sc.draw(
    [
      'COMMANDEMENT',
      '',
      '> RELAIS 1 : ' + (i === 0 ? 'HS' : '--'),
      '> RELAIS 2 : HS',
      '> RELAIS 3 : HS',
      '',
      '> ALIMENTATION',
      '  PRINCIPALE : HORS LIGNE'
    ],
    '#ff6a5a'
  );
  sc.mesh.position.set(x, 6, z + 0.215);
  scene.add(sc.mesh);
});
plane(3, 1.4, sign(['RELAIS', 'O · E · N']), -4, 2.4, -131.8, scene, 0, 0);
// trois relais à abaisser (ouest, est, nord)
const relays = [];
function makeRelay(i, x, y, z, ry) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  scene.add(g);
  box(0.5, 0.8, 0.14, mats.dark, 0, 0, 0, g);
  box(0.44, 0.7, 0.02, mats.steel, 0, 0, 0.08, g);
  const arm = new THREE.Group();
  arm.position.set(0, 0.05, 0.12);
  arm.rotation.x = 0.7;
  g.add(arm);
  cyl(0.015, 0.4, mats.steel, 0, 0.2, 0, arm, 8);
  {
    const kn = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), glow(0xff2a1a, 1.5));
    kn.position.set(0, 0.42, 0);
    arm.add(kn);
  }
  const led = box(0.08, 0.04, 0.02, glow(0xff2a1a, 3), 0, 0.3, 0.09, g);
  decal(bloodDecal(1), 0.5, 0.7, 0, 0, 0.095, g);
  interactive(g, 'relay_' + i, 'Actionner le relais', 'lever', { arm, led, idx: i - 1, focusDist: 1.4 });
  relays.push(g);
  return g;
}
makeRelay(1, -24.8, 1.4, -141, Math.PI / 2);
makeRelay(2, 24.8, 1.4, -163, -Math.PI / 2);
makeRelay(3, -8, 1.4, -171.7, 0);
// cadavres / décor sanglant
[
  [-10, -137],
  [12, -145],
  [-16, -160],
  [18, -130]
].forEach(([x, z]) => decal(bloodDecal(5), 4, 4, x, 0.015, z, scene, 0, -Math.PI / 2));
scatter(
  -23,
  23,
  -171,
  -134,
  70,
  [
    [-5, 5, -155, -149],
    [-24, -23, -142, -140],
    [-22, -18, -170, -168]
  ],
  ['crates', 'barrels', 'pallet', 'sand', 'drum', 'tarp', 'rackrow', 'deskset', 'rackrow']
);
beacon(-24, 8, -138, () => !State.power8);
beacon(24, 8, -168, () => !State.power8);

widenRoom(_r8, { room: 8, hw: 25, thr: 5, zs: [-132, -172], y: 9.6, fill: 36, kinds: ['rackrow', 'deskset', 'crates'] });
/* ── Pièce 9 : aire d’évacuation (véhicules) ── */
