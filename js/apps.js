// QuantumOS - Additional Applications (Notes, Calculator, Spotlight)

function setupNotesApp() {
    const area = document.getElementById('notes-area');
    if (!area) return;
    area.value = localStorage.getItem('qos_notes') || 'Welcome to Quantum Notes.\n\n- Subsystem tracking active\n- Oxygen levels nominal\n- Next EVA in 4 hours';
    area.addEventListener('input', () => {
        localStorage.setItem('qos_notes', area.value);
    });
}

function setupCalculator() {
    const display = document.getElementById('calc-display');
    const buttons = document.querySelectorAll('.calc-btn');
    if (!display) return;

    let current = '0';
    let prev = null;
    let op = null;
    let reset = false;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.textContent;
            if (btn.classList.contains('calc-op')) {
                if (val === 'C') {
                    current = '0'; prev = null; op = null;
                } else if (val === '=') {
                    if (op && prev !== null) {
                        current = String(eval(`${prev}${op}${current}`));
                        op = null; prev = null;
                    }
                } else {
                    op = val === '×' ? '*' : val === '÷' ? '/' : val;
                    prev = current;
                    reset = true;
                }
            } else {
                if (current === '0' || reset) {
                    current = val;
                    reset = false;
                } else {
                    current += val;
                }
            }
            display.textContent = current;
        });
    });
}

function setupSpotlight() {
    const overlay = document.getElementById('spotlight-overlay');
    const input = document.getElementById('spotlight-input');
    const results = document.getElementById('spotlight-results');
    if (!overlay || !input) return;

    const openOverlay = () => { overlay.style.display = 'flex'; input.focus(); input.value = ''; renderResults(''); };
    const closeOverlay = () => { overlay.style.display = 'none'; };

    function renderResults(query) {
        results.innerHTML = '';
        if (!query.trim()) return;
        query = query.toLowerCase();
        
        let matches = [];
        // Search VFS
        if (typeof VFS !== 'undefined') {
            matches = searchVFS(VFS.root, [], query);
        }
        
        if (matches.length === 0) {
            results.innerHTML = '<div class="spotlight-no-results">No matches found.</div>';
            return;
        }

        matches.slice(0, 6).forEach(m => {
            const el = document.createElement('div');
            el.className = 'spotlight-result-item';
            el.innerHTML = `<span>${m.node.type === 'folder' ? '📁' : '📄'}</span> <span>${m.node.name}</span> <small>${m.path.join('/')}</small>`;
            el.onclick = () => {
                if (m.node.type === 'folder') {
                    SystemState.currentPath = m.path;
                    if (typeof renderFinder === 'function') renderFinder();
                    openWindow('window-finder');
                } else {
                    alert(`Opening file: ${m.node.name}\n\nContent: ${m.node.content}`);
                }
                closeOverlay();
            };
            results.appendChild(el);
        });
    }

    function searchVFS(node, path, query) {
        let matches = [];
        if (!node.children) return matches;
        Object.values(node.children).forEach(child => {
            const childPath = [...path, child.name];
            if (child.name.toLowerCase().includes(query)) matches.push({ node: child, path: childPath });
            if (child.type === 'folder') matches = matches.concat(searchVFS(child, childPath, query));
        });
        return matches;
    }

    input.oninput = () => renderResults(input.value);
    input.onkeydown = (e) => { if (e.key === 'Escape') closeOverlay(); };
    overlay.onclick = (e) => { if (e.target === overlay) closeOverlay(); };

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            if (overlay.style.display === 'flex') closeOverlay(); else openOverlay();
        }
    });
}
