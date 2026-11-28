/* LAST REFUGE · XM — Escape room « Sas 07 » · Caméras de surveillance des salles.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═══════════════ CAMÉRAS DE SURVEILLANCE ═══════════════
   • Une caméra au plafond de chaque salle suit le joueur des yeux.
   (La carte du bunker, touche M, a été retirée pour l’instant : voir l’historique git pour la rétablir.) */
const CCTV = (function () {
  const ZR = {
    1: [23.4, -4],
    2: [-4, -12],
    3: [-12, -22],
    4: [-22, -32],
    5: [-32, -72],
    6: [-72, -102]
  };
  /* ── Caméras de surveillance dans CHAQUE salle : elles suivent le joueur des yeux (quand il est dans leur salle) ── */
  const RC_Y = {
    1: 2.8,
    2: 2.8,
    3: 2.8,
    4: 2.8,
    5: 4.4,
    6: 4.4
  };
  const roomCams = [];
  for (let r = 1; r <= 6; r++) {
    const zT = ZR[r][0],
      zw = r === 1 ? zT - 0.5 : zT - 0.5,
      x = r === 1 ? 4 : 4.5,
      y = RC_Y[r];
    const arm = box(0.06, 0.06, 0.45, mats.steel, x, y + 0.12, zw + 0.2),
      head = new THREE.Group();
    head.position.set(x, y, zw);
    head.rotation.order = 'YXZ';
    scene.add(head);
    cyl(0.03, 0.18, mats.steel, 0, 0.1, 0, head, 8);
    const body = box(0.22, 0.2, 0.45, mats.dark, 0, 0, -0.12, head);
    body.castShadow = false;
    arm.castShadow = false;
    const lm = glow(0xff2a1a, 2.5);
    box(0.1, 0.1, 0.04, lm, 0, 0, -0.36, head);
    head.userData = { room: r, lm };
    head.rotation.y = 0;
    roomCams.push(head);
  }
  const _ang = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  function aim(head, tx, ty, tz, k) {
    const p = head.position,
      dx = tx - p.x,
      dy = ty - p.y,
      dz = tz - p.z,
      yaw = Math.atan2(-dx, -dz),
      pitch = Math.max(-1.1, Math.min(0.4, Math.atan2(dy, Math.hypot(dx, dz))));
    head.rotation.y += _ang(yaw - head.rotation.y) * k;
    head.rotation.x += (pitch - head.rotation.x) * k;
  }
  function track(dt, t) {
    const cur = roomOf(rig.pos.z),
      k = Math.min(1, dt * 4);
    roomCams.forEach((h) => {
      const r = h.userData.room;
      h.userData.lm.emissiveIntensity = Math.sin(t * 3 + r) > 0.3 ? 3 : 0.4;
      if (r === cur)
        aim(h, rig.pos.x, rig.pos.y - 0.25, rig.pos.z, k); // le joueur est dans la salle : la caméra le suit
      else {
        h.rotation.y += _ang(Math.sin(t * 0.45 + r) * 0.7 - h.rotation.y) * dt;
        h.rotation.x += (-0.3 - h.rotation.x) * dt;
      }
    }); // sinon : balayage lent
  }
  return { track };
})();

