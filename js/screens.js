// ===== NAVEGACIÓN DE PANTALLAS =====
// Flujo: start-screen (JUGAR/TALLER/SETTINGS) -> mode-select-screen (1P/2P) -> hangar-screen (elegir nave) -> juego
import { state } from './state.js';
import { SHIPS } from './ships.js';
import {
    totalXP, coins, isShipUnlocked, unlockShip, getSelectedShip, setSelectedShip,
    UPGRADES, getUpgradeLevel, upgradeCost, purchaseUpgrade
} from './systems/progression.js';
import { getLevel, xpProgress, LEVEL_CAP } from './config.js';
import { getBindings, startRebind, controlSettings, setScheme, setP1Mode, isMouseControlled } from './systems/input.js';
import { getSfxVolume, setSfxVolume, playSFX } from './audio.js';
import { startGame, resetToMenu, togglePause } from './game.js';
import { coinIconHTML } from './systems/icons.js';

const ALL_SCREENS = ['start-screen', 'mode-select-screen', 'hangar-screen', 'settings-screen', 'taller-screen', 'pause-screen', 'game-over-screen'];

function showScreen(id) {
    ALL_SCREENS.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.toggle('hidden', s !== id);
    });
}

// ---- estado local de la sesión de hangar (antes de comenzar la partida) ----
let hangarMode = '1P';
let hangarActiveTab = 1; // 1 o 2, qué jugador está eligiendo en modo 2P

function updateProgressLabels() {
    const lvl = getLevel(totalXP);
    const startEl = document.getElementById('start-progress');
    if (startEl) startEl.innerHTML = lvl >= LEVEL_CAP ? `NIVEL MÁXIMO (${LEVEL_CAP}) · ${coinIconHTML()} ${coins}` : `NIVEL ${lvl} · ${coinIconHTML()} ${coins}`;
}

// ===== PANTALLA DE INICIO =====
export function goHome() {
    resetToMenu();
    updateProgressLabels();
    showScreen('start-screen');
}

// ===== SELECCIÓN DE MODO =====
function openModeSelect() { showScreen('mode-select-screen'); }

function chooseMode(mode) {
    hangarMode = mode;
    hangarActiveTab = 1;
    openHangar();
}

// ===== HANGAR DE NAVES =====
function openHangar() {
    showScreen('hangar-screen');
    const tabsEl = document.getElementById('hangar-tabs');
    tabsEl.classList.toggle('hidden', hangarMode !== '2P');
    renderHangar();
}

function renderHangar() {
    const lvl = getLevel(totalXP);
    document.getElementById('hangar-progress').innerHTML = (lvl >= LEVEL_CAP ? `NIVEL MÁXIMO (${LEVEL_CAP})` : `NIVEL ${lvl}`) + ` · ${coinIconHTML()} ${coins} MONEDAS`;

    document.querySelectorAll('.hangar-tab').forEach(btn => {
        btn.classList.toggle('active-mode', parseInt(btn.dataset.tab) === hangarActiveTab);
    });

    const currentSelection = getSelectedShip(hangarActiveTab);
    const grid = document.getElementById('ship-grid');
    grid.innerHTML = '';

    SHIPS.forEach(ship => {
        const unlocked = isShipUnlocked(ship.id);
        const selected = currentSelection === ship.id;
        const card = document.createElement('div');
        card.className = 'ship-card' + (selected ? ' selected' : '') + (!unlocked ? ' locked' : '');

        const canvasEl = document.createElement('canvas');
        canvasEl.width = 90; canvasEl.height = 70;
        card.appendChild(canvasEl);

        const title = document.createElement('h4');
        title.style.color = ship.color;
        title.innerText = ship.name;
        card.appendChild(title);

        const weaponEl = document.createElement('div');
        weaponEl.className = 'ship-ability';
        weaponEl.style.color = '#66ccff';
        weaponEl.innerText = '⚔ ' + ship.weaponName;
        card.appendChild(weaponEl);

        const abilityEl = document.createElement('div');
        abilityEl.className = 'ship-ability';
        abilityEl.innerText = '★ ' + ship.abilityName;
        card.appendChild(abilityEl);

        const descEl = document.createElement('div');
        descEl.className = 'ship-desc';
        descEl.innerText = ship.weaponDesc + ' ' + ship.abilityDesc;
        card.appendChild(descEl);

        const statsEl = document.createElement('div');
        statsEl.className = 'ship-stats';
        statsEl.innerText = `HP: ${ship.hp}  ·  VEL: ${ship.speed}`;
        card.appendChild(statsEl);

        const btn = document.createElement('button');
        if (selected) { btn.innerText = 'EQUIPADA'; btn.disabled = true; btn.style.opacity = '0.6'; }
        else if (unlocked) { btn.innerText = 'SELECCIONAR'; btn.addEventListener('click', () => { setSelectedShip(hangarActiveTab, ship.id); renderHangar(); }); }
        else { btn.innerHTML = `DESBLOQUEAR ${coinIconHTML(12)}${ship.cost}`; btn.addEventListener('click', () => { if (unlockShip(ship.id)) { playSFX('purchase'); renderHangar(); } else { playSFX('overheat'); } }); }
        card.appendChild(btn);

        grid.appendChild(card);

        const cx = canvasEl.getContext('2d');
        const scale = Math.min(70 / (ship.cols * ship.ps), 50 / (ship.rows * ship.ps));
        const offX = (90 - ship.cols * ship.ps * scale) / 2;
        const offY = (70 - ship.rows * ship.ps * scale) / 2;
        cx.fillStyle = ship.color;
        cx.shadowColor = ship.color; cx.shadowBlur = unlocked ? 8 : 0;
        if (!unlocked) cx.globalAlpha = 0.4;
        ship.sprite.forEach((row, i) => row.forEach((px, j) => {
            if (px) cx.fillRect(offX + j * ship.ps * scale, offY + i * ship.ps * scale, ship.ps * scale, ship.ps * scale);
        }));
    });
}

