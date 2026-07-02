// QuantumOS - Window Management System

function setupWindowControls() {
    const windows = document.querySelectorAll('.mac-window');

    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        const closeBtn = win.querySelector('.close-btn');
        const minBtn = win.querySelector('.min-btn');
        const maxBtn = win.querySelector('.max-btn');

        if (closeBtn) closeBtn.addEventListener('click', () => {
            win.classList.add('closing');
            setTimeout(() => { win.style.display = 'none'; win.classList.remove('closing'); }, 160);
        });
        
        if (minBtn) minBtn.addEventListener('click', () => {
            win.classList.add('minimizing');
            setTimeout(() => { win.style.display = 'none'; win.classList.remove('minimizing'); }, 220);
        });

        if (maxBtn) {
            maxBtn.addEventListener('click', () => {
                if (win.dataset.maximized === 'true') {
                    win.style.width = win.dataset.prevW || '620px';
                    win.style.height = win.dataset.prevH || '390px';
                    win.style.top = win.dataset.prevT || '15%';
                    win.style.left = win.dataset.prevL || '25%';
                    win.dataset.maximized = 'false';
                } else {
                    win.dataset.prevW = win.style.width;
                    win.dataset.prevH = win.style.height;
                    win.dataset.prevT = win.style.top;
                    win.dataset.prevL = win.style.left;
                    win.style.width = '100vw';
                    win.style.height = 'calc(100vh - 26px)';
                    win.style.top = '26px';
                    win.style.left = '0';
                    win.dataset.maximized = 'true';
                }
            });
        }

        win.addEventListener('mousedown', () => {
            windows.forEach(w => w.style.zIndex = '1000');
            win.style.zIndex = '2000';
        });

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        if (header) {
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('dot')) return;
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialLeft = win.offsetLeft;
                initialTop = win.offsetTop;
                document.body.classList.add('no-select');
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            win.style.left = `${initialLeft + deltaX}px`;
            win.style.top = `${initialTop + deltaY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.classList.remove('no-select');
            }
        });
    });
}

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'flex';
    win.style.zIndex = '2000';
    win.classList.add('opening');
    setTimeout(() => win.classList.remove('opening'), 220);
}

function setupAppLaunchers() {
    const launchConfig = [
        { triggerId: 'shortcut-finder', targetWindowId: 'window-finder' },
        { triggerId: 'shortcut-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'shortcut-games', targetWindowId: 'window-games' },
        { triggerId: 'shortcut-missions', targetWindowId: 'window-projects' }, // Fixed ID mismatch
        { triggerId: 'shortcut-settings', targetWindowId: 'window-settings' },
        { triggerId: 'shortcut-mc', targetWindowId: 'window-mission-control' },
        { triggerId: 'shortcut-notes', targetWindowId: 'window-notes' },
        { triggerId: 'shortcut-calc', targetWindowId: 'window-calculator' },
        { triggerId: 'dock-finder', targetWindowId: 'window-finder' },
        { triggerId: 'dock-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'dock-games', targetWindowId: 'window-games' },
        { triggerId: 'dock-projects', targetWindowId: 'window-projects' },
        { triggerId: 'dock-settings', targetWindowId: 'window-settings' },
        { triggerId: 'dock-mc', targetWindowId: 'window-mission-control' },
        { triggerId: 'dock-notes', targetWindowId: 'window-notes' },
        { triggerId: 'dock-calc', targetWindowId: 'window-calculator' }
    ];

    launchConfig.forEach(cfg => {
        const el = document.getElementById(cfg.triggerId);
        if (el) {
            el.addEventListener('dblclick', () => openWindow(cfg.targetWindowId));
            // Add single click for dock items
            if (cfg.triggerId.startsWith('dock-')) {
                el.addEventListener('click', () => openWindow(cfg.targetWindowId));
            }
        }
    });
}