R('panel_blood_01', async (o) => {
  if (!State.bloodOpen) {
    if (!State.power) {
      SND.play('locked');
      return say(
        'Une plaque vissée, couverte de sang séché. À la lampe torche on ne distingue rien : il faudrait la lumière des néons pour travailler dessus.',
        5500
      );
    }
    if (!State.boltA) {
      if (!State.screwdriver) {
        SND.play('locked');
        return say(
          'La plaque est tenue par quatre vis. Les deux du haut sont cruciformes : il faut un tournevis. Les deux du bas sont des vis de sécurité rouillées.',
          6000
        );
      }
      await focusOn(o);
      await plateTool('driver', [0, 1]);
      State.boltA = true;
      say(
        'Les deux vis du haut tournent et tombent. Celles du bas sont des vis de sécurité rouillées : le tournevis glisse dessus. Il faut les percer avec une perceuse.',
        7500
      );
      setObjective(objectiveNow());
      return release();
    }
    if (!State.drill) {
      SND.play('locked');
      return say(
        'Les deux vis du bas sont des vis de sécurité rouillées : le tournevis ne mord pas. Il faut les percer avec une perceuse.',
        5500
      );
    }
    await focusOn(o);
    await plateTool('drill', [2, 3]);
    SND.play('unlock');
    State.bloodOpen = true;
    const y0 = bloodCover.position.y;
    await tween(1.0, (k) => {
      bloodCover.position.y = y0 - 0.9 * k * k;
      bloodCover.position.x = p1.position.x + 0.045 + 0.35 * k;
      bloodCover.rotation.z = 0.5 * k;
    });
    bloodCover.visible = false;
    SND.play('paper');
    say('Vous dévissez la plaque : derrière, des chiffres tracés dans le sang. ' + M.panel1, 7000);
    State.panelRead = true;
    return setObjective(objectiveNow());
  }
  SND.play('paper');
  await focusOn(o);
  say(M.panel1);
});
R('switch_power', (o) => {
  if (State.power) return say(M.powerAlready);
  if (!State.gen1) {
    SND.play('locked');
    return say(M.needGen);
  }
  if (!State.brkOk) {
    SND.play('locked');
    return say(
      'Le levier ne répond pas : le disjoncteur est ouvert. Il manque deux fusibles dans le tableau électrique voisin.',
      5500
    );
  }
  State.power = true;
  o.userData.state = 'on';
  o.userData.hint = Hn.switch_power_on;
  SND.play('lever');
  gameTimeout(() => SND.play('power'), 350);
  tween(0.6, (k) => {
    o.userData.arm.rotation.z = 0.65 - 1.3 * k;
  });
  o.userData.led.material = glow(0x30ff70, 3);
  screen1.draw(TEXTS.screens.term_on, '#5fe08a');
  say(M.powerOn);
  setObjective(TEXTS.objectives.needCode);
});
R('terminal_01', async (o) => {
  if (!State.power) {
    SND.play('error');
    return say(M.termNoPower);
  }
  if (!State.badge && !State.termOk) {
    SND.play('error');
    return say('Le terminal exige un badge d’accès. Il doit traîner dans un des casiers cadenassés…', 5500);
  }
  if (State.termOk) return say(fmt(M.termCode, { c: CONFIG.doorCode }), 7000);
  await focusOn(o);
  if (await askCode(TEXTS.ui.keypadTitle, 4, CONFIG.code)) {
    State.termOk = true;
    SND.play('success');
    screen1.draw([...TEXTS.screens.term_ok, '', 'CODE SAS : ' + CONFIG.doorCode], '#5fe08a');
    door1.userData.hint = 'Utiliser le digicode du sas';
    say(fmt(M.termOk, { c: CONFIG.doorCode }), 9000);
    setObjective(TEXTS.objectives.openDoor);
  } else say(M.termBad);
  release();
});
R('locker_03', (o) => {
  if (State.locker3) return say(M.locker3Done);
  State.locker3 = true;
  (o.children || []).forEach((c) => {
    if (c.userData && c.userData.hit) c.raycast = () => {};
  });
  o.userData.hint = Hn.locker_03_open;
  SND.play('latch');
  gameTimeout(() => SND.play('lockerdoor'), 140);
  tween(0.9, (k) => {
    o.userData.pivot.rotation.y = -1.9 * k;
  });
  gameTimeout(() => lockerStuff(true), 350);
  say(M.locker3Open, 6000);
});
R('note_log', async (o) => {
  if (!State.locker3) {
    SND.play('locked');
    return say(M.noteFirst);
  }
  SND.play('paper');
  await focusOn(o);
  say(M.note, 7000);
  if (!State.noteLocker) {
    State.noteLocker = true;
    renderInv();
    setObjective(objectiveNow());
  }
}); // la note va dans l'inventaire
R('battery_01', (o) => {
  State.battery = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say(M.batTaken, 4500);
  setObjective(objectiveNow());
});
R('fuelcan_01', (o) => {
  State.fuel = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say(M.fuelTaken, 4500);
  setObjective(objectiveNow());
});
const LKMSG = [
  'Le cadenas cède avec un claquement sec. Dans le casier : un bidon d’essence, intact.',
  'Le cadenas cède. Sur l’étagère : un tournevis cruciforme et une odeur de rouille.',
  'Le cadenas cède. Sur l’étagère : un badge d’accès, « Dr LEROY — niveau 2 ». Au fond, par terre : une perceuse sans fil.'
];
['locker_01', 'locker_02', 'locker_04'].forEach((id, i) =>
  R(id, (o) => {
    const u = o.userData,
      k = [0, 1, 3][i];
    if (u.cut) return say('Le casier est déjà ouvert.', 2500);
    if (!State.cutters) {
      SND.play('locked');
      return say('Cadenas rouillé : impossible à forcer à la main. Une pince coupante serait idéale.', 5200);
    }
    u.cut = true;
    (o.children || []).forEach((c) => {
      if (c.userData && c.userData.hit) c.raycast = () => {};
    });
    SND.play('cutlock');
    gameTimeout(() => SND.play('padfall'), 380);
    const pd = u.pad,
      py = pd.position.y;
    tween(
      0.5,
      (t) => {
        pd.position.y = py - 0.5 * t * t;
        pd.rotation.z = 1.4 * t;
        pd.position.z = 0.07 + 0.15 * t;
      },
      (t) => t
    ).then(() => {
      pd.visible = false;
    });
    gameTimeout(() => {
      SND.play('latch');
      gameTimeout(() => SND.play('lockerdoor'), 140);
      tween(0.9, (t) => {
        u.pivot.rotation.y = -1.9 * t;
      });
      lkShow(lkItems[k], true);
      say(LKMSG[i], 5500);
    }, 900);
  })
);
R('screwdriver_01', (o) => {
  State.screwdriver = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say('Un tournevis cruciforme. Utile pour tout ce qui est vissé.', 4000);
  setObjective(objectiveNow());
});
R('drill_01', (o) => {
  State.drill = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say('Une perceuse sans fil, batterie chargée. De quoi venir à bout des vis de sécurité.', 4500);
  setObjective(objectiveNow());
});
R('badge_01', (o) => {
  State.badge = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say('Un badge d’accès au nom de « Dr LEROY ». Le terminal devrait le reconnaître.', 4500);
  setObjective(objectiveNow());
});

