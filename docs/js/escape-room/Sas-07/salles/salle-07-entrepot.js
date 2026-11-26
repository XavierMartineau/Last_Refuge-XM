/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 7 : entrepôt (silo).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
shell(-117, { south: false, w: 90, d: 30, h: 12 });
wallWithDoor(-132, 150, 12);
const _r7 = scene.children.length;
const doorEnd = makeDoor('door_end', 0, -131.85, 'Examiner la porte de sortie');
[-8, 8].forEach((x) => [-108, -120, -128].forEach((z) => addNeon(7, x, z, 4, 11.6)));
{
  cyl(4, 10, mats.steel, 0, 5, -117, scene, 32);
  [2, 5, 8].forEach((y) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(4.05, 0.1, 6, 40), mats.dark);
    t.rotation.x = Math.PI / 2;
    t.position.set(0, y, -117);
    t.castShadow = true;
    scene.add(t);
  });
  box(0.1, 9, 0.1, mats.dark, 4.1, 4.5, -116.5);
  box(0.1, 9, 0.1, mats.dark, 4.1, 4.5, -117.5);
  for (let y = 0.4; y < 9; y += 0.4) box(0.08, 0.05, 1.1, mats.dark, 4.1, y, -117);
  cyl(0.35, 12, mats.rustpipe, -3, 6, -112.5);
  cyl(0.3, 12, mats.rustpipe, 3, 6, -121.5);
  pushC(-3, -112.5, 0.5, 0.5);
  pushC(3, -121.5, 0.5, 0.5);
  decal(bloodDecal(4), 3, 3, 0, 0.015, -111, scene, 0, -Math.PI / 2);
  pushC(0, -117, 4.3, 4.3);
}
box(1.8, 0.08, 0.9, mats.wood, 11, 0.9, -124);
[
  [-0.8, -0.35],
  [0.8, -0.35],
  [-0.8, 0.35],
  [0.8, 0.35]
].forEach(([dx, dz]) => box(0.07, 0.9, 0.07, mats.dark, 11 + dx, 0.45, -124 + dz));
pushC(11, -124, 1, 0.6);
{
  const k = new THREE.Group();
  k.position.set(11, 0.96, -124);
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
  interactive(k, 'key_01', 'Prendre la clé', 'pickup', { focusDist: 0.8 });
}
scatter(-14, 14, -130, -104, 48, [
  [-5.5, 5.5, -123, -111],
  [9.5, 12.5, -125, -123]
], ['barrels', 'drum', 'machine', 'workbench']);
beacon(-14, 8, -110, () => !State.key);
beacon(14, 8, -126, () => !State.key);

widenRoom(_r7, { room: 7, hw: 15, thr: 4, zs: [-102, -132], y: 11.6, fill: 14, kinds: ['barrels', 'drum', 'machine'] });
