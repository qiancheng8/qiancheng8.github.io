/* src/classics.js */
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

;
/* src/core.js */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./classics.js'));
  else root.RetroCore = factory(root.RetroClassics);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Classics) {
  'use strict';
  const SIZE = 480;
  const DIR = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
  const GAMES = [
    { id: 'sokoban', title: '推箱子', english: 'SOKOBAN', category: '益智解谜', group: 'puzzle', year: '1982', color: '#8cac73', description: '小小仓库，大大智慧。把每一份快乐推到位。' },
    { id: 'tank', title: '坦克大战', english: 'TANK BATTLE', category: '热血街机', group: 'arcade', year: '1985', color: '#cc7950', description: '守好你的基地。这一次，主角还是那辆小坦克。' },
    { id: 'bees', title: '小蜜蜂', english: 'SPACE BEES', category: '飞行射击', group: 'shooter', year: '1981', color: '#6e90ae', description: '穿过像素星河，把小时候没过的关再打一遍。' },
    ...Classics.GAMES
  ];
  const HELP = {
    sokoban: ['方向键移动，把所有木箱推到金色目标。', '木箱只能推，不能拉。走错可无限撤销。'],
    tank: ['方向键移动，按住开火，击败全部敌军。', '砖墙可打碎；保护底部基地，剩余 3 条命。'],
    bees: ['左右移动躲子弹，按住开火清空蜂群。', '敌人下降到底线或耗尽 3 条命即失败。'],
    tetris: ['左右移动，↑旋转，↓加速，落下键直落。', '填满整行消除；方块堆到顶端即失败。'],
    snake: ['方向键转弯吃果实，按住加速键加速。', '不能直接掉头；碰到墙壁或自己即失败。'],
    breakout: ['左右移动或滑动挡板，点发球键开局。', '接住小球打完砖块；漏球扣命，共 3 条命。'],
    mines: ['点格子翻开，插旗模式下点格子标记。', '数字是周围雷数；首开安全，翻完安全格赢。']
  };
  const CONTROL = {
    sokoban: { action: '', hint: '方向键移动 · Z 撤销 · P 暂停 · R 重玩' },
    tank: { action: '开 火', hint: '方向键 / WASD 移动 · 按住空格射击 · P 暂停 · R 重玩' },
    bees: { action: '开 火', hint: '左右 / AD 移动 · 按住空格射击 · P 暂停 · R 重玩' },
    tetris: { action: '落 下', hint: '← → 移动 · ↑ 旋转 · ↓ 加速 · 空格直落 · P 暂停' },
    snake: { action: '加 速', hint: '方向键转弯 · 按住空格加速 · P 暂停 · R 重玩' },
    breakout: { action: '发 球', hint: '左右 / AD 移动，也可滑动挡板 · 空格发球 · P 暂停' },
    mines: { action: '翻 开', hint: '点格子翻开 · F 切换插旗 · 方向键选格 / 空格确认 · P 暂停' }
  };
  const LEVELS = [
    ['#######', '#     #', '# . $@#', '#     #', '#######'],
    ['#######', '#  .  #', '#  $  #', '#  @  #', '#     #', '#######'],
    ['########', '#      #', '# .$.  #', '#  $   #', '#  @   #', '########'],
    ['########', '# .  . #', '# $  $ #', '#      #', '#  @   #', '########'],
    ['########', '#  .   #', '#  $ # #', '# #  . #', '#   $  #', '# @    #', '########'],
    ['########', '# . .  #', '# $ $  #', '#  #   #', '# . $  #', '#   @  #', '########'],
    ['########', '#  ... #', '#      #', '#  $$$ #', '#      #', '#   @  #', '########'],
    ['#########', '#       #', '# . # . #', '# $   $ #', '#   #   #', '# . $ @ #', '#       #', '#########']
  ];
  function createSokoban(level) {
    const index = Math.max(0, Math.min(LEVELS.length - 1, level || 0)), rows = LEVELS[index];
    const s = { type: 'sokoban', level: index, width: Math.max(...rows.map(r => r.length)), height: rows.length, walls: [], goals: [], boxes: [], player: { x: 0, y: 0 }, steps: 0, pushes: 0, history: [], status: 'playing', event: '' };
    rows.forEach((row, y) => [...row].forEach((cell, x) => {
      const p = { x, y };
      if (cell === '#') s.walls.push(p);
      if ('.+*'.includes(cell)) s.goals.push(p);
      if ('$*'.includes(cell)) s.boxes.push(p);
      if ('@+'.includes(cell)) s.player = p;
    }));
    return s;
  }
  const at = (list, x, y) => list.findIndex(p => p.x === x && p.y === y);
  function moveSokoban(s, direction) {
    if (s.status !== 'playing' || !DIR[direction]) return false;
    const [dx, dy] = DIR[direction], x = s.player.x + dx, y = s.player.y + dy;
    if (x < 0 || x >= s.width || y < 0 || y >= s.height || at(s.walls, x, y) >= 0) return false;
    const box = at(s.boxes, x, y), bx = x + dx, by = y + dy;
    if (box >= 0 && (bx < 0 || bx >= s.width || by < 0 || by >= s.height || at(s.boxes, bx, by) >= 0 || at(s.walls, bx, by) >= 0)) return false;
    s.history.push({ player: { ...s.player }, boxes: s.boxes.map(p => ({ ...p })), steps: s.steps, pushes: s.pushes });
    s.player = { x, y }; s.steps++; s.event = 'move';
    if (box >= 0) { s.boxes[box] = { x: bx, y: by }; s.pushes++; s.event = 'push'; }
    if (s.boxes.every(p => at(s.goals, p.x, p.y) >= 0)) { s.status = 'won'; s.event = 'win'; }
    return true;
  }
  function undo(s) {
    if (s.type !== 'sokoban' || !s.history.length) return false;
    const h = s.history.pop(); Object.assign(s, h); s.status = 'playing'; s.event = 'move'; return true;
  }
  function rng(s) { s.seed = (s.seed * 1664525 + 1013904223) >>> 0; return s.seed / 4294967296; }
  function rectHit(a, b) { return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2; }
  function createTank(level, seed) {
    const s = { type: 'tank', level: level || 0, seed: seed || 8090, score: 0, lives: 3, kills: 0, target: 8 + (level || 0) * 2, spawned: 0, spawn: .8, enemies: [], bullets: [], particles: [], walls: [], status: 'playing', time: 0, event: '', base: { x: 240, y: 440, w: 30, h: 30 }, player: { x: 168, y: 440, w: 27, h: 27, dir: 'up', cooldown: 0, shield: 2.5 } };
    for (let row = 2; row < 12; row++) for (let col = 1; col < 14; col++) {
      if ((row % 3 < 2 && [2, 3, 6, 7, 10, 11].includes(col)) || (row === 11 && [6, 7, 8].includes(col))) s.walls.push({ x: col * 32 + 16, y: row * 32 + 16, w: 30, h: 30, steel: row === 6 && (col === 6 || col === 7), hp: 1 });
    }
    // A three-sided brick shelter protects the base; the entrance faces the player.
    [[208, 408], [240, 408], [272, 408], [208, 440], [272, 440]].forEach(([x, y]) => s.walls.push({ x, y, w: 30, h: 30, hp: 1 }));
    return s;
  }
  function explode(s, x, y, color) {
    for (let i = 0; i < 10; i++) s.particles.push({ x, y, vx: (rng(s) - .5) * 140, vy: (rng(s) - .5) * 140, life: .45, color });
  }
  function fire(s, unit, owner) {
    if (unit.cooldown > 0) return;
    const [dx, dy] = DIR[unit.dir];
    s.bullets.push({ x: unit.x + dx * 20, y: unit.y + dy * 20, vx: dx * (owner === 'player' ? 310 : 180), vy: dy * (owner === 'player' ? 310 : 180), w: 6, h: 9, owner });
    unit.cooldown = owner === 'player' ? .25 : 1.25 + rng(s) * 1.5;
    if (owner === 'player') s.event = 'shoot';
  }
  function canTankMove(s, unit, x, y) {
    const body = { x, y, w: unit.w, h: unit.h };
    return x >= 16 && x <= 464 && y >= 18 && y <= 464 && !s.walls.some(w => rectHit(body, w)) && !rectHit(body, s.base) && !s.enemies.some(e => e !== unit && rectHit(body, e)) && (unit === s.player || !rectHit(body, s.player));
  }
  function loseLife(s) {
    if (s.status !== 'playing' || s.lives <= 0 || s.player.shield > 0) return;
    s.lives--; s.event = 'hurt'; explode(s, s.player.x, s.player.y, '#edb851');
    if (s.lives <= 0) { s.status = 'lost'; return; }
    s.player.x = s.type === 'bees' ? 240 : 168; s.player.y = s.type === 'bees' ? 438 : 440; s.player.dir = 'up'; s.player.shield = 2.5;
  }
  function tickTank(s, input, dt) {
    s.time += dt; const p = s.player;
    p.cooldown = Math.max(0, p.cooldown - dt); p.shield = Math.max(0, p.shield - dt);
    const direction = ['up', 'down', 'left', 'right'].find(d => input[d]);
    if (direction) { p.dir = direction; const [dx, dy] = DIR[direction], x = p.x + dx * 115 * dt, y = p.y + dy * 115 * dt; if (canTankMove(s, p, x, y)) { p.x = x; p.y = y; } }
    if (input.fire) fire(s, p, 'player');
    s.spawn -= dt;
    if (s.spawn <= 0 && s.spawned < s.target && s.enemies.length < 4) {
      const x = [48, 240, 432][s.spawned % 3];
      if (!s.enemies.some(e => Math.hypot(e.x - x, e.y - 24) < 40) && Math.hypot(p.x - x, p.y - 24) > 40) {
        s.enemies.push({ x, y: 24, w: 27, h: 27, dir: 'down', turn: .8, cooldown: .6 + rng(s) * 1.2 }); s.spawned++; s.spawn = 1.8;
      }
    }
    s.enemies.forEach(e => {
      e.cooldown -= dt; e.turn -= dt;
      const [dx, dy] = DIR[e.dir], speed = 46 + Math.min(s.level, 10) * 4, x = e.x + dx * speed * dt, y = e.y + dy * speed * dt;
      if (canTankMove(s, e, x, y)) { e.x = x; e.y = y; } else e.turn = 0;
      if (e.turn <= 0) { e.dir = ['down', 'down', 'left', 'right', 'up'][Math.floor(rng(s) * 5)]; e.turn = .6 + rng(s) * 1.7; }
      fire(s, e, 'enemy');
    });
    for (const b of s.bullets) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < 0 || b.x > SIZE || b.y < 0 || b.y > SIZE) { b.dead = true; continue; }
      const wall = s.walls.find(w => rectHit(b, w));
      if (wall) { b.dead = true; if (!wall.steel) { wall.hp = 0; explode(s, b.x, b.y, '#bf7551'); } continue; }
      if (rectHit(b, s.base)) { b.dead = true; s.status = 'lost'; s.event = 'hurt'; explode(s, 240, 440, '#edb851'); continue; }
      if (b.owner === 'player') {
        const enemy = s.enemies.find(e => !e.dead && rectHit(b, e));
        if (enemy) { b.dead = true; enemy.dead = true; s.kills++; s.score += 100; s.event = 'hit'; explode(s, enemy.x, enemy.y, '#dc9661'); }
      } else if (rectHit(b, p)) { b.dead = true; loseLife(s); }
    }
    // Opposing shells can intercept one another.
    for (let i = 0; i < s.bullets.length; i++) for (let j = i + 1; j < s.bullets.length; j++) {
      const a = s.bullets[i], b = s.bullets[j]; if (!a.dead && !b.dead && a.owner !== b.owner && rectHit(a, b)) { a.dead = b.dead = true; }
    }
    s.walls = s.walls.filter(w => w.hp > 0); s.enemies = s.enemies.filter(e => !e.dead); s.bullets = s.bullets.filter(b => !b.dead);
    if (s.status === 'playing' && s.kills >= s.target) { s.status = 'won'; s.event = 'win'; }
  }
  function createBees(level, seed) {
    const s = { type: 'bees', level: level || 0, seed: seed || 1981, score: 0, lives: 3, kills: 0, status: 'playing', time: 0, event: '', enemies: [], bullets: [], particles: [], dx: 1, enemyTimer: .8, offset: 0, player: { x: 240, y: 438, w: 26, h: 22, cooldown: 0, shield: 2 } };
    for (let row = 0; row < 4; row++) for (let col = 0; col < 8; col++) s.enemies.push({ x: 70 + col * 46, y: 60 + row * 36, w: 25, h: 22, row, col });
    return s;
  }
  function tickBees(s, input, dt) {
    s.time += dt; const p = s.player;
    p.shield = Math.max(0, p.shield - dt); p.cooldown = Math.max(0, p.cooldown - dt);
    p.x = Math.max(20, Math.min(460, p.x + ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 235 * dt));
    if (input.fire && p.cooldown <= 0) { s.bullets.push({ x: p.x, y: p.y - 18, vx: 0, vy: -390, w: 5, h: 13, owner: 'player' }); p.cooldown = .2; s.event = 'shoot'; }
    const speed = 22 + s.level * 5 + (32 - s.enemies.length) * 1.8;
    const edge = s.enemies.some(e => e.x + s.dx * speed * dt > 458 || e.x + s.dx * speed * dt < 22);
    if (edge) { s.dx *= -1; s.enemies.forEach(e => { e.y += 15; }); }
    s.enemies.forEach(e => { e.x += s.dx * speed * dt; });
    s.enemyTimer -= dt;
    if (s.enemyTimer <= 0 && s.enemies.length) {
      const columns = [...new Set(s.enemies.map(e => e.col))], col = columns[Math.floor(rng(s) * columns.length)];
      const e = s.enemies.filter(e => e.col === col).sort((a, b) => b.y - a.y)[0];
      s.bullets.push({ x: e.x, y: e.y + 16, vx: (p.x - e.x) * .13, vy: 145 + s.level * 12, w: 5, h: 11, owner: 'enemy' });
      s.enemyTimer = Math.max(.22, .95 - s.level * .08 - s.time * .002) + rng(s) * .35;
    }
    for (const b of s.bullets) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < -20 || b.y > 500) { b.dead = true; continue; }
      if (b.owner === 'player') {
        const e = s.enemies.find(e => !e.dead && rectHit(b, e));
        if (e) { e.dead = b.dead = true; s.kills++; s.score += (4 - e.row) * 50; s.event = 'hit'; explode(s, e.x, e.y, ['#dd755c', '#e9be64', '#7eaf9d', '#9a9ad1'][e.row]); }
      } else if (rectHit(b, p)) { b.dead = true; loseLife(s); }
    }
    s.enemies = s.enemies.filter(e => !e.dead); s.bullets = s.bullets.filter(b => !b.dead);
    if (s.status === 'playing' && s.enemies.some(e => e.y > 405)) { s.status = 'lost'; s.event = 'hurt'; }
    if (s.status === 'playing' && !s.enemies.length) { s.status = 'won'; s.event = 'win'; }
  }
  function tick(s, input, dt) {
    if (s.status !== 'playing' || s.type === 'sokoban') return;
    const steps = Math.max(1, Math.ceil(Math.min(.1, Math.max(0, dt)) / (1 / 120))), step = Math.min(.1, Math.max(0, dt)) / steps;
    for (let i = 0; i < steps && s.status === 'playing'; i++) {
      if (s.type === 'tank') tickTank(s, input || {}, step); else if (s.type === 'bees') tickBees(s, input || {}, step); else Classics.tick(s, input || {}, step);
      if (s.particles) { s.particles.forEach(p => { p.x += p.vx * step; p.y += p.vy * step; p.life -= step; }); s.particles = s.particles.filter(p => p.life > 0); }
    }
  }
  function create(type, level, seed) {
    if (type === 'sokoban') return createSokoban(level);
    if (type === 'tank') return createTank(level, seed);
    if (type === 'bees') return createBees(level, seed);
    if (Classics.GAMES.some(g => g.id === type)) return Classics.create(type, level, seed);
    throw new Error('Unknown game: ' + type);
  }
  function action(s, value) { if (s.type === 'sokoban') return value === 'undo' ? undo(s) : moveSokoban(s, value); return Classics.action(s, value); }
  function canAdvance(s) { return s.status === 'won' && (['tank', 'bees', 'breakout'].includes(s.type) || (s.type === 'sokoban' && s.level < LEVELS.length - 1)); }
  function hud(s) {
    let stage = 'STAGE ' + String(s.level + 1).padStart(2, '0'), detail;
    const score = s.type === 'sokoban' ? '步数 ' + String(s.steps).padStart(3, '0') : 'SCORE ' + String(s.score).padStart(6, '0');
    if (s.type === 'sokoban') detail = '箱子 ' + s.boxes.filter(b => at(s.goals, b.x, b.y) >= 0).length + '/' + s.boxes.length;
    else if (s.type === 'tank') detail = '♥'.repeat(s.lives) + '  击破 ' + s.kills + '/' + s.target;
    else if (s.type === 'bees') detail = '♥'.repeat(s.lives) + '  余 ' + s.enemies.length;
    else if (s.type === 'breakout') detail = '♥'.repeat(s.lives) + '  余 ' + s.bricks.length;
    else if (s.type === 'snake') { stage = 'LEVEL ' + (s.level + 1); detail = '长度 ' + s.snake.length + ' · 果实 ' + s.eaten; }
    else if (s.type === 'tetris') { stage = 'LEVEL ' + (s.level + 1); detail = '消行 ' + s.lines + ' · 方块 ' + s.pieces; }
    else { stage = '9×9 / 10 雷'; detail = '余雷 ' + (10 - s.flags) + ' · ' + Math.floor(s.time) + ' 秒'; }
    return { stage, score, detail };
  }
  return { GAMES, LEVELS, DIR, SIZE, HELP, CONTROL, create, createSokoban, moveSokoban, undo, tick, rectHit, action, hud, canAdvance, pointer: Classics.pointer, classics: Classics };
});

