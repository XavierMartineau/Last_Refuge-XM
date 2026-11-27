/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 9 : aire d’évacuation (50 × 50 × 9 m).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers.
   Énigme : le tableau de départ donne l’ordre du convoi (BRAVO → CHARLIE → ALPHA) ; chaque jeep porte
   son numéro de convoi peint sur le capot. Les trois numéros, dans l’ordre de départ, ouvrent l’armoire
   à clés (mur est) qui contient la clé du convoi. */
'use strict';
shell(-197, { south: false, w: 50, d: 50, h: 9 });
wallWithDoor(-222, 50, 9);
const doorExit2 = makeDoor('door_exit2', 0, -221.85, 'Examiner la grande porte');
CONFIG.convoyCode = CONFIG.convoyCode || '734';
State.keyCabinet = false;
[-16, -6, 6, 16].forEach((x) => [-178, -190, -202, -214].forEach((z) => addNeon(9, x, z, 4, 8.6)));
{
  const L = new THREE.PointLight(0xffc070, 0, 16, 2); // projecteur ambré du poste de contrôle
  L.position.set(0, 4, -214);
  scene.add(L);
  neon.lights.push({ l: L, room: 9, base: 35 });
}

/* marquages au sol : couloirs de stationnement + allée centrale */
{
  const yellow = new THREE.MeshStandardMaterial({ color: 0xb48a22, roughness: 0.8 });
  [-20, -8, 8, 20].forEach((x) => noRay(plane(0.2, 44, yellow, x, 0.012, -197, scene, 0, -Math.PI / 2)));
  [-180, -192, -204].forEach((z) => {
    noRay(plane(12, 0.2, yellow, -14, 0.012, z, scene, 0, -Math.PI / 2));
    noRay(plane(12, 0.2, yellow, 14, 0.012, z, scene, 0, -Math.PI / 2));
  });
  for (let z = -176; z > -220; z -= 4) noRay(plane(0.25, 2, yellow, 0, 0.012, z, scene, 0, -Math.PI / 2));
}

/* numéros peints sur les capots */
const hoodNumber = (d) => {
  const sf = new Surface(256, true).base('', 0.6, 0.5);
  sf.write(d, 128, 140, 'bold 200px Arial', 'rgba(235,232,220,.95)');
  return decalMat(sf);
};
const VEHICLES = [
  { id: 'A', name: 'ALPHA', x: -14, z: -186, ry: 0, n: CONFIG.convoyCode[2] },
  { id: 'B', name: 'BRAVO', x: 14, z: -198, ry: 0.25, n: CONFIG.convoyCode[0] },
  { id: 'C', name: 'CHARLIE', x: -14, z: -210, ry: -0.2, n: CONFIG.convoyCode[1] }
];
VEHICLES.forEach((v) => {
  const g = makeJeep(v.x, v.z, v.ry);
  noRay(plane(0.9, 0.9, hoodNumber(v.n), 0, 1.012, 1.4, g, 0, -Math.PI / 2));
  [-1, 1].forEach((s) => plane(1.4, 0.45, sign([v.name], '#3a4a30', '#e8e2c8'), s * 1.02, 0.78, 0.9, g, (s * Math.PI) / 2));
  interactive(g, 'veh_' + v.id, 'Examiner la jeep ' + v.name, 'inspect', { focusDist: 4.2 });
  Actions.register('veh_' + v.id, async (o) => {
    SND.play('click');
    await focusOn(o);
    State['veh' + v.id] = true;
    say('Jeep ' + v.name + ' : le numéro de convoi « ' + v.n + ' » est peint en blanc sur le capot.', 5500);
    setObjective(objectiveNow());
  });
});

