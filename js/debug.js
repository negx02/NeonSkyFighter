// ============================================================
// === DEBUG_MODE — módulo completo, fácil de eliminar ===
// Para quitarlo del proyecto cuando el juego esté listo:
//   1. Borra este archivo (js/debug.js)
//   2. Borra su <script type="module" src="js/debug.js"></script> de index.html (o su import en main.js)
//   3. Borra el bloque #debug-panel / #debug-toast de index.html
//   4. Borra la línea marcada DEBUG_MODE_HOOK en js/entities/Player.js (hit())
// ============================================================
import { state, canvas } from './state.js';
import { Enemy } from './entities/Enemy.js';
import { Asteroid } from './entities/Asteroid.js';
import { Boss } from './entities/Boss.js';
import { registerKill, updateComboUI } from './systems/combo.js';
import { bossHPContainer, bossLvlDisplay } from './systems/ui.js';

const panel = document.getElementById('debug-panel');
const toast = document.getElementById('debug-toast');
window.debugGodMode = false;
let typedBuffer = '';

function showToast(msg) {
    toast.innerText = msg;
    toast.style.display = 'block';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.style.display = 'none', 1500);
}

function ensureGameActive() {
    if (!state.gameRunning) { showToast('⚠ Empieza una partida primero'); return false; }
    return true;
}

function togglePanel() {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) showToast('🔓 Debug mode abierto');
}

window.addEventListener('keydown', (e) => {
    if (e.key.length === 1) {
        typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-10);
        if (typedBuffer.includes('debug')) { typedBuffer = ''; togglePanel(); }
    }
});

document.getElementById('dbg-close-btn').addEventListener('click', () => { togglePanel(); canvas.focus(); });

document.getElementById('dbg-godmode').addEventListener('click', (e) => {
    e.target.blur(); canvas.focus(); // evita que la barra espaciadora re-active el botón
    window.debugGodMode = !window.debugGodMode;
    e.target.innerText = 'God Mode: ' + (window.debugGodMode ? 'ON' : 'OFF');
    e.target.classList.toggle('on', window.debugGodMode);
    showToast(window.debugGodMode ? '🛡 God Mode activado' : 'God Mode desactivado');
});

panel.querySelectorAll('button[data-dbg]').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.blur(); canvas.focus(); // FIX: evita que Space re-active el botón enfocado (bug del boss en bucle)
        const action = btn.dataset.dbg;

        if (action === 'boss') {
            if (!ensureGameActive()) return;
            const lvl = parseInt(btn.dataset.lvl);
            state.isBossActive = true; state.enemies = []; state.powerups = []; state.asteroids = []; state.bosses = [];
            const newBoss = new Boss(0, 1, lvl);
            newBoss.x = canvas.width / 2 - newBoss.width / 2;
            state.bosses.push(newBoss);
            state.bossLevel = lvl;
            bossHPContainer.classList.remove('hidden');
            bossLvlDisplay.innerText = lvl;
            showToast('👾 Boss nivel ' + lvl + ' invocado');
        } else if (action === 'enemy') {
            if (!ensureGameActive()) return;
            state.enemies.push(new Enemy(btn.dataset.type));
            showToast('Enemigo "' + btn.dataset.type + '" invocado');
        } else if (action === 'asteroid') {
            if (!ensureGameActive()) return;
            state.asteroids.push(new Asteroid());
            showToast('Asteroide invocado');
        } else if (action === 'power') {
            if (!ensureGameActive()) return;
            const type = btn.dataset.type;
            state.players.forEach(p => { if (p.active) p.activatePowerup(type); });
            showToast('Powerup "' + type + '" otorgado');
        } else if (action === 'revive') {
            if (!ensureGameActive()) return;
            state.players.forEach(p => { if (!p.active) { p.active = true; p.hp = p.maxHp; } });
            showToast('Jugadores revividos');
        } else if (action === 'addscore') {
            if (!ensureGameActive()) return;
            const amount = parseInt(btn.dataset.amount);
            registerKill(amount);
            showToast('+' + amount + ' score');
        } else if (action === 'skipboss') {
            if (!ensureGameActive()) return;
            state.score = state.nextBossScore + 1;
            showToast('Boss forzado a aparecer');
        } else if (action === 'clearall') {
            if (!ensureGameActive()) return;
            state.enemies = []; state.asteroids = []; state.bullets = []; state.missiles = []; state.bosses = [];
            state.isBossActive = false; bossHPContainer.classList.add('hidden');
            showToast('Pantalla limpiada');
        } else if (action === 'maxcombo') {
            if (!ensureGameActive()) return;
            state.comboCount = 20; state.comboTimer = 100; updateComboUI(true);
            showToast('Combo x20 forzado');
        } else if (action === 'coins') {
            // acceso rápido para probar el hangar/taller sin jugar 50 partidas
            import('./systems/progression.js').then(mod => {
                // progression no expone un setter directo a propósito; usamos localStorage por ser solo debug
                const cur = parseInt(localStorage.getItem('neonSkyCoins')) || 0;
                localStorage.setItem('neonSkyCoins', cur + 500);
                showToast('+500 monedas (recarga el hangar para verlas)');
            });
        }
    });
});
// === DEBUG_MODE fin del módulo ===
