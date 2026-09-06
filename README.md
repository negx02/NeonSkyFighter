# Neon Sky Fighter

Shooter arcade en HTML5 Canvas, reestructurado como proyecto modular con ES Modules.

## ⚠️ Cómo ejecutarlo (importante)

Este proyecto usa **ES Modules** (`import`/`export`), por lo que **no puedes abrir `index.html` con doble clic** (los navegadores bloquean `import` bajo el protocolo `file://` por CORS). Necesitas servirlo desde un servidor local. Opciones:

**Opción 1 — Python (ya viene instalado en la mayoría de sistemas):**
```bash
cd neon-sky-fighter
python3 -m http.server 8000
```
Luego abre `http://localhost:8000` en tu navegador.

**Opción 2 — Node.js:**
```bash
cd neon-sky-fighter
npx serve .
```

**Opción 3 — VS Code:**
Instala la extensión "Live Server" y haz click derecho sobre `index.html` → "Open with Live Server".

## Estructura del proyecto

```
neon-sky-fighter/
├── index.html              # HTML principal (pantallas + estructura del HUD)
├── css/
│   └── main.css             # Todos los estilos
├── js/
│   ├── main.js               # Punto de entrada: arranca todo
│   ├── config.js              # Constantes de balance (XP, niveles, teclas reservadas)
│   ├── state.js                # Estado global compartido (arrays de entidades, flags)
│   ├── audio.js                 # Efectos de sonido sintetizados
│   ├── sprites.js                # Arrays de pixel art
│   ├── ships.js                   # Catálogo de naves (stats, habilidad, patrón de disparo)
│   ├── game.js                     # Loop principal, spawns, colisiones, start/gameOver
│   ├── screens.js                   # Navegación entre pantallas (Inicio→Modo→Hangar→Juego)
│   ├── debug.js                      # Panel de debug (ver sección "Quitar el debug mode")
│   ├── entities/
│   │   ├── Player.js                  # Jugador: movimiento, disparo, habilidades
│   │   ├── Bullet.js, Missile.js, ReflectWall.js, Drone.js
│   │   ├── Enemy.js, Boss.js, Asteroid.js, PowerUp.js
│   └── systems/
│       ├── progression.js             # XP, niveles, monedas, naves desbloqueadas, mejoras
│       ├── combatEvents.js             # killEnemy(), triggerBomb()
│       ├── combo.js                     # Sistema de combo/multiplicador
│       ├── particles.js                  # Explosiones
│       ├── juice.js                       # Screen shake / hit-stop
│       ├── input.js                        # Teclado, mouse, rebind de teclas
│       ├── ui.js                            # Referencias DOM y actualización del HUD
│       └── icons.js                          # Dibuja los iconos de las barras laterales
└── README.md
```

## Cómo se organiza la lógica

- **`state.js`** es el único lugar con estado mutable compartido (arrays de balas, enemigos, jugadores, score, etc). Todos los módulos lo importan y modifican directamente — es un patrón simple pensado para que cualquier módulo nuevo pueda leer/escribir el estado del juego sin tener que pasar props por 10 capas.
- **`entities/`** son clases con su propio `update()`/`draw()`. No conocen la lógica del loop principal, solo su propio comportamiento.
- **`systems/`** son funciones utilitarias sin estado propio de "entidad" (partículas, combo, progresión, input, UI).
- **`game.js`** es el orquestador: decide cuándo spawnear qué, revisa colisiones, y llama a `gameOver()`/`startGame()`.
- **`screens.js`** solo se encarga de mostrar/ocultar pantallas y renderizar el hangar/taller — no tiene lógica de juego.

## Cómo agregar contenido nuevo

- **Nueva nave:** agrégala al array `SHIPS` en `js/ships.js` (necesita un sprite en `js/sprites.js`, un `fireMode` — implementa uno nuevo en `Player.js` si no existe uno parecido — y una `abilityId` con su `case` correspondiente en `Player.activateAbility()`).
- **Nuevo enemigo:** crea la clase en `js/entities/` siguiendo el patrón de `Enemy.js`, y agrégalo a `spawnLogic()` en `game.js`.
- **Nuevo powerup:** agrega el `case` en `Player.activatePowerup()` y en el dibujo de `PowerUp.js`.
- **Nueva pantalla de menú:** agrega el `<div class="overlay-screen">` en `index.html`, agrégalo a la lista `ALL_SCREENS` en `screens.js`, y crea las funciones de navegación correspondientes.

## Quitar el debug mode

El panel de debug (acceso oculto: escribe `debug` con el teclado durante una partida) está pensado para borrarse fácilmente cuando el juego esté listo para publicarse:

1. Borra `js/debug.js`
2. Borra la línea `import './debug.js';` al final de `js/main.js`
3. Borra el bloque `<!-- === DEBUG_MODE ... === -->` de `index.html`
4. Borra el bloque de CSS `#debug-panel` / `#debug-toast` en `css/main.css` (marcado con comentarios `DEBUG_MODE_START`/`END`)
5. Borra la línea marcada `// DEBUG_MODE_HOOK` dentro de `Player.hit()` en `js/entities/Player.js`

## Balance actual (editable en `js/config.js` y `js/systems/progression.js`)

- Nivel máximo: 500 (`LEVEL_CAP`)
- XP requerida por nivel: crece exponencialmente (`150 * nivel^1.35`)
- XP ganada por partida: `score / 10`
- Monedas por nivel ganado: 20
- Mejoras permanentes en el Taller: hasta 10 niveles cada una, con costo creciente
