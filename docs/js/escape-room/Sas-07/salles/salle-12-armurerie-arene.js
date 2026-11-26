/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 12 : armurerie-arène et zone d’évacuation.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═════════ PIÈCE 12 : L’ARMURERIE-ARÈNE (50×50×9 m) — clé cachée, casier d’armes, zombies, sortie finale ═════════
   Construite avec les coordonnées d’origine (z de -222 à -272) puis décalée de Z12 mètres (tout est ajouté à un groupe décalé). */
const Z12 = -90,
  _c12 = EXTRA_COLLIDERS.length,
  _sceneAdd = scene.add.bind(scene),
  G12 = new THREE.Group();
const SAFE_ZONE = { x0: -4, x1: 4, z0: -233 + Z12, z1: -224 + Z12 };
function inSafeZone(x, z, padding = 0) {
  return x >= SAFE_ZONE.x0 - padding && x <= SAFE_ZONE.x1 + padding &&
    z >= SAFE_ZONE.z0 - padding && z <= SAFE_ZONE.z1 + padding;
}
G12.position.z = Z12;
_sceneAdd(G12);
scene.add = (...o) => G12.add(...o);
[-67.5, 67.5].forEach((x) => box(15, 9, 0.3, mats.wall, x, 4.5, -222)); // raccord avec le mur du complexe (40 m) : la salle fait 50 m
shell(-247, { south: false, w: 150, d: 50, h: 9 });
wallWithDoor(-272, 150, 9);
const _r12 = G12.children.length;
const doorShutter = makeDoor('door_shutter', 0, -271.85, 'Examiner la grande porte de sortie');
const exitLight = plane(
  10,
  6.5,
  new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xeafcff, emissiveIntensity: 3 }),
  0,
  2.8,
  -272.9
);
[-18, -9, 0, 9, 18].forEach((x) => [-229, -238, -247, -256, -265].forEach((z) => addNeon(12, x, z, 4, 8.6)));
// rangée de casiers contre le mur ouest (le casier d’armes est le n°4)
function makeGunLocker(z, id, gun) {
  const g = new THREE.Group();
  g.position.set(-24.4, 0, z);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  box(0.9, 2.2, 0.6, mats.lockerB, 0, 1.1, 0, g);
  const pivot = new THREE.Group();
  pivot.position.set(-0.43, 1.1, 0.31);
  g.add(pivot);
  box(0.86, 2.1, 0.04, gun ? mats.door : mats.lockerA, 0.43, 0, 0, pivot);
  for (let i = 0; i < 4; i++) box(0.5, 0.012, 0.01, mats.dark, 0.43, 0.65 - i * 0.05, 0.025, pivot);
  box(0.04, 0.16, 0.04, mats.steel, 0.74, 0, 0.045, pivot);
  if (gun) {
    const l = box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), 0.43, 0.9, 0.03, pivot);
    g.userData.led = l;
    box(0.14, 0.1, 0.03, mats.dark, 0.43, 0.35, 0.04, pivot);
    cyl(0.03, 0.03, mats.steel, 0.43, 0.35, 0.07, pivot, 10).rotation.x = Math.PI / 2;
    decal(bloodDecal(2), 0.8, 1.2, 0.43, 0.2, 0.03, pivot);
  }
  interactive(g, id, gun ? 'Examiner le casier d’armes' : 'Ouvrir le casier', 'use', {
    pivot,
    led: gun ? g.userData.led : null,
    focusDist: 1.7
  });
  pushC(-24.4, z, 0.4, 0.5);
  return g;
}
const lockerZs = [-243, -244.1, -245.2, -246.3, -247.4, -248.5];
const gunLockers = lockerZs.map((z, i) => makeGunLocker(z, i === 3 ? 'locker_gun' : 'locker_x' + i, i === 3));
plane(1.6, 0.5, sign(['ARMURERIE']), -24.9, 2.5, -245.6, scene, Math.PI / 2, 0);
// bureau du capitaine au fond à droite : la clé du casier est restée dessus
desk(20, -268, 2.8, 0);
box(0.3, 0.02, 0.2, mats.cloth, 19.4, 0.82, -267.7);
{
  const k = new THREE.Group();
  k.position.set(20.5, 0.84, -267.6);
  k.rotation.y = 0.4;
  scene.add(k);
  const t = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 16), mats.steel);
  t.rotation.x = Math.PI / 2;
  k.add(t);
  box(0.012, 0.012, 0.16, mats.steel, 0, 0, 0.13, k);
  box(0.03, 0.012, 0.02, mats.steel, 0.02, 0, 0.18, k);
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.2, 0.4),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  k.add(hit);
  interactive(k, 'key_03', 'Prendre la clé du casier', 'pickup', { focusDist: 0.8 });
}
// notes et recensement
function paperNote(lines, x, y, z, ry, id, w = 0.9, h = 1.1) {
  const sf = new Surface(256)
    .base('#c9bc99', 0.9, 0.5)
    .grain(30)
    .blob(40, 200, 60, '110,80,30', 0.4)
    .blob(210, 50, 50, '110,80,30', 0.35);
  lines.forEach((t, i) =>
    sf.write(t, 128, 36 + i * (200 / lines.length), 'bold 19px Georgia', 'rgba(40,30,20,.92)')
  );
  sf.blood(1, { w: 120, h: 100, drip: false });
  const p = plane(w, h, pbr(sf, { bump: 0.6 }), x, y, z, scene, ry);
  interactive(p, id, 'Lire la note', 'inspect', { focusDist: 1.4 });
  return p;
}
paperNote(
  ['La clé du casier', 'd’armes ?', 'Posée sur le bureau', 'du capitaine,', 'tout au fond,', 'à droite.'],
  -4,
  1.6,
  -222.2,
  Math.PI,
  'note_gunkey'
);
{
  const sf = new Surface(256).base('#b9ad8a', 0.9, 0.5).grain(30).blob(40, 200, 60, '110,80,30', 0.4);
  sf.write('RECENSEMENT', 128, 38, 'bold 26px Arial', 'rgba(30,24,16,.9)');
  sf.write('SECTEUR 10', 128, 70, 'bold 20px Arial', 'rgba(30,24,16,.9)');
  sf.write(String(CONFIG.zombieTarget), 128, 150, 'bold 120px Georgia', 'rgba(88,8,7,.95)');
  sf.write('INFECTÉS', 128, 222, 'bold 28px Arial', 'rgba(88,8,7,.95)');
  sf.blood(3, { drip: true });
  const p = plane(1.1, 1.4, pbr(sf, { bump: 0.6 }), -24.93, 1.7, -241, scene, Math.PI / 2);
  interactive(p, 'clue_zombies', 'Lire le recensement', 'inspect', { focusDist: 1.7 });
}
decal(bloodDecal(5), 5, 5, -4, 0.015, -240, scene, 0, -Math.PI / 2);
decal(bloodDecal(5), 5, 5, 10, 0.015, -255, scene, 0, -Math.PI / 2);
decal(bloodDecal(4), 4, 4, -14, 0.015, -262, scene, 0, -Math.PI / 2);
decal(bloodDecal(4), 4, 4, 16, 0.015, -232, scene, 0, -Math.PI / 2);
[-12, 12].forEach((x) =>
  [-236, -247, -258].forEach((z) => {
    box(0.8, 9, 0.8, mats.dark, x, 4.5, z);
    box(1.1, 0.3, 1.1, mats.band, x, 0.15, z);
    pushC(x, z, 0.5, 0.5);
  })
);
// quelques abris (sacs de sable) pour se protéger, puis du décor
[
  [-6, -236],
  [6, -240],
  [-8, -252],
  [8, -258],
  [0, -246]
].forEach(([x, z]) => PROPS.sand(x, z));
scatter(
  -23,
  23,
  -268,
  -226,
  36,
  [
    [-26, -22, -252, -236],
    [17, 23, -270, -264],
    [-8, -4, -238, -234],
    [4, 8, -242, -238],
    [-10, -6, -254, -250],
    [6, 10, -260, -256],
    [-2, 2, -248, -244],
    [-14, -10, -260, -256],
    [-14, -10, -249, -245],
    [-5, 5, -234, -223],
    [4, 10, -240, -229],
    [-6, -2, -258, -254],
    [2, 6, -258, -254],
    [-20, -10, -246, -238],
    [10, 20, -246, -238]
  ],
  ['crates', 'sand', 'tarp', 'stretcher', 'machine']
);
beacon(-24, 8, -228, () => !State.zDone);
beacon(24, 8, -262, () => !State.zDone);
const arenaOutposts = [
  [-15, -242, 'INFIRMERIE', 0x3e7668],
  [15, -242, 'ATELIER', 0xb77b2d],
  [-42, -234, 'TRIAGE', 0x498272],
  [42, -234, 'CONTRÔLE', 0x68869c],
  [-42, -259, 'QUARANTAINE', 0x9b713b],
  [42, -259, 'RAVITAILLEMENT', 0x8c704a]
];
widenRoom(_r12, {
  room: 12, hw: 25, thr: 5, zs: [-222, -272], y: 8.6, fill: 36, group: G12, zoff: Z12,
  kinds: ['crates', 'tarp', 'stretcher', 'machine', 'workbench'],
  avoid: arenaOutposts.map(([x, z]) => [x - 5, x + 5, z - 4, z + 4])
});

