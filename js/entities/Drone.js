// ===== DRON DE APOYO (habilidad del Ingeniero) =====
import { state, ctx } from '../state.js';
import { Bullet } from './Bullet.js';
import { playSFX } from '../audio.js';

export class Drone {
    constructor(player) {
        this.owner = player;
        this.x = player.x + player.width + 10;
        this.y = player.y;
        this.life = 480; this.del = false; this.fireTimer = 0;
    }
    update() {
        if (!this.owner.active) { this.del = true; return; }
        const targetX = this.owner.x + this.owner.width + 14;
        const targetY = this.owner.y - 6;
        this.x += (targetX - this.x) * 0.12;
        this.y += (targetY - this.y) * 0.12;
        this.life--; this.fireTimer--;
        if (this.life <= 0) this.del = true;
        if (this.fireTimer <= 0) {
            const candidates = [...state.enemies.filter(e => !e.del), ...state.asteroids.filter(a => !a.del), ...state.bosses.filter(b => !b.del)];
            if (candidates.length > 0) {
                let closest = null, minDist = Infinity;
                candidates.forEach(c => { const d = Math.hypot(c.x - this.x, c.y - this.y); if (d < minDist) { minDist = d; closest = c; } });
                const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
                state.bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * 10, Math.sin(angle) * 10, '#33ff99', false));
                playSFX('shoot');
            }
            this.fireTimer = 40;
        }
    }
    draw() {
        ctx.save();
        ctx.shadowColor = '#33ff99'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#33ff99';
        ctx.beginPath(); ctx.arc(this.x, this.y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#122'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
    }
}
