/* LAST REFUGE · XM — Escape room « Sas 07 » · Textures procédurales (classe Surface).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   2. TEXTURES PROCÉDURALES — classe Surface
   Trois canvas en parallèle : couleur (map), rugosité (roughnessMap), relief (bumpMap).
   Rugosité : sombre = brillant/humide, clair = mat.   Relief : clair = en saillie.
   ════════════════════════════════════════════════════════════════ */
const gray = (v, a = 1) => {
  const n = Math.round(v * 255);
  return `rgba(${n},${n},${n},${a})`;
};
class Surface {
  constructor(size = 512, transparent = false) {
    this.s = size;
    this.transparent = transparent;
    const mk = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      return c.getContext('2d');
    };
    this.c = mk();
    this.r = mk();
    this.b = mk();
  }
  base(col, rough = 0.75, bump = 0.5) {
    if (!this.transparent) {
      this.c.fillStyle = col;
      this.c.fillRect(0, 0, this.s, this.s);
    }
    this.r.fillStyle = gray(rough);
    this.r.fillRect(0, 0, this.s, this.s);
    this.b.fillStyle = gray(bump);
    this.b.fillRect(0, 0, this.s, this.s);
    return this;
  }
  // dessine la même forme sur les 3 canvas avec 3 styles différents
  stamp(fn, c, r, b) {
    [
      [this.c, c],
      [this.r, r],
      [this.b, b]
    ].forEach(([x, f]) => {
      if (!f) return;
      x.save();
      x.fillStyle = x.strokeStyle = f;
      fn(x);
      x.restore();
    });
    return this;
  }
  // grain fin sur la couleur (béton, métal)
  grain(a = 20) {
    const id = this.c.getImageData(0, 0, this.s, this.s),
      d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (rnd() - 0.5) * a;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
    this.c.putImageData(id, 0, 0);
    for (let i = 0; i < 2500; i++)
      this.stamp(
        (x) => x.fillRect(rnd() * this.s, rnd() * this.s, 1 + rnd() * 2, 1 + rnd() * 2),
        null,
        null,
        gray(rnd(), 0.25)
      );
    return this;
  }
  // tache douce (gradient radial) : rgb = 'r,g,b', a = opacité, rv/bv = rugosité/relief locaux (null = inchangé)
  blob(x, y, r, rgb, a, rv = null, bv = null) {
    const f = (ctx, col) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${col},${a})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    };
    f(this.c, rgb);
    if (rv != null) {
      const n = Math.round(rv * 255);
      f(this.r, `${n},${n},${n}`);
    }
    if (bv != null) {
      const n = Math.round(bv * 255);
      f(this.b, `${n},${n},${n}`);
    }
    return this;
  }
  brush(n = 60) {
    for (let i = 0; i < n; i++) {
      const y = rnd() * this.s,
        x = rnd() * this.s,
        l = 80 + rnd() * 300,
        l2 = rnd() < 0.5;
      this.stamp(
        (c) => {
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + l, y + (rnd() - 0.5) * 2);
          c.stroke();
        },
        l2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.12)',
        null,
        gray(l2 ? 0.65 : 0.35, 0.4)
      );
    }
    return this;
  } // métal brossé
  rust(n = 14) {
    for (let i = 0; i < n; i++) {
      const x = rnd() * this.s,
        y = rnd() * this.s,
        r = 14 + rnd() * 70;
      this.blob(x, y, r, '150,66,24', 0.8, 0.95, 0.8);
      this.blob(x + rnd() * 10, y + rnd() * 10, r * 0.4, '90,38,14', 0.7, 0.98, 0.9);
    }
    for (let i = 0; i < 150; i++)
      this.stamp(
        (c) => c.fillRect(rnd() * this.s, rnd() * this.s, 1 + rnd() * 3, 1 + rnd() * 3),
        'rgba(160,80,30,.6)',
        gray(0.95, 0.8),
        gray(0.8, 0.6)
      );
    return this;
  }
  streaks(n = 8, rgb = '120,56,22', a = 0.55) {
    for (let i = 0; i < n; i++) {
      const x = rnd() * this.s,
        w = 3 + rnd() * 14,
        h = 70 + rnd() * 320,
        y = rnd() * this.s * 0.5;
      const g = this.c.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, `rgba(${rgb},${a})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      this.c.fillStyle = g;
      this.c.fillRect(x, y, w, h);
      this.stamp((c) => c.fillRect(x, y, w, h * 0.6), null, gray(0.92, 0.35), gray(0.7, 0.25));
    }
    return this;
  } // coulures de rouille
  scratches(n = 20) {
    for (let i = 0; i < n; i++) {
      const x = rnd() * this.s,
        y = rnd() * this.s,
        a = rnd() * Math.PI,
        l = 20 + rnd() * 130;
      this.stamp(
        (c) => {
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
          c.stroke();
        },
        'rgba(225,220,200,.3)',
        gray(0.45, 0.5),
        gray(0.1, 0.7)
      );
    }
    return this;
  }
  grime(a = 0.55, w = 90) {
    const c = this.c,
      s = this.s;
    [
      [0, 0, w, 0],
      [s, 0, s - w, 0],
      [0, 0, 0, w],
      [0, s, 0, s - w]
    ].forEach(([x0, y0, x1, y1]) => {
      const g = c.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, s, s);
    });
    return this;
  } // saleté dans les angles
  rivets(step = 64, inset = 14) {
    for (let x = inset; x < this.s; x += step)
      for (const y of [inset, this.s - inset]) {
        this.stamp(
          (c) => {
            c.beginPath();
            c.arc(x, y, 4, 0, 6.3);
            c.fill();
          },
          'rgba(20,20,18,.8)',
          gray(0.5),
          gray(0.9)
        );
      }
    return this;
  }
  lines(step = 128, col = 'rgba(0,0,0,.55)') {
    for (let p = 0; p < this.s; p += step)
      this.stamp(
        (c) => {
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(p, 0);
          c.lineTo(p, this.s);
          c.moveTo(0, p);
          c.lineTo(this.s, p);
          c.stroke();
        },
        col,
        null,
        gray(0.05)
      );
    return this;
  }
  hazard(x, y, w, h) {
    const c = this.c;
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    let k = 0;
    for (let i = -h; i < w + h; i += 34) {
      c.fillStyle = k++ % 2 ? '#15171a' : '#b48a22';
      c.beginPath();
      c.moveTo(x + i, y + h);
      c.lineTo(x + i + 17, y + h);
      c.lineTo(x + i + 17 + h, y);
      c.lineTo(x + i + h, y);
      c.fill();
    }
    c.restore();
    return this;
  }
  puddle(x, y, r) {
    this.blob(x, y, r, '6,8,8', 0.55, 0.03, 0.5);
    return this;
  } // flaque : très lisse → reflets spéculaires
  // éclaboussures de sang séché + gouttes
  blood(n = 6, { x0 = 0, y0 = 0, w = this.s, h = this.s, drip = true } = {}) {
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * w,
        y = y0 + rnd() * h * 0.7,
        r = 8 + rnd() * 28;
      this.stamp(
        (c) => {
          c.beginPath();
          for (let k = 0; k < 9; k++) {
            const a = (k / 9) * 6.283,
              rr = r * (0.6 + rnd() * 0.7);
            c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
          }
          c.closePath();
          c.fill();
        },
        'rgba(82,9,8,.93)',
        gray(0.32, 0.9),
        gray(0.7, 0.9)
      );
      for (let k = 0; k < 14; k++) {
        const a = rnd() * 6.283,
          d = r * (1.1 + rnd() * 2.2),
          rr = 1 + rnd() * 3.5;
        this.stamp(
          (c) => {
            c.beginPath();
            c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, rr, 0, 6.3);
            c.fill();
          },
          'rgba(78,8,7,.9)',
          gray(0.32, 0.9),
          gray(0.68, 0.9)
        );
      }
      if (drip && rnd() < 0.75) this.drips(x - r * 0.5, x + r * 0.5, y, 1);
    }
    return this;
  }
  drips(xa, xb, y, n = 3) {
    for (let i = 0; i < n; i++) {
      const dx = xa + rnd() * (xb - xa),
        len = 25 + rnd() * 120,
        wd = 2 + rnd() * 3.5;
      this.stamp(
        (c) => {
          c.fillRect(dx - wd / 2, y, wd, len);
          c.beginPath();
          c.arc(dx, y + len, wd * 0.9, 0, 6.3);
          c.fill();
        },
        'rgba(70,8,7,.9)',
        gray(0.3, 0.9),
        gray(0.68, 0.9)
      );
    }
    return this;
  }
  write(t, x, y, font, col, bump = 0.25) {
    // polices réalistes : Georgia → écriture à la main (gros = griffonnage au sang), Arial → pochoir militaire, Courier → machine à écrire
    const mm = /(bold )?(\d+)px (.*)/.exec(font) || [0, '', 16, 'sans-serif'];
    let fs = +mm[2],
      fam = mm[3],
      ink = true,
      blur = 1.3;
    if (/Georgia/.test(fam)) {
      if (fs >= 100) {
        fam = '"Rock Salt",cursive';
        fs *= 0.62;
        blur = 2.2;
      } else {
        fam = 'Caveat,cursive';
        fs *= 1.38;
      }
      font = '700 ' + Math.round(fs) + 'px ' + fam;
    } else if (/Arial/.test(fam)) {
      fam = '"Stardos Stencil",Impact,sans-serif';
      font = '700 ' + Math.round(fs * 0.9) + 'px ' + fam;
      ink = false;
    } else if (/Courier/.test(fam)) {
      fam = '"Special Elite","Courier New",monospace';
      font = Math.round(fs * 0.85) + 'px ' + fam;
      blur = 0.8;
    }
    const rot = (Math.random() - 0.5) * (fs >= 100 ? 0.12 : 0.03),
      dx = (Math.random() - 0.5) * 3,
      dy = (Math.random() - 0.5) * 3,
      am = ink ? 0.82 + Math.random() * 0.16 : 1;
    [this.c, this.b].forEach((ctx, i) => {
      ctx.save();
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(x + dx, y + dy);
      ctx.rotate(rot);
      ctx.fillStyle = i ? gray(bump) : col;
      ctx.globalAlpha = i ? 1 : am;
      if (!i && ink) {
        ctx.shadowColor = col;
        ctx.shadowBlur = blur;
      } // encre qui bave légèrement, trait irrégulier
      ctx.fillText(t, 0, 0, this.s * 0.94);
      ctx.restore();
    });
    return this;
  }
  build(rx = 1, ry = 1) {
    const mk = (ctx, srgb) => {
      const t = new THREE.CanvasTexture(ctx.canvas);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.anisotropy = 8;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    return { map: mk(this.c, true), roughnessMap: mk(this.r), bumpMap: mk(this.b) };
  }
}
// Fabrique un matériau PBR à partir d’une Surface
const levelMaterials = new Set();
const pbr = (s, { rx = 1, ry = 1, metal = 0, bump = 1.5, extra = {} } = {}) => {
  const material = new THREE.MeshStandardMaterial({
    ...s.build(rx, ry),
    roughness: 1,
    metalness: metal,
    bumpScale: bump,
    ...extra
  });
  levelMaterials.add(material);
  return material;
};
// Décalque (sang, rouille) : plan transparent posé sur une surface
const decalMat = (s) => {
  const material = new THREE.MeshStandardMaterial({
    ...s.build(),
    roughness: 1,
    metalness: 0,
    bumpScale: 1.5,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4
  });
  levelMaterials.add(material);
  return material;
};
