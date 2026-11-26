/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 2 : salle de contrôle (pupitre, moniteurs).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ───────── PIÈCE 2 : SALLE DE CONTRÔLE ───────── */
shell(-8, { south: false, w: 24 });
wallWithDoor(-12, 36);
const _r2 = scene.children.length;
const doorExit = makeDoor('door_exit', 0, -11.85, 'Examiner la porte nord');
// éclairage d’accentuation : cyan froid + lueur verte de la cuve + alarme rouge
const spot2 = new THREE.SpotLight(0x9fe8ff, 0, 14, 1.0, 0.75, 2);
spot2.position.set(0, 3.25, -7);
spot2.target.position.set(0, 0, -9.4);
scene.add(spot2, spot2.target);
neon.lights.push({ l: spot2, room: 2, base: 80 });
addNeon(2, 0, -6.2, 2.4);
addNeon(2, 0, -9.8, 2.4);
const tankLight = new THREE.PointLight(0x40ff90, 10, 7, 2);
tankLight.position.set(-2.6, 1.4, -10.2);
scene.add(tankLight);
const alarm2 = new THREE.PointLight(0xff2010, 0, 9, 2);
alarm2.position.set(2.8, 3, -6);
scene.add(alarm2);
alarms.push(alarm2);
alarm2.userData.on = () => !State.solved;

// Console centrale + 3 boutons (green / red / blue)
box(2.4, 0.9, 0.9, mats.dark, 0, 0.45, -9.5);
box(2.5, 0.06, 1, mats.steel, 0, 0.93, -9.5);
const buttons = {};
[
  ['green', 0x20d060, -0.6],
  ['red', 0xe02a1a, 0],
  ['blue', 0x2a58ff, 0.6]
].forEach(([k, hex, x]) => {
  const b = new THREE.Group();
  b.position.set(x, 0.96, -9.4);
  scene.add(b);
  cyl(0.13, 0.04, mats.dark, 0, 0, 0, b);
  const cap = cyl(0.095, 0.06, glow(hex, 1.6), 0, 0.05, 0, b);
  interactive(
    b,
    `btn_${k}`,
    `Appuyer sur le bouton ${k === 'green' ? 'vert' : k === 'red' ? 'rouge' : 'bleu'}`,
    'press',
    { color: k, cap, focusDist: 1.4 }
  );
  buttons[k] = b;
});
// Trois moniteurs muraux
const monitors = [-1.7, 0, 1.7].map((x) => {
  const s = makeScreen(1.2, 0.75, '#7fe9ff');
  s.mesh.position.set(x, 1.9, -11.82);
  scene.add(s.mesh);
  box(1.32, 0.87, 0.08, mats.dark, x, 1.9, -11.87);
  return s;
});
const setMonitors = (a, b, c, col) => [a, b, c].forEach((l, i) => monitors[i].draw(l, col));
setMonitors(...TEXTS.screens.mon_off, '#ff6a5a');
// Panneau-indice n°2 (mur est) + vanne grippée
const p2 = box(1.2, 0.9, 0.05, clue2(), 3.93, 1.8, -7);
p2.rotation.y = -Math.PI / 2;
interactive(p2, 'panel_blood_02', 'Inspecter le panneau', 'inspect', { focusDist: 1.4 });
decal(bloodDecal(3), 1.6, 1.6, 3.97, 1.2, -7, scene, -Math.PI / 2);
{
  const v = new THREE.Group();
  v.position.set(3.7, 1.2, -9);
  v.rotation.y = -Math.PI / 2;
  scene.add(v);
  const pp = cyl(0.08, 1.6, mats.rustpipe, 0, 0, 0, v);
  const w = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 20), mats.rustpipe);
  w.position.z = 0.15;
  v.add(w);
  interactive(v, 'valve_pipe', 'Tourner la vanne', 'inspect', { focusDist: 1.2 });
}
// Cuve vitrée (surface vitrée + liquide émissif)
{
  const t = new THREE.Group();
  t.position.set(-2.8, 0, -10.2);
  scene.add(t);
  cyl(0.62, 0.15, mats.dark, 0, 0.08, 0, t, 32);
  cyl(0.62, 0.15, mats.dark, 0, 2.35, 0, t, 32);
  cyl(
    0.5,
    2.1,
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x2fe880,
      emissiveIntensity: 1.6,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    }),
    0,
    1.2,
    0,
    t,
    32
  ).castShadow = false;
  cyl(0.55, 2.2, mats.glass, 0, 1.2, 0, t, 32).castShadow = false;
  const sil = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.16, 0.9, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0x0a1a10, roughness: 0.8 })
  );
  sil.position.set(0, 1.2, 0);
  sil.rotation.z = 0.25;
  t.add(sil);
  spinners.push(sil);
  interactive(t, 'tank_01', 'Examiner la cuve', 'inspect', { focusDist: 2.4 });
}
decal(bloodDecal(4), 2.4, 2.4, 0, 0.015, -9.3, scene, 0, -Math.PI / 2);
cable(new THREE.Vector3(-3.9, 3.1, -5), new THREE.Vector3(-3.9, 2.5, -11), 0.8);
cable(new THREE.Vector3(1.5, 3.2, -4.5), new THREE.Vector3(0.2, 2.1, -11.7), 0.7, 0.025);
box(1, 0.7, 0.8, mats.crate, -3.0, 0.35, -5.3);
cyl(0.3, 0.9, mats.rustpipe, 3.2, 0.45, -11.2);

