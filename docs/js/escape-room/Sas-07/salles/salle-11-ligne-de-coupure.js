/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 11 : ligne de coupure.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* bureau avec écran (utilisé dans le complexe) */
const desk = (x, z, w = 2.4, ry = 0) => {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  scene.add(g);
  box(w, 0.06, 1, mats.wood, 0, 0.78, 0, g);
  [-1, 1].forEach((dx) => box(0.08, 0.78, 0.8, mats.dark, dx * (w / 2 - 0.08), 0.39, 0, g));
  box(0.7, 0.4, 0.05, mats.dark, 0, 1.05, -0.25, g);
  const sc = makeScreen(0.64, 0.34);
  sc.draw(['> LIAISON', '  PERDUE', '> CODE 7-7'], '#ff6a5a');
  sc.mesh.position.set(0, 1.05, -0.222);
  g.add(sc.mesh);
  pushC(x, z, ry ? 0.6 : w / 2 + 0.1, ry ? w / 2 + 0.1 : 0.6);
  return g;
};
/* portes intérieures du complexe (bureau, dépôt, poste de contrôle) */
let doorCtrl = null;
function openInner(o) {
  const u = o.userData;
  u.opened = true;
  SND.play('door');
  openDoorAnim(o, 1.2);
  const i = EXTRA_COLLIDERS.indexOf(u.col);
  if (i >= 0) EXTRA_COLLIDERS.splice(i, 1);
}
shell(-287, { south: false, w: 120, d: 50, h: 9.6 });
wallWithDoor(-312, 120, 9.6);
const doorExit3 = makeDoor('door_exit3', 0, -311.85, 'Examiner la porte principale');
[-15, -5, 5, 15].forEach((x) => [-268, -280, -292, -304].forEach((z) => addNeon(11, x, z, 4, 9.3)));
[-54, -42, -30, 30, 42, 54].forEach((x) =>
  [-268, -280, -292, -304].forEach((z) => addNeon(11, x, z, 4, 9.3))
);
[-54, -42, -30, -18].forEach((x) => [-286, -300].forEach((z) => addNeon(11, x, z, 4, 4.3))); // sous la mezzanine
{
  // mezzanine
  const slab = tiled(mats.floor, 4, 9);
  box(
    PLAT.x1 - PLAT.x0,
    0.3,
    PLAT.z1 - PLAT.z0,
    slab,
    (PLAT.x0 + PLAT.x1) / 2,
    PLAT.y - 0.15,
    (PLAT.z0 + PLAT.z1) / 2
  );
  box(PLAT.x1 - PLAT.x0, 0.35, 0.5, mats.dark, (PLAT.x0 + PLAT.x1) / 2, PLAT.y - 0.4, PLAT.z1 + 0.25);
  box(0.5, 0.35, PLAT.z1 - PLAT.z0, mats.dark, PLAT.x1 + 0.25, PLAT.y - 0.4, (PLAT.z0 + PLAT.z1) / 2);
  [-286, -296, -306].forEach((z) =>
    [-6, -12, -24, -36, -48, -58].forEach((x) =>
      box(0.5, PLAT.y - 0.3, 0.5, mats.dark, x, (PLAT.y - 0.3) / 2, z)
    )
  );
  // escalier : 24 marches
  for (let i = 1; i <= 24; i++)
    box(2.4, i * 0.2, 0.3, mats.lockerA, -4.8, i * 0.1, STAIR.za - (i - 0.5) * 0.3);
  // garde-corps
  const rail = (x, z, len, alongZ, y) => {
    alongZ ? box(0.06, 0.06, len, mats.steel, x, y, z) : box(len, 0.06, 0.06, mats.steel, x, y, z);
  };
  for (let z = PLAT.z0 + 0.5; z < PLAT.z1; z += 2) box(0.06, 1, 0.06, mats.steel, PLAT.x1, PLAT.y + 0.5, z);
  rail(PLAT.x1, (PLAT.z0 + PLAT.z1) / 2, PLAT.z1 - PLAT.z0, true, PLAT.y + 1);
  rail(PLAT.x1, (PLAT.z0 + PLAT.z1) / 2, PLAT.z1 - PLAT.z0, true, PLAT.y + 0.5);
  for (let x = PLAT.x0 + 0.5; x < STAIR.x0 - 0.1; x += 2)
    box(0.06, 1, 0.06, mats.steel, x, PLAT.y + 0.5, PLAT.z1);
  rail((PLAT.x0 + STAIR.x0) / 2, PLAT.z1, STAIR.x0 - PLAT.x0, false, PLAT.y + 1);
  rail((PLAT.x0 + STAIR.x0) / 2, PLAT.z1, STAIR.x0 - PLAT.x0, false, PLAT.y + 0.5);
  const L = Math.hypot(7.2, 4.8),
    ang = Math.atan2(4.8, 7.2);
  [-6.1, -3.5].forEach((x) => {
    const r = box(0.05, 0.05, L, mats.steel, x, 1 + 2.4, (STAIR.za + STAIR.zb) / 2);
    r.rotation.x = ang;
    box(0.05, 1, 0.05, mats.steel, x, 0.5, STAIR.za);
    box(0.05, 1, 0.05, mats.steel, x, PLAT.y + 0.5, STAIR.zb);
  });
  EXTRA_COLLIDERS.push(
    [PLAT.x1 - 0.1, PLAT.x1 + 0.1, PLAT.z0, PLAT.z1],
    [PLAT.x0, STAIR.x0 - 0.1, PLAT.z1 - 0.15, PLAT.z1 + 0.15],
    [STAIR.x0 - 0.25, STAIR.x0 - 0.05, STAIR.zb, STAIR.za],
    [STAIR.x1 + 0.05, STAIR.x1 + 0.25, STAIR.zb, STAIR.za]
  );
  plane(2.6, 0.5, sign(['ÉTAGE ▲']), -4.8, 3.2, STAIR.za + 0.01, scene, 0);
}
const _cc0 = scene.children.length,
  _ce0 = EXTRA_COLLIDERS.length;
