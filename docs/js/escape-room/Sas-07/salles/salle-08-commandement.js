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


/* ── Pièce 8 : salle de commandement (50 × 40 × 10 m) ──
   Énigme : la table de situation donne l’ordre de redémarrage (BLEU → ROUGE → VERT) ; chaque relais
   porte un voyant de couleur. Un relais abaissé dans le mauvais ordre réarme toute la procédure.
   Les écrans muraux affichent en direct l’état des relais. */
shell(-152, { south: false, w: 50, d: 40, h: 10 });
wallWithDoor(-172, 50, 10);
const doorCmd = makeDoor('door_cmd', 0, -171.85, 'Examiner la porte du fond');
[-16, -6, 6, 16].forEach((x) => [-138, -148, -158, -167].forEach((z) => addNeon(8, x, z, 4, 9.6)));
{
  const L = new THREE.PointLight(0x7fd0ff, 0, 18, 2); // halo bleu du mur d’écrans
  L.position.set(0, 5, -167);
  scene.add(L);
  neon.lights.push({ l: L, room: 8, base: 40 });
}
const CMD = { order: [3, 1, 2], relays: {}, screens: [] };
const RELAY_INFO = {
  1: { name: 'OUEST', col: 'ROUGE', hex: 0xff3a2a },
  2: { name: 'EST', col: 'VERT', hex: 0x30ff60 },
  3: { name: 'NORD', col: 'BLEU', hex: 0x3a7cff }
};

/* mur d’écrans (nord) : état des relais en direct */
[-15, 0, 15].forEach((x) => {
  box(9.4, 4.6, 0.2, mats.dark, x, 6.3, -171.75);
  const sc = makeScreen(9, 4.2);
  sc.mesh.position.set(x, 6.3, -171.6);
  scene.add(sc.mesh);
  CMD.screens.push(sc);
});
CMD.draw = () => {
  const st = (n) => (CMD.relays[n] && CMD.relays[n].userData.done ? 'BAS' : 'HAUT');
  const ok = State.power8;
  const col = ok ? '#7fe9ff' : '#ff6a5a';
  CMD.screens[0].draw(['RELAIS OUEST', '> VOYANT ROUGE', '> POSITION : ' + st(1)], col);
  CMD.screens[1].draw(
    [
      'ALIMENTATION',
      ok ? '> EN LIGNE' : '> HORS LIGNE',
      '> PROCÉDURE : ' + (ok ? 'OK' : State.relays + ' / 3'),
      ok ? '> PORTE : OUVERTE' : '> PORTE : VERROUILLÉE'
    ],
    col
  );
  CMD.screens[2].draw(['RELAIS EST · NORD', '> EST (VERT) : ' + st(2), '> NORD (BLEU) : ' + st(3)], col);
};

/* table de situation (centre) : l’ordre de redémarrage */
{
  const g = new THREE.Group();
  g.position.set(0, 0, -146);
  scene.add(g);
  box(7, 0.12, 3.4, mats.dark, 0, 0.92, 0, g);
  box(6.2, 0.85, 2.6, mats.lockerA, 0, 0.43, 0, g);
  const sf = new Surface(512)
    .base('#16261c', 0.7, 0.5)
    .lines(64, 'rgba(120,220,160,.18)')
    .blob(120, 300, 70, '200,50,40', 0.35)
    .blob(390, 330, 80, '60,140,220', 0.3);
  sf.write('SECTEUR 7 · REDÉMARRAGE', 256, 60, 'bold 34px Courier New', 'rgba(200,240,210,.9)');
  sf.write('1 · RELAIS BLEU', 256, 170, 'bold 44px Courier New', 'rgba(110,170,255,.95)');
  sf.write('2 · RELAIS ROUGE', 256, 250, 'bold 44px Courier New', 'rgba(255,110,90,.95)');
  sf.write('3 · RELAIS VERT', 256, 330, 'bold 44px Courier New', 'rgba(110,255,150,.95)');
  sf.write('ERREUR = TOUT SE RÉARME', 256, 440, 'bold 30px Courier New', 'rgba(255,220,120,.85)');
  const mat = pbr(sf, { bump: 0.3 });
  mat.emissive.setHex(0xffffff);
  mat.emissiveMap = mat.map;
  mat.emissiveIntensity = 0.35;
  plane(6.6, 3.1, mat, 0, 0.985, 0, g, 0, -Math.PI / 2);
  hitBox(7, 0.4, 3.4, 0, 1, 0, g);
  interactive(g, 'cmd_table', 'Lire la table de situation', 'inspect', { focusDist: 3.2 });
  Actions.register('cmd_table', async (o) => {
    SND.play('paper');
    await focusOn(o);
    State.cmdRead = true;
    say('Procédure de redémarrage : relais BLEU, puis ROUGE, puis VERT. En dessous : « Une erreur et tout se réarme. »', 8000);
    setObjective(objectiveNow());
  });
  pushC(0, -146, 3.7, 1.9);
}

/* deux rangées de pupitres face au mur d’écrans, allée centrale libre */
[-156, -162].forEach((z) =>
  [-19.5, -15, -10.5, -6, 6, 10.5, 15, 19.5].forEach((x, i) => {
    desk(x, z, 2.6, 0);
    if (i % 3 === 1) return; // chaises (quelques-unes manquent)
    box(0.5, 0.06, 0.5, mats.cloth, x, 0.5, z + 0.95);
    box(0.5, 0.55, 0.06, mats.cloth, x, 0.8, z + 1.2);
    cyl(0.04, 0.45, mats.steel, x, 0.24, z + 0.95, scene, 8);
  })
);

