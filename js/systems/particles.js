// ===== PARTÍCULAS DE EXPLOSIÓN =====
import { state, ctx } from '../state.js';

export function createExplosion(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        state.particles.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 40, maxLife: 40, color });
    }
}

export function updateAndDrawParticles() {
    state.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.96; p.life--;
        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.restore();
    });
    state.particles = state.particles.filter(p => p.life > 0);
}
