/* LAST REFUGE · XM — Oreilles (humaines, pointues, félines).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import { ell, mat, spike } from '../outils/outils-3d.js';
import { R } from '../tete/tete.js';

function ears(C) {
  const { head, H, sp } = C;
  if (sp.ears === 'none') return;
  for (const side of [-1, 1]) {
    const x = side * R * H.sx * 0.96;
    if (sp.ears === 'pointed') {
      const o = spike([x, -0.005, -0.012], [side * 0.9, 0.45, 0], 0.026, 0.1, C.skin, head);
    } else if (sp.ears === 'cat') {
      spike([side * 0.075, 0.115, -0.01], [side * 0.35, 1, 0], 0.045, 0.1, C.skin, head);
      spike([side * 0.075, 0.118, -0.005], [side * 0.35, 1, 0], 0.028, 0.085, mat('#d98a98'), head);
    } else {
      const e = ell(0.012, 0.03, 0.021, C.skin, x + side * 0.006, -0.012, -0.012, head);
      e.rotation.z = side * 0.1;
    }
  }
}

export { ears };
