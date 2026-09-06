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
        abilityDesc: 'Dash instantáneo en la dirección del movimiento + invulnerabilidad breve. Nave equilibrada, ideal para empezar.',
        fireMode: 'single', weaponName: 'Disparo Único', weaponDesc: 'Cadencia estándar, daño base. Sin sorpresas, sin debilidades.'
    },
    {
        id: 'bulwark', name: 'BULWARK', cost: 200, color: '#8899ff',
        sprite: SPRITE_BULWARK, cols: 13, rows: 8, ps: 4, hp: 160, speed: 4,
        abilityId: 'wall', abilityName: 'MURO REFLECTOR', cooldown: 900,
        abilityDesc: 'Nave pesada y resistente (160 HP) pero lenta. Despliega una barrera que refleja las balas enemigas de vuelta por 3s.',
        fireMode: 'dual', weaponName: 'Cañón Doble', weaponDesc: 'Dispara dos proyectiles en paralelo, uno por cada cañón lateral.'
    },
    {
        id: 'phantom', name: 'PHANTOM', cost: 300, color: '#cc66ff',
        sprite: SPRITE_PHANTOM, cols: 7, rows: 7, ps: 4, hp: 65, speed: 8,
        abilityId: 'phase', abilityName: 'FASE ESPECTRAL', cooldown: 720,
        abilityDesc: 'Nave frágil (65 HP) pero muy veloz. Vuélvete intangible e inmune al daño 2.5s, con boost de velocidad.',
        fireMode: 'burst', weaponName: 'Ráfaga', weaponDesc: 'Cada disparo suelta una ráfaga rápida de 3 balas en abanico cerrado.'
    },
    {
        id: 'gunner', name: 'GUNNER', cost: 400, color: '#ff8833',
        sprite: SPRITE_GUNNER, cols: 13, rows: 9, ps: 4, hp: 100, speed: 5.5,
        abilityId: 'overcharge', abilityName: 'SOBRECARGA', cooldown: 1080,
        abilityDesc: 'Vacía el calor al instante y dispara una ráfaga radial de 16 balas en todas direcciones. Ideal contra oleadas.',
        fireMode: 'charge', weaponName: 'Carga Exponencial', weaponDesc: 'Mantén presionado disparar: cuanto más tiempo cargues, más daño y más grande sale el disparo (hasta 4x).'
    },
    {
        id: 'support', name: 'INGENIERO', cost: 500, color: '#33ff99',
        sprite: SPRITE_SUPPORT, cols: 11, rows: 9, ps: 4, hp: 90, speed: 6,
        abilityId: 'drone', abilityName: 'DRON DE APOYO', cooldown: 1200,
        abilityDesc: 'Invoca un dron aliado que dispara automáticamente al enemigo más cercano durante 8 segundos.',
        fireMode: 'spread', weaponName: 'Disparo Dispersor', weaponDesc: 'Abanico de 3 balas débiles pero con buena cobertura de área. Ideal contra oleadas dispersas.'
    },
    {
        id: 'berserker', name: 'BERSERKER', cost: 600, color: '#ff3355',
        sprite: SPRITE_BERSERKER, cols: 11, rows: 8, ps: 4, hp: 85, speed: 7,
        abilityId: 'fury', abilityName: 'FURIA', cooldown: 1080,
        abilityDesc: 'Durante 5s dispara mucho más rápido y se mueve más veloz (sinergia directa con su cañón, normalmente lento).',
        fireMode: 'heavy', weaponName: 'Cañón Pesado', weaponDesc: 'Dispara mucho más lento pero cada bala hace 2.5x de daño. Su habilidad Furia lo convierte temporalmente en un arma rápida.'
    },
];

export function getShip(id) {
    return SHIPS.find(s => s.id === id) || SHIPS[0];
}
