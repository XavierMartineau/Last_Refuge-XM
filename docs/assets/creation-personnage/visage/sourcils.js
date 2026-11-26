/* LAST REFUGE · XM — Sourcils (10 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import { mat, sh, tube } from '../outils/outils-3d.js';

const BROW = [
  null,
  { l: 0.05, t: 0.008, a: 0.006, tl: 0.004 },
  { l: 0.05, t: 0.014, a: 0.005, tl: 0.002 },
  { l: 0.05, t: 0.004, a: 0.013, tl: 0.004 },
  { l: 0.05, t: 0.008, a: 0, tl: 0 },
  { l: 0.05, t: 0.01, a: 0.002, tl: -0.014 },
  { l: 0.05, t: 0.008, a: 0.003, tl: 0.014 },
  { l: 0.068, t: 0.008, a: 0.006, tl: 0.004 },
  { l: 0.032, t: 0.011, a: 0.004, tl: 0 },
  { l: 0.052, t: 0.019, a: 0.004, tl: 0.002 }
];
function brows(C) {
  const b = BROW[C.s.brows];
  if (!b || C.sp.cyclops) return;
  const m = mat(sh(C.hairHex, -0.15), { roughness: 0.6 });
  for (const side of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5,
        x = side * (0.02 + b.l * t),
        y = 0.055 + b.a * Math.sin(Math.PI * t) + b.tl * t;
      pts.push([x, y, C.H.surf(x, y) + b.t * 0.4]);
    }
    tube(pts, b.t / 2, m, C.head, 12, 6);
  }
}

export { BROW, brows };
