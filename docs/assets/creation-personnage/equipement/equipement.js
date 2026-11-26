/* LAST REFUGE · XM — Équipement : ceintures, holsters, bandoulières, harnais…
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { fab, metal } from '../materiaux/materiaux.js';
import { box, cyl, lerp, limb, mat, mk, sh } from '../outils/outils-3d.js';

function gearBuild(C) {
  const k = C.s.gear;
  if (!k) return;
  const { body } = C,
    zf = (y) => (C.prof(y) + 0.035) * 0.64,
    nyl = fab(sh(C.mainHex, -0.35), 0),
    blk = mat('#1d1f1c', { roughness: 0.7 }),
    mt = metal('#8a8d88', 0.4),
    dk = mat('#222420', { roughness: 0.5, metalness: 0.4 });
  const belt = (y) => {
    const b = mk(new THREE.TorusGeometry(1, 0.02, 6, 28), nyl, 0, y, 0, body);
    b.rotation.x = Math.PI / 2;
    const r = C.prof(y) + 0.032;
    b.scale.set(r, r * 0.64, 1);
    box(0.055, 0.045, 0.014, mt, 0, y, zf(y) + 0.002, body);
  };
  const pouch = (x, y, zz, w = 0.07, h = 0.09) => {
    box(w, h, 0.05, nyl, x, y, zz, body);
    box(w + 0.004, 0.025, 0.054, blk, x, y + h / 2 - 0.01, zz, body);
  };
  switch (k) {
    case 1:
      belt(1.03);
      pouch(-0.1, 1.0, zf(1.0) + 0.02);
      pouch(-0.17, 0.99, zf(1.0) - 0.04, 0.06, 0.1);
      pouch(0.1, 1.0, zf(1.0) + 0.02);
      pouch(0.18, 0.99, zf(1.0) - 0.05, 0.06, 0.1);
      pouch(0, 1.0, -zf(1.0) - 0.02, 0.16, 0.1);
      break;
    case 2:
      {
        belt(1.03);
        const L = C.legs[1].lg;
        cyl(0.084, 0.084, 0.03, blk, 0, -0.2, 0, L, 14);
        box(0.045, 0.2, 0.095, blk, 0.1, -0.2, 0.015, L);
        box(0.032, 0.08, 0.055, dk, 0.1, -0.07, 0.0, L);
        box(0.026, 0.05, 0.12, dk, 0.1, -0.2, 0.07, L);
        pouch(-0.1, 1.0, zf(1.0) + 0.02);
      }
      break;
    case 3:
      {
        const A = [-0.13, 1.37, zf(1.37) + 0.012],
          B = [0.13, 1.04, zf(1.04) + 0.012];
        limb(A, B, 0.021, 0.021, nyl, body);
        for (let i = 0; i < 8; i++) {
          const t = (i + 0.5) / 8;
          cyl(
            0.0075,
            0.0075,
            0.045,
            metal('#c9a64a', 0.3),
            lerp(A[0], B[0], t),
            lerp(A[1], B[1], t),
            lerp(A[2], B[2], t) + 0.02,
            body,
            8
          );
        }
        belt(1.03);
      }
      break;
    case 4:
      belt(1.03);
      pouch(-0.12, 0.98, -zf(0.98) - 0.03, 0.12, 0.11);
      pouch(0.12, 0.98, -zf(0.98) - 0.03, 0.12, 0.11);
      break;
    case 5:
      {
        pouch(-0.11, 1.27, zf(1.27) + 0.02, 0.09, 0.2);
        cyl(0.004, 0.004, 0.34, mt, -0.14, 1.5, zf(1.27) + 0.02, body, 6);
        box(0.05, 0.012, 0.012, blk, -0.11, 1.3, zf(1.3) + 0.05, body);
        belt(1.03);
      }
      break;
    case 6:
      {
        belt(1.03);
        const c = cyl(0.042, 0.042, 0.17, mat('#4a5a3a', { roughness: 0.8 }), 0.19, 0.97, 0.0, body, 14);
        c.rotation.z = 0.1;
        cyl(0.026, 0.026, 0.02, blk, 0.19, 1.07, 0.0, body, 10);
        box(0.026, 0.14, 0.016, blk, -0.18, 0.97, 0.04, body);
        box(0.024, 0.06, 0.02, mat('#2a1a10'), -0.18, 1.06, 0.04, body);
      }
      break;
    case 7:
      {
        belt(1.03);
        for (const s of [-1, 1]) box(0.04, 0.34, 0.014, nyl, s * 0.085, 1.2, zf(1.2) + 0.012, body);
        box(0.22, 0.035, 0.014, nyl, 0, 1.28, zf(1.28) + 0.012, body);
        for (const s of [-1, 1]) {
          const t = mk(
            new THREE.TorusGeometry(0.015, 0.004, 6, 12),
            mt,
            s * 0.085,
            1.35,
            zf(1.35) + 0.02,
            body
          );
        }
        pouch(-0.1, 1.05, zf(1.05) + 0.02);
        pouch(0.1, 1.05, zf(1.05) + 0.02);
        pouch(0, 1.18, zf(1.18) + 0.025, 0.12, 0.07);
      }
      break;
    case 8:
      {
        for (const l of C.legs) {
          cyl(0.088, 0.085, 0.035, nyl, 0, -0.14, 0, l.lg, 14);
          cyl(0.088, 0.085, 0.03, nyl, 0, -0.32, 0, l.lg, 14);
          box(0.03, 0.03, 0.01, mt, 0, -0.14, 0.087, l.lg);
        }
        for (const s of [-1, 1]) box(0.045, 0.3, 0.014, nyl, s * 0.09, 1.2, zf(1.2) + 0.012, body);
        box(0.2, 0.035, 0.014, nyl, 0, 1.26, zf(1.26) + 0.012, body);
        belt(1.03);
      }
      break;
  }
}

export { gearBuild };
