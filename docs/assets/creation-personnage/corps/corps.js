/* LAST REFUGE · XM — Corps : torse, cou, bras et mains, jambes.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { buildHand } from '../gants/gants.js';
import { cyl, ell, grp, lerp, mk } from '../outils/outils-3d.js';
import { buildLegs } from '../pantalons/pantalons.js';

function buildBody(C) {
  const { fem, body } = C,
    P = (C.P = fem
      ? { sw: 0.155, tr: 0.148, wr: 0.108, hr: 0.15, arm: 0.04 }
      : { sw: 0.2, tr: 0.172, wr: 0.14, hr: 0.155, arm: 0.047 });
  const pts = [
    [0.86, P.hr * 0.98],
    [0.98, P.wr],
    [1.12, P.wr * 1.05],
    [1.24, P.tr],
    [1.33, P.sw * 0.9],
    [1.39, 0.07]
  ];
  C.prof = (y) => {
    let r = pts[pts.length - 1][1];
    if (y <= pts[0][0]) r = pts[0][1];
    else
      for (let i = 1; i < pts.length; i++)
        if (y <= pts[i][0]) {
          const a = pts[i - 1],
            b = pts[i];
          r = lerp(a[1], b[1], (y - a[0]) / (b[0] - a[0]));
          break;
        }
    return r + (fem ? 0.016 * Math.exp(-Math.pow((y - 1.2) / 0.06, 2)) : 0);
  };
  C.torso = (y0, y1, off, m, fl = 0, n = 12) => {
    const v = [];
    for (let i = 0; i <= n; i++) {
      const y = lerp(y0, y1, i / n);
      v.push(new THREE.Vector2(C.prof(y) + off + fl * Math.max(0, 1 - y) * 0.35, y));
    }
    const o = mk(new THREE.LatheGeometry(v, 56), m, 0, 0, 0, body);
    o.scale.z = 0.64;
    return o;
  };
  C.torso(0.86, 1.4, 0, C.skin);
  ell(P.sw * 0.55, 0.05, 0.085, C.skin, 0, 1.385, -0.01, body); // trapèzes
  cyl(0.05, 0.058, 0.15, C.skin, 0, 1.42, 0, body);
  ell(0.056, 0.04, 0.056, C.skin, 0, 1.37, 0.0, body); // cou
  C.arms = [];
  for (const side of [-1, 1]) {
    const ag = grp(side * P.sw, 1.31, 0, body);
    ag.rotation.z = side * 0.12;
    ell(P.arm * 1.3, P.arm * 1.25, P.arm * 1.25, C.skin, 0, 0, 0, ag); // deltoïde
    ell(P.arm * 1.06, 0.12, P.arm * 1.06, C.skin, 0, -0.12, 0, ag); // biceps
    cyl(P.arm, P.arm * 0.86, 0.3, C.skin, 0, -0.15, 0, ag, 14);
    const eg = grp(0, -0.3, 0, ag);
    eg.rotation.x = -0.14;
    ell(P.arm * 0.9, P.arm * 0.9, P.arm * 0.9, C.skin, 0, 0, 0, eg);
    cyl(P.arm * 0.85, P.arm * 0.62, 0.27, C.skin, 0, -0.135, 0, eg, 14);
    buildHand(C, eg, side);
    C.arms.push({ ag, eg, side });
  }
  buildLegs(C);
  C.chest = body;
}

export { buildBody };