// ── Pièce 2 ──
R('panel_blood_02', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.panel2);
});
R('valve_pipe', () => {
  SND.play('locked');
  say(M.valve);
});
R('tank_01', () => {
  SND.play('drip');
  say(M.tank);
});
const press = (o) => {
  if (State.solved) return say(M.consoleLocked);
  const k = o.userData.color,
    cap = o.userData.cap;
  SND.play('press', k);
  tween(0.25, (v) => {
    cap.position.y = 0.05 - 0.03 * Math.sin(v * Math.PI);
  });
  State.seq.push(k);
  const ok = State.seq.every((c, i) => c === CONFIG.sequence[i]);
  if (!ok) {
    State.seq = [];
    gameTimeout(() => SND.play('error'), 150);
    say(M.seqWrong);
    setMonitors(...TEXTS.screens.mon_err, '#ff6a5a');
    return;
  }
  if (State.seq.length === CONFIG.sequence.length) {
    State.solved = true;
    gameTimeout(() => {
      SND.play('success');
      SND.play('unlock');
    }, 250);
    doorExit.userData.led.material = glow(0x30ff70, 3);
    doorExit.userData.hint = Hn.door_exit_unlocked;
    setMonitors(...TEXTS.screens.mon_ok, '#7fe9ff');
    say(M.seqOk);
    setObjective(TEXTS.objectives.exit);
  } else say(fmt(M.seqProgress, { n: State.seq.length, total: CONFIG.sequence.length }), 2500);
};
['btn_green', 'btn_red', 'btn_blue'].forEach((id) => R(id, press));
// ── Portes : même logique pour les 4 (verrouillée → ouvrir → traverser) ──
const DOORS = [
  {
    id: 'door_room1',
    z: -4,
    flag: 'door1',
    ok: () => State.unlocked,
    locked: M.door1Locked,
    open: M.door1Open
  },
  { id: 'door_exit', z: -12, flag: 'door2', ok: () => State.solved, locked: M.exitLocked, open: M.exit2Open },
  {
    id: 'door_vault',
    z: -22,
    flag: 'door3',
    ok: () => State.vaultUnlocked,
    locked: M.vaultLocked,
    open: M.vaultOpen
  },
  {
    id: 'door_final',
    z: -32,
    flag: 'doorFinal',
    ok: () => State.power4,
    locked: M.finalLocked,
    open: M.finalOpen
  },
  {
    id: 'door_hangar',
    z: -72,
    flag: 'doorHangar',
    ok: () => State.power5,
    locked: M.hangarLocked,
    open: M.hangarOpen
  },
  {
    id: 'door_ware',
    z: -102,
    flag: 'doorWare',
    ok: () => State.wareCode,
    locked: M.wareLocked,
    open: M.wareOpen
  }
];
DOORS.forEach((D) =>
  R(D.id, (o) => {
    if (!D.ok()) {
      SND.play('locked');
      return say(D.locked);
    }
    if (!State[D.flag]) {
      State[D.flag] = true;
      o.userData.hint = Hn.door_room1_open;
      SND.play('door');
      openDoorAnim(o, 1.6);
      if (D.open) say(D.open);
      return;
    }
    passDoor(D.z);
  })
);
// porte du fond de la salle 6 : c’est la sortie du bunker, elle termine la partie
R('door_ware', (o) => {
  if (State.doorExit) return;
  if (!State.wareCode) {
    SND.play('locked');
    return say(M.wareLocked);
  }
  State.doorWare = true;
  State.doorExit = true; // fige les contrôles et lance la musique de sortie
  SND.play('door');
  openDoorAnim(o, 1.6);
  say(M.wareOpen, 4000);
  gameTimeout(() => {
    SND.play('success');
    document.getElementById('end').classList.add('on');
    modalOpen = true;
  }, 1800);
});

