// ===== PUNTO DE ENTRADA =====
import { canvas } from './state.js';
import { state } from './state.js';
import { initInputListeners, setAbilityPressHandler } from './systems/input.js';
import { initScreens } from './screens.js';
import { initAttractStars, startAnimationLoop } from './game.js';
import { drawControlIcons, drawSidebarIcons } from './systems/icons.js';

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    initAttractStars();
}

function bootstrap() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawControlIcons();
    drawSidebarIcons();

    setAbilityPressHandler((playerNum) => {
        const p = state.players.find(pl => pl.id === playerNum);
        if (p) p.activateAbility();
    });
    initInputListeners();
    initScreens();
    startAnimationLoop();
}

bootstrap();

// El panel de debug se importa aparte y es 100% opcional / removible.
// Ver js/debug.js para instrucciones de cómo quitarlo del proyecto.
import './debug.js';
