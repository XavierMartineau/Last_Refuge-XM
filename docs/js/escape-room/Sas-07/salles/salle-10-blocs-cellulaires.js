/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 10 : bloc cellulaire (30 × 40 × 5 m).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers.

   Panoptique : une tour de garde vitrée au centre, 8 cellules (O1–O4 à l’ouest, E1–E4 à l’est).
   Énigme : la note de l’entrée parle du badge du gardien → le badge est sur son corps, cellule O1
   (ouverte) → badge sur le lecteur de la tour → registre de garde : VASSEUR (E3) a volé la clé du bloc
   et « tapotait une brique du mur du fond » → pupitre de la tour : ouvrir la grille E3 → desceller la
   brique → prendre la clé du bloc. */
'use strict';
shell(-242, { south: false, w: 30, d: 40, h: 5 });
wallWithDoor(-262, 120, 9.6); // mur mitoyen avec le complexe (plus haut)
const doorBlock = makeDoor('door_block', 0, -261.85, 'Examiner la porte du bloc');
Object.assign(State, { guardBadge: false, towerOpen: false, cellLog: false, cellOpen: { O1: true }, brickOut: false });
[-6, 6].forEach((x) => [-231, -253].forEach((z) => addNeon(10, x, z, 2.4, 4.8)));
{
  const L = new THREE.PointLight(0xff3a20, 0, 10, 2); // gyrophare au sommet de la tour
  L.position.set(0, 4.6, -242);
  scene.add(L);
  neon.lights.push({ l: L, room: 10, base: 10 });
}

/* ── cellules : 4 de chaque côté, grilles en façade, couchette, cuvette ── */
const CELL_Z = [-226, -234, -242, -250, -258];
const CELLS10 = [];
CELL_Z.forEach((z) =>
  [-1, 1].forEach((s) => {
    box(6, 5, 0.25, mats.wall, s * 12, 2.5, z);
    EXTRA_COLLIDERS.push([s > 0 ? 9 : -15, s > 0 ? 15 : -9, z - 0.15, z + 0.15]);
  })
);
{
  const list = [];
  [-1, 1].forEach((s) =>
    [0, 1, 2, 3].forEach((i) => {
      const za = CELL_Z[i],
        zb = CELL_Z[i + 1],
        zc = (za + zb) / 2,
        x = s * 9,
        id = (s < 0 ? 'O' : 'E') + (i + 1);
      for (let z = zb + 0.2; z < za - 0.1; z += 0.22) if (Math.abs(z - zc) > 1.05) list.push([x, z]);
      EXTRA_COLLIDERS.push([x - 0.12, x + 0.12, zb, zc - 0.95], [x - 0.12, x + 0.12, zc + 0.95, za]);
      box(0.25, 1.9, 8, mats.wall, x, 4.05, zc);
      box(0.08, 0.1, 8, mats.steel, x, 3.1, zc);
      box(0.08, 0.1, 8, mats.steel, x, 0.05, zc);
      plane(1.1, 0.42, sign([id], '#d8d2bd', '#15171a'), x - s * 0.14, 3.6, zc, scene, s < 0 ? Math.PI / 2 : -Math.PI / 2);
      // mobilier
      const bx = s * 13.9;
      box(1.0, 0.12, 2.2, mats.lockerA, bx, 0.45, zc - 2.2);
      box(1.0, 0.08, 2.1, mats.cloth, bx, 0.55, zc - 2.2);
      [[-0.45, -1.05], [0.45, -1.05], [-0.45, 1.05], [0.45, 1.05]].forEach(([dx, dz]) =>
        box(0.05, 0.45, 0.05, mats.steel, bx + dx, 0.22, zc - 2.2 + dz)
      );
      EXTRA_COLLIDERS.push([bx - 0.5, bx + 0.5, zc - 3.3, zc - 1.1]);
      box(0.5, 0.4, 0.55, mats.steel, s * 14.4, 0.2, zc + 2.6);
      cyl(0.2, 0.1, mats.steel, s * 14.4, 0.45, zc + 2.6);
      decal(bloodDecal((i + (s > 0 ? 3 : 0)) % 6), 2, 2, s * 12, 0.015, zc, scene, 0, -Math.PI / 2);
      // grille (pivot côté +z), ouverte vers le couloir
      const pv = new THREE.Group();
      pv.position.set(x, 0, zc + 0.95);
      scene.add(pv);
      [0.05, 3.05].forEach((y) => box(0.06, 0.08, 1.9, mats.steel, 0, y, -0.95, pv));
      [0, -1.9].forEach((z2) => box(0.06, 3.1, 0.06, mats.steel, 0, 1.55, z2, pv));
      for (let k = 1; k < 9; k++) cyl(0.016, 3, mats.steel, 0, 1.55, -k * 0.21, pv, 6);
      box(0.12, 0.18, 0.1, mats.dark, 0, 1.45, -1.72, pv);
      hitBox(0.25, 3, 1.9, 0, 1.55, -0.95, pv);
      const col = [x - 0.12, x + 0.12, zc - 0.95, zc + 0.95];
      interactive(pv, 'cell_gate_' + id, 'Grille de la cellule ' + id, 'door', { focusDist: 2.2 });
      const cell = { id, s, zc, pv, col, open: false };
      if (id === 'O1') {
        pv.rotation.y = s * 1.45;
        cell.open = true;
      } else EXTRA_COLLIDERS.push(col);
      CELLS10.push(cell);
      Actions.register('cell_gate_' + id, () => {
        if (cell.open) return say('La grille de la cellule ' + id + ' est ouverte.', 2500);
        SND.play('locked');
        say('Grille ' + id + ' verrouillée. Pas de serrure : elles se commandent depuis la tour de garde.', 4500);
      });
    })
  );
  bars(list);
}
function openCell(id) {
  const c = CELLS10.find((x) => x.id === id);
  if (!c || c.open) return false;
  c.open = true;
  State.cellOpen[id] = true;
  SND.play('unlock');
  gameTimeout(() => SND.play('door'), 250);
  tween(1, (k) => (c.pv.rotation.y = c.s * 1.45 * k));
  const i = EXTRA_COLLIDERS.indexOf(c.col);
  if (i >= 0) EXTRA_COLLIDERS.splice(i, 1);
  return true;
}

