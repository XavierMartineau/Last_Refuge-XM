(() => {
  const root = document.documentElement;
  const viewport = document.querySelector("#dev-viewport");
  const motion = document.querySelector("#dev-motion");
  const contrast = document.querySelector("#dev-contrast");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function update() {
    const preferences = window.afterlockPreferences.load();
    const activeMotion = reducedMotionQuery.matches ? "off" : preferences.motion;
    const motionLabels = { full: "Fluides", reduced: "Réduites", off: "Désactivées" };
    root.dataset.motion = activeMotion;
    root.dataset.contrast = preferences.contrast ? "high" : "standard";
    viewport.textContent = `${window.innerWidth} × ${window.innerHeight} px`;
    motion.textContent = motionLabels[activeMotion];
    contrast.textContent = preferences.contrast ? "Renforcé" : "Standard";
  }

  window.addEventListener("resize", update);
  reducedMotionQuery.addEventListener("change", update);
  update();
})();