// porte du sas : il faut d’abord le code (terminal), puis le saisir sur le digicode de la porte
{
  const door1Open = Actions.handlers.door_room1;
  R('door_room1', async (o) => {
    if (State.door1) return door1Open(o);
    if (!State.termOk) {
      SND.play('locked');
      return say(M.door1Locked);
    }
    if (!State.unlocked && !State.panelOpen) {
      if (!State.screwdriver) {
        SND.play('locked');
        return say('Le panneau du digicode est vissé au mur. Il faut un tournevis pour y accéder.', 5500);
      }
      await focusOn(o);
      SND.play('click');
      gameTimeout(() => SND.play('unlock'), 350);
      State.panelOpen = true;
      say('Vous dévissez le panneau : le digicode apparaît, câbles à nu.', 4500);
      setObjective(objectiveNow());
      return release();
    }
    if (!State.unlocked) {
      await focusOn(o);
      if (await askCode(M.doorCodeTitle, 6, CONFIG.doorCode)) {
        State.unlocked = true;
        SND.play('success');
        gameTimeout(() => SND.play('unlock'), 450);
        o.userData.led.material = glow(0x30ff70, 3);
        o.userData.hint = Hn.door_room1_unlocked;
        say(M.doorUnlocked);
      } else {
        say(M.doorBad);
      }
      return release();
    }
    door1Open(o);
  });
}
// ── Décors cliquables ──
R('bag_01', () => {
  SND.play('locked');
  say(M.bag);
});
R('toolbox_01', (o) => {
  const u = o.userData;
  if (State.cutters) return say('Il ne reste que de la rouille et un vieux boulon.');
  State.cutters = true;
  State.fz = (State.fz || 0) + 1;
  SND.play('locker');
  tween(0.6, (k) => {
    u.lid.rotation.x = -1.9 * k;
  });
  renderInv();
  say(
    'Au fond de la caisse : une pince coupante, assez grosse pour venir à bout d’un cadenas, et un fusible 30 A.',
    6000
  );
  setObjective(objectiveNow());
});
R('medcab', () => {
  SND.play('locked');
  say(M.medcab);
});
['rack_01', 'rack_02'].forEach((id) =>
  R(id, () => {
    SND.play('click');
    say(M.rack);
  })
);
R('note_desk', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.noteDesk, 7000);
});

// ── Pièce 3 ──
R('sticky_safe', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say('Un post-it collé au mur, à côté du coffre : « ' + CONFIG.safeCode.split('').join(' ') + ' ».', 6000);
});
R('note_safe', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.noteSafe, 7000);
});
R('radio_01', () => {
  SND.play('radio');
  say(M.radio, 6500);
});
R('safe_01', async (o) => {
  if (State.safe) return say(M.safeDone);
  await focusOn(o);
  if (
    await askCode(TEXTS.ui.safeTitle, 4, CONFIG.safeCode, {
      note: ['CODE DU COFFRE', CONFIG.safeCode.split('').join(' ')]
    })
  ) {
    State.safe = true;
    o.userData.hint = Hn.safe_01_open;
    SND.play('success');
    gameTimeout(() => SND.play('locker'), 300);
    tween(0.9, (k) => {
      o.userData.pivot.rotation.y = -1.9 * k;
    });
    card.visible = true;
    delete card.raycast;
    say(M.safeOpen);
  } else say(M.safeBad);
  release();
});
R('keycard', (o) => {
  State.card = true;
  o.visible = false;
  o.raycast = () => {};
  SND.play('paper');
  renderInv();
  say(M.cardTaken);
  setObjective(TEXTS.objectives.needCard);
});
R('reader_01', (o) => {
  if (State.vaultUnlocked) return say(M.readerDone);
  if (!State.card) {
    SND.play('error');
    return say(M.readerNoCard);
  }
  State.vaultUnlocked = true;
  State.card = false;
  renderInv();
  SND.play('success');
  gameTimeout(() => SND.play('unlock'), 400);
  o.userData.led.material = glow(0x30ff70, 3);
  doorVault.userData.led.material = glow(0x30ff70, 3);
  doorVault.userData.hint = Hn.door_vault_unlocked;
  say(M.readerOk);
  setObjective(TEXTS.objectives.openVault);
});

