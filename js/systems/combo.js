// ===== SISTEMA DE COMBO =====
import { state } from '../state.js';
import { COMBO_WINDOW } from '../config.js';
import { playSFX, setComboCountForPitch } from '../audio.js';

const comboDisplay = document.getElementById('combo-display');
const p1ScoreEl = document.getElementById('p1-score');

export function registerKill(basePoints) {
    state.comboCount++;
    state.comboTimer = COMBO_WINDOW;
    setComboCountForPitch(state.comboCount);
    const mult = 1 + Math.floor(state.comboCount / 5) * 0.5;
    const gained = Math.round(basePoints * mult);
    state.score += gained;
    p1ScoreEl.innerText = state.score;
    playSFX('combo');
    updateComboUI(true);
    return gained;
}

export function updateComboUI(popped) {
    if (state.comboCount >= 3) {
        const mult = 1 + Math.floor(state.comboCount / 5) * 0.5;
        comboDisplay.innerText = `COMBO x${state.comboCount}  (x${mult.toFixed(1)})`;
        comboDisplay.style.display = 'block';
        if (popped) { comboDisplay.classList.add('pop'); setTimeout(() => comboDisplay.classList.remove('pop'), 150); }
    } else {
        comboDisplay.style.display = 'none';
    }
}

export function tickCombo() {
    if (state.comboTimer > 0) {
        state.comboTimer--;
        if (state.comboTimer <= 0) { state.comboCount = 0; updateComboUI(false); }
    }
}

export function resetCombo() {
    state.comboCount = 0;
    state.comboTimer = 0;
    updateComboUI(false);
}
