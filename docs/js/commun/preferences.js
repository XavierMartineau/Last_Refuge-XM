(() => {
  const storageKey = "afterlock.preferences";
  const defaults = Object.freeze({
    motion: "full",
    sound: false,
    contrast: false
  });

  function normalize(value) {
    return {
      motion: ["full", "reduced", "off"].includes(value.motion) ? value.motion : defaults.motion,
      sound: value.sound === true,
      contrast: value.contrast === true
    };
  }

  function load() {
    let serialized;
    try {
      serialized = localStorage.getItem(storageKey);
    } catch (error) {
      console.error("Impossible de lire les préférences AFTERLOCK.", error);
      return { ...defaults };
    }

    if (!serialized) return { ...defaults };

    try {
      const value = JSON.parse(serialized);
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        console.error("Les préférences AFTERLOCK enregistrées sont invalides.");
        return { ...defaults };
      }
      return normalize(value);
    } catch (error) {
      console.error("Impossible de décoder les préférences AFTERLOCK.", error);
      return { ...defaults };
    }
  }

  function save(value) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(normalize(value)));
      return true;
    } catch (error) {
      console.error("Impossible d’enregistrer les préférences AFTERLOCK.", error);
      return false;
    }
  }

  window.afterlockPreferences = { load, save };
})();

/* ---------- Mode daltonien : correction des couleurs sur toute la page (site et jeu) ----------
   Réglages « colorblind » (non, deuteranopie, protanopie, tritanopie) et « cbStrength » (0 à 10),
   enregistrés par la console de réglages dans « lastrefuge.reglages ».
   Principe (daltonisation) : on simule la vision du type choisi, on calcule l’information perdue,
   puis on la reporte sur les canaux encore bien perçus. */
(() => {
  const SIMULATION = {
    protanopie: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deuteranopie: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
    tritanopie: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]]
  };
  // report de l’information perdue vers les canaux visibles
  const SHIFT = {
    protanopie: [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]],
    deuteranopie: [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]],
    tritanopie: [[1, 0, 0.7], [0, 1, 0.7], [0, 0, 0]]
  };

  function matrix(type, strength, mode = "correction") {
    const S = SIMULATION[type], M = SHIFT[type], k = Math.max(0, Math.min(10, strength)) / 10;
    const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    // simulation : montre la scène telle qu’une personne daltonienne la perçoit
    if (mode === "simulation") return I.map((row, i) => row.map((v, j) => v + k * (S[i][j] - v)));
    const E = I.map((row, i) => row.map((v, j) => v - S[i][j]));                       // information perdue
    const ME = M.map((row) => [0, 1, 2].map((j) => row.reduce((acc, v, t) => acc + v * E[t][j], 0)));
    return I.map((row, i) => row.map((v, j) => v + k * ME[i][j]));                      // couleur corrigée
  }

  function apply() {
    let r = {};
    try { r = JSON.parse(localStorage.getItem("lastrefuge.reglages") || "{}") || {}; } catch (e) { r = {}; }
    const type = r.colorblind || "non", strength = r.cbStrength ?? 10, mode = r.cbMode || "correction";
    const root = document.documentElement;
    root.dataset.daltonienType = SIMULATION[type] && strength > 0 ? type : "non";
    const active = SIMULATION[type] && strength > 0;
    // pages 3D (escape room) : la scène est corrigée par le GPU, le filtre CSS ne touche que l’interface
    const hudOnly = root.dataset.daltonien === "hud";
    dispatchEvent(new CustomEvent("lastrefuge-daltonien", { detail: { active, type, strength, mode, matrix: active ? matrix(type, strength, mode) : null } }));
    let hudStyle = document.getElementById("lr-daltonien-hud");
    if (!active) { root.style.removeProperty("filter"); if (hudStyle) hudStyle.textContent = ""; return; }
    let svg = document.getElementById("lr-daltonien");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = "lr-daltonien";
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
      svg.innerHTML = '<filter id="lr-daltonien-filtre" color-interpolation-filters="sRGB"><feColorMatrix type="matrix"/></filter>';
      (document.body || root).appendChild(svg);
    }
    const m = matrix(type, strength, mode);
    svg.querySelector("feColorMatrix").setAttribute("values",
      m.map((row) => row.map((v) => v.toFixed(4)).join(" ") + " 0 0").join(" ") + " 0 0 0 1 0");
    if (hudOnly) {
      if (!hudStyle) { hudStyle = document.createElement("style"); hudStyle.id = "lr-daltonien-hud"; document.head.appendChild(hudStyle); }
      hudStyle.textContent = "body > :not(#app):not(script):not(svg) { filter: url(#lr-daltonien-filtre); }";
      root.style.removeProperty("filter");
      return;
    }
    // filtre sur la racine : pas d’effet de bord sur les éléments en position fixe
    root.style.filter = "url(#lr-daltonien-filtre)";
  }

  window.lastRefugeDaltonien = { apply, matrix };
  if (document.body) apply(); else document.addEventListener("DOMContentLoaded", apply);
  addEventListener("storage", (e) => { if (e.key === "lastrefuge.reglages") apply(); });
  addEventListener("lastrefuge-reglages", apply);
})();
