// ===== UI / HUD =====
import { state, canvas } from '../state.js';

// --- referencias DOM del HUD in-game ---
const uiLayer = document.getElementById('ui-layer');
const hudP2Container = document.getElementById('hud-p2-container');
export const p1ScoreEl = document.getElementById('p1-score');
export const p1HpEl = document.getElementById('p1-hp');
export const p1HeatBar = document.getElementById('p1-heat-bar');
export const p2ScoreEl = document.getElementById('p2-score');
export const p2HpEl = document.getElementById('p2-hp');
export const p2HeatBar = document.getElementById('p2-heat-bar');
export const abilityBar = document.getElementById('p1-ability-bar');
export const abilityNameLabel = document.getElementById('ability-name-label');
export const abilityKeyLabel = document.getElementById('ability-key-label');

const powerupStatusEl = document.getElementById('powerup-status');
export const bossHPContainer = document.getElementById('boss-hp-container');
export const bossHPBar = document.getElementById('boss-hp-bar');
export const bossLvlDisplay = document.getElementById('boss-lvl-display');

export function showHudMsg(text) {
    powerupStatusEl.innerText = text;
    powerupStatusEl.style.display = 'block';
    clearTimeout(showHudMsg._t);
    showHudMsg._t = setTimeout(() => { if (powerupStatusEl.innerText === text) powerupStatusEl.style.display = 'none'; }, 2000);
}

export function showGameHUD() {
    uiLayer.classList.remove('hidden');
    canvas.classList.remove('canvas-blur');
    canvas.style.cursor = 'crosshair';
}
export function hideGameHUD() {
    uiLayer.classList.add('hidden');
    canvas.classList.add('canvas-blur');
    canvas.style.cursor = 'default';
}
export function setP2HudVisible(visible) {
    hudP2Container.style.display = visible ? 'flex' : 'none';
}

const rightPanelPowerups = document.getElementById('right-panel-powerups');
const rightPanelP2 = document.getElementById('right-panel-p2');
export function setRightPanelMode(mode) {
    rightPanelPowerups.style.display = mode === '2P' ? 'none' : 'flex';
    rightPanelP2.style.display = mode === '2P' ? 'flex' : 'none';
}

export function updateAbilityUI() {
    const p1 = state.players.find(p => p.id === 1);
    if (!p1 || !abilityBar) return;
    const ship = p1.ship;
    const pct = Math.max(0, 100 - (p1.abilityCooldown / (ship.cooldown * p1.cooldownMult)) * 100);
    abilityBar.style.width = pct + '%';
    abilityBar.style.backgroundColor = pct >= 100 ? ship.color : '#444';
    if (abilityNameLabel) abilityNameLabel.innerText = ship.abilityName;
}
