// QuantumOS - Control Center UI

function setupControlCenter() {
    const toggle = document.getElementById('cc-toggle');
    const panel = document.getElementById('control-center');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (panel.style.display === 'block' && !panel.contains(e.target) && e.target !== toggle) {
            panel.style.display = 'none';
        }
    });

    document.querySelectorAll('.cc-toggle-tile').forEach(tile => {
        const stored = localStorage.getItem(`qos_cc_${tile.id}`);
        if (stored !== null) tile.dataset.on = stored;
        applyTileState(tile);
        tile.addEventListener('click', () => {
            tile.dataset.on = tile.dataset.on === 'true' ? 'false' : 'true';
            localStorage.setItem(`qos_cc_${tile.id}`, tile.dataset.on);
            applyTileState(tile);
            if (tile.id === 'cc-dnd') {
                showGlobalAlert(tile.dataset.on === 'true' ? 'Do Not Disturb enabled.' : 'Do Not Disturb disabled.');
            }
        });
    });

    const ccBrightness = document.getElementById('cc-brightness');
    const ccVolume = document.getElementById('cc-volume');

    const savedBrightness = localStorage.getItem('qos_brightness') || '100';
    const savedVolume = localStorage.getItem('qos_volume') || '70';

    if (ccBrightness) {
        ccBrightness.value = savedBrightness;
        ccBrightness.addEventListener('input', () => {
            if (typeof setBrightness === 'function') setBrightness(ccBrightness.value);
            const settingsSlider = document.getElementById('set-brightness');
            if (settingsSlider) settingsSlider.value = ccBrightness.value;
        });
    }
    if (ccVolume) {
        ccVolume.value = savedVolume;
        ccVolume.addEventListener('input', () => {
            if (typeof setVolume === 'function') setVolume(ccVolume.value);
            const settingsSlider = document.getElementById('set-volume');
            if (settingsSlider) settingsSlider.value = ccVolume.value;
        });
    }

    if (typeof setBrightness === 'function') setBrightness(savedBrightness);
}

function applyTileState(tile) {
    tile.classList.toggle('cc-tile-on', tile.dataset.on === 'true');
}