function arenaOutpost(x, z, title, color) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  scene.add(g);
  const accent = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  box(8, 0.04, 6, accent, 0, 0.03, 0, g);
  box(8, 0.14, 6, mats.cloth, 0, 3.15, 0, g);
  [-3.8, 3.8].forEach((dx) => [-2.8, 2.8].forEach((dz) => {
    box(0.12, 3.1, 0.12, mats.steel, dx, 1.55, dz, g);
    fillCols.push([x + dx - 0.1, x + dx + 0.1, z + dz + Z12 - 0.1, z + dz + Z12 + 0.1]);
  }));
  box(8, 2.2, 0.12, mats.dark, 0, 1.15, -2.9, g);
  fillCols.push([x - 4, x + 4, z - 3 + Z12, z - 2.8 + Z12]);
  plane(3.2, 0.55, sign([title], '#d4c8a2'), 0, 2.5, -2.8, g);
  box(2.4, 0.12, 0.8, mats.steel, -2, 0.8, -1.7, g);
  [-2.9, -1.1].forEach((dx) => box(0.1, 0.8, 0.7, mats.dark, dx, 0.4, -1.7, g));
  box(0.65, 0.35, 0.5, accent, -2, 1.04, -1.7, g);
  fillCols.push([x - 3.3, x - 0.7, z - 2.2 + Z12, z - 1.2 + Z12]);
  if (title === 'INFIRMERIE' || title === 'TRIAGE') {
    box(2.3, 0.12, 0.9, mats.steel, 1.8, 0.7, -1.5, g);
    box(2.1, 0.18, 0.75, mats.mattress, 1.8, 0.85, -1.5, g);
    [-0.9, 0.9].forEach((dx) => box(0.08, 0.65, 0.7, mats.dark, 1.8 + dx, 0.35, -1.5, g));
    const red = new THREE.MeshStandardMaterial({ color: 0xb42b22 });
    box(0.5, 0.12, 0.02, red, 1.8, 1.8, -2.8, g);
    box(0.12, 0.5, 0.02, red, 1.8, 1.8, -2.8, g);
  } else {
    box(2.3, 1.25, 0.7, mats.lockerA, 1.8, 0.625, -1.7, g);
    box(2, 0.06, 0.7, mats.steel, 1.8, 1.28, -1.7, g);
    [1, 1.8, 2.6].forEach((dx) => box(0.45, 0.25, 0.45, accent, dx, 1.43, -1.7, g));
  }
  fillCols.push([x + 0.6, x + 3, z - 2.2 + Z12, z - 0.9 + Z12]);
  const light = new THREE.PointLight(color, 15, 11, 2);
  light.position.set(0, 2.8, 0.5);
  g.add(light);
}
arenaOutposts.forEach(([x, z, title, color]) => arenaOutpost(x, z, title, color));

