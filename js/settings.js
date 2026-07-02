// QuantumOS - System Settings & Customization

function setupSettingsPanel() {
    const brightnessSlider = document.getElementById('set-brightness');
    const blurSlider = document.getElementById('set-blur');
    const volumeSlider = document.getElementById('set-volume');
    const usernameInput = document.getElementById('set-username');
    const resetBtn = document.getElementById('set-reset-os');
    const reduceMotion = document.getElementById('set-reduce-motion');
    const tabs = document.querySelectorAll('.settings-nav-item');

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const targetedTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.settings-tab-panel').forEach(p => p.style.display = 'none');
            const targetPanel = document.getElementById(targetedTab);
            if (targetPanel) targetPanel.style.display = 'block';
        });
    });

    if (brightnessSlider) {
        brightnessSlider.value = localStorage.getItem('qos_brightness') || '100';
        brightnessSlider.addEventListener('input', () => {
            setBrightness(brightnessSlider.value);
            const cc = document.getElementById('cc-brightness');
            if (cc) cc.value = brightnessSlider.value;
        });
    }

    if (blurSlider) {
        const savedBlur = localStorage.getItem('qos_blur') || '30';
        blurSlider.value = savedBlur;
        applyGlassBlur(savedBlur);
        blurSlider.addEventListener('input', () => {
            applyGlassBlur(blurSlider.value);
            localStorage.setItem('qos_blur', blurSlider.value);
        });
    }

    if (volumeSlider) {
        volumeSlider.value = localStorage.getItem('qos_volume') || '70';
        volumeSlider.addEventListener('input', () => {
            setVolume(volumeSlider.value);
            const cc = document.getElementById('cc-volume');
            if (cc) cc.value = volumeSlider.value;
        });
    }

    if (reduceMotion) {
        const saved = localStorage.getItem('qos_reduce_motion') === 'true';
        reduceMotion.checked = saved;
        document.body.classList.toggle('qos-reduce-motion', saved);
        reduceMotion.addEventListener('change', () => {
            document.body.classList.toggle('qos-reduce-motion', reduceMotion.checked);
            localStorage.setItem('qos_reduce_motion', reduceMotion.checked);
        });
    }

    if (usernameInput) {
        usernameInput.value = localStorage.getItem('qos_username') || SystemState.userAccount;
        usernameInput.addEventListener('change', () => {
            const val = usernameInput.value.trim() || 'Astronaut Voyager';
            SystemState.userAccount = val;
            localStorage.setItem('qos_username', val);
            showGlobalAlert(`Account name updated to ${val}.`);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('This will erase all files, settings, and high scores. Continue?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    document.querySelectorAll('.accent-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.accent;
            document.documentElement.style.setProperty('--qos-accent', color);
            localStorage.setItem('qos_accent', color);
        });
    });
    const savedAccent = localStorage.getItem('qos_accent');
    if (savedAccent) document.documentElement.style.setProperty('--qos-accent', savedAccent);
}

function applyGlassBlur(px) {
    document.querySelectorAll('.mac-window, .mac-menu-bar, .mac-dock, .finder-context-menu, .control-center').forEach(el => {
        el.style.backdropFilter = `blur(${px}px)`;
    });
}

function setBrightness(value) {
    document.body.style.filter = `brightness(${value}%)`;
    localStorage.setItem('qos_brightness', value);
    const ccVal = document.getElementById('cc-brightness-val');
    if (ccVal) ccVal.textContent = `${value}%`;
}

function setVolume(value) {
    localStorage.setItem('qos_volume', value);
    const ccVal = document.getElementById('cc-volume-val');
    if (ccVal) ccVal.textContent = `${value}%`;
}

function setupWallpaperEngine() {
    const bg = document.getElementById('desktop-bg');
    const buttons = document.querySelectorAll('.wp-btn');
    if (!bg) return;

    const saved = localStorage.getItem('qos_wallpaper');
    if (saved) {
        bg.className = 'desktop-workspace bg-' + saved;
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            bg.className = 'desktop-workspace';
            const variant = btn.getAttribute('data-color');
            bg.classList.add(`bg-${variant}`);
            localStorage.setItem('qos_wallpaper', variant);
            showGlobalAlert(`Wallpaper updated to: [${variant.toUpperCase()}]`);
        });
    });
}
