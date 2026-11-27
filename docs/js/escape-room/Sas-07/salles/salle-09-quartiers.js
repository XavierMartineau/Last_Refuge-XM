/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 9 : aire d’évacuation (50 × 50 × 9 m).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers.

   Hélisurface avec l’hélicoptère d’évacuation écrasé, et trois tentes de tri médical.
   Énigme : lire la liste d’évacuation (la clé du convoi est restée sur le Sgt MOREL) → lire les plaques
   des sacs mortuaires dans les tentes → trouver un scalpel dans la caisse médicale → découper le sac de
   MOREL (fermeture rouillée) → prendre la clé du convoi. */
'use strict';
shell(-197, { south: false, w: 50, d: 50, h: 9 });
wallWithDoor(-222, 50, 9);
const doorExit2 = makeDoor('door_exit2', 0, -221.85, 'Examiner la grande porte');
Object.assign(State, { manifestRead: false, medOpen: false, scalpel: false, bagsRead: {}, morelOpen: false });
[-12, 6].forEach((x) => [-184, -200, -214].forEach((z) => addNeon(9, x, z, 4, 8.6)));
/* architecture : sas de contrôle en chicane (on entre, on tourne à droite, portillon), hélisurface
   surélevée avec escalier, murs anti-souffle courbes devant la grande porte */
wallZ(-3, -180, -172.15, 2.6);
wallZ(3, -177.5, -172.15, 2.6);
wallZ(3, -180, -179.4, 2.6);
wallX(-3, 3.12, -180, 2.6);
box(0.25, 0.15, 1.9, mats.wall, 3, 2.53, -178.45);
innerDoor('evac_gate', 3, -178.45, 'z', 'Ouvrir le portillon du contrôle');
plane(1.8, 0.45, sign(['CONTRÔLE'], '#b48a22', '#15171a'), 2.86, 2.25, -175.5, scene, -Math.PI / 2);
plane(2.4, 0.9, sign(['ZONE D’ÉVACUATION', '→'], '#2b2e2a', '#e8e2c8'), 0, 1.7, -179.86, scene);
const PAD_Y = 0.9;
platform(-15.5, -2.5, -202.5, -189.5, PAD_Y, { open: [['e', -197.5, -194.5]] });
stairs(-2.5, 0.3, -197.5, -194.5, 0, PAD_Y, '-x');
curveWall(0, -222, 6, Math.PI * 0.12, Math.PI * 0.42, 2.2);
curveWall(0, -222, 6, Math.PI * 0.58, Math.PI * 0.88, 2.2);
{
  const L = new THREE.PointLight(0xfff0d0, 0, 16, 2); // projecteur de l’hélisurface
  L.position.set(-9, 6, -196);
  scene.add(L);
  neon.lights.push({ l: L, room: 9, base: 40 });
}
const canvas9 = new THREE.MeshStandardMaterial({ color: 0x4f5a3a, roughness: 1, side: THREE.DoubleSide });
const bagMat = new THREE.MeshStandardMaterial({ color: 0x101210, roughness: 0.55, metalness: 0.1 });