// poste de contrôle sur la mezzanine
{
  const Y = PLAT.y;
  wallX(-20, -10, -296, 3.4, -15, Y);
  wallZ(-10, -312, -296, 3.4, Y);
  plane(10, 16, mats.ceil, -15, Y + 3.4, -304, scene, 0, Math.PI / 2);
  const dC = (doorCtrl = makeDoor('door_ctrl', -15, -295.85, 'Examiner la porte du poste de contrôle'));
  dC.position.y = Y;
  const col = [-15.95, -14.05, -296.2, -295.8];
  EXTRA_COLLIDERS.push(col);
  dC.userData.col = col;
  addNeon(11, -15, -304, 3, Y + 3.3);
  desk(-15, -309, 3, 0).position.y = Y;
  const m1 = makeScreen(0.8, 0.5);
  m1.mesh.position.set(-15, Y + 1.25, -309.25);
  scene.add(m1.mesh);
  m1.draw(['POSTE DE CONTRÔLE', '', '> DISJONCTEUR PRINCIPAL', '  HORS TENSION'], '#ff7a5a');
  const g = new THREE.Group();
  g.position.set(-19.8, Y, -303);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  box(1.4, 1.9, 0.2, mats.lockerA, 0, 1.4, 0, g);
  box(1.1, 1.5, 0.03, mats.dark, 0, 1.4, 0.11, g);
  const arm = new THREE.Group();
  arm.position.set(0, 1.4, 0.14);
  g.add(arm);
  cyl(0.03, 0.7, mats.steel, 0, 0.3, 0, arm, 10);
  const kn = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xaa1a12, roughness: 0.4 })
  );
  kn.position.set(0, 0.65, 0);
  arm.add(kn);
  arm.rotation.x = 0.7;
  const led = box(0.1, 0.1, 0.03, glow(0xff2a1a, 3), 0, 2.2, 0.12, g);
  decal(bloodDecal(2), 0.8, 1, 0.3, 1.2, 0.12, g);
  interactive(g, 'breaker', 'Abaisser le disjoncteur principal', 'use', { arm, led, focusDist: 1.7 });
}
paperNote(
  [
    'BUREAU (rez-de-ch.)',
    'cadenas : 4 1 8',
    '',
    'Le pied-de-biche',
    'est resté dessus.',
    'Dépôt : barre à sauter'
  ],
  -19.88,
  PLAT.y + 1.6,
  -285,
  Math.PI / 2,
  'note_stairs'
);
scene.children.slice(_cc0).forEach((o) => {
  o.position.x -= 40;
});
EXTRA_COLLIDERS.slice(_ce0).forEach((c) => {
  c[0] -= 40;
  c[1] -= 40;
}); // poste de contrôle : au bout ouest de la mezzanine
const _bb0 = scene.children.length,
  _be0 = EXTRA_COLLIDERS.length;