/* ── tour de garde (centre) : murs bas, bandeau vitré, toit, porte à badge ── */
wallX(-3, 3, -239, 2.6, 0);
wallX(-3, 3, -245, 2.6);
wallZ(-3, -245, -239, 2.6);
wallZ(3, -245, -239, 2.6);
{
  const glassM = mats.glass;
  [[0, -239, 0], [0, -245, Math.PI], [-3, -242, -Math.PI / 2], [3, -242, Math.PI / 2]].forEach(([x, z, ry]) => {
    plane(6, 1.2, glassM, x, 3.2, z, scene, ry).castShadow = false;
  });
  [[-3, -239], [3, -239], [-3, -245], [3, -245]].forEach(([x, z]) => box(0.18, 1.4, 0.18, mats.dark, x, 3.3, z));
  box(6.5, 0.12, 0.2, mats.dark, 0, 2.62, -239);
  box(6.5, 0.12, 0.2, mats.dark, 0, 2.62, -245);
  box(6.6, 0.25, 6.6, mats.dark, 0, 3.95, -242);
  addNeon(10, 0, -242, 2.4, 3.75);
  plane(2.2, 0.45, sign(['POSTE CENTRAL'], '#b48a22', '#15171a'), 0, 4.3, -238.85, scene);
}
// plancher surélevé de la tour + marches devant la porte
const TOWER_Y = 0.45;
platform(-2.88, 2.88, -244.88, -239.12, TOWER_Y, { rails: false, skip: ['n', 's', 'e', 'w'] });
stairs(-0.95, 0.95, -239, -236.8, 0, TOWER_Y, '-z');
const towerDoor = (() => {
  const pv = new THREE.Group();
  pv.position.set(-0.95, TOWER_Y, -239);
  scene.add(pv);
  box(1.88, 2.0, 0.08, mats.door, 0.94, 1.0, 0, pv); // porte posée sur le plancher surélevé
  box(0.9, 0.45, 0.03, glow(0x9fe8ff, 0.2), 0.94, 1.5, 0.05, pv);
  const col = [-0.95, 0.95, -239.15, -238.85];
  EXTRA_COLLIDERS.push(col);
  const reader = new THREE.Group();
  reader.position.set(1.45, 1.3, -238.83);
  scene.add(reader);
  box(0.16, 0.24, 0.05, mats.dark, 0, 0, 0, reader);
  const led = box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), 0, 0.07, 0.03, reader);
  box(0.1, 0.06, 0.02, mats.steel, 0, -0.05, 0.03, reader);
  hitBox(0.4, 0.5, 0.3, 0, 0, 0.1, reader);
  interactive(reader, 'cell_reader', 'Lecteur de badge de la tour', 'keypad', { focusDist: 1.2, led });
  hitBox(1.9, 2.0, 0.2, 0.94, 1.0, 0, pv);
  interactive(pv, 'cell_tower_door', 'Porte de la tour de garde', 'door', { focusDist: 2 });
  return { pv, col, led };
})();
/* pupitre de commande des grilles + registre de garde */
const cellPanel = (() => {
  const g = new THREE.Group();
  g.position.set(0, TOWER_Y, -244.35);
  scene.add(g);
  box(4.4, 1.0, 0.9, mats.dark, 0, 0.5, 0, g);
  box(4.5, 0.06, 1.0, mats.steel, 0, 1.03, 0.02, g);
  box(4.4, 0.9, 0.08, mats.dark, 0, 1.5, -0.42, g);
  const sc = makeScreen(1.4, 0.6, '#7fe9ff');
  sc.draw(['GRILLES', '> COMMANDE', '  MANUELLE'], '#7fe9ff');
  sc.mesh.position.set(-1.4, 1.55, -0.37);
  g.add(sc.mesh);
  ['O1', 'O2', 'O3', 'O4', 'E1', 'E2', 'E3', 'E4'].forEach((id, i) => {
    const row = id[0] === 'O' ? 0 : 1,
      col = i % 4;
    const sw = new THREE.Group();
    sw.position.set(0.15 + col * 0.42, 1.07, -0.2 + row * 0.35);
    g.add(sw);
    box(0.24, 0.04, 0.24, mats.dark, 0, 0, 0, sw);
    const arm = box(0.04, 0.14, 0.04, mats.steel, 0, 0.07, 0, sw);
    arm.rotation.x = 0.5;
    const led = box(0.05, 0.02, 0.05, glow(id === 'O1' ? 0x30ff70 : 0xff2a1a, 2.5), 0.09, 0.03, -0.08, sw);
    plane(0.22, 0.1, sign([id], '#e8e2c8', '#15171a'), 0, 0.025, 0.1, sw, 0, -Math.PI / 2);
    hitBox(0.36, 0.25, 0.3, 0, 0.08, 0, sw);
    interactive(sw, 'cell_sw_' + id, 'Ouvrir la grille ' + id, 'lever', { focusDist: 1.2, arm, led, cell: id });
  });
  const log = plane(0.36, 0.48, paperTex2(['REGISTRE DE GARDE', 'E3 — VASSEUR R.', 'vol clé du bloc ?', 'fouille : rien.', 'tapote une brique', 'du mur du fond']), -1.5, 1.065, 0.05, g, 0, -Math.PI / 2);
  log.rotation.z = 0.15;
  interactive(log, 'cell_log', 'Lire le registre de garde', 'inspect', { focusDist: 0.9 });
  box(0.5, 0.06, 0.5, mats.cloth, 0.2, 0.5, 1.0, g); // chaise
  box(0.5, 0.55, 0.06, mats.cloth, 0.2, 0.8, 1.25, g);
  EXTRA_COLLIDERS.push([-2.2, 2.2, -244.85, -243.85]);
  return g;
})();

