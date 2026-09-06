// ===== BALA =====
import { ctx, canvas } from '../state.js';

export class Bullet {
    constructor(x, y, vx, vy, color, isEnemy, dmg = 1) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.color = color; this.isEnemy = isEnemy; this.del = false;
        this.dmg = dmg;
        const scale = Math.max(0.6, Math.min(2, 0.6 + dmg * 0.5));
        this.width = 4 * scale;
        this.height = 12 * scale;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.y < 0 || this.y > canvas.height) this.del = true;
    }
    draw() {
        ctx.save();
        ctx.shadowColor = this.color; ctx.shadowBlur = 8;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