// BUREAU (x 8…20, z -284…-270) : porte à cadenas à code
wallX(8, 20, -270, 3.6, 14);
wallX(8, 20, -284, 3.6);
wallZ(8, -284, -270, 3.6);
plane(12, 14, mats.ceil, 14, 3.6, -277, scene, 0, Math.PI / 2);
const doorBureau = makeDoor('door_bureau', 14, -269.85, 'Examiner la porte du bureau');
{
  const col = [13.05, 14.95, -270.2, -269.8];
  EXTRA_COLLIDERS.push(col);
  doorBureau.userData.col = col;
}
addNeon(11, 14, -277, 3, 3.5);
desk(16.5, -282, 2.6, 0);
EXTRA_COLLIDERS.push([15.2, 17.8, -282.6, -281.4]);
{
  const c = new THREE.Group();
  c.position.set(15.8, 0.84, -282.1);
  c.rotation.y = 0.5;
  scene.add(c);
  box(0.04, 0.04, 0.55, mats.steel, 0, 0, 0, c);
  box(0.04, 0.04, 0.14, mats.steel, 0, 0, 0.27, c).rotation.y = 0.6;
  hitBox(0.3, 0.2, 0.7, 0, 0, 0, c);
  interactive(c, 'crowbar', 'Prendre le pied-de-biche', 'pickup', { focusDist: 0.9 });
}
decal(bloodDecal(3), 3, 3, 13, 0.015, -277, scene, 0, -Math.PI / 2);
// DÉPÔT (x 8…20, z -304…-288) : barre de fer sur la porte
wallX(8, 20, -288, 3.6, 14);
wallX(8, 20, -304, 3.6);
wallZ(8, -304, -288, 3.6);
plane(12, 16, mats.ceil, 14, 3.6, -296, scene, 0, Math.PI / 2);
const doorDepot = makeDoor('door_depot', 14, -287.85, 'Examiner la porte du dépôt');
{
  const col = [13.05, 14.95, -288.2, -287.8];
  EXTRA_COLLIDERS.push(col);
  doorDepot.userData.col = col;
}
const barDepot = new THREE.Group();
barDepot.position.set(14, 1.15, -287.55);
scene.add(barDepot);
box(2.5, 0.1, 0.08, mats.steel, 0, 0, 0, barDepot);
[-1.1, 1.1].forEach((x) => box(0.14, 0.3, 0.1, mats.dark, x, 0, 0.01, barDepot));
hitBox(2.5, 0.5, 0.4, 0, 0, 0, barDepot);
interactive(barDepot, 'bar_depot', 'Retirer la barre de fer', 'use', { focusDist: 1.6 });
addNeon(11, 14, -296, 3, 3.5);
[
  [10, -301],
  [18, -301],
  [10, -291.5]
].forEach(([x, z]) => {
  box(1.6, 1.8, 0.6, mats.lockerA, x, 0.9, z);
  box(1.5, 0.04, 0.5, mats.dark, x, 1.5, z);
  EXTRA_COLLIDERS.push([x - 0.8, x + 0.8, z - 0.3, z + 0.3]);
});
keyItem(10, 1.88, -301, 'key_ctrl', 'Prendre la clé du poste de contrôle', 0.3);
scene.children.slice(_bb0).forEach((o) => {
  o.position.x += 40;
});
EXTRA_COLLIDERS.slice(_be0).forEach((c) => {
  c[0] += 40;
  c[1] += 40;
}); // bureau + dépôt : contre le nouveau mur est
// décor de la grande salle
decal(bloodDecal(5), 5, 5, 0, 0.015, -290, scene, 0, -Math.PI / 2);
decal(bloodDecal(4), 4, 4, -6, 0.015, -266, scene, 0, -Math.PI / 2);
decal(bloodDecal(2), 3, 3, 2, 0.015, -306, scene, 0, -Math.PI / 2);
scatter(
  -59,
  59,
  -310,
  -264,
  78,
  [
    [-4, 4, -312, -262],
    [-60, -3, -312, -266],
    [47, 61, -305, -268]
  ],
  ['crates', 'barrels', 'pallet', 'drum', 'tarp']
);
beacon(-59, 9, -266, () => !State.breaker);
beacon(59, 9, -308, () => !State.breaker);
