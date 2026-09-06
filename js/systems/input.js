// ===== INPUT: TECLADO, MOUSE Y BINDINGS CONFIGURABLES =====
import { state, canvas } from '../state.js';
import { RESERVED_KEYS } from '../config.js';

export let controlBindings = JSON.parse(localStorage.getItem('neonSkyControls') || '{"ability":"q","abilityP2":"e"}');

function saveBindings() {
    localStorage.setItem('neonSkyControls', JSON.stringify(controlBindings));
}

export function getAbilityKey(playerNum) {
    return playerNum === 2 ? controlBindings.abilityP2 : controlBindings.ability;
}

// Escucha la siguiente tecla presionada y la asigna como binding de habilidad.
// callback(newKeyOrNull) se llama al terminar (null si la tecla estaba reservada).
export function startRebind(playerNum, callback) {
    if (state.isRebindingKey) return;
    state.isRebindingKey = true;
    const listener = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const key = e.key.toLowerCase();
        window.removeEventListener('keydown', listener, true);
        state.isRebindingKey = false;
        if (RESERVED_KEYS.includes(key)) { callback(null); return; }
        if (playerNum === 2) controlBindings.abilityP2 = key; else controlBindings.ability = key;
        saveBindings();
        callback(key);
    };
    window.addEventListener('keydown', listener, true);
}

// callbacks externos (inyectados por game.js) para no crear un ciclo de importación
let onAbilityPress = null;
export function setAbilityPressHandler(fn) { onAbilityPress = fn; }

export function initInputListeners() {
    window.addEventListener('keydown', e => {
        if (e.code === 'Space') state.keys.Space = true;
        if (e.key === 'w' || e.key === 'W') state.keys.w = true;
        if (e.key === 'a' || e.key === 'A') state.keys.a = true;
        if (e.key === 's' || e.key === 'S') state.keys.s = true;
        if (e.key === 'd' || e.key === 'D') state.keys.d = true;
        if (e.key === 'ArrowUp') state.keys.ArrowUp = true;
        if (e.key === 'ArrowLeft') state.keys.ArrowLeft = true;
        if (e.key === 'ArrowDown') state.keys.ArrowDown = true;
        if (e.key === 'ArrowRight') state.keys.ArrowRight = true;

        if (state.isRebindingKey) return;

        const key = e.key.toLowerCase();
        if (state.gameRunning && !state.isPaused && onAbilityPress) {
            if (key === controlBindings.ability) onAbilityPress(1);
            if (state.gameMode === '2P' && key === controlBindings.abilityP2) onAbilityPress(2);
        }
        if (e.key === 'Escape' && state.gameRunning && window.__togglePause) window.__togglePause();
    });

    window.addEventListener('keyup', e => {
        if (e.code === 'Space') state.keys.Space = false;
        if (e.key === 'w' || e.key === 'W') state.keys.w = false;
        if (e.key === 'a' || e.key === 'A') state.keys.a = false;
        if (e.key === 's' || e.key === 'S') state.keys.s = false;
        if (e.key === 'd' || e.key === 'D') state.keys.d = false;
        if (e.key === 'ArrowUp') state.keys.ArrowUp = false;
        if (e.key === 'ArrowLeft') state.keys.ArrowLeft = false;
        if (e.key === 'ArrowDown') state.keys.ArrowDown = false;
        if (e.key === 'ArrowRight') state.keys.ArrowRight = false;
    });

    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        state.mouseX = (e.clientX - r.left) * (canvas.width / r.width);
        state.mouseY = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', () => state.isMouseDown = true);
    canvas.addEventListener('mouseup', () => state.isMouseDown = false);
}