function hideAllScreens() {
    ALL_SCREENS.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.add('hidden');
    });
}

function beginMission() {
    const shipP1 = getSelectedShip(1);
    const shipP2 = hangarMode === '2P' ? getSelectedShip(2) : 'interceptor';
    hideAllScreens(); // FIX: antes no se ocultaba el hangar y el juego corría detrás de él
    startGame(hangarMode, shipP1, shipP2);
}

// ===== TALLER DE MEJORAS (nuevo sumidero de monedas) =====
function openTaller() { showScreen('taller-screen'); renderTaller(); }

function renderTaller() {
    const lvl = getLevel(totalXP);
    document.getElementById('taller-progress').innerHTML = (lvl >= LEVEL_CAP ? `NIVEL MÁXIMO (${LEVEL_CAP})` : `NIVEL ${lvl}`) + ` · ${coinIconHTML()} ${coins} MONEDAS`;

    const grid = document.getElementById('upgrade-grid');
    grid.innerHTML = '';
    UPGRADES.forEach(up => {
        const lvlCur = getUpgradeLevel(up.id);
        const cost = upgradeCost(up.id);
        const card = document.createElement('div');
        card.className = 'ship-card';

        const title = document.createElement('h4');
        title.style.color = '#39ff14';
        title.innerText = up.name;
        card.appendChild(title);

        const descEl = document.createElement('div');
        descEl.className = 'ship-desc';
        descEl.style.minHeight = '30px';
        descEl.innerText = up.desc;
        card.appendChild(descEl);

        const lvlEl = document.createElement('div');
        lvlEl.className = 'ship-stats';
        lvlEl.innerText = `NIVEL ${lvlCur} / ${up.maxLevel}`;
        card.appendChild(lvlEl);

        const btn = document.createElement('button');
        if (cost === null) { btn.innerText = 'AL MÁXIMO'; btn.disabled = true; btn.style.opacity = '0.6'; }
        else { btn.innerHTML = `MEJORAR ${coinIconHTML(12)}${cost}`; btn.addEventListener('click', () => { if (purchaseUpgrade(up.id)) { playSFX('purchase'); renderTaller(); } else { playSFX('overheat'); } }); }
        card.appendChild(btn);

        grid.appendChild(card);
    });
}

// ===== SETTINGS =====
function openSettings() { showScreen('settings-screen'); renderSettings(); }

function backFromSettings() {
    if (state.gameRunning) showScreen('pause-screen');
    else showScreen('start-screen');
}

const CODE_LABELS = {
    KeyA: 'A', KeyB: 'B', KeyC: 'C', KeyD: 'D', KeyE: 'E', KeyF: 'F', KeyG: 'G', KeyH: 'H', KeyI: 'I', KeyJ: 'J',
    KeyK: 'K', KeyL: 'L', KeyM: 'M', KeyN: 'N', KeyO: 'O', KeyP: 'P', KeyQ: 'Q', KeyR: 'R', KeyS: 'S', KeyT: 'T',
    KeyU: 'U', KeyV: 'V', KeyW: 'W', KeyX: 'X', KeyY: 'Y', KeyZ: 'Z',
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    ControlRight: 'CTRL DER', ControlLeft: 'CTRL IZQ', ShiftRight: 'SHIFT DER', ShiftLeft: 'SHIFT IZQ',
    AltRight: 'ALT DER', AltLeft: 'ALT IZQ', Space: 'ESPACIO', Enter: 'ENTER', Tab: 'TAB',
};
function codeLabel(code) { return CODE_LABELS[code] || code.replace('Key', '').replace('Digit', ''); }

const ACTION_LABELS = { up: 'Moverse arriba', down: 'Moverse abajo', left: 'Moverse izquierda', right: 'Moverse derecha', ability: 'Habilidad especial' };

