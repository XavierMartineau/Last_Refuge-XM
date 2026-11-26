/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 9 : quartiers.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
shell(-197, { south: false, w: 150, d: 50, h: 9 });
wallWithDoor(-222, 150, 9);
const _r9 = scene.children.length;
const doorExit2 = makeDoor('door_exit2', 0, -221.85, 'Examiner la porte de sortie');
[-18, -9, 0, 9, 18].forEach((x) => [-180, -190, -200, -210, -218].forEach((z) => addNeon(9, x, z, 4, 8.6)));
makeJeep(-12, -194, 0);
makeJeep(14, -205, 0.4);
makeJeep(-17, -212, -0.3);
{
  const g = new THREE.Group();
  g.position.set(2.5, 0, -188);
  scene.add(g);
  box(3, 0.5, 8, mats.dark, 0, 0.9, 0, g);
  box(2.8, 2.2, 5, mats.lockerA, 0, 2.2, -1.2, g);
  box(2.8, 1.9, 2.2, mats.door, 0, 1.95, 3.1, g);
  [-3.2, 2.9].forEach((z) =>
    [-1.5, 1.5].forEach((x) => {
      const w = cyl(0.55, 0.45, mats.rubber, x, 0.55, z, g, 18);
      w.rotation.z = Math.PI / 2;
    })
  );
  pushC(2.5, -188, 1.8, 4.3);
}
// clé du convoi posée sur le capot de la jeep n°1
{
  const k = new THREE.Group();
  k.position.set(-12, 1.05, -192.6);
  scene.add(k);
  const t = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 16), mats.steel);
  t.rotation.x = Math.PI / 2;
  k.add(t);
  box(0.012, 0.012, 0.16, mats.steel, 0, 0, 0.13, k);
  box(0.03, 0.012, 0.02, mats.steel, 0.02, 0, 0.18, k);
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.2, 0.4),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  k.add(hit);
  interactive(k, 'key_02', 'Prendre la clé du convoi', 'pickup', { focusDist: 0.8 });
}
wallDec(-24.8, 2, -190, Math.PI / 2, 5);
decal(bloodDecal(5), 5, 5, 0, 0.015, -200, scene, 0, -Math.PI / 2);
decal(bloodDecal(4), 4, 4, -8, 0.015, -180, scene, 0, -Math.PI / 2);
scatter(
  -23,
  23,
  -221,
  -175,
  80,
  [
    [-14.5, -9.5, -196.5, -191.5],
    [11.5, 16.5, -207.5, -202.5],
    [-19.5, -14.5, -214.5, -209.5],
    [0.5, 4.5, -192, -184],
    [-3, 3, -222, -218]
  ],
  ['crates', 'barrels', 'pallet', 'sand', 'drum', 'tarp']
);
beacon(-24, 7, -178, () => !State.key2);
beacon(24, 7, -216, () => !State.key2);
