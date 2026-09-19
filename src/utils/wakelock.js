// ─── Wake Lock : garde l'écran allumé pendant une séance ───
// Aucun son ici : l'app n'émet plus rien, pour ne jamais couper la musique.
let _wakeLock = null;

window.requestWakeLock = async function() {
  try {
    if (!('wakeLock' in navigator)) return false;
    _wakeLock = await navigator.wakeLock.request('screen');
    _wakeLock.addEventListener('release', () => { _wakeLock = null; });
    return true;
  } catch (e) { return false; }
};

window.releaseWakeLock = function() {
  try { if (_wakeLock) { _wakeLock.release(); _wakeLock = null; } } catch (e) {}
};

// Ré-acquiert après un retour d'arrière-plan (le navigateur libère le lock automatiquement)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && window._wantWakeLock && !_wakeLock) {
    window.requestWakeLock();
  }
});

// Service worker : conservé pour l'installation sur l'écran d'accueil
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
