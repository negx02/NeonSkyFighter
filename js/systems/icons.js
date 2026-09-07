// ===== ICONOS DE INTERFAZ (canvas pequeños, dibujados una vez al iniciar) =====

// Icono de "moneda" único: un cristal de energía (no una moneda circular),
// pensado para usarse inline junto a texto vía innerHTML.
export function coinIconHTML(size = 14) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:-3px; margin-right:2px;">
        <path d="M12 1.5 L22.5 9 L18.5 22.5 L5.5 22.5 L1.5 9 Z" fill="#39ff14" stroke="#0d5c04" stroke-width="1.5"/>
        <path d="M12 1.5 L12 22.5 M1.5 9 L22.5 9" stroke="#0d5c04" stroke-width="1"/>
        <circle cx="12" cy="12" r="3" fill="#c6ffc6"/>
    </svg>`;
}

export function drawSidebarIcons() {
    const ctxT = document.getElementById('icon-triple-canvas').getContext('2d');
    ctxT.strokeStyle = '#ffff00'; ctxT.lineWidth = 2; ctxT.beginPath(); ctxT.arc(20, 20, 18, 0, Math.PI * 2); ctxT.stroke();
    ctxT.fillStyle = '#ffff00'; ctxT.fillRect(10, 20, 6, 6); ctxT.fillRect(17, 10, 6, 6); ctxT.fillRect(24, 20, 6, 6);

    const ctxL = document.getElementById('icon-laser-canvas').getContext('2d');
    ctxL.strokeStyle = '#ff3366'; ctxL.lineWidth = 2; ctxL.beginPath(); ctxL.arc(20, 20, 18, 0, Math.PI * 2); ctxL.stroke();
    ctxL.fillStyle = '#ff3366'; ctxL.fillRect(18, 4, 4, 32);

    const ctxM = document.getElementById('icon-missile-canvas').getContext('2d');
    ctxM.strokeStyle = '#ff8800'; ctxM.lineWidth = 2; ctxM.beginPath(); ctxM.arc(20, 20, 18, 0, Math.PI * 2); ctxM.stroke();
    ctxM.fillStyle = '#ff8800'; ctxM.beginPath(); ctxM.moveTo(20, 6); ctxM.lineTo(26, 28); ctxM.lineTo(20, 24); ctxM.lineTo(14, 28); ctxM.closePath(); ctxM.fill();

    const ctxS = document.getElementById('icon-shield-canvas').getContext('2d');
    ctxS.strokeStyle = '#00ffff'; ctxS.lineWidth = 2; ctxS.beginPath(); ctxS.arc(20, 20, 18, 0, Math.PI * 2); ctxS.stroke();
    ctxS.beginPath(); ctxS.arc(20, 20, 10, 0, Math.PI * 2); ctxS.stroke();

    const ctxH = document.getElementById('icon-heal-canvas').getContext('2d');
    ctxH.strokeStyle = '#00ff00'; ctxH.lineWidth = 2; ctxH.beginPath(); ctxH.arc(20, 20, 18, 0, Math.PI * 2); ctxH.stroke();
    ctxH.fillStyle = '#00ff00'; ctxH.fillRect(18, 10, 4, 20); ctxH.fillRect(10, 18, 20, 4);

    const ctxR = document.getElementById('icon-revive-canvas').getContext('2d');
    ctxR.strokeStyle = '#ff0000'; ctxR.lineWidth = 2; ctxR.beginPath(); ctxR.arc(20, 20, 18, 0, Math.PI * 2); ctxR.stroke();
    ctxR.fillStyle = '#ff0000'; ctxR.font = '20px Arial'; ctxR.fillText('♥', 10, 28);
}
