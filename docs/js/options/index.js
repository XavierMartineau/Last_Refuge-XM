(() => {
  const root = document.documentElement;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fallback = "../../../index.html";

  function applyPreferences(values) {
    root.dataset.motion = motionQuery.matches ? "off" : values.motion;
    root.dataset.contrast = values.contrast ? "high" : "standard";
  }

  /* ✕ : retour à la page d’où l’on vient (accueil, plan d’évasion, poste de garde…) */
  function close() {
    let sameSite = false;
    try { sameSite = document.referrer && new URL(document.referrer).origin === location.origin && !/options\.html/.test(document.referrer); } catch (e) { sameSite = false; }
    if (sameSite && history.length > 1) history.back();
    else if (document.referrer && !/options\.html/.test(document.referrer) && location.protocol === "file:") location.href = document.referrer;
    else location.href = fallback;
  }

  const ui = window.LastRefugeReglages.mount(document.getElementById("options-host"), {
    context: "site",
    backLabel: "Retour",
    onBack: close,
    onChange: (_id, _value, values) => applyPreferences(values)
  });
  applyPreferences(ui.values());
  motionQuery.addEventListener("change", () => applyPreferences(ui.values()));
  document.getElementById("options-close").addEventListener("click", close);
  if (window.LastRefugeManette) window.LastRefugeManette.attach({ onPad: (on) => ui.setPad(on) });
})();
