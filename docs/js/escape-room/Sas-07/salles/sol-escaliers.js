/* LAST REFUGE · XM — Escape room « Sas 07 » · Hauteur du sol : escaliers et mezzanine.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═════════ HAUTEUR DU SOL : escaliers et mezzanine (utilisée par la marche, le personnage et la caméra) ═════════ */
const PLAT = { x0: -60, x1: -3.6, z0: -312, z1: -275.2, y: 4.8 },
  STAIR = { x0: -6, x1: -3.6, za: -268, zb: -275.2 };
function GH(x, z) {
  if (typeof MapScenes !== 'undefined' && MapScenes.active && z < -900) return MapScenes.height();
  if (z < -102 && z > -262) {
    const f = floorAt(x, z); // marches, quais et plateformes des salles 7 à 10
    if (f !== null) return f;
  }
  if (x <= PLAT.x1 && x >= PLAT.x0 && z <= PLAT.z1 && z >= PLAT.z0) return PLAT.y;
  if (x >= STAIR.x0 && x <= STAIR.x1 && z <= STAIR.za && z > STAIR.zb)
    return (PLAT.y * (STAIR.za - z)) / (STAIR.za - STAIR.zb);
  return 0;
}
function paperNote(lines, x, y, z, ry, id, w = 0.9, h = 1.1) {
  const sf = new Surface(256)
    .base('#c9bc99', 0.9, 0.5)
    .grain(30)
    .blob(40, 200, 60, '110,80,30', 0.4)
    .blob(210, 50, 50, '110,80,30', 0.35);
  lines.forEach((t, i) =>
    sf.write(t, 128, 36 + i * (200 / lines.length), 'bold 19px Georgia', 'rgba(40,30,20,.92)')
  );
  sf.blood(1, { w: 120, h: 100, drip: false });
  const p = plane(w, h, pbr(sf, { bump: 0.6 }), x, y, z, scene, ry);
  interactive(p, id, 'Lire la note', 'inspect', { focusDist: 1.4 });
  return p;
}
// murs intérieurs avec colliders (la porte, si elle existe, laisse un passage de 1,9 m)
function wallX(x0, x1, z, h, dx = null, y0 = 0) {
  const seg = (a, b) => {
    if (b - a < 0.01) return;
    box(b - a, h, 0.25, mats.wall, (a + b) / 2, y0 + h / 2, z);
    EXTRA_COLLIDERS.push([a, b, z - 0.15, z + 0.15]);
  };
  if (dx === null) return seg(x0, x1);
  seg(x0, dx - 0.95);
  seg(dx + 0.95, x1);
  box(1.9, h - 2.5, 0.25, mats.wall, dx, y0 + 2.5 + (h - 2.5) / 2, z);
  box(0.1, 2.5, 0.28, mats.dark, dx - 0.97, y0 + 1.25, z);
  box(0.1, 2.5, 0.28, mats.dark, dx + 0.97, y0 + 1.25, z);
  box(2.04, 0.1, 0.28, mats.dark, dx, y0 + 2.52, z);
}
function wallZ(x, z0, z1, h, y0 = 0) {
  box(0.25, h, z1 - z0, mats.wall, x, y0 + h / 2, (z0 + z1) / 2);
  EXTRA_COLLIDERS.push([x - 0.15, x + 0.15, z0, z1]);
}
function keyItem(x, y, z, id, hint, ry = 0) {
  const k = new THREE.Group();
  k.position.set(x, y, z);
  k.rotation.y = ry;
  scene.add(k);
  const t = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 16), mats.steel);
  t.rotation.x = Math.PI / 2;
  k.add(t);
  box(0.012, 0.012, 0.16, mats.steel, 0, 0, 0.13, k);
  box(0.03, 0.012, 0.02, mats.steel, 0.02, 0, 0.18, k);
  hitBox(0.4, 0.2, 0.4, 0, 0, 0, k);
  return interactive(k, id, hint, 'pickup', { focusDist: 0.8 });
}
// zone de clic invisible
function bars(list) {
  // barreaux : un seul InstancedMesh pour tous
  const im = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.018, 0.018, 3.1, 6),
      mats.steel,
      list.length
    ),
    d = new THREE.Object3D();
  list.forEach(([x, z], i) => {
    d.position.set(x, 1.55, z);
    d.updateMatrix();
    im.setMatrixAt(i, d.matrix);
  });
  im.castShadow = true;
  scene.add(im);
}

/* ───────── PIÈCE 10 : BLOC CELLULAIRE (30×40×5 m) ───────── */