/* camion-citerne (décor) */
{
  const g = new THREE.Group();
  g.position.set(15, 0, -181);
  scene.add(g);
  box(3, 0.5, 8, mats.dark, 0, 0.9, 0, g);
  box(2.8, 2.2, 2.4, mats.lockerA, 0, 2.2, 2.6, g);
  const tank = cyl(1.3, 5, mats.steel, 0, 2.5, -1.2, g, 24);
  tank.rotation.x = Math.PI / 2;
  plane(2.4, 0.6, sign(['INFLAMMABLE'], '#b83a22', '#f2e8d0'), 1.32, 2.5, -1.2, g, Math.PI / 2);
  [-3.2, -1.2, 2.9].forEach((z) =>
    [-1.5, 1.5].forEach((x) => {
      const w = cyl(0.55, 0.45, mats.rubber, x, 0.55, z, g, 18);
      w.rotation.z = Math.PI / 2;
    })
  );
  pushC(15, -181, 1.8, 4.3);
}

/* tableau de départ (mur ouest) */
{
  const g = new THREE.Group();
  g.position.set(-24.82, 2.1, -180);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  box(3.2, 1.9, 0.08, mats.dark, 0, 0, -0.04, g);
  const sf = new Surface(512).base('#1d221c', 0.85, 0.5).grain(16);
  sf.write('CONVOI D’ÉVACUATION', 256, 70, 'bold 44px Arial', 'rgba(230,220,180,.9)');
  sf.write('ORDRE DE DÉPART', 256, 140, 'bold 36px Courier New', 'rgba(255,200,90,.95)');
  sf.write('1 · BRAVO', 256, 230, 'bold 52px Courier New', 'rgba(230,230,220,.95)');
  sf.write('2 · CHARLIE', 256, 310, 'bold 52px Courier New', 'rgba(230,230,220,.95)');
  sf.write('3 · ALPHA', 256, 390, 'bold 52px Courier New', 'rgba(230,230,220,.95)');
  sf.write('clés : armoire · code = n° de convoi', 256, 470, '28px Georgia', 'rgba(200,60,50,.9)');
  plane(3, 1.75, pbr(sf, { bump: 0.4 }), 0, 0, 0.01, g);
  hitBox(3.2, 1.9, 0.3, 0, 0, 0.1, g);
  interactive(g, 'convoy_board', 'Lire le tableau de départ', 'inspect', { focusDist: 2.6 });
  Actions.register('convoy_board', async (o) => {
    SND.play('paper');
    await focusOn(o);
    State.boardRead = true;
    say('Ordre de départ : 1) BRAVO, 2) CHARLIE, 3) ALPHA. Griffonné dessous : « Clés dans l’armoire — le code, ce sont les numéros de convoi, dans l’ordre de départ. »', 9000);
    setObjective(objectiveNow());
  });
}

