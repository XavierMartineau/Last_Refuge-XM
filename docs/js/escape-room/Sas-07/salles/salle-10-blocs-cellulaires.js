/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 10 : blocs cellulaires.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
shell(-242, { south: false, w: 90, d: 40, h: 5 });
wallWithDoor(-262, 120, 9.6);
const _r10 = scene.children.length; // mur mitoyen avec le complexe (plus haut)
const doorBlock = makeDoor('door_block', 0, -261.85, 'Examiner la porte du bloc');
[-226, -236, -246, -256].forEach((z) => addNeon(10, 0, z, 4, 4.8));
const CELLS = [
  [-228, -235],
  [-235, -242],
  [-242, -249],
  [-249, -256]
];
[-228, -235, -242, -249, -256].forEach((zb) =>
  [-1, 1].forEach((s) => {
    box(10, 5, 0.25, mats.wall, s * 10, 2.5, zb);
    EXTRA_COLLIDERS.push([Math.min(s * 5, s * 15), Math.max(s * 5, s * 15), zb - 0.15, zb + 0.15]);
  })
);
{
  const list = [];
  [-1, 1].forEach((s) => {
    CELLS.forEach(([za, zb], i) => {
      const zc = (za + zb) / 2;
      for (let z = zb + 0.2; z < za - 0.1; z += 0.2) if (Math.abs(z - zc) > 1.05) list.push([s * 5, z]);
      EXTRA_COLLIDERS.push(
        [s * 5 - 0.12, s * 5 + 0.12, zb, zc - 0.95],
        [s * 5 - 0.12, s * 5 + 0.12, zc + 0.95, za]
      );
      box(0.08, 0.1, 7, mats.steel, s * 5, 3.15, zc);
      box(0.08, 0.1, 7, mats.steel, s * 5, 0.06, zc);
      box(0.25, 1.85, 7, mats.wall, s * 5, 4.07, zc);
      // intérieur de la cellule : couchette, cuvette, lavabo, taches
      const bx = s * 12.6;
      box(1, 0.12, 2.2, mats.lockerA, bx, 0.45, zc - 2.2);
      box(1, 0.08, 2.1, mats.cloth, bx, 0.55, zc - 2.2);
      box(1, 0.12, 2.2, mats.lockerA, bx, 1.15, zc - 2.2);
      box(1, 0.08, 2.1, mats.cloth, bx, 1.25, zc - 2.2);
      [
        [-0.45, -1.05],
        [0.45, -1.05],
        [-0.45, 1.05],
        [0.45, 1.05]
      ].forEach(([dx, dz]) => box(0.05, 1.3, 0.05, mats.steel, bx + dx, 0.65, zc - 2.2 + dz));
      box(0.5, 0.4, 0.55, mats.steel, s * 14.5, 0.2, zc + 2.2);
      cyl(0.2, 0.1, mats.steel, s * 14.5, 0.45, zc + 2.2);
      decal(bloodDecal((i + (s > 0 ? 4 : 0)) % 6), 2.2, 2.2, s * 10, 0.015, zc, scene, 0, -Math.PI / 2);
      box(0.9, 0.5, 0.04, mats.steel, s * 14.85, 1.4, zc + 2.2);
      EXTRA_COLLIDERS.push([bx - 0.5, bx + 0.5, zc - 3.3, zc - 1.1]);
    });
  });
  bars(list.filter((p) => p[0] < 0));
  bars(list.filter((p) => p[0] > 0));
}
function makeGate(side, zc, id, hint, isOpen = false) {
  const pv = new THREE.Group();
  pv.position.set(side * 5, 0, zc + 0.95);
  scene.add(pv);
  [0.05, 3.1].forEach((y) => box(0.06, 0.08, 1.9, mats.steel, 0, y, -0.95, pv));
  [0, -1.9].forEach((z) => box(0.06, 3.1, 0.06, mats.steel, 0, 1.55, z, pv));
  box(0.04, 0.06, 1.9, mats.steel, 0, 1.6, -0.95, pv);
  for (let i = 1; i < 9; i++) cyl(0.016, 3, mats.steel, 0, 1.55, -i * 0.19, pv, 6);
  box(0.12, 0.18, 0.1, mats.dark, 0, 1.45, -1.72, pv);
  hitBox(0.25, 3, 1.9, 0, 1.55, -0.95, pv);
  const col = [side * 5 - 0.12, side * 5 + 0.12, zc - 0.95, zc + 0.95];
  interactive(pv, id, hint, 'door', { focusDist: 2.2, col, side, opened: isOpen });
  if (isOpen) pv.rotation.y = -side * 1.45;
  else EXTRA_COLLIDERS.push(col);
  return pv;
}
function openGate(o) {
  const u = o.userData;
  u.opened = true;
  SND.play('unlock');
  setTimeout(() => SND.play('door'), 250);
  tween(1, (k) => {
    o.rotation.y = -u.side * 1.5 * k;
  });
  const i = EXTRA_COLLIDERS.indexOf(u.col);
  if (i >= 0) EXTRA_COLLIDERS.splice(i, 1);
}
const gates = {};
CELLS.forEach(([za, zb], i) => {
  const zc = (za + zb) / 2;
  gates['gate_W' + i] = makeGate(-1, zc, 'gate_W' + i, 'Examiner la cellule', i < 2);
  gates['gate_E' + i] = makeGate(1, zc, 'gate_E' + i, 'Examiner la cellule', false);
});
// poste de garde (au fond) : bureau, tiroir à code, panneau
desk(-2.5, -259.3, 2.6, 0);
{
  const g = new THREE.Group();
  g.position.set(-2.5, 0.55, -258.78);
  scene.add(g);
  box(0.9, 0.2, 0.04, mats.lockerA, 0, 0, 0, g);
  box(0.2, 0.04, 0.05, mats.steel, 0, 0, 0.04, g);
  hitBox(1.1, 0.5, 0.5, 0, 0, 0.1, g);
  interactive(g, 'drawer_guard', 'Ouvrir le tiroir du garde', 'use', { focusDist: 1.3 });
}
box(2, 1.1, 0.1, mats.dark, 4, 2, -261.8);
{
  const sf = new Surface(256).base('#2b2e2a', 0.9, 0.4).grain(20);
  ['REGISTRE', 'CELLULES', '▮ ▮ ▮ ▮'].forEach((t, i) =>
    sf.write(t, 128, 60 + i * 60, 'bold 30px Arial', 'rgba(200,190,150,.8)')
  );
  sf.blood(2, { drip: true });
  plane(1.9, 1, pbr(sf, { bump: 0.6 }), 4, 2, -261.72, scene, 0);
}
// indices
paperNote(
  [
    'Clé de cellule ?',
    'Dans le tiroir du',
    'garde, au fond.',
    'Le code ? Les',
    'détenus gravent',
    'tout sur les murs…'
  ],
  -3,
  1.6,
  -222.2,
  Math.PI,
  'note_cells'
);
{
  const sf = new Surface(256).base('#6b6f66', 0.95, 0.5).grain(40).scratches(40);
  sf.write('7  3  9', 128, 130, 'bold 70px Georgia', 'rgba(20,22,20,.85)');
  for (let i = 0; i < 5; i++) sf.write('||||', 40 + i * 45, 220, '28px Georgia', 'rgba(24,24,22,.7)');
  sf.blood(1, { drip: true });
  const p = plane(1.2, 1.2, pbr(sf, { bump: 1.4 }), -14.85, 1.5, -231.5, scene, Math.PI / 2);
  interactive(p, 'scratch_code', 'Lire les gravures sur le mur', 'inspect', { focusDist: 1.8 });
}
// la cellule du fond ouest (n°3) : la couchette cache la clé du bloc
{
  const g = new THREE.Group();
  g.position.set(-12.6, 0.55, -247.7);
  scene.add(g);
  hitBox(1.1, 1.4, 2.2, 0, 0.3, 0, g);
  interactive(g, 'bunk', 'Fouiller la couchette', 'use', { focusDist: 1.6 });
}
beacon(-14, 4.5, -224, () => !State.key4);
beacon(14, 4.5, -260, () => !State.key4);

let doorCtrl = null;
function openInner(o) {
  const u = o.userData;
  u.opened = true;
  SND.play('door');
  openDoorAnim(o, 1.2);
  const i = EXTRA_COLLIDERS.indexOf(u.col);
  if (i >= 0) EXTRA_COLLIDERS.splice(i, 1);
}

widenRoom(_r10, { room: 10, hw: 15, thr: 10.5, zs: [-222, -262], y: 4.6, fill: 18 });
/* ───────── PIÈCE 11 : COMPLEXE À ÉTAGES (40×50×9,6 m) — escalier, mezzanine, 3 pièces fermées ───────── */
