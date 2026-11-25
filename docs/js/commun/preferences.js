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
