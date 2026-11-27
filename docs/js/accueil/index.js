(() => {
  const root = document.documentElement;
  const startButton = document.querySelector("#start-button");
  const quitButton = document.querySelector("#quit-button");
  const exitDialog = document.querySelector("#exit-dialog");
  const audioButton = document.querySelector("#home-audio");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const preferences = window.afterlockPreferences.load();

  let audioContext;
  let audioUnavailable = false;
  let ambience;

  function updateAmbience() {
    const settings = window.LastRefugeReglages.load();
    const enabled = settings.homeMusic === true;
    audioButton.setAttribute("aria-pressed", String(enabled && !!ambience));
    audioButton.textContent = !enabled ? "Activer l’ambiance sonore" :
      ambience ? "Couper l’ambiance sonore" : "Démarrer l’ambiance sonore";
    if (ambience) {
      const volume = enabled ? Math.max(0, Math.min(1, settings.master / 100)) *
        Math.max(0, Math.min(1, settings.music / 100)) * 0.035 : 0;
      ambience.gain.gain.setTargetAtTime(volume, ambience.context.currentTime, 0.15);
    }
  }

  function startAmbience() {
    if (ambience || !window.LastRefugeReglages.load().homeMusic) return;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      audioButton.disabled = true;
      audioButton.textContent = "Audio non disponible";
      console.warn("L’ambiance sonore n’est pas prise en charge par ce navigateur.");
      return;
    }
    const context = new AudioContextConstructor();
    const gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(context.destination);
    [55, 82.4, 110.3].forEach((frequency) => {
      const oscillator = context.createOscillator();
      const voice = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      voice.gain.value = frequency === 55 ? 0.55 : 0.18;
      oscillator.connect(voice);
      voice.connect(gain);
      oscillator.start();
    });
    ambience = { context, gain };
    context.resume().catch((error) => console.error("Impossible de démarrer l’ambiance sonore.", error));
    updateAmbience();
  }

  audioButton.addEventListener("click", () => {
    const settings = window.LastRefugeReglages.load();
    if (settings.homeMusic && !ambience) {
      startAmbience();
      return;
    }
    settings.homeMusic = !settings.homeMusic;
    window.LastRefugeReglages.save(settings);
    if (settings.homeMusic) startAmbience();
    updateAmbience();
  });
  const firstInteraction = (event) => {
    if (!audioButton.contains(event.target)) startAmbience();
  };
  document.addEventListener("pointerdown", firstInteraction, { once: true });
  document.addEventListener("keydown", firstInteraction, { once: true });
  window.addEventListener("lastrefuge-reglages", updateAmbience);
  window.addEventListener("storage", updateAmbience);

  function applyPreferences() {
    root.dataset.motion = reducedMotionQuery.matches ? "off" : preferences.motion;
    root.dataset.contrast = preferences.contrast ? "high" : "standard";
  }

  function playMechanicalClick() {
    if (!preferences.sound || audioUnavailable) return;

    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      audioUnavailable = true;
      console.warn("Les retours sonores ne sont pas pris en charge par ce navigateur.");
      return;
    }

    if (!audioContext) audioContext = new AudioContextConstructor();
    if (audioContext.state === "suspended") {
      audioContext.resume().catch((error) => {
        audioUnavailable = true;
        console.error("Impossible d’activer les retours sonores.", error);
      });
    }

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(420, now);
    oscillator.frequency.exponentialRampToValueAtTime(190, now + 0.055);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.08);
  }

  function openDialog(dialog) {
    if (!dialog.open) dialog.showModal();
  }

  function closeOnBackdrop(dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  startButton.addEventListener("click", playMechanicalClick);

  quitButton.addEventListener("click", () => {
    playMechanicalClick();
    window.close();
    if (!window.closed) openDialog(exitDialog);
  });

  reducedMotionQuery.addEventListener("change", applyPreferences);
  document.querySelectorAll(".modal").forEach(closeOnBackdrop);
  applyPreferences();
  updateAmbience();
})();