/* ── cellule O1 : le gardien, mort, son badge à la ceinture ── */
{
  const g = new THREE.Group();
  g.position.set(-11.6, 0, -231);
  g.rotation.y = 0.4;
  scene.add(g);
  const uni = new THREE.MeshStandardMaterial({ color: 0x2c3340, roughness: 0.9 });
  box(0.55, 0.22, 0.9, uni, 0, 0.12, 0, g);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshStandardMaterial({ color: 0x6d6a5a }));
  head.position.set(0, 0.13, 0.62);
  g.add(head);
  [-0.14, 0.14].forEach((x) => box(0.17, 0.16, 0.85, uni, x, 0.08, -0.85, g));
  decal(bloodDecal(5), 2.2, 2.2, -11.6, 0.016, -231, scene, 0, -Math.PI / 2);
  pushC(-11.6, -231, 0.45, 0.7);
}
const guardBadge = (() => {
  const g = new THREE.Group();
  g.position.set(-11.2, 0.26, -230.6);
  g.rotation.y = 0.4;
  scene.add(g);
  box(0.1, 0.008, 0.14, new THREE.MeshStandardMaterial({ color: 0xe8e2c8 }), 0, 0, 0, g);
  box(0.04, 0.009, 0.04, glow(0x3a7cff, 1.2), 0, 0.001, 0.03, g);
  hitBox(0.35, 0.15, 0.35, 0, 0, 0, g);
  return interactive(g, 'cell_badge', 'Prendre le badge du gardien', 'pickup', { focusDist: 0.7 });
})();

