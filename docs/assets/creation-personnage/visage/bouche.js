/* LAST REFUGE · XM — Bouches (13 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { box, ell, mat, spike, th, tube } from '../outils/outils-3d.js';

const MOUTH = [
  { w: 0.032, s: 0 },
  { w: 0.036, s: 0.014 },
  { w: 0.045, s: 0.02, o: 0.014, te: 1 },
  { w: 0.028, s: -0.012 },
  { w: 0.026, s: 0, o: 0.026 },
  { w: 0.034, s: 0.012, sm: 0.008 },
  { w: 0.036, s: -0.004, o: 0.045, te: 1, to: 1 },
  { w: 0.04, s: 0.004, o: 0.012, te: 1 },
  { w: 0.034, s: 0.008, o: 0.012, fa: 1 },
  { w: 0.03, s: 0.012, o: 0.014, to: 1 },
  { w: 0.018, s: 0.004 },
  { w: 0.034, s: 0, t: 0.0065 },
  { w: 0.036, s: 0.006, sm: -0.01, t: 0.0045 }
];
function mouth(C) {
  const m = MOUTH[C.s.mouth],
    { head, H } = C,
    y0 = -0.072,
    th = m.t || 0.0035,
    lip = mat(C.fem ? '#c4506a' : '#a85a52', { roughness: 0.45 });
  const line = (dy, k) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * 2 - 1,
        x = t * m.w,
        y = y0 + dy + m.s * (t * t - 0.5) * k + (m.sm || 0) * t;
      pts.push([x, y, H.surf(x, y) + th * 0.5]);
    }
    return pts;
  };
  if (m.o) {
    const cav = new THREE.Mesh(new THREE.CircleGeometry(1, 20), mat('#2a0d10', { roughness: 0.9 }));
    cav.scale.set(m.w * 0.9, m.o * 0.55, 1);
    cav.position.set(0, y0 - m.o * 0.5, H.surf(0, y0 - m.o * 0.5) + 0.0012);
    head.add(cav);
    tube(line(0, 1), th, lip, head, 16, 6);
    tube(line(-m.o, 0.6), th, lip, head, 16, 6);
    if (m.te)
      box(m.w * 1.2, 0.007, 0.004, mat('#f2efe2'), 0, y0 - 0.005, H.surf(0, y0 - 0.005) + 0.0025, head);
    if (m.to)
      ell(
        m.w * 0.45,
        m.o * 0.22,
        0.006,
        mat('#c25a6a'),
        0,
        y0 - m.o * 0.8,
        H.surf(0, y0 - m.o * 0.8) + 0.002,
        head
      );
    if (m.fa)
      for (const side of [-1, 1])
        spike(
          [side * m.w * 0.5, y0 - 0.002, H.surf(side * m.w * 0.5, y0) + 0.003],
          [0, -1, 0.1],
          0.004,
          0.013,
          mat('#f4f1e6'),
          head
        );
  } else tube(line(0, 1), th, lip, head, 16, 6);
}

export { MOUTH, mouth };