/* ── hélisurface + hélicoptère écrasé ── */
{
  const pad = new THREE.MeshStandardMaterial({ color: 0xd8d2bd, roughness: 0.9 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(5.6, 6, 48), pad);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(-9, PAD_Y + 0.013, -196);
  noRay(ring);
  scene.add(ring);
  [[-1.1, 0], [1.1, 0]].forEach(([dx]) => noRay(plane(0.5, 3.4, pad, -9 + dx, PAD_Y + 0.013, -196, scene, 0, -Math.PI / 2)));
  noRay(plane(2.2, 0.5, pad, -9, PAD_Y + 0.013, -196, scene, 0, -Math.PI / 2));
  const g = new THREE.Group();
  g.position.set(-9, PAD_Y, -196);
  g.rotation.set(0, 0.35, 0.12);
  scene.add(g);
  const hull = new THREE.MeshStandardMaterial({ color: 0x3d4a35, roughness: 0.7, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.25, 3.2, 8, 16), hull);
  body.rotation.x = Math.PI / 2;
  body.position.set(0, 1.6, 0);
  body.castShadow = true;
  g.add(body);
  plane(1.6, 0.9, mats.glass, 0, 1.9, 2.55, g, 0, -0.3).castShadow = false;
  box(0.5, 0.5, 6, hull, 0, 1.9, -4.6, g).rotation.x = -0.08;
  box(0.12, 1.6, 0.9, hull, 0, 2.6, -7.4, g);
  const tail = new THREE.Group();
  tail.position.set(0.2, 2.7, -7.4);
  g.add(tail);
  [0, 1].forEach((i) => box(0.06, 1.4, 0.12, mats.dark, 0, 0, 0, tail).rotation.x = (i * Math.PI) / 2);
  const rotor = new THREE.Group();
  rotor.position.set(0, 3.1, 0);
  g.add(rotor);
  cyl(0.25, 0.4, mats.dark, 0, -0.15, 0, rotor, 12);
  [0, 1, 2, 3].forEach((i) => {
    const b = box(5.5, 0.05, 0.35, mats.dark, 2.75, 0, 0, new THREE.Group());
    const arm = b.parent;
    arm.rotation.y = (i * Math.PI) / 2;
    if (i === 1) arm.rotation.z = -0.35; // pale tordue
    rotor.add(arm);
  });
  [-0.9, 0.9].forEach((x) => {
    box(0.08, 0.08, 4.2, mats.steel, x, 0.15, 0.2, g);
    [-1, 1.2].forEach((z) => box(0.06, 0.6, 0.06, mats.steel, x * 0.85, 0.45, z, g));
  });
  plane(1.4, 0.5, sign(['MEDEVAC 07'], '#d8d2bd', '#8a1c14'), 1.27, 1.7, 0.3, g, Math.PI / 2);
  decal(bloodDecal(4), 3, 3, -6.5, PAD_Y + 0.015, -193, scene, 0, -Math.PI / 2);
  interactive(g, 'evac_heli', 'Examiner l’hélicoptère', 'inspect', { focusDist: 6 });
  Actions.register('evac_heli', () => {
    SND.play('click');
    say('L’hélicoptère d’évacuation n’a jamais décollé : une pale tordue, le cockpit maculé de sang. Le pilote n’est plus là.', 6000);
  });
  pushC(-9, -196, 2.2, 2.4);
  pushC(-10.3, -199.8, 1, 3);
}

/* ── tentes de tri (côté est) ── */
const BAGS = [
  { tent: 0, dz: -1.6, name: 'Cpl. DURAND' },
  { tent: 0, dz: 1.6, name: 'Sdt. LEBLANC' },
  { tent: 1, dz: -1.6, name: 'Sdt. ROUX' },
  { tent: 1, dz: 1.6, name: 'Sgt. MOREL', key: true },
  { tent: 2, dz: 1.6, name: 'Cpl. FAURE' }
];
const TENTS = [-181, -195, -209];
TENTS.forEach((zc, t) => {
  const x0 = 14, x1 = 22, xr = 18, d = 7.6;
  const g = new THREE.Group();
  scene.add(g);
  const slope = Math.hypot(4, 1.2),
    a = Math.atan2(1.2, 4);
  box(slope, 0.05, d, canvas9, (x0 + xr) / 2, 2.8, zc, g).rotation.z = a;
  box(slope, 0.05, d, canvas9, (xr + x1) / 2, 2.8, zc, g).rotation.z = -a;
  box(0.05, 2.2, d, canvas9, x1, 1.1, zc, g);
  [-1, 1].forEach((s) => {
    box(x1 - x0, 2.2, 0.05, canvas9, (x0 + x1) / 2, 1.1, zc + (s * d) / 2, g);
    EXTRA_COLLIDERS.push([x0, x1, zc + (s * d) / 2 - 0.12, zc + (s * d) / 2 + 0.12]);
    box(0.08, 2.3, 0.08, mats.dark, x0, 1.15, zc + (s * d) / 2, g);
  });
  EXTRA_COLLIDERS.push([x1 - 0.12, x1 + 0.12, zc - d / 2, zc + d / 2]);
  box(0.08, 3.4, 0.08, mats.dark, xr, 1.7, zc, g);
  noRay(plane(x1 - x0 - 0.2, d - 0.2, canvas9, (x0 + x1) / 2, 0.01, zc, scene, 0, -Math.PI / 2));
  plane(1.2, 1.2, sign(['✚'], '#e8e2c8', '#b02a1a'), x0 + 0.02, 2.8, zc, scene, -Math.PI / 2);
  plane(1.8, 0.4, sign(['TRI ' + (t + 1)], '#2b2e2a', '#e8e2c8'), x0 + 0.03, 1.9, zc - 2.6, scene, -Math.PI / 2);
  box(0.8, 0.3, 0.5, mats.lockerA, 21.2, 0.15, zc, g); // caisse de pansements
  addNeon(9, 18, zc, 2.4, 3.2);
});
BAGS.forEach((b, i) => {
  const zc = TENTS[b.tent] + b.dz;
  PROPS.stretcher(17.5, zc);
  const g = new THREE.Group();
  g.position.set(17.5, 0.96, zc);
  scene.add(g);
  box(1.7, 0.22, 0.55, bagMat, 0, 0.11, 0, g);
  const flap = new THREE.Group();
  flap.position.set(0, 0.22, -0.27);
  g.add(flap);
  box(1.6, 0.04, 0.55, bagMat, 0, 0.02, 0.27, flap);
  box(1.5, 0.02, 0.03, mats.steel, 0, 0.045, 0.27, flap); // fermeture éclair
  const tag = box(0.08, 0.12, 0.01, mats.steel, -0.86, 0.12, 0.12, g);
  tag.rotation.y = Math.PI / 2;
  hitBox(1.8, 0.5, 0.7, 0, 0.2, 0, g);
  interactive(g, 'evac_bag_' + i, 'Lire la plaque du sac mortuaire', 'inspect', { focusDist: 1.6, flap });
  b.group = g;
  Actions.register('evac_bag_' + i, (o) => {
    State.bagsRead[i] = true;
    if (!b.key) {
      SND.play('click');
      setObjective(objectiveNow());
      return say('Plaque : « ' + b.name + ' ». Ce n’est pas lui. Vous laissez le sac fermé.', 4000);
    }
    if (State.morelOpen) return say('Le sac de MOREL est ouvert.', 2500);
    if (!State.scalpel) {
      SND.play('locked');
      setObjective(objectiveNow());
      return say('Plaque : « Sgt. MOREL ». La fermeture éclair est rouillée, bloquée. Il faudrait découper la toile.', 5500);
    }
    State.morelOpen = true;
    SND.play('cutlock');
    renderInv();
    tween(0.8, (k) => (o.userData.flap.rotation.x = -1.6 * k));
    showObj(convoyKey);
    say('Vous fendez la toile au scalpel. Sur la poitrine du sergent, accrochée à sa plaque : la clé du convoi.', 6000);
    setObjective(objectiveNow());
  });
});
const morel = BAGS.find((b) => b.key);
const convoyKey = keyItem(17.6, 1.2, TENTS[morel.tent] + morel.dz, 'evac_convoy_key', 'Prendre la clé du convoi', 0.3);
convoyKey.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.01), glow(0xffb020, 1.4)));
hideObj(convoyKey);

