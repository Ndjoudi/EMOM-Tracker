// ─── Wake Lock + Media Session (écran verrouillé) ───

// ── 1. Wake Lock : empêche l'écran de s'éteindre ──
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

// Ré-acquiert après un retour d'arrière-plan (iOS libère le lock automatiquement)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && window._wantWakeLock && !_wakeLock) {
    window.requestWakeLock();
  }
});

// ── 2. Audio silencieux en boucle : condition pour que iOS affiche
//       la carte "Now Playing" sur l'écran verrouillé ──
let _silentAudio = null;

function makeSilentWav(seconds) {
  const rate = 8000, n = rate * seconds;
  const buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const str = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVEfmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate, true);
  v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128); // 128 = silence en 8-bit non signé
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

// ── 2b. Bip AUDIBLE via <audio> ──
// Web Audio (oscillator) est coupé quand l'écran se verrouille sur iOS.
// Un élément <audio> profite de la session audio déjà active → passe en arrière-plan.
function makeToneWav(freq, seconds, vol) {
  const rate = 22050, n = Math.floor(rate * seconds);
  const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const str = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVEfmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    // fondu d'entrée/sortie pour éviter les clics
    const env = Math.min(1, i / (rate * 0.01), (n - i) / (rate * 0.02));
    v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * freq * (i / rate)) * 32767 * (vol || 0.6) * env, true);
  }
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

let _alertUrl = null, _alertEl = null;

// Bip fort de reprise — audible même écran verrouillé
window.alertBeep = function() {
  try {
    if (!_alertUrl) _alertUrl = makeToneWav(880, 0.5, 0.9);
    if (!_alertEl) { _alertEl = new Audio(_alertUrl); _alertEl.setAttribute('playsinline', ''); }
    _alertEl.currentTime = 0;
    _alertEl.volume = 1;
    _alertEl.play().catch(() => {});
    // double bip
    setTimeout(() => { try { _alertEl.currentTime = 0; _alertEl.play().catch(() => {}); } catch (e) {} }, 600);
  } catch (e) {}
};

// ── 3. Notifications ──
// Enregistre le service worker (requis par iOS pour showNotification)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

window.requestNotifPermission = async function() {
  try {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
  } catch (e) { return 'unsupported'; }
};

window.notify = function(title, body) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    // Via service worker si dispo (obligatoire sur iOS PWA), sinon constructeur direct
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready
        .then(reg => reg.showNotification(title, { body, tag: 'emom-timer', renotify: true, silent: false }))
        .catch(() => { try { new Notification(title, { body, tag: 'emom-timer' }); } catch (e) {} });
    } else {
      new Notification(title, { body, tag: 'emom-timer' });
    }
    return true;
  } catch (e) { return false; }
};

// Alerte complète de fin de chrono : son + notification
window.timerAlert = function(title, body) {
  window.alertBeep();
  if (document.visibilityState !== 'visible') window.notify(title, body);
};

// Doit être appelé depuis un geste utilisateur (clic) pour passer la policy iOS
window.startLockScreenSession = function(title, artist) {
  try {
    if (!_silentAudio) {
      _silentAudio = new Audio(makeSilentWav(2));
      _silentAudio.loop = true;
      _silentAudio.volume = 0.01;   // pas 0 : iOS ignore les pistes totalement muettes
      _silentAudio.setAttribute('playsinline', '');
    }
    _silentAudio.play().catch(() => {});
    window.updateLockScreen(title, artist);
  } catch (e) {}
};

window.stopLockScreenSession = function() {
  try {
    if (_silentAudio) { _silentAudio.pause(); _silentAudio.currentTime = 0; }
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
  } catch (e) {}
};

// Met à jour le texte affiché sur l'écran verrouillé
window.updateLockScreen = function(title, artist) {
  try {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  title  || 'EMOM Track',
      artist: artist || '',
      album:  'EMOM Track',
    });
    navigator.mediaSession.playbackState = 'playing';
  } catch (e) {}
};

// Branche les boutons de l'écran verrouillé (play/pause/suivant)
window.setLockScreenHandlers = function({ onPlay, onPause, onNext } = {}) {
  try {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play',          onPlay  || null);
    navigator.mediaSession.setActionHandler('pause',         onPause || null);
    navigator.mediaSession.setActionHandler('nexttrack',     onNext  || null);
    navigator.mediaSession.setActionHandler('previoustrack', null);
  } catch (e) {}
};
