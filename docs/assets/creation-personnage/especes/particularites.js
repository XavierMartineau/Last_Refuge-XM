/* LAST REFUGE · XM — Particularités des personnages « Autres » : ailes, queues, cornes, antennes, marques.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { D } from '../donnees/donnees.js';
import { chain, ell, glowM, grp, limb, mat, mk, rnd, sh, spike, tube } from '../outils/outils-3d.js';
import { dDot, dStroke, dctx } from '../tete/decalques.js';
import { R } from '../tete/tete.js';

function specials(C) {
  const { head, body, sp } = C;
  const dk = mat('#2a2230', { roughness: 0.7, side: THREE.DoubleSide }),
    mem = mat('#3a2a46', { roughness: 0.65, side: THREE.DoubleSide });
  // ailes / appendices du dos (specialBack 1..3) — l’espèce peut aussi en imposer
  const sb = C.s.specialBack,
    wing = sb || (sp.wings === 'bat' ? 1 : sp.wings === 'thin' ? 2 : 0);
  const wg = (kind, side) => {
    const g = grp(side * 0.06, 1.28, -0.1, body);
    g.rotation.y = side * 0.5;
    if (kind === 1 || kind === 2) {
      // chauve-souris / fines
      const rib = [
        [0, 0, 0],
        [side * 0.3, 0.22, -0.05],
        [side * 0.7, 0.34, -0.12],
        [side * 1.05, 0.28, -0.2]
      ];
      chain(
        rib.map((p) => [p[0], p[1], p[2]]),
        0.02,
        0.008,
        dk,
        g
      );
      const sh2 = new THREE.Shape();
      sh2.moveTo(0, 0);
      sh2.lineTo(side * 0.3, 0.22);
      sh2.lineTo(side * 0.7, 0.34);
      sh2.lineTo(side * 1.05, 0.28);
      sh2.lineTo(side * 0.8, -0.1);
      sh2.lineTo(side * 0.5, 0.0);
      sh2.lineTo(side * 0.3, -0.25);
      sh2.lineTo(0, -0.3);
      const wm = mk(
        new THREE.ShapeGeometry(sh2),
        kind === 2
          ? mat('#cfd8e8', { roughness: 0.4, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
          : mem,
        0,
        0,
        -0.05,
        g
      );
      wm.castShadow = false;
    } else if (kind === 3) {
      // plumes
      for (let i = 0; i < 9; i++) {
        const t = i / 8,
          a = 0.2 + t * 0.9,
          len = 0.5 - 0.18 * Math.abs(t - 0.35);
        limb(
          [side * 0.02, 0.05 - t * 0.1, -0.02],
          [side * Math.cos(a) * len, Math.sin(a) * len * 0.7 + 0.1 - t * 0.3, -0.04 - t * 0.01],
          0.025,
          0.003,
          mat('#e9e4d8', { roughness: 0.8 }),
          g
        );
      }
    }
    return g;
  };
  if (wing === 1 || wing === 2 || wing === 3) for (const s of [-1, 1]) wg(wing, s);
  if (sb === 3) {
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.35;
      tube(
        [
          [0, 1.2, -0.1],
          [Math.sin(a) * 0.2, 1.3, -0.28],
          [Math.sin(a) * 0.4, 1.15, -0.4],
          [Math.sin(a) * 0.5, 0.95, -0.36]
        ],
        0.02,
        mat('#5a3a5a', { roughness: 0.6 }),
        body,
        16,
        6
      );
    }
  } // appendices mutants
  // queue
  if (sp.tail) {
    const m = sp.tail === 'cat' ? C.hairM : mat(sh(D.HUMAN[C.s.skin] || '#6a8a5a', -0.1), { roughness: 0.7 });
    tube(
      [
        [0, 0.95, -0.12],
        [0, 0.85, -0.3],
        [0.12, 0.7, -0.42],
        [0.3, 0.78, -0.5],
        [0.38, 0.98, -0.45]
      ],
      0.035,
      m,
      body,
      24,
      8
    );
  }
  // cornes / antennes / crête (specialHead 1..3 ou imposées)
  const shd = C.s.specialHead || (sp.horns ? 1 : sp.antenna ? 2 : sp.crest ? 3 : 0),
    hm = mat('#d8cfb4', { roughness: 0.5 });
  if (shd === 1)
    for (const s of [-1, 1]) {
      chain(
        [
          [s * 0.07, 0.1, 0],
          [s * 0.11, 0.18, 0.0],
          [s * 0.13, 0.26, 0.02],
          [s * 0.1, 0.33, 0.04]
        ],
        0.026,
        0.006,
        hm,
        head
      );
    }
  if (shd === 2)
    for (const s of [-1, 1]) {
      tube(
        [
          [s * 0.05, 0.13, 0.03],
          [s * 0.07, 0.22, 0.05],
          [s * 0.1, 0.3, 0.02]
        ],
        0.005,
        mat('#222'),
        head,
        10,
        5
      );
      ell(0.014, 0.014, 0.014, glowM('#6fffa0', 1.8), s * 0.1, 0.31, 0.02, head);
    }
  if (shd === 3)
    for (let i = 0; i < 7; i++) {
      const t = i / 6,
        a = 0.4 + t * 2.0;
      spike(
        [0, Math.sin(a) * R * 0.95, Math.cos(a) * R * 0.95],
        [0, Math.sin(a), Math.cos(a)],
        0.017 - 0.004 * t,
        0.07 - 0.02 * Math.abs(t - 0.5),
        mat('#4a7a4a', { roughness: 0.5 }),
        head
      );
    }
  // défense du « Mutant massif »
  if (sp.tusks)
    for (const s of [-1, 1])
      spike([s * 0.03, -0.085, C.H.surf(s * 0.03, -0.085)], [s * 0.2, 1, 0.3], 0.012, 0.05, hm, head);
  if (sp.fangs)
    for (const s of [-1, 1])
      spike([s * 0.012, -0.07, C.H.surf(s * 0.012, -0.07)], [0, -1, 0.1], 0.004, 0.015, mat('#f4f1e6'), head);
  // détails spéciaux (visage) specialFace 1..3
  const sf = C.s.specialFace,
    ctx = dctx(C, sf === 2 ? 'glow' : 'base');
  if (sf === 1) {
    dStroke(
      C,
      ctx,
      [
        [-0.09, 0.06],
        [-0.05, 0.0],
        [-0.02, -0.05]
      ],
      'rgba(120,30,30,.9)',
      0.006
    );
    dStroke(
      C,
      ctx,
      [
        [0.08, 0.1],
        [0.06, 0.03],
        [0.09, -0.03]
      ],
      'rgba(120,30,30,.9)',
      0.006
    );
  }
  if (sf === 2) {
    dStroke(
      C,
      ctx,
      [
        [0.09, 0.08],
        [0.12, 0.02],
        [0.1, -0.05],
        [0.06, -0.09]
      ],
      'rgba(120,255,200,1)',
      0.007
    );
    dDot(C, ctx, 0.12, 0.02, 0.008, 'rgba(255,255,255,1)');
  }
  if (sf === 3) {
    for (const [x, y] of [
      [-0.07, 0.0],
      [0.08, 0.04],
      [0.0, -0.1],
      [-0.09, 0.08],
      [0.05, -0.07]
    ])
      dDot(C, ctx, x, y, 0.011, 'rgba(60,220,120,.55)');
  }
  // zombie : peau terne, cicatrices
  if (sp.zombie) {
    const z = dctx(C);
    dStroke(
      C,
      z,
      [
        [-0.1, 0.08],
        [-0.04, 0.04],
        [-0.06, -0.02]
      ],
      'rgba(60,40,40,.85)',
      0.006
    );
    dDot(C, z, 0.06, -0.03, 0.03, 'rgba(70,90,60,.5)', 0.7);
  }
  if (sp.cyber) {
    const z = dctx(C, 'glow');
    dStroke(
      C,
      z,
      [
        [0.06, 0.1],
        [0.12, 0.07],
        [0.12, -0.03]
      ],
      'rgba(255,60,60,1)',
      0.005
    );
    dStroke(
      C,
      z,
      [
        [0.12, 0.03],
        [0.15, 0.03]
      ],
      'rgba(255,60,60,1)',
      0.004
    );
  }
  if (sp.scales) {
    const z = dctx(C);
    for (let i = 0; i < 14; i++) {
      const x = (rnd() - 0.5) * 0.2,
        y = (rnd() - 0.5) * 0.2;
      dDot(C, z, x, y, 0.008, 'rgba(30,70,30,.25)');
    }
  }
}

export { specials };
