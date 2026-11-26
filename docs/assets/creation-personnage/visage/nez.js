/* LAST REFUGE · XM — Nez (9 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import { ell, limb } from '../outils/outils-3d.js';

const NOSE = [
  { l: 0.022, w: 0.012, t: 0.011 },
  { l: 0.03, w: 0.014, t: 0.013 },
  { l: 0.04, w: 0.013, t: 0.012 },
  { l: 0.03, w: 0.02, t: 0.016 },
  { l: 0.04, w: 0.011, t: 0.009 },
  { l: 0.026, w: 0.013, t: 0.012, up: 0.01 },
  { l: 0.036, w: 0.013, t: 0.012, hook: 0.007 },
  { l: 0.014, w: 0.019, t: 0.014 },
  { l: 0.028, w: 0.017, t: 0.019 }
];
function nose(C) {
  const n = NOSE[C.s.nose],
    { head, H } = C,
    y1 = -0.022 + (n.up || 0),
    y0 = 0.03,
    zt = H.surf(0, y1) + n.l;
  limb([0, y0, H.surf(0, y0) + 0.004], [0, y1 + 0.004, zt - 0.004], n.w * 0.6, n.w * 0.9, C.skin, head);
  if (n.hook)
    ell(
      n.w * 0.5,
      n.w * 0.5,
      n.w * 0.5,
      C.skin,
      0,
      y0 - 0.012,
      H.surf(0, y0 - 0.012) + n.l * 0.55 + n.hook,
      head
    );
  ell(n.t, n.t * 0.85, n.t * 0.9, C.skin, 0, y1, zt - n.t * 0.3, head);
  for (const side of [-1, 1])
    ell(n.t * 0.55, n.t * 0.5, n.t * 0.5, C.skinD, side * n.w * 0.95, y1 + 0.002, zt - n.t * 0.7, head);
}

export { NOSE, nose };
