(() => {
  const root = document.documentElement;
  const motionSetting = document.querySelector("#motion-setting");
  const soundSetting = document.querySelector("#sound-setting");
  const contrastSetting = document.querySelector("#contrast-setting");
  const settingsStatus = document.querySelector("#settings-status");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const preferences = window.afterlockPreferences.load();

  function updateStatus() {
    settingsStatus.textContent = reducedMotionQuery.matches
      ? "La préférence système maintient les animations désactivées."
      : "Vos préférences sont enregistrées sur cet appareil.";
  }

  function applySettings() {
    root.dataset.motion = reducedMotionQuery.matches ? "off" : preferences.motion;
    root.dataset.contrast = preferences.contrast ? "high" : "standard";
    motionSetting.value = preferences.motion;
    soundSetting.checked = preferences.sound;
    contrastSetting.checked = preferences.contrast;
    updateStatus();
  }

  function saveSettings() {
    const saved = window.afterlockPreferences.save(preferences);
    applySettings();
    if (!saved) {
      settingsStatus.textContent = "Impossible d’enregistrer les réglages dans ce navigateur.";
    } else if (reducedMotionQuery.matches) {
      settingsStatus.textContent = "Réglages enregistrés; la préférence système garde les animations coupées.";
    } else {
      settingsStatus.textContent = "Réglages enregistrés et appliqués.";
    }
  }

  motionSetting.addEventListener("change", () => {
    preferences.motion = motionSetting.value;
    saveSettings();
  });

  soundSetting.addEventListener("change", () => {
    preferences.sound = soundSetting.checked;
    saveSettings();
  });

  contrastSetting.addEventListener("change", () => {
    preferences.contrast = contrastSetting.checked;
    saveSettings();
  });

  reducedMotionQuery.addEventListener("change", applySettings);
  applySettings();
})();
