// QuantumOS - Terminal Shell Logic

function setupTerminalConsole() {
    const input = document.getElementById('terminal-input');
    const body = document.querySelector('.terminal-body');
    if (!input) return;

    let termPath = ['Desktop']; // terminal has its own cwd, independent of Finder

    const printLine = (text) => {
        const line = document.createElement('p');
        line.className = 'glowing-text';
        line.style.fontSize = '12px';
        line.textContent = text;
        body.insertBefore(line, input.parentElement);
        body.scrollTop = body.scrollHeight;
    };

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const raw = input.value.trim();
        input.value = '';
        if (raw === '') return;
        printLine(`nasa-os:~ core$ ${raw}`);

        const [cmd, ...args] = raw.split(/\s+/);

        switch (cmd) {
            case 'help':
                printLine('Commands: help, ls, pwd, cd, mkdir, touch, rm, mv, cp, cat, clear, date, whoami, reboot, shutdown');
                break;
            case 'pwd':
                printLine('/' + termPath.join('/'));
                break;
            case 'ls': {
                if (typeof VFS === 'undefined') break;
                const items = VFS.list(termPath);
                printLine(items.length ? items.map(i => i.type === 'folder' ? `${i.name}/` : i.name).join('  ') : '(empty)');
                break;
            }
            case 'cd': {
                if (typeof VFS === 'undefined') break;
                if (!args[0] || args[0] === '~') { termPath = ['Desktop']; break; }
                if (args[0] === '..') { if (termPath.length > 1) termPath.pop(); break; }
                const node = VFS.resolve([...termPath, args[0]]);
                if (node && node.type === 'folder') termPath.push(args[0]);
                else printLine(`cd: no such directory: ${args[0]}`);
                break;
            }
            case 'mkdir':
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('mkdir: missing operand'); break; }
                printLine(VFS.makeFolder(termPath, args[0]) ? '' : `mkdir: cannot create '${args[0]}'`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            case 'touch':
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('touch: missing operand'); break; }
                if (!VFS.exists(termPath, args[0])) VFS.makeFile(termPath, args[0], '');
                if (typeof renderFinder === 'function') renderFinder();
                break;
            case 'rm':
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('rm: missing operand'); break; }
                printLine(VFS.remove(termPath, args[0]) ? '' : `rm: cannot remove '${args[0]}': No such file`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            case 'mv': {
                if (typeof VFS === 'undefined') break;
                if (args.length < 2) { printLine('mv: missing operand'); break; }
                const ok = VFS.move(termPath, args[0], [args[1]]) || VFS.rename(termPath, args[0], args[1]);
                if (!ok) printLine(`mv: cannot move '${args[0]}'`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            }
            case 'cp': {
                if (typeof VFS === 'undefined') break;
                if (args.length < 2) { printLine('cp: missing operand'); break; }
                const node = VFS.resolve([...termPath, args[0]]);
                if (node && node.type === 'file') VFS.makeFile(termPath, args[1], node.content);
                else printLine(`cp: cannot copy '${args[0]}'`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            }
            case 'cat': {
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('cat: missing operand'); break; }
                const node = VFS.resolve([...termPath, args[0]]);
                if (node && node.type === 'file') printLine(node.content || '(empty file)');
                else printLine(`cat: ${args[0]}: No such file`);
                break;
            }
            case 'clear':
                body.querySelectorAll('p').forEach(p => p.remove());
                break;
            case 'date':
                printLine(new Date().toString());
                break;
            case 'whoami':
                printLine(SystemState.userAccount);
                break;
            case 'reboot':
                printLine('WARNING: System rebooting...');
                setTimeout(() => location.reload(), 1200);
                break;
            case 'shutdown':
                printLine('System halted. Refresh to restart.');
                document.body.style.transition = 'opacity 1s ease';
                setTimeout(() => document.body.style.opacity = '0', 200);
                break;
            default:
                printLine(`sh: command not found: ${cmd}. Type 'help'.`);
        }
    });
}
