/* LAST REFUGE · XM — Pantalons (9 modèles) et jambes.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { buildFoot } from '../bottes/bottes.js?v=20261126l';
import { D } from '../donnees/donnees.js';
import { fab } from '../materiaux/materiaux.js';
import { box, cyl, ell, grp, lerp, mat, mk, sh, th } from '../outils/outils-3d.js';

const PT = [
  { r: 1 },
  { r: 1.07, pockets: 1 },
  { r: 1.05, pockets: 1, camo: 1 },
  { r: 1.03, pockets: 1, knee: 1, camo: 1 },
  { r: 1.06, pockets: 1, work: 1 },
  { r: 1.07, short: 1, pockets: 1 },
  { r: 1.02, cuff: 1 },
  { r: 0.98, shiny: 1 },
  { r: 1.04, knee: 1 }
];
function buildLegs(C) {
  const { body, P, s } = C,
    pt = PT[s.pants] || PT[0],
    camoK = s.camo || 1,
    pcol = D.OUTCOL[s.pantsColor] || '#3b3f45';
  const pm = pt.camo
      ? fab(pcol, camoK, { side: THREE.DoubleSide })
      : pt.shiny
        ? mat(pcol, { roughness: 0.28, metalness: 0.1, side: THREE.DoubleSide })
        : fab(pcol, 0, { side: THREE.DoubleSide }),
    dk = fab(sh(pcol, -0.3), 0),
    r = pt.r;
  C.pantsM = pm;
  C.legs = [];
  C.torso(0.86, 1.05, 0.012, pm);
  ell(P.hr * 1.05, 0.12, P.hr * 0.7, pm, 0, 0.93, 0, body);
  const b = mk(new THREE.TorusGeometry(1, 0.014, 6, 28), dk, 0, 1.04, 0, body);
  b.rotation.x = Math.PI / 2;
  const br = C.prof(1.04) + 0.014;
  b.scale.set(br, br * 0.64, 1);
  for (const side of [-1, 1]) {
    const lg = grp(side * 0.085, 0.93, 0, body),
      kn = grp(0, -0.44, 0, lg);
    cyl(0.07, 0.058, 0.44, C.skin, 0, -0.22, 0, lg, 14);
    cyl(0.056, 0.044, 0.41, C.skin, 0, -0.205, 0, kn, 14);
    ell(0.058, 0.06, 0.058, C.skin, 0, 0, 0, kn);
    const th = pt.short ? 0.27 : 0.44,
      rt = 0.079 * r,
      rb = lerp(rt, 0.066 * r, th / 0.44);
    cyl(rt, rb, th, pm, 0, -th / 2, 0, lg, 16, true);
    if (!pt.short) cyl(0.066 * r, 0.05 * r, 0.41, pm, 0, -0.205, 0, kn, 16, true);
    if (pt.pockets) {
      box(0.034, 0.12, 0.1, pm, side * (rt + 0.012), -0.15, 0.015, lg);
      box(0.036, 0.035, 0.104, dk, side * (rt + 0.013), -0.1, 0.015, lg);
    }
    if (pt.knee) {
      ell(0.052, 0.065, 0.03, dk, 0, 0, 0.052, kn);
      box(0.09, 0.012, 0.02, dk, 0, 0.06, 0.045, kn);
      box(0.09, 0.012, 0.02, dk, 0, -0.06, 0.045, kn);
    }
    if (pt.work) {
      box(0.1, 0.06, 0.012, dk, 0, -0.12, 0.075, lg);
    }
    if (pt.cuff) cyl(0.056, 0.056, 0.03, dk, 0, -0.385, 0, kn, 14);
    const foot = buildFoot(C, kn, side);
    C.legs.push({ lg, kn, foot, side });
  }
}

export { PT, buildLegs };