;
/* src/draw.js */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.RetroDraw = factory(root.RetroCore);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Core) {
  'use strict';
  const SPRITES = {
    tank: ['002222200', '012222210', '012222210', '012332210', '012332210', '012332210', '012222210', '012222210', '010000010'],
    ship: ['000010000', '000121000', '000121000', '001121100', '011121110', '111121111', '111333111', '100333001'],
    bee: ['001000100', '000101000', '001111100', '011212110', '111111111', '101111101', '101000101', '000101000'],
    bee2: ['000111000', '011111110', '111212111', '111111111', '001111100', '011010110', '110000011', '010000010'],
    person: ['000111000', '001111100', '001221000', '000220000', '001331000', '011331100', '000330000', '001001000', '011001100'],
    eagle: ['101000101', '111000111', '011101110', '001111100', '000111000', '000111000', '001111100', '011000110'],
    heart: ['01100110', '11111111', '11111111', '01111110', '00111100', '00011000']
  };
  function sprite(ctx, name, x, y, size, palette, rotation) {
    const pixels = SPRITES[name]; if (!pixels) return;
    ctx.save(); ctx.translate(x, y); if (rotation) ctx.rotate(rotation);
    const unit = size / pixels[0].length, h = pixels.length * unit;
    for (let row = 0; row < pixels.length; row++) for (let col = 0; col < pixels[row].length; col++) {
      const n = +pixels[row][col]; if (!n) continue;
      ctx.fillStyle = palette[n - 1] || palette[0]; ctx.fillRect(Math.round(col * unit - size / 2), Math.round(row * unit - h / 2), Math.ceil(unit), Math.ceil(unit));
    }
    ctx.restore();
  }
  function text(ctx, str, x, y, size, color, align) { ctx.fillStyle = color; ctx.font = `bold ${size}px monospace`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); }
  function background(ctx, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, 480, 480); }
  function drawSokoban(ctx, s, time) {
    background(ctx, '#222e2a');
    const cell = Math.min(50, 416 / Math.max(s.width, s.height)), ox = (480 - s.width * cell) / 2, oy = (480 - s.height * cell) / 2;
    const tile = (p, inset) => [ox + p.x * cell + inset, oy + p.y * cell + inset, cell - inset * 2, cell - inset * 2];
    for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#34413a' : '#303c35'; ctx.fillRect(...tile({ x, y }, 1));
      ctx.fillStyle = '#485047'; ctx.fillRect(ox + x * cell + 6, oy + y * cell + cell - 7, 2, 2);
    }
    s.walls.forEach(p => { const [x, y, w, h] = tile(p, 1); ctx.fillStyle = '#6c7d67'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#879478'; ctx.fillRect(x, y, w, 5); ctx.fillStyle = '#52644f'; ctx.fillRect(x, y + h - 5, w, 5); ctx.fillRect(x + w / 2 - 1, y, 2, h / 2); ctx.fillRect(x, y + h / 2, w, 2); });
    s.goals.forEach(p => { const x = ox + (p.x + .5) * cell, y = oy + (p.y + .5) * cell; ctx.strokeStyle = '#d2b96c'; ctx.lineWidth = 2; ctx.strokeRect(x - cell * .23, y - cell * .23, cell * .46, cell * .46); ctx.fillStyle = '#d2b96c'; ctx.fillRect(x - 3, y - 3, 6, 6); });
    s.boxes.forEach(p => {
      const done = s.goals.some(g => g.x === p.x && g.y === p.y), [x, y, w, h] = tile(p, 5);
      ctx.fillStyle = '#14231e'; ctx.fillRect(x + 3, y + 4, w, h); ctx.fillStyle = done ? '#83ac79' : '#c99958'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = done ? '#4d7753' : '#845b38'; ctx.lineWidth = 3; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8); ctx.beginPath(); ctx.moveTo(x + 5, y + 5); ctx.lineTo(x + w - 5, y + h - 5); ctx.moveTo(x + w - 5, y + 5); ctx.lineTo(x + 5, y + h - 5); ctx.stroke();
    });
    sprite(ctx, 'person', ox + (s.player.x + .5) * cell, oy + (s.player.y + .5) * cell, cell * .76, ['#e7b94d', '#f0c8a0', '#738fac']);
    text(ctx, 'WAREHOUSE  /  ' + String(s.level + 1).padStart(2, '0'), 22, 23, 11, '#8eaa8e');
    text(ctx, 'PUSH A LITTLE. THINK A LITTLE.', 240, 457, 10, '#77937d', 'center');
  }
  function drawTank(ctx, s) {
    background(ctx, '#222921');
    ctx.fillStyle = '#31392c'; for (let y = 16; y < 480; y += 32) for (let x = 16; x < 480; x += 32) ctx.fillRect(x, y, 2, 2);
    s.walls.forEach(w => {
      ctx.fillStyle = w.steel ? '#899d9a' : '#a26343'; ctx.fillRect(w.x - 15, w.y - 15, 30, 30);
      ctx.fillStyle = w.steel ? '#b4c3b6' : '#bf8252'; ctx.fillRect(w.x - 15, w.y - 15, 30, 3);
      ctx.fillStyle = '#222921'; ctx.fillRect(w.x - 15, w.y - 1, 30, 2); ctx.fillRect(w.x - 1, w.y - 15, 2, 14); ctx.fillRect(w.x - 8, w.y, 2, 15);
    });
    ctx.fillStyle = '#e3d5a0'; ctx.fillRect(223, 423, 34, 34); sprite(ctx, 'eagle', 240, 440, 27, ['#493b2c']);
    const rotation = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
    s.enemies.forEach(e => sprite(ctx, 'tank', e.x, e.y, 29, ['#c49c7a', '#dcbea0', '#745541'], rotation[e.dir]));
    const p = s.player;
    if (p.shield <= 0 || Math.floor(s.time * 12) % 2 === 0) sprite(ctx, 'tank', p.x, p.y, 29, ['#9d9b58', '#e7c653', '#f4e4a4'], rotation[p.dir]);
    if (p.shield > 0) { ctx.strokeStyle = '#e6d27d'; ctx.lineWidth = 1; ctx.strokeRect(p.x - 20, p.y - 20, 40, 40); }
    drawEffects(ctx, s);
  }
  function drawBees(ctx, s) {
    background(ctx, '#192333');
    for (let i = 0; i < 65; i++) { const x = (i * 127 + 37) % 480, y = (i * 79 + s.time * (i % 3 + 1) * 7) % 480; ctx.fillStyle = i % 3 ? '#516078' : '#92a1a1'; ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, 2); }
    const palettes = [['#cb685d', '#f1cb7c'], ['#d8b865', '#f5e6af'], ['#7cad9e', '#d0e3b9'], ['#9995bd', '#e0bfdb']];
    s.enemies.forEach(e => sprite(ctx, Math.floor(s.time * 3) % 2 ? 'bee' : 'bee2', e.x, e.y, 27, palettes[e.row]));
    const p = s.player; if (p.shield <= 0 || Math.floor(s.time * 12) % 2 === 0) { sprite(ctx, 'ship', p.x, p.y, 31, ['#e8e2ca', '#c7785f', '#7caeb8']); ctx.fillStyle = '#e9a960'; ctx.fillRect(p.x - 3, p.y + 15, 6, 4 + (Math.floor(s.time * 18) % 3) * 3); }
    ctx.fillStyle = '#37445a'; ctx.fillRect(16, 466, 448, 1); drawEffects(ctx, s);
  }
  function drawEffects(ctx, s) {
    s.bullets.forEach(b => { ctx.fillStyle = b.owner === 'player' ? '#f7df88' : '#e98276'; ctx.fillRect(b.x - 2, b.y - 5, 4, 10); });
    s.particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / .45); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4); }); ctx.globalAlpha = 1;
  }
  const BLOCK_COLORS = ['#26332f', '#7daeb4', '#dcbd68', '#ac93b2', '#8da572', '#cb7863', '#8195b6', '#c99565'];
  function block(ctx, x, y, size, kind, ghost) {
    if (ghost) { ctx.strokeStyle = '#a7b19a'; ctx.lineWidth = 1; ctx.strokeRect(x + 2, y + 2, size - 4, size - 4); return; }
    ctx.fillStyle = BLOCK_COLORS[kind]; ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.fillStyle = '#ffffff35'; ctx.fillRect(x + 2, y + 2, size - 4, 3); ctx.fillStyle = '#00000025'; ctx.fillRect(x + 2, y + size - 5, size - 4, 3);
  }
  function drawTetris(ctx, s) {
    background(ctx, '#23312e'); text(ctx, 'FALLING BLOCKS', 25, 22, 12, '#b8c3a5');
    const ox = 83, oy = 43, cell = 20;
    ctx.fillStyle = '#182623'; ctx.fillRect(ox - 3, oy - 3, 206, 406);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 10; x++) { ctx.fillStyle = '#34433b'; ctx.fillRect(ox + x * cell + 9, oy + y * cell + 9, 1, 1); if (s.board[y][x]) block(ctx, ox + x * cell, oy + y * cell, cell, s.board[y][x]); }
    const p = s.piece, ghost = Core.classics.landingY(s);
    [ghost, p.y].forEach((y, index) => { p.matrix.forEach((row, cy) => row.forEach((value, x) => { if (value && y + cy >= 0) block(ctx, ox + (p.x + x) * cell, oy + (y + cy) * cell, cell, p.kind + 1, index === 0); })); });
    text(ctx, 'NEXT', 316, 65, 12, '#cbbf91');
    const next = Core.classics.SHAPES[s.next]; next.forEach((row, y) => row.forEach((value, x) => { if (value) block(ctx, 314 + x * 18, 88 + y * 18, 18, s.next + 1); }));
    [['LEVEL', s.level + 1], ['LINES', s.lines], ['SCORE', s.score]].forEach(([name, value], i) => { text(ctx, name, 316, 185 + i * 65, 10, '#8ca48d'); text(ctx, String(value).padStart(name === 'SCORE' ? 6 : 2, '0'), 316, 208 + i * 65, name === 'SCORE' ? 16 : 22, '#e1cc93'); });
    text(ctx, 'ROTATE. DROP. REPEAT.', 240, 466, 10, '#7f9c87', 'center');
  }
  function drawSnake(ctx, s) {
    background(ctx, '#a5b28a'); text(ctx, 'SNAKE  /  POCKET MEMORIES', 30, 22, 12, '#3b4e37');
    const ox = 40, oy = 43, cell = 20;
    ctx.strokeStyle = '#5d7351'; ctx.lineWidth = 3; ctx.strokeRect(ox - 3, oy - 3, 406, 406);
    ctx.fillStyle = '#95a57e'; ctx.fillRect(ox, oy, 400, 400);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) { ctx.fillStyle = '#879a7045'; ctx.fillRect(ox + x * cell + 8, oy + y * cell + 8, 2, 2); }
    s.snake.forEach((p, i) => { ctx.fillStyle = i === 0 ? '#283d2b' : '#405c36'; ctx.fillRect(ox + p.x * cell + 1, oy + p.y * cell + 1, 18, 18); ctx.fillStyle = '#728857'; ctx.fillRect(ox + p.x * cell + 4, oy + p.y * cell + 4, 11, 3); });
    const head = s.snake[0], x = ox + head.x * cell, y = oy + head.y * cell;
    ctx.fillStyle = '#d2d7ad';
    if (s.dir === 'left' || s.dir === 'right') { const xx = s.dir === 'right' ? 13 : 4; ctx.fillRect(x + xx, y + 4, 3, 3); ctx.fillRect(x + xx, y + 13, 3, 3); }
    else { const yy = s.dir === 'down' ? 13 : 4; ctx.fillRect(x + 4, y + yy, 3, 3); ctx.fillRect(x + 13, y + yy, 3, 3); }
    if (s.food) { const fx = ox + s.food.x * cell, fy = oy + s.food.y * cell; ctx.fillStyle = '#814a36'; ctx.fillRect(fx + 4, fy + 6, 12, 11); ctx.fillRect(fx + 7, fy + 3, 7, 14); ctx.fillStyle = '#3b5b33'; ctx.fillRect(fx + 10, fy + 1, 6, 4); }
    if (!s.started) { text(ctx, 'READY?', 240, 337, 24, '#3b4e37', 'center'); text(ctx, 'PRESS A DIRECTION TO START', 240, 369, 10, '#536b48', 'center'); }
    text(ctx, 'ONE MORE BITE. ONE MORE POINT.', 240, 466, 10, '#4f6742', 'center');
  }
  function drawBreakout(ctx, s) {
    background(ctx, '#262935'); text(ctx, 'BRICK BREAKER', 22, 21, 12, '#bfb4a2');
    ctx.fillStyle = '#50515a'; ctx.fillRect(12, 35, 4, 445); ctx.fillRect(464, 35, 4, 445); ctx.fillRect(12, 32, 456, 3);
    const colors = ['#c97b6d', '#ce9766', '#d7b46a', '#94aa79', '#7b9da1', '#a38ca8'];
    s.bricks.forEach(brick => { ctx.fillStyle = colors[brick.row]; ctx.fillRect(brick.x - brick.w / 2, brick.y - brick.h / 2, brick.w, brick.h); ctx.fillStyle = '#ffffff40'; ctx.fillRect(brick.x - brick.w / 2 + 2, brick.y - brick.h / 2 + 2, brick.w - 4, 3); if (brick.hp > 1) { ctx.strokeStyle = '#f3e5bc'; ctx.lineWidth = 1; ctx.strokeRect(brick.x - brick.w / 2 + 4, brick.y - brick.h / 2 + 4, brick.w - 8, brick.h - 8); } });
    const p = s.player, b = s.ball;
    ctx.fillStyle = '#e4c377'; ctx.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h); ctx.fillStyle = '#f2e2b5'; ctx.fillRect(p.x - p.w / 2 + 3, p.y - p.h / 2 + 2, p.w - 6, 3);
    if (!b.serving) { ctx.fillStyle = '#ddd6b444'; ctx.fillRect(b.x - b.vx * .04 - 3, b.y - b.vy * .04 - 3, 6, 6); }
    ctx.fillStyle = '#f5e6bc'; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
    if (b.serving) { text(ctx, 'READY?', 240, 318, 24, '#e4c377', 'center'); text(ctx, 'PRESS SPACE / TAP SERVE', 240, 350, 11, '#aba99d', 'center'); }
  }
  function drawMines(ctx, s) {
    background(ctx, '#b9c0b3'); text(ctx, 'MINESWEEPER', 42, 23, 13, '#3e4a41'); text(ctx, s.flagMode ? 'FLAG MODE' : 'OPEN MODE', 438, 23, 11, s.flagMode ? '#994d3e' : '#536b54', 'right');
    const grid = Core.classics.MINE_GRID, numberColors = ['#677262', '#456c99', '#557a49', '#a25948', '#756090', '#975a35', '#397b7c', '#474a45', '#747568'];
    s.cells.forEach((cell, i) => {
      const x = grid.x + (i % 9) * grid.cell, y = grid.y + Math.floor(i / 9) * grid.cell, showMine = cell.mine && (cell.open || s.status === 'lost');
      ctx.fillStyle = cell.open ? (showMine ? '#cc8b78' : '#cbd0bf') : '#9fae99'; ctx.fillRect(x + 1, y + 1, 42, 42);
      if (!cell.open) { ctx.fillStyle = '#e3e7d1'; ctx.fillRect(x + 2, y + 2, 39, 3); ctx.fillRect(x + 2, y + 2, 3, 39); ctx.fillStyle = '#72836e'; ctx.fillRect(x + 3, y + 39, 38, 3); ctx.fillRect(x + 39, y + 3, 3, 38); }
      if (showMine) { ctx.fillStyle = '#344139'; ctx.fillRect(x + 16, y + 12, 12, 20); ctx.fillRect(x + 12, y + 16, 20, 12); ctx.fillRect(x + 20, y + 8, 4, 28); ctx.fillRect(x + 8, y + 20, 28, 4); ctx.fillStyle = '#f2e9c7'; ctx.fillRect(x + 17, y + 15, 4, 4); }
      else if (cell.flag) { ctx.fillStyle = '#a74938'; ctx.beginPath(); ctx.moveTo(x + 22, y + 9); ctx.lineTo(x + 10, y + 17); ctx.lineTo(x + 22, y + 22); ctx.fill(); ctx.fillStyle = '#414e43'; ctx.fillRect(x + 21, y + 10, 3, 23); ctx.fillRect(x + 13, y + 32, 20, 3); }
      else if (cell.open && cell.adjacent) text(ctx, String(cell.adjacent), x + 22, y + 24, 25, numberColors[cell.adjacent], 'center');
    });
    ctx.strokeStyle = '#c38642'; ctx.lineWidth = 2; ctx.strokeRect(grid.x + s.cursor.x * grid.cell + 5, grid.y + s.cursor.y * grid.cell + 5, 34, 34);
    text(ctx, s.placed ? 'TRUST THE NUMBERS.' : 'FIRST OPEN IS ALWAYS SAFE.', 240, 467, 10, '#536650', 'center');
  }
  function render(ctx, state, time) {
    ctx.save(); ctx.imageSmoothingEnabled = false;
    if (state.type === 'sokoban') drawSokoban(ctx, state, time); else if (state.type === 'tank') drawTank(ctx, state); else if (state.type === 'bees') drawBees(ctx, state);
    else if (state.type === 'tetris') drawTetris(ctx, state); else if (state.type === 'snake') drawSnake(ctx, state); else if (state.type === 'breakout') drawBreakout(ctx, state); else if (state.type === 'mines') drawMines(ctx, state);
    ctx.restore();
  }
  function thumbnail(ctx, type) {
    const s = Core.create(type, type === 'sokoban' ? 5 : 0);
    if (type === 'tank') { s.enemies = [{ x: 48, y: 50, dir: 'down' }, { x: 336, y: 170, dir: 'left' }, { x: 430, y: 290, dir: 'down' }]; s.player.y = 355; s.player.shield = 0; s.bullets = [{ x: 168, y: 290, owner: 'player' }, { x: 430, y: 342, owner: 'enemy' }]; }
    if (type === 'bees') { s.time = 1; s.player.shield = 0; s.bullets = [{ x: 240, y: 320, owner: 'player' }, { x: 240, y: 260, owner: 'player' }, { x: 118, y: 310, owner: 'enemy' }]; }
    if (type === 'tetris') { for (let y = 14; y < 20; y++) for (let x = 0; x < 10; x++) if ((x + y) % 5 !== 0 && y > 18 - x % 4) s.board[y][x] = (x + Math.floor(y / 2)) % 7 + 1; s.piece.y = 5; }
    if (type === 'snake') { s.started = true; s.snake = [{ x: 14, y: 7 }, { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }, { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 11 }, { x: 12, y: 11 }]; s.food = { x: 16, y: 7 }; }
    if (type === 'breakout') { s.ball.serving = false; s.ball.x = 290; s.ball.y = 332; s.ball.vx = 100; s.ball.vy = -220; s.bricks = s.bricks.filter((_, i) => i < 21 || i % 3); }
    if (type === 'mines') { Core.classics.revealMine(s, 4, 4); const bombs = s.cells.map((cell, i) => cell.mine ? i : -1).filter(i => i >= 0); bombs.slice(0, 2).forEach(i => Core.classics.flagMine(s, i % 9, Math.floor(i / 9))); }
    render(ctx, s, 0);
  }
  return { render, thumbnail, sprite, text };
});

