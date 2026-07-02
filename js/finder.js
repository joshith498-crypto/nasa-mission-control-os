// QuantumOS - Finder UI Logic

function setupFinder() {
    const search = document.getElementById('finder-search');
    const newFolderBtn = document.getElementById('finder-new-folder');
    const newFileBtn = document.getElementById('finder-new-file');
    const viewport = document.getElementById('finder-file-viewport');
    const itemMenu = document.getElementById('finder-item-menu');
    const blankMenu = document.getElementById('finder-blank-menu');

    let menuTargetName = null;

    if (search) search.addEventListener('input', () => renderFinder());
    if (newFolderBtn) newFolderBtn.addEventListener('click', () => {
        const name = promptUnique('Folder name:', SystemState.currentPath, 'New Folder');
        if (name && VFS.makeFolder(SystemState.currentPath, name)) renderFinder();
    });
    if (newFileBtn) newFileBtn.addEventListener('click', () => {
        const name = promptUnique('File name:', SystemState.currentPath, 'new_file.txt');
        if (name && VFS.makeFile(SystemState.currentPath, name, '')) renderFinder();
    });

    if (viewport) {
        viewport.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.file-item');
            hideContextMenus();
            if (item) {
                e.preventDefault();
                menuTargetName = item.dataset.name;
                positionMenu(itemMenu, e.clientX, e.clientY);
            } else {
                e.preventDefault();
                positionMenu(blankMenu, e.clientX, e.clientY);
            }
        });

        viewport.addEventListener('dblclick', (e) => {
            const item = e.target.closest('.file-item');
            if (item) openFinderItem(item.dataset.name);
        });
    }

    document.addEventListener('click', hideContextMenus);

    if (itemMenu) itemMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action || !menuTargetName) return;
        const name = menuTargetName;
        if (action === 'open') openFinderItem(name);
        if (action === 'rename') {
            const node = VFS.resolve([...SystemState.currentPath]).children[name];
            const newName = prompt('Rename to:', node.name);
            if (newName && newName !== name && VFS.rename(SystemState.currentPath, name, newName)) renderFinder();
        }
        if (action === 'move') {
            const dest = prompt('Move to folder (Desktop, Documents, Downloads, System, Trash):');
            if (dest && VFS.move(SystemState.currentPath, name, [dest])) renderFinder();
        }
        if (action === 'delete') {
            if (VFS.move(SystemState.currentPath, name, ['Trash']) || VFS.remove(SystemState.currentPath, name)) renderFinder();
        }
        hideContextMenus();
    });

    if (blankMenu) blankMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'new-folder') {
            const name = promptUnique('Folder name:', SystemState.currentPath, 'New Folder');
            if (name && VFS.makeFolder(SystemState.currentPath, name)) renderFinder();
        }
        if (action === 'new-file') {
            const name = promptUnique('File name:', SystemState.currentPath, 'new_file.txt');
            if (name && VFS.makeFile(SystemState.currentPath, name, '')) renderFinder();
        }
        hideContextMenus();
    });

    renderFinder();
}

function promptUnique(label, path, fallback) {
    let n = prompt(label, fallback);
    if (!n) return null;
    n = n.trim();
    if (!n) return null;
    let candidate = n;
    let i = 2;
    while (VFS.exists(path, candidate)) {
        candidate = `${n} (${i})`;
        i++;
    }
    return candidate;
}

function positionMenu(menu, x, y) {
    if (!menu) return;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';
}

function hideContextMenus() {
    document.querySelectorAll('.finder-context-menu').forEach(m => m.style.display = 'none');
}

function openFinderItem(name) {
    const dir = VFS.resolve(SystemState.currentPath);
    const node = dir && dir.children[name];
    if (!node) return;
    if (node.type === 'folder') {
        SystemState.currentPath.push(name);
        renderFinder();
    } else {
        const updated = prompt(`Viewing ${name}:`, node.content);
        if (updated !== null) {
            VFS.writeFile(SystemState.currentPath, name, updated);
        }
    }
}

function navigateBreadcrumb(index) {
    SystemState.currentPath = SystemState.currentPath.slice(0, index + 1);
    renderFinder();
}

function renderFinder() {
    const viewport = document.getElementById('finder-file-viewport');
    const pathLabel = document.getElementById('finder-title-path');
    const breadcrumbs = document.getElementById('finder-breadcrumbs');
    const search = document.getElementById('finder-search');
    if (!viewport) return;

    const pathStr = '/' + SystemState.currentPath.join('/');
    if (pathLabel) pathLabel.textContent = `Finder — ${pathStr}`;

    if (breadcrumbs) {
        breadcrumbs.innerHTML = '';
        SystemState.currentPath.forEach((seg, idx) => {
            const crumb = document.createElement('span');
            crumb.className = 'breadcrumb-item';
            crumb.textContent = seg;
            crumb.addEventListener('click', () => navigateBreadcrumb(idx));
            breadcrumbs.appendChild(crumb);
            if (idx < SystemState.currentPath.length - 1) {
                const sep = document.createElement('span');
                sep.className = 'breadcrumb-sep';
                sep.textContent = '›';
                breadcrumbs.appendChild(sep);
            }
        });
    }

    let items = VFS.list(SystemState.currentPath);
    const query = search ? search.value.trim().toLowerCase() : '';
    if (query) items = items.filter(i => i.name.toLowerCase().includes(query));

    viewport.innerHTML = '';
    if (items.length === 0) {
        viewport.insertAdjacentHTML('beforeend', `<div class="finder-empty">— empty —</div>`);
        return;
    }
    items.forEach(item => {
        const icon = item.type === 'folder' ? '📁' : guessFileIcon(item.name);
        const el = document.createElement('div');
        el.className = 'file-item';
        el.dataset.name = item.name;
        el.innerHTML = `<span class="file-icon">${icon}</span><span class="file-label">${item.name}</span>`;
        viewport.appendChild(el);
    });
}

function guessFileIcon(name) {
    if (name.endsWith('.sh')) return '📟';
    if (name.endsWith('.log') || name.endsWith('.sys')) return '🛰️';
    if (name.endsWith('.key')) return '🔑';
    if (name.endsWith('.dat') || name.endsWith('.bak')) return '💾';
    if (name.endsWith('.pkg') || name.endsWith('.gz')) return '📦';
    return '📄';
}
