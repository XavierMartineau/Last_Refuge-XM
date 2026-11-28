/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 3 : dortoir et chambre forte.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
shell(-17, { south: false, w: 36, d: 10 });
wallWithDoor(-22, 36);
const _r3 = scene.children.length;
const doorVault = makeDoor('door_vault', 0, -21.85, 'Examiner la porte du fond');
const bedBlood = [bloodDecal(2), bloodDecal(3)];
function bunk(x, z, dir, label) {
  // dir = +1 : tête côté mur est ; -1 : côté mur ouest. Le pied du lit porte le numéro.
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  scene.add(g);
  [
    [-0.95, -0.4],
    [0.95, -0.4],
    [-0.95, 0.4],
    [0.95, 0.4]
  ].forEach(([px, pz]) => box(0.06, 1.9, 0.06, mats.dark, px, 0.95, pz, g));
  [0.42, 1.3].forEach((y) => {
    box(1.96, 0.04, 0.86, mats.dark, 0, y, 0, g);
    box(1.9, 0.12, 0.78, mats.mattress, 0, y + 0.08, 0, g);
  });
  box(0.4, 0.09, 0.3, mats.cloth, dir * 0.7, 1.45, 0, g);
  box(0.4, 0.09, 0.3, mats.cloth, dir * 0.7, 0.57, 0, g);
  box(0.03, 0.5, 0.8, mats.dark, -dir * 0.98, 0.9, 0, g);
  const p = plane(0.34, 0.34, plateMat(label), -dir * 1.0, 0.9, 0, g, (-dir * Math.PI) / 2);
  p.castShadow = false;
  if (rnd() < 0.7) decal(bedBlood[(rnd() * 2) | 0], 0.8, 0.8, dir * 0.15, 1.445, 0, g, 0, -Math.PI / 2);
}
const eastNums = CONFIG.safeCode.split(''),
  westNums = ['7', '1', '3', '8'],
  bedZ = [-14.0, -15.8, -17.6, -19.4];
