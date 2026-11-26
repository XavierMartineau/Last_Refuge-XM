/* LAST REFUGE · XM — Sacs à dos (7 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { fab, metal } from '../materiaux/materiaux.js';
import { box, cyl, mat, sh } from '../outils/outils-3d.js';

const BP = [
  null,
  { w: 0.34, h: 0.46, d: 0.2, y: 1.2, pk: 1, molle: 1 },
  { w: 0.36, h: 0.62, d: 0.26, y: 1.14, roll: 1, lid: 1 },
  { w: 0.28, h: 0.34, d: 0.14, y: 1.22 },
  { w: 0.32, h: 0.4, d: 0.2, y: 1.2, ant: 1 },
  { w: 0.34, h: 0.38, d: 0.2, y: 1.22, cross: 1, white: 1 },
  { w: 0.34, h: 0.5, d: 0.22, y: 1.16, roll: 1, top: 1 },
  { w: 0.42, h: 0.64, d: 0.3, y: 1.12, pk: 2, molle: 1, big: 1 }
];
function backpack(C) {
  const k = C.s.backpack;
  if (!k) return;
  const bp = BP[k],
    { body } = C,
    zb = -((C.prof(1.2) + 0.05) * 0.64 + bp.d / 2);
  const bm = bp.white
      ? mat('#dcd8cc', { roughness: 0.8 })
      : fab(C.mainHex, k === 1 || k === 7 ? C.s.camo || 0 : 0, { side: THREE.DoubleSide }),
    dk = fab(sh(C.mainHex, -0.35), 0),
    zfy = (y) => (C.prof(y) + 0.03) * 0.64;
  box(bp.w, bp.h, bp.d, bm, 0, bp.y, zb, body);
  box(bp.w * 0.96, 0.05, bp.d * 1.02, dk, 0, bp.y + bp.h / 2, zb, body);
  if (bp.pk)
    for (const s of [-1, 1])
      box(0.06, bp.h * 0.5, bp.d * 0.8, dk, s * (bp.w / 2 + 0.03), bp.y - bp.h * 0.1, zb, body);
  if (bp.pk === 2) box(bp.w * 0.8, bp.h * 0.4, 0.08, dk, 0, bp.y - bp.h * 0.12, zb - bp.d / 2 - 0.04, body);
  if (bp.molle)
    for (let i = 0; i < 4; i++)
      box(bp.w * 0.9, 0.008, 0.012, dk, 0, bp.y - bp.h * 0.3 + i * 0.07, zb - bp.d / 2 - 0.006, body);
  if (bp.roll || bp.top) {
    const c = cyl(
      0.07,
      0.07,
      bp.w + 0.04,
      mat('#8a6b43', { roughness: 0.9 }),
      0,
      bp.roll && !bp.top ? bp.y - bp.h / 2 - 0.05 : bp.y + bp.h / 2 + 0.09,
      zb,
      body,
      16
    );
    c.rotation.z = Math.PI / 2;
  }
  if (bp.lid) box(bp.w * 1.02, 0.06, bp.d * 1.04, dk, 0, bp.y + bp.h / 2 + 0.03, zb, body);
  if (bp.ant) {
    cyl(0.004, 0.004, 0.6, metal('#9a9d98', 0.3), 0.12, bp.y + bp.h / 2 + 0.3, zb - 0.05, body, 6);
    box(0.12, 0.1, 0.04, dk, 0, bp.y, zb - bp.d / 2 - 0.02, body);
  }
  if (bp.cross) {
    const r = mat('#b02020', { roughness: 0.7 });
    box(0.14, 0.045, 0.01, r, 0, bp.y, zb - bp.d / 2 - 0.006, body);
    box(0.045, 0.14, 0.01, r, 0, bp.y, zb - bp.d / 2 - 0.006, body);
  }
  for (const s of [-1, 1]) {
    box(0.05, 0.3, 0.014, dk, s * 0.1, 1.2, zfy(1.2) + 0.012, body);
    box(0.05, 0.014, 0.2, dk, s * 0.1, 1.4, -0.0, body);
    box(0.05, 0.014, 0.07, dk, s * 0.1, 1.395, 0.075, body);
  }
}

export { BP, backpack };
