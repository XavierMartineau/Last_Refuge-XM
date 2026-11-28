/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 6 : hangar sud.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
shell(-87, { south: false, w: 120, d: 30, h: 6 });
wallWithDoor(-102, 120, 12);
const _r6 = scene.children.length;
const doorWare = makeDoor('door_ware', 0, -101.85, 'Examiner la porte de sortie'); // sortie du bunker : fin de la partie
[-14, -5, 5, 14].forEach((x) => [-77, -86, -95].forEach((z) => addNeon(6, x, z, 4, 5.6)));
function shelf(x0, x1, z) {
  const L = x1 - x0,
    cx = (x0 + x1) / 2;
  [0.3, 1.1, 1.9, 2.7].forEach((y) => box(L, 0.05, 0.7, mats.dark, cx, y, z));
  for (let x = x0; x <= x1 + 0.01; x += 3) {
    [-0.33, 0.33].forEach((dz) => box(0.07, 3.2, 0.07, mats.dark, x, 1.6, z + dz));
  }
  for (const y of [0.3, 1.1, 1.9, 2.7])
    for (let x = x0 + 0.6; x < x1 - 0.4; x += 1.25)
      if (rnd() < 0.55) {
        const h = 0.3 + rnd() * 0.35;
        box(
          0.9,
          h,
          0.55,
          rnd() < 0.8 ? mats.crate : mats.cloth,
          x + (rnd() - 0.5) * 0.2,
          y + 0.025 + h / 2,
          z + (rnd() - 0.5) * 0.1
        );
      }
  pushC(cx, z, L / 2 + 0.1, 0.45);
}
[-77, -83, -89, -95].forEach((z, i) => {
  shelf(-18.5, -9 - (i % 2) * 1.5, z);
  shelf(-7, -3.4, z);
  shelf(3.4, 7, z);
  shelf(9 + (i % 2) * 1.5, 18.5, z);
});
[
  [1, -19.93, -80, Math.PI / 2],
  [2, 19.93, -90, -Math.PI / 2],
  [3, -19.93, -98, Math.PI / 2],
  [4, 19.93, -76, -Math.PI / 2]
].forEach(([n, x, z, ry]) => {
  const p = plane(1, 1.3, posterTex(n, CONFIG.wareCode[n - 1]), x, 1.7, z, scene, ry);
  interactive(p, 'poster_' + n, 'Lire l’affiche', 'inspect', { focusDist: 1.5 });
});
{
  const g = new THREE.Group();
  g.position.set(2.35, 1.4, -101.8);
  scene.add(g);
  box(0.3, 0.42, 0.08, mats.dark, 0, 0, 0, g);
  const led = box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), 0, 0.15, 0.05, g);
  for (let i = 0; i < 9; i++)
    box(0.05, 0.04, 0.02, mats.steel, -0.07 + (i % 3) * 0.07, 0.05 - Math.floor(i / 3) * 0.06, 0.05, g);
  interactive(g, 'keypad_ware', 'Utiliser le digicode', 'keypad', { led, focusDist: 1.0 });
}
{
  const g = new THREE.Group();
  g.position.set(-10, 0, -74.5);
  scene.add(g);
  box(1.3, 0.12, 2.2, mats.dark, 0, 0.5, 0, g);
  box(1.4, 1.4, 0.1, mats.dark, 0, 1.2, 0.9, g);
  [-0.45, 0.45].forEach((x) => box(0.08, 0.1, 2, mats.steel, x, 0.1, 0.2, g));
  pushC(-10, -74.5, 0.8, 1.2);
} // chariot élévateur
decal(bloodDecal(5), 5, 5, -12, 0.015, -92, scene, 0, -Math.PI / 2);
decal(bloodDecal(4), 4, 4, 12, 0.015, -80, scene, 0, -Math.PI / 2);
beacon(-19, 5, -75, () => !State.wareCode);
beacon(19, 5, -100, () => !State.wareCode);

widenRoom(_r6, { room: 6, hw: 20, thr: 5, zs: [-72, -102], y: 5.6, fill: 22, kinds: ['crates', 'pallet', 'workbench', 'machine'] });
