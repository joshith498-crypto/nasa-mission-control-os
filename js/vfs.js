// Zenith Shell - Virtual File System (VFS)
// Persisted in localStorage

const VFS = {
    STORAGE_KEY: 'zenith_vfs_v1',
    root: null,

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try { this.root = JSON.parse(saved); return; } catch (e) { /* fall through to defaults */ }
        }
        this.root = this.defaultTree();
        this.save();
    },

    defaultTree() {
        const folder = (name, children = {}) => ({ type: 'folder', name, children });
        const file = (name, content = '') => ({ type: 'file', name, content });
        return folder('root', {
            Desktop: folder('Desktop', {
                'satellite_comm.log': file('satellite_comm.log', 'Uplink stable. No anomalies detected.'),
                'terminal_core.sh': file('terminal_core.sh', '#!/bin/sh\necho "core link established"'),
            }),
            Documents: folder('Documents', {
                'cosmic_mission_plan.txt': file('cosmic_mission_plan.txt', 'Phase 1: Launch.\nPhase 2: Orbit.\nPhase 3: Return.'),
                'matrix_backup.dat': file('matrix_backup.dat', 'BACKUP_OK'),
            }),
            Downloads: folder('Downloads', {
                'css_theme_patch.pkg': file('css_theme_patch.pkg', 'theme patch payload'),
            }),
            System: folder('System', {
                'core_telemetry.sys': file('core_telemetry.sys', 'telemetry stream active'),
                'security_layer.key': file('security_layer.key', '***REDACTED***'),
            }),
            Trash: folder('Trash', {}),
        });
    },

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.root));
    },

    resolve(path) {
        let node = this.root;
        for (const seg of path) {
            if (!node || node.type !== 'folder' || !node.children[seg]) return null;
            node = node.children[seg];
        }
        return node;
    },

    list(path) {
        const node = this.resolve(path);
        if (!node || node.type !== 'folder') return [];
        return Object.values(node.children).sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    },

    makeFolder(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || parent.children[name]) return false;
        parent.children[name] = { type: 'folder', name, children: {} };
        this.save();
        return true;
    },

    makeFile(path, name, content = '') {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || parent.children[name]) return false;
        parent.children[name] = { type: 'file', name, content };
        this.save();
        return true;
    },

    remove(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name]) return false;
        delete parent.children[name];
        this.save();
        return true;
    },

    rename(path, oldName, newName) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[oldName] || parent.children[newName]) return false;
        const node = parent.children[oldName];
        node.name = newName;
        delete parent.children[oldName];
        parent.children[newName] = node;
        this.save();
        return true;
    },

    move(fromPath, name, toPath) {
        const src = this.resolve(fromPath);
        const dest = this.resolve(toPath);
        if (!src || !dest || dest.type !== 'folder' || !src.children[name] || dest.children[name]) return false;
        dest.children[name] = src.children[name];
        delete src.children[name];
        this.save();
        return true;
    },

    writeFile(path, name, content) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name] || parent.children[name].type !== 'file') return false;
        parent.children[name].content = content;
        this.save();
        return true;
    },

    exists(path, name) {
        const parent = this.resolve(path);
        return !!(parent && parent.type === 'folder' && parent.children[name]);
    }
};
