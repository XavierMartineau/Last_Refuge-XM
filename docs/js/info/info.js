(() => {
  const root = document.documentElement;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const preferences = window.afterlockPreferences.load();
  const store = window.lastRefugeProgress;
  const rooms = Array.isArray(window.LAST_REFUGE_ESCAPE_ROOMS) ? window.LAST_REFUGE_ESCAPE_ROOMS : [];
  const $ = (id) => document.getElementById(id);

  const overview = $("hub-overview");
  const creator = $("hub-creator");
  const frame = $("creator-frame");
  const openCreator = $("open-creator");
  const closeCreator = $("close-creator");
  const game = $("hub-game");
  const gameFrame = $("game-frame");
  const [stepOne, stepTwo, stepThree] = document.querySelectorAll("[data-step]");
  let progress = store.load();

  /* ---------- Préférences ---------- */
  function applyPreferences() {
    root.dataset.motion = motionQuery.matches ? "off" : preferences.motion;
    root.dataset.contrast = preferences.contrast ? "high" : "standard";
  }
  motionQuery.addEventListener("change", applyPreferences);
  applyPreferences();

  /* ---------- Étapes verrouillées ---------- */
  const skulls = (n) => "☠".repeat(n) + "<i>" + "☠".repeat(5 - n) + "</i>";
  const selectedRoom = () => rooms.find((room) => room.id === progress.roomId && room.url) || null;

  function setLocked(card, locked, reason) {
    card.classList.toggle("is-locked", locked);
    card.toggleAttribute("inert", locked);
    card.querySelector(".step-lock strong").textContent = reason;
  }

  function badge(card, html, kind) {
    const el = card.querySelector(".hub-badge");
    el.className = "hub-badge" + (kind ? ` hub-badge--${kind}` : "");
    el.innerHTML = html;
  }

  function render() {
    const room = selectedRoom();
    const summary = (r) => `<b>${r.code} — ${r.name}</b><span><em class="er-skulls">${skulls(r.difficulty)}</em> · ${r.rooms} salles · ${r.minutes[0]}–${r.minutes[1]} min</span>`;

    // Étape 1 : toujours ouverte
    stepOne.classList.toggle("is-done", progress.characterDone);
    badge(stepOne, progress.characterDone ? "<i></i> TERMINÉE" : "<i></i> DISPONIBLE", "active");
    $("open-creator").querySelector(".open-creator__label").textContent =
      progress.characterDone ? "Modifier mon détenu" : "Créer mon détenu";

    // Étape 2 : ouverte quand la fiche d’écrou est terminée
    setLocked(stepTwo, !progress.characterDone, "Terminez votre fiche d’écrou");
    stepTwo.classList.toggle("is-done", Boolean(room));
    if (!progress.characterDone) badge(stepTwo, "🔒︎ VERROUILLÉE", "locked");
    else badge(stepTwo, room ? "<i></i> SALLE CHOISIE" : "<i></i> À CHOISIR", "active");
    $("room-summary").innerHTML = room ? summary(room) : "Aucune salle choisie.";
    $("choose-room-label").textContent = room ? "Changer de salle" : "Trouver ma salle d’évasion";

    // Étape 3 : barrée tant qu’aucune salle n’est choisie
    setLocked(stepThree, !room, progress.characterDone ? "Choisissez une salle d’évasion" : "Étapes 1 et 2 requises");
    if (room) badge(stepThree, "<i></i> PRÊT AU LANCEMENT", "test");
    else badge(stepThree, "🔒︎ VERROUILLÉE", "locked");
    $("launch-summary").innerHTML = room ? summary(room) : "Aucune salle d’évasion sélectionnée.";
    const launch = $("launch-button");
    if (room) {
      launch.href = room.url;
      launch.removeAttribute("aria-disabled");
    } else {
      launch.setAttribute("aria-disabled", "true");
    }
  }

  $("reset-progress").addEventListener("click", () => {
    progress = store.update({ characterDone: false, roomId: null });
    render();
  });

  /* ---------- Étape 1 : créateur 3D intégré ---------- */
  function showOverview(target) {
    document.body.classList.remove("hub-modal-open");
    creator.hidden = true;
    game.hidden = true;
    overview.hidden = false;
    if (target) {
      target.scrollIntoView({ block: "center" });
      target.focus({ preventScroll: true });
    } else {
      openCreator.focus();
    }
  }

  openCreator.addEventListener("click", (event) => {
    event.preventDefault();
    overview.hidden = true;
    creator.hidden = false;
    if (!frame.hasAttribute("src")) frame.src = frame.dataset.src;
    window.scrollTo(0, 0);
    closeCreator.focus();
  });

  closeCreator.addEventListener("click", () => showOverview());

  window.addEventListener("message", (event) => {
    if (!event.data || typeof event.data !== "object") return;
    if (event.source === frame.contentWindow) {
      if (event.data.type === "afterlock-creator-close") {
        if (event.data.done) {
          progress = store.update({ characterDone: true });
          render();
          showOverview(stepTwo);
        } else {
          showOverview();
        }
      } else if (event.data.type === "afterlock-creator-modal" && typeof event.data.open === "boolean") {
        document.body.classList.toggle("hub-modal-open", event.data.open);
      }
    } else if (gameFrame && event.source === gameFrame.contentWindow && event.data.type === "lastrefuge-game-quit") {
      exitGame();
    }
  });

  /* ---------- Étape 3 : lancement en immersion complète ---------- */
  function exitGame() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    gameFrame.removeAttribute("src");
    showOverview(stepThree);
  }

  $("launch-button").addEventListener("click", (event) => {
    const room = selectedRoom();
    event.preventDefault();
    if (!room) return;
    overview.hidden = true;
    game.hidden = false;
    $("game-title").textContent = `${room.code} — ${room.name}`;
    gameFrame.src = room.url;
    if (game.requestFullscreen) {
      game.requestFullscreen({ navigationUI: "hide" }).catch(() => { /* plein écran refusé : la vue reste en pleine fenêtre */ });
    }
    gameFrame.focus();
  });

  $("exit-game").addEventListener("click", exitGame);
  document.addEventListener("fullscreenchange", () => {
    game.classList.toggle("is-fullscreen", document.fullscreenElement === game);
  });

  // la progression peut changer dans un autre onglet (créateur autonome, choix de salle)
  window.addEventListener("storage", () => { progress = store.load(); render(); });
  window.addEventListener("pageshow", () => { progress = store.load(); render(); });

  render();
  const target = { "#etape-2": stepTwo, "#etape-3": stepThree }[location.hash];
  if (target) requestAnimationFrame(() => showOverview(target));
})();