;
/* src/social-model.js */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RetroSocialModel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const RULES_VERSION = 1, STEP = 1 / 120, DIRECTIONS = ['up', 'right', 'down', 'left', 'fire'];
  const RULES = { sokoban: '关卡高优先，同关步数少优先', mines: '仅记录通关，用时少优先', tank: '最高得分优先，同分关卡高优先', bees: '最高得分优先，同分关卡高优先', breakout: '最高得分优先，同分关卡高优先', snake: '最高得分优先', tetris: '最高得分优先，同分等级高优先' };
  function mask(input) { return DIRECTIONS.reduce((value, key, i) => value | (input[key] ? 1 << i : 0), 0); }
  function input(bits) { const value = {}; DIRECTIONS.forEach((key, i) => { if (bits & (1 << i)) value[key] = true; }); return value; }
  function metric(state, ticks) {
    const gameId = state.type, timeMs = Math.round(ticks * STEP * 1000), level = state.level + 1;
    if (gameId === 'sokoban') return state.status === 'won' ? { gameId, score: level, level, steps: state.steps, pushes: state.pushes, timeMs, order: [level, -state.steps, -state.pushes, -timeMs], label: '第' + level + '关 · ' + state.steps + '步' } : null;
    if (gameId === 'mines') { const elapsed = Math.round(state.time * 1000); return state.status === 'won' ? { gameId, score: state.score, level: 1, steps: 0, pushes: 0, timeMs: elapsed, order: [-elapsed, state.score, 0, 0], label: (elapsed / 1000).toFixed(1) + ' 秒' } : null; }
    return { gameId, score: state.score, level, steps: 0, pushes: 0, timeMs, order: [state.score, level, -timeMs, 0], label: state.score + ' 分' };
  }
  return { RULES_VERSION, STEP, RULES, mask, input, metric };
});

