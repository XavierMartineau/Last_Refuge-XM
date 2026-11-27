/* LAST REFUGE · XM — Escape room « Sas 07 » · Menu de réglages (console commune) + manette Xbox.
   Fichier chargé en dernier par escape-room.js : il partage la portée globale des autres fichiers.

   Manette (disposition Xbox « standard ») :
     Stick gauche  marcher            Stick droit  regarder         L3  courir (bascule)
     A  interagir / prendre           B  s’accroupir / quitter le zoom
     X  recharger                     Y  lampe torche              RT  tirer · LT viser (maintenir)
     LB inventaire   RB carnet        View  carte                   R3  vue 1re / 3e personne
     Menu  réglages                   Croix ↑ carnet · ↓ inventaire
   En vue rapprochée (zoom sur un objet), un viseur se déplace au stick gauche et A clique dessous. */
'use strict';
{
  const R = window.LastRefugeReglages,
    PAD = window.LastRefugeManette;
  const menuEl = document.getElementById('menu');
  const $g = (id) => document.getElementById(id);
  const menuOn = () => menuEl.classList.contains('on');
  let S = R ? R.load() : {};

  /* ---------- application des réglages au jeu ---------- */
  const baseExposure = renderer.toneMappingExposure;
  const msgScale = { court: 0.6, normal: 1, long: 1.6 };
  function apply(id, v) {
    switch (id) {
      case 'master':
      case 'music':
      case 'sfx':
        SOUND[id] = v / 100;
        break;
      case 'sensitivity':
        CONTROLS.look.sensitivity = v / 10;
        break;
      case 'invertY':
        CONTROLS.look.invertY = !!v;
        break;
      case 'fov':
        CONFIG.fov = v;
        if (!State.focus) {
          camera.fov = rig.fov = v;
          camera.updateProjectionMatrix();
        }
        break;
      case 'brightness':
        renderer.toneMappingExposure = (baseExposure * v) / 100;
        break;
      case 'uiScale':
        document.documentElement.style.setProperty('--ui-scale', String(v / 100));
        break;
      case 'lowEnd':
        setLowEndMode(v);
        break;
      default:
        // touches clavier réaffectées dans la console de réglages
        if (id.startsWith('kb_') && CONTROLS.keys[id.slice(3)]) {
          CONTROLS.keys[id.slice(3)] = [].concat(v || []);
          keysDown.clear();
          try {
            keyTexts();
          } catch (e) {}
        }
    }
  }
  Object.keys(S)
    .filter((k) => k.startsWith('kb_'))
    .forEach((k) => apply(k, S[k]));

  // les textes du jeu affichent les touches choisies dans les réglages
  function keyTexts() {
    if (!R) return;
    const K = (a) => R.keyLabel([].concat(CONTROLS.keys[a] || [])[0]);
    const move = K('forward') + K('left') + K('back') + K('right');
    TEXTS.intro = `Vous reprenez conscience dans un sas plongé dans le noir. Votre lampe torche marche : ${K('flashlight')} pour l’allumer ou l’éteindre. Bougez la souris pour regarder, ${move} pour marcher (ou les joysticks de la manette).`;
    TEXTS.ui.flashOn = `🔦 Lampe : ON (${K('flashlight')})`;
    TEXTS.ui.flashOff = `🔦 Lampe : OFF (${K('flashlight')})`;
    TEXTS.msg.pressE = `Appuyez sur ${K('take')} (ou A à la manette) pour le prendre.`;
    TEXTS.ui.help = `Souris : regarder · ${move} : marcher · ${K('turnLeft')} ${K('turnRight')} : tourner · ${K('sprint')} : courir · ${K('crouch')} : s’accroupir · ${K('inventory')} : inventaire · ${K('objectives')} : objectifs · ${K('flashlight')} : lampe torche · ${K('view')} : vue 1re/3e personne · ${K('fire')} : tirer · Clic droit : viser · ${K('reload')} : recharger · Clic : interagir · Échap : menu`;
  }
  try {
    keyTexts();
  } catch (e) {
    console.warn('textes des touches', e);
  }
  ['master', 'music', 'sfx', 'sensitivity', 'invertY', 'fov', 'brightness', 'uiScale'].forEach(
    (k) => S[k] !== undefined && apply(k, S[k])
  );
  if (S.view) AV.tp = S.view !== 'fp';
  if (S.shadows === false) {
    renderer.shadowMap.enabled = false;
    scene.traverse((o) => {
      if (o.material)
        [].concat(o.material).forEach((m) => {
          m.needsUpdate = true;
        });
    });
  }
  setLowEndMode(S.lowEnd);
  // durée d’affichage des messages
  {
    const _say = say;
    say = function (t, ms = 5200) {
      return _say(t, Math.round(ms * (msgScale[S.subtitles] || 1)));
    };
  }

  /* ---------- menu Échap : console de réglages plein écran ---------- */
  let ui = null;
  if (R && menuEl) {
    menuEl.classList.add('rg-host');
    const act = (label, button, id, danger) => ({
      type: 'action',
      label,
      button,
      danger,
      run: () => {
        const b = $g(id);
        if (b) b.click();
      }
    });
    const partie = {
      id: 'partie',
      icon: 'partie',
      label: 'Partie',
      sections: [
        {
          title: 'Partie en cours',
          rows: [
            act('Reprendre la partie', 'Reprendre', 'menuok'),
            act('Lampe torche', 'Allumer / éteindre', 'fl'),
            act('Son du jeu', 'Couper / rétablir', 'snd'),
            act('Caméra', '1re / 3e personne', 'vw'),
            act('Compteur FPS', 'Afficher / masquer', 'fps-toggle'),
            act('Outils de test', 'Dev Mode', 'devmb'),
            act('Quitter l’escape room', 'Quitter', 'menuquit', true)
          ]
        }
      ]
    };
    // les boutons d’origine restent dans .box (masquée) : les actions de l’onglet « Partie » les déclenchent
    ui = R.mount(menuEl, {
      context: 'jeu',
      tab: 'partie',
      extraTabs: [partie],
      backLabel: 'Reprendre',
      handleEscape: false,
      isOpen: menuOn,
      onBack: () => $g('menuok').click(),
      onChange: (id, v, all) => {
        S = all;
        apply(id, v);
      }
    });
    ui.setTab('partie');
    // à chaque ouverture : revenir sur l’onglet Partie
    let wasOn = false;
    new MutationObserver(() => {
      const on = menuOn();
      if (on && !wasOn) {
        ui.refresh();
        ui.setTab('partie');
      }
      wasOn = on;
    }).observe(menuEl, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- manette ---------- */
  if (PAD) {
    const B = PAD.BUTTONS;
    const reticle = document.createElement('div');
    reticle.id = 'pad-reticle';
    document.body.appendChild(reticle);
    const toast = document.createElement('div');
    toast.id = 'pad-toast';
    document.body.appendChild(toast);
    const cursor = { x: innerWidth / 2, y: innerHeight / 2 };
    let sprint = false,
      lastHp = State.hp,
      toastT;
    const padKeys = new Set();
    const free = () => !rig.locked && !State.focus && !modalOpen && !State.doorExit;
    const dz = (v, d) => (Math.abs(v) < d ? 0 : (v - Math.sign(v) * d) / (1 - d));
    const setKey = (action, on) => {
      const code = CONTROLS.keys[action][0];
      if (!code) return;
      if (on) { keysDown.add(code); padKeys.add(code); }
      else { keysDown.delete(code); padKeys.delete(code); }
    };
    const releaseKeys = () => { padKeys.forEach((c) => keysDown.delete(c)); padKeys.clear(); };
    const showToast = (t) => {
      toast.textContent = t;
      toast.classList.add('on');
      clearTimeout(toastT);
      toastT = setTimeout(() => toast.classList.remove('on'), 2600);
    };
    const rumble = (a, b, ms) => {
      if (S.padVibration !== false) PAD.vibrate(a, b, ms);
    };
    const clickAt = (x, y) => {
      const e = { clientX: x, clientY: y };
      hover(e);
      click(e);
    };

    const topModal = () =>
      [...document.querySelectorAll('.modal.on, #invfull.on, #iv.on, #devc.on, #quitov')]
        .filter((m) => m.id !== 'quitov' || m.style.display === 'grid')
        .pop() || null;

    PAD.attach({
      menuActive: () => {
        const active = modalOpen || menuOn();
        if (active) {
          releaseKeys();
          padAim = false;
        }
        return active;
      },
      spatial: () => !menuOn() || topModal() !== menuEl,
      scope: topModal,
      onBack: () => {
        const cancel = $g('quitcancel');
        if (cancel && $g('quitov').style.display === 'grid') cancel.click();
        else PAD.tap('Escape');
      },
      onMenu: () => {
        if (menuOn()) $g('menuok').click();
      },
      onPad: (on) => {
        if (!on) padAim = false;
        document.body.classList.toggle('pad', on);
        if (ui) ui.setPad(on);
        releaseKeys();
      },
      onConnect: () => showToast('🎮 Manette connectée — appuyez sur Menu pour les réglages'),
      onFrame: (pad, { pressed, btn, dt }) => {
        if (!PAD.active) return;
        S = R ? R.load() : S;
        // boutons réaffectables (pb_*) : nom Xbox → index du bouton
        const P = (action, def) => {
          const i = PAD.index(S['pb_' + action] || def);
          return i < 0 ? -1 : i;
        };
        const hit = (action, def) => {
          const i = P(action, def);
          return i >= 0 && pressed(i);
        };
        const dl = (S.padDeadL ?? 12) / 100,
          dr = (S.padDeadR ?? 10) / 100,
          trig = (S.padTrigger ?? 35) / 100;
        const lx = dz(pad.axes[0] || 0, dl),
          ly = dz(pad.axes[1] || 0, dl);
        const rx = dz(pad.axes[2] || 0, dr),
          ry = dz(pad.axes[3] || 0, dr);
        const zoom = !!State.focus && !modalOpen;
        reticle.classList.toggle('on', zoom);

        if (zoom) {
          padAim = false;
          // vue rapprochée : viseur libre au stick gauche (ou droit), A = clic
          releaseKeys();
          cursor.x = Math.min(innerWidth - 4, Math.max(4, cursor.x + (lx + rx) * 900 * dt));
          cursor.y = Math.min(innerHeight - 4, Math.max(4, cursor.y + (ly + ry) * 900 * dt));
          reticle.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
          hover({ clientX: cursor.x, clientY: cursor.y });
          if (hit('interact', 'A')) clickAt(cursor.x, cursor.y);
          if (pressed(B.B)) release(true);
        } else {
          cursor.x = innerWidth / 2;
          cursor.y = innerHeight / 2;
          // marche (stick gauche) + course en bascule (L3)
          const mag = Math.hypot(lx, ly);
          if (hit('sprint', 'L3')) sprint = !sprint;
          if (mag < 0.2) sprint = false;
          setKey('forward', ly < -0.35);
          setKey('back', ly > 0.35);
          setKey('left', lx < -0.35);
          setKey('right', lx > 0.35);
          setKey('sprint', sprint);
          // regard (stick droit)
          if (free() && (rx || ry)) {
            const sx = (S.padLookX ?? 5) * 0.55,
              sy = (S.padLookY ?? 4) * 0.45,
              inv = S.padInvertY ? -1 : 1;
            rig.yaw -= rx * Math.abs(rx) * sx * dt;
            rig.pitch = THREE.MathUtils.clamp(
              rig.pitch - ry * Math.abs(ry) * sy * dt * inv,
              -CONTROLS.look.pitchLimit,
              CONTROLS.look.pitchLimit
            );
            rig.vy = rig.vp = 0;
          }
          // actions
          if (hit('interact', 'A') && free()) {
            const cx = innerWidth / 2,
              cy = innerHeight / 2,
              o = pick({ clientX: cx, clientY: cy });
            if (o && o.userData.actionType === 'pickup') takeNearest();
            else if (o) clickAt(cx, cy);
            else takeNearest();
          }
          if (hit('crouch', 'B')) touchCrouch = !touchCrouch;
          if (hit('reload', 'X')) reload();
          if (hit('flashlight', 'Y') && !modalOpen) toggleFlash();
          const fi = P('fire', 'RT'),
            fb = pad.buttons[fi],
            ai = P('aim', 'LT'),
            ab = pad.buttons[ai];
          padAim = !!(ab && free() && (ab.value > trig || (ab.pressed && ai !== B.LT && ai !== B.RT)));
          if (fb && (fb.value > trig || (fb.pressed && fi !== B.LT && fi !== B.RT))) {
            if (State.armed && AV.heldItem !== 'weapon') selectHeldItem('weapon');
            const before = State.ammo;
            fire();
            if (State.ammo !== before) rumble(0.35, 0.6, 70);
          }
          const tapAction = (name) => {
            const c = CONTROLS.keys[name] && CONTROLS.keys[name][0];
            if (c) PAD.tap(c);
          };
          if (hit('inventory', 'LB')) tapAction('inventory');
          if (hit('objectives', 'RB')) tapAction('objectives');
          if (hit('map', 'View')) tapAction('map');
          if (hit('view', 'R3')) tapAction('view');
        }
        if (pressed(B.MENU)) $g('menub').click();
        if (State.hp < lastHp) rumble(0.9, 0.5, 220);
        lastHp = State.hp;
      }
    });
    addEventListener('gamepaddisconnected', () => {
      releaseKeys();
      touchCrouch = false;
      reticle.classList.remove('on');
      showToast('Manette déconnectée');
    });
  }
}

/* ── Regard automatique à la souris (verrouillage du pointeur) ──
   La caméra suit la souris sans cliquer ; un viseur s’affiche au centre et le clic vise ce point.
   Échap libère le curseur et ouvre le menu. Le curseur redevient libre en vue rapprochée et dans les fenêtres. */
{
  const R = window.LastRefugeReglages;
  const canvas = renderer.domElement;
  const cross = document.createElement('div');
  cross.id = 'crosshair';
  document.body.appendChild(cross);
  const hint = document.createElement('div');
  hint.id = 'lock-hint';
  hint.textContent = 'Cliquez pour contrôler la caméra à la souris';
  document.body.appendChild(hint);
  const auto = () => !TOUCH && (!R || (R.load().mouseLook || 'auto') === 'auto');
  const locked = () => document.pointerLockElement === canvas;
  const freeLook = () => !rig.locked && !State.focus && !modalOpen && !State.doorExit;
  const center = () => {
    const r = canvas.getBoundingClientRect();
    return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
  };
  let wantMenu = false;

  const lock = () => {
    if (auto() && freeLook() && !locked() && canvas.requestPointerLock) {
      try {
        const p = canvas.requestPointerLock();
        if (p && p.catch) p.catch((error) => console.warn('Verrouillage du pointeur refusé :', error));
      } catch (error) {
        console.warn('Verrouillage du pointeur impossible :', error);
        say('Le navigateur refuse le regard automatique. Choisissez « Cliquer-glisser » dans les réglages.', 6000);
      }
    }
  };
  document.addEventListener('pointerlockerror', () => {
    say('Le navigateur refuse le regard automatique. Choisissez « Cliquer-glisser » dans les réglages.', 6000);
  });

  // clic : verrouille d’abord, puis vise le centre de l’écran
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return;
      if (!auto() || !freeLook()) return;
      e.stopImmediatePropagation();
      if (!locked()) lock();
    },
    true
  );
  canvas.addEventListener(
    'pointerup',
    (e) => {
      if (e.button !== 0) return;
      if (!auto() || !locked()) return;
      e.stopImmediatePropagation();
      click(center());
    },
    true
  );
  canvas.addEventListener(
    'pointermove',
    (e) => {
      if (auto() && locked()) e.stopImmediatePropagation();
    },
    true
  );

  // mouvement de la souris → regard
  addEventListener('mousemove', (e) => {
    if (!locked() || !freeLook()) return;
    const L = CONTROLS.look,
      k = 0.0022 * L.sensitivity;
    rig.yaw -= e.movementX * k;
    rig.pitch = THREE.MathUtils.clamp(
      rig.pitch - e.movementY * k * (L.invertY ? -1 : 1),
      -L.pitchLimit,
      L.pitchLimit
    );
    rig.vy = rig.vp = 0;
  });

  // Échap pendant le verrouillage : le navigateur libère le curseur → on ouvre le menu
  document.addEventListener('pointerlockchange', () => {
    if (locked()) {
      document.body.classList.add('look-locked');
      return;
    }
    document.body.classList.remove('look-locked');
    if (wantMenu) {
      wantMenu = false;
      return;
    }
    if (freeLook() && auto()) {
      const b = document.getElementById('menub');
      if (b) b.click();
    }
  });

  // le menu « Reprendre » relance le verrouillage (c’est un clic de l’utilisateur)
  ['menuok', 'menux'].forEach((id) => {
    const b = document.getElementById(id);
    if (b) b.addEventListener('click', () => setTimeout(lock, 0));
  });

  // libérer le curseur dès qu’une fenêtre s’ouvre ou en vue rapprochée ; viseur + survol au centre
  let hoverT = 0;
  (function watch(t) {
    requestAnimationFrame(watch);
    const on = locked();
    if (on && !freeLook()) {
      wantMenu = true;
      document.exitPointerLock();
    }
    cross.classList.toggle('on', ((on && freeLook()) || isAiming()) && !(hasMagnifyingOptic() && aimBlend > 0.6));
    hint.classList.toggle('on', auto() && !on && freeLook() && !document.body.classList.contains('pad'));
    if ((on || (window.LastRefugeManette && window.LastRefugeManette.active)) && freeLook() && t - hoverT > 90) {
      hoverT = t;
      hover(center());
    }
  })(0);
}
