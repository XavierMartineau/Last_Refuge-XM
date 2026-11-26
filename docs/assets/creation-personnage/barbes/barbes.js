/* LAST REFUGE · XM — Barbes et moustaches (10 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import { chain, ell, mat, tube } from '../outils/outils-3d.js';
import { shell } from '../tete/tete.js';

const JAW = (x, y, z) =>
  y < -0.2 &&
  y > -0.99 &&
  z > -0.2 &&
  (z > 0.1 || Math.abs(x) > 0.55) &&
  !(Math.abs(x) < 0.3 && y > -0.55 && y < -0.36 && z > 0.4);
function beard(C) {
  const b = C.s.beard;
  if (C.fem || !b) return;
  const { head, H } = C,
    m = C.hairM,
    fine = mat(C.hairHex, { roughness: 0.9, transparent: true, opacity: 0.5, depthWrite: false });
  const stache = () => {
    for (const side of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 4; i++) {
        const t = i / 4,
          x = side * (0.004 + 0.034 * t),
          y = -0.047 - 0.012 * t * t;
        pts.push([x, y, H.surf(x, y) + 0.007]);
      }
      tube(pts, 0.0065, m, head, 10, 6);
    }
  };
  const chin = (w, h) => ell(w, h, w * 0.9, m, 0, -0.125, H.surf(0, -0.125) - 0.002, head);
  switch (b) {
    case 1:
      head.add(shell(H, JAW, 0.003, fine));
      break;
    case 2:
      stache();
      break;
    case 3:
      chin(0.018, 0.026);
      break;
    case 4:
      head.add(shell(H, JAW, 0.012, m));
      break;
    case 5:
      head.add(shell(H, JAW, 0.02, m));
      stache();
      chin(0.03, 0.03);
      break;
    case 6:
      head.add(shell(H, JAW, 0.02, m));
      stache();
      chain(
        [
          [0, -0.13, 0.08],
          [0, -0.2, 0.09],
          [0, -0.29, 0.1],
          [0, -0.37, 0.1]
        ],
        0.04,
        0.006,
        m,
        head
      );
      break;
    case 7:
      head.add(shell(H, (x, y, z) => Math.abs(x) > 0.7 && y < 0.1 && y > -0.55 && z > -0.2, 0.014, m));
      stache();
      break;
    case 8:
      head.add(
        shell(
          H,
          (x, y, z) => y < -0.2 && y > -0.99 && z > -0.2 && (Math.abs(x) > 0.75 || y < -0.78),
          0.013,
          m
        )
      );
      break;
    case 9:
      chin(0.016, 0.022);
      for (const side of [-1, 1])
        chain(
          [
            [side * 0.012, -0.14, 0.1],
            [side * 0.016, -0.22, 0.115],
            [side * 0.012, -0.3, 0.12],
            [side * 0.006, -0.37, 0.11]
          ],
          0.012,
          0.006,
          m,
          head
        );
      break;
  }
}

export { JAW, beard };
