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
