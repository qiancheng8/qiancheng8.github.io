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
