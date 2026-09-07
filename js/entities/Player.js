// ===== JUGADOR =====
import { state, ctx, canvas } from '../state.js';
import { getShip } from '../ships.js';
import { getUpgradeBonus } from '../systems/progression.js';
import { Bullet } from './Bullet.js';
import { Missile } from './Missile.js';
import { ReflectWall } from './ReflectWall.js';
import { Drone } from './Drone.js';
import { playSFX } from '../audio.js';
import { createExplosion } from '../systems/particles.js';
import { screenShake, hitStop } from '../systems/juice.js';
import { showHudMsg } from '../systems/ui.js';
import { triggerBomb } from '../systems/combatEvents.js';
import { isMouseControlled } from '../systems/input.js';

export class Player {
    constructor(id, shipId) {
        this.id = id; this.active = true;
        this.shipId = shipId || 'interceptor';
        this.ship = getShip(this.shipId);

        this.width = this.ship.cols * this.ship.ps;
        this.height = this.ship.rows * this.ship.ps;
        this.x = canvas.width / (id === 1 ? 3 : 1.5);
        this.y = Math.max(20, canvas.height - this.height - 60);
        this.color = id === 1 ? this.ship.color : this.ship.color;

        // ---- mejoras permanentes aplicadas aquí ----
        this.maxHp = this.ship.hp + getUpgradeBonus('hp');
        this.hp = this.maxHp;
        this.baseSpeed = this.ship.speed + getUpgradeBonus('speed');
        this.cooldownMult = 1 - getUpgradeBonus('cooldown');
        this.heatMult = 1 - getUpgradeBonus('heatres');

        this.heat = 0; this.maxHeat = 150; this.overheated = false;
        this.weaponLevel = 1; this.shield = false; this.powerupTimer = 0; this.pixelSize = this.ship.ps;
        this.missileTimer = 0;
        this.trail = [];

        // ---- estado de habilidad de nave ----
        this.abilityCooldown = 0; this.abilityTimer = 0;
        this.intangible = false; this.furyTimer = 0; this.fireBoostTimer = 0;

        // ---- estado de carga (Gunner) ----
        this.chargeTime = 0;

        this.hpEl = document.getElementById('p' + id + '-hp');
        this.heatBar = document.getElementById('p' + id + '-heat-bar');
    }