// ── Pièce 4 ──
R('panel_blood_03', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.panel3);
});
R('gen_01', () => {
  SND.play('click');
  say(State.power4 ? M.genOn : M.genOff);
});
for (let i = 1; i <= 4; i++)
  R(`brk_${i}`, (o) => {
    if (State.power4) return say(M.genOn);
    const j = o.userData.idx;
    State.brk[j] ^= 1;
    SND.play('lever');
    const a = o.userData.arm,
      from = a.rotation.x,
      to = State.brk[j] ? -0.7 : 0.7;
    tween(0.25, (k) => {
      a.rotation.x = from + (to - from) * k;
    });
    o.userData.led.material = glow(State.brk[j] ? 0x30ff70 : 0xff2a1a, 3);
    if (State.brk.every((v, n) => v === CONFIG.breakers[n])) {
      State.power4 = true;
      gameTimeout(() => SND.play('genstart'), 300);
      gen.userData.led.material = glow(0x30ff70, 3);
      doorFinal.userData.led.material = glow(0x30ff70, 3);
      doorFinal.userData.hint = Hn.door_final_unlocked;
      say(M.brkOk, 7000);
      setObjective(TEXTS.objectives.exitFinal);
    } else say(fmt(M.brkToggle, { n: j + 1, s: State.brk[j] ? 'ON' : 'OFF' }), 2000);
  });
// ── Pièces 5 à 7 ──
['fuse_1', 'fuse_2', 'fuse_3'].forEach((id) =>
  R(id, (o) => {
    State.fuses++;
    hideObj(o);
    SND.play('click');
    renderInv();
    say(fmt(M.fuseTaken, { n: State.fuses + State.fusesIn }));
  })
);
R('fusebox_01', (o) => {
  if (State.power5) return say(M.fuseboxDone);
  if (State.fuses < 1) {
    SND.play('locked');
    return say(M.fuseboxNone);
  }
  const k = State.fuses;
  State.fusesIn += k;
  State.fuses = 0;
  renderInv();
  SND.play('locker');
  o.userData.leds.forEach((l, i) => {
    if (i < State.fusesIn) l.material = glow(0x30ff70, 3);
  });
  if (State.fusesIn >= 3) {
    State.power5 = true;
    gameTimeout(() => {
      SND.play('success');
      SND.play('genstart');
    }, 350);
    doorHangar.userData.led.material = glow(0x30ff70, 3);
    doorHangar.userData.hint = Hn.door_hangar_unlocked;
    say(M.fuseboxOk, 7000);
    setObjective(TEXTS.objectives.openHangar);
  } else say(fmt(M.fuseboxIn, { k, n: State.fusesIn }));
});
[1, 2, 3, 4].forEach((n) =>
  R('poster_' + n, async (o) => {
    SND.play('paper');
    await focusOn(o);
    say(fmt(M.poster, { n, d: CONFIG.wareCode[n - 1] }), 7000);
  })
);
R('keypad_ware', async (o) => {
  if (State.wareCode) return say(M.wareDone);
  await focusOn(o);
  if (await askCode(M.wareTitle, CONFIG.wareCode.length, CONFIG.wareCode.join(''))) {
    State.wareCode = true;
    SND.play('success');
    gameTimeout(() => SND.play('unlock'), 350);
    o.userData.led.material = glow(0x30ff70, 3);
    doorWare.userData.led.material = glow(0x30ff70, 3);
    doorWare.userData.hint = Hn.door_ware_unlocked;
    say(M.wareOk);
    setObjective(TEXTS.objectives.openWare);
  } else say(M.wareBad);
  release();
});
