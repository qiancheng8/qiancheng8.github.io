(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RetroClassics = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const GAMES = [
    { id: 'tetris', title: '俄罗斯方块', english: 'FALLING BLOCKS', category: '益智解谜', group: 'puzzle', year: '1984', color: '#b69b6d', description: '转一转，落下去。把零零散散的快乐拼成一整行。' },
    { id: 'snake', title: '贪吃蛇', english: 'SNAKE', category: '热血街机', group: 'arcade', year: '1997', color: '#8caa78', description: '小小屏幕，一口一口，吃回那段按键手机的时光。' },
    { id: 'breakout', title: '打砖块', english: 'BRICK BREAKER', category: '热血街机', group: 'arcade', year: '1976', color: '#c38b78', description: '稳稳接住每一次弹跳，把满屏砖块打成彩色烟花。' },
    { id: 'mines', title: '扫雷', english: 'MINESWEEPER', category: '益智解谜', group: 'puzzle', year: '1992', color: '#92a9ab', description: '数字里藏着线索，小红旗插稳，童年的电脑课回来了。' }
  ];
  const DIRECTIONS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
  function random(s) { s.seed = (s.seed * 1664525 + 1013904223) >>> 0; return s.seed / 4294967296; }
  function base(type, level, seed) { return { type, level: level || 0, seed: seed === undefined ? 8090 : seed >>> 0, score: 0, time: 0, status: 'playing', event: '' }; }

  // The falling-block game uses a shuffled seven-piece bag and clockwise kicks.
  const SHAPES = [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]]
  ];
  function takePiece(s) {
    if (!s.bag.length) { s.bag = [0, 1, 2, 3, 4, 5, 6]; for (let i = 6; i > 0; i--) { const j = Math.floor(random(s) * (i + 1)); [s.bag[i], s.bag[j]] = [s.bag[j], s.bag[i]]; } }
    return s.bag.pop();
  }
  function fits(s, matrix, x, y) {
    return matrix.every((row, cy) => row.every((value, cx) => !value || (x + cx >= 0 && x + cx < 10 && y + cy < 20 && (y + cy < 0 || !s.board[y + cy][x + cx]))));
  }
  function spawnPiece(s) {
    const kind = s.next; s.next = takePiece(s); s.piece = { kind, matrix: SHAPES[kind].map(row => row.slice()), x: kind === 1 ? 4 : 3, y: 0 };
    s.gravity = 0;
    if (!fits(s, s.piece.matrix, s.piece.x, s.piece.y)) { s.status = 'lost'; s.event = 'hurt'; }
  }
  function createTetris(level, seed) {
    const s = Object.assign(base('tetris', level, seed), { board: Array.from({ length: 20 }, () => Array(10).fill(0)), lines: 0, pieces: 0, gravity: 0, bag: [] });
    s.next = takePiece(s); spawnPiece(s); return s;
  }
  function lockPiece(s) {
    const p = s.piece;
    if (p.matrix.some((row, y) => row.some(value => value && p.y + y < 0))) { s.status = 'lost'; s.event = 'hurt'; return; }
    p.matrix.forEach((row, y) => row.forEach((value, x) => { if (value && p.y + y >= 0) s.board[p.y + y][p.x + x] = p.kind + 1; }));
    s.pieces++;
    const remaining = s.board.filter(row => row.some(value => !value)), cleared = 20 - remaining.length;
    if (cleared) { s.score += [0, 100, 300, 500, 800][cleared] * (s.level + 1); s.lines += cleared; s.level = Math.floor(s.lines / 10); s.event = 'hit'; }
    s.board = [...Array.from({ length: cleared }, () => Array(10).fill(0)), ...remaining]; spawnPiece(s);
  }
  function dropRow(s, manual) {
    const p = s.piece;
    if (fits(s, p.matrix, p.x, p.y + 1)) { p.y++; if (manual) s.score++; return true; }
    lockPiece(s); return false;
  }
  function landingY(s) { let y = s.piece.y; while (fits(s, s.piece.matrix, s.piece.x, y + 1)) y++; return y; }
  function actTetris(s, action) {
    const p = s.piece;
    if (action === 'left' || action === 'right') { const x = p.x + (action === 'left' ? -1 : 1); if (fits(s, p.matrix, x, p.y)) { p.x = x; s.event = 'move'; } }
    else if (action === 'up') {
      const rotated = p.matrix[0].map((_, x) => p.matrix.map(row => row[x]).reverse());
      for (const dy of [0, -1, -2]) for (const dx of [0, -1, 1, -2, 2]) if (fits(s, rotated, p.x + dx, p.y + dy)) { p.matrix = rotated; p.x += dx; p.y += dy; s.event = 'move'; return; }
    } else if (action === 'down') dropRow(s, true);
    else if (action === 'fire') { const y = landingY(s); s.score += (y - p.y) * 2; p.y = y; s.event = 'push'; lockPiece(s); }
  }
  function tickTetris(s, input, dt) {
    s.gravity += dt;
    const interval = Math.max(.08, .72 * Math.pow(.85, s.level));
    while (s.gravity >= interval && s.status === 'playing') { s.gravity -= interval; if (!dropRow(s, false)) break; }
  }

  function spawnFood(s) {
    const occupied = new Set(s.snake.map(p => p.y * 20 + p.x)), empty = [];
    for (let i = 0; i < 400; i++) if (!occupied.has(i)) empty.push(i);
    if (!empty.length) { s.food = null; s.status = 'won'; s.event = 'win'; return; }
    const cell = empty[Math.floor(random(s) * empty.length)]; s.food = { x: cell % 20, y: Math.floor(cell / 20) };
  }
  function createSnake(level, seed) {
    const s = Object.assign(base('snake', level, seed), { snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }], dir: 'right', turns: [], accumulator: 0, eaten: 0, started: false });
    spawnFood(s); return s;
  }
  function turnSnake(s, action) {
    if (DIRECTIONS[action] || action === 'fire') s.started = true;
    if (!DIRECTIONS[action] || s.turns.length >= 2) return;
    const previous = s.turns[s.turns.length - 1] || s.dir, a = DIRECTIONS[action], b = DIRECTIONS[previous];
    if (action !== previous && (a[0] + b[0] !== 0 || a[1] + b[1] !== 0)) s.turns.push(action);
  }
  function tickSnake(s, input, dt) {
    if (!s.started) return;
    s.accumulator += dt * (input.fire ? 1.8 : 1);
    const interval = Math.max(.065, .17 - s.level * .012);
    while (s.accumulator >= interval && s.status === 'playing') {
      s.accumulator -= interval; s.dir = s.turns.shift() || s.dir;
      const [dx, dy] = DIRECTIONS[s.dir], head = { x: s.snake[0].x + dx, y: s.snake[0].y + dy }, eating = s.food && head.x === s.food.x && head.y === s.food.y;
      const body = eating ? s.snake : s.snake.slice(0, -1);
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || body.some(p => p.x === head.x && p.y === head.y)) { s.status = 'lost'; s.event = 'hurt'; return; }
      s.snake.unshift(head);
      if (eating) { s.eaten++; s.score += 10; s.level = Math.floor(s.eaten / 5); s.event = 'hit'; spawnFood(s); } else s.snake.pop();
    }
  }

  function createBreakout(level, seed) {
    const s = Object.assign(base('breakout', level, seed), { lives: 3, bricks: [], player: { x: 240, y: 444, w: Math.max(60, 92 - (level || 0) * 3), h: 12 }, ball: { x: 240, y: 430, vx: 0, vy: 0, radius: 6, serving: true } });
    for (let row = 0; row < 6; row++) for (let col = 0; col < 7; col++) s.bricks.push({ x: 54 + col * 62, y: 81 + row * 26, w: 54, h: 18, row, hp: row === 0 && s.level > 0 ? 2 : 1 });
    return s;
  }
  function launchBall(s) { if (s.ball.serving) { const speed = Math.min(380, 240 + s.level * 15), angle = (random(s) - .5) * .7; s.ball.x = s.player.x; s.ball.y = s.player.y - 14; s.ball.vx = Math.sin(angle) * speed; s.ball.vy = -Math.cos(angle) * speed; s.ball.serving = false; s.event = 'shoot'; } }
  function ballHit(ball, rect) { const x = Math.max(rect.x - rect.w / 2, Math.min(rect.x + rect.w / 2, ball.x)), y = Math.max(rect.y - rect.h / 2, Math.min(rect.y + rect.h / 2, ball.y)); return (ball.x - x) ** 2 + (ball.y - y) ** 2 <= ball.radius ** 2; }
  function tickBreakout(s, input, dt) {
    const p = s.player, b = s.ball;
    p.x = Math.max(16 + p.w / 2, Math.min(464 - p.w / 2, p.x + ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 330 * dt));
    if (b.serving) { b.x = p.x; b.y = p.y - 14; if (input.fire) launchBall(s); return; }
    const previous = { x: b.x, y: b.y }; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < 16 + b.radius) { b.x = 16 + b.radius; b.vx = Math.abs(b.vx); }
    if (b.x > 464 - b.radius) { b.x = 464 - b.radius; b.vx = -Math.abs(b.vx); }
    if (b.y < 35 + b.radius) { b.y = 35 + b.radius; b.vy = Math.abs(b.vy); }
    if (b.vy > 0 && ballHit(b, p)) {
      const fraction = Math.max(-1, Math.min(1, (b.x - p.x) / (p.w / 2))), angle = fraction * 1.05, speed = Math.min(400, Math.hypot(b.vx, b.vy) + 3);
      b.vx = Math.sin(angle) * speed; b.vy = -Math.cos(angle) * speed; b.y = p.y - p.h / 2 - b.radius - .01; s.event = 'move';
    }
    for (const brick of s.bricks) if (ballHit(b, brick)) {
      if (previous.y <= brick.y - brick.h / 2 || previous.y >= brick.y + brick.h / 2) { b.vy *= -1; b.y = brick.y + (previous.y < brick.y ? -1 : 1) * (brick.h / 2 + b.radius + .01); }
      else { b.vx *= -1; b.x = brick.x + (previous.x < brick.x ? -1 : 1) * (brick.w / 2 + b.radius + .01); }
      brick.hp--; s.score += 50; s.event = 'hit'; break;
    }
    s.bricks = s.bricks.filter(brick => brick.hp > 0);
    if (!s.bricks.length) { s.status = 'won'; s.event = 'win'; }
    else if (b.y > 480 + b.radius) { s.lives = Math.max(0, s.lives - 1); s.event = 'hurt'; if (!s.lives) s.status = 'lost'; else { b.serving = true; b.x = p.x; b.y = p.y - 14; b.vx = b.vy = 0; } }
  }

  const MINE_GRID = { x: 42, y: 51, cell: 44, width: 9, height: 9, count: 10 };
  function createMines(level, seed) { return Object.assign(base('mines', 0, seed), { cells: Array.from({ length: 81 }, () => ({ mine: false, open: false, flag: false, adjacent: 0 })), placed: false, opened: 0, flags: 0, flagMode: false, cursor: { x: 4, y: 4 } }); }
  function neighbors(index) {
    const x = index % 9, y = Math.floor(index / 9), result = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && x + dx >= 0 && x + dx < 9 && y + dy >= 0 && y + dy < 9) result.push((y + dy) * 9 + x + dx);
    return result;
  }
  function placeMines(s, first) {
    const protectedCells = new Set([first, ...neighbors(first)]), candidates = [];
    for (let i = 0; i < 81; i++) if (!protectedCells.has(i)) candidates.push(i);
    for (let i = 0; i < 10; i++) { const chosen = Math.floor(random(s) * candidates.length), index = candidates.splice(chosen, 1)[0]; s.cells[index].mine = true; }
    s.cells.forEach((cell, i) => { cell.adjacent = neighbors(i).filter(n => s.cells[n].mine).length; }); s.placed = true;
  }
  function mineIndex(x, y) { return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < 9 && y >= 0 && y < 9 ? y * 9 + x : -1; }
  function revealMine(s, x, y) {
    const index = mineIndex(x, y); if (s.status !== 'playing' || index < 0 || s.cells[index].flag || s.cells[index].open) return false;
    if (!s.placed) placeMines(s, index);
    s.cursor = { x, y };
    if (s.cells[index].mine) { s.cells[index].open = true; s.status = 'lost'; s.event = 'hurt'; return true; }
    const queue = [index];
    for (let i = 0; i < queue.length; i++) {
      const cell = s.cells[queue[i]]; if (cell.open || cell.flag || cell.mine) continue;
      cell.open = true; s.opened++; if (!cell.adjacent) queue.push(...neighbors(queue[i]).filter(n => !s.cells[n].open));
    }
    s.score = s.opened * 10; s.event = 'move';
    if (s.opened === 71) { s.status = 'won'; s.score += Math.max(100, 1000 - Math.floor(s.time) * 2); s.event = 'win'; }
    return true;
  }
  function flagMine(s, x, y) {
    const index = mineIndex(x, y); if (s.status !== 'playing' || index < 0 || s.cells[index].open) return false;
    const cell = s.cells[index]; if (!cell.flag && s.flags >= 10) return false;
    cell.flag = !cell.flag; s.flags += cell.flag ? 1 : -1; s.cursor = { x, y }; s.event = 'move'; return true;
  }
  function actMines(s, action) {
    if (DIRECTIONS[action]) { const [dx, dy] = DIRECTIONS[action]; s.cursor.x = Math.max(0, Math.min(8, s.cursor.x + dx)); s.cursor.y = Math.max(0, Math.min(8, s.cursor.y + dy)); }
    else if (action === 'flag') s.flagMode = !s.flagMode;
    else if (action === 'fire') (s.flagMode ? flagMine : revealMine)(s, s.cursor.x, s.cursor.y);
  }
  function pointer(s, x, y, flag) {
    if (s.status !== 'playing') return false;
    if (s.type === 'mines') {
      const col = Math.floor((x - MINE_GRID.x) / MINE_GRID.cell), row = Math.floor((y - MINE_GRID.y) / MINE_GRID.cell);
      return (flag === undefined ? s.flagMode : flag) ? flagMine(s, col, row) : revealMine(s, col, row);
    }
    if (s.type === 'breakout') { s.player.x = Math.max(16 + s.player.w / 2, Math.min(464 - s.player.w / 2, x)); return true; }
    return false;
  }
  function create(type, level, seed) {
    return { tetris: createTetris, snake: createSnake, breakout: createBreakout, mines: createMines }[type](level, seed);
  }
  function action(s, value) {
    if (s.status !== 'playing') return;
    if (s.type === 'tetris') actTetris(s, value); else if (s.type === 'snake') turnSnake(s, value); else if (s.type === 'breakout' && value === 'fire') launchBall(s); else if (s.type === 'mines') actMines(s, value);
  }
  function tick(s, input, dt) {
    if (s.type !== 'mines' || s.placed) s.time += dt;
    if (s.type === 'tetris') tickTetris(s, input, dt); else if (s.type === 'snake') tickSnake(s, input, dt); else if (s.type === 'breakout') tickBreakout(s, input, dt);
  }
  return { GAMES, SHAPES, MINE_GRID, create, action, tick, pointer, fits, landingY, revealMine, flagMine };
});
