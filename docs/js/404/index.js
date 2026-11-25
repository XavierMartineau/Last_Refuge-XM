(() => {
  const root = document.documentElement;
  const devToggle = document.querySelector("#dev-mode-toggle");
  const devPanel = document.querySelector("#dev-panel");
  const requestedPath = document.querySelector("#dev-requested-path");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const preferences = window.afterlockPreferences.load();

  function applyPreferences() {
    root.dataset.motion = reducedMotionQuery.matches ? "off" : preferences.motion;
    root.dataset.contrast = preferences.contrast ? "high" : "standard";
  }

  devToggle.addEventListener("click", () => {
    const expanded = devToggle.getAttribute("aria-expanded") !== "true";
    devToggle.setAttribute("aria-expanded", String(expanded));
    devPanel.hidden = !expanded;
    root.dataset.devMode = expanded ? "on" : "off";
  });

  requestedPath.textContent = window.location.pathname;
  reducedMotionQuery.addEventListener("change", applyPreferences);
  applyPreferences();
})();
