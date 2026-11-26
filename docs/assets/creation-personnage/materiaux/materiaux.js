/* LAST REFUGE · XM — Matériaux PBR procéduraux : peau, tissu, camouflages, cuir, métal, polymère, bois et yeux.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { MC, TEXC, cvs, mkTex } from '../outils/outils-3d.js';
import { px } from '../tete/decalques.js';
import { R } from '../tete/tete.js';

const _vn = (size, cell) => {
  const n = Math.max(1, Math.ceil(size / cell)),
    g = Array.from({ length: n * n }, () => Math.random());
  return (i, j) => {
    const x = i / cell,
      y = j / cell,
      x0 = Math.floor(x),
      y0 = Math.floor(y),
      fx = x - x0,
      fy = y - y0,
      sx = fx * fx * (3 - 2 * fx),
      sy = fy * fy * (3 - 2 * fy),
      X0 = x0 % n,
      X1 = (x0 + 1) % n,
      Y0 = y0 % n,
      Y1 = (y0 + 1) % n;
    const a = g[Y0 * n + X0],
      b = g[Y0 * n + X1],
      c = g[Y1 * n + X0],
      d = g[Y1 * n + X1];
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
};
function _hmap(size, fn) {
  const h = new Float32Array(size * size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) h[j * size + i] = fn(i, j);
  return h;
}
function _normalTex(h, size, strength, rx, ry) {
  const c = cvs(size, size),
    x = c.getContext('2d'),
    id = x.createImageData(size, size),
    W = size;
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const L = h[j * W + ((i + W - 1) % W)],
        R = h[j * W + ((i + 1) % W)],
        U = h[((j + W - 1) % W) * W + i],
        Dn = h[((j + 1) % W) * W + i];
      let nx = (L - R) * strength,
        ny = (Dn - U) * strength,
        nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l;
      ny /= l;
      nz /= l;
      const o = (j * W + i) * 4;
      id.data[o] = (nx * 0.5 + 0.5) * 255;
      id.data[o + 1] = (ny * 0.5 + 0.5) * 255;
      id.data[o + 2] = (nz * 0.5 + 0.5) * 255;
      id.data[o + 3] = 255;
    }
  x.putImageData(id, 0, 0);
  return mkTex(c, rx, ry, false);
}
function _grayTex(h, size, lo, hi, rx, ry) {
  const c = cvs(size, size),
    x = c.getContext('2d'),
    id = x.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = (lo + (hi - lo) * h[i]) * 255;
    id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
    id.data[i * 4 + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  return mkTex(c, rx, ry, false);
}
const _cache = (k, f) => {
  if (TEXC.has(k)) return TEXC.get(k);
  const v = f();
  TEXC.set(k, v);
  return v;
};
const skinNorm = () =>
  _cache('skinN', () => {
    const S = 256,
      n1 = _vn(S, 4),
      n2 = _vn(S, 16),
      n3 = _vn(S, 64),
      pores = [];
    for (let k = 0; k < 900; k++)
      pores.push([Math.random() * S, Math.random() * S, 0.8 + Math.random() * 1.4]);
    const h = _hmap(S, (i, j) => 0.35 * n1(i, j) + 0.3 * n2(i, j) + 0.35 * n3(i, j));
    pores.forEach(([px, py, r]) => {
      for (let dj = -3; dj <= 3; dj++)
        for (let di = -3; di <= 3; di++) {
          const d = Math.hypot(di, dj);
          if (d < r * 2) {
            const ii = ((px | 0) + di + S) % S,
              jj = ((py | 0) + dj + S) % S;
            h[jj * S + ii] -= 0.5 * Math.exp((-d * d) / (r * r));
          }
        }
    });
    return _normalTex(h, S, 3.2, 5, 3);
  });
const skinRough = () =>
  _cache('skinR', () => {
    const S = 128,
      n = _vn(S, 16),
      n2 = _vn(S, 4);
    return _grayTex(
      _hmap(S, (i, j) => 0.7 * n(i, j) + 0.3 * n2(i, j)),
      S,
      0.78,
      1,
      2,
      2
    );
  });
const skinMat = (hex) =>
  new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness: 0.62,
    roughnessMap: skinRough(),
    normalMap: skinNorm(),
    normalScale: new THREE.Vector2(0.55, 0.55),
    sheen: 0.6,
    sheenColor: new THREE.Color('#ffd8c8'),
    sheenRoughness: 0.55,
    clearcoat: 0.07,
    clearcoatRoughness: 0.45
  });
const twillNorm = () =>
  _cache('twillN', () => {
    const S = 128,
      n = _vn(S, 2);
    const h = _hmap(
      S,
      (i, j) =>
        0.5 +
        0.35 * Math.sin(((i + j) * Math.PI) / 2) * (((i >> 1) + (j >> 1)) % 2 ? 1 : 0.55) +
        0.15 * n(i, j)
    );
    return _normalTex(h, S, 3.6, 9, 9);
  });
const fab = (hex, kind = 0, o = {}) =>
  new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    map: fabricTex(kind, hex),
    normalMap: twillNorm(),
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughness: 0.96,
    envMapIntensity: 0.55,
    sheen: 0.35,
    sheenColor: new THREE.Color(hex || '#888').lerp(new THREE.Color('#ffffff'), 0.15),
    sheenRoughness: 0.8,
    ...o
  });
const leatherNorm = () =>
  _cache('leatherN', () => {
    const S = 256,
      P = [];
    for (let k = 0; k < 110; k++) P.push([Math.random() * S, Math.random() * S]);
    const h = _hmap(S, (i, j) => {
      let d1 = 1e9,
        d2 = 1e9;
      for (const [px, py] of P) {
        let dx = Math.abs(i - px),
          dy = Math.abs(j - py);
        dx = Math.min(dx, S - dx);
        dy = Math.min(dy, S - dy);
        const d = dx * dx + dy * dy;
        if (d < d1) {
          d2 = d1;
          d1 = d;
        } else if (d < d2) d2 = d;
      }
      return Math.min(1, (Math.sqrt(d2) - Math.sqrt(d1)) / 5);
    });
    return _normalTex(h, S, 2.6, 4, 4);
  });
const leather = (hex, r = 0.55) =>
  new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness: r + 0.08,
    roughnessMap: skinRough(),
    normalMap: leatherNorm(),
    normalScale: new THREE.Vector2(0.9, 0.9),
    clearcoat: 0.12,
    clearcoatRoughness: 0.5,
    metalness: 0.02
  });
const metalNorm = () =>
  _cache('metalN', () => {
    const S = 256,
      row = Float32Array.from({ length: S }, () => Math.random()),
      n = _vn(S, 32);
    const h = _hmap(S, (i, j) => 0.55 * row[j] + 0.2 * n(i, j) + 0.25 * Math.random() * 0.5);
    for (let k = 0; k < 70; k++) {
      let x = Math.random() * S,
        y = Math.random() * S;
      const a = Math.random() * Math.PI,
        l = 15 + Math.random() * 60,
        dx = Math.cos(a),
        dy = Math.sin(a);
      for (let t = 0; t < l; t++) {
        const ii = (Math.floor(x + dx * t) + S) % S,
          jj = (Math.floor(y + dy * t) + S) % S;
        h[jj * S + ii] -= 0.5;
      }
    }
    return _normalTex(h, S, 1.8, 3, 3);
  });
const metalRough = () =>
  _cache('metalR', () => {
    const S = 256,
      n = _vn(S, 8),
      row = Float32Array.from({ length: S }, () => Math.random());
    return _grayTex(
      _hmap(S, (i, j) => 0.5 * n(i, j) + 0.5 * row[j]),
      S,
      0.6,
      1,
      3,
      3
    );
  });
const metal = (c, r = 0.35) => {
  const k = 'mt' + c + r;
  if (MC.has(k)) return MC.get(k);
  const m = new THREE.MeshPhysicalMaterial({
    color: c,
    metalness: 0.92,
    roughness: r + 0.2,
    roughnessMap: metalRough(),
    normalMap: metalNorm(),
    normalScale: new THREE.Vector2(0.45, 0.45),
    envMapIntensity: 1.25,
    anisotropy: 0.55
  });
  MC.set(k, m);
  return m;
};
function _wearTex(hex) {
  return _cache('wear' + hex, () => {
    const S = 256,
      c = cvs(S, S),
      x = c.getContext('2d');
    x.fillStyle = hex;
    x.fillRect(0, 0, S, S);
    const base = new THREE.Color(hex),
      lt = base.clone().lerp(new THREE.Color('#aab0b0'), 0.6).getStyle(),
      dk = base.clone().multiplyScalar(0.55).getStyle();
    for (let i = 0; i < 260; i++) {
      x.strokeStyle = Math.random() < 0.65 ? lt : dk;
      x.globalAlpha = 0.12 + Math.random() * 0.3;
      x.lineWidth = 0.5 + Math.random() * 1.2;
      const px = Math.random() * S,
        py = Math.random() * S,
        a = Math.random() * Math.PI,
        l = 6 + Math.random() * 40;
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l);
      x.stroke();
    }
    for (let i = 0; i < 40; i++) {
      x.globalAlpha = 0.1;
      x.fillStyle = Math.random() < 0.5 ? lt : dk;
      x.beginPath();
      x.arc(Math.random() * S, Math.random() * S, 3 + Math.random() * 14, 0, 6.3);
      x.fill();
    }
    x.globalAlpha = 1;
    return mkTex(c, 3, 3);
  });
}
const gunPaint = (hex) => {
  const k = 'gp' + hex;
  if (MC.has(k)) return MC.get(k);
  const m = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    map: _wearTex(hex),
    metalness: 0.75,
    roughness: 0.62,
    roughnessMap: metalRough(),
    normalMap: metalNorm(),
    normalScale: new THREE.Vector2(0.4, 0.4),
    clearcoat: 0.15,
    clearcoatRoughness: 0.4,
    envMapIntensity: 1.15,
    anisotropy: 0.4
  });
  MC.set(k, m);
  return m;
};
const polyNorm = () =>
  _cache('polyN', () => {
    const S = 128,
      n = _vn(S, 2);
    return _normalTex(
      _hmap(S, (i, j) => 0.6 * Math.random() + 0.4 * n(i, j)),
      S,
      2.4,
      6,
      6
    );
  });
const polyMat = (hex) => {
  const k = 'pl' + hex;
  if (MC.has(k)) return MC.get(k);
  const m = new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness: 0.7,
    normalMap: polyNorm(),
    normalScale: new THREE.Vector2(0.8, 0.8),
    sheen: 0.3,
    sheenColor: new THREE.Color('#556'),
    sheenRoughness: 0.6
  });
  MC.set(k, m);
  return m;
};
const woodMat = () =>
  _cache('woodM', () => {
    const S = 256,
      c = cvs(S, S),
      x = c.getContext('2d'),
      n = _vn(S, 32),
      h = new Float32Array(S * S);
    const id = x.createImageData(S, S);
    for (let j = 0; j < S; j++)
      for (let i = 0; i < S; i++) {
        const w = Math.sin((j + n(i, j) * 40) * 0.18) * 0.5 + 0.5,
          f = 0.5 * w + 0.5 * _n2(i, j),
          o = (j * S + i) * 4;
        h[j * S + i] = w * 0.6 + (Math.random() - 0.5) * 0.25;
        id.data[o] = 100 + f * 55;
        id.data[o + 1] = 60 + f * 38;
        id.data[o + 2] = 28 + f * 20;
        id.data[o + 3] = 255;
      }
    x.putImageData(id, 0, 0);
    const t = mkTex(c, 1, 1);
    const m = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      map: t,
      roughness: 0.55,
      normalMap: _normalTex(h, S, 2.2, 1, 1),
      normalScale: new THREE.Vector2(0.6, 0.6),
      clearcoat: 0.25,
      clearcoatRoughness: 0.35
    });
    return m;
    function _n2(i, j) {
      return n((i * 3) % S, j);
    }
  });
const scleraMat = () =>
  _cache(
    'sclera',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#efe9df',
        roughness: 0.32,
        clearcoat: 0.5,
        clearcoatRoughness: 0.15
      })
  );
const corneaMat = () =>
  _cache(
    'cornea',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.1,
        roughness: 0.02,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.6,
        depthWrite: false
      })
  );
const irisMat = (col) =>
  _cache('iris' + col, () => {
    const S = 128,
      c = cvs(S, S),
      x = c.getContext('2d'),
      base = new THREE.Color(col),
      lt = base.clone().lerp(new THREE.Color('#ffffff'), 0.35).getStyle(),
      dk = base.clone().multiplyScalar(0.45).getStyle();
    x.fillStyle = base.getStyle();
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 220; i++) {
      const a = Math.random() * 6.283,
        r0 = S * (0.1 + Math.random() * 0.12),
        r1 = S * (0.32 + Math.random() * 0.18);
      x.strokeStyle = Math.random() < 0.5 ? lt : dk;
      x.globalAlpha = 0.25 + Math.random() * 0.4;
      x.lineWidth = 0.6 + Math.random() * 1.4;
      x.beginPath();
      x.moveTo(S / 2 + Math.cos(a) * r0, S / 2 + Math.sin(a) * r0);
      x.lineTo(S / 2 + Math.cos(a) * r1, S / 2 + Math.sin(a) * r1);
      x.stroke();
    }
    x.globalAlpha = 1;
    const g = x.createRadialGradient(S / 2, S / 2, S * 0.28, S / 2, S / 2, S * 0.5);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.8, 'rgba(0,0,0,.35)');
    g.addColorStop(1, 'rgba(0,0,0,.85)');
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    const g2 = x.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S * 0.2);
    g2.addColorStop(0, 'rgba(0,0,0,.7)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g2;
    x.fillRect(0, 0, S, S);
    return new THREE.MeshStandardMaterial({ color: '#ffffff', map: mkTex(c), roughness: 0.28 });
  });
const CAMO = [
  null,
  ['#4b5a32', '#2f3a22', '#6b5a3a', '#1a1a14'],
  ['#c2a878', '#a88e5e', '#8c7448', '#d8c8a0'],
  ['#6a6d70', '#4a4d50', '#2e3032', '#8c8f92'],
  ['#51603f', '#2c3426', '#7a7d5a', '#16180f'],
  ['#e8eef0', '#c8d4d8', '#9aa8ae', '#f4f8fa']
];
function fabricTex(kind, hex) {
  const key = 'f' + kind + hex;
  if (TEXC.has(key)) return TEXC.get(key);
  const c = cvs(256, 256),
    x = c.getContext('2d');
  x.fillStyle = kind ? CAMO[kind][0] : hex;
  x.fillRect(0, 0, 256, 256);
  if (kind) {
    const pal = CAMO[kind];
    for (let i = 0; i < 120; i++) {
      x.fillStyle = pal[1 + (i % 3)];
      const cx = Math.random() * 256,
        cy = Math.random() * 256;
      if (kind === 4) {
        const s = (8 + Math.random() * 16) | 0;
        x.fillRect(((cx / 8) | 0) * 8, ((cy / 8) | 0) * 8, s, s);
      } else {
        x.beginPath();
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * 6.283,
            r = 10 + Math.random() * 26;
          x.lineTo(cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 0.8);
        }
        x.closePath();
        x.fill();
      }
    }
  } else {
    for (let i = 0; i < 40; i++) {
      x.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.04)';
      x.fillRect(Math.random() * 256, Math.random() * 256, 30 + Math.random() * 60, 20 + Math.random() * 40);
    }
  }
  x.globalAlpha = 0.08;
  x.fillStyle = '#000';
  for (let i = 0; i < 256; i += 2) x.fillRect(i, 0, 1, 256);
  x.fillStyle = '#fff';
  for (let j = 0; j < 256; j += 2) x.fillRect(0, j, 256, 1);
  x.globalAlpha = 1;
  const t = mkTex(c, 2, 2);
  TEXC.set(key, t);
  return t;
}

export {
  _vn,
  _hmap,
  _normalTex,
  _grayTex,
  _cache,
  skinNorm,
  skinRough,
  skinMat,
  twillNorm,
  fab,
  leatherNorm,
  leather,
  metalNorm,
  metalRough,
  metal,
  _wearTex,
  gunPaint,
  polyNorm,
  polyMat,
  woodMat,
  scleraMat,
  corneaMat,
  irisMat,
  CAMO,
  fabricTex
};
