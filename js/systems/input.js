// ===== INPUT: TECLADO, MOUSE Y ESQUEMAS DE CONTROL CONFIGURABLES =====
// Usa KeyboardEvent.code (no .key) para que los bindings sean estables sin importar
// el layout de teclado y para distinguir Ctrl izquierdo/derecho, etc.
import { state, canvas } from '../state.js';

const RESERVED_CODES = ['Escape', 'Space', 'Enter']; // Space = disparo fijo P1, Enter = disparo fijo P2 teclado

const DEFAULTS = {
    scheme: 'mixed', // 'mixed' (teclado+ratón) | 'both-keyboard' (ambos con teclado)
    p1Mode: 'keyboard', // 'keyboard' | 'mouse' — solo aplica en partidas de 1 jugador con scheme 'mixed'
    p1: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', ability: 'KeyQ' },
    p2: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', ability: 'ControlRight' },
};

export let controlSettings = JSON.parse(localStorage.getItem('neonSkyControls2') || JSON.stringify(DEFAULTS));

function saveSettings() {
    localStorage.setItem('neonSkyControls2', JSON.stringify(controlSettings));
}

export function setScheme(scheme) { controlSettings.scheme = scheme; saveSettings(); }
export function setP1Mode(mode) { controlSettings.p1Mode = mode; saveSettings(); }

// ¿Este jugador se mueve/dispara con mouse en la configuración actual?
export function isMouseControlled(playerNum) {
    if (playerNum === 1) return controlSettings.scheme === 'mixed' && state.gameMode === '1P' && controlSettings.p1Mode === 'mouse';
    // Jugador 2 usa mouse solo en el esquema 'mixed' (comportamiento clásico); en 'both-keyboard' usa teclado.
    return controlSettings.scheme === 'mixed';
}

export function getBindings(playerNum) {
    return playerNum === 2 ? controlSettings.p2 : controlSettings.p1;
}

function allActiveBindingCodes(excludePlayer, excludeAction) {
    const codes = [];
    const collect = (playerNum) => {
        const b = getBindings(playerNum);
        Object.entries(b).forEach(([action, code]) => {
            if (playerNum === excludePlayer && action === excludeAction) return;
            codes.push(code);
        });
    };
    collect(1);
    if (controlSettings.scheme === 'both-keyboard') collect(2);
    return codes;
}

// Escucha la siguiente tecla presionada y la asigna a playerNum/action si es válida.
// callback(newCodeOrNull, reason) — reason: 'reserved' | 'duplicate' | null (si tuvo éxito)
export function startRebind(playerNum, action, callback) {
    if (state.isRebindingKey) return;
    state.isRebindingKey = true;
    const listener = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const code = e.code;
        window.removeEventListener('keydown', listener, true);
        state.isRebindingKey = false;

        if (RESERVED_CODES.includes(code)) { callback(null, 'reserved'); return; }
        if (allActiveBindingCodes(playerNum, action).includes(code)) { callback(null, 'duplicate'); return; }

        getBindings(playerNum)[action] = code;
        saveSettings();
        callback(code, null);
    };
    window.addEventListener('keydown', listener, true);
}

// callback externo (inyectado por main.js) para no crear un ciclo de importación con entities/Player
let onAbilityPress = null;
export function setAbilityPressHandler(fn) { onAbilityPress = fn; }

export function initInputListeners() {
    window.addEventListener('keydown', e => {
        if (state.isRebindingKey) return;
        const code = e.code;

        // Movimiento P1 (si está en teclado)
        const p1 = controlSettings.p1;
        if (code === p1.up) state.p1Pressed.up = true;
        if (code === p1.down) state.p1Pressed.down = true;
        if (code === p1.left) state.p1Pressed.left = true;
        if (code === p1.right) state.p1Pressed.right = true;
        if (code === 'Space') state.p1Pressed.shoot = true;

        // Movimiento P2 (solo si el esquema es 'both-keyboard')
        const p2 = controlSettings.p2;
        if (code === p2.up) state.p2Pressed.up = true;
        if (code === p2.down) state.p2Pressed.down = true;
        if (code === p2.left) state.p2Pressed.left = true;
        if (code === p2.right) state.p2Pressed.right = true;
        if (code === 'Enter') state.p2Pressed.shoot = true;

        if (state.gameRunning && !state.isPaused && onAbilityPress) {
            if (!isMouseControlled(1) && code === p1.ability) onAbilityPress(1);
            if (state.gameMode === '2P' && !isMouseControlled(2) && code === p2.ability) onAbilityPress(2);
        }
        if (code === 'Escape' && state.gameRunning && window.__togglePause) window.__togglePause();
    });

    window.addEventListener('keyup', e => {
        const code = e.code;
        const p1 = controlSettings.p1;
        if (code === p1.up) state.p1Pressed.up = false;
        if (code === p1.down) state.p1Pressed.down = false;
        if (code === p1.left) state.p1Pressed.left = false;
        if (code === p1.right) state.p1Pressed.right = false;
        if (code === 'Space') state.p1Pressed.shoot = false;

        const p2 = controlSettings.p2;
        if (code === p2.up) state.p2Pressed.up = false;
        if (code === p2.down) state.p2Pressed.down = false;
        if (code === p2.left) state.p2Pressed.left = false;
        if (code === p2.right) state.p2Pressed.right = false;
        if (code === 'Enter') state.p2Pressed.shoot = false;
    });

    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        state.mouseX = (e.clientX - r.left) * (canvas.width / r.width);
        state.mouseY = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault()); // el clic derecho activa la habilidad, no el menú del navegador
    canvas.addEventListener('mousedown', e => {
        if (e.button === 0) state.isMouseDown = true; // clic izquierdo: disparar
        if (e.button === 2 && state.gameRunning && !state.isPaused) { // clic derecho: habilidad del jugador que usa mouse
            if (isMouseControlled(1) && onAbilityPress) onAbilityPress(1);
            else if (isMouseControlled(2) && onAbilityPress) onAbilityPress(2);
        }
    });
    // FIX: escuchar en window (no solo canvas) para que soltar el botón fuera del área de juego
    // también detenga el disparo — antes se quedaba "pegado" si el mouse salía del canvas.
    window.addEventListener('mouseup', () => state.isMouseDown = false);
    window.addEventListener('blur', () => state.isMouseDown = false);
}
