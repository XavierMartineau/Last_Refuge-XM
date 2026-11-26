/* LAST REFUGE · XM — Lunettes et visières (11 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { metal } from '../materiaux/materiaux.js';
import { box, cyl, ell, glowM, limb, mat, mk } from '../outils/outils-3d.js';
import { R } from '../tete/tete.js';

function glasses(C) {
  const gI = C.s.glasses;
  if (!gI) return;
  const { head, H } = C,
    fr = metal('#2a2a2a', 0.4),
    gl = mat('#1a1a1a', { roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.85 }),
    clear = mat('#cfe8ff', { roughness: 0.05, transparent: true, opacity: 0.28, depthWrite: false });
  const ez = H.surf(0.05, 0.015) + 0.014,
    lensM = [
      null,
      clear,
      clear,
      gl,
      gl,
      gl,
      clear,
      gl,
      null,
      mat('#4a7a8a', { roughness: 0.1, transparent: true, opacity: 0.6 }),
      glowM('#ff3030', 1.2),
      clear
    ][gI];
  const ring = (x, r, sx = 1, sy = 1, thk = 0.0035) => {
    const t = mk(new THREE.TorusGeometry(r, thk, 8, 24), fr, x, 0.015, ez, head);
    t.scale.set(sx, sy, 1);
    return t;
  };
  const lens = (x, r, sx = 1, sy = 1) => {
    if (!lensM) return;
    const o = new THREE.Mesh(new THREE.CircleGeometry(r, 24), lensM);
    o.position.set(x, 0.015, ez - 0.001);
    o.scale.set(sx, sy, 1);
    head.add(o);
  };
  const temples = () => {
    for (const side of [-1, 1]) {
      const x = side * 0.075;
      limb([x, 0.015, ez - 0.004], [side * R * H.sx * 0.95, 0.01, -0.01], 0.0025, 0.0025, fr, head);
    }
  };
  switch (gI) {
    case 1:
      for (const s of [-1, 1]) {
        ring(s * 0.05, 0.026);
        lens(s * 0.05, 0.026);
      }
      box(0.02, 0.004, 0.004, fr, 0, 0.02, ez, head);
      temples();
      break;
    case 2:
      for (const s of [-1, 1]) {
        const b = box(0.052, 0.038, 0.004, fr, s * 0.05, 0.015, ez, head);
        lens(s * 0.05, 0.02, 1.2, 0.9);
      }
      temples();
      break;
    case 3:
      for (const s of [-1, 1]) {
        const t = ring(s * 0.05, 0.03, 1.1, 0.95);
        lens(s * 0.05, 0.03, 1.1, 0.95);
      }
      box(0.025, 0.004, 0.004, fr, 0, 0.025, ez, head);
      temples();
      break;
    case 4:
      for (const s of [-1, 1]) {
        box(0.056, 0.034, 0.006, gl, s * 0.05, 0.013, ez, head);
      }
      box(0.03, 0.006, 0.006, fr, 0, 0.02, ez, head);
      temples();
      break;
    case 5:
      for (const s of [-1, 1]) {
        ring(s * 0.05, 0.025, 1.15, 0.9, 0.005);
        lens(s * 0.05, 0.025, 1.15, 0.9);
      }
      limb([-0.075, 0.015, ez - 0.004], [-R * H.sx * 0.95, 0.01, -0.01], 0.004, 0.004, mat('#2c3a2c'), head);
      limb([0.075, 0.015, ez - 0.004], [R * H.sx * 0.95, 0.01, -0.01], 0.004, 0.004, mat('#2c3a2c'), head);
      break;
    case 6:
      ring(0.05, 0.027);
      lens(0.05, 0.027);
      limb([0.05, -0.012, ez], [0.06, -0.1, ez + 0.03], 0.0012, 0.0012, metal('#b0a070'), head);
      break;
    case 7: {
      const v = mk(
        new THREE.CylinderGeometry(R * H.sx * 1.02, R * H.sx * 1.02, 0.05, 24, 1, true, -0.9, 1.8),
        mat('#2b3d52', { roughness: 0.1, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
        0,
        0.015,
        0,
        head
      );
      v.scale.z = H.sz;
      break;
    }
    case 8: {
      const p = box(0.06, 0.045, 0.006, mat('#111'), -0.05, 0.015, ez, head);
      p.rotation.z = 0.1;
      limb([-0.075, 0.015, ez - 0.004], [-R * H.sx * 0.95, 0.01, -0.01], 0.003, 0.003, mat('#111'), head);
      limb([-0.07, 0.03, ez - 0.002], [0.07, 0.05, ez - 0.002], 0.002, 0.002, mat('#111'), head);
      ell(0.012, 0.012, 0.004, fr, 0.05, 0.015, ez - 0.002, head);
      break;
    }
    case 9:
      for (const s of [-1, 1]) {
        ring(s * 0.05, 0.028, 1, 1, 0.007);
        lens(s * 0.05, 0.028);
        cyl(
          0.033,
          0.033,
          0.01,
          mat('#7a6a4a', { metalness: 0.6, roughness: 0.4 }),
          s * 0.05,
          0.015,
          ez - 0.004,
          head,
          18
        ).rotation.x = Math.PI / 2;
      }
      limb([-0.075, 0.015, ez], [-R * H.sx * 0.95, 0.01, -0.01], 0.005, 0.005, mat('#3a2a1a'), head);
      limb([0.075, 0.015, ez], [R * H.sx * 0.95, 0.01, -0.01], 0.005, 0.005, mat('#3a2a1a'), head);
      break;
    case 10: {
      const v = box(0.14, 0.034, 0.008, glowM('#ff3030', 1.3), 0, 0.015, ez, head);
      v.scale.z = 1;
      box(0.145, 0.04, 0.004, fr, 0, 0.015, ez - 0.004, head);
      temples();
      break;
    }
    case 11:
      for (const s of [-1, 1]) {
        const t = mk(new THREE.TorusGeometry(0.025, 0.003, 8, 16, Math.PI), fr, s * 0.05, 0.018, ez, head);
        t.rotation.z = Math.PI;
        lens(s * 0.05, 0.02, 1, 0.5);
      }
      box(0.02, 0.004, 0.004, fr, 0, 0.025, ez, head);
      temples();
      break;
  }
}

export { glasses };
