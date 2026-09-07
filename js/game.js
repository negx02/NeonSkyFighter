// ===== NÚCLEO DEL JUEGO: loop, spawns, colisiones =====
import { state, ctx, canvas } from './state.js';
import { BOSS_SCORE_THRESHOLD } from './config.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Asteroid } from './entities/Asteroid.js';
import { Boss } from './entities/Boss.js';
import { PowerUp } from './entities/PowerUp.js';
import { updateAndDrawParticles, createExplosion } from './systems/particles.js';
import { registerKill, tickCombo, resetCombo } from './systems/combo.js';
import { killEnemy } from './systems/combatEvents.js';
import { playSFX, resumeAudio } from './audio.js';
import { showHudMsg, showGameHUD, hideGameHUD, setP2HudVisible, updateAbilityUI, bossHPContainer, bossHPBar, bossLvlDisplay, p1ScoreEl, p2ScoreEl } from './systems/ui.js';
import { grantProgress } from './systems/progression.js';

let highScore1P = parseInt(localStorage.getItem('neonSkyHighscore1P')) || 0;
let highScore2P = parseInt(localStorage.getItem('neonSkyHighscore2P')) || 0;

const highScoreDisplay = document.getElementById('high-score-display');
const highScoreBox = document.getElementById('highscore-box');
const newRecordMsg = document.getElementById('new-record-msg');
const gameOverScreen = document.getElementById('game-over-screen');

const slotTriple = document.getElementById('slot-triple');
const slotLaser = document.getElementById('slot-laser');
const slotMissile = document.getElementById('slot-missile');
const slotShield = document.getElementById('slot-shield');
const slotHeal = document.getElementById('slot-heal');
const slotRevive = document.getElementById('slot-revive');

export function getHighScores() { return { highScore1P, highScore2P }; }

export function initAttractStars() {
    state.stars = Array(80).fill().map(() => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2, speed: Math.random() * 3 + 1 }));
    state.starsFar = Array(50).fill().map(() => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 1.2 + 0.3, speed: Math.random() * 0.8 + 0.2 }));
}

export function startGame(mode, shipP1, shipP2) {
    resumeAudio();
    state.gameMode = mode;

    // salvaguarda: si el canvas no tiene dimensiones válidas (p.ej. layout no resuelto aún), recalcular
    if (!canvas.width || !canvas.height) {
        canvas.width = canvas.clientWidth || 800;
        canvas.height = canvas.clientHeight || 600;
    }

    state.players = [];
    state.players.push(new Player(1, shipP1));
    if (mode === '2P') { state.players.push(new Player(2, shipP2)); setP2HudVisible(true); }
    else { setP2HudVisible(false); }

    state.score = 0; state.difficulty = 1; state.frames = 0;
    state.bullets = []; state.missiles = []; state.enemies = []; state.particles = [];
    state.powerups = []; state.bosses = []; state.asteroids = []; state.reflectWalls = []; state.drones = [];
    resetCombo();
    state.bossLevel = 1; state.nextBossScore = BOSS_SCORE_THRESHOLD; state.isBossActive = false;
    bossHPContainer.classList.add('hidden');
    p1ScoreEl.innerText = '0'; p2ScoreEl.innerText = '0';
    slotTriple.classList.remove('active'); slotLaser.classList.remove('active'); slotMissile.classList.remove('active');
    slotShield.classList.remove('active'); slotHeal.classList.remove('active'); slotRevive.style.display = 'none';

    showGameHUD();
    updateAbilityUI();
    state.gameRunning = true; state.isPaused = false; state.isGameOver = false;
    canvas.focus();
}

