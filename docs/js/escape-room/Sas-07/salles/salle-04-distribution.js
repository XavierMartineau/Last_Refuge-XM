/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 4 : distribution électrique.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
shell(-27, { south: false, w: 36, d: 10 });
wallWithDoor(-32, 120);
const _r4 = scene.children.length;
const doorFinal = makeDoor('door_final', 0, -31.85, 'Examiner la porte de sortie');
// générateur (mur ouest)
const gen = new THREE.Group();
gen.position.set(-4.9, 0, -26.5);
scene.add(gen);
box(1.5, 1.3, 2.6, mats.lockerA, 0, 0.8, 0, gen);
box(1.6, 0.1, 2.7, mats.dark, 0, 0.1, 0, gen);
cyl(0.12, 2, mats.rustpipe, 0.35, 2.35, -0.8, gen, 12);
{
  const gf = new THREE.Group();
  gf.position.set(0.76, 0.85, 0.4);
  gf.rotation.y = Math.PI / 2;
  gen.add(gf);
  box(0.7, 0.7, 0.04, mats.dark, 0, 0, 0, gf);
  const bl = new THREE.Group();
  bl.position.z = 0.04;
  gf.add(bl);
  for (let i = 0; i < 4; i++) {
    const b = box(0.28, 0.06, 0.01, mats.steel, 0, 0.14, 0, bl);
    b.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), (i * Math.PI) / 2);
    b.rotation.z = (i * Math.PI) / 2;
  }
  rotors.push({ o: bl, s: 14, on: () => State.power4 });
}
const gLed = box(0.12, 0.06, 0.03, glow(0xff2a1a, 3), 0.76, 1.3, -0.8, gen);
decal(bloodDecal(4), 3, 3, -2, 0.015, -27, scene, 0, -Math.PI / 2);
interactive(gen, 'gen_01', 'Examiner le générateur', 'inspect', { led: gLed, focusDist: 3 });
// tableau de 4 disjoncteurs (mur est)
const brk = new THREE.Group();
brk.position.set(5.9, 1.5, -27);
brk.rotation.y = -Math.PI / 2;
scene.add(brk);
box(1.9, 1.1, 0.12, mats.dark, 0, 0, 0, brk);
for (let i = 0; i < 4; i++) {
  const sg = new THREE.Group();
  sg.position.set(-0.66 + i * 0.44, 0, 0.07);
  brk.add(sg);
  box(0.2, 0.5, 0.05, mats.steel, 0, 0, 0, sg);
  const arm = new THREE.Group();
  arm.position.set(0, 0, 0.03);
  arm.rotation.x = 0.7;
  sg.add(arm);
  cyl(0.025, 0.34, mats.dark, 0, 0.17, 0, arm, 8);
  const kn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), glow(0xb01010, 0.6));
  kn.position.set(0, 0.35, 0);
  arm.add(kn);
  const led = box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), 0, 0.4, 0.03, sg);
  const lb = plane(0.14, 0.14, plateMat(String(i + 1)), 0, -0.4, 0.03, sg);
  lb.castShadow = false;
  interactive(sg, `brk_${i + 1}`, 'Actionner le disjoncteur', 'toggle', { idx: i, arm, led, focusDist: 1.4 });
}
// panneau-indice peint (mur ouest) : disque plein = ON
function clue3() {
  const sf = new Surface().base('#4b5049', 0.6, 0.5).grain(20).brush(60).rust(10).rivets(64, 14);
  [90, 200, 312, 422].forEach((x, i) => {
    const on = CONFIG.breakers[i];
    if (on)
      sf.stamp(
        (g) => {
          g.beginPath();
          g.arc(x, 200, 48, 0, 6.3);
          g.fill();
        },
        'rgba(88,8,7,.95)',
        gray(0.3),
        gray(0.7)
      );
    else
      sf.stamp(
        (g) => {
          g.lineWidth = 9;
          g.beginPath();
          g.arc(x, 200, 48, 0, 6.3);
          g.stroke();
        },
        'rgba(88,8,7,.85)',
        gray(0.3),
        gray(0.7)
      );
    sf.write(String(i + 1), x, 330, 'bold 110px Georgia', 'rgba(88,8,7,.95)');
  });
  sf.blood(6).drips(90, 420, 300, 6).grime();
  return pbr(sf, { metal: 0.5, bump: 2.4 });
}
const p3 = box(1.4, 0.9, 0.05, clue3(), -5.93, 1.8, -30.0);
p3.rotation.y = Math.PI / 2;
interactive(p3, 'panel_blood_03', 'Inspecter le panneau peint', 'inspect', { focusDist: 1.5 });
decal(bloodDecal(3), 1.6, 1.6, -5.97, 1.2, -30, scene, Math.PI / 2);
// décor
[1.0, 1.8, 2.6].forEach((y) => box(3, 0.05, 0.6, mats.dark, 4, y - 0.6, -31.6));
[2.55, 5.45].forEach((x) => box(0.06, 2.2, 0.6, mats.dark, x, 1.1, -31.6));
box(0.6, 0.4, 0.45, mats.crate, 3.3, 0.65, -31.6);
box(0.5, 0.35, 0.45, mats.crate, 4.3, 0.62, -31.6);
box(0.6, 0.4, 0.45, mats.crate, 4.9, 1.45, -31.6);
box(0.5, 0.4, 0.45, mats.crate, 3.6, 1.45, -31.6);
box(1.2, 0.8, 0.9, mats.crate, -3.5, 0.4, -31.4);
box(0.8, 0.6, 0.8, mats.crate, -3.3, 1.1, -31.4);
[
  [5.2, -23.2],
  [4.5, -23.4],
  [4.85, -22.95]
].forEach(([x, z]) => cyl(0.32, 0.95, mats.rustpipe, x, 0.475, z));
plane(0.9, 0.55, sign(['DANGER', 'HAUTE', 'TENSION']), 5.97, 1.9, -24.8, scene, -Math.PI / 2);
[
  [-5.7, -23],
  [5.7, -30]
].forEach(([x, z]) => cyl(0.1, H, mats.rustpipe, x, H / 2, z));
cable(V3(-4.2, 2.0, -27.5), V3(5.9, 2.2, -27), 0.9, 0.03);
cable(V3(-5.9, 3.2, -24), V3(5.9, 3.0, -30), 0.8);
{
  const L = new THREE.PointLight(0xdfffe8, 0, 16, 2);
  L.position.set(0, 3, -27);
  scene.add(L);
  neon.lights.push({ l: L, room: 4, base: 45 });
}
[
  [-2.5, -25],
  [2.5, -25],
  [0, -29.5]
].forEach(([x, z]) => addNeon(4, x, z, 3));
beacon(-5.5, 3.1, -23, () => !State.power4);
beacon(5.5, 3.1, -31, () => !State.power4);

widenRoom(_r4, { room: 4, hw: 6, thr: 3, zs: [-22, -32], y: 3.08, S: 6, small: true, fill: 5 });