/* ── cellule E3 : brique descellée au mur du fond ── */
const brick = (() => {
  const g = new THREE.Group();
  g.position.set(14.84, 0.5, -248.4);
  scene.add(g);
  box(0.12, 0.2, 0.42, new THREE.MeshStandardMaterial({ color: 0x6b5a4a, roughness: 1 }), 0, 0, 0, g);
  hitBox(0.3, 0.35, 0.6, -0.1, 0, 0, g);
  interactive(g, 'cell_brick', 'Examiner la brique du mur', 'inspect', { focusDist: 1.1 });
  return g;
})();
const blockKey = keyItem(14.5, 0.47, -248.4, 'cell_block_key', 'Prendre la clé du bloc', Math.PI / 2);
blockKey.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.01), glow(0xffb020, 1.4)));
hideObj(blockKey);

/* ── note de l’entrée ── */
paperNote(['Poste central :', 'badge gardien requis.', 'Lucas ne répond plus.', 'Il faisait sa ronde', 'en O1…'], -3, 1.6, -222.2, Math.PI, 'cell_note');

/* ── actions ── */
Actions.register('cell_note', async (o) => {
  SND.play('paper');
  await focusOn(o);
  State.cellNoteRead = true;
  say('« Poste central : badge gardien requis. Lucas ne répond plus. Il faisait sa ronde en O1… »', 7000);
});
Actions.register('cell_badge', (o) => {
  State.guardBadge = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  say('Le badge du gardien Lucas, taché de sang. « ACCÈS : POSTE CENTRAL ».', 4500);
  setObjective(objectiveNow());
});
const towerOpenFn = () => {
  if (State.towerOpen) return say('La porte de la tour est ouverte.', 2500);
  if (!State.guardBadge) {
    SND.play('locked');
    return say('Lecteur de badge : « ACCÈS GARDIENS UNIQUEMENT ».', 3500);
  }
  State.towerOpen = true;
  renderInv();
  towerDoor.led.material = glow(0x30ff70, 3);
  SND.play('success');
  gameTimeout(() => SND.play('door'), 300);
  tween(1, (k) => (towerDoor.pv.rotation.y = 1.4 * k));
  const i = EXTRA_COLLIDERS.indexOf(towerDoor.col);
  if (i >= 0) EXTRA_COLLIDERS.splice(i, 1);
  say('Bip. La porte de la tour de garde se déverrouille.', 4000);
  setObjective(objectiveNow());
};
Actions.register('cell_reader', towerOpenFn);
Actions.register('cell_tower_door', towerOpenFn);
Actions.register('cell_log', async (o) => {
  SND.play('paper');
  await focusOn(o);
  State.cellLog = true;
  say('Registre de garde : « E3 — VASSEUR R. Soupçonné du vol de la clé du bloc. Fouille : rien. Il passe ses journées à tapoter une brique du mur du fond. »', 9000);
  setObjective(objectiveNow());
});
const CELL_FLAVOR = {
  O2: 'La grille O2 s’ouvre sur une cellule vide. Des marques de griffes sur le sol.',
  O3: 'La grille O3 s’ouvre. Un matelas éventré, rien d’autre.',
  O4: 'La grille O4 s’ouvre. Des dessins d’enfants au mur, et beaucoup trop de traits pour compter les jours.',
  E1: 'La grille E1 s’ouvre. Une odeur atroce s’en échappe… mais elle est vide.',
  E2: 'La grille E2 s’ouvre. Des boîtes de conserve vides, empilées en pyramide.',
  E3: 'La grille E3 s’ouvre : la cellule de VASSEUR.',
  E4: 'La grille E4 s’ouvre. Quelqu’un a gratté « ILS ARRIVENT » sur le mur.'
};
CELLS10.forEach((c) =>
  Actions.register('cell_sw_' + c.id, (o) => {
    if (c.open) return say('La grille ' + c.id + ' est déjà ouverte.', 2500);
    SND.play('lever');
    tween(0.25, (k) => (o.userData.arm.rotation.x = 0.5 - k));
    o.userData.led.material = glow(0x30ff70, 2.5);
    openCell(c.id);
    say(CELL_FLAVOR[c.id], 4500);
    setObjective(objectiveNow());
  })
);
Actions.register('cell_brick', (o) => {
  if (State.brickOut) return say('Le trou derrière la brique est vide.', 2500);
  State.brickOut = true;
  SND.play('clank');
  tween(0.6, (k) => {
    o.position.x = 14.84 - 0.5 * k;
    o.position.y = 0.5 - 0.4 * k;
  });
  gameTimeout(() => {
    o.position.set(14.2, 0.1, -247.6);
    showObj(blockKey);
  }, 650);
  say('La brique bouge sous vos doigts… elle se descelle. Dans le trou : une clé, enveloppée dans un chiffon.', 5500);
  setObjective(objectiveNow());
});
Actions.register('cell_block_key', (o) => {
  State.key4 = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  unlockDoor(doorBlock, TEXTS.hints.door_block_unlocked);
  say(TEXTS.msg.bunkOk.replace(/.*:/, 'Vous prenez la clé du bloc cellulaire :').replace(/ :.*/, '.'), 4000);
  setObjective(objectiveNow());
});

