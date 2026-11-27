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


/* ── Pièce 8 : salle de commandement (50 × 40 × 10 m) — poste de commandement à double clé ──
   Énigme : écouter la radio de la cabine (chiffres en boucle) → ouvrir le coffre du commandant (mur est)
   → prendre la clé du commandant ; récupérer la clé de l’officier sur son corps (cabine radio) →
   insérer chaque clé dans sa console (ouest / est, 28 m d’écart) → les tourner toutes les deux en
   moins de 20 secondes : il faut courir de l’une à l’autre. */
shell(-152, { south: false, w: 50, d: 40, h: 10 });
wallWithDoor(-172, 50, 10);
const doorCmd = makeDoor('door_cmd', 0, -171.85, 'Examiner la porte du fond');
CONFIG.cmdCode = CONFIG.cmdCode || '3915';
Object.assign(State, { cdtKey: false, offKey: false, cmdIn: {}, cmdTurn: {}, cmdTimer: 0, radioHeard: false, cmdSafe: false });
[-14, 0, 14].forEach((x) => [-140, -154, -166].forEach((z) => addNeon(8, x, z, 4, 9.6)));
/* architecture : deux ailes surélevées (postes de tir) desservies par des escaliers, allée centrale
   au niveau du sol jusqu’à la porte, balustrade courbe autour de la table de situation */
const WING_Y = 0.8;
platform(-24.9, -4, -171.85, -155, WING_Y, { open: [['s', -16, -12]], skip: ['n', 'w'] });
platform(4, 24.9, -171.85, -155, WING_Y, { open: [['s', 12, 16]], skip: ['n', 'e'] });
stairs(-16, -12, -155, -152.6, 0, WING_Y, '-z');
stairs(12, 16, -155, -152.6, 0, WING_Y, '-z');
curveWall(0, -148, 4.6, Math.PI * 1.08, Math.PI * 1.92, 1.1, { mat: mats.dark, thick: 0.15 });
{
  const L = new THREE.PointLight(0xff3020, 0, 20, 2); // gyrophare rouge du poste de tir
  L.position.set(0, 7, -160);
  scene.add(L);
  neon.lights.push({ l: L, room: 8, base: 25 });
}
const CMD_WINDOW = 20; // ≈ 42 m entre les consoles (escaliers compris) : faisable en courant

/* ── mur d’écrans (nord) ── */
const cmdScreens = [-15, 0, 15].map((x) => {
  box(9.4, 4.6, 0.2, mats.dark, x, 6.3, -171.75);
  const sc = makeScreen(9, 4.2);
  sc.mesh.position.set(x, 6.3, -171.6);
  scene.add(sc.mesh);
  return sc;
});
function cmdDraw() {
  const ok = State.power8,
    col = ok ? '#7fe9ff' : State.cmdTimer > 0 ? '#ffd070' : '#ff6a5a';
  const st = (s, who) => (State.cmdTurn[s] ? 'TOURNÉE' : State.cmdIn[s] ? 'INSÉRÉE' : 'ABSENTE') + ' (' + who + ')';
  cmdScreens[0].draw(['CONSOLE OUEST', '> CLÉ ' + st('W', 'CDT')], col);
  cmdScreens[1].draw(
    ok
      ? ['ALIMENTATION', '> PRINCIPALE : EN LIGNE', '> PORTE : DÉVERROUILLÉE']
      : State.cmdTimer > 0
        ? ['DOUBLE AUTORISATION', '> EN ATTENTE…', '> ' + State.cmdTimer + ' s']
        : ['DOUBLE AUTORISATION', '> 2 CLÉS REQUISES', '> TOURNER EN < ' + CMD_WINDOW + ' s'],
    col
  );
  cmdScreens[2].draw(['CONSOLE EST', '> CLÉ ' + st('E', 'OFF')], col);
}

