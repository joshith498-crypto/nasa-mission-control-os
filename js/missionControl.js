// QuantumOS - Mission Control & Telemetry
const BOOT_TIME = Date.now();
let cpuHistory = Array.from({ length: 40 }, () => 20 + Math.random() * 20);
let ramHistory = Array.from({ length: 40 }, () => 35 + Math.random() * 15);

function setupMissionControl() {
    setInterval(tickMissionControl, 1000);
    tickMissionControl();
}

function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function tickMissionControl() {
    const win = document.getElementById('window-mission-control');
    if (!win || win.style.display === 'none') return;

    const clockEl = document.getElementById('mc-clock');
    const uptimeEl = document.getElementById('mc-uptime');
    const crystalsEl = document.getElementById('mc-crystals');
    const activeEl = document.getElementById('mc-active-windows');

    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString();
    if (uptimeEl) uptimeEl.textContent = formatDuration(Date.now() - BOOT_TIME);
    if (crystalsEl) crystalsEl.textContent = SystemState.energyCrystals;

    const openWindows = Array.from(document.querySelectorAll('.mac-window')).filter(w => w.style.display !== 'none');
    if (activeEl) activeEl.textContent = openWindows.length;

    const listEl = document.getElementById('mc-window-list');
    if (listEl) {
        listEl.innerHTML = openWindows.length
            ? openWindows.map(w => `<div class="mc-list-row">🟢 ${w.querySelector('.window-title') ? w.querySelector('.window-title').textContent : w.id}</div>`).join('')
            : `<div class="mc-list-row mc-dim">No active modules</div>`;
    }

    cpuHistory.push(clamp(cpuHistory[cpuHistory.length - 1] + (Math.random() - 0.5) * 18, 8, 96));
    if (cpuHistory.length > 40) cpuHistory.shift();
    ramHistory.push(clamp(ramHistory[ramHistory.length - 1] + (Math.random() - 0.5) * 10, 20, 90));
    if (ramHistory.length > 40) ramHistory.shift();

    drawTelemetryGraph('mc-cpu-canvas', cpuHistory, '#00ff66');
    drawTelemetryGraph('mc-ram-canvas', ramHistory, '#ffb347');

    renderMissionControlNotifs();
}

function drawTelemetryGraph(canvasId, series, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let gy = 0; gy <= h; gy += h / 4) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
    }

    // Line
    const stepX = w / (series.length - 1);
    ctx.beginPath();
    series.forEach((v, idx) => {
        const x = idx * stepX;
        const y = h - (v / 100) * h;
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, hexToRgba(color, 0.25));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.fill();

    // Value label
    const last = Math.round(series[series.length - 1]);
    ctx.fillStyle = color;
    ctx.font = '11px monospace';
    ctx.fillText(`${last}%`, w - 32, 14);
}

function renderMissionControlNotifs() {
    const notifEl = document.getElementById('mc-notif-list');
    if (!notifEl) return;
    notifEl.innerHTML = NotificationLog.length
        ? NotificationLog.map(n => `<div class="mc-list-row">🔔 ${n.message} <span class="mc-dim">— ${n.time.toLocaleTimeString()}</span></div>`).join('')
        : `<div class="mc-list-row mc-dim">No recent activity</div>`;
}
