/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 7 : le silo (40 × 30 × 12 m).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers.
   Énigme : (0) rallumer l’éclairage (interrupteur général, quêtes annexes) → (1) lire les jauges des
   cuves A · B · C → (2) ouvrir le cadenas de la cabine du contremaître → (3) prendre la manivelle →
   (4) la fixer au treuil pour descendre la clé suspendue sous la passerelle → (5) prendre la clé. */
'use strict';
shell(-117, { south: false, w: 40, d: 30, h: 12 });
wallWithDoor(-132, 50, 12);
const doorEnd = makeDoor('door_end', 0, -131.85, 'Examiner la porte de sortie');
Object.assign(State, { crank: false, boothOpen: false, keyLowered: false });
const SILO = { x: 0, z: -118, r: 4.5 };

/* ── éclairage : néons du plafond + lueur ambrée d’accentuation sous la trémie ── */
[-14, -5, 5, 14].forEach((x) => [-106, -117, -128].forEach((z) => addNeon(7, x, z, 4, 11.6)));
{
  const L = new THREE.PointLight(0xffb060, 0, 14, 2);
  L.position.set(-6, 4, -118);
  scene.add(L);
  neon.lights.push({ l: L, room: 7, base: 30 });
}

/* ── le silo : cuve surélevée, trémie, pieds, cerclages, échelle ── */
{
  const S = SILO;
  cyl(S.r, 8, mats.steel, S.x, 7, S.z, scene, 40);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(S.r + 0.1, 1.4, 40), mats.dark);
  cap.position.set(S.x, 11.7, S.z);
  cap.castShadow = true;
  scene.add(cap);
  const hopper = new THREE.Mesh(new THREE.ConeGeometry(S.r, 2.4, 40, 1, true), mats.steel);
  hopper.rotation.x = Math.PI;
  hopper.position.set(S.x, 1.8, S.z);
  hopper.castShadow = true;
  scene.add(hopper);
  cyl(0.45, 0.7, mats.rustpipe, S.x, 0.35, S.z, scene, 16);
  [4, 7, 10].forEach((y) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(S.r + 0.06, 0.09, 6, 48), mats.dark);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(S.x, y, S.z);
    scene.add(ring);
  });
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) =>
    box(0.35, 3.2, 0.35, mats.dark, S.x + a * 3.1, 1.6, S.z + b * 3.1)
  );
  // échelle d’inspection (face est)
  [-0.3, 0.3].forEach((dz) => box(0.06, 8.2, 0.06, mats.steel, S.x + S.r + 0.25, 7, S.z + dz));
  for (let y = 3.2; y < 11; y += 0.35) box(0.05, 0.04, 0.62, mats.steel, S.x + S.r + 0.25, y, S.z);
  plane(2.4, 1.1, sign(['SILO 7', 'GRAIN · 80 T'], '#b48a22', '#15171a'), S.x, 6.2, S.z + S.r + 0.03, scene);
  decal(rustDecal(), 3, 5, S.x - 1.2, 6.5, S.z + S.r + 0.05, scene);
  decal(bloodDecal(5), 4, 4, S.x + 1.5, 0.015, S.z + 5.5, scene, 0, -Math.PI / 2);
  pushC(S.x, S.z, S.r + 0.2, S.r + 0.2);
}

/* ── passerelle, poulie, chaîne et clé suspendue ── */
const siloKey = { y: 6.6, low: 0.86, x: -9, z: -118 };
box(7.2, 0.3, 0.5, mats.dark, -8.1, 8.75, -118); // poutre de la passerelle
box(0.35, 8.6, 0.35, mats.dark, -11.7, 4.3, -118); // poteau
pushC(-11.7, -118, 0.3, 0.3);
{
  const pulley = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 20), mats.steel);
  pulley.position.set(siloKey.x, 8.45, siloKey.z);
  scene.add(pulley);
}
const siloChain = cyl(0.018, 1, mats.steel, siloKey.x, 0, siloKey.z, scene, 6);
siloChain.castShadow = false;
function siloChainTo(y) {
  const len = 8.4 - (y + 0.12);
  siloChain.scale.y = len;
  siloChain.position.y = y + 0.12 + len / 2;
}
const siloKeyObj = (() => {
  const k = new THREE.Group();
  k.position.set(siloKey.x, siloKey.y, siloKey.z);
  scene.add(k);
  const t = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 8, 16), mats.steel);
  k.add(t);
  box(0.014, 0.2, 0.014, mats.steel, 0, -0.16, 0, k);
  box(0.04, 0.014, 0.02, mats.steel, 0.02, -0.24, 0, k);
  box(0.12, 0.08, 0.01, glow(0xffb020, 1.6), 0, -0.02, 0.03, k); // étiquette fluo, visible de loin
  hitBox(0.45, 0.5, 0.45, 0, -0.1, 0, k);
  interactive(k, 'key_01', 'Clé du silo', 'pickup', { focusDist: 0.9 });
  k.userData.hint = 'Clé du silo, suspendue hors de portée';
  return k;
})();
siloChainTo(siloKey.y);
box(1.2, 0.8, 1.2, mats.crate, siloKey.x, 0.4, siloKey.z); // caisse sous la clé
pushC(siloKey.x, siloKey.z, 0.7, 0.7);
decal(rustDecal(), 1.2, 1.2, siloKey.x, 0.81, siloKey.z, scene, 0, -Math.PI / 2);