/* ── table de situation ronde (centre) ── */
{
  const g = new THREE.Group();
  g.position.set(0, 0, -148);
  scene.add(g);
  cyl(3, 0.85, mats.dark, 0, 0.43, 0, g, 40);
  cyl(3.15, 0.08, mats.steel, 0, 0.9, 0, g, 40);
  const map = canvasMat(512, 512, (x) => {
    x.fillStyle = '#071510';
    x.fillRect(0, 0, 512, 512);
    x.strokeStyle = 'rgba(90,220,150,.35)';
    x.lineWidth = 2;
    for (let r = 60; r < 260; r += 60) {
      x.beginPath();
      x.arc(256, 256, r, 0, Math.PI * 2);
      x.stroke();
    }
    for (let a = 0; a < 12; a++) {
      x.beginPath();
      x.moveTo(256, 256);
      x.lineTo(256 + Math.cos(a / 1.91) * 250, 256 + Math.sin(a / 1.91) * 250);
      x.stroke();
    }
    x.fillStyle = 'rgba(255,70,50,.9)';
    [[180, 140], [330, 210], [300, 360], [150, 320], [380, 120]].forEach(([px, py]) => {
      x.beginPath();
      x.arc(px, py, 9, 0, Math.PI * 2);
      x.fill();
    });
    x.fillStyle = 'rgba(200,255,220,.9)';
    x.font = 'bold 30px monospace';
    x.textAlign = 'center';
    x.fillText('SECTEUR 7 — PERDU', 256, 470);
  }, 0.6);
  const top = new THREE.Mesh(new THREE.CircleGeometry(2.95, 40), map);
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.945;
  g.add(top);
  hitBox(6, 0.5, 6, 0, 0.9, 0, g);
  interactive(g, 'cmd_table', 'Examiner la table de situation', 'inspect', { focusDist: 4 });
  Actions.register('cmd_table', () => {
    SND.play('click');
    say('Des points rouges partout sur la carte du secteur. Une note épinglée : « Coupure générale. Redémarrage = double autorisation : commandant + officier de garde. »', 8000);
  });
  pushC(0, -148, 3.2, 3.2);
}

/* ── consoles à clé (ouest = commandant, est = officier) ── */
const consoles = {};
[['W', -14, 'CLÉ COMMANDANT', 'cdtKey'], ['E', 14, 'CLÉ OFFICIER', 'offKey']].forEach(([side, x, label, flag]) => {
  const g = new THREE.Group();
  g.position.set(x, WING_Y, -161);
  scene.add(g);
  box(3, 1.0, 1.1, mats.dark, 0, 0.5, 0, g);
  const top = box(3.1, 0.06, 1.2, mats.steel, 0, 1.03, 0.05, g);
  top.rotation.x = -0.2;
  box(3, 1.4, 0.15, mats.dark, 0, 1.7, -0.5, g);
  const sc = makeScreen(1.2, 0.7);
  sc.draw(['ARMEMENT', '> ' + side], '#ff6a5a');
  sc.mesh.position.set(-0.8, 1.75, -0.42);
  g.add(sc.mesh);
  for (let i = 0; i < 8; i++) {
    const m = glow(i % 3 ? 0x30ff70 : 0xffb347, 2);
    box(0.06, 0.06, 0.02, m, 0.4 + (i % 4) * 0.2, 1.9 - Math.floor(i / 4) * 0.2, -0.42, g);
    blinkers.push({ m, s: 2 + i * 0.6, p: i + x });
  }
  const lock = new THREE.Group(); // serrure + clé
  lock.position.set(0.7, 1.12, 0.1);
  lock.rotation.x = -0.2;
  g.add(lock);
  cyl(0.11, 0.08, mats.steel, 0, 0, 0, lock, 20);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.34), new THREE.MeshStandardMaterial({ color: 0xb02a1a, roughness: 0.5 }));
  cover.position.set(0, 0.17, -0.12);
  cover.rotation.x = -1.2;
  lock.add(cover);
  const key = new THREE.Group();
  key.position.y = 0.05;
  key.visible = false;
  lock.add(key);
  box(0.03, 0.14, 0.015, mats.steel, 0, 0.07, 0, key);
  box(0.12, 0.08, 0.02, glow(side === 'W' ? 0xffb020 : 0x9fe8ff, 1.4), 0, 0.18, 0, key);
  const led = box(0.12, 0.05, 0.02, glow(0xff2a1a, 3), -0.1, 1.15, 0.45, g);
  plane(1.4, 0.35, sign([label], '#b48a22', '#15171a'), 0, 0.72, 0.56, g);
  hitBox(3.1, 1.4, 1.3, 0, 0.8, 0.1, g);
  interactive(g, 'cmd_console_' + side, 'Console ' + (side === 'W' ? 'ouest' : 'est') + ' : ' + label.toLowerCase(), 'use', { focusDist: 2.4 });
  consoles[side] = { g, key, led, flag, label };
  pushC(x, -161, 1.6, 0.7);
});
function cmdReset() {
  State.cmdTurn = {};
  State.cmdTimer = 0;
  Object.values(consoles).forEach((c) => {
    c.led.material = glow(0xff2a1a, 3);
    tween(0.3, (k) => (c.key.rotation.y = (-Math.PI / 2) * (1 - k)));
  });
  cmdDraw();
}
function cmdTick(token) {
  if (State.power8 || State.cmdToken !== token) return;
  State.cmdTimer--;
  if (State.cmdTimer <= 0) {
    SND.play('error');
    say('Délai dépassé : la console se désarme. Il faut tourner les deux clés en moins de ' + CMD_WINDOW + ' secondes.', 5500);
    cmdReset();
    return;
  }
  SND.play('click');
  cmdDraw();
  gameTimeout(() => cmdTick(token), 1000);
}
['W', 'E'].forEach((side) =>
  Actions.register('cmd_console_' + side, () => {
    const c = consoles[side],
      other = side === 'W' ? 'E' : 'W';
    if (State.power8) return say('L’alimentation principale est rétablie.', 2500);
    if (!State.cmdIn[side]) {
      if (!State[c.flag]) {
        SND.play('locked');
        return say('Une serrure vide sous un cache rouge. Étiquette : « ' + c.label + ' ».', 4000);
      }
      State.cmdIn[side] = true;
      c.key.visible = true;
      SND.play('key');
      renderInv();
      cmdDraw();
      setObjective(objectiveNow());
      return say('Vous insérez la ' + c.label.toLowerCase() + '.' + (State.cmdIn[other] ? ' Les deux clés sont en place : tournez-les en moins de ' + CMD_WINDOW + ' secondes.' : ''), 5000);
    }
    if (!State.cmdIn[other]) return say('La clé est insérée, mais l’autre console est encore vide.', 3500);
    if (State.cmdTurn[side]) return say('Cette clé est déjà tournée. Vite, l’autre console !', 2500);
    State.cmdTurn[side] = true;
    SND.play('lever');
    c.led.material = glow(0x30ff70, 3);
    tween(0.3, (k) => (c.key.rotation.y = (-Math.PI / 2) * k));
    if (State.cmdTurn[other]) {
      State.power8 = true;
      State.cmdTimer = 0;
      gameTimeout(() => {
        SND.play('success');
        SND.play('genstart');
      }, 350);
      unlockDoor(doorCmd, TEXTS.hints.door_cmd_unlocked);
      cmdDraw();
      setObjective(objectiveNow());
      return say('Double autorisation acceptée. Un grondement : l’alimentation principale revient et la porte du fond se déverrouille.', 7000);
    }
    State.cmdTimer = CMD_WINDOW;
    State.cmdToken = (State.cmdToken || 0) + 1;
    const token = State.cmdToken;
    gameTimeout(() => cmdTick(token), 1000);
    cmdDraw();
    say('Clé tournée. Compte à rebours : ' + CMD_WINDOW + ' secondes pour tourner l’autre clé !', 4000);
  })
);