/* ── poste de commandement de l’évacuation : liste sur la table de campagne ── */
{
  const x = -19.5, z = -178.5;
  box(2.2, 0.06, 1, mats.wood, x, 0.78, z);
  [-0.95, 0.95].forEach((dx) => [-0.4, 0.4].forEach((dz) => box(0.05, 0.78, 0.05, mats.steel, x + dx, 0.39, z + dz)));
  pushC(x, z, 1.2, 0.6);
  box(0.6, 0.35, 0.4, mats.dark, x - 0.6, 0.98, z - 0.2); // radio de campagne
  const clip = new THREE.Group();
  clip.position.set(x + 0.4, 0.82, z + 0.05);
  clip.rotation.y = 0.2;
  scene.add(clip);
  box(0.3, 0.015, 0.4, mats.wood, 0, 0, 0, clip);
  plane(0.26, 0.34, paperTex2(['ÉVACUATION', 'ANNULÉE', 'clé du convoi :', 'Sgt MOREL (KIA)', '→ tente de tri']), 0, 0.009, 0.01, clip, 0, -Math.PI / 2);
  hitBox(0.45, 0.2, 0.5, 0, 0.05, 0, clip);
  interactive(clip, 'evac_manifest', 'Lire la liste d’évacuation', 'inspect', { focusDist: 0.9 });
  plane(2.4, 1.2, sign(['ÉVACUATION', 'POINT DE', 'RASSEMBLEMENT'], '#b48a22', '#15171a'), -24.85, 2.4, z, scene, Math.PI / 2);
}
Actions.register('evac_manifest', async (o) => {
  SND.play('paper');
  await focusOn(o);
  State.manifestRead = true;
  say('Liste d’évacuation : « Vol annulé. La clé du convoi est restée sur le Sgt. MOREL (mort au combat), transféré en tente de tri. »', 8000);
  setObjective(objectiveNow());
});

