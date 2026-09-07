// ===== CATÁLOGO DE NAVES =====
// fireMode define el patrón de disparo BASE de cada nave (sin powerups activos):
//   'single'  -> un disparo estándar (Interceptor)
//   'dual'    -> dos cañones en paralelo (Bulwark)
//   'burst'   -> ráfaga de 3 balas por activación (Phantom)
//   'charge'  -> mantener presionado carga el disparo, más daño cuanto más se carga (Gunner)
//   'spread'  -> abanico de 3 balas débiles, buena cobertura de área (Ingeniero)
//   'heavy'   -> dispara más lento pero con mucho más daño (Berserker)
// Los powerups (triple/láser) siguen funcionando igual sobre cualquier nave, como upgrade temporal universal.

import {
    SPRITE_PLAYER, SPRITE_BULWARK, SPRITE_PHANTOM, SPRITE_GUNNER, SPRITE_SUPPORT, SPRITE_BERSERKER
} from './sprites.js';

export const SHIPS = [
    {
        id: 'interceptor', name: 'INTERCEPTOR', cost: 0, color: '#00ffff',
        sprite: SPRITE_PLAYER, cols: 11, rows: 10, ps: 4, hp: 100, speed: 6,
        abilityId: 'dash', abilityName: 'IMPULSO FANTASMA', cooldown: 480,
        abilityDesc: 'Dash + invulnerabilidad breve.',
        fireMode: 'single', weaponName: 'Disparo Único', weaponDesc: 'Disparo equilibrado, sin debilidades.'
    },
    {
        id: 'bulwark', name: 'BULWARK', cost: 200, color: '#8899ff',
        sprite: SPRITE_BULWARK, cols: 13, rows: 9, ps: 4, hp: 160, speed: 4,
        abilityId: 'wall', abilityName: 'MURO REFLECTOR', cooldown: 900,
        abilityDesc: 'Muro que refleja balas enemigas 3s.',
        fireMode: 'dual', weaponName: 'Cañón Doble', weaponDesc: 'Dos cañones en paralelo. Pesada y lenta.'
    },
    {
        id: 'phantom', name: 'PHANTOM', cost: 300, color: '#cc66ff',
        sprite: SPRITE_PHANTOM, cols: 7, rows: 6, ps: 4, hp: 65, speed: 8,
        abilityId: 'phase', abilityName: 'FASE ESPECTRAL', cooldown: 720,
        abilityDesc: 'Intangible + más veloz 2.5s.',
        fireMode: 'burst', weaponName: 'Ráfaga', weaponDesc: 'Ráfaga de 3 balas. Frágil y muy veloz.'
    },
    {
        id: 'gunner', name: 'GUNNER', cost: 400, color: '#ff8833',
        sprite: SPRITE_GUNNER, cols: 11, rows: 8, ps: 4, hp: 100, speed: 5.5,
        abilityId: 'overcharge', abilityName: 'SOBRECARGA', cooldown: 1080,
        abilityDesc: 'Vacía el calor + ráfaga radial 16 balas.',
        fireMode: 'charge', weaponName: 'Carga Exponencial', weaponDesc: 'Mantén presionado: carga hasta 4x de daño.'
    },
    {
        id: 'support', name: 'INGENIERO', cost: 500, color: '#33ff99',
        sprite: SPRITE_SUPPORT, cols: 9, rows: 8, ps: 4, hp: 90, speed: 6,
        abilityId: 'drone', abilityName: 'DRON DE APOYO', cooldown: 1200,
        abilityDesc: 'Dron aliado que dispara solo 8s.',
        fireMode: 'spread', weaponName: 'Disparo Dispersor', weaponDesc: 'Abanico de 3 balas débiles, buena área.'
    },
    {
        id: 'berserker', name: 'BERSERKER', cost: 600, color: '#ff3355',
        sprite: SPRITE_BERSERKER, cols: 9, rows: 7, ps: 4, hp: 85, speed: 7,
        abilityId: 'fury', abilityName: 'FURIA', cooldown: 1080,
        abilityDesc: '5s de cadencia y velocidad muy altas.',
        fireMode: 'heavy', weaponName: 'Cañón Pesado', weaponDesc: 'Lento pero 2.5x de daño por bala.'
    },
];

export function getShip(id) {
    return SHIPS.find(s => s.id === id) || SHIPS[0];
}
