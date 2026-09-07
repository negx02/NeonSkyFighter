// ===== CONFIGURACIÓN GLOBAL DEL JUEGO =====
// Constantes de balance. Cambiar aquí afecta a todo el juego.

export const BOSS_SCORE_THRESHOLD = 7000;
export const COMBO_WINDOW = 100; // frames antes de que el combo se reinicie
export const LEVEL_CAP = 500;

// XP requerida para pasar del nivel N al N+1.
// Crece con el nivel (más difícil conforme subes), tope en LEVEL_CAP.
export function xpRequiredForLevel(level) {
    return Math.floor(150 * Math.pow(level, 1.35));
}

export function getLevel(xp) {
    let level = 1;
    let remaining = xp;
    while (level < LEVEL_CAP) {
        const need = xpRequiredForLevel(level);
        if (remaining < need) break;
        remaining -= need;
        level++;
    }
    return level;
}

// Devuelve progreso detallado: nivel actual, xp ya acumulada dentro del nivel, y xp necesaria para el siguiente
export function xpProgress(xp) {
    let level = 1;
    let remaining = xp;
    while (level < LEVEL_CAP) {
        const need = xpRequiredForLevel(level);
        if (remaining < need) return { level, into: remaining, need };
        remaining -= need;
        level++;
    }
    return { level, into: 0, need: xpRequiredForLevel(LEVEL_CAP - 1) };
}

// XP ganada por partida: mucho más lento que el score bruto (antes 1:1, ahora 1:10)
export function scoreToXP(score) {
    return Math.floor(score / 10);
}

// Monedas otorgadas por cada nivel ganado (antes 100, ahora mucho menor)
export const COINS_PER_LEVEL = 20;
