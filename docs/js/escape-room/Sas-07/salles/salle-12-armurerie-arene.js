/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 12 : armurerie-arène et zone d’évacuation.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═════════ PIÈCE 12 : L’ARMURERIE-ARÈNE (50×50×9 m) — clé cachée, casier d’armes, zombies, sortie finale ═════════
   Construite avec les coordonnées d’origine (z de -222 à -272) puis décalée de Z12 mètres (tout est ajouté à un groupe décalé). */
const Z12 = -90,
  _c12 = EXTRA_COLLIDERS.length,
  _sceneAdd = scene.add.bind(scene),
  G12 = new THREE.Group();
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
    [-14, -10, -249, -245]
  ],
  ['crates', 'barrels', 'pallet', 'drum', 'tarp']
);
beacon(-24, 8, -228, () => !State.zDone);
beacon(24, 8, -262, () => !State.zDone);
widenRoom(_r12, { room: 12, hw: 25, thr: 5, zs: [-222, -272], y: 8.6, fill: 36, group: G12, zoff: Z12 });
scene.add = _sceneAdd;
for (let i = _c12; i < EXTRA_COLLIDERS.length; i++) {
  const c = EXTRA_COLLIDERS[i];
  c[2] += Z12;
  c[3] += Z12;
} // colliders décalés eux aussi
