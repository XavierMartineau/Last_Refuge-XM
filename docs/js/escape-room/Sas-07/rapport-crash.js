/* LAST REFUGE · XM — Rapport local des erreurs non gérées et pertes du contexte graphique. */
(() => {
  const reported = new Set();
  let reportUrl = null;

  function reportGameCrash(reason, phase) {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const key = error.name + '\n' + error.message;
    if (reported.has(key)) return;
    reported.add(key);

    const text = [
      'LAST REFUGE · SAS 07 — Rapport d’erreur',
      'Date : ' + new Date().toISOString(),
      'Étape : ' + phase,
      'Erreur signalée : ' + error.name + ': ' + error.message,
      'Détails techniques :',
      error.stack || 'Pile non disponible.',
      'Navigateur : ' + navigator.userAgent,
      '',
      'La cause exacte peut être inconnue. Vérifiez ce rapport avant de le partager.'
    ].join('\n');

    const show = () => {
      const notice = document.getElementById('game-crash-notice');
      const link = document.getElementById('game-crash-download');
      notice.hidden = false;
      notice.querySelector('p').textContent = 'Une erreur a été détectée. Si le téléchargement automatique est bloqué, utilisez ce lien :';
      try {
        if (reportUrl) URL.revokeObjectURL(reportUrl);
        reportUrl = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
        link.href = reportUrl;
        link.hidden = false;
        link.click();
      } catch (failure) {
        link.hidden = true;
        notice.querySelector('p').textContent = 'Impossible de créer le rapport. Consultez la console du navigateur.';
        console.error('Impossible de créer le rapport d’erreur :', failure);
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, { once: true });
    else show();
  }

  window.reportGameCrash = reportGameCrash;
  window.addEventListener('error', (event) => {
    reportGameCrash(event.error || new Error(event.message || 'Erreur de script sans détails.'), 'Exécution du jeu');
  });
  window.addEventListener('unhandledrejection', (event) => {
    reportGameCrash(event.reason, 'Opération non terminée');
  });
})();
