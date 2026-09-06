// ===== POWERUP =====
import { ctx, canvas } from '../state.js';

export class PowerUp {
    constructor(x, y, type) { this.x = x; this.y = y; this.type = type; this.del = false; this.bob = Math.random() * Math.PI * 2; }
    update() { this.y += 2; this.bob += 0.15; if (this.y > canvas.height) this.del = true; }
    draw() {
        const bobY = Math.sin(this.bob) * 2;
        ctx.save();
        ctx.translate(0, bobY);
        ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(this.x + 12, this.y + 12, 12, 0, Math.PI * 2);
        if (this.type === 'triple') { ctx.strokeStyle = '#ffff00'; ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 10; ctx.stroke(); ctx.fillStyle = '#ffff00'; ctx.fillRect(this.x + 6, this.y + 10, 4, 4); ctx.fillRect(this.x + 10, this.y + 6, 4, 4); ctx.fillRect(this.x + 14, this.y + 10, 4, 4); }
        else if (this.type === 'laser') { ctx.strokeStyle = '#ff3366'; ctx.shadowColor = '#ff3366'; ctx.shadowBlur = 10; ctx.stroke(); ctx.fillStyle = '#ff3366'; ctx.fillRect(this.x + 10, this.y + 3, 4, 18); }
        else if (this.type === 'missile') { ctx.strokeStyle = '#ff8800'; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 10; ctx.stroke(); ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.moveTo(this.x + 12, this.y + 2); ctx.lineTo(this.x + 18, this.y + 20); ctx.lineTo(this.x + 12, this.y + 16); ctx.lineTo(this.x + 6, this.y + 20); ctx.closePath(); ctx.fill(); }
        else if (this.type === 'shield') { ctx.strokeStyle = '#00ffff'; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 10; ctx.stroke(); ctx.beginPath(); ctx.arc(this.x + 12, this.y + 12, 6, 0, Math.PI * 2); ctx.stroke(); }
        else if (this.type === 'heal') { ctx.strokeStyle = '#00ff00'; ctx.shadowColor = '#00ff00'; ctx.shadowBlur = 10; ctx.stroke(); ctx.fillStyle = '#00ff00'; ctx.fillRect(this.x + 10, this.y + 6, 4, 12); ctx.fillRect(this.x + 6, this.y + 10, 12, 4); }
        else if (this.type === 'revive') { ctx.strokeStyle = '#ff0000'; ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 10; ctx.stroke(); ctx.fillStyle = '#ff0000'; ctx.font = '16px Arial'; ctx.fillText('♥', this.x + 5, this.y + 18); }
        else if (this.type === 'bomb') { ctx.strokeStyle = '#ffffff'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 14; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.x + 12, this.y + 12, 7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#ff3333'; ctx.beginPath(); ctx.moveTo(this.x + 12, this.y + 2); ctx.lineTo(this.x + 15, this.y - 3); ctx.stroke(); }
        ctx.restore();
    }
}