/* ── cabine radio (angle nord-ouest) : radio en boucle + officier mort ── */
wallX(-24.9, -15.5, -141, 3.2, -19);
innerDoor('cmd_radio_door', -19, -141, 'x', 'Ouvrir la porte des transmissions');
wallZ(-15.5, -141, -132.15, 3.2);
box(9.5, 0.15, 9, mats.dark, -20.2, 3.27, -136.6);
addNeon(8, -20.2, -136.6, 2.4, 3.1);
plane(1.8, 0.45, sign(['TRANSMISSIONS'], '#2b2e2a', '#e8e2c8'), -19, 2.9, -141.14, scene, Math.PI);
{
  const g = new THREE.Group();
  g.position.set(-22.8, 0, -137);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  box(2.4, 0.06, 0.9, mats.wood, 0, 0.8, 0, g);
  [-1.1, 1.1].forEach((dx) => box(0.08, 0.8, 0.8, mats.dark, dx, 0.4, 0, g));
  const radio = new THREE.Group();
  radio.position.set(-0.4, 0.83, -0.15);
  g.add(radio);
  box(0.9, 0.45, 0.4, mats.dark, 0, 0.23, 0, radio);
  box(0.5, 0.15, 0.02, glow(0xffb347, 1.2), -0.12, 0.32, 0.21, radio);
  [0.2, 0.33].forEach((x) => cyl(0.05, 0.04, mats.steel, x, 0.22, 0.21, radio, 12).rotation.x = Math.PI / 2);
  box(0.02, 0.6, 0.02, mats.steel, 0.38, 0.75, -0.1, radio);
  hitBox(1, 0.6, 0.5, 0, 0.25, 0, radio);
  interactive(radio, 'cmd_radio', 'Écouter la radio', 'inspect', { focusDist: 1.4 });
  pushC(-22.8, -137, 0.5, 1.2);
}
const officer = (() => {
  // l’officier, effondré contre le mur sud de la cabine ; sa clé pend à sa ceinture
  const g = new THREE.Group();
  g.position.set(-18, 0, -133);
  g.rotation.y = Math.PI;
  scene.add(g);
  const uni = new THREE.MeshStandardMaterial({ color: 0x3b4630, roughness: 0.9 });
  const skin = new THREE.MeshStandardMaterial({ color: 0x6d6a5a, roughness: 0.8 });
  box(0.5, 0.65, 0.3, uni, 0, 0.55, 0.05, g).rotation.x = -0.25;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), skin);
  head.position.set(0.05, 0.98, 0.0);
  g.add(head);
  [-0.13, 0.13].forEach((x) => box(0.16, 0.15, 0.8, uni, x, 0.1, 0.5, g));
  box(0.4, 0.08, 0.08, mats.dark, 0, 0.3, 0.2, g);
  decal(bloodDecal(4), 1.6, 1.6, -18, 0.015, -133.8, scene, 0, -Math.PI / 2);
  pushC(-18, -133.4, 0.45, 0.6);
  return g;
})();
const offKeyObj = keyItem(-18.1, 0.32, -133.75, 'cmd_off_key', 'Prendre la clé de l’officier');
offKeyObj.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.01), glow(0x9fe8ff, 1.4)));

