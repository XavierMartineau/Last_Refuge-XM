(() => {
  const root = document.documentElement;
  const startButton = document.querySelector("#start-button");
  const quitButton = document.querySelector("#quit-button");
  const exitDialog = document.querySelector("#exit-dialog");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const preferences = window.afterlockPreferences.load();

  let audioContext;
  let audioUnavailable = false;
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
})();
