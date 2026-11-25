(() => {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function applyPreferences() {
    const preferences = window.afterlockPreferences.load();
    document.documentElement.dataset.motion = motionQuery.matches ? "off" : preferences.motion;
    document.documentElement.dataset.contrast = preferences.contrast ? "high" : "standard";
  }
  motionQuery.addEventListener("change", applyPreferences);
  applyPreferences();
})();