// Pièce 2 : baies serveurs (LED clignotantes) + bureau avec journal
[-6.9, -7.9].forEach((z, i) => {
  const g = new THREE.Group();
  g.position.set(-3.5, 0, z);
  scene.add(g);
  box(0.8, 2.1, 0.9, mats.dark, 0, 1.05, 0, g);
  box(0.02, 1.9, 0.8, mats.steel, 0.4, 1.05, 0, g);
  for (let k = 0; k < 9; k++) {
    const m = glow(k % 3 ? 0x30ff70 : 0xffb347, 2);
    box(0.03, 0.03, 0.05, m, 0.42, 0.45 + k * 0.2, -0.3 + ((k * 7 + i * 3) % 5) * 0.15, g);
    blinkers.push({ m, s: 3 + ((k * 1.7) % 5), p: k * 2.1 + i });
  }
  interactive(g, `rack_0${i + 1}`, 'Examiner le serveur', 'inspect', { focusDist: 1.8 });
});
box(1.3, 0.06, 0.7, mats.wood, 3.2, 0.78, -5.0);
[
  [-0.58, -0.28],
  [0.58, -0.28],
  [-0.58, 0.28],
  [0.58, 0.28]
].forEach(([dx, dz]) => box(0.06, 0.78, 0.06, mats.dark, 3.2 + dx, 0.39, -5.0 + dz));
box(0.45, 0.05, 0.45, mats.wood, 2.2, 0.45, -5.0);
box(0.05, 0.4, 0.45, mats.wood, 2.0, 0.65, -5.0);
{
  const n = plane(
    0.3,
    0.4,
    paperTex2([
      'Jour 12.',
      'La lumière baisse.',
      'Il ne reste que les',
      'lampes torches.',
      'Gardez-les pour',
      'les couloirs noirs.'
    ]),
    3.2,
    0.812,
    -5.0,
    scene,
    0,
    -Math.PI / 2
  );
  interactive(n, 'note_desk', 'Lire le journal', 'inspect', { focusDist: 0.8 });
}

widenRoom(_r2, { room: 2, hw: 4, thr: 2, zs: [-4, -12], y: 3.08, S: 6, small: true, fill: 3 });
/* ───────── PIÈCE 3 : DORTOIR (12 × 10 m) — plongé dans le noir, courant coupé ───────── */