export function gameOver() {
    state.gameRunning = false;
    state.isGameOver = true;

    document.getElementById('final-score').innerText = state.score;
    const progress = grantProgress(state.score);
    if (progress.leveledUp) setTimeout(() => showHudMsg(`¡NIVEL ${progress.newLevel}! +${progress.coinsGained} MONEDAS`), 800);

    if (state.gameMode === '1P') {
        if (state.score > highScore1P) { highScore1P = state.score; localStorage.setItem('neonSkyHighscore1P', state.score); newRecordMsg.classList.remove('hidden'); }
        else newRecordMsg.classList.add('hidden');
    } else {
        if (state.score > highScore2P) { highScore2P = state.score; localStorage.setItem('neonSkyHighscore2P', state.score); newRecordMsg.classList.remove('hidden'); }
        else newRecordMsg.classList.add('hidden');
    }

    gameOverScreen.classList.remove('hidden');
    hideGameHUD();
}

export function updateHighscoreBox() {
    const cur = state.gameMode === '1P' ? highScore1P : highScore2P;
    if (state.score > cur) { highScoreDisplay.innerText = state.score; highScoreBox.classList.add('new-record'); }
    else { highScoreDisplay.innerText = cur; highScoreBox.classList.remove('new-record'); }
}

function updateSidebarUI() {
    updateHighscoreBox();
    if (state.gameMode === '1P' && state.players[0]) {
        const p = state.players[0];
        if (p.weaponLevel === 2) { slotTriple.classList.add('active'); slotLaser.classList.remove('active'); }
        else if (p.weaponLevel === 3) { slotLaser.classList.add('active'); slotTriple.classList.remove('active'); }
        else { slotTriple.classList.remove('active'); slotLaser.classList.remove('active'); }
        if (p.shield) slotShield.classList.add('active'); else slotShield.classList.remove('active');
        if (p.missileTimer > 0) slotMissile.classList.add('active'); else slotMissile.classList.remove('active');
    }
}

function updateAttractMode() {
    state.frames++;
}

function spawnLogic() {
    if (state.score > 0 && state.score % 2000 === 0 && !state.isBossActive) {
        state.powerups.push(new PowerUp(Math.random() * (canvas.width - 50), 0, 'heal'));
        state.score += 10;
    }
    if (!state.isBossActive) {
        const rate = state.gameMode === '2P' ? 20 : 40;
        if (state.frames % rate === 0) {
            const rand = Math.random();
            if (rand < 0.15 && state.score > 3000) state.enemies.push(new Enemy('weaver'));
            else if (rand < 0.3 && state.score > 1000) state.enemies.push(new Enemy('chaser'));
            else if (rand < 0.45 && state.score > 2000) state.enemies.push(new Enemy('miner'));
            else state.enemies.push(new Enemy('basic'));
        }
        if (state.frames % 80 === 0) state.asteroids.push(new Asteroid());

        if (state.score > state.nextBossScore) {
            state.isBossActive = true; state.enemies = []; state.powerups = []; state.asteroids = [];
            const newBoss = new Boss(0, 1, state.bossLevel);
            newBoss.x = canvas.width / 2 - newBoss.width / 2;
            state.bosses.push(newBoss);
            bossHPContainer.classList.remove('hidden');
            bossLvlDisplay.innerText = state.bossLevel;
        }
    }
}

function updateBullets() {
    state.bullets.forEach(b => {
        b.update();
        if (b.isEnemy && !b.del) {
            state.reflectWalls.forEach(w => {
                if (!w.del && b.x < w.x + w.width && b.x + b.width > w.x && b.y < w.y + w.height && b.y + b.height > w.y) {
                    b.isEnemy = false; b.color = '#8899ff'; b.vy = -Math.abs(b.vy || 4); b.vx *= -1;
                }
            });
        }
        b.draw();
        if (!b.isEnemy) {
            state.enemies.forEach(e => {
                if (!b.del && !e.del && b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                    b.del = true; e.hp -= b.dmg;
                    if (e.hp <= 0 && !e.del) killEnemy(e);
                }
            });
            state.asteroids.forEach(a => {
                if (!b.del && !a.del && b.x > a.x && b.x < a.x + a.width && b.y > a.y && b.y < a.y + a.height) {
                    b.del = true; a.hp -= b.dmg;
                    if (a.hp <= 0) { a.del = true; createExplosion(a.x, a.y, '#888'); registerKill(50); }
                }
            });
            state.bosses.forEach(boss => {
                if (!b.del && !boss.del && b.x < boss.x + boss.width && b.x + b.width > boss.x && b.y < boss.y + boss.height && b.y + b.height > boss.y) {
                    b.del = true; boss.hp -= 10 * b.dmg; createExplosion(b.x, b.y, '#fff', 2);
                }
            });
        } else {
            state.players.forEach(p => {
                if (p.active && !b.del && b.x < p.x + p.width && b.x + b.width > p.x && b.y < p.y + p.height && b.y + b.height > p.y) {
                    b.del = true; p.hit(10);
                }
            });
        }
    });
}

