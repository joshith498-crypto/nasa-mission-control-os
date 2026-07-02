// Zenith Shell - Core System & State
const SystemState = {
    userAccount: 'Astronaut Voyager',
    energyCrystals: parseInt(localStorage.getItem('qos_crystals')) || 0,
    currentPath: ['Desktop']
};

document.addEventListener('DOMContentLoaded', () => {
    // Core Init
    if (typeof setupAuth === 'function') setupAuth();
    initializeClock();
    setupWindowControls();
    
    // Module Init
    if (typeof VFS !== 'undefined') VFS.init();
    setupAppLaunchers();
    
    // Feature Init
    if (typeof setupFinder === 'function') setupFinder();
    if (typeof setupWallpaperEngine === 'function') setupWallpaperEngine();
    if (typeof setupArcadeModules === 'function') setupArcadeModules();
    if (typeof setupSnakeGame === 'function') setupSnakeGame();
    if (typeof setupMinesweeper === 'function') setupMinesweeper();
    if (typeof setupMemoryGame === 'function') setupMemoryGame();
    if (typeof setupTerminalConsole === 'function') setupTerminalConsole();
    if (typeof setupMissionControl === 'function') setupMissionControl();
    if (typeof setupControlCenter === 'function') setupControlCenter();
    if (typeof setupSettingsPanel === 'function') setupSettingsPanel();
    if (typeof setupNotesApp === 'function') setupNotesApp();
    if (typeof setupCalculator === 'function') setupCalculator();
    if (typeof setupSpotlight === 'function') setupSpotlight();
    
    loadHardwareTelemetry();
});

function initializeClock() {
    const clockElement = document.getElementById('live-clock');
    const updateTime = () => {
        const d = new Date();
        let h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        if (clockElement) clockElement.textContent = `${h}:${m} ${ampm}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function loadHardwareTelemetry() {
    const hardwareLabel = document.getElementById('spec-hardware');
    const osLabel = document.getElementById('spec-os');
    const browserLabel = document.getElementById('spec-browser');

    if (hardwareLabel) hardwareLabel.textContent = "ThinkPad Framework Architecture (i3 Matrix)";
    if (osLabel) osLabel.textContent = "NASA Core Linux Shell Embedded v6.0";
    if (browserLabel) browserLabel.textContent = navigator.userAgent.split(" ").slice(-1)[0] || "Webkit Kernel Engine";
}

function runBootSequence() {
    const screen = document.getElementById('boot-screen');
    const fill = document.getElementById('boot-bar-fill');
    const log = document.getElementById('boot-log');
    if (!screen) return;

    const lines = [
        'INITIALIZING ZENITH KERNEL...',
        'MOUNTING VIRTUAL FILE SYSTEM...',
        'CALIBRATING TELEMETRY ARRAY...',
        'LINKING DEEP SPACE NETWORK...',
        'LOADING DOCK INTERFACE...',
        'ALL SYSTEMS NOMINAL.'
    ];

    let i = 0;
    const total = lines.length;
    const step = () => {
        if (i >= total) {
            setTimeout(() => {
                screen.style.opacity = '0';
                setTimeout(() => {
                    screen.style.display = 'none';
                    if (typeof showGlobalAlert === 'function') {
                        showGlobalAlert(`Welcome back, ${SystemState.userAccount}. All systems nominal.`);
                    }
                }, 500);
            }, 250);
            return;
        }
        const p = document.createElement('div');
        p.textContent = `> ${lines[i]}`;
        if (log) log.appendChild(p);
        if (fill) fill.style.width = `${Math.round(((i + 1) / total) * 100)}%`;
        i++;
        setTimeout(step, 280);
    };
    step();
}
