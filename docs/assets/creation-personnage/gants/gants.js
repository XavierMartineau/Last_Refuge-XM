/* LAST REFUGE · XM — Mains articulées et gants (8 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import { fab, leather, metal } from '../materiaux/materiaux.js';
import { box, cyl, ell, grp, th } from '../outils/outils-3d.js';

const GLOVECOL = ['#14110e', '#4a3420', '#3c4a30', '#5a5d5f', '#8a6b43', '#e8e8e2', '#a02828', '#d8b030'];
const GLV = [
  null,
  { cuff: 0.045 },
  { cuff: 0.055, knuckle: 1 },
  { cuff: 0.03, fl: 1 },
  { cuff: 0.05, bulk: 1.1, fab: 1 },
  { cuff: 0.11, bulk: 1.35, fab: 1 },
  { cuff: 0.02, thin: 1, white: 1 },
  { cuff: 0.03, fl: 0.5, fab: 1 }
];
function buildHand(C, eg, side) {
  const gl = GLV[C.s.gloves],
    col = GLOVECOL[C.s.glovesColor] || '#14110e',
    skin = C.skin;
  const gm = gl
      ? gl.fab
        ? fab(gl.white ? '#e8e8e2' : col, 0)
        : leather(gl.white ? '#e8e8e2' : col, 0.5)
      : null,
    pm = gm || skin;
  const bulk = (gl && gl.bulk) || (gl && gl.thin ? 0.93 : 0) || 1,
    fem = C.fem ? 0.92 : 1,
    hg = grp(0, -0.275, 0, eg);
  hg.rotation.x = -0.08;
  ell(0.021 * bulk, 0.052 * bulk * fem, 0.043 * bulk * fem, pm, 0, -0.05, 0, hg); // paume (épaisseur selon x, doigts alignés selon z)
  for (let i = 0; i < 4; i++) {
    const z = (-0.03 + i * 0.02) * fem * bulk,
      L = [0.034, 0.043, 0.045, 0.036][i] * fem,
      r = 0.0087 * bulk,
      fs = gl && gl.fl ? skin : pm;
    const f1 = grp(0, -0.095, z, hg);
    f1.rotation.z = -side * (0.22 + 0.05 * i);
    cyl(r, r * 0.93, L, pm, 0, -L / 2, 0, f1, 8);
    const f2 = grp(0, -L, 0, f1);
    f2.rotation.z = -side * 0.55;
    const L2 = L * 0.85;
    cyl(r * 0.92, r * 0.78, L2, fs, 0, -L2 / 2, 0, f2, 8);
    ell(r * 0.8, r * 0.8, r * 0.8, fs, 0, -L2, 0, f2);
  }
  const th = grp(-side * 0.02 * bulk, -0.06, 0.042 * fem * bulk, hg);
  th.rotation.x = -0.8;
  th.rotation.z = -side * 0.35;
  cyl(0.0105 * bulk, 0.0095 * bulk, 0.036, pm, 0, -0.018, 0, th, 8);
  const t2 = grp(0, -0.036, 0, th);
  t2.rotation.x = 0.25;
  cyl(0.0095 * bulk, 0.008 * bulk, 0.03, pm, 0, -0.015, 0, t2, 8);
  if (gl && gl.knuckle) {
    box(0.012, 0.05, 0.075, metal('#2b2f2b', 0.5), side * 0.026, -0.075, 0, hg);
    for (let i = 0; i < 4; i++)
      box(0.014, 0.012, 0.016, metal('#3a3f3a', 0.5), side * 0.028, -0.108, -0.03 + i * 0.02, hg);
  }
  if (gl) cyl(0.043 * bulk, 0.045 * bulk, gl.cuff, gm, 0, gl.cuff * 0.3, 0, hg, 14, true); // poignet du gant
}

export { GLOVECOL, GLV, buildHand };