bedZ.forEach((z, i) => {
  bunk(5.0, z, 1, eastNums[i] || '0');
  bunk(-5.0, z, -1, westNums[i]);
});
// table centrale, bancs, radio, note du coffre
box(2.6, 0.08, 0.9, mats.wood, 0, 0.8, -16.5);
[
  [-1.2, -0.35],
  [1.2, -0.35],
  [-1.2, 0.35],
  [1.2, 0.35]
].forEach(([dx, dz]) => box(0.07, 0.8, 0.07, mats.dark, dx, 0.4, -16.5 + dz));
box(2.4, 0.07, 0.3, mats.wood, 0, 0.45, -17.45);
box(2.4, 0.07, 0.3, mats.wood, 0, 0.45, -15.55);
[
  [-0.2, -16.3],
  [0.3, -16.7],
  [-0.9, -16.65]
].forEach(([x, z]) => cyl(0.04, 0.11, mats.steel, x, 0.895, z));
decal(bloodDecal(6), 3, 3, 0, 0.015, -16.5, scene, 0, -Math.PI / 2);
const radio = new THREE.Group();
radio.position.set(0.8, 0.84, -16.5);
radio.rotation.y = 0.3;
scene.add(radio);
box(0.4, 0.22, 0.16, mats.dark, 0, 0.11, 0, radio);
box(0.18, 0.12, 0.01, glow(0x2a6a3a, 0.8), -0.08, 0.11, 0.085, radio);
cyl(0.03, 0.02, mats.steel, 0.12, 0.12, 0.09, radio, 12).rotation.x = Math.PI / 2;
cyl(0.006, 0.5, mats.steel, 0.17, 0.45, -0.05, radio, 6).rotation.z = -0.3;
interactive(radio, 'radio_01', 'Écouter la radio', 'toggle', { focusDist: 1 });
{
  const n = plane(
    0.3,
    0.4,
    paperTex2(['COFFRE :', 'les numéros des lits', 'de la rangée EST,', 'de l’entrée vers', 'le fond.']),
    -1.05,
    0.845,
    -16.5, // au bout ouest de la table : les bancs empêchent d’approcher par les côtés
    scene,
    0,
    -Math.PI / 2
  );
  interactive(n, 'note_safe', 'Lire la note', 'inspect', { focusDist: 0.8 });
}
// coffre mural (mur nord) + carte d’accès
const safe = new THREE.Group();
safe.position.set(-3.5, 1.35, -21.65);
scene.add(safe);
box(0.95, 0.95, 0.4, mats.dark, 0, 0, 0, safe);
plane(0.72, 0.72, new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, 0, 0.202, safe);
const sdp = new THREE.Group();
sdp.position.set(-0.4, 0, 0.21);
safe.add(sdp);
box(0.8, 0.8, 0.05, mats.steel, 0.4, 0, 0, sdp);
cyl(0.11, 0.04, mats.dark, 0.4, 0.05, 0.04, sdp, 20).rotation.x = Math.PI / 2;
box(0.05, 0.22, 0.04, mats.dark, 0.65, -0.15, 0.04, sdp);
decal(bloodDecal(1), 0.7, 0.7, 0.4, 0, 0.03, sdp);
const card = box(0.2, 0.012, 0.13, glow(0x30ff70, 1.2), 0, -0.2, 0.2, safe);
card.rotation.x = 0.35;
card.visible = false;
card.raycast = () => {};
interactive(card, 'keycard', 'Prendre la carte d’accès', 'pickup', { focusDist: 0.6 });
interactive(safe, 'safe_01', 'Examiner le coffre', 'keypad', { pivot: sdp, focusDist: 1.3 });
{
  const pk = plane(
    0.24,
    0.24,
    paperTex2(['CODE COFFRE', CONFIG.safeCode.split('').join(' ')]),
    -2.7,
    1.5,
    -21.97,
    scene,
    0
  );
  interactive(pk, 'sticky_safe', 'Lire le post-it', 'inspect', { focusDist: 0.7 });
} // post-it collé à côté du coffre
// lecteur de carte à côté de la porte du fond
const reader = new THREE.Group();
reader.position.set(1.55, 1.35, -21.8);
scene.add(reader);
box(0.22, 0.36, 0.08, mats.dark, 0, 0, 0, reader);
const rLed = box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), 0, 0.1, 0.05, reader);
box(0.14, 0.02, 0.02, mats.steel, 0, -0.04, 0.05, reader);
box(0.14, 0.1, 0.01, glow(0x2a6a3a, 0.7), 0, -0.12, 0.045, reader);
interactive(reader, 'reader_01', 'Utiliser le lecteur', 'use', { led: rLed, focusDist: 1.0 });
// décor
box(1, 0.7, 0.8, mats.crate, -5.2, 0.35, -12.9);
box(0.8, 0.6, 0.7, mats.crate, -5.25, 1.0, -12.9);
cyl(0.32, 0.95, mats.rustpipe, 5.3, 0.475, -12.8);
cyl(0.32, 0.95, mats.rustpipe, 4.7, 0.475, -12.95);
cable(V3(-5.9, 3.1, -13), V3(5.9, 2.9, -20), 0.9);
cable(V3(5.9, 3.0, -21), V3(-1.5, 2.6, -12.3), 0.8, 0.03);
{
  const fan = new THREE.Group();
  fan.position.set(4.6, 2.5, -21.82);
  scene.add(fan);
  box(0.8, 0.8, 0.06, mats.dark, 0, 0, 0, fan);
  const bl = new THREE.Group();
  bl.position.z = 0.05;
  fan.add(bl);
  for (let i = 0; i < 4; i++) {
    const b = box(0.3, 0.06, 0.01, mats.steel, 0, 0.15, 0, bl);
    b.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), (i * Math.PI) / 2);
    b.rotation.z = (i * Math.PI) / 2;
  }
  rotors.push({ o: bl, s: 6 });
}
{
  const L = new THREE.PointLight(0xdfffe8, 0, 16, 2);
  L.position.set(0, 3, -17);
  scene.add(L);
  neon.lights.push({ l: L, room: 3, base: 45 });
}
[
  [-3, -14.5],
  [3, -14.5],
  [-3, -19.5],
  [3, -19.5]
].forEach(([x, z]) => addNeon(3, x, z, 3));
beacon(-5.5, 3.1, -21, () => !State.vaultUnlocked);
beacon(5.5, 3.1, -13, () => !State.vaultUnlocked);

widenRoom(_r3, { room: 3, hw: 6, thr: 3, zs: [-12, -22], y: 3.08, S: 6, small: true, fill: 5 });
/* ───────── PIÈCE 4 : SALLE DES MACHINES (12 × 10 m) ───────── */
