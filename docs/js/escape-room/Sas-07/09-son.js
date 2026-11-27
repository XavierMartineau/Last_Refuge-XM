/* LAST REFUGE · XM — Escape room « Sas 07 » · Son généré en direct avec Web Audio.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   7b. SON — tout est généré en direct avec Web Audio (aucun fichier audio externe).
   SND.play('nom', ...args) joue un effet ; les réglages sont dans SOUND (haut du fichier).
   Pour ajouter un effet : ajoutez une fonction dans « lib » ci-dessous, puis appelez SND.play('mon_effet').
   ════════════════════════════════════════════════════════════════ */
const SND = (() => {
  let ctx = null,
    master,
    sfxBus,
    ambBus,
    wet,
    noiseBuf,
    on = SOUND.enabled,
    buzzG,
    humG,
    alarmG,
    tankG,
    tankN,
    nextDrip = 0,
    nextClank = 0,
    lastCrack = 0;
  const now = () => ctx.currentTime;
  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = on ? SOUND.master : 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = SOUND.sfx;
    sfxBus.connect(master);
    // écho léger (delay + feedback filtré) : donne le côté « grande pièce métallique »
    wet = ctx.createGain();
    wet.gain.value = SOUND.reverb;
    const dl = ctx.createDelay(1),
      fb = ctx.createGain(),
      lp = ctx.createBiquadFilter();
    dl.delayTime.value = 0.19;
    fb.gain.value = 0.38;
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    wet.connect(dl);
    dl.connect(lp);
    lp.connect(fb);
    fb.connect(dl);
    lp.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    musBus = ctx.createGain();
    musBus.gain.value = SOUND.music * SOUND.musicBoost;
    musBus.connect(master);
    mNext = ctx.currentTime + 0.3;
    buildAmbience();
    if (document.getElementById('menu').classList.contains('on')) pause();
  }
  function resume() {
    if (ctx && ctx.state !== 'closed' && !document.getElementById('menu').classList.contains('on'))
      ctx.resume().catch((error) => console.error('Reprise du son impossible :', error));
  }
  function pause() {
    if (ctx && ctx.state !== 'closed')
      ctx.suspend().catch((error) => console.error('Pause du son impossible :', error));
  }
  function loopNoise(f, type, q, vol) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const fl = ctx.createBiquadFilter();
    fl.type = type;
    fl.frequency.value = f;
    fl.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(fl);
    fl.connect(g);
    g.connect(ambBus);
    src.start();
    return g;
  }
  function buildAmbience() {
    ambBus = ctx.createGain();
    ambBus.gain.value = SOUND.ambience;
    ambBus.connect(master);
    // drone grave : deux oscillateurs légèrement désaccordés (battement lent)
    [48, 50.3].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      const l = ctx.createBiquadFilter();
      l.type = 'lowpass';
      l.frequency.value = 150;
      const g = ctx.createGain();
      g.gain.value = 0.05;
      o.connect(l);
      l.connect(g);
      g.connect(ambBus);
      o.start();
    });
    // souffle de ventilation, modulé lentement
    const air = loopNoise(380, 'lowpass', 0.7, 0.07),
      lfo = ctx.createOscillator(),
      lg = ctx.createGain();
    lfo.frequency.value = 0.11;
    lg.gain.value = 0.025;
    lfo.connect(lg);
    lg.connect(air.gain);
    lfo.start();
    // bourdonnement des néons (volume piloté dans update)
    const bz = ctx.createOscillator(),
      bz2 = ctx.createOscillator(),
      bf = ctx.createBiquadFilter();
    bz.type = 'sawtooth';
    bz.frequency.value = 100;
    bz2.type = 'square';
    bz2.frequency.value = 200.7;
    bf.type = 'bandpass';
    bf.frequency.value = 400;
    bf.Q.value = 1.2;
    buzzG = ctx.createGain();
    buzzG.gain.value = 0;
    bz.connect(bf);
    bz2.connect(bf);
    bf.connect(buzzG);
    buzzG.connect(ambBus);
    bz.start();
    bz2.start();
    const hm = ctx.createOscillator(),
      hm2 = ctx.createOscillator(),
      hf = ctx.createBiquadFilter(),
      hl = ctx.createOscillator(),
      hlg = ctx.createGain();
    hm.type = 'sawtooth';
    hm.frequency.value = 48;
    hm2.type = 'square';
    hm2.frequency.value = 96.4;
    hf.type = 'lowpass';
    hf.frequency.value = 330; // ronronnement du générateur
    humG = ctx.createGain();
    humG.gain.value = 0;
    hm.connect(hf);
    hm2.connect(hf);
    hf.connect(humG);
    humG.connect(ambBus);
    hl.frequency.value = 7.3;
    hlg.gain.value = 2.2;
    hl.connect(hlg);
    hlg.connect(hm.frequency);
    hm.start();
    hm2.start();
    hl.start();
    // alarme (bip pulsé tant que l’énigme de la pièce n’est pas résolue)
    const al = ctx.createOscillator(),
      alf = ctx.createBiquadFilter();
    al.type = 'square';
    al.frequency.value = 740;
    alf.type = 'lowpass';
    alf.frequency.value = 1200;
    alarmG = ctx.createGain();
    alarmG.gain.value = 0;
    al.connect(alf);
    alf.connect(alarmG);
    alarmG.connect(ambBus);
    al.start();
    // cuve : ronronnement + bulles, audibles seulement près d’elle
    const tn = ctx.createOscillator();
    tn.type = 'sine';
    tn.frequency.value = 62;
    tankG = ctx.createGain();
    tankG.gain.value = 0;
    tn.connect(tankG);
    tankG.connect(ambBus);
    tn.start();
    tankN = loopNoise(700, 'bandpass', 4, 0);
  }
  // ── briques de base ──
  function out(g, send) {
    g.connect(sfxBus);
    if (send) {
      const sg = ctx.createGain();
      sg.gain.value = send;
      g.connect(sg);
      sg.connect(wet);
    }
  }
  function tone(f, d, { type = 'sine', vol = 0.2, slide = null, at = 0, send = 0, lp = 0 } = {}) {
    const t = now() + at,
      o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    let n = o;
    if (lp) {
      const l = ctx.createBiquadFilter();
      l.type = 'lowpass';
      l.frequency.value = lp;
      o.connect(l);
      n = l;
    }
    n.connect(g);
    out(g, send);
    o.start(t);
    o.stop(t + d + 0.05);
  }
  function noise(d, { type = 'lowpass', f = 800, f2 = null, q = 1, vol = 0.2, at = 0, send = 0 } = {}) {
    const t = now() + at,
      src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const fl = ctx.createBiquadFilter();
    fl.type = type;
    fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, d / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(fl);
    fl.connect(g);
    out(g, send);
    src.start(t, Math.random());
    src.stop(t + d + 0.05);
  }
  function creak(d, vol) {
    // grincement de métal : dent de scie à hauteur chaotique
    const t = now(),
      o = ctx.createOscillator(),
      g = ctx.createGain(),
      f = ctx.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(90, t);
    for (let i = 1; i <= 8; i++)
      o.frequency.linearRampToValueAtTime(70 + Math.random() * 130, t + (d * i) / 8);
    f.type = 'bandpass';
    f.frequency.value = 480;
    f.Q.value = 5;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + d * 0.15);
    g.gain.linearRampToValueAtTime(0.0001, t + d);
    o.connect(f);
    f.connect(g);
    out(g, 0.35);
    o.start(t);
    o.stop(t + d + 0.05);
  }
  // ── MUSIQUE générative (réglages : SOUND.music = volume, SOUND.musicOn = activer) ──
  // L’ambiance change selon la situation : sas (nappe sombre) · grandes salles (pouls industriel) · armurerie (angoisse) · combat (rythme rapide) · sortie (accords lumineux).
  let musBus,
    mNext = 0,
    mStep = 0,
    mMood = '',
    mBar = 0;
  const mf = (n) => 440 * Math.pow(2, (n - 69) / 12);
  function mtone(n, d, { type = 'sine', vol = 0.1, at = 0, lp = 0, send = 0, slide = 0 } = {}) {
    const t = now() + at,
      o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(mf(n), t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, mf(n) * slide), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.25, d * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    let x = o;
    if (lp) {
      const l = ctx.createBiquadFilter();
      l.type = 'lowpass';
      l.frequency.value = lp;
      o.connect(l);
      x = l;
    }
    x.connect(g);
    g.connect(musBus);
    if (send) {
      const s = ctx.createGain();
      s.gain.value = send;
      g.connect(s);
      s.connect(wet);
    }
    o.start(t);
    o.stop(t + d + 0.05);
  }
  function mdrum(kind, vol = 0.2, at = 0) {
    const t = now() + at;
    if (kind === 'kick') {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      g.gain.setValueAtTime(vol * 1.6, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g);
      g.connect(musBus);
      o.start(t);
      o.stop(t + 0.25);
      return;
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter(),
      g = ctx.createGain();
    f.type = kind === 'hat' ? 'highpass' : 'bandpass';
    f.frequency.value = kind === 'hat' ? 7000 : 1800;
    f.Q.value = kind === 'hat' ? 0.7 : 0.9;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'hat' ? 0.05 : kind === 'clang' ? 0.5 : 0.16));
    if (kind === 'clang') {
      f.frequency.value = 2600;
      f.Q.value = 8;
    }
    src.connect(f);
    f.connect(g);
    g.connect(musBus);
    src.start(t, Math.random());
    src.stop(t + 0.6);
  }
  const MOODS = {
    // [bpm, fonction(pas, mesure)] ; un pas = une croche
    ambient: {
      bpm: 56,
      f(i, bar) {
        const ch = [
          [45, 52, 57, 60],
          [41, 48, 53, 57],
          [38, 45, 50, 53],
          [40, 47, 52, 56]
        ][bar % 4];
        if (i % 16 === 0)
          ch.forEach((n, j) =>
            mtone(n, 8.5, { type: j ? 'triangle' : 'sawtooth', vol: j ? 0.05 : 0.035, lp: 520, send: 0.5 })
          );
        if (i % 4 === 2 && Math.random() < 0.45)
          mtone(ch[(Math.random() * 4) | 0] + 24 + (Math.random() < 0.3 ? 12 : 0), 3.2, {
            vol: 0.05,
            send: 0.8
          });
        if (i % 32 === 16) mdrum('clang', 0.02);
      }
    },
    industrial: {
      bpm: 96,
      f(i, bar) {
        const root = [33, 33, 36, 31][bar % 4],
          p = [0, 0, 12, 0, 0, 7, 0, 12, 0, 0, 10, 0, 0, 7, 0, 3][i % 16];
        if (i % 2 === 0)
          mtone(root + (p && i % 8 === 4 ? p : 0), 0.34, {
            type: 'sawtooth',
            vol: 0.075,
            lp: 260 + (i % 8 === 0 ? 260 : 0)
          });
        if (i % 8 === 0) mdrum('kick', 0.13);
        if (i % 8 === 4) mdrum('snare', 0.05);
        if (i % 4 === 3) mdrum('clang', 0.012);
        if (i % 16 === 0 && bar % 2 === 1) mtone(root + 36, 2.5, { type: 'triangle', vol: 0.035, send: 0.7 });
      }
    },
    dread: {
      bpm: 48,
      f(i, bar) {
        if (i % 16 === 0) mtone(28, 9, { type: 'sawtooth', vol: 0.07, lp: 200 });
        if (i % 16 === 0) mtone(40, 9, { type: 'sine', vol: 0.05 });
        if (i % 8 === 0) {
          mdrum('kick', 0.1);
          mdrum('kick', 0.07, 0.32);
        } // battement de cœur
        if (i % 16 === 8 && Math.random() < 0.7)
          mtone(64 + ((Math.random() * 6) | 0), 4, { type: 'sine', vol: 0.04, send: 0.9, slide: 0.97 });
      }
    },
    combat: {
      bpm: 156,
      f(i, bar) {
        const root = [28, 28, 31, 26][bar % 4],
          s = i % 16;
        mtone(root + (s % 4 === 3 ? 12 : 0), 0.16, {
          type: 'sawtooth',
          vol: 0.09,
          lp: 420 + (s % 8 === 0 ? 700 : 0)
        });
        if (s % 4 === 0) mdrum('kick', 0.16);
        if (s === 4 || s === 12) mdrum('snare', 0.09);
        mdrum('hat', s % 2 ? 0.03 : 0.015);
        if (s % 8 === 6)
          mtone(root + 31 + [0, 3, 7, 10][(Math.random() * 4) | 0], 0.3, {
            type: 'square',
            vol: 0.03,
            lp: 2200,
            send: 0.3
          });
      }
    },
    victory: {
      bpm: 72,
      f(i, bar) {
        const ch = [
          [48, 55, 64],
          [43, 59, 62],
          [45, 52, 64],
          [41, 57, 60]
        ][bar % 4];
        if (i % 16 === 0) ch.forEach((n) => mtone(n, 7, { type: 'triangle', vol: 0.06, send: 0.6 }));
        if (i % 2 === 0) mtone(ch[(i / 2) % 3 | 0] + 24, 1.6, { type: 'sine', vol: 0.05, send: 0.7 });
      }
    }
  };
  const PENTA = [0, 3, 5, 7, 10];
  const EXTRA = {
    ambient: (i, bar) => {
      const r = [45, 41, 38, 40][bar % 4];
      if (i % 8 === 0)
        mtone(r + 12 + PENTA[(i / 8 + bar) % 5 | 0], 2.6, { type: 'triangle', vol: 0.07, send: 0.6 });
      if (i % 32 === 24)
        [0, 3, 7].forEach((d, j) =>
          mtone(r + 24 + d, 1.8, { type: 'sine', vol: 0.05, at: j * 0.45, send: 0.8 })
        );
    },
    industrial: (i, bar) => {
      const r = [33, 33, 36, 31][bar % 4];
      if (i % 2 === 0)
        mtone(r + 24 + [0, 3, 7, 10, 12, 10, 7, 3][(i / 2) % 8 | 0], 0.22, {
          type: 'square',
          vol: 0.04,
          lp: 1900,
          send: 0.25
        });
      if (i % 16 === 8 && bar % 2 === 0)
        mtone(r + 36, 1.6, { type: 'sawtooth', vol: 0.04, lp: 1400, send: 0.5 });
    },
    dread: (i, bar) => {
      if (i % 16 === 4)
        mtone(52 + PENTA[(bar * 2) % 5], 5, { type: 'triangle', vol: 0.05, send: 0.9, slide: 0.94 });
      if (i % 16 === 12 && bar % 2) mtone(76, 3, { type: 'sine', vol: 0.035, send: 0.9 });
    },
    combat: (i, bar) => {
      const r = [28, 28, 31, 26][bar % 4],
        s = i % 16;
      if (s % 2 === 0)
        mtone(r + 24 + PENTA[(s / 2 + bar) % 5 | 0], 0.12, {
          type: 'square',
          vol: 0.04,
          lp: 2600,
          send: 0.2
        });
    },
    victory: (i, bar) => {
      const c = [48, 43, 45, 41][bar % 4];
      if (i % 4 === 0)
        mtone(c + 24 + PENTA[(i / 4 + bar) % 5 | 0], 1.2, { type: 'triangle', vol: 0.07, send: 0.7 });
      if (i % 16 === 0) mtone(c - 12, 6, { type: 'sine', vol: 0.08 });
    }
  };
  Object.keys(EXTRA).forEach((k) => {
    const f0 = MOODS[k].f,
      e = EXTRA[k];
    MOODS[k].f = (i, bar) => {
      f0(i, bar);
      e(i, bar);
    };
  });
  function moodNow() {
    return State.doorExit || State.zDone
      ? 'victory'
      : State.room === 12
        ? State.armed
          ? 'combat'
          : 'dread'
        : State.room === 10
          ? 'dread'
          : State.room >= 5
            ? 'industrial'
            : 'ambient';
  }
  function musicTick(t, n) {
    if (sfxBus) sfxBus.gain.setTargetAtTime(SOUND.sfx, n, 0.1);
    if (master) master.gain.setTargetAtTime(SOUND.master, n, 0.08);
    if (!SOUND.musicOn || !musBus) return;
    const m = moodNow();
    if (m !== mMood) {
      mMood = m;
      mStep = 0;
      mBar = 0;
      mNext = Math.max(mNext, n + 0.15);
    }
    musBus.gain.setTargetAtTime(SOUND.music * SOUND.musicBoost, n, 0.3);
    const M = MOODS[m],
      dur = 60 / M.bpm / 2;
    if (mNext < n - 1) mNext = n + 0.1;
    while (mNext < n + 0.3) {
      const at = mNext - n;
      const real = now;
      try {
        M.f(mStep, mBar);
      } catch (e) {}
      mStep++;
      if (mStep % 16 === 0) mBar++;
      mNext += dur;
    }
  }
  // ── bibliothèque d’effets ──
  const lib = {
    click() {
      tone(1500, 0.04, { type: 'square', vol: 0.05 });
      noise(0.03, { type: 'highpass', f: 3000, vol: 0.06 });
    },
    tick() {
      tone(2600, 0.02, { vol: 0.02 });
    }, // survol d’un objet
    key() {
      tone(880, 0.06, { type: 'square', vol: 0.06 });
      noise(0.02, { type: 'highpass', f: 4000, vol: 0.05 });
    }, // chiffre du digicode
    error() {
      tone(170, 0.4, { type: 'sawtooth', vol: 0.14, slide: 80, lp: 900 });
      tone(130, 0.4, { type: 'square', vol: 0.07, slide: 70, at: 0.05, lp: 700 });
    },
    locked() {
      tone(130, 0.16, { type: 'square', vol: 0.1, slide: 90, lp: 800 });
      noise(0.06, { f: 900, vol: 0.2 });
    },
    success() {
      [660, 880, 1320].forEach((f, i) => tone(f, 0.28, { vol: 0.1, at: i * 0.1, send: 0.3 }));
    },
    zoom() {
      noise(0.35, { type: 'bandpass', f: 400, f2: 2400, q: 1.2, vol: 0.08 });
    },
    lever() {
      noise(0.12, { f: 400, vol: 0.4 });
      tone(65, 0.35, { vol: 0.3, slide: 38 });
      tone(310, 0.18, { type: 'square', vol: 0.07, slide: 190, lp: 1500, at: 0.04, send: 0.3 });
      creak(0.5, 0.04);
    },
    power() {
      tone(38, 1.8, { type: 'sawtooth', vol: 0.18, slide: 130, lp: 300 });
      noise(1.6, { type: 'bandpass', f: 120, f2: 900, q: 1, vol: 0.12 });
      tone(1200, 0.1, { type: 'square', vol: 0.05, at: 1.2 });
      tone(1600, 0.1, { type: 'square', vol: 0.05, at: 1.35 });
    },
    unlock() {
      [0, 0.14].forEach((a) => {
        noise(0.05, { type: 'bandpass', f: 2200, q: 3, vol: 0.25, at: a });
        tone(200, 0.09, { type: 'square', vol: 0.12, slide: 110, at: a, lp: 900, send: 0.15 });
      });
    },
    door() {
      creak(1.6, 0.1);
      noise(1.7, { f: 130, vol: 0.3, send: 0.2 });
      noise(0.9, { type: 'highpass', f: 3500, vol: 0.06, at: 0.1 });
      tone(48, 0.5, { vol: 0.35, slide: 32, at: 1.5, send: 0.4 });
      noise(0.2, { f: 300, vol: 0.35, at: 1.5 });
    },
    locker() {
      creak(0.9, 0.1);
      noise(0.08, { f: 500, vol: 0.3, at: 0.85 });
    },
    shot(k) {
      const big = k === 4 || k === 5 || k === 6 || k === 9 || k === 10;
      noise(0.18, { type: 'lowpass', f: big ? 1800 : 2600, vol: 0.45, send: 0.25 });
      tone(big ? 95 : 140, 0.14, { type: 'square', vol: 0.22, slide: 45, lp: 900 });
      if (k === 3) noise(0.3, { type: 'lowpass', f: 1200, vol: 0.4, send: 0.3 });
    },
    empty() {
      tone(900, 0.04, { type: 'square', vol: 0.08, lp: 2000 });
      noise(0.03, { f: 3000, vol: 0.1 });
    },
    reload() {
      noise(0.08, { type: 'bandpass', f: 2400, q: 2, vol: 0.2 });
      noise(0.1, { type: 'bandpass', f: 1500, q: 2, vol: 0.22, at: 0.55 });
      tone(420, 0.05, { type: 'square', vol: 0.07, at: 1.0 });
    },
    zhit() {
      noise(0.1, { type: 'lowpass', f: 700, vol: 0.3 });
      tone(110, 0.1, { type: 'sine', vol: 0.2, slide: 60 });
    },
    zgroan() {
      tone(85, 0.8, { type: 'sawtooth', vol: 0.09, slide: 55, lp: 500, send: 0.2 });
    },
    zdie() {
      tone(120, 0.6, { type: 'sawtooth', vol: 0.12, slide: 40, lp: 420, send: 0.2 });
      noise(0.2, { type: 'lowpass', f: 500, vol: 0.25 });
    },
    hurt() {
      tone(180, 0.25, { type: 'square', vol: 0.12, slide: 70, lp: 600 });
      noise(0.15, { type: 'lowpass', f: 900, vol: 0.3 });
    },
    swing() {
      noise(0.2, { type: 'bandpass', f: 1800, q: 0.8, vol: 0.2 });
    },
    boom() {
      noise(0.9, { type: 'lowpass', f: 500, vol: 0.6, send: 0.4 });
      tone(55, 0.7, { type: 'sine', vol: 0.5, slide: 25 });
    },
    neonflick() {
      for (let i = 0; i < 7; i++) {
        noise(0.05, { type: 'highpass', f: 3500, vol: 0.059, at: i * 0.11 + Math.random() * 0.05 });
        tone(100, 0.07, { type: 'sawtooth', vol: 0.023, at: i * 0.11, lp: 600 });
      }
    },
    neonoff() {
      noise(0.06, { type: 'highpass', f: 5000, vol: 0.09 });
      tone(120, 0.55, { type: 'sawtooth', vol: 0.032, slide: 45, lp: 500 });
      tone(60, 0.5, { type: 'square', vol: 0.018, slide: 30, lp: 300, at: 0.04 });
    },
    neonon() {
      noise(0.04, { type: 'highpass', f: 4500, vol: 0.081 });
      for (let i = 0; i < 4; i++) noise(0.04, { type: 'highpass', f: 3500, vol: 0.045, at: 0.08 + i * 0.1 });
      tone(80, 0.7, { type: 'sawtooth', vol: 0.023, slide: 105, lp: 500, at: 0.05 });
    },
    sparkle() {
      for (let i = 0; i < 9; i++) {
        tone(2200 + Math.random() * 3800, 0.06, {
          type: 'square',
          vol: 0.03,
          at: i * 0.045 + Math.random() * 0.03,
          lp: 7000
        });
        noise(0.03, { type: 'highpass', f: 6000, vol: 0.08, at: i * 0.05 });
      }
      tone(900, 0.25, { vol: 0.04, slide: 2400, at: 0.02 });
    },
    pour() {
      for (let i = 0; i < 9; i++) noise(0.17, { type: 'bandpass', f: 450 + i * 70, vol: 0.1, at: i * 0.14 });
    },
    sputter() {
      tone(75, 0.3, { type: 'sawtooth', vol: 0.14, slide: 28, lp: 380 });
      noise(0.25, { f: 300, vol: 0.16, at: 0.04 });
      tone(60, 0.2, { type: 'square', vol: 0.08, slide: 25, lp: 300, at: 0.3 });
    },
    genstart() {
      tone(40, 1.4, { type: 'sawtooth', vol: 0.2, slide: 70, lp: 320 });
      tone(80, 1.2, { type: 'square', vol: 0.07, slide: 60, lp: 420, at: 0.15 });
      noise(0.5, { f: 260, vol: 0.2, at: 0.05 });
    },
    paper() {
      noise(0.25, { type: 'bandpass', f: 3800, q: 0.8, vol: 0.12 });
    },
    step() {
      noise(0.09, { f: 260, vol: 0.2 });
      tone(70, 0.1, { vol: 0.12, slide: 45 });
    },
    press(c) {
      tone({ green: 523, red: 392, blue: 659 }[c] || 500, 0.2, { vol: 0.1, send: 0.25 });
      noise(0.04, { type: 'highpass', f: 2500, vol: 0.1 });
    },
    drip() {
      const f = 1500 + Math.random() * 900;
      tone(f, 0.07, { vol: 0.05, slide: f * 0.55, send: 0.9 });
      tone(f * 0.5, 0.06, { vol: 0.025, slide: f * 0.3, at: 0.04, send: 0.9 });
    },
    flash() {
      tone(1800, 0.02, { type: 'square', vol: 0.04 });
      noise(0.03, { type: 'highpass', f: 3500, vol: 0.06 });
    },
    radio() {
      noise(1.4, { type: 'bandpass', f: 1800, f2: 900, q: 2, vol: 0.12, send: 0.3 });
      [0, 0.25, 0.5, 0.9].forEach((a, i) =>
        tone(500 + i * 190, 0.12, { type: 'square', vol: 0.03, at: a, lp: 1400 })
      );
    },
    genstart() {
      tone(30, 2.6, { type: 'sawtooth', vol: 0.25, slide: 70, lp: 260 });
      noise(2.4, { type: 'bandpass', f: 100, f2: 700, q: 1, vol: 0.15 });
      [1.6, 1.9, 2.2].forEach((a) => noise(0.08, { f: 300, vol: 0.3, at: a }));
    },
    clank() {
      tone(150, 1.2, { type: 'square', vol: 0.04, slide: 130, lp: 500, send: 0.9 });
      noise(0.3, { type: 'bandpass', f: 900, q: 6, vol: 0.05, send: 0.9 });
    },
    // ── serrures / casiers réalistes ──
    cutlock() {
      noise(0.05, { type: 'highpass', f: 3200, vol: 0.4 });
      tone(1400, 0.08, { type: 'square', vol: 0.1, slide: 500, lp: 5000 });
      noise(0.03, { type: 'bandpass', f: 2400, q: 5, vol: 0.25, at: 0.07 });
      tone(300, 0.12, { type: 'square', vol: 0.08, slide: 120, lp: 900, at: 0.02 });
    }, // pince : « crac » du cadenas
    padfall() {
      [0, 0.15, 0.26, 0.34].forEach((a, i) => {
        tone(2700 - i * 320, 0.55, { vol: 0.07 / (i + 1), at: a, send: 0.5 });
        tone(4100 - i * 420, 0.3, { vol: 0.035 / (i + 1), at: a });
        noise(0.02, { type: 'highpass', f: 5200, vol: 0.12 / (i + 1), at: a });
      });
    }, // cadenas qui rebondit au sol
    latch() {
      noise(0.04, { type: 'bandpass', f: 2200, q: 3, vol: 0.32 });
      tone(190, 0.09, { type: 'square', vol: 0.1, slide: 90, lp: 600 });
      noise(0.03, { type: 'bandpass', f: 3600, q: 4, vol: 0.2, at: 0.1 });
      tone(1500, 0.2, { vol: 0.04, slide: 800, at: 0.1, send: 0.5 });
    }, // bouton / loquet métallique qui se libère
    lockerdoor() {
      tone(210, 0.75, { type: 'sawtooth', vol: 0.05, slide: 350, lp: 900, send: 0.6 });
      tone(265, 0.65, { type: 'sawtooth', vol: 0.03, slide: 430, lp: 700, at: 0.1, send: 0.6 });
      noise(0.65, { type: 'bandpass', f: 720, q: 2, vol: 0.04, at: 0.05 });
      tone(70, 0.22, { vol: 0.16, slide: 38, at: 0.75 });
      noise(0.08, { type: 'lowpass', f: 500, vol: 0.12, at: 0.75 });
    }, // porte qui grince puis bute
    drill() {
      tone(170, 1.5, { type: 'sawtooth', vol: 0.12, slide: 140, lp: 950 });
      tone(340, 1.5, { type: 'square', vol: 0.04, slide: 280, lp: 1400 });
      noise(1.5, { type: 'bandpass', f: 2600, q: 1.2, vol: 0.1 });
      noise(0.4, { type: 'highpass', f: 5000, vol: 0.08, at: 0.3 });
    }, // perceuse sans fil
    // ── ambiances de salle (événements aléatoires) ──
    creak() {
      tone(120, 1.2, { type: 'sawtooth', vol: 0.03, slide: 190, lp: 500, send: 0.9 });
      tone(130, 1.0, { type: 'sawtooth', vol: 0.02, slide: 210, lp: 420, at: 0.2, send: 0.9 });
    },
    wind() {
      noise(3.2, { type: 'bandpass', f: 420, f2: 900, q: 1.4, vol: 0.07, send: 0.8 });
    },
    moan() {
      tone(130, 1.6, { type: 'sawtooth', vol: 0.035, slide: 85, lp: 420, send: 0.9 });
      tone(190, 1.4, { type: 'triangle', vol: 0.025, slide: 120, at: 0.1, send: 0.9 });
    },
    chain() {
      [0, 0.09, 0.21, 0.3, 0.46].forEach((a) => {
        noise(0.05, { type: 'bandpass', f: 3000 + Math.random() * 1500, q: 6, vol: 0.07, at: a, send: 0.6 });
        tone(1800 + Math.random() * 900, 0.12, { vol: 0.015, at: a });
      });
    },
    radio() {
      noise(1.4, { type: 'bandpass', f: 1800, q: 0.8, vol: 0.05, send: 0.2 });
      [0.2, 0.6, 0.9].forEach((a) =>
        tone(520 + Math.random() * 500, 0.1, { type: 'square', vol: 0.012, at: a, lp: 2200 })
      );
    },
    beepfar() {
      [0, 0.25].forEach((a) => tone(1250, 0.08, { type: 'square', vol: 0.018, at: a, lp: 2500, send: 0.7 }));
    },
    slamfar() {
      noise(0.18, { type: 'lowpass', f: 380, vol: 0.2, send: 1 });
      tone(60, 0.3, { vol: 0.12, slide: 35, send: 0.8 });
      tone(2400, 0.4, { vol: 0.012, send: 1, at: 0.02 });
    }
  };
  function play(name, ...a) {
    if (name === 'locked' && actObj) rattle(actObj);
    if (!ctx || !on || !lib[name]) return;
    try {
      lib[name](...a);
    } catch (e) {}
  }
  function update(t) {
    // appelé à chaque image : sons « vivants » liés à l’état du jeu
    if (!ctx || !on) return;
    const n = now();
    musicTick(t, n);
    buzzG.gain.setTargetAtTime((neon.k[State.room] || 0) * 0.01 + 0.002, n, 0.1);
    if (humG) {
      const dg = State.gen1 ? Math.hypot(rig.pos.x - genG.position.x, rig.pos.z - genG.position.z) : 99;
      humG.gain.setTargetAtTime(State.gen1 ? Math.pow(Math.max(0, 1 - dg / 11), 2) * 0.16 : 0, n, 0.15);
    }
    if (t < neon.spark[State.room] && t - lastCrack > 0.05) {
      lastCrack = t;
      noise(0.04, { type: 'highpass', f: 4000, vol: 0.07 });
    } // crépitements
    const alarmOn =
      SOUND.alarm &&
      [
        !State.power,
        !State.solved,
        !State.vaultUnlocked,
        !State.power4,
        !State.power5,
        !State.wareCode,
        false, // salles 7 à 10 : zone provisoire
        false,
        false,
        false,
        !State.breaker,
        !State.zDone
      ][State.room - 1];
    alarmG.gain.setTargetAtTime(alarmOn && Math.sin(t * 4) > 0 ? 0.004 : 0, n, 0.02);
    const k = Math.max(0, 1 - Math.hypot(rig.pos.x + 2.8, rig.pos.z + 10.2) / 7);
    tankG.gain.setTargetAtTime(0.05 * k, n, 0.2);
    tankN.gain.setTargetAtTime(0.08 * k, n, 0.2);
    if (ctx && t > (SND._env || 0)) {
      // évènement d’ambiance propre à la salle courante
      const r = State.room,
        P = {
          1: ['creak', 'wind', 'beepfar', 'radio'],
          2: ['creak', 'chain', 'drip'],
          3: ['moan', 'creak'],
          4: ['chain', 'slamfar', 'drip'],
          5: ['wind', 'slamfar', 'beepfar'],
          6: ['wind', 'slamfar', 'chain'],
          7: ['chain', 'creak', 'beepfar'],
          8: ['beepfar', 'radio', 'creak'],
          9: ['beepfar', 'radio', 'slamfar'],
          10: ['moan', 'creak', 'wind'],
          11: ['chain', 'moan', 'drip'],
          12: ['moan', 'slamfar', 'wind']
        }[r] || ['creak'];
      SND._env = t + (r >= 10 ? 5 : 8) + Math.random() * 9;
      const k = P[Math.floor(Math.random() * P.length)];
      try {
        lib[k] && lib[k]();
      } catch (e) {}
    }
    if (wet && ctx) {
      const rv = State.room <= 4 ? 0.22 : State.room <= 9 ? 0.5 : State.room <= 11 ? 0.16 : 0.42;
      wet.gain.setTargetAtTime(rv, ctx.currentTime, 1.2);
    }
    if (t > nextDrip) {
      nextDrip = t + 1.2 + Math.random() * 4.5;
      if (SOUND.drips) lib.drip();
    }
    if (t > nextClank) {
      nextClank = t + 14 + Math.random() * 22;
      lib.clank();
    }
  }
  function toggle() {
    on = !on;
    init();
    resume();
    if (ctx) master.gain.setTargetAtTime(on ? SOUND.master : 0, now(), 0.05);
    sndLabel();
  }
  return {
    init,
    resume,
    pause,
    play,
    update,
    toggle,
    get on() {
      return on;
    }
  };
})();
function sndLabel() {
  document.getElementById('snd').textContent = SND.on ? TEXTS.ui.soundOn : TEXTS.ui.soundOff;
}
// Les navigateurs exigent un geste de l’utilisateur avant de lancer le son : on démarre au premier clic / touche.
['pointerdown', 'keydown'].forEach((ev) =>
  addEventListener(ev, () => {
    SND.init();
    SND.resume();
  })
);
document.getElementById('snd').onclick = () => SND.toggle();
