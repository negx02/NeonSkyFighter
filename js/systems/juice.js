// ===== JUICE VISUAL: screen shake y hit-stop =====
import { state } from '../state.js';

export function screenShake(mag, dur) {
    state.shakeMag = Math.max(state.shakeMag, mag);
    state.shakeTimer = Math.max(state.shakeTimer, dur);
}

export function hitStop(n) {
    state.freezeFrames = Math.max(state.freezeFrames, n);
}
