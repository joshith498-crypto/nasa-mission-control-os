// QuantumOS - Integrated Games (Snake, Minesweeper, Memory)

function setupArcadeModules() {
    const asteroid = document.getElementById('asteroid-element');
    const countDisplay = document.getElementById('crystal-count');
    const arcadeTabs = document.querySelectorAll('.arcade-sidebar .arcade-nav-item');

    if (countDisplay) countDisplay.textContent = SystemState.energyCrystals;

    if (asteroid) {
        asteroid.addEventListener('click', () => {
            SystemState.energyCrystals++;
            localStorage.setItem('zenith_crystals', SystemState.energyCrystals);
            if (countDisplay) countDisplay.textContent = SystemState.energyCrystals;
        });
    }

    arcadeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            arcadeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const selectedGame = tab.getAttribute('data-game');
            document.querySelectorAll('.arcade-panel').forEach(p => p.style.display = 'none');
            const targetPanel = document.getElementById(selectedGame);
            if (targetPanel) {
                targetPanel.style.display = 'block';
                // Re-init games when their panel is opened to ensure they are fresh
                if (selectedGame === 'game-mines') setupMinesweeper();
                if (selectedGame === 'game-memory') setupMemoryGame();
                if (selectedGame === 'game-snake') setupSnakeGame();
            }
        });
    });
}

// Comet Snake
function setupSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cell = 16;
    const cols = canvas.width / cell;
    const rows = canvas.height / cell;

    let snake, dir, nextDir, food, score, alive, loopHandle;
    const scoreEl = document.getElementById('snake-score');
    const bestEl = document.getElementById('snake-best');
    const restartBtn = document.getElementById('snake-restart');

    const getBest = () => parseInt(localStorage.getItem('zenith_snake_best')) || 0;
    if (bestEl) bestEl.textContent = getBest();

    function randomFood() {
        let pos;
        do {
            pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
        } while (snake.some(s => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    function reset() {
        snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score = 0;
        alive = true;
        food = randomFood();
        if (scoreEl) scoreEl.textContent = score;
        draw();
    }

    function tick() {
        if (!alive) return;
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)) {
            alive = false;
            const best = getBest();
            if (score > best) {
                localStorage.setItem('zenith_snake_best', score);
                if (bestEl) bestEl.textContent = score;
                showGlobalAlert(`New Comet Snake high score: ${score}!`);
            }
            draw();
            return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++;
            if (scoreEl) scoreEl.textContent = score;
            food = randomFood();
        } else {
            snake.pop();
        }
        draw();
    }

    function draw() {
        ctx.fillStyle = '#040508';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffb347';
        ctx.shadowColor = '#ffb347';
        ctx.shadowBlur = 6;
        ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);
        ctx.shadowBlur = 0;

        snake.forEach((s, idx) => {
            ctx.fillStyle = idx === 0 ? '#00ff66' : 'rgba(0,255,102,0.6)';
            ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
        });

        if (!alive) {
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff5f56';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SIGNAL LOST', canvas.width / 2, canvas.height / 2 - 6);
            ctx.font = '11px monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Click Restart to relaunch', canvas.width / 2, canvas.height / 2 + 14);
            ctx.textAlign = 'left';
        }
    }

    document.addEventListener('keydown', (e) => {
        const panel = document.getElementById('game-snake');
        if (!panel || panel.style.display === 'none') return;
        if (e.key === 'ArrowUp' && dir.y === 0) nextDir = { x: 0, y: -1 };
        if (e.key === 'ArrowDown' && dir.y === 0) nextDir = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = { x: -1, y: 0 };
        if (e.key === 'ArrowRight' && dir.x === 0) nextDir = { x: 1, y: 0 };
    });

    if (restartBtn) restartBtn.addEventListener('click', reset);

    reset();
    clearInterval(loopHandle);
    loopHandle = setInterval(tick, 130);
}