/* ── treuil mural (ouest) ── */
const siloWinch = (() => {
  const g = new THREE.Group();
  g.position.set(-19.45, 0, -118);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  box(1.3, 1.0, 0.7, mats.dark, 0, 0.5, 0.1, g);
  const drum = cyl(0.3, 1.0, mats.rustpipe, 0, 1.3, 0.15, g, 18);
  drum.rotation.z = Math.PI / 2;
  [-0.55, 0.55].forEach((x) => box(0.08, 0.9, 0.5, mats.steel, x, 1.2, 0.15, g));
  cyl(0.05, 0.12, mats.steel, 0.65, 1.3, 0.15, g, 10).rotation.z = Math.PI / 2; // axe nu
  const crank = new THREE.Group();
  crank.position.set(0.72, 1.3, 0.15);
  crank.visible = false;
  g.add(crank);
  box(0.04, 0.4, 0.04, mats.steel, 0, -0.18, 0, crank);
  cyl(0.03, 0.15, mats.rubber, 0.08, -0.36, 0, crank, 8).rotation.z = Math.PI / 2;
  plane(0.9, 0.4, sign(['TREUIL'], '#b48a22', '#15171a'), 0, 0.75, 0.46, g);
  hitBox(1.5, 1.8, 0.9, 0, 0.9, 0.15, g);
  interactive(g, 'silo_winch', 'Utiliser le treuil', 'use', { focusDist: 2.2, crank, drum });
  pushC(-19.2, -118, 0.6, 0.8);
  return g;
})();
cable(V3(-19.0, 1.35, -118), V3(-9.2, 8.5, -118), 0.5, 0.02);

/* ── cuves A · B · C (mur nord) : leurs jauges donnent le code de la cabine ── */
function gaugeMat(digit) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#d8d2bd';
  x.beginPath();
  x.arc(128, 128, 122, 0, Math.PI * 2);
  x.fill();
  x.lineWidth = 10;
  x.strokeStyle = '#2a2a24';
  x.stroke();
  x.fillStyle = '#1c1c18';
  x.font = 'bold 28px "Stardos Stencil",Arial,sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const ang = (d) => Math.PI * 0.75 + (d / 9) * Math.PI * 1.5;
  for (let d = 0; d <= 9; d++) x.fillText(String(d), 128 + Math.cos(ang(d)) * 92, 128 + Math.sin(ang(d)) * 92);
  x.fillStyle = '#a01e14';
  x.font = 'bold 22px Arial,sans-serif';
  x.fillText('NIVEAU', 128, 190);
  x.strokeStyle = '#a01e14';
  x.lineWidth = 7;
  x.beginPath();
  x.moveTo(128, 128);
  x.lineTo(128 + Math.cos(ang(digit)) * 74, 128 + Math.sin(ang(digit)) * 74);
  x.stroke();
  x.fillStyle = '#2a2a24';
  x.beginPath();
  x.arc(128, 128, 11, 0, Math.PI * 2);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, transparent: true });
}
CONFIG.siloCode = CONFIG.siloCode || '628';
[['A', -14], ['B', -7], ['C', 8]].forEach(([n, x], i) => {
  const z = -128;
  cyl(1.5, 4, mats.rustpipe, x, 2, z, scene, 28);
  cyl(1.55, 0.12, mats.dark, x, 4.05, z, scene, 28);
  cyl(0.15, 2, mats.rustpipe, x, 5, z, scene, 8);
  plane(1.2, 0.6, sign(['CUVE ' + n], '#d8d2bd', '#15171a'), x, 3.2, z + 1.53, scene);
  const g = new THREE.Group();
  g.position.set(x, 1.5, z + 1.54);
  scene.add(g);
  cyl(0.32, 0.06, mats.steel, 0, 0, -0.02, g, 24).rotation.x = Math.PI / 2;
  plane(0.56, 0.56, gaugeMat(+CONFIG.siloCode[i]), 0, 0, 0.02, g);
  hitBox(0.7, 0.7, 0.2, 0, 0, 0.05, g);
  interactive(g, 'gauge_' + n, 'Lire la jauge de la cuve ' + n, 'inspect', { focusDist: 0.9, digit: CONFIG.siloCode[i], tank: n });
  Actions.register('gauge_' + n, async (o) => {
    SND.play('click');
    await focusOn(o);
    State['gauge' + n] = true;
    say('Cuve ' + n + ' : l’aiguille est bloquée sur le ' + o.userData.digit + '.', 5000);
    setObjective(objectiveNow());
  });
  pushC(x, z, 1.6, 1.6);
});
cable(V3(-14, 4.6, -128), V3(-7, 4.6, -128), 0.6, 0.03);
cable(V3(-7, 4.6, -128), V3(8, 4.6, -128), 1.1, 0.03);

