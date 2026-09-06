// ===== ESTADO GLOBAL COMPARTIDO =====
// Un único objeto mutable que todos los módulos importan y modifican.
// Evita depender de variables globales sueltas y hace explícito qué se comparte.

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

export const state = {
    gameRunning: false,
    isPaused: false,
    isGameOver: false,
    gameMode: '1P',
    score: 0,
    frames: 0,
    difficulty: 1,

    inputMode: 'keyboard',
    mouseX: 0,
    mouseY: 0,
    isMouseDown: false,
    keys: { Space: false, w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false },

    players: [],
    bullets: [],
    missiles: [],
    enemies: [],
    particles: [],
    powerups: [],
    bosses: [],
    asteroids: [],
    reflectWalls: [],
    drones: [],
    stars: [],
    starsFar: [],

    isBossActive: false,
    bossLevel: 1,
    nextBossScore: 7000,

    comboCount: 0,
    comboTimer: 0,

    shakeMag: 0,
    shakeTimer: 0,
    freezeFrames: 0,
    flashScreen: 0,

    selectedShipP1: 'interceptor',
    selectedShipP2: 'interceptor',

    isRebindingKey: false,
};
