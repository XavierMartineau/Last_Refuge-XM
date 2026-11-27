/* LAST REFUGE · XM — Bottes et chaussures (9 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { leather, metal } from '../materiaux/materiaux.js';
import { box, cyl, ell, grp, mat, mk, sh } from '../outils/outils-3d.js';

const BOOTCOL = ['#16110d', '#4a3420', '#8a6b43', '#3c4a30', '#555a5c', '#e8e8e2', '#8a1e18', '#1a2540'];
const BT = [
  { sh: 0, low: 1 },
  { sh: 0.2, laces: 7, lug: 1 },
  { sh: 0.38 },
  { sh: 0.36, shiny: 1 },
  { sh: 0.02, shiny: 1, thin: 1 },
  { sh: 0.2, laces: 7, lug: 1, desert: 1 },
  { sh: 0.28, fur: 1, lug: 1 },
  { sh: 0.2, laces: 7, lug: 1, toe: 1 },
  { sh: 0, open: 1 }
];
function buildFoot(C, kn, side) {
  const bt = BT[C.s.boots] || BT[0],
    col = BOOTCOL[C.s.bootsColor] || '#16110d',
    fg = grp(0, -0.41, 0, kn);
  const up = bt.shiny
      ? mat(col, { roughness: 0.22, metalness: 0.1 })
      : leather(bt.desert && C.s.bootsColor === 0 ? '#8a6b43' : col, 0.6),
    sole = mat(bt.low ? '#ececE6' : '#0e0e0e', { roughness: 0.85 }),
    lace = mat('#d9d4c4', { roughness: 0.9 }),
    sh2 = bt.sh;
  box(0.108, bt.thin ? 0.02 : 0.03, 0.285, sole, 0, -0.066, 0.045, fg);
  if (bt.lug) for (let i = 0; i < 7; i++) box(0.112, 0.008, 0.012, sole, 0, -0.086, -0.07 + i * 0.045, fg);
  if (bt.open) {
    ell(0.046, 0.034, 0.115, C.skin, 0, -0.035, 0.05, fg);
    box(0.1, 0.008, 0.02, up, 0, -0.012, 0.03, fg);
    box(0.1, 0.008, 0.02, up, 0, -0.01, 0.1, fg);
    box(0.07, 0.04, 0.012, up, 0, -0.03, -0.075, fg);
    return fg;
  }
  ell(0.052, 0.043, 0.135, up, 0, -0.03, 0.05, fg);
  ell(0.05, 0.037, 0.06, bt.toe ? metal('#8a8d88', 0.35) : up, 0, -0.038, 0.145, fg);
  if (sh2 > 0.03) {
    cyl(0.062, 0.067, sh2, up, 0, sh2 / 2 - 0.01, 0, fg, 16);
    const t = mk(
      new THREE.TorusGeometry(0.064, 0.008, 6, 16),
      mat(sh(col, -0.2), { roughness: 0.7 }),
      0,
      sh2 - 0.01,
      0,
      fg
    );
    t.rotation.x = Math.PI / 2;
  }
  if (bt.laces) {
    for (let i = 0; i < bt.laces; i++) {
      const y = -0.015 + (i * (sh2 + 0.02)) / bt.laces;
      box(0.05, 0.005, 0.01, lace, 0, y, 0.063 + (y < 0.02 ? 0.045 : 0), fg);
    }
    box(0.04, sh2 * 0.9, 0.008, mat(sh(col, -0.15), { roughness: 0.8 }), 0, sh2 / 2, 0.066, fg);
  }
  if (bt.fur) cyl(0.079, 0.079, 0.05, mat('#d8d4c8', { roughness: 1 }), 0, sh2 - 0.015, 0, fg, 16);
  if (!bt.thin) ell(0.05, 0.012, 0.05, mat(sh(col, -0.3), { roughness: 0.8 }), 0, -0.05, -0.07, fg);
  return fg;
}

export { BOOTCOL, BT, buildFoot };
