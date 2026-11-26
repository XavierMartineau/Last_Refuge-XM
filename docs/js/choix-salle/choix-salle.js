(() => {
  const root = document.documentElement;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const preferences = window.afterlockPreferences.load();
  const store = window.lastRefugeProgress;
  const rooms = Array.isArray(window.LAST_REFUGE_ESCAPE_ROOMS) ? window.LAST_REFUGE_ESCAPE_ROOMS : [];
  const $ = (id) => document.getElementById(id);
  let progress = store.load();
  let sortKey = "difficulty";
  let focusedId = progress.roomId || (rooms.find((r) => r.url) || rooms[0] || {}).id;

  root.dataset.motion = motionQuery.matches ? "off" : preferences.motion;
  root.dataset.contrast = preferences.contrast ? "high" : "standard";

  const skulls = (n) => "☠".repeat(n) + "<i>" + "☠".repeat(5 - n) + "</i>";
  const formatTime = ([min, max]) => `${min}–${max} min`;
  const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[c]);
  const sorters = {
    difficulty: (a, b) => a.difficulty - b.difficulty || a.rooms - b.rooms,
    rooms: (a, b) => a.rooms - b.rooms || a.difficulty - b.difficulty,
    time: (a, b) => a.minutes[0] - b.minutes[0] || a.minutes[1] - b.minutes[1]
  };

  function renderList() {
    const playable = rooms.filter((r) => r.url).length;
    $("choix-count").textContent = `${rooms.length} DOSSIERS · ${playable} JOUABLE${playable > 1 ? "S" : ""}`;
    $("choix-warning").hidden = progress.characterDone;
    $("er-list").innerHTML = [...rooms].sort(sorters[sortKey]).map((room) => `
      <button type="button" role="radio" class="er-item${room.url ? "" : " er-item--soon"}" data-id="${esc(room.id)}" aria-checked="${room.id === focusedId}">
        <span class="er-item__code">${esc(room.code)}</span>
        <span class="er-item__name">${esc(room.name)}${room.id === progress.roomId ? " <em>✔ CHOISIE</em>" : ""}</span>
        <span class="er-item__stats">
          <span class="er-skulls" title="Difficulté ${room.difficulty}/5">${skulls(room.difficulty)}</span>
          <span title="Nombre de salles">▦ ${room.rooms} salles</span>
          <span title="Durée estimée">◷ ${formatTime(room.minutes)}</span>
        </span>
        <span class="er-item__status">${room.url ? "JOUABLE" : "EN PRÉPARATION"}</span>
      </button>`).join("");
    renderDetail();
  }

  function renderDetail() {
    const room = rooms.find((r) => r.id === focusedId);
    if (!room) { $("er-detail").innerHTML = ""; return; }
    const chosen = room.id === progress.roomId;
    let action;
    if (!room.url) action = `<div class="er-locked">🔒︎ Dossier en préparation — bientôt disponible</div>`;
    else if (!progress.characterDone) action = `<div class="er-locked">🔒︎ Terminez votre fiche d’écrou pour choisir cette salle</div>`;
    else action = `<button type="button" class="action-button action-button--primary er-choose" data-choose="${esc(room.id)}"><span>${chosen ? "Confirmer et revenir au plan" : "Choisir cette salle"}</span><span aria-hidden="true">▶</span></button>`;
    $("er-detail").innerHTML = `
      <header>
        <span class="er-detail__code">DOSSIER ${esc(room.code)}${chosen ? " · SALLE CHOISIE" : ""}</span>
        <h2>${esc(room.name)}</h2>
        <small>${esc(room.sector)}</small>
      </header>
      <dl class="er-metrics">
        <div><dt>Difficulté</dt><dd class="er-skulls">${skulls(room.difficulty)}</dd></div>
        <div><dt>Salles</dt><dd>${room.rooms}</dd></div>
        <div><dt>Durée estimée</dt><dd>${formatTime(room.minutes)}</dd></div>
      </dl>
      <p class="er-detail__desc">${esc(room.description)}</p>
      <blockquote class="er-detail__story"><span>RAPPORT DE SITUATION</span>${esc(room.narration)}</blockquote>
      <div class="er-detail__tags">${room.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      ${action}`;
  }

  $("er-list").addEventListener("click", (event) => {
    const item = event.target.closest(".er-item");
    if (!item) return;
    focusedId = item.dataset.id;
    renderList();
    $("er-list").querySelector(`[data-id="${CSS.escape(focusedId)}"]`).focus();
  });

  $("er-detail").addEventListener("click", (event) => {
    const button = event.target.closest("[data-choose]");
    if (!button) return;
    progress = store.update({ roomId: button.dataset.choose });
    location.href = "../info/info.html#etape-3";
  });

  document.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      sortKey = button.dataset.sort;
      document.querySelectorAll("[data-sort]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      renderList();
    });
  });

  renderList();
})();
