/* LAST REFUGE · XM — Coiffures : 14 (homme), 13 (femme), 10 (autres).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { chain, ell, mat, mk, rnd, sh, spike } from '../outils/outils-3d.js';
import { R, shell } from '../tete/tete.js';

const HSEQ = {
  male: [
    null,
    'short',
    'buzz',
    'undercut',
    'spiky',
    'pomp',
    'quiff',
    'mid',
    'long',
    'pony',
    'bun',
    'mohawk',
    'afro',
    'curly'
  ],
  female: [
    null,
    'short',
    'bob',
    'bobLong',
    'long',
    'curlyLong',
    'pony',
    'pigtails',
    'bun',
    'braids',
    'bangsLong',
    'mid',
    'afro'
  ],
  other: [null, 'short', 'spiky', 'mohawk', 'long', 'bun', 'braids', 'afro', 'curly', 'pony']
};
const hcap = (C, f, b, off) =>
  C.head.add(shell(C.H, (x, y, z) => y > (z > 0 ? f : b) && !(Math.abs(x) > 0.9 && y < 0.15), off, C.hairM));
const hback = (C, len, top = 0.03) => {
  const r = R * C.H.sx * 1.02,
    o = mk(
      new THREE.CylinderGeometry(r, r * 0.92, len, 24, 1, true, Math.PI * 0.5 - 0.45, Math.PI + 0.9),
      C.hairD,
      0,
      top - len / 2,
      0,
      C.head
    );
  o.scale.z = C.H.sz * 0.98;
  return o;
};
const hring = (C, len) => {
  const r = R * C.H.sx * 1.05,
    o = mk(
      new THREE.CylinderGeometry(r, r * 1.03, len, 24, 1, true, 0.55, Math.PI * 2 - 1.1),
      C.hairD,
      0,
      0.01 - len / 2,
      0,
      C.head
    );
  o.scale.z = C.H.sz * 1.0;
  return o;
};
function capPts(n, ymin) {
  const a = [];
  for (let i = 0; i < n; i++) {
    const uy = ymin + (0.98 - ymin) * rnd(),
      r = Math.sqrt(1 - uy * uy),
      an = rnd() * Math.PI * 2;
    a.push([r * Math.cos(an), uy, r * Math.sin(an)]);
  }
  return a;
}
function spikesAt(C, pts, len, r, m = C.hairM) {
  for (const p of pts) {
    const l = Math.hypot(p[0], p[1], p[2]),
      d = [p[0] / l, p[1] / l, p[2] / l],
      q = C.H.def(d[0], d[1], d[2]);
    spike([q[0] - d[0] * 0.01, q[1] - d[1] * 0.01, q[2] - d[2] * 0.01], d, r, len, m, C.head);
  }
}
const midline = (n, a0, a1) => {
  const a = [];
  for (let i = 0; i < n; i++) {
    const t = a0 + ((a1 - a0) * i) / (n - 1);
    a.push([0, Math.sin(t), Math.cos(t)]);
  }
  return a;
};
const HS = {
  buzz: (C) => hcap(C, 0.35, -0.1, 0.008),
  short: (C) => hcap(C, 0.3, -0.2, 0.02),
  undercut: (C) => {
    hcap(C, 0.32, 0.25, 0.022);
    ell(0.1, 0.055, 0.12, C.hairM, 0, 0.125, 0.005, C.head);
  },
  spiky: (C) => {
    hcap(C, 0.3, -0.15, 0.016);
    spikesAt(C, capPts(18, 0.3), 0.07, 0.02);
  },
  pomp: (C) => {
    hcap(C, 0.3, -0.1, 0.02);
    const o = ell(0.11, 0.07, 0.14, C.hairM, 0, 0.145, 0.045, C.head);
    o.rotation.x = -0.2;
  },
  quiff: (C) => {
    hcap(C, 0.3, -0.1, 0.02);
    const o = ell(0.1, 0.06, 0.11, C.hairM, 0, 0.15, 0.07, C.head);
    o.rotation.x = -0.35;
  },
  mid: (C) => {
    hcap(C, 0.25, -0.45, 0.03);
    hback(C, 0.12);
  },
  long: (C) => {
    hcap(C, 0.22, -0.6, 0.03);
    hback(C, C.fem ? 0.46 : 0.34);
    if (C.fem) for (const side of [-1, 1]) ell(0.026, 0.17, 0.02, C.hairM, side * 0.125, -0.1, 0.04, C.head);
  },
  curlyLong: (C) => {
    HS.curly(C);
    hback(C, 0.34);
    for (const side of [-1, 1]) ell(0.03, 0.16, 0.03, C.hairM, side * 0.125, -0.08, 0.03, C.head);
  },
  bangsLong: (C) => {
    hcap(C, 0.08, -0.6, 0.03);
    hback(C, 0.4);
  },
  bob: (C) => {
    hcap(C, 0.25, -0.4, 0.03);
    hring(C, 0.12);
  },
  bobLong: (C) => {
    hcap(C, 0.25, -0.4, 0.03);
    hring(C, 0.22);
  },
  pony: (C) => {
    hcap(C, 0.28, -0.3, 0.025);
    const m = C.hairM;
    chain(
      [
        [0, 0.08, -0.13],
        [0, 0.03, -0.2],
        [0, -0.06, -0.23],
        [0, -0.18, -0.21],
        [0, -0.3, -0.18]
      ],
      0.034,
      0.012,
      m,
      C.head
    );
    ell(0.04, 0.02, 0.04, mat(sh(C.hairHex, -0.4)), 0, 0.075, -0.13, C.head);
  },
  bun: (C) => {
    hcap(C, 0.28, -0.3, 0.025);
    ell(0.065, 0.06, 0.065, C.hairM, 0, 0.15, -0.07, C.head);
  },
  pigtails: (C) => {
    hcap(C, 0.28, -0.3, 0.025);
    for (const side of [-1, 1]) {
      chain(
        [
          [side * 0.11, 0.08, -0.05],
          [side * 0.15, 0.0, -0.07],
          [side * 0.16, -0.1, -0.06],
          [side * 0.15, -0.2, -0.04]
        ],
        0.032,
        0.014,
        C.hairM,
        C.head
      );
      ell(0.03, 0.02, 0.03, mat('#c0392b'), side * 0.115, 0.08, -0.05, C.head);
    }
  },
  braids: (C) => {
    hcap(C, 0.25, -0.5, 0.028);
    for (const side of [-1, 1])
      for (let i = 0; i < 7; i++)
        ell(
          0.022,
          0.03,
          0.02,
          C.hairM,
          side * (0.115 + 0.004 * i),
          -0.03 - i * 0.045,
          0.05 + 0.012 * i,
          C.head
        );
  },
  mohawk: (C) => {
    hcap(C, 0.62, 0.55, 0.012);
    spikesAt(C, midline(9, 0.55, 2.7), 0.1, 0.026);
  },
  afro: (C) => {
    ell(0.2, 0.19, 0.17, C.hairM, 0, 0.06, -0.03, C.head);
  },
  curly: (C) => {
    hcap(C, 0.28, -0.3, 0.022);
    for (const p of capPts(46, 0.2)) {
      const q = C.H.def(p[0], p[1], p[2]);
      ell(0.024, 0.024, 0.024, C.hairM, q[0] * 1.07, q[1] * 1.07, q[2] * 1.07, C.head);
    }
  }
};
function hair(C) {
  const k = HSEQ[C.g][C.s.hair];
  if (k) HS[k](C);
}

export { HSEQ, hcap, hback, hring, capPts, spikesAt, midline, HS, hair };