/* ── coffre mural du commandant (mur est) ── */
const cdtSafe = (() => {
  const g = new THREE.Group();
  g.position.set(24.78, 1.4, -150);
  g.rotation.y = -Math.PI / 2;
  scene.add(g);
  box(0.9, 0.9, 0.4, mats.dark, 0, 0, -0.2, g);
  plane(0.78, 0.78, new THREE.MeshBasicMaterial({ color: 0x050605 }), 0, 0, 0.002, g);
  const pv = new THREE.Group();
  pv.position.set(-0.45, 0, 0.02);
  g.add(pv);
  box(0.9, 0.9, 0.06, mats.steel, 0.45, 0, 0, pv);
  const dial = cyl(0.12, 0.05, mats.dark, 0.45, 0.05, 0.05, pv, 24);
  dial.rotation.x = Math.PI / 2;
  box(0.2, 0.03, 0.03, mats.steel, 0.75, -0.12, 0.05, pv);
  const led = box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), 0.45, 0.3, 0.04, pv);
  plane(1.3, 0.5, sign(['CDT VAUTRIN'], '#2b2e2a', '#e8e2c8'), 0, 0.85, -0.01, g);
  const hb = hitBox(1, 1, 0.3, 0, 0, 0.12, g);
  interactive(g, 'cmd_safe', 'Ouvrir le coffre du commandant', 'keypad', { focusDist: 1.4, pv, led, hb });
  pushC(24.5, -150, 0.4, 0.6);
  return g;
})();
const cdtKeyObj = keyItem(24.62, 1.3, -150.1, 'cmd_cdt_key', 'Prendre la clé du commandant', Math.PI / 2);
cdtKeyObj.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.01), glow(0xffb020, 1.4)));
hideObj(cdtKeyObj);

Actions.register('cmd_radio', async (o) => {
  SND.play('radio');
  await focusOn(o);
  State.radioHeard = true;
  say('Grésillements, puis une voix monocorde, en boucle : « …ici Vautrin… mon coffre… trois… neuf… un… cinq… je répète… trois… neuf… un… cinq… »', 9000);
  setObjective(objectiveNow());
});
Actions.register('cmd_off_key', (o) => {
  State.offKey = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  say('Vous détachez la clé de la ceinture de l’officier. Étiquette : « OFFICIER DE GARDE ».', 5000);
  setObjective(objectiveNow());
});
Actions.register('cmd_safe', async (o) => {
  const u = o.userData;
  if (State.cmdSafe) return say('Le coffre est ouvert.', 2500);
  await focusOn(o);
  if (await askCode('COFFRE DU COMMANDANT', 4, CONFIG.cmdCode, { note: ['INDICE', 'La radio de la cabine répète un message'] })) {
    State.cmdSafe = true;
    u.led.material = glow(0x30ff70, 3);
    u.hb.raycast = () => {};
    SND.play('unlock');
    tween(0.9, (k) => (u.pv.rotation.y = -1.8 * k));
    showObj(cdtKeyObj);
    say('Le coffre s’ouvre : à l’intérieur, la clé du commandant.', 4500);
    setObjective(objectiveNow());
  } else say('Le coffre reste fermé.', 3000);
  release();
});
Actions.register('cmd_cdt_key', (o) => {
  State.cdtKey = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  say('La clé du commandant. Étiquette : « CONSOLE OUEST ».', 4500);
  setObjective(objectiveNow());
});