/* ── caisse médicale (scalpel) ── */
const medCrate = (() => {
  const g = new THREE.Group();
  g.position.set(-20, 0, -214);
  g.rotation.y = 0.3;
  scene.add(g);
  const green = new THREE.MeshStandardMaterial({ color: 0x4a5a3a, roughness: 0.8 });
  box(1.2, 0.6, 0.7, green, 0, 0.3, 0, g);
  const lid = new THREE.Group();
  lid.position.set(0, 0.6, -0.35);
  g.add(lid);
  box(1.22, 0.08, 0.72, green, 0, 0.04, 0.35, lid);
  plane(0.4, 0.4, sign(['✚'], '#e8e2c8', '#b02a1a'), 0, 0.085, 0.35, lid, 0, -Math.PI / 2);
  hitBox(1.3, 0.8, 0.8, 0, 0.35, 0, g);
  interactive(g, 'evac_med', 'Ouvrir la caisse médicale', 'open', { focusDist: 1.6, lid });
  pushC(-20, -214, 0.75, 0.6);
  return g;
})();
const scalpel = (() => {
  const g = new THREE.Group();
  g.position.set(-20, 0.45, -214);
  g.rotation.y = 0.9;
  scene.add(g);
  box(0.14, 0.012, 0.018, mats.steel, 0, 0, 0, g);
  box(0.05, 0.008, 0.012, new THREE.MeshStandardMaterial({ color: 0xe8eef0, metalness: 0.9, roughness: 0.2 }), 0.09, 0, 0, g);
  hitBox(0.35, 0.15, 0.3, 0, 0, 0, g);
  interactive(g, 'evac_scalpel', 'Prendre le scalpel', 'pickup', { focusDist: 0.7 });
  hideObj(g);
  return g;
})();
Actions.register('evac_med', (o) => {
  if (State.medOpen) return say(State.scalpel ? 'La caisse est vide.' : 'Un scalpel est posé dans la caisse.', 2500);
  State.medOpen = true;
  SND.play('locker');
  tween(0.6, (k) => (o.userData.lid.rotation.x = -1.9 * k));
  showObj(scalpel);
  say('Bandages, seringues vides… et un scalpel encore stérile.', 4000);
});
Actions.register('evac_scalpel', (o) => {
  State.scalpel = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  say('Vous prenez le scalpel. Assez tranchant pour couper une toile épaisse.', 4000);
  setObjective(objectiveNow());
});
Actions.register('evac_convoy_key', (o) => {
  State.key2 = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  unlockDoor(doorExit2, TEXTS.hints.door_exit2_unlocked);
  say(TEXTS.msg.key2Taken, 4000);
  setObjective(objectiveNow());
});

ROOM_OBJ[9] = () =>
  State.key2
    ? TEXTS.objectives.exitFinal2
    : State.morelOpen
      ? 'Prenez la clé du convoi dans le sac du Sgt. MOREL (touche E).'
      : State.manifestRead
        ? 'Trouvez le sac mortuaire du Sgt. MOREL dans les tentes de tri et ouvrez-le.'
        : 'Aire d’évacuation : la liste d’évacuation, sur la table de campagne, dit où est la clé du convoi.';
ROOM_GOALS[9] = () => [
  ['Lire la liste d’évacuation (table de campagne, côté ouest)', State.manifestRead],
  ['Trouver le sac du Sgt. MOREL dans les tentes de tri', !!State.bagsRead[BAGS.indexOf(morel)]],
  ['Trouver de quoi couper la toile (caisse médicale)', State.scalpel],
  ['Ouvrir le sac de MOREL', State.morelOpen],
  ['Prendre la clé du convoi', State.key2]
];
ROOM_INV.push(() => State.scalpel && !State.morelOpen && 'Scalpel');
ROOM_DEV[9] = () => {
  Object.assign(State, { manifestRead: true, medOpen: true, scalpel: true, morelOpen: true, key2: true });
  hideObj(convoyKey);
  hideObj(scalpel);
  morel.group.userData.flap.rotation.x = -1.6;
  unlockDoor(doorExit2, TEXTS.hints.door_exit2_unlocked);
};

/* ── décor : jeep sanitaire, projecteurs, cônes, carburant, sacs de sable ── */
makeJeep(-20, -202, 0);
[[-23.5, -175], [23.5, -219], [-23.5, -219]].forEach(([x, z]) => {
  box(0.1, 3, 0.1, mats.dark, x, 1.5, z);
  const head = box(0.7, 0.45, 0.3, mats.dark, x, 3.1, z);
  head.rotation.y = Math.atan2(-9 - x, -196 - z);
  box(0.6, 0.35, 0.05, glow(0xfff0c0, 1.5), x, 3.1, z);
  pushC(x, z, 0.3, 0.3);
});
for (let i = 0; i < 6; i++) {
  const x = -15 + i * 1.6;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0xd25a1a, roughness: 0.7 }));
  cone.position.set(x, 0.28, -188.6);
  scene.add(cone);
}
PROPS.drum(9, -219.5);
PROPS.drum(9.7, -219.5);
PROPS.drum(-23, -190);
PROPS.drum(-23, -191);
PROPS.crates(8, -176);
PROPS.tarp(-6, -207);
decal(bloodDecal(5), 4, 4, 4, 0.015, -200, scene, 0, -Math.PI / 2);
decal(bloodDecal(3), 3, 3, 12, 0.015, -188, scene, 0, -Math.PI / 2);
decal(bloodDecal(5), 3, 2.2, -24.8, 2, -205, scene, Math.PI / 2);
cable(V3(-24.6, 8.2, -174), V3(-24.6, 7.8, -220), 1.3, 0.035);
beacon(-24, 7, -216, () => !State.key2);
beacon(24, 7, -174, () => !State.key2);