function renderKeymap(playerNum, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const bindings = getBindings(playerNum);
    ['up', 'down', 'left', 'right', 'ability'].forEach(action => {
        const row = document.createElement('div');
        row.className = 'keymap-row';
        const label = document.createElement('span');
        label.innerText = ACTION_LABELS[action];
        row.appendChild(label);
        const btn = document.createElement('button');
        btn.innerText = codeLabel(bindings[action]);
        btn.addEventListener('click', () => {
            btn.classList.add('listening');
            btn.innerText = '...';
            startRebind(playerNum, action, (code, reason) => {
                btn.classList.remove('listening');
                if (code === null) {
                    btn.classList.add('duplicate-error');
                    document.getElementById('powerup-status').innerText = reason === 'duplicate' ? 'ESA TECLA YA ESTÁ EN USO' : 'TECLA RESERVADA, ELIGE OTRA';
                    setTimeout(() => renderKeymap(playerNum, containerId), 900);
                } else {
                    renderKeymap(playerNum, containerId);
                    if (playerNum === 1 && action === 'ability') updateAbilityKeyHud();
                }
            });
        });
        row.appendChild(btn);
        container.appendChild(row);
    });
}

function updateAbilityKeyHud() {
    const hudKeyLabel = document.getElementById('ability-key-label');
    if (!hudKeyLabel) return;
    hudKeyLabel.innerText = isMouseControlled(1) ? 'CLIC DER.' : codeLabel(getBindings(1).ability);
}

function renderSettings() {
    const schemeBtn = document.getElementById('scheme-toggle-btn');
    const p1ModeBtn = document.getElementById('p1-mode-toggle-btn');
    const mouseInfo = document.getElementById('mouse-info-box');
    const p2Heading = document.getElementById('p2-keymap-heading');
    const p2Grid = document.getElementById('keymap-p2');

    schemeBtn.innerText = controlSettings.scheme === 'mixed' ? 'ESQUEMA: TECLADO Y RATÓN' : 'ESQUEMA: AMBOS CON TECLADO';

    const showP1ModeToggle = controlSettings.scheme === 'mixed';
    p1ModeBtn.classList.toggle('hidden', !showP1ModeToggle);
    if (showP1ModeToggle) p1ModeBtn.innerText = `JUGADOR 1: ${controlSettings.p1Mode === 'keyboard' ? 'TECLADO' : 'RATÓN'}`;

    renderKeymap(1, 'keymap-p1');

    if (controlSettings.scheme === 'both-keyboard') {
        p2Heading.classList.remove('hidden'); p2Grid.classList.remove('hidden');
        renderKeymap(2, 'keymap-p2');
        mouseInfo.classList.add('hidden');
    } else {
        p2Heading.classList.add('hidden'); p2Grid.classList.add('hidden');
        const mouseIsP1 = controlSettings.p1Mode === 'mouse';
        mouseInfo.classList.remove('hidden');
        mouseInfo.innerHTML = `${mouseIsP1 ? 'JUGADOR 1' : 'JUGADOR 2'} (RATÓN, fijo):<br>Clic izquierdo: Disparar<br>Clic derecho: Habilidad especial`;
    }
    updateAbilityKeyHud();
}

export function initScreens() {
    // start
    document.getElementById('btn-jugar').addEventListener('click', openModeSelect);
    document.getElementById('taller-btn').addEventListener('click', openTaller);
    document.getElementById('settings-btn').addEventListener('click', openSettings);

    // mode select
    document.getElementById('mode-1p').addEventListener('click', () => chooseMode('1P'));
    document.getElementById('mode-2p').addEventListener('click', () => chooseMode('2P'));
    document.getElementById('mode-back').addEventListener('click', () => showScreen('start-screen'));

    // hangar
    document.querySelectorAll('.hangar-tab').forEach(btn => {
        btn.addEventListener('click', () => { hangarActiveTab = parseInt(btn.dataset.tab); renderHangar(); });
    });
    document.getElementById('hangar-back').addEventListener('click', openModeSelect);
    document.getElementById('hangar-start').addEventListener('click', beginMission);

    // taller
    document.getElementById('taller-back').addEventListener('click', goHome);

    // settings
    document.getElementById('back-from-settings').addEventListener('click', backFromSettings);
    document.getElementById('pause-settings-btn').addEventListener('click', openSettings);
    document.getElementById('scheme-toggle-btn').addEventListener('click', () => {
        setScheme(controlSettings.scheme === 'mixed' ? 'both-keyboard' : 'mixed');
        renderSettings();
    });
    document.getElementById('p1-mode-toggle-btn').addEventListener('click', () => {
        setP1Mode(controlSettings.p1Mode === 'keyboard' ? 'mouse' : 'keyboard');
        renderSettings();
    });
    document.getElementById('sfx-volume-slider').addEventListener('input', (e) => {
        setSfxVolume(e.target.value / 100);
        document.getElementById('sfx-volume-label').innerText = `${e.target.value}%`;
    });

    // pausa / game over
    document.getElementById('resume-btn').addEventListener('click', togglePause);
    document.getElementById('exit-pause-btn').addEventListener('click', goHome);
    document.getElementById('exit-gameover-btn').addEventListener('click', goHome);
    document.getElementById('restart-btn').addEventListener('click', beginMission);

    document.getElementById('sfx-volume-slider').value = getSfxVolume() * 100;
    updateAbilityKeyHud();

    updateProgressLabels();
    showScreen('start-screen');
}
