(() => {
  const root = document.documentElement;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const preferences = window.afterlockPreferences.load();
  const overview = document.getElementById("hub-overview");
  const creator = document.getElementById("hub-creator");
  const frame = document.getElementById("creator-frame");
  const openCreator = document.getElementById("open-creator");
  const closeCreator = document.getElementById("close-creator");
  let viewportUpdate;

  function applyPreferences() {
    root.dataset.motion = motionQuery.matches ? "off" : preferences.motion;
    root.dataset.contrast = preferences.contrast ? "high" : "standard";
  }

  motionQuery.addEventListener("change", applyPreferences);
  applyPreferences();

  function showOverview() {
    document.body.classList.remove("hub-modal-open");
    creator.hidden = true;
    overview.hidden = false;
    openCreator.focus();
  }

  openCreator.addEventListener("click", (event) => {
    event.preventDefault();
    overview.hidden = true;
    creator.hidden = false;
    if (!frame.hasAttribute("src")) frame.src = frame.dataset.src;
    closeCreator.focus();
    queueViewportUpdate();
  });

  function queueViewportUpdate() {
    if (creator.hidden || viewportUpdate) return;
    viewportUpdate = requestAnimationFrame(() => {
      viewportUpdate = 0;
      frame.contentWindow.postMessage({
        type: "afterlock-creator-viewport",
        top: frame.getBoundingClientRect().top,
        height: window.innerHeight
      }, "*");
    });
  }

  closeCreator.addEventListener("click", showOverview);
  frame.addEventListener("load", queueViewportUpdate);
  window.addEventListener("scroll", queueViewportUpdate, { passive: true });
  window.addEventListener("resize", queueViewportUpdate);
  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow || !event.data || typeof event.data !== "object") return;
    if (event.data.type === "afterlock-creator-height" && Number.isFinite(event.data.height) &&
        event.data.height >= 0 && event.data.height <= 100000) {
      frame.style.height = `${Math.ceil(event.data.height)}px`;
      queueViewportUpdate();
    } else if (event.data.type === "afterlock-creator-close") {
      showOverview();
    } else if (event.data.type === "afterlock-creator-modal" && typeof event.data.open === "boolean") {
      document.body.classList.toggle("hub-modal-open", event.data.open);
      queueViewportUpdate();
    }
  });
})();
