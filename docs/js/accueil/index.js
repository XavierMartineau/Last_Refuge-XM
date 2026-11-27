(() => {
  const root = document.documentElement;
  const startButton = document.querySelector("#start-button");
  const quitButton = document.querySelector("#quit-button");
  const exitDialog = document.querySelector("#exit-dialog");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const preferences = window.afterlockPreferences.load();

  let audioContext;
  let audioUnavailable = false;
  let ambience;
  let ambienceUnavailable = false;

  function updateAmbience() {
    const settings = window.LastRefugeReglages.load();
    const enabled = settings.homeMusic === true;
    if (ambience) {
      ambience.enabled = enabled;
      const volume = enabled ? Math.max(0, Math.min(1, settings.master / 100)) *
        Math.max(0, Math.min(1, settings.music / 100)) * 0.035 : 0;
      ambience.gain.gain.setTargetAtTime(volume, ambience.context.currentTime, 0.15);
    }
  }

  function startAmbience() {
    if (ambience || ambienceUnavailable || !window.LastRefugeReglages.load().homeMusic) return;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      ambienceUnavailable = true;
      console.warn("L’ambiance sonore n’est pas prise en charge par ce navigateur.");
      return;
    }
    const context = new AudioContextConstructor();
    const gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(context.destination);
    const pad = context.createGain();
    pad.gain.value = 0.65;
    pad.connect(gain);
    const pulse = context.createOscillator();
    const pulseDepth = context.createGain();
    pulse.frequency.value = 0.06;
    pulseDepth.gain.value = 0.2;
    pulse.connect(pulseDepth);
    pulseDepth.connect(pad.gain);
    pulse.start();
    [55, 82.4, 110.3].forEach((frequency) => {
      const oscillator = context.createOscillator();
      const voice = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      voice.gain.value = frequency === 55 ? 0.55 : 0.18;
      oscillator.connect(voice);
      voice.connect(pad);
      oscillator.start();
    });
    const noise = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const wind = context.createBufferSource();
    wind.buffer = noise;
    wind.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 280;
    const windVolume = context.createGain();
    windVolume.gain.value = 0.09;
    wind.connect(filter);
    filter.connect(windVolume);
    windVolume.connect(pad);
    wind.start();

    const echo = context.createDelay(1);
    const feedback = context.createGain();
    const echoVolume = context.createGain();
    echo.delayTime.value = 0.48;
    feedback.gain.value = 0.26;
    echoVolume.gain.value = 0.3;
    echo.connect(feedback);
    feedback.connect(echo);
    echo.connect(echoVolume);
    echoVolume.connect(gain);
    const notes = [110, 116.54, 164.81, 146.83, 123.47, 98, 116.54, 87.31];
    let note = 0, nextNote = context.currentTime + 0.3;
    ambience = { context, gain, enabled: true };
    setInterval(() => {
      if (!ambience.enabled || context.state !== "running") {
        nextNote = context.currentTime + 0.3;
        return;
      }
      if (nextNote > context.currentTime + 0.25) return;
      nextNote = Math.max(nextNote, context.currentTime + 0.02);
      const tone = context.createOscillator();
      const envelope = context.createGain();
      tone.type = "triangle";
      tone.frequency.value = notes[note++ % notes.length];
      envelope.gain.setValueAtTime(0.0001, nextNote);
      envelope.gain.exponentialRampToValueAtTime(0.2, nextNote + 0.18);
      envelope.gain.exponentialRampToValueAtTime(0.0001, nextNote + 2.4);
      tone.connect(envelope);
      envelope.connect(gain);
      envelope.connect(echo);
      tone.start(nextNote);
      tone.stop(nextNote + 2.5);
      nextNote += 2.8;
    }, 250);
    context.resume().catch((error) => console.error("Impossible de démarrer l’ambiance sonore.", error));
    updateAmbience();
  }

  const firstInteraction = () => {
    startAmbience();
    if (ambience || ambienceUnavailable) {
      document.removeEventListener("pointerdown", firstInteraction);
      document.removeEventListener("keydown", firstInteraction);
    }
  };
  document.addEventListener("pointerdown", firstInteraction);
  document.addEventListener("keydown", firstInteraction);
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
