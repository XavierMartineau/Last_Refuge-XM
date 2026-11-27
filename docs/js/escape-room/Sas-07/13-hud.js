/* LAST REFUGE · XM — Escape room « Sas 07 » · HUD : messages, objectif, digicode.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   9. HUD : messages, objectif, digicode
   ════════════════════════════════════════════════════════════════ */
const msgEl = document.getElementById('msg');
let msgT;
let _tw;
function say(t, ms = 5200) {
  clearInterval(_tw);
  msgEl.textContent = '';
  msgEl.classList.add('on');
  clearTimeout(msgT); // texte « tapé » à la machine à écrire
  let i = 0;
  const step = Math.max(1, Math.ceil(t.length / 60));
  _tw = setInterval(() => {
    i += step;
    msgEl.textContent = t.slice(0, i);
    if (i >= t.length) clearInterval(_tw);
  }, 18);
  msgT = setTimeout(() => msgEl.classList.remove('on'), ms + (t.length * 18) / step);
}
function subGoals() {
  const rr = roomOf(rig.pos.z);
  return subGoals0(rr).concat(questLines(rr));
}
function subGoals0(rr) {
  if (rr === 7)
    return [
      ['Rallumer l’éclairage (interrupteur général, mur d’entrée côté est)', State.wareLight],
      ['Lire les jauges des cuves A, B et C (mur du fond)', !!(State.gaugeA && State.gaugeB && State.gaugeC) || State.boothOpen],
      ['Ouvrir le cadenas de la cabine du contremaître', State.boothOpen],
      ['Prendre la manivelle sur l’établi', State.crank],
      ['Descendre la clé avec le treuil (mur ouest)', State.keyLowered],
      ['Prendre la clé du silo', State.key]
    ];
  if (rr === 8)
    return [
      ['Lire la procédure sur la table de situation', !!State.cmdRead || State.power8],
      ['Abaisser les relais dans l’ordre : ' + (State.power8 ? 3 : State.relays) + ' / 3', State.power8]
    ];
  if (rr === 9)
    return [
      ['Lire le tableau de départ (mur ouest)', !!State.boardRead || State.keyCabinet],
      ['Relever les numéros des jeeps ALPHA, BRAVO, CHARLIE', !!(State.vehA && State.vehB && State.vehC) || State.keyCabinet],
      ['Ouvrir l’armoire à clés (mur est)', State.keyCabinet],
      ['Prendre la clé du convoi', State.key2]
    ];
  if (rr === 10)
    return [
      ['Trouver le code gravé dans une cellule ouverte', State.keyCell],
      ['Ouvrir le tiroir du garde (au fond)', State.keyCell],
      ['Ouvrir la cellule O3', !!(gates.gate_W2 && gates.gate_W2.userData.opened)],
      ['Fouiller la couchette de la cellule O3', State.key4]
    ];
  if (rr !== 1) return [];
  if (!State.power)
    return [
      ...(State.gen1
        ? []
        : [
            [
              'Cliquer sur le générateur (mur ouest, au fond) : batterie, essence, câble de masse, vanne',
              false
            ]
          ]),
      ['Fusibles dans le tableau : ' + (State.fzIn || 0) + '/2 (caisse à outils · lit de camp)', State.brkOk],
      ['Réarmer le disjoncteur (tableau, mur ouest)', State.brkOk],
      ['Actionner le levier', State.power]
    ];
  if (!State.termOk)
    return [
      ['Récupérer le tournevis (casier cadenassé)', State.screwdriver || State.panelOpen],
      ['Trouver la perceuse (cachée dans un casier cadenassé)', State.drill || State.bloodOpen],
      ['Ouvrir le panneau taché : 2 vis au tournevis, 2 à la perceuse (sous les néons)', State.bloodOpen],
      ['Lire la note du casier', State.noteLocker],
      ['Récupérer le badge d’accès (casier cadenassé)', State.badge],
      ['Entrer le code au terminal', State.termOk]
    ];
  return [
    ['Récupérer le tournevis (casier cadenassé)', State.screwdriver || State.panelOpen],
    ['Dévisser le panneau du digicode', State.panelOpen],
    ['Entrer le code à 6 chiffres', State.unlocked],
    ['Ouvrir la porte du sas', State.door1]
  ];
}
function setObjective(t) {
  const rr = roomOf(rig.pos.z);
  document.getElementById('objt').textContent = t;
  document.getElementById('objl').textContent = 'ORDRE DE MISSION · SECTEUR ' + String(rr).padStart(2, '0');
  genSync();
  const u = document.getElementById('objs');
  if (u) {
    u.innerHTML = '';
    const add = (l, d, cls) => {
      const li = document.createElement('li');
      li.textContent = l;
      if (d) li.className = 'd';
      if (cls) li.classList.add(cls);
      u.appendChild(li);
    };
    subGoals0(rr).forEach(([l, d]) => add(l, d));
    const ql = questLines(rr),
      last = ql.pop();
    if (ql.length) {
      add('Opérations annexes', false, 'h');
      ql.forEach(([l, d]) => add(l.replace('Annexe — ', ''), d));
    }
    add(last[0], last[1], 'h');
  }
  refreshInvFull();
}