{
  const marker = glow(0x56e6ca, 1.2);
  box(8, 0.025, 9, new THREE.MeshStandardMaterial({ color: 0x174139, roughness: 0.8 }), 0, 0.014, -228.5);
  [-4, 4].forEach((x) => box(0.1, 0.035, 9, marker, x, 0.035, -228.5));
  [-233, -224].forEach((z) => box(8, 0.035, 0.1, marker, 0, 0.035, z));
  plane(3.2, 0.55, sign(['ZONE SÛRE · TIR INTERDIT']), 0, 2.8, -222.2, scene, Math.PI);
  const safeLight = new THREE.PointLight(0x45e6c6, 18, 14, 2);
  safeLight.position.set(0, 4, -228.5);
  scene.add(safeLight);
  [-10, 10].forEach((x) => {
    const alarm = new THREE.PointLight(0xff2518, 0, 25, 2);
    alarm.position.set(x, 6.8, -250);
    alarm.userData.on = () => State.armed && !State.zDone && State.room === 12;
    alarms.push(alarm);
    scene.add(alarm);
    beacon(x, 6.8, -250, () => State.armed && !State.zDone);
  });
  for (let i = 0; i < ARENA_STAIR.steps; i++) {
    const height = (i + 1) * ARENA_STAIR.rise;
    box(4, height, 1, mats.steel, 7, height / 2, -230.5 - i);
    box(4, 0.025, 0.08, marker, 7, height + 0.015, -230 - i);
  }
  box(4, 1.5, 3, mats.steel, 7, 0.75, -237.5);
}
function arenaSupply(id, x, z, medical) {
  const g = new THREE.Group();
  g.position.set(x, 0.25, z);
  scene.add(g);
  const main = new THREE.MeshStandardMaterial({ color: medical ? 0xe9e9dc : 0x56643e, roughness: 0.7 });
  box(0.75, 0.5, 0.48, main, 0, 0, 0, g);
  box(0.35, 0.05, 0.08, mats.dark, 0, 0.28, 0, g);
  if (medical) {
    const red = new THREE.MeshStandardMaterial({ color: 0xb51e1e });
    box(0.36, 0.1, 0.02, red, 0, 0, 0.25, g);
    box(0.1, 0.36, 0.02, red, 0, 0, 0.25, g);
  } else {
    box(0.52, 0.08, 0.02, glow(0xe8c26a, 0.7), 0, 0, 0.25, g);
  }
  hitBox(0.9, 0.7, 0.65, 0, 0, 0, g);
  interactive(g, id, medical ? 'Utiliser la trousse de soin progressive' : 'Recharger instantanément', 'pickup');
}
arenaSupply('arena_medkit_1', -2, -227, true);
arenaSupply('arena_ammo_1', 2, -227, false);
arenaSupply('arena_medkit_2', -4, -256, true);
arenaSupply('arena_ammo_2', 4, -256, false);
scene.add = _sceneAdd;
for (let i = _c12; i < EXTRA_COLLIDERS.length; i++) {
  const c = EXTRA_COLLIDERS[i];
  c[2] += Z12;
  c[3] += Z12;
} // colliders décalés eux aussi