    update() {
        if (!this.active) return;
        let shoot = false;
        const prevX = this.x, prevY = this.y;
        let spd = this.baseSpeed;
        if (this.ship.abilityId === 'phase' && this.intangible) spd *= 1.5;
        if (this.ship.abilityId === 'fury' && this.furyTimer > 0) spd *= 1.3;

        if (isMouseControlled(this.id)) {
            this.x += (state.mouseX - this.width / 2 - this.x) * 0.15;
            this.y += (state.mouseY - this.height / 2 - this.y) * 0.15;
            if (state.isMouseDown) shoot = true;
        } else {
            const pressed = this.id === 2 ? state.p2Pressed : state.p1Pressed;
            if (pressed.left) this.x -= spd; if (pressed.right) this.x += spd;
            if (pressed.up) this.y -= spd; if (pressed.down) this.y += spd;
            if (pressed.shoot) shoot = true;
        }

        if (this.x < 0) this.x = 0; if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0; if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;

        const moved = Math.abs(this.x - prevX) + Math.abs(this.y - prevY);
        if (moved > 1.5) {
            this.trail.push({ x: this.x + this.width / 2, y: this.y + this.height / 2, life: 14 });
            if (this.trail.length > 10) this.trail.shift();
        }
        this.trail.forEach(t => t.life--);
        this.trail = this.trail.filter(t => t.life > 0);

        // El calor solo baja si NO estás disparando, o siempre si ya está sobrecalentada
        // (así ninguna nave puede disparar indefinidamente sin sobrecalentarse, sin importar mejoras).
        if (this.overheated) {
            this.heat -= 1.0;
            if (this.heat <= 40) this.overheated = false;
        } else if (!shoot && this.heat > 0) {
            this.heat -= (this.weaponLevel === 3 ? 0.6 : 1.0);
        }
        if (this.heat < 0) this.heat = 0;

        let fireInterval = (this.ship.fireMode === 'heavy') ? 14 : 8;
        if (this.furyTimer > 0 || this.fireBoostTimer > 0) fireInterval = 3;

        if (this.weaponLevel === 3) {
            if (shoot && !this.overheated) this.fireLaser();
        } else if (this.weaponLevel === 2) {
            if (shoot && state.frames % fireInterval === 0) this.fireTriplePowerup();
        } else if (this.ship.fireMode === 'charge') {
            this.handleCharge(shoot);
        } else {
            if (shoot && state.frames % fireInterval === 0) this.fireByShipPattern();
        }

        if (this.powerupTimer > 0) { this.powerupTimer--; if (this.powerupTimer <= 0) this.weaponLevel = 1; }
        if (this.missileTimer > 0) { this.missileTimer--; if (this.missileTimer % 45 === 0) this.fireMissile(); }

        if (this.abilityCooldown > 0) this.abilityCooldown--;
        if (this.abilityTimer > 0) { this.abilityTimer--; if (this.abilityTimer <= 0) this.intangible = false; }
        if (this.furyTimer > 0) this.furyTimer--;
        if (this.fireBoostTimer > 0) this.fireBoostTimer--;

        if (this.hpEl) this.hpEl.innerText = Math.ceil(this.hp);
        if (this.heatBar) {
            this.heatBar.style.width = (this.heat / 1.5) + '%';
            if (this.overheated) this.heatBar.classList.add('overheated'); else this.heatBar.classList.remove('overheated');
        }
    }

    addHeat(amount) {
        this.heat += amount * this.heatMult;
        if (this.heat >= this.maxHeat) { this.heat = this.maxHeat; this.overheated = true; playSFX('overheat'); }
        else playSFX('shoot');
    }