/* ── cabine du contremaître (est) : cadenas à 3 chiffres, manivelle sur l’établi ── */
wallX(12, 19.9, -106.2, 3);
wallX(12, 19.9, -113, 3);
wallZ(12, -113, -110.45, 3);
wallZ(12, -108.55, -106.2, 3);
box(0.25, 0.5, 1.9, mats.wall, 12, 2.75, -109.5);
box(8.2, 0.15, 7.1, mats.dark, 16, 3.07, -109.6);
addNeon(7, 16, -109.6, 2.4, 2.9);
plane(1.6, 1.1, sign(['CABINE', 'CADENAS :', 'CUVES A·B·C'], '#2b2e2a', '#e8e2c8'), 11.86, 2.0, -111.6, scene, -Math.PI / 2);
plane(1.4, 0.5, sign(['CONTREMAÎTRE'], '#b48a22', '#15171a'), 11.86, 2.75, -107.4, scene, -Math.PI / 2);
const boothDoor = (() => {
  const pv = new THREE.Group();
  pv.position.set(12, 0, -108.55);
  scene.add(pv);
  box(0.08, 2.45, 1.88, mats.door, 0, 1.23, -0.95, pv);
  box(0.03, 0.4, 0.9, glow(0x9fe8ff, 0.25), -0.05, 1.75, -0.95, pv); // petite vitre
  const lock = padlock(pv, -0.08, 1.1, -1.65);
  lock.rotation.y = -Math.PI / 2;
  hitBox(0.3, 2.4, 1.9, 0, 1.2, -0.95, pv);
  const col = [11.85, 12.15, -110.45, -108.55];
  EXTRA_COLLIDERS.push(col);
  interactive(pv, 'booth_door', 'Ouvrir la cabine du contremaître', 'use', { focusDist: 2.2, col, lock });
  return pv;
})();
PROPS.workbench(17.6, -111.9);
box(0.5, 0.3, 0.35, mats.lockerA, 15.6, 1.06, -111.9);
plane(0.3, 0.4, paperTex2(['Treuil du silo :', 'manivelle rangée', 'ici. NE PAS la', 'laisser dessus !', '— Le contremaître']), 19.85, 1.6, -108, scene, -Math.PI / 2);
const siloCrank = (() => {
  const g = new THREE.Group();
  g.position.set(17.9, 0.96, -111.9);
  g.rotation.y = 0.4;
  scene.add(g);
  box(0.4, 0.04, 0.04, mats.steel, 0, 0, 0, g);
  cyl(0.03, 0.14, mats.rubber, 0.2, 0.07, 0, g, 8);
  cyl(0.045, 0.06, mats.steel, -0.2, 0.03, 0, g, 10);
  hitBox(0.55, 0.25, 0.35, 0, 0.05, 0, g);
  return interactive(g, 'silo_crank', 'Prendre la manivelle', 'pickup', { focusDist: 0.8 });
})();

