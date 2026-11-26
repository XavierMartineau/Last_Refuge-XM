(() => {
  const root = document.documentElement;
  const viewport = document.querySelector("#dev-viewport");
  const motion = document.querySelector("#dev-motion");
  const contrast = document.querySelector("#dev-contrast");
  const sound = document.querySelector("#dev-sound");
  const network = document.querySelector("#dev-network");
  const protocol = document.querySelector("#dev-protocol");
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
    sound.textContent = preferences.sound ? "Activés" : "Désactivés";
    network.textContent = navigator.onLine ? "En ligne" : "Hors ligne";
    protocol.textContent = location.protocol === "file:" ? "Fichier local" : location.protocol.toUpperCase().replace(":", "");
  }

  window.addEventListener("resize", update);
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  window.addEventListener("storage", update);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) update();
  });
  reducedMotionQuery.addEventListener("change", update);
  update();
})();