    // ---- patrones de disparo por nave (estado base, sin powerups) ----
    fireByShipPattern() {
        switch (this.ship.fireMode) {
            case 'dual': this.fireDual(); break;
            case 'burst': this.fireBurst(); break;
            case 'spread': this.fireSpread(); break;
            case 'heavy': this.fireHeavy(); break;
            default: this.fireSingle(); break;
        }
    }
    fireSingle() {
        if (this.overheated) return;
        state.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, 0, -12, this.color, false, 1));
        this.addHeat(15);
    }
    fireDual() {
        if (this.overheated) return;
        state.bullets.push(new Bullet(this.x + 6, this.y + 6, 0, -12, this.color, false, 0.8));
        state.bullets.push(new Bullet(this.x + this.width - 10, this.y + 6, 0, -12, this.color, false, 0.8));
        this.addHeat(18);
    }
    fireBurst() {
        if (this.overheated) return;
        for (let i = 0; i < 3; i++) {
            const jitter = (Math.random() - 0.5) * 6;
            state.bullets.push(new Bullet(this.x + this.width / 2 - 2 + jitter, this.y + i * 6, 0, -12, this.color, false, 0.5));
        }
        this.addHeat(20);
    }
    fireSpread() {
        if (this.overheated) return;
        state.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, 0, -12, this.color, false, 0.5));
        state.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y + 6, -2.5, -11, this.color, false, 0.4));
        state.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y + 6, 2.5, -11, this.color, false, 0.4));
        this.addHeat(15);
    }
    fireHeavy() {
        if (this.overheated) return;
        state.bullets.push(new Bullet(this.x + this.width / 2 - 3, this.y, 0, -10, this.color, false, 2.5));
        this.addHeat(20);
    }
    handleCharge(shoot) {
        if (shoot && !this.overheated) {
            this.chargeTime = Math.min(this.chargeTime + 1, 60);
            if (this.chargeTime % 5 === 0) playSFX('charge');
        } else {
            if (this.chargeTime > 5) this.releaseCharge();
            this.chargeTime = 0;
        }
        if (this.chargeTime >= 60) { this.releaseCharge(); this.chargeTime = 0; }
    }
    releaseCharge() {
        const ratio = this.chargeTime / 60;
        const dmgMult = 1 + ratio * 3; // hasta 4x
        state.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, 0, -12 - ratio * 4, this.color, false, dmgMult));
        this.addHeat(15 + ratio * 30);
    }
    // ---- override universal por powerup de triple disparo ----
    fireTriplePowerup() {
        if (this.overheated) return;
        state.bullets.push(new Bullet(this.x + 20, this.y, 0, -12, '#ffff00', false));
        state.bullets.push(new Bullet(this.x, this.y + 10, -2, -10, '#ffff00', false));
        state.bullets.push(new Bullet(this.x + 40, this.y + 10, 2, -10, '#ffff00', false));
        this.addHeat(15);
    }
    fireLaser() {
        this.addHeat(3);
        if (state.frames % 6 === 0) playSFX('laser');
        const beamX = this.x + this.width / 2 - 5, beamW = 10;
        state.enemies.forEach(e => { if (!e.del && e.x < beamX + beamW && e.x + e.width > beamX && e.y < this.y) { e.hp -= 0.5; if (e.hp <= 0 && !e.del) { e.del = true; createExplosion(e.x, e.y, e.color); } } });
        state.asteroids.forEach(a => { if (!a.del && a.x < beamX + beamW && a.x + a.width > beamX && a.y < this.y) { a.hp -= 0.3; if (a.hp <= 0 && !a.del) { a.del = true; createExplosion(a.x, a.y, '#888'); } } });
        state.bosses.forEach(b => { if (!b.del && b.x < beamX + beamW && b.x + b.width > beamX && b.y < this.y) b.hp -= 2.5; });
        this.laserActive = true; this.laserX = beamX; this.laserW = beamW;
        if (this.heat >= this.maxHeat) { this.heat = this.maxHeat; this.overheated = true; this.laserActive = false; }
    }
    fireMissile() {
        state.missiles.push(new Missile(this.x + this.width / 2, this.y, this.color));
        playSFX('missile');
    }

    // ---- habilidad única de nave (tecla configurable) ----
    activateAbility() {
        if (!this.active || this.abilityCooldown > 0) return;
        const ship = this.ship;
        this.abilityCooldown = ship.cooldown * this.cooldownMult;
        playSFX('ability');
        showHudMsg(ship.abilityName + ' ACTIVADA');
        switch (ship.abilityId) {
            case 'dash': {
                let dx = 0, dy = -1;
                const pressed = this.id === 2 ? state.p2Pressed : state.p1Pressed;
                if (pressed.left) dx = -1; if (pressed.right) dx = 1;
                if (pressed.up) dy = -1; if (pressed.down) dy = 1;
                const len = Math.hypot(dx, dy) || 1;
                this.x += (dx / len) * 110; this.y += (dy / len) * 110;
                this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
                this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
                this.intangible = true; this.abilityTimer = 22;
                createExplosion(this.x + this.width / 2, this.y + this.height / 2, this.color, 10);
                screenShake(3, 4);
                break;
            }
            case 'wall': state.reflectWalls.push(new ReflectWall(this)); break;
            case 'phase': this.intangible = true; this.abilityTimer = 150; break;
            case 'overcharge': {
                this.heat = 0; this.overheated = false;
                const cx = this.x + this.width / 2, cy = this.y + this.height / 2;
                for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; state.bullets.push(new Bullet(cx, cy, Math.cos(a) * 9, Math.sin(a) * 9, this.color, false)); }
                this.fireBoostTimer = 120;
                screenShake(6, 8);
                break;
            }
            case 'drone': state.drones.push(new Drone(this)); break;
            case 'fury': this.furyTimer = 300; break;
        }
    }

    draw() {
        if (!this.active) return;
        this.trail.forEach(t => {
            const alpha = (t.life / 14) * 0.35;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(t.x, t.y + 18, 6, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        if (this.shield) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(this.x + this.width / 2, this.y + this.height / 2, Math.max(this.width, this.height) * 0.9, 0, Math.PI * 2); ctx.stroke(); }

        // anillo de carga (Gunner)
        if (this.chargeTime > 0) {
            const r = 20 + (this.chargeTime / 60) * 20;
            ctx.save();
            ctx.strokeStyle = this.color; ctx.globalAlpha = 0.6; ctx.lineWidth = 2;
            ctx.shadowColor = this.color; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(this.x + this.width / 2, this.y + this.height / 2, r, 0, Math.PI * 2 * (this.chargeTime / 60)); ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        if (this.intangible) ctx.globalAlpha = 0.45;
        ctx.shadowColor = this.overheated ? '#ff0000' : (this.intangible ? '#ffffff' : this.color);
        ctx.shadowBlur = this.intangible ? 20 : 10;
        ctx.fillStyle = this.overheated ? '#ff0000' : this.color;
        this.ship.sprite.forEach((row, i) => { row.forEach((pixel, j) => { if (pixel === 1) ctx.fillRect(this.x + j * this.pixelSize, this.y + i * this.pixelSize, this.pixelSize, this.pixelSize); }); });
        ctx.restore();

        if (this.laserActive) {
            ctx.save();
            const grad = ctx.createLinearGradient(this.laserX, 0, this.laserX + this.laserW, 0);
            grad.addColorStop(0, 'rgba(255,51,102,0)');
            grad.addColorStop(0.5, 'rgba(255,80,140,0.95)');
            grad.addColorStop(1, 'rgba(255,51,102,0)');
            ctx.fillStyle = grad;
            ctx.shadowColor = '#ff3366'; ctx.shadowBlur = 20;
            ctx.fillRect(this.laserX, 0, this.laserW, this.y);
            ctx.restore();
            this.laserActive = false;
        }
    }

    hit(dmg) {
        if (window.debugGodMode) return; // DEBUG_MODE_HOOK — ver js/debug.js
        if (this.intangible) return;
        if (this.shield) { this.shield = false; showHudMsg('ESCUDO ROTO'); screenShake(6, 8); return; }
        this.hp -= dmg;
        screenShake(4, 6); hitStop(2);
        if (this.hp <= 0) {
            this.hp = 0; this.active = false;
            createExplosion(this.x + this.width / 2, this.y + this.height / 2, this.color, 24);
            playSFX('explosion');
            screenShake(14, 16); hitStop(4);
            showHudMsg(state.gameMode === '2P' ? `JUGADOR ${this.id} CAÍDO` : 'GAME OVER');
            if (this.hpEl) this.hpEl.innerText = '0';
        }
    }

    activatePowerup(type) {
        playSFX('powerup');
        this.overheated = false;
        if (type === 'triple') { this.weaponLevel = 2; this.powerupTimer = 600; showHudMsg('DISPARO TRIPLE'); }
        else if (type === 'laser') { this.weaponLevel = 3; this.powerupTimer = 480; showHudMsg('LÁSER ACTIVADO'); }
        else if (type === 'missile') { this.missileTimer = 900; showHudMsg('MISILES TELEDIRIGIDOS'); }
        else if (type === 'shield') { this.shield = true; showHudMsg('ESCUDO ACTIVO'); }
        else if (type === 'heal') { this.hp = Math.min(this.maxHp, this.hp + 25); showHudMsg('REPARACIÓN'); }
        else if (type === 'bomb') { triggerBomb(this, showHudMsg); }
        this.heat = Math.max(0, this.heat - 50);
    }
}
