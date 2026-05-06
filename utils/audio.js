// ─── Audio (Web Audio API) ───
let _audioCtx = null;

window.getAudio = function() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
};

window.beep = function(freq, dur, vol) {
  try {
    const ctx = window.getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.value = vol || 0.3;
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
};

window.sndMiddle    = function() { window.beep(600, 0.15, 0.25); };
window.snd10        = function() { window.beep(700, 0.12, 0.3); };
window.sndCountdown = function() { window.beep(800, 0.1, 0.35); };
window.sndGo        = function() { window.beep(1000, 0.15, 0.4); setTimeout(() => window.beep(1200, 0.2, 0.45), 180); };

window.unlockAudio = function() {
  try {
    const ctx = window.getAudio();
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    g.gain.value = 0;
    o.start(); o.stop(ctx.currentTime + 0.01);
  } catch(e) {}
};