;
/* src/social-client.js */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RetroSocial = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const KEY = '8090-social-v1';
  function create(platform) {
    let saved = {}; try { saved = JSON.parse(platform.read(KEY) || '{}') || {}; } catch (_) { /* Start a fresh guest identity. */ }
    const c = { enabled: platform.enabled !== false, player: saved.player || null, token: typeof saved.token === 'string' ? saved.token : '', queue: Array.isArray(saved.queue) ? saved.queue.slice(0, 60) : [], status: 'idle', message: '', busy: false };
    let registering = null, flushing = null;
    c.persist = function () {
      try { if (platform.write(KEY, JSON.stringify({ player: c.player, token: c.token, queue: c.queue })) === false) { c.message = '本机存储不可用，身份和待同步成绩可能无法保留。'; return false; } } catch (_) { c.message = '本机存储空间不足，待同步成绩暂存在内存。'; return false; } return true;
    };
    function notify() { if (platform.onChange) platform.onChange(c); }
    async function request(method, path, data, anonymous) {
      if (!c.enabled) throw new Error('联网服务尚未配置，当前可继续离线游玩。');
      const result = await platform.request(method, path, data, anonymous ? '' : c.token);
      return result;
    }
    c.ensure = function () {
      if (!c.enabled) return Promise.reject(new Error('联网服务尚未配置，当前可继续离线游玩。'));
      if (c.token && c.player) return Promise.resolve(c.player);
      if (registering) return registering;
      registering = request('POST', '/api/players', {}, true).then(data => { c.player = data.player; c.token = data.token; c.persist(); notify(); return c.player; }).finally(() => { registering = null; }); return registering;
    };
    c.call = async function (method, path, data) {
      await c.ensure();
      try { return await request(method, path, data); } catch (e) {
        if (e.status === 401) { c.player = null; c.token = ''; c.persist(); notify(); }
        throw e;
      }
    };
    c.rename = async nickname => { const result = await c.call('PATCH', '/api/me', { nickname }); c.player = result.player; c.persist(); notify(); return result.player; };
    c.recommendations = (page, size) => c.call('GET', '/api/recommendations?page=' + (page || 0) + '&size=' + (size || 5));
    c.recommend = (title, reason) => c.call('POST', '/api/recommendations', { title, reason });
    c.vote = (id, voted) => c.call('PUT', '/api/recommendations/' + encodeURIComponent(id) + '/vote', { voted });
    c.leaderboard = (gameId, page, size) => c.call('GET', '/api/leaderboards/' + encodeURIComponent(gameId) + '?page=' + (page || 0) + '&size=' + (size || 5));
    c.enqueue = function (run) {
      if (!c.enabled || c.queue.some(entry => entry.id === run.id)) return;
      if (c.queue.length >= 60) { c.message = '待同步对局较多，请先联网同步已有成绩。'; notify(); return; }
      c.queue.push(run); c.persist(); notify(); c.flush();
    };
    c.flush = function () {
      if (flushing) return flushing;
      if (!c.enabled || !c.queue.length) return Promise.resolve();
      flushing = (async () => {
        c.status = 'syncing'; notify();
        while (c.queue.length) {
          const run = c.queue[0];
          try {
            await c.call('POST', '/api/scores', run); c.queue.shift(); c.message = '成绩已核验并同步'; c.persist();
          } catch (e) {
            c.message = e.message || '连接失败，成绩将在联网后重试。';
            if ([400, 404, 409, 413].includes(e.status)) {
              const rejected = new Set([run.id]); c.queue.shift();
              c.queue = c.queue.filter(entry => { if (rejected.has(entry.parentId)) { rejected.add(entry.id); return false; } return true; }); c.persist();
            } else { c.status = 'pending'; notify(); return; }
          }
        }
        c.status = 'synced'; notify();
      })().catch(e => { c.status = 'pending'; c.message = e.message || '连接失败，稍后可重试。'; notify(); }).finally(() => { flushing = null; if (c.queue.length && c.status === 'synced') c.flush(); });
      return flushing;
    };
    return c;
  }
  return { create, KEY };
});