function updateMissiles() {
    state.missiles.forEach(m => {
        m.update(); m.draw();
        state.enemies.forEach(e => {
            if (!m.del && !e.del && m.x > e.x && m.x < e.x + e.width && m.y > e.y && m.y < e.y + e.height) {
                m.del = true; m.explode(); e.hp -= 3;
                if (e.hp <= 0 && !e.del) killEnemy(e);
            }
        });
        state.asteroids.forEach(a => {
            if (!m.del && !a.del && m.x > a.x && m.x < a.x + a.width && m.y > a.y && m.y < a.y + a.height) {
                m.del = true; m.explode(); a.hp -= 3;
                if (a.hp <= 0) { a.del = true; createExplosion(a.x, a.y, '#888'); registerKill(50); }
            }
        });
        state.bosses.forEach(boss => {
            if (!m.del && !boss.del && m.x > boss.x && m.x < boss.x + boss.width && m.y > boss.y && m.y < boss.y + boss.height) {
                m.del = true; m.explode(); boss.hp -= 25;
            }
        });
    });
}

function animate() {
    ctx.save();
    let sx = 0, sy = 0;
    if (state.shakeTimer > 0) {
        sx = (Math.random() - 0.5) * state.shakeMag;
        sy = (Math.random() - 0.5) * state.shakeMag;
        state.shakeTimer--; state.shakeMag *= 0.92;
        if (state.shakeTimer <= 0) state.shakeMag = 0;
    }
    ctx.translate(sx, sy);

    ctx.fillStyle = '#000000'; ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
    ctx.fillStyle = '#5566aa';
    state.starsFar.forEach(s => { ctx.globalAlpha = 0.5; ctx.fillRect(s.x, s.y, s.size, s.size); s.y += s.speed; if (s.y > canvas.height) s.y = 0; });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    state.stars.forEach(s => { ctx.fillRect(s.x, s.y, s.size, s.size); s.y += s.speed; if (s.y > canvas.height) s.y = 0; });

    if (state.flashScreen > 0) {
        ctx.fillStyle = `rgba(255,255,255,${state.flashScreen})`;
        ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
        state.flashScreen -= 0.08;
        if (state.flashScreen < 0) state.flashScreen = 0;
    }

    requestAnimationFrame(animate);

    if (!state.gameRunning && !state.isGameOver) { updateAttractMode(); ctx.restore(); return; }
    if (!state.gameRunning && state.isGameOver) { ctx.restore(); return; }
    if (state.isPaused) { ctx.restore(); return; }

    if (state.freezeFrames > 0) {
        state.freezeFrames--;
        state.players.forEach(p => p.draw());
        state.enemies.forEach(e => e.draw());
        state.asteroids.forEach(a => a.draw());
        state.bullets.forEach(b => b.draw());
        state.missiles.forEach(m => m.draw());
        state.bosses.forEach(b => b.draw());
        ctx.restore();
        return;
    }

    tickCombo();
    state.players.forEach(p => p.update());
    spawnLogic();
    state.players.forEach(p => p.draw());

    state.reflectWalls.forEach(w => { w.update(); w.draw(); });
    state.reflectWalls = state.reflectWalls.filter(w => !w.del);

    state.drones.forEach(d => { d.update(); d.draw(); });
    state.drones = state.drones.filter(d => !d.del);

    updateBullets();
    updateMissiles();

    state.asteroids.forEach(a => {
        if (a.del) return;
        a.update(); a.draw();
        state.players.forEach(p => {
            if (p.active && !a.del && p.x < a.x + a.width && p.x + p.width > a.x && p.y < a.y + a.height && p.y + p.height > a.y) {
                a.del = true; p.hit(30); createExplosion(p.x, p.y, '#aaa');
            }
        });
    });

    state.enemies.forEach(e => {
        if (e.del) return;
        e.update(); e.draw();
        state.players.forEach(p => {
            if (p.active && !e.del && p.x < e.x + e.width && p.x + p.width > e.x && p.y < e.y + e.height && p.y + p.height > e.y) {
                e.del = true; p.hit(20); createExplosion(p.x, p.y, '#f00');
            }
        });
    });

    if (state.isBossActive) {
        let totalMax = 0, totalCur = 0;
        state.bosses.forEach(b => {
            b.update(); b.draw();
            totalMax += b.maxHp; totalCur += b.hp;
            state.players.forEach(p => { if (p.active && p.x < b.x + b.width && p.x + p.width > b.x && p.y < b.y + b.height && p.y + p.height > b.y) p.hit(2); });
            if (b.hp <= 0) { b.del = true; createExplosion(b.x + 50, b.y + 30, '#f0f', 30); playSFX('explosion'); registerKill(2000); }
        });
        state.bosses = state.bosses.filter(b => !b.del);
        if (state.bosses.length === 0) {
            state.isBossActive = false; bossHPContainer.classList.add('hidden');
            state.bossLevel++; state.nextBossScore = state.score + 7000; state.difficulty += 0.5;
            showHudMsg('AMENAZA ELIMINADA');
        } else {
            bossHPBar.style.width = (totalCur / totalMax * 100) + '%';
        }
    }

    state.powerups.forEach(pu => {
        if (pu.del) return;
        pu.update(); pu.draw();
        state.players.forEach(p => {
            if (p.active && !pu.del && p.x < pu.x + 24 && p.x + p.width > pu.x && p.y < pu.y + 24 && p.y + p.height > pu.y) {
                pu.del = true;
                if (pu.type === 'revive') {
                    const dead = state.players.find(pl => !pl.active);
                    if (dead) { dead.active = true; dead.hp = 50; dead.x = p.x; dead.y = p.y; playSFX('revive'); showHudMsg('COMPAÑERO REVIVIDO'); slotRevive.style.display = 'none'; }
                } else p.activatePowerup(pu.type);
            }
        });
    });

    state.bullets = state.bullets.filter(x => !x.del);
    state.missiles = state.missiles.filter(x => !x.del);
    state.enemies = state.enemies.filter(x => !x.del);
    state.asteroids = state.asteroids.filter(x => !x.del);
    state.powerups = state.powerups.filter(x => !x.del);
    updateAndDrawParticles();

    if (state.players.length > 0 && state.players.every(p => !p.active)) gameOver();

    state.frames++;
    updateSidebarUI();
    updateAbilityUI();
    ctx.restore();
}

export function startAnimationLoop() { animate(); }

const pauseScreen = document.getElementById('pause-screen');

export function togglePause() {
    if (!state.gameRunning || state.isGameOver) return;
    state.isPaused = !state.isPaused;
    if (state.isPaused) pauseScreen.classList.remove('hidden');
    else pauseScreen.classList.add('hidden');
}
window.__togglePause = togglePause; // puente para systems/input.js (evita import circular)

export function resetToMenu() {
    state.gameRunning = false; state.isPaused = false; state.isGameOver = false;
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    bossHPContainer.classList.add('hidden');
    slotTriple.classList.remove('active'); slotLaser.classList.remove('active'); slotMissile.classList.remove('active');
    slotShield.classList.remove('active'); slotHeal.classList.remove('active'); slotRevive.style.display = 'none';
    hideGameHUD();
}