/* askCode(titre, longueur, bonCode, {note:[lignes]}) → Promise<boolean>
   Vrai pavé numérique : touches 0-9 / EFF / OK (souris, toucher ou clavier), bip à chaque pression, écran à LED :
   « VÉRIFICATION… » puis « ACCÈS ACCORDÉ » (vert) ou « CODE REFUSÉ » (rouge + secousse). `note` affiche un post-it à côté du pavé. */
function askCode(title, len, answer, opts = {}) {
  return new Promise((res) => {
    const m = document.getElementById('keypad'),
      d = document.getElementById('digs'),
      g = document.getElementById('kgrid'),
      st = document.getElementById('kst'),
      side = document.getElementById('kside');
    document.getElementById('kt').textContent = title;
    d.innerHTML = '';
    g.innerHTML = '';
    d.className = 'digs';
    let buf = '',
      busy = false;
    const slots = [...Array(len)].map(() => {
      const sp = document.createElement('span');
      d.appendChild(sp);
      return sp;
    });
    const draw = () => slots.forEach((sp, i) => (sp.textContent = i < buf.length ? '●' : ''));
    const status = (t, c = '') => {
      st.textContent = t;
      st.className = c;
    };
    const btns = {};
    const close = (ok) => {
      removeEventListener('keydown', kh, true);
      m.classList.remove('on');
      modalOpen = false;
      res(ok);
    };
    const submit = () => {
      if (buf.length < len) {
        SND.play('error');
        status('CODE INCOMPLET', 'err');
        return;
      }
      busy = true;
      status('VÉRIFICATION…', 'wait');
      setTimeout(() => {
        if (buf === answer) {
          status('ACCÈS ACCORDÉ', 'ok');
          d.classList.add('okk');
          SND.play('success');
          setTimeout(() => close(true), 700);
        } else {
          SND.play('error');
          status('CODE REFUSÉ', 'err');
          d.classList.add('bad', 'shake');
          setTimeout(() => {
            d.classList.remove('bad', 'shake');
            buf = '';
            busy = false;
            status('');
            draw();
          }, 700);
        }
      }, 350);
    };
    const press = (k) => {
      if (busy) return;
      const b = btns[k];
      if (b) {
        b.classList.add('dn');
        setTimeout(() => b.classList.remove('dn'), 90);
      }
      if (k === 'EFF') {
        buf = '';
        SND.play('click');
        status('');
        draw();
      } else if (k === 'OK') submit();
      else if (buf.length < len) {
        buf += k;
        SND.play('key');
        status('');
        draw();
      }
    };
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'EFF', '0', 'OK'].forEach((k) => {
      const b = document.createElement('button');
      b.className = 'kb' + (k === 'EFF' ? ' kclr' : k === 'OK' ? ' kok' : '');
      b.textContent = k;
      b.onclick = () => press(k);
      btns[k] = b;
      g.appendChild(b);
    });
    function kh(e) {
      e.stopPropagation();
      const c = e.code;
      if (/^(Digit|Numpad)\d$/.test(c)) {
        press(c.slice(-1));
        e.preventDefault();
      } else if (c === 'Backspace') {
        press('EFF');
        e.preventDefault();
      } else if (c === 'Enter' || c === 'NumpadEnter') {
        press('OK');
        e.preventDefault();
      } else if (c === 'Escape') {
        close(false);
      }
    }
    addEventListener('keydown', kh, true);
    if (opts.note) {
      side.style.display = 'block';
      side.innerHTML =
        '<div class="kpost">' +
        opts.note[0] +
        '<b>' +
        opts.note[1] +
        '</b></div><small>NOTE TROUVÉE SUR PLACE</small>';
    } else side.style.display = 'none';
    document.getElementById('kno').onclick = () => close(false);
    status('');
    draw();
    m.classList.add('on');
    modalOpen = true;
  });
}
