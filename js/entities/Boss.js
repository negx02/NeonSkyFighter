// ===== BOSS =====
import { state, ctx, canvas } from '../state.js';
import { SPRITE_BOSS } from '../sprites.js';
import { Bullet } from './Bullet.js';
import { playSFX } from '../audio.js';

export class Boss {
    constructor(startX, dir, level) {
        this.ps = 8;
        this.width = 20 * this.ps; this.height = 10 * this.ps;
        this.x = startX; this.y = -200;
        this.dir = dir; this.level = level;
        this.maxHp = 1000 + (level * 800); this.hp = this.maxHp;
        this.entering = true; this.del = false;
        this.timer = 0; this.state = 'move'; this.charge = 0; this.targetIndex = 1;
    }
    getNextTarget() {
        const alive = state.players.filter(p => p.active);
        if (alive.length === 0) return { x: canvas.width / 2, width: 0, y: canvas.height };
        if (alive.length === 1) return alive[0];
        this.targetIndex = (this.targetIndex === 1) ? 2 : 1;
        return state.players.find(p => p.id === this.targetIndex);
    }
    update() {
        this.timer++;
        if (this.entering) {
            this.y += 2;
            if (this.y >= 140) this.entering = false;
        } else {
            if (this.state === 'move') {
                this.x += (3 + this.level * 0.5) * this.dir;
                if (this.x <= 0) { this.x = 0; this.dir = 1; }
                else if (this.x + this.width >= canvas.width) { this.x = canvas.width - this.width; this.dir = -1; }

                if (this.timer % 40 === 0) {
                    if (this.level === 1) this.shootTriple();
                    else if (this.level === 2) this.shootSpread();
                    else { if (this.timer % 80 === 0) this.shootRing(); else this.shootTriple(); }
                }
                if (this.timer % 250 === 0) { this.state = 'rapid_warmup'; this.timer = 0; }
                if (this.level >= 2 && this.timer % 400 === 0) { this.state = 'laser_charge'; this.timer = 0; }
            } else if (this.state === 'rapid_warmup') {
                this.x += (Math.random() - 0.5) * 8;
                if (this.timer > 40) { this.state = 'rapid_fire'; this.timer = 0; }
            } else if (this.state === 'rapid_fire') {
                if (this.timer === 1) this.currentTarget = this.getNextTarget();
                if (this.timer % 4 === 0) {
                    const target = this.currentTarget;
                    const dx = (target.x + target.width / 2) - (this.x + this.width / 2);
                    const dy = target.y - (this.y + this.height);
                    const angle = Math.atan2(dy, dx);
                    state.bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, Math.cos(angle) * 10, Math.sin(angle) * 10, '#ffaa00', true));
                    playSFX('shoot');
                }
                if (this.timer > 60) { this.state = 'move'; }
            } else if (this.state === 'laser_charge') {
                this.charge++;
                if (this.charge > 50) { this.state = 'laser_fire'; playSFX('laser'); }
            } else if (this.state === 'laser_fire') {
                this.charge++;
                const lx = this.x + this.width / 2 - 25;
                state.players.forEach(p => { if (p.active && p.x < lx + 50 && p.x + p.width > lx) p.hit(5); });
                if (this.charge > 110) { this.state = 'move'; this.charge = 0; }
            }
        }
    }
    shootTriple() {
        const cx = this.x + this.width / 2, cy = this.y + this.height;
        state.bullets.push(new Bullet(cx, cy, 0, 7, '#f0f', true));
        state.bullets.push(new Bullet(cx, cy, -2, 6, '#f0f', true));
        state.bullets.push(new Bullet(cx, cy, 2, 6, '#f0f', true));
    }
    shootSpread() {
        const cx = this.x + this.width / 2, cy = this.y + this.height;
        for (let i = -2; i <= 2; i++) state.bullets.push(new Bullet(cx, cy, i * 2, 6, '#ff00ff', true));
    }
    shootRing() {
        const cx = this.x + this.width / 2, cy = this.y + this.height / 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            state.bullets.push(new Bullet(cx, cy, Math.cos(angle) * 5, Math.sin(angle) * 5, '#ffaa00', true));
        }
    }
    draw() {
        let color = '#ff00ff';
        if (this.state === 'rapid_warmup' || this.state === 'laser_charge') color = '#ffffff';
        ctx.save();
        ctx.shadowColor = color; ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        SPRITE_BOSS.forEach((row, i) => { row.forEach((pixel, j) => { if (pixel === 1) ctx.fillRect(this.x + j * this.ps, this.y + i * this.ps, this.ps, this.ps); }); });
        ctx.restore();
        if (this.state === 'laser_fire') {
            const lx = this.x + this.width / 2;
            ctx.fillStyle = 'white'; ctx.fillRect(lx - 15, this.y + this.height, 30, canvas.height);
            ctx.fillStyle = 'rgba(255,0,0,0.5)'; ctx.fillRect(lx - 35, this.y + this.height, 70, canvas.height);
        }
        if (this.state === 'laser_charge') {
            ctx.fillStyle = `rgba(255,0,0,${this.charge / 60})`;
            ctx.beginPath(); ctx.arc(this.x + this.width / 2, this.y + this.height, this.charge, 0, Math.PI * 2); ctx.fill();
        }
    }
}