;
/* src/session.js */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./social-model.js'));
  else root.RetroSession = factory(root.RetroCore, root.RetroSocialModel);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Core, Model) {
  'use strict';
  const KEY = '8090-arcade-v1';
  const clean = n => Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  function create(platform) {
    let saved = {}; try { saved = JSON.parse(platform.read(KEY) || '{}') || {}; } catch (_) { /* Start with an empty local save. */ }
    const records = {};
    Core.GAMES.forEach(g => { const r = saved[g.id] || {}; records[g.id] = { plays: clean(r.plays), wins: clean(r.wins), best: clean(r.best), level: Math.min(Core.LEVELS.length - 1, clean(r.level)), stage: clean(r.stage) }; });
    const c = { records, sound: saved.sound === true, state: null, paused: false, input: {}, recorded: false, baseScore: 0, savedOK: true, repeat: .22 };
    c.save = () => { c.savedOK = platform.write(KEY, JSON.stringify({ ...records, sound: c.sound })) !== false; };
    c.trace = function (event) {
      if (!c.run || c.run.emitted || c.run.overflow) return;
      const previous = c.run.trace[c.run.trace.length - 1];
      if (event[0] === 0 && previous && previous[0] === 0 && previous[2] === event[2]) previous[1] += event[1]; else c.run.trace.push(event);
      if (c.run.trace.length > 60000 || c.run.ticks > 432000) { c.run.overflow = true; c.run.trace = []; }
    };
    c.finish = function (outcome) {
      if (!c.run || c.run.emitted) return; c.run.emitted = true;
      if (c.run.overflow || !platform.onResult || (['mines', 'sokoban'].includes(c.state.type) && c.state.status !== 'won')) return;
      const run = c.run;
      platform.onResult({ id: run.id, rulesVersion: Model.RULES_VERSION, gameId: c.state.type, level: run.level, seed: run.seed, parentId: run.parentId, outcome, trace: run.trace.map(event => event.slice()) });
    };
    c.start = function (type, level, carryScore, parentId) {
      const r = records[type]; if (!r) return;
      if (c.state) c.finish(c.state.status === 'playing' ? 'left' : c.state.status);
      const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
      const startLevel = level === undefined ? (type === 'sokoban' ? r.level : 0) : level;
      c.state = Core.create(type, startLevel, seed);
      c.run = { id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12), seed, level: startLevel, parentId: parentId || null, trace: [], ticks: 0, emitted: false, overflow: false }; c.accumulator = 0;
      c.baseScore = carryScore || 0; if (type !== 'sokoban') c.state.score = c.baseScore;
      c.paused = false; c.input = {}; c.recorded = false; c.repeat = .22; r.plays++; c.save();
    };
    c.record = function () {
      const s = c.state; if (!s) return;
      const r = records[s.type];
      if (s.type !== 'sokoban') r.best = Math.max(r.best, s.score);
      if (s.status !== 'playing' && !c.recorded) {
        c.recorded = true;
        if (s.status === 'won') { r.wins++; r.stage = Math.max(r.stage, s.level + 1); if (s.type === 'sokoban') { r.level = Math.min(Core.LEVELS.length - 1, s.level + 1); r.best = Math.max(r.best, s.level + 1); } }
        c.save();
        c.finish(s.status);
      }
    };
    c.action = function (action) {
      const s = c.state; if (!s) return;
      if (action === 'pause' && s.status === 'playing') { c.paused = !c.paused; c.input = {}; return; }
      if (action === 'restart') { c.start(s.type, ['tetris', 'snake'].includes(s.type) ? 0 : s.level, c.baseScore, c.run && c.run.parentId); return; }
      if (action === 'next' && Core.canAdvance(s)) { c.start(s.type, s.level + 1, s.score || 0, ['tank', 'bees', 'breakout'].includes(s.type) ? c.run.id : null); return; }
      if (c.paused || s.status !== 'playing') return;
      if (['up', 'right', 'down', 'left', 'fire', 'undo', 'flag'].includes(action)) c.trace([1, action]);
      Core.action(s, action); if (Core.DIR[action]) c.repeat = .22;
      c.playEvent(); c.record();
    };
    c.pointer = function (x, y, flag) { if (!c.state || c.paused || c.state.status !== 'playing') return; c.trace([2, x, y, flag === undefined ? -1 : flag ? 1 : 0]); Core.pointer(c.state, x, y, flag); c.playEvent(); c.record(); };
    c.playEvent = function () { if (c.state.event && c.sound && platform.sound) platform.sound(c.state.event); c.state.event = ''; };
    c.tick = function (dt) {
      if (!c.state || c.paused || c.state.status !== 'playing') return;
      c.accumulator += Math.max(0, Math.min(.1, dt));
      while (c.accumulator + 1e-10 >= Model.STEP && c.state.status === 'playing') {
        c.accumulator -= Model.STEP;
        if (['sokoban', 'tetris', 'mines'].includes(c.state.type)) {
        const allowed = c.state.type === 'tetris' ? ['left', 'right', 'down'] : ['left', 'right', 'up', 'down'];
        const direction = allowed.find(key => c.input[key]);
        if (direction) { c.repeat -= Model.STEP; if (c.repeat <= 0) { c.action(direction); c.repeat = .12; } } else c.repeat = .22;
        }
        if (c.state.status !== 'playing') break;
        c.run.ticks++; c.trace([0, 1, Model.mask(c.input)]); Core.tick(c.state, c.input, Model.STEP); c.playEvent(); c.record();
      }
    };
    c.leave = function () { c.record(); c.finish(c.state && c.state.status === 'playing' ? 'left' : c.state && c.state.status); c.save(); c.state = null; c.run = null; c.input = {}; c.paused = false; };
    c.toggleSound = function () { c.sound = !c.sound; c.save(); if (c.sound && platform.sound) platform.sound('win'); };
    return c;
  }
  return { create, KEY };
});