ROOM_OBJ[10] = () =>
  State.key4
    ? TEXTS.objectives.exitBlock
    : State.towerOpen
      ? 'Depuis la tour, trouvez la cellule du voleur et fouillez-la.'
      : 'Bloc cellulaire : entrez dans la tour de garde centrale. Il faut le badge d’un gardien.';
ROOM_GOALS[10] = () => [
  ['Trouver le badge du gardien', State.guardBadge],
  ['Ouvrir la tour de garde (lecteur de badge)', State.towerOpen],
  ['Lire le registre de garde', State.cellLog],
  ['Ouvrir la bonne cellule depuis le pupitre', !!State.cellOpen.E3],
  ['Fouiller la cellule et prendre la clé du bloc', State.key4]
];
ROOM_INV.push(() => State.guardBadge && !State.towerOpen && 'Badge du gardien');
ROOM_DEV[10] = () => {
  Object.assign(State, { guardBadge: true, cellLog: true, brickOut: true, key4: true });
  hideObj(guardBadge);
  if (!State.towerOpen) towerOpenFn();
  openCell('E3');
  hideObj(blockKey);
  unlockDoor(doorBlock, TEXTS.hints.door_block_unlocked);
};

/* ── décor : bancs du couloir, chariot de repas, taches ── */
[[-6.5, -226.5], [6.5, -226.5]].forEach(([x, z]) => {
  box(1.8, 0.08, 0.45, mats.wood, x, 0.45, z);
  [-0.8, 0.8].forEach((dx) => box(0.06, 0.45, 0.4, mats.dark, x + dx, 0.22, z));
  pushC(x, z, 1, 0.3);
});
{
  const g = new THREE.Group(); // chariot de repas renversé
  g.position.set(-6.5, 0, -250);
  g.rotation.set(0, 0.5, 1.45);
  scene.add(g);
  box(1.2, 0.08, 0.6, mats.steel, 0, 0.5, 0, g);
  box(1.2, 0.08, 0.6, mats.steel, 0, 0.9, 0, g);
  pushC(-6.5, -250, 0.6, 0.6);
}
decal(bloodDecal(4), 3, 3, 5, 0.015, -236, scene, 0, -Math.PI / 2);
decal(bloodDecal(3), 2.4, 2.4, -5, 0.015, -253, scene, 0, -Math.PI / 2);
beacon(-14, 4.5, -223.5, () => !State.key4);
beacon(14, 4.5, -260.5, () => !State.key4);

/* utilisés par la salle 11 (complexe) */
let doorCtrl = null;
function openInner(o) {
  const u = o.userData;
  u.opened = true;
  SND.play('door');
  openDoorAnim(o, 1.2);
  const i = EXTRA_COLLIDERS.indexOf(u.col);
  if (i >= 0) EXTRA_COLLIDERS.splice(i, 1);
}