// Minefield (Minesweeper)
function setupMinesweeper() {
    const grid = document.getElementById('mines-grid');
    if (!grid) return;
    const size = 9;
    const mineCount = 10;
    let cells, revealedCount, flagged, gameOver, startTime, timerHandle;

    const statusEl = document.getElementById('mines-status');
    const bestEl = document.getElementById('mines-best');
    const restartBtn = document.getElementById('mines-restart');

    const bestKey = 'zenith_mines_best';
    const renderBest = () => {
        const best = localStorage.getItem(bestKey);
        if (bestEl) bestEl.textContent = best ? `${best}s` : '—';
    };
    renderBest();

    function buildBoard() {
        cells = Array.from({ length: size * size }, () => ({ mine: false, adjacent: 0, revealed: false, flagged: false }));
        let placed = 0;
        while (placed < mineCount) {
            const idx = Math.floor(Math.random() * cells.length);
            if (!cells[idx].mine) { cells[idx].mine = true; placed++; }
        }
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].mine) continue;
            cells[i].adjacent = neighbors(i).filter(n => cells[n].mine).length;
        }
        revealedCount = 0;
        flagged = 0;
        gameOver = false;
        startTime = Date.now();
        clearInterval(timerHandle);
        timerHandle = setInterval(() => {
            if (statusEl && !gameOver) statusEl.textContent = `${Math.floor((Date.now() - startTime) / 1000)}s`;
        }, 1000);
    }

    function neighbors(idx) {
        const r = Math.floor(idx / size), c = idx % size;
        const out = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size) out.push(nr * size + nc);
            }
        }
        return out;
    }

    function reveal(idx) {
        if (gameOver || cells[idx].revealed || cells[idx].flagged) return;
        cells[idx].revealed = true;
        revealedCount++;
        if (cells[idx].mine) {
            gameOver = true;
            clearInterval(timerHandle);
            cells.forEach(c => { if (c.mine) c.revealed = true; });
            if (statusEl) statusEl.textContent = '💥 Hull breach';
            render();
            return;
        }
        if (cells[idx].adjacent === 0) {
            neighbors(idx).forEach(n => { if (!cells[n].revealed) reveal(n); });
        }
        if (revealedCount === cells.length - mineCount) {
            gameOver = true;
            clearInterval(timerHandle);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const best = parseInt(localStorage.getItem(bestKey));
            if (!best || elapsed < best) {
                localStorage.setItem(bestKey, elapsed);
                showGlobalAlert(`New Minefield record: ${elapsed}s!`);
            }
            renderBest();
            if (statusEl) statusEl.textContent = `✅ Cleared in ${elapsed}s`;
        }
        render();
    }

    function toggleFlag(idx) {
        if (gameOver || cells[idx].revealed) return;
        cells[idx].flagged = !cells[idx].flagged;
        render();
    }

    function render() {
        grid.innerHTML = '';
        cells.forEach((c, idx) => {
            const cell = document.createElement('div');
            cell.className = 'mine-cell' + (c.revealed ? ' revealed' : '');
            if (c.revealed && c.mine) cell.classList.add('mine-hit');
            if (c.revealed) {
                if (c.mine) cell.textContent = '💣';
                else if (c.adjacent > 0) { cell.textContent = c.adjacent; cell.dataset.n = c.adjacent; }
            } else if (c.flagged) {
                cell.textContent = '🚩';
            }
            cell.onclick = () => reveal(idx);
            cell.oncontextmenu = (e) => { e.preventDefault(); toggleFlag(idx); };
            grid.appendChild(cell);
        });
    }

    if (restartBtn) restartBtn.onclick = () => { buildBoard(); if (statusEl) statusEl.textContent = 'Ready'; render(); };

    buildBoard();
    render();
}

// Signal Match (Memory Game)
function setupMemoryGame() {
    const grid = document.getElementById('memory-grid');
    if (!grid) return;
    const symbols = ['🛰️', '🚀', '🪐', '☄️', '👽', '🌌', '🔭', '⭐'];
    const movesEl = document.getElementById('memory-moves');
    const bestEl = document.getElementById('memory-best');
    const restartBtn = document.getElementById('memory-restart');
    const bestKey = 'zenith_memory_best';

    let deck, flipped, matchedCount, moves, lock;

    const renderBest = () => {
        const best = localStorage.getItem(bestKey);
        if (bestEl) bestEl.textContent = best || '—';
    };
    renderBest();

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function buildDeck() {
        deck = shuffle([...symbols, ...symbols]).map(sym => ({ sym, matched: false }));
        flipped = [];
        matchedCount = 0;
        moves = 0;
        lock = false;
        if (movesEl) movesEl.textContent = moves;
    }

    function render() {
        grid.innerHTML = '';
        deck.forEach((card, idx) => {
            const el = document.createElement('div');
            el.className = 'memory-card' + (card.matched ? ' matched' : '') + (flipped.includes(idx) ? ' flipped' : '');
            el.textContent = (card.matched || flipped.includes(idx)) ? card.sym : '✦';
            el.onclick = () => handleFlip(idx);
            grid.appendChild(el);
        });
    }

    function handleFlip(idx) {
        if (lock || flipped.includes(idx) || deck[idx].matched) return;
        flipped.push(idx);
        render();
        if (flipped.length === 2) {
            moves++;
            if (movesEl) movesEl.textContent = moves;
            lock = true;
            const [a, b] = flipped;
            if (deck[a].sym === deck[b].sym) {
                deck[a].matched = true;
                deck[b].matched = true;
                matchedCount++;
                flipped = [];
                lock = false;
                render();
                if (matchedCount === symbols.length) {
                    const best = parseInt(localStorage.getItem(bestKey));
                    if (!best || moves < best) {
                        localStorage.setItem(bestKey, moves);
                        showGlobalAlert(`New Signal Match record: ${moves} moves!`);
                    }
                    renderBest();
                }
            } else {
                setTimeout(() => { flipped = []; lock = false; render(); }, 700);
            }
        }
    }

    if (restartBtn) restartBtn.onclick = () => { buildDeck(); render(); };

    buildDeck();
    render();
}