;
/* web.js */
(function () {
  'use strict';
  const Core = window.RetroCore, Draw = window.RetroDraw, Session = window.RetroSession;
  const $ = selector => document.querySelector(selector), $$ = selector => [...document.querySelectorAll(selector)];
  let audio = null, last = performance.now(), lastUI = '', view = 'games', filter = 'all', toastTimer;
  const heldKeys = new Map(), heldPointers = new Map();
  function playSound(event) {
    try {
      const Constructor = window.AudioContext || window.webkitAudioContext; if (!Constructor) return;
      if (!audio) audio = new Constructor(); if (audio.state === 'suspended') audio.resume();
      const notes = event === 'win' ? [523, 659, 784, 1047] : event === 'hurt' ? [220, 147] : [event === 'shoot' ? 740 : event === 'push' ? 220 : 392];
      notes.forEach((frequency, i) => { const osc = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime + i * .075; osc.type = 'square'; osc.frequency.setValueAtTime(frequency, at); osc.frequency.exponentialRampToValueAtTime(frequency * .65, at + .09); gain.gain.setValueAtTime(.025, at); gain.gain.exponentialRampToValueAtTime(.001, at + .1); osc.connect(gain); gain.connect(audio.destination); osc.start(at); osc.stop(at + .12); });
    } catch (_) { /* Play remains available if audio is blocked. */ }
  }
  const localRead = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const localWrite = (key, value) => { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } };
  const onlineBase = window.RetroOnlineConfig.apiBase || '';
  const social = window.RetroSocial.create({ read: localRead, write: localWrite, enabled: /^https?:$/.test(location.protocol) && (!!onlineBase || window.RetroOnlineConfig.sameOriginApi !== false), request: async (method, path, data, token) => {
    const abort = new AbortController(), timer = setTimeout(() => abort.abort(), 15000);
    try { const response = await fetch(onlineBase + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: data === undefined ? undefined : JSON.stringify(data), signal: abort.signal }); const value = await response.json(); if (!response.ok) throw Object.assign(new Error(value.error || '连接失败，请稍后重试。'), { status: response.status }); return value; } finally { clearTimeout(timer); }
  }});
  const session = Session.create({
    onResult: run => social.enqueue(run),
    read: key => { try { return localStorage.getItem(key); } catch (_) { return null; } },
    write: (key, value) => { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } },
    sound: playSound
  });
  const dialog = $('#game-dialog'), canvas = $('#game-canvas'), ctx = canvas.getContext('2d'), heroCtx = $('#hero-canvas').getContext('2d');
  const heroState = Core.create('tank'); heroState.player.shield = 0; heroState.player.x = 168; heroState.player.y = 336;
  heroState.enemies = [{ x: 48, y: 50, dir: 'down' }, { x: 335, y: 173, dir: 'down' }];
  function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500); }
  function updateSound() { $$('.sound-label').forEach(el => { el.textContent = session.sound ? '音效开' : '音效关'; }); $$('.sound-button').forEach(el => { el.setAttribute('aria-label', session.sound ? '关闭音效' : '开启音效'); el.setAttribute('title', session.sound ? '关闭音效' : '开启音效'); }); }
  function cardRecord(id) { const r = session.records[id]; return id === 'sokoban' ? '进度 ' + (r.level + 1) + ' / 8 关' : r.best ? '最高分 ' + String(r.best).padStart(6, '0') : '你的纪录，从这里开始'; }
  function renderCollection() {
    $$('[data-game-count]').forEach(el => { el.textContent = String(Core.GAMES.length).padStart(2, '0'); });
    $('#games-view').innerHTML = Core.GAMES.map((g, i) => `<article class="game-card" data-game="${g.id}" style="--card-color:${g.color}" ${filter !== 'all' && filter !== g.group ? 'hidden' : ''}><div class="card-art"><span class="card-label">CLASSIC ${g.year}</span><span class="card-category">${g.category}</span><canvas width="480" height="480" aria-label="${g.title}像素画面"></canvas></div><div class="card-body"><span class="card-english">${g.english}</span><div class="card-title"><h3>${g.title}</h3><span class="card-index">0${i + 1}</span></div><p>${g.description}</p><div class="card-bottom"><span class="card-record">${cardRecord(g.id)}</span><button class="card-rank" data-rank="${g.id}" aria-label="${g.title}排行榜">榜单</button><button class="play-button" data-play="${g.id}">开始游戏 <span>↗</span></button></div></div></article>`).join('');
    $$('.game-card').forEach(el => Draw.thumbnail(el.querySelector('canvas').getContext('2d'), el.dataset.game));
    $$('[data-play]').forEach(el => el.addEventListener('click', () => startGame(el.dataset.play)));
    $$('[data-rank]').forEach(el => el.addEventListener('click', () => openSocial('leaderboard', el.dataset.rank)));
    $('#records-view').innerHTML = Core.GAMES.map(g => { const r = session.records[g.id]; return `<article><span>${g.english}</span><h3>${g.title}</h3><strong>${g.id === 'sokoban' ? String(r.level + 1).padStart(2, '0') + ' / 08' : String(r.best).padStart(6, '0')}</strong><p>${g.id === 'sokoban' ? '当前解锁关卡' : '本机最高得分'}<br>游玩 ${r.plays} 次 · 通关 ${r.wins} 次</p><button class="play-button" style="--card-color:${g.color}" data-record-play="${g.id}">继续挑战 ↗</button></article>`; }).join('');
    $$('[data-record-play]').forEach(el => el.addEventListener('click', () => startGame(el.dataset.recordPlay)));
    $('#help-view').innerHTML = Core.GAMES.map((g, i) => `<article><span>0${i + 1} / ${g.english}</span><h3>${g.title}</h3><p>${Core.HELP[g.id].join('<br>')}</p><kbd>${Core.CONTROL[g.id].hint}</kbd></article>`).join('');
  }
  function setView(next) {
    view = next; ['games', 'records', 'help'].forEach(name => { $('#' + name + '-view').hidden = view !== name; });
    $$('.nav-button').forEach(el => el.classList.toggle('active', el.dataset.view === view));
    $('.collection-toolbar').hidden = view !== 'games';
    $('#section-title').textContent = view === 'games' ? '今日份快乐，已就位。' : view === 'records' ? '每一分，都是童年。' : '找回手感，很简单。';
    if (view !== 'games') $('#collection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function clearInput() { heldKeys.clear(); heldPointers.clear(); session.input = {}; }
  function refreshInput() { session.input = {}; [...heldKeys.values(), ...heldPointers.values()].forEach(action => { session.input[action] = true; }); }
  function startGame(id) {
    session.start(id); clearInput(); lastUI = '';
    const g = Core.GAMES.find(g => g.id === id); $('#game-title').textContent = g.title; $('#game-english').textContent = g.english + ' / CLASSIC ' + g.year;
    $('#undo-game').hidden = id !== 'sokoban'; $('.fire-button').hidden = id === 'sokoban'; $('.sokoban-note').hidden = id !== 'sokoban';
    $('#flag-game').hidden = id !== 'mines';
    ['up', 'down'].forEach(dir => { $('[data-control=' + dir + ']').hidden = ['bees', 'breakout'].includes(id); });
    $('[data-control=up]').textContent = id === 'tetris' ? '↻' : '↑'; $('[data-control=up]').setAttribute('aria-label', id === 'tetris' ? '旋转方块' : '向上');
    $('#keyboard-hint').textContent = Core.CONTROL[id].hint;
    document.body.style.overflow = 'hidden'; if (!dialog.open) dialog.showModal(); renderGameUI(); canvas.focus();
    if (!session.savedOK) toast('浏览器未允许本地存储，本次进度暂不能保存。');
  }
  function closeGame() { session.leave(); clearInput(); dialog.close(); document.body.style.overflow = ''; renderCollection(); }
  function perform(action) { clearInput(); session.action(action); lastUI = ''; renderGameUI(); canvas.focus(); }
  function renderGameUI() {
    const s = session.state; if (!s) return;
    const hud = Core.hud(s), key = [hud.stage, hud.score, hud.detail, s.history && s.history.length, s.flagMode, s.status, session.paused].join(':'); if (key === lastUI) return; lastUI = key;
    $('#stage-label').textContent = hud.stage; $('#score-label').textContent = hud.score; $('#lives-label').textContent = hud.detail;
    $('#flag-game').textContent = s.flagMode ? '⚑ 插旗开' : '⚑ 插旗关'; $('#flag-game').setAttribute('aria-pressed', s.flagMode ? 'true' : 'false');
    $('.fire-button').innerHTML = (s.type === 'mines' && s.flagMode ? '插 旗' : Core.CONTROL[s.type].action) + '<small>' + ({ tetris: 'DROP', snake: 'BOOST', breakout: 'SERVE', mines: s.flagMode ? 'FLAG' : 'OPEN' }[s.type] || 'FIRE') + '</small>';
    $('#pause-game').textContent = session.paused ? '▷ 继续' : 'Ⅱ 暂停'; $('#pause-game').disabled = s.status !== 'playing';
    $('#undo-game').disabled = s.type !== 'sokoban' || !s.history.length || session.paused || s.status !== 'playing';
    const overlay = $('#game-overlay'), paused = session.paused, won = s.status === 'won', all = won && s.type === 'sokoban' && s.level === Core.LEVELS.length - 1, next = Core.canAdvance(s);
    overlay.hidden = !paused && s.status === 'playing';
    if (!overlay.hidden) {
      $('#overlay-kicker').textContent = paused ? 'TAKE A LITTLE BREAK' : won ? 'STAGE CLEAR!' : 'ONE MORE GAME?';
      $('#overlay-title').textContent = paused ? '休息一下，快乐等你。' : won ? all ? '仓库整理大师！' : '漂亮！这关拿下。' : '再来一局，就现在。';
      $('#overlay-description').textContent = paused ? '进度停在这一刻。准备好后，我们继续。' : s.type === 'sokoban' ? `用 ${s.steps} 步，推动 ${s.pushes} 次。${all ? '全部 8 关已通关！' : '通关进度已保存在本机。'}` : `本局得分 ${s.score} · 最高纪录 ${session.records[s.type].best}`;
      $('#overlay-action').textContent = paused ? '▷ 继续游戏' : next ? '下一关 →' : '↻ 再玩一次';
      $('#overlay-action').dataset.action = paused ? 'pause' : next ? 'next' : 'restart'; clearInput();
    }
  }
  $$('.sound-button').forEach(el => el.addEventListener('click', () => { session.toggleSound(); updateSound(); }));
  $$('.nav-button').forEach(el => el.addEventListener('click', () => setView(el.dataset.view)));
  $$('.filter').forEach(el => el.addEventListener('click', () => { filter = el.dataset.filter; $$('.filter').forEach(b => { b.classList.toggle('active', b === el); b.setAttribute('aria-pressed', b === el ? 'true' : 'false'); }); renderCollection(); }));
  $('#random-play').addEventListener('click', () => startGame(Core.GAMES[Math.floor(Math.random() * Core.GAMES.length)].id));
  $('#close-game').addEventListener('click', closeGame); $('#overlay-home').addEventListener('click', closeGame);
  $('#pause-game').addEventListener('click', () => perform('pause')); $('#restart-game').addEventListener('click', () => perform('restart'));
  $('#undo-game').addEventListener('click', () => perform('undo')); $('#overlay-action').addEventListener('click', () => perform($('#overlay-action').dataset.action));
  $('#flag-game').addEventListener('click', () => perform('flag'));
  dialog.addEventListener('cancel', e => { e.preventDefault(); if (session.state.status === 'playing' && !session.paused) perform('pause'); else closeGame(); });
  const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', ' ': 'fire' };
  window.addEventListener('keydown', e => {
    if (!session.state || e.altKey || e.ctrlKey || e.metaKey || $('#social-dialog').open || (e.target.closest && e.target.closest('input,textarea,select'))) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key, action = keys[key];
    if (action) { e.preventDefault(); if (e.repeat || session.paused || session.state.status !== 'playing') return; heldKeys.set(e.code, action); refreshInput(); session.action(action); }
    else if (!e.repeat && ['p', 'r', 'z', 'f'].includes(key)) { e.preventDefault(); perform(key === 'p' ? 'pause' : key === 'r' ? 'restart' : key === 'f' ? 'flag' : 'undo'); }
  });
  window.addEventListener('keyup', e => { heldKeys.delete(e.code); refreshInput(); });
  $$('[data-control]').forEach(el => {
    el.addEventListener('pointerdown', e => { e.preventDefault(); if (!session.state || session.paused || session.state.status !== 'playing') return; el.setPointerCapture(e.pointerId); heldPointers.set(e.pointerId, el.dataset.control); refreshInput(); session.action(el.dataset.control); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => el.addEventListener(name, e => { heldPointers.delete(e.pointerId); refreshInput(); }));
    el.addEventListener('contextmenu', e => e.preventDefault());
  });
  function screenPoint(e) { const rect = canvas.getBoundingClientRect(); return { x: (e.clientX - rect.left) * 480 / rect.width, y: (e.clientY - rect.top) * 480 / rect.height }; }
  canvas.addEventListener('pointerdown', e => { if (!session.state || !['mines', 'breakout'].includes(session.state.type) || e.button !== 0) return; e.preventDefault(); canvas.setPointerCapture(e.pointerId); const p = screenPoint(e); session.pointer(p.x, p.y); if (session.state.type === 'breakout') session.action('fire'); });
  canvas.addEventListener('pointermove', e => { if (e.buttons && session.state && session.state.type === 'breakout') { const p = screenPoint(e); session.pointer(p.x, p.y); } });
  canvas.addEventListener('contextmenu', e => { if (session.state && session.state.type === 'mines') { e.preventDefault(); const p = screenPoint(e); session.pointer(p.x, p.y, true); } });
  function hide() { clearInput(); if (session.state) { if (session.state.status === 'playing') session.paused = true; session.record(); session.save(); lastUI = ''; renderGameUI(); } }
  window.addEventListener('blur', hide); window.addEventListener('pagehide', hide);
  window.addEventListener('online', () => social.flush());
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); else last = performance.now(); });
  function frame(now) {
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
    if (session.state) { session.tick(dt); Draw.render(ctx, session.state); renderGameUI(); }
    if (!document.hidden && !dialog.open && !matchMedia('(prefers-reduced-motion: reduce)').matches) { heroState.time = now / 1000; heroState.enemies[0].y = 40 + Math.sin(now / 1700) * 12; Draw.render(heroCtx, heroState); }
    requestAnimationFrame(frame);
  }
  const socialDialog = $('#social-dialog'); let socialView = 'recommend', recommendPage = 0, boardPage = 0, socialLoad = 0, recommendationData = null;
  const escape = str => String(str).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  $('#board-game').innerHTML = Core.GAMES.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
  function syncLabel() { $('#player-nickname').textContent = social.player ? social.player.nickname : '游客身份'; $('#sync-status').textContent = social.queue.length ? social.queue.length + ' 局成绩待同步' : social.message || '成绩由服务端重放操作核验'; }
  function pages(element, page, total, size, change) {
    element.replaceChildren();
    const add = (name, next) => { const b = document.createElement('button'); b.textContent = name; b.addEventListener('click', () => change(next)); element.append(b); };
    if (page > 0) add('← 上一页', page - 1); const label = document.createElement('span'); label.textContent = (page + 1) + ' / ' + Math.max(1, Math.ceil(total / size)); element.append(label); if ((page + 1) * size < total) add('下一页 →', page + 1);
  }
  async function loadSocial() {
    const requestId = ++socialLoad, current = socialView; $('#social-message').textContent = '正在连接游戏厅…';
    try {
      await social.flush();
      const data = current === 'recommend' ? await social.recommendations(recommendPage, 5) : await social.leaderboard($('#board-game').value, boardPage, 5);
      if (requestId !== socialLoad || !socialDialog.open) return;
      $('#social-message').textContent = ''; syncLabel();
      if (current === 'recommend') {
        recommendationData = data; $('#recommend-total').textContent = data.total + ' 款提名';
        $('#recommend-list').innerHTML = data.rows.length ? data.rows.map(r => `<article class="recommend-row"><span class="rank-number">${String(r.rank).padStart(2, '0')}</span><div><h3>${escape(r.title)}</h3><p>${escape(r.reason || '这款游戏，值得再来一局。')}</p></div><button data-vote="${r.id}" aria-pressed="${r.voted}" class="vote-button ${r.voted ? 'voted' : ''}"><strong>${r.votes}</strong><span>${r.voted ? '已投 · 撤回' : '投一票'}</span></button></article>`).join('') : '<div class="social-empty">还没有提名。第一枚推荐币，交给你。</div>';
        $$('[data-vote]').forEach(button => button.addEventListener('click', async () => { const row = recommendationData.rows.find(r => r.id === button.dataset.vote); button.disabled = true; try { await social.vote(row.id, !row.voted); await loadSocial(); } catch (e) { $('#social-message').textContent = e.message; button.disabled = false; } }));
        pages($('#recommend-pages'), recommendPage, data.total, 5, next => { recommendPage = next; loadSocial(); });
      } else {
        $('#board-rule').textContent = data.rule + ' · 共 ' + data.total + ' 位玩家';
        $('#board-list').innerHTML = data.rows.length ? data.rows.map(r => `<article class="board-row ${social.player && r.player_id === social.player.id ? 'is-me' : ''}"><span class="rank-number">${String(r.rank).padStart(2, '0')}</span><strong>${escape(r.nickname)}</strong><span>${escape(r.label)}</span></article>`).join('') : '<div class="social-empty">榜单还空着，来留下第一个成绩。</div>';
        $('#my-rank').textContent = data.mine ? '我的名次  #' + data.mine.rank + '　' + data.mine.label : '我的名次：暂无有效成绩，开一局来挑战。';
        pages($('#board-pages'), boardPage, data.total, 5, next => { boardPage = next; loadSocial(); });
      }
    } catch (e) { if (requestId === socialLoad) { $('#social-message').textContent = e.message || '连接失败，请点击刷新重试。'; syncLabel(); } }
  }
  function openSocial(next, gameId) {
    socialView = next; if (gameId) $('#board-game').value = gameId;
    $('#social-title').textContent = next === 'recommend' ? '下一款，听你的。' : '每一分，都算数。';
    $('#recommend-panel').hidden = next !== 'recommend'; $('#leaderboard-panel').hidden = next !== 'leaderboard';
    $$('[data-social-tab]').forEach(b => b.classList.toggle('active', b.dataset.socialTab === next));
    if (!socialDialog.open) { hide(); document.body.style.overflow = 'hidden'; socialDialog.showModal(); }
    syncLabel(); loadSocial();
  }
  $$('[data-social]').forEach(b => b.addEventListener('click', () => openSocial(b.dataset.social)));
  $('#play-rank-game').addEventListener('click', () => { if (session.state) openSocial('leaderboard', session.state.type); });
  $$('[data-social-tab]').forEach(b => b.addEventListener('click', () => openSocial(b.dataset.socialTab)));
  $('#close-social').addEventListener('click', () => socialDialog.close()); socialDialog.addEventListener('close', () => { socialLoad++; document.body.style.overflow = dialog.open ? 'hidden' : ''; });
  $('#refresh-social').addEventListener('click', loadSocial); $('#board-game').addEventListener('change', () => { boardPage = 0; loadSocial(); });
  $('#recommend-form').addEventListener('submit', async e => {
    e.preventDefault(); const button = e.submitter || $('#recommend-form button'); button.disabled = true;
    try { const result = await social.recommend($('#recommend-title').value, $('#recommend-reason').value); $('#recommend-form').reset(); recommendPage = 0; await loadSocial(); $('#social-message').textContent = result.created ? '推荐成功！已为你投出第一票。' : '已有相同提名，已合并并为它投票。'; }
    catch (error) { $('#social-message').textContent = error.message; } finally { button.disabled = false; }
  });
  $('#rename-player').addEventListener('click', async () => { try { await social.ensure(); $('#nickname-input').value = social.player.nickname; $('#nickname-message').textContent = ''; $('#nickname-dialog').showModal(); } catch (e) { $('#social-message').textContent = e.message; } });
  $('#cancel-nickname').addEventListener('click', () => $('#nickname-dialog').close());
  $('#nickname-form').addEventListener('submit', async e => { e.preventDefault(); const button = $('#nickname-form button[type=submit]'); button.disabled = true; try { await social.rename($('#nickname-input').value); $('#nickname-dialog').close(); loadSocial(); } catch (error) { $('#nickname-message').textContent = error.message; } finally { button.disabled = false; } });
  renderCollection(); updateSound(); Draw.render(heroCtx, heroState); requestAnimationFrame(frame); social.flush();
})();