/* armoire à clés (mur est, près de la sortie) */
{
  const g = new THREE.Group();
  g.position.set(24.72, 1.5, -213);
  g.rotation.y = -Math.PI / 2;
  scene.add(g);
  box(1.1, 1.3, 0.3, mats.lockerA, 0, 0, -0.15, g);
  plane(1.0, 1.2, new THREE.MeshBasicMaterial({ color: 0x050605 }), 0, 0, 0.005, g);
  for (let i = 0; i < 6; i++) box(0.03, 0.03, 0.08, mats.steel, -0.35 + i * 0.14, 0.35, 0.02, g); // crochets vides
  const pv = new THREE.Group();
  pv.position.set(-0.55, 0, 0.02);
  g.add(pv);
  box(1.08, 1.28, 0.04, mats.lockerB, 0.54, 0, 0, pv);
  box(0.6, 0.35, 0.02, glow(0x9fe8ff, 0.2), 0.54, 0.25, 0.025, pv);
  const pad = new THREE.Group();
  pad.position.set(0.85, -0.25, 0.04);
  pv.add(pad);
  box(0.2, 0.26, 0.03, mats.dark, 0, 0, 0, pad);
  const led = box(0.04, 0.04, 0.02, glow(0xff2a1a, 3), 0, 0.09, 0.02, pad);
  for (let i = 0; i < 9; i++) box(0.035, 0.03, 0.015, mats.steel, -0.05 + (i % 3) * 0.05, 0.02 - Math.floor(i / 3) * 0.045, 0.02, pad);
  plane(0.9, 0.3, sign(['CLÉS'], '#b48a22', '#15171a'), 0, 0.82, 0.0, g);
  const hb = hitBox(1.15, 1.35, 0.3, 0, 0, 0.12, g);
  interactive(g, 'key_cabinet', 'Utiliser le digicode de l’armoire à clés', 'keypad', { focusDist: 1.4, led, pv, hb });
  // clé du convoi, accrochée dans l’armoire (inaccessible tant que la porte est fermée)
  const k = new THREE.Group();
  k.position.set(0.07, 0.25, -0.05);
  g.add(k);
  const t = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 16), mats.steel);
  k.add(t);
  box(0.012, 0.16, 0.012, mats.steel, 0, -0.13, 0, k);
  box(0.1, 0.06, 0.01, glow(0xffb020, 1.4), 0, -0.04, 0.02, k);
  hitBox(0.3, 0.35, 0.2, 0, -0.08, 0.05, k);
  interactive(k, 'key_02', 'Prendre la clé du convoi', 'pickup', { focusDist: 0.8 });
  pushC(24.5, -213, 0.4, 0.7);
  Actions.register('key_cabinet', async (o) => {
    const u = o.userData;
    if (State.keyCabinet) return say(State.key2 ? 'L’armoire est vide.' : 'L’armoire est ouverte : la clé du convoi est accrochée à l’intérieur.', 3000);
    await focusOn(o);
    if (await askCode('ARMOIRE À CLÉS', 3, CONFIG.convoyCode, { note: ['INDICE', 'Tableau de départ + numéros des capots'] })) {
      State.keyCabinet = true;
      u.led.material = glow(0x30ff70, 3);
      u.hb.raycast = () => {};
      SND.play('unlock');
      tween(0.9, (k2) => { u.pv.rotation.y = -1.9 * k2; });
      say('Bip. L’armoire s’ouvre : une seule clé reste accrochée, celle du convoi.', 5000);
      setObjective(objectiveNow());
    } else say('Code refusé. L’ordre de départ compte.', 3500);
    release();
  });
}

/* poste de contrôle en sacs de sable devant la sortie + barrière levante */
PROPS.sand(-7, -217.5);
PROPS.sand(7, -217.5);
{
  const g = new THREE.Group();
  g.position.set(-4.6, 0, -215.2);
  scene.add(g);
  box(0.4, 1.1, 0.4, mats.dark, 0, 0.55, 0, g);
  const arm = new THREE.Group();
  arm.position.set(0, 1.05, 0);
  arm.rotation.z = 1.2; // barrière levée
  g.add(arm);
  const red = new THREE.MeshStandardMaterial({ color: 0xa82418, roughness: 0.6 });
  for (let i = 0; i < 6; i++) box(0.6, 0.1, 0.1, i % 2 ? mats.steel : red, 0.3 + i * 0.6, 0, 0, arm);
  pushC(-4.6, -215.2, 0.3, 0.3);
}
/* civière, établi, pompe à carburant, caisses : le convoi n’est jamais parti */
PROPS.stretcher(-21, -197);
PROPS.workbench(21.5, -191);
PROPS.crates(-21.5, -214);
PROPS.tarp(-6, -176.5);
PROPS.drum(21.8, -205.5);
PROPS.drum(21.8, -206.5);
{
  const g = new THREE.Group(); // pompe à carburant
  g.position.set(20.5, 0, -200);
  scene.add(g);
  box(0.8, 1.6, 0.6, mats.door, 0, 0.8, 0, g);
  box(0.5, 0.3, 0.05, glow(0xffb347, 0.6), 0, 1.25, 0.31, g);
  cable(V3(20.9, 1.2, -200), V3(21.6, 0.3, -199), 0.2, 0.03);
  pushC(20.5, -200, 0.5, 0.4);
}
wallDec(-24.8, 2, -192, Math.PI / 2, 5);
decal(bloodDecal(5), 5, 5, 3, 0.015, -200, scene, 0, -Math.PI / 2);
decal(bloodDecal(4), 4, 4, -8, 0.015, -181, scene, 0, -Math.PI / 2);
cable(V3(-24.6, 8.2, -174), V3(-24.6, 7.8, -220), 1.3, 0.035);
beacon(-24, 7, -178, () => !State.key2);
beacon(24, 7, -216, () => !State.key2);
