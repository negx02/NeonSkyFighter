// ===== MISIL TELEDIRIGIDO =====
import { state, ctx, canvas } from '../state.js';
import { playSFX } from '../audio.js';
import { createExplosion } from '../systems/particles.js';

export class Missile {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.vx = 0; this.vy = -6;
        this.color = color; this.del = false; this.width = 6; this.height = 14;
        this.target = null; this.life = 200; this.turnSpeed = 0.14;
    }
    findTarget() {
        const candidates = [...state.enemies.filter(e => !e.del), ...state.asteroids.filter(a => !a.del), ...state.bosses.filter(b => !b.del)];
        if (candidates.length === 0) { this.target = null; return; }
        let closest = null, minDist = Infinity;
        candidates.forEach(c => {
            const cx = c.x + (c.width || 40) / 2, cy = c.y + (c.height || 30) / 2;
            const d = Math.hypot(cx - this.x, cy - this.y);
            if (d < minDist) { minDist = d; closest = c; }
        });
        this.target = closest;
    }
    update() {
        this.life--;
        if (this.life <= 0) this.del = true;
        if (!this.target || this.target.del) this.findTarget();
        if (this.target) {
            const tx = this.target.x + (this.target.width || 40) / 2;
            const ty = this.target.y + (this.target.height || 30) / 2;
            const angleToTarget = Math.atan2(ty - this.y, tx - this.x);
            const currentAngle = Math.atan2(this.vy, this.vx);
            let diff = angleToTarget - currentAngle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const newAngle = currentAngle + Math.max(-this.turnSpeed, Math.min(this.turnSpeed, diff));
            const speed = 7;
            this.vx = Math.cos(newAngle) * speed;
            this.vy = Math.sin(newAngle) * speed;
        }
        this.x += this.vx; this.y += this.vy;
        if (this.y < -30 || this.y > canvas.height + 30 || this.x < -30 || this.x > canvas.width + 30) this.del = true;
    }
    draw() {
        ctx.save();
        const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        ctx.translate(this.x, this.y); ctx.rotate(angle);
        ctx.shadowColor = this.color; ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath(); ctx.fill();
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 1, this.y + 6, 2, 6); ctx.restore();
    }
    explode() {
        createExplosion(this.x, this.y, this.color, 10);
        playSFX('explosion');
        if (this.target && !this.target.del && this.target.hp !== undefined) this.target.hp -= 3;
    }
}
