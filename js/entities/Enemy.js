// ===== ENEMIGOS =====
import { state, ctx, canvas } from '../state.js';
import { SPRITE_ENEMY, SPRITE_CHASER, SPRITE_MINER, SPRITE_WEAVER } from '../sprites.js';
import { Bullet } from './Bullet.js';
import { createExplosion } from '../systems/particles.js';
import { playSFX } from '../audio.js';

export class Enemy {
    constructor(type) {
        this.type = type;
        this.width = 40; this.height = 28;
        this.x = Math.random() * (canvas.width - this.width); this.y = -50;
        this.del = false;
        this.baseX = this.x;
        this.sineOffset = Math.random() * Math.PI * 2;

        if (type === 'chaser') {
            this.speed = 6 + (state.difficulty * 0.6);
            this.hp = 1; this.color = '#ffaa00';
            this.width = 28; this.height = 20;
        } else if (type === 'miner') {
            this.speed = 2; this.hp = 2; this.color = '#ffff00';
            this.width = 28; this.height = 28;
            this.targetAsteroid = null;
        } else if (type === 'weaver') {
            this.speed = 2.5 + (state.difficulty * 0.3);
            this.hp = 2; this.color = '#33ff99';
            this.width = 24; this.height = 24;
        } else {
            this.speed = 2 + (state.difficulty * 0.2);
            this.hp = 1; this.color = '#ff3333';
        }
    }
    update() {
        if (this.type === 'miner') {
            if (!this.targetAsteroid || this.targetAsteroid.del) {
                const visible = state.asteroids.filter(a => !a.del && a.y > 0 && a.y < canvas.height);
                if (visible.length > 0) {
                    let closest = null, minDist = 9999;
                    visible.forEach(a => {
                        const dist = Math.hypot(a.x - this.x, a.y - this.y);
                        if (dist < minDist) { minDist = dist; closest = a; }
                    });
                    this.targetAsteroid = closest;
                }
            }
            if (this.targetAsteroid) {
                const angle = Math.atan2(this.targetAsteroid.y - this.y, this.targetAsteroid.x - this.x);
                this.x += Math.cos(angle) * 3; this.y += Math.sin(angle) * 3;
                const dist = Math.hypot(this.targetAsteroid.x - this.x, this.targetAsteroid.y - this.y);
                if (dist < 30) {
                    this.targetAsteroid.del = true; this.targetAsteroid.hp = 0;
                    createExplosion(this.x, this.y, '#888', 10);
                    playSFX('rock_break');
                    for (let i = 0; i < 4; i++) {
                        const angleShot = (Math.PI / 2) + (i - 1.5) * 0.5;
                        state.bullets.push(new Bullet(this.x, this.y, Math.cos(angleShot) * 4, Math.sin(angleShot) * 4, '#888', true));
                    }
                    this.targetAsteroid = null;
                }
            } else {
                this.y += this.speed;
            }
        } else if (this.type === 'chaser') {
            this.y += this.speed;
            const target = state.players.find(p => p.active);
            if (target) { if (this.x < target.x) this.x += 2.5; else if (this.x > target.x) this.x -= 2.5; }
        } else if (this.type === 'weaver') {
            this.y += this.speed;
            this.x = this.baseX + Math.sin(state.frames * 0.05 + this.sineOffset) * 70;
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        } else {
            this.y += this.speed;
        }
        if (this.y > canvas.height + 50) this.del = true;
    }
    draw() {
        ctx.save();
        ctx.shadowColor = this.color; ctx.shadowBlur = 6;
        ctx.fillStyle = this.color;
        let sprite = SPRITE_ENEMY, ps = 4;
        if (this.type === 'chaser') { sprite = SPRITE_CHASER; ps = 4; }
        if (this.type === 'miner') { sprite = SPRITE_MINER; ps = 4; }
        if (this.type === 'weaver') { sprite = SPRITE_WEAVER; ps = 5; }
        sprite.forEach((r, i) => r.forEach((p, j) => { if (p) ctx.fillRect(this.x + j * ps, this.y + i * ps, ps, ps); }));
        ctx.restore();
    }
}
