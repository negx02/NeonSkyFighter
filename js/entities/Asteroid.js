// ===== ASTEROIDE =====
import { ctx, canvas } from '../state.js';
import { SPRITE_ASTEROID } from '../sprites.js';

export class Asteroid {
    constructor() {
        this.x = Math.random() * (canvas.width - 40);
        this.y = -50;
        this.ps = 4 + Math.random() * 2;
        this.speed = 1 + Math.random();
        this.hp = 3;
        this.del = false;
        this.width = 8 * this.ps;
        this.height = 7 * this.ps;
    }
    update() {
        this.y += this.speed;
        if (this.y > canvas.height + 50) this.del = true;
    }
    draw() {
        ctx.fillStyle = '#888888';
        SPRITE_ASTEROID.forEach((row, i) => {
            row.forEach((pixel, j) => {
                if (pixel === 1) ctx.fillRect(this.x + j * this.ps, this.y + i * this.ps, this.ps, this.ps);
            });
        });
    }
}
