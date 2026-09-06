// ===== EVENTOS DE COMBATE COMPARTIDOS =====
import { state } from '../state.js';
import { createExplosion } from '../systems/particles.js';
import { registerKill } from '../systems/combo.js';
import { playSFX } from '../audio.js';
import { screenShake, hitStop } from '../systems/juice.js';
import { PowerUp } from '../entities/PowerUp.js';

export function killEnemy(e) {
    if (e.del) return;
    e.del = true;
    createExplosion(e.x, e.y, e.color);
    registerKill(100);
    hitStop(2);
    if (Math.random() < 0.22) {
        let type = 'triple';
        const deadP = state.players.find(pl => !pl.active);
        if (deadP && Math.random() < 0.35) type = 'revive';
        else {
            const r = Math.random();
            if (r < 0.2) type = 'triple';
            else if (r < 0.38) type = 'laser';
            else if (r < 0.56) type = 'missile';
            else if (r < 0.74) type = 'shield';
            else if (r < 0.9) type = 'heal';
            else type = 'bomb';
        }
        state.powerups.push(new PowerUp(e.x, e.y, type));
    }
}

export function triggerBomb(player, showHudMsg) {
    playSFX('bomb');
    screenShake(18, 24);
    hitStop(5);
    if (showHudMsg) showHudMsg('¡BOMBA!');
    let cleared = 0;
    state.enemies.forEach(e => { if (!e.del) { e.del = true; createExplosion(e.x, e.y, e.color, 6); cleared++; } });
    state.asteroids.forEach(a => { if (!a.del) { a.del = true; createExplosion(a.x, a.y, '#888', 6); cleared++; } });
    state.bullets.forEach(b => { if (b.isEnemy) b.del = true; });
    if (cleared > 0) registerKill(cleared * 40);
    state.bosses.forEach(b => { if (!b.del) { b.hp -= 150; createExplosion(b.x + b.width / 2, b.y + b.height / 2, '#fff', 20); } });
    state.flashScreen = 1;
}
