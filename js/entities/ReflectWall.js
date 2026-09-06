// ===== MURO REFLECTOR (habilidad de Bulwark) =====
import { ctx } from '../state.js';

export class ReflectWall {
    constructor(player) {
        this.owner = player;
        this.width = player.width + 24;
        this.height = 10;
        this.x = player.x - 12;
        this.y = player.y - 18;
        this.life = 180; this.del = false;
    }
    update() {
        if (this.owner.active) { this.x = this.owner.x - 12; this.y = this.owner.y - 18; }
        this.life--;
        if (this.life <= 0 || !this.owner.active) this.del = true;
    }
    draw() {
        ctx.save();
        const alpha = Math.min(1, this.life / 30);
        ctx.globalAlpha = 0.85 * alpha;
        ctx.fillStyle = '#8899ff';
        ctx.shadowColor = '#8899ff'; ctx.shadowBlur = 14;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