Actions.register('booth_door', async (o) => {
  const u = o.userData;
  if (State.boothOpen) return say('La cabine est ouverte.', 2500);
  await focusOn(o);
  if (await askCode('CADENAS DE LA CABINE', 3, CONFIG.siloCode, { note: ['INDICE', 'Niveaux des cuves A, B puis C'] })) {
    State.boothOpen = true;
    hideObj(u.lock);
    SND.play('unlock');
    gameTimeout(() => SND.play('door'), 250);
    await release();
    tween(1, (k) => { o.rotation.y = -1.45 * k; });
    const i = EXTRA_COLLIDERS.indexOf(u.col);
    if (i >= 0) EXTRA_COLLIDERS.splice(i, 1);
    say('Le cadenas cède. La porte de la cabine s’ouvre en grinçant.', 4500);
    setObjective(objectiveNow());
  } else {
    say('Le cadenas ne bouge pas. Les jauges des cuves, peut-être…', 4000);
    release();
  }
});
Actions.register('silo_crank', (o) => {
  State.crank = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  say('Une manivelle de treuil, lourde et graissée. Elle doit s’emboîter sur l’axe du treuil.', 5000);
  setObjective(objectiveNow());
});
Actions.register('silo_winch', (o) => {
  const u = o.userData;
  if (State.keyLowered) return say('La chaîne est déroulée : la clé est sur la caisse.', 3000);
  if (!State.crank) {
    SND.play('locked');
    return say('Le treuil n’a plus de manivelle : l’axe est nu. Elle doit être rangée quelque part, sans doute dans la cabine du contremaître.', 6500);
  }
  State.keyLowered = true;
  u.crank.visible = true;
  renderInv();
  SND.play('lever');
  gameTimeout(() => SND.play('door'), 400);
  tween(3.2, (k) => {
    const y = siloKey.y + (siloKey.low - siloKey.y) * k;
    siloKeyObj.position.y = y;
    siloChainTo(y);
    u.crank.rotation.x = -k * Math.PI * 12;
    u.drum.rotation.x = k * Math.PI * 12;
  }).then(() => {
    siloKeyObj.userData.hint = 'Prendre la clé du silo';
    SND.play('success');
    setObjective(objectiveNow());
  });
  say('Vous emboîtez la manivelle et tournez. La chaîne grince : la clé descend lentement jusqu’à la caisse.', 6000);
});

/* ── décor : chariot, palettes, sacs de grain, fûts ── */
PROPS.barrels(-16.5, -107);
PROPS.pallet(-7, -106.3);
PROPS.sand(-16, -112.5);
PROPS.machine(-16.8, -123.5);
PROPS.crates(16.5, -122);
PROPS.drum(17.5, -128.5);
PROPS.pallet(13, -127.5);
{
  const g = new THREE.Group(); // chariot élévateur abandonné
  g.position.set(7.5, 0, -110);
  g.rotation.y = -0.5;
  scene.add(g);
  box(1.3, 0.9, 2.2, mats.door, 0, 0.75, 0.2, g);
  box(1.2, 1.2, 0.08, mats.dark, 0, 1.8, -0.4, g);
  [-0.45, 0.45].forEach((x) => {
    box(0.08, 2.6, 0.1, mats.dark, x, 1.3, -1.0, g);
    box(0.12, 0.05, 1.1, mats.steel, x, 0.12, -1.6, g);
  });
  [[-0.6, 0.8], [0.6, 0.8], [-0.6, -0.3], [0.6, -0.3]].forEach(([x, z]) => {
    cyl(0.28, 0.25, mats.rubber, x, 0.28, z, g, 14).rotation.z = Math.PI / 2;
  });
  pushC(7.5, -110, 1.3, 1.5);
}
decal(bloodDecal(4), 3, 3, -4, 0.015, -125, scene, 0, -Math.PI / 2);
decal(bloodDecal(3), 2.4, 2.4, 14, 0.015, -116, scene, 0, -Math.PI / 2);
wallDec7(-19.85, 3, -108, Math.PI / 2);
function wallDec7(x, y, z, ry) {
  decal(bloodDecal(5), 3, 2.2, x, y, z, scene, ry);
}
cable(V3(-19.8, 10.5, -104), V3(-19.8, 10, -130), 1.2, 0.03);
cable(V3(19.8, 10.6, -104), V3(19.8, 10.2, -130), 0.9, 0.03);
beacon(-19, 8, -110, () => !State.key);
beacon(19, 8, -126, () => !State.key);