/* bureau vitré du commandant (angle sud-est) */
{
  const x0 = 15, z0 = -132.15, z1 = -141;
  wallX(x0, 24.9, z1, 3.2, 20);
  const zc = (z0 + z1) / 2, len = z0 - z1;
  box(0.14, 0.6, len, mats.dark, x0, 0.3, zc); // allège
  box(0.14, 0.3, len, mats.dark, x0, 3.05, zc); // linteau
  [z0 - 0.05, zc, z1 + 0.05].forEach((z) => box(0.14, 3.2, 0.12, mats.dark, x0, 1.6, z)); // montants
  plane(len, 2.3, mats.glass, x0, 1.75, zc, scene, -Math.PI / 2).castShadow = false;
  EXTRA_COLLIDERS.push([x0 - 0.15, x0 + 0.15, z1, z0]);
  box(2.6, 0.08, 1.2, mats.wood, 21, 0.8, -137.5);
  [-1.1, 1.1].forEach((dx) => box(0.08, 0.8, 1, mats.dark, 21 + dx, 0.4, -137.5));
  pushC(21, -137.5, 1.4, 0.7);
  plane(0.9, 1.2, sign(['CDT', 'VAUTRIN'], '#2b2e2a', '#e8e2c8'), 24.85, 1.9, -137.5, scene, -Math.PI / 2);
  const n = plane(
    0.3,
    0.4,
    paperTex2(['Si le courant saute,', 'suivre la procédure', 'de la table.', 'Pas d’improvisation.', '— Cdt Vautrin']),
    21,
    0.845,
    -137.4,
    scene,
    0,
    -Math.PI / 2
  );
  interactive(n, 'note_cmd', 'Lire la note du commandant', 'inspect', { focusDist: 0.8 });
  Actions.register('note_cmd', async (o) => {
    SND.play('paper');
    await focusOn(o);
    say('« Si le courant saute : suivez la procédure inscrite sur la table de situation. Pas d’improvisation. — Cdt Vautrin »', 7000);
  });
}

/* trois relais (ouest, est, nord) avec voyant de couleur */
function makeRelay(i, x, y, z, ry) {
  const info = RELAY_INFO[i];
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  scene.add(g);
  box(0.8, 1.1, 0.16, mats.dark, 0, 0, 0, g);
  box(0.7, 1.0, 0.02, mats.steel, 0, 0, 0.09, g);
  const frame = glow(info.hex, 1.2);
  [0.58, -0.58].forEach((fy) => box(0.84, 0.05, 0.05, frame, 0, fy, 0.1, g));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), glow(info.hex, 3));
  lamp.position.set(0, 0.9, 0.05);
  g.add(lamp);
  box(0.3, 0.06, 0.18, mats.dark, 0, 0.78, 0.05, g);
  const arm = new THREE.Group();
  arm.position.set(0, 0.05, 0.12);
  arm.rotation.x = 0.7;
  g.add(arm);
  cyl(0.02, 0.45, mats.steel, 0, 0.22, 0, arm, 8);
  const kn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mats.rubber);
  kn.position.set(0, 0.46, 0);
  arm.add(kn);
  const led = box(0.1, 0.05, 0.02, glow(0xff2a1a, 3), 0, -0.4, 0.1, g);
  plane(0.7, 0.3, sign([info.name]), 0, -0.85, 0.09, g);
  hitBox(0.9, 1.3, 0.4, 0, 0, 0.1, g);
  interactive(g, 'relay_' + i, 'Abaisser le relais ' + info.col.toLowerCase(), 'lever', {
    arm,
    led,
    idx: i - 1,
    focusDist: 1.6
  });
  CMD.relays[i] = g;
  return g;
}
makeRelay(1, -24.8, 1.5, -145, Math.PI / 2);
makeRelay(2, 24.8, 1.5, -160, -Math.PI / 2);
makeRelay(3, -8, 1.5, -171.65, 0);
CMD.reset = () => {
  Object.values(CMD.relays).forEach((g) => {
    const u = g.userData,
      a = u.arm,
      f = a.rotation.x;
    u.done = false;
    u.led.material = glow(0xff2a1a, 3);
    tween(0.35, (k) => {
      a.rotation.x = f + (0.7 - f) * k;
    });
  });
  State.relays = 0;
  CMD.draw();
};
CMD.draw();

/* baies serveurs le long des murs */
[-150, -151, -152, -153].forEach((z) => rack(-24, z, Math.PI / 2));
[-145, -146, -147, -148].forEach((z) => rack(24, z, -Math.PI / 2));
[-14.4, -12, 12, 14.4].forEach((x) => rack(x, -170.9, 0));
/* décor : caisses de munitions vides, sacs, sang */
PROPS.crates(-21, -135.5);
PROPS.sand(-11, -134.8);
PROPS.tarp(-21.5, -166);
PROPS.drum(10, -134.8);
[
  [-10, -140],
  [12, -151],
  [-15, -168],
  [-3, -158]
].forEach(([x, z], i) => decal(bloodDecal(3 + (i % 3)), 3, 3, x, 0.015, z, scene, 0, -Math.PI / 2));
wallDec(-24.85, 2.2, -160, Math.PI / 2, 5);
wallDec(24.85, 2.6, -152, -Math.PI / 2, 4);
cable(V3(-24.6, 9, -134), V3(-24.6, 8.5, -170), 1.2, 0.035);
cable(V3(-15, 9.2, -171.5), V3(15, 9.2, -171.5), 0.6, 0.03);
beacon(-24, 8, -138, () => !State.power8);
beacon(24, 8, -168, () => !State.power8);
