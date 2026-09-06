// ===== PROGRESIÓN PERSISTENTE =====
// Sin DOM aquí: solo datos + lógica. La UI vive en ui.js / screens.js.
import { getLevel, scoreToXP, COINS_PER_LEVEL, LEVEL_CAP } from '../config.js';
import { SHIPS } from '../ships.js';

export let totalXP = parseInt(localStorage.getItem('neonSkyXP')) || 0;
export let coins = parseInt(localStorage.getItem('neonSkyCoins')) || 0;
export let unlockedShips = JSON.parse(localStorage.getItem('neonSkyUnlockedShips') || '["interceptor"]');

// ===== MEJORAS PERMANENTES (sumidero de monedas más allá de las naves) =====
export const UPGRADES = [
    { id: 'hp', name: 'BLINDAJE REFORZADO', desc: '+5 HP máximo en todas las naves', maxLevel: 10, baseCost: 150, growth: 1.35 },
    { id: 'speed', name: 'PROPULSORES MEJORADOS', desc: '+0.3 de velocidad en todas las naves', maxLevel: 10, baseCost: 150, growth: 1.35 },
    { id: 'cooldown', name: 'NÚCLEO DE ENERGÍA', desc: '-4% cooldown de habilidad (máx. -40%)', maxLevel: 10, baseCost: 220, growth: 1.4 },
    { id: 'heatres', name: 'DISIPADOR TÉRMICO', desc: '-5% calor generado por disparo (máx. -50%)', maxLevel: 10, baseCost: 200, growth: 1.4 },
];

let upgradeLevels = JSON.parse(localStorage.getItem('neonSkyUpgrades') || '{}');

function persist() {
    localStorage.setItem('neonSkyXP', totalXP);
    localStorage.setItem('neonSkyCoins', coins);
    localStorage.setItem('neonSkyUnlockedShips', JSON.stringify(unlockedShips));
    localStorage.setItem('neonSkyUpgrades', JSON.stringify(upgradeLevels));
}

// Devuelve { leveledUp, newLevel, coinsGained } para que la UI decida qué mostrar
export function grantProgress(finalScore) {
    const oldLevel = getLevel(totalXP);
    totalXP += scoreToXP(finalScore);
    const newLevel = getLevel(totalXP);
    let coinsGained = 0;
    if (newLevel > oldLevel) {
        coinsGained = (newLevel - oldLevel) * COINS_PER_LEVEL;
        coins += coinsGained;
    }
    persist();
    return { leveledUp: newLevel > oldLevel, newLevel, coinsGained };
}

export function isShipUnlocked(id) { return unlockedShips.includes(id); }

export function unlockShip(id) {
    const ship = SHIPS.find(s => s.id === id);
    if (!ship || isShipUnlocked(id)) return false;
    if (coins < ship.cost) return false;
    coins -= ship.cost;
    unlockedShips.push(id);
    persist();
    return true;
}

// ===== SELECCIÓN DE NAVE POR JUGADOR (persistida) =====
export function getSelectedShip(playerNum) {
    return localStorage.getItem('neonSkySelectedShipP' + playerNum) || 'interceptor';
}
export function setSelectedShip(playerNum, id) {
    if (!isShipUnlocked(id)) return;
    localStorage.setItem('neonSkySelectedShipP' + playerNum, id);
}

// ===== MEJORAS PERMANENTES =====
export function getUpgradeLevel(id) { return upgradeLevels[id] || 0; }

export function upgradeCost(id) {
    const up = UPGRADES.find(u => u.id === id);
    if (!up) return null;
    const lvl = getUpgradeLevel(id);
    if (lvl >= up.maxLevel) return null; // al máximo
    return Math.floor(up.baseCost * Math.pow(up.growth, lvl));
}

export function purchaseUpgrade(id) {
    const cost = upgradeCost(id);
    if (cost === null || coins < cost) return false;
    coins -= cost;
    upgradeLevels[id] = getUpgradeLevel(id) + 1;
    persist();
    return true;
}

// Bonus numérico actual otorgado por una mejora (aplicado en Player.js)
export function getUpgradeBonus(id) {
    const lvl = getUpgradeLevel(id);
    switch (id) {
        case 'hp': return lvl * 5;
        case 'speed': return lvl * 0.3;
        case 'cooldown': return lvl * 0.04;   // fracción de reducción, tope 0.4
        case 'heatres': return lvl * 0.05;    // fracción de reducción, tope 0.5
        default: return 0;
    }
}

export { LEVEL_CAP };
