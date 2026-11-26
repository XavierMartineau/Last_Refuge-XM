/* Progression du parcours solo, partagée entre le hub, le créateur et le choix de salle.
   characterDone : étape 1 (fiche d’écrou) terminée · roomId : escape room choisie à l’étape 2 */
(() => {
  const KEY = "lastrefuge.progress";

  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        characterDone: value.characterDone === true,
        roomId: typeof value.roomId === "string" ? value.roomId : null
      };
    } catch (error) {
      return { characterDone: false, roomId: null };
    }
  }

  function save(progress) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ characterDone: progress.characterDone === true, roomId: progress.roomId || null }));
      return true;
    } catch (error) {
      console.error("Impossible d’enregistrer la progression LAST REFUGE.", error);
      return false;
    }
  }

  function update(patch) {
    const next = { ...load(), ...patch };
    save(next);
    return next;
  }

  window.lastRefugeProgress = { load, save, update };
})();