ROOM_OBJ[8] = () =>
  State.power8
    ? 'Alimentation rétablie. Ouvrez la porte du fond.'
    : State.cmdIn.W && State.cmdIn.E
      ? 'Tournez les deux clés (consoles ouest et est) en moins de ' + CMD_WINDOW + ' secondes.'
      : 'Double autorisation : trouvez la clé du commandant et celle de l’officier, puis insérez-les dans les consoles.';
ROOM_GOALS[8] = () => [
  ['Écouter la radio de la cabine des transmissions', State.radioHeard || State.cmdSafe],
  ['Ouvrir le coffre du commandant (mur est)', State.cmdSafe],
  ['Prendre la clé du commandant', State.cdtKey],
  ['Prendre la clé de l’officier (cabine des transmissions)', State.offKey],
  ['Insérer les deux clés dans les consoles', !!(State.cmdIn.W && State.cmdIn.E)],
  ['Tourner les deux clés en moins de ' + CMD_WINDOW + ' s', State.power8]
];
ROOM_INV.push(
  () => State.cdtKey && !State.cmdIn.W && 'Clé du commandant',
  () => State.offKey && !State.cmdIn.E && 'Clé de l’officier'
);
ROOM_DEV[8] = () => {
  Object.assign(State, { cdtKey: true, offKey: true, cmdSafe: true, radioHeard: true, power8: true, cmdIn: { W: true, E: true }, cmdTurn: { W: true, E: true } });
  hideObj(cdtKeyObj);
  hideObj(offKeyObj);
  Object.values(consoles).forEach((c) => {
    c.key.visible = true;
    c.key.rotation.y = -Math.PI / 2;
    c.led.material = glow(0x30ff70, 3);
  });
  unlockDoor(doorCmd, TEXTS.hints.door_cmd_unlocked);
  cmdDraw();
};
cmdDraw();

/* ── décor : postes d’opérateurs, baies, cartes murales ── */
[-144, -149.5].forEach((z) =>
  [-21, -16.5, -11, 11, 16.5].forEach((x, i) => {
    desk(x, z, 2.6, 0);
    if (i % 3 === 1) return;
    box(0.5, 0.06, 0.5, mats.cloth, x, 0.5, z + 0.95);
    box(0.5, 0.55, 0.06, mats.cloth, x, 0.8, z + 1.2);
    cyl(0.04, 0.45, mats.steel, x, 0.24, z + 0.95, scene, 8);
  })
);
[-166, -167, -168, -169].forEach((z) => {
  rack(-24, z, Math.PI / 2).position.y = WING_Y;
  rack(24, z, -Math.PI / 2).position.y = WING_Y;
});
[[-24.85, -158, Math.PI / 2, ['ZONE NORD', 'PERDUE']], [-24.85, -147, Math.PI / 2, ['BUNKER 07', 'PLAN']]].forEach(([x, z, ry, l]) =>
  plane(3, 2, sign(l, '#c9bc99', '#2a2418'), x, 2.6, z, scene, ry)
);
PROPS.crates(8, -134.8);
PROPS.sand(-8.5, -134.8);
PROPS.tarp(21, -136);
PROPS.drum(2.6, -169.5);
[[-10, -142], [12, -147], [0, -166], [-2, -158]].forEach(([x, z], i) =>
  decal(bloodDecal(3 + (i % 3)), 3, 3, x, 0.015, z, scene, 0, -Math.PI / 2)
);
wallDec(24.85, 2.6, -160, -Math.PI / 2, 4);
cable(V3(-24.6, 9, -134), V3(-24.6, 8.5, -170), 1.2, 0.035);
cable(V3(-14, 1.8, -161.6), V3(14, 1.8, -161.6), 0.9, 0.04);
cable(V3(-15, 9.2, -171.5), V3(15, 9.2, -171.5), 0.6, 0.03);
beacon(-24, 8, -150, () => !State.power8);
beacon(24, 8, -168, () => !State.power8);
