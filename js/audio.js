// ===== AUDIO SINTETIZADO (sin archivos externos) =====

export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sfxVolume = 1;
let comboComboCount = 0; // referencia interna solo para variar el tono de 'combo'

export function setSfxVolume(v) { sfxVolume = v; }
export function getSfxVolume() { return sfxVolume; }
export function setComboCountForPitch(n) { comboComboCount = n; }

export function resumeAudio() {
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}

function playTone(freq, type, dur) {
    try {
        if (audioCtx.state === 'suspended' || sfxVolume === 0) return;
        const finalVol = 0.05 * sfxVolume;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(finalVol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    } catch (e) { /* silencioso: audio no es crítico */ }
}

export function playSFX(id) {
    resumeAudio();
    if (sfxVolume <= 0) return;
    if (id === 'shoot') playTone(800, 'square', 0.05);
    if (id === 'overheat') playTone(150, 'sawtooth', 0.1);
    if (id === 'explosion') playTone(100, 'sawtooth', 0.2);
    if (id === 'powerup') { playTone(600, 'sine', 0.1); setTimeout(() => playTone(1200, 'sine', 0.1), 100); }
    if (id === 'revive') { playTone(400, 'triangle', 0.2); setTimeout(() => playTone(600, 'triangle', 0.2), 150); setTimeout(() => playTone(800, 'triangle', 0.3), 300); }
    if (id === 'laser') playTone(200, 'sawtooth', 0.4);
    if (id === 'rock_break') playTone(100, 'noise', 0.2);
    if (id === 'missile') playTone(300, 'square', 0.08);
    if (id === 'bomb') { playTone(60, 'sawtooth', 0.5); setTimeout(() => playTone(80, 'sawtooth', 0.4), 80); }
    if (id === 'combo') playTone(900 + Math.min(comboComboCount * 15, 500), 'sine', 0.06);
    if (id === 'ability') { playTone(500, 'triangle', 0.1); setTimeout(() => playTone(900, 'triangle', 0.15), 60); }
    if (id === 'charge') playTone(200 + Math.random() * 60, 'sawtooth', 0.04);
    if (id === 'purchase') { playTone(700, 'square', 0.08); setTimeout(() => playTone(1000, 'square', 0.1), 90); }
}
