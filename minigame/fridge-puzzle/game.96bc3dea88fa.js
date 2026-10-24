/* shared.js */
(function () {
  'use strict';
  const key = 'little-days-v1';
  let data;
  try { data = JSON.parse(localStorage.getItem(key)) || {}; } catch { data = {}; }
  if (!data.records || typeof data.records !== 'object') data.records = {};
  let context;
  const api = {
    record(game) { return data.records[game] || { wins: 0, best: 0, level: 1 }; },
    save(game, score, level) {
      const old = api.record(game);
      data.records[game] = { wins: old.wins + 1, best: Math.max(old.best, score), level: Math.max(old.level, level || 1) };
      api.persist();
    },
    persist() { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* Private browsing can disable storage. */ } },
    sound(kind = 'tap') {
      if (!data.sound) return;
      try {
        context ||= new (window.AudioContext || window.webkitAudioContext)();
        context.resume();
        const tones = kind === 'win' ? [523, 659, 784] : kind === 'bad' ? [180] : kind === 'good' ? [587, 784] : [440];
        tones.forEach((f, i) => {
          const osc = context.createOscillator(), gain = context.createGain(), t = context.currentTime + i * 0.085;
          osc.type = 'sine'; osc.frequency.value = f;
          gain.gain.setValueAtTime(0.055, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          osc.connect(gain); gain.connect(context.destination); osc.start(t); osc.stop(t + 0.17);
        });
      } catch { /* Sound is optional. */ }
    },
    toast(message, bad = false) {
      const el = document.querySelector('#toast');
      if (!el) return;
      el.textContent = message; el.classList.toggle('bad', bad); el.classList.add('visible');
      clearTimeout(api.toastTimer); api.toastTimer = setTimeout(() => el.classList.remove('visible'), 2500);
      api.sound(bad ? 'bad' : 'tap');
    },
    result({ won = true, title, text, score, next }) {
      api.sound(won ? 'win' : 'bad');
      const dialog = document.querySelector('#result-dialog');
      dialog.querySelector('.result-symbol').textContent = won ? '✳' : '☁';
      dialog.querySelector('h2').textContent = title;
      dialog.querySelector('.result-description').textContent = text;
      dialog.querySelector('.result-score').textContent = score;
      const button = dialog.querySelector('#next-button');
      button.textContent = next ? '下一关 →' : '再来一局 ↻';
      button.onclick = () => { dialog.close(); window.gameApp.restart(Boolean(next)); };
      dialog.showModal();
    },
    stat(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; },
    shuffle(items, random = Math.random) { const arr = [...items]; for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
  };
  window.LittleDays = api;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sound-toggle').forEach(button => {
      const update = () => { button.classList.toggle('is-on', !!data.sound); button.setAttribute('aria-label', data.sound ? '关闭音效' : '开启音效'); button.title = data.sound ? '关闭音效' : '开启音效'; button.textContent = data.sound ? '♫' : '♪'; };
      update(); button.onclick = () => { data.sound = !data.sound; api.persist(); update(); api.sound(); };
    });
    document.querySelector('#help-button')?.addEventListener('click', () => document.querySelector('#help-dialog').showModal());
    document.querySelectorAll('[data-close-dialog]').forEach(button => button.onclick = () => button.closest('dialog').close());
    document.querySelector('#restart-button')?.addEventListener('click', () => window.gameApp.restart(false));
    document.addEventListener('keydown', event => {
      if (document.querySelector('dialog[open]') || ['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
      window.gameApp?.key?.(event);
    });
  });
})();

;
/* core.js */
(function (root) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  function seeded(seed) {
    let n = seed >>> 0;
    return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function shuffle(values, random) {
    const list = [...values];
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    return list;
  }

  class Market {
    constructor(level = 1) {
      this.level = level; this.capacity = 4; this.kinds = Math.min(6, 3 + level); this.status = 'playing'; this.moves = 0; this.history = []; this.elapsed = 0;
      const random = seeded(level * 7919 + 17);
      this.boxes = Array.from({ length: this.kinds + 2 }, (_, i) => i < this.kinds ? Array(4).fill(i) : []);
      this.solution = [];
      // Reverse legal single-item moves, retaining a guaranteed route to the solved layout.
      for (let step = 0; step < 240 + level * 20; step++) {
        const choices = [];
        this.boxes.forEach((box, from) => {
          if (!box.length || (box.length > 1 && box[box.length - 1] !== box[box.length - 2])) return;
          this.boxes.forEach((target, to) => { if (from !== to && target.length < this.capacity) choices.push([from, to]); });
        });
        if (!choices.length) break;
        const [from, to] = choices[Math.floor(random() * choices.length)];
        this.boxes[to].push(this.boxes[from].pop()); this.solution.unshift([to, from]);
      }
      if (this.isSolved()) {
        // Deterministic fallback with the same reverse-move guarantee.
        this.boxes = Array.from({ length: this.kinds + 2 }, (_, i) => i < this.kinds ? Array(4).fill(i) : []);
        this.solution = [];
        const path = [[0, this.kinds], [1, this.kinds], [0, 1], [2, 0]];
        path.forEach(([from, to]) => { this.boxes[to].push(this.boxes[from].pop()); this.solution.unshift([to, from]); });
      }
      this.initial = copy(this.boxes);
    }
    valid(from, to) {
      const a = this.boxes[from], b = this.boxes[to];
      return from !== to && a?.length > 0 && b && b.length < 4 && (!b.length || a[a.length - 1] === b[b.length - 1]);
    }
    move(from, to) {
      if (this.status !== 'playing' || !this.valid(from, to)) return false;
      this.history.push(copy(this.boxes)); this.boxes[to].push(this.boxes[from].pop()); this.moves++;
      if (this.isSolved()) this.status = 'won';
      return true;
    }
    undo() {
      if (!this.history.length) return false;
      this.boxes = this.history.pop(); this.moves--; this.status = 'playing'; return true;
    }
    isSolved() { return this.boxes.every(b => !b.length || (b.length === 4 && b.every(x => x === b[0]))); }
    get completed() { return this.boxes.filter(b => b.length === 4 && b.every(x => x === b[0])).length; }
    hint() {
      const choices = [];
      this.boxes.forEach((box, from) => this.boxes.forEach((target, to) => {
        if (!this.valid(from, to) || (box.every(x => x === box[0]) && !target.length)) return;
        let score = target.length * 3 + (target.length === 3 ? 12 : 0);
        if (box.length > 1 && box[box.length - 2] !== box[box.length - 1]) score += 7;
        if (box.length === 4 && box.every(x => x === box[0])) score -= 25;
        choices.push({ from, to, score });
      }));
      return choices.sort((a, b) => b.score - a.score)[0] || null;
    }
    get score() { return Math.max(100, 1600 + this.level * 100 - this.moves * 12 - Math.floor(this.elapsed)); }
  }

  const groceries = [
    { name: '鲜鸡蛋', icon: '🥚', color: 'butter', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    { name: '牛奶', icon: '🥛', color: 'blue', cells: [[0, 0], [0, 1], [0, 2]] },
    { name: '胡萝卜', icon: '🥕', color: 'orange', cells: [[0, 0], [1, 0], [2, 0]] },
    { name: '西兰花', icon: '🥦', color: 'green', cells: [[0, 0], [0, 1], [1, 1]] },
    { name: '鲜鱼', icon: '🐟', color: 'teal', cells: [[0, 0], [1, 0]] },
    { name: '芝士', icon: '🧀', color: 'yellow', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    { name: '果汁', icon: '🧃', color: 'pink', cells: [[0, 0], [0, 1]] },
    { name: '蘑菇', icon: '🍄', color: 'rose', cells: [[0, 0], [1, 0], [2, 0]] }
  ];
  function rotate(cells) {
    const turned = cells.map(([x, y]) => [-y, x]);
    const minX = Math.min(...turned.map(c => c[0])), minY = Math.min(...turned.map(c => c[1]));
    return turned.map(([x, y]) => [x - minX, y - minY]);
  }
  class Fridge {
    constructor(level = 1) {
      this.level = level; this.cols = 6; this.rows = 5; this.status = 'playing'; this.moves = 0; this.elapsed = 0; this.history = [];
      this.pieces = copy(groceries); this.placed = {}; this.board = Array(30).fill(null);
      const count = Math.min(6, level + 1), row = level % 2 ? 4 : 0;
      for (let x = 0; x < count; x++) this.board[row * 6 + x] = -1;
      this.pieces.forEach((piece, i) => { for (let j = 0; j < (i + level) % 4; j++) piece.cells = rotate(piece.cells); });
    }
    indices(id, x, y) { return this.pieces[id].cells.map(([dx, dy]) => [x + dx, y + dy]); }
    canPlace(id, x, y) {
      return !!this.pieces[id] && !this.placed[id] && this.indices(id, x, y).every(([cx, cy]) => cx >= 0 && cy >= 0 && cx < 6 && cy < 5 && this.board[cy * 6 + cx] === null);
    }
    snapshot() { return { board: [...this.board], placed: copy(this.placed), pieces: copy(this.pieces), moves: this.moves }; }
    place(id, x, y) {
      if (this.status !== 'playing' || !this.canPlace(id, x, y)) return false;
      this.history.push(this.snapshot());
      this.indices(id, x, y).forEach(([cx, cy]) => { this.board[cy * 6 + cx] = id; });
      this.placed[id] = { x, y }; this.moves++;
      if (Object.keys(this.placed).length === this.pieces.length) this.status = 'won';
      return true;
    }
    remove(id) {
      if (this.status !== 'playing' || !this.placed[id]) return false;
      this.history.push(this.snapshot()); this.board = this.board.map(n => n === id ? null : n); delete this.placed[id]; this.moves++; return true;
    }
    rotate(id) { if (this.status !== 'playing' || !this.pieces[id] || this.placed[id]) return false; this.pieces[id].cells = rotate(this.pieces[id].cells); return true; }
    undo() { if (!this.history.length) return false; Object.assign(this, this.history.pop()); this.status = 'playing'; return true; }
    get score() { return Math.max(100, 1600 + this.level * 100 - this.moves * 18 - Math.floor(this.elapsed)); }
  }

  const districts = [
    { name: '青山区', short: '青山', icon: '△', color: 'green', street: '青石路 18 号' },
    { name: '海港区', short: '海港', icon: '≈', color: 'blue', street: '海风街 26 号' },
    { name: '松林区', short: '松林', icon: '♧', color: 'orange', street: '松果巷 32 号' },
    { name: '花田区', short: '花田', icon: '✿', color: 'pink', street: '花园路 6 号' }
  ];
  class Parcel {
    constructor(level = 1) {
      this.level = level; this.status = 'ready'; this.total = 20 + Math.min(level - 1, 5) * 4;
      this.duration = Math.max(35, 65 - level * 3); this.remaining = this.duration;
      this.processed = 0; this.correct = 0; this.mistakes = 0; this.combo = 0; this.maxCombo = 0; this.score = 0;
      const random = seeded(level * 997 + Math.floor(Math.random() * 100000));
      this.queue = shuffle(Array.from({ length: this.total }, (_, i) => ({ district: i % 4, fragile: i > 3 && i % 5 === 0, packed: false, number: String(280001 + i), icon: ['📚', '🧸', '☕', '👟'][i % 4] })), random);
    }
    get current() { return this.queue[0]; }
    start() { if (this.status === 'ready') this.status = 'playing'; }
    pause() { if (this.status === 'playing') this.status = 'paused'; else if (this.status === 'paused') this.status = 'playing'; }
    pack() { if (this.status !== 'playing' || !this.current?.fragile || this.current.packed) return false; this.current.packed = true; return true; }
    sort(district) {
      if (this.status !== 'playing' || !this.current) return null;
      const parcel = this.current, good = parcel.district === district && (!parcel.fragile || parcel.packed);
      if (good) { this.combo++; this.correct++; this.maxCombo = Math.max(this.maxCombo, this.combo); this.score += 100 + Math.min(this.combo, 10) * 10 + (parcel.fragile ? 40 : 0); }
      else { this.mistakes++; this.combo = 0; }
      this.queue.shift(); this.processed++;
      if (this.mistakes >= 3) this.status = 'lost';
      else if (!this.queue.length) { this.status = 'won'; this.score += Math.ceil(this.remaining) * 10; }
      return { good, reason: parcel.district !== district ? '地址看错啦，这件没有送对区域' : '易碎件需要先加固包装' };
    }
    step(dt) { if (this.status !== 'playing') return; this.remaining = Math.max(0, this.remaining - dt); if (this.remaining === 0) this.status = 'lost'; }
  }

  const units = [
    { name: '弓', label: '弓手', color: 'green', damage: 13, cooldown: 0.72, description: '快速单体攻击' },
    { name: '火', label: '火术', color: 'orange', damage: 23, cooldown: 1.35, description: '灼烧同路邻近敌人' },
    { name: '冰', label: '冰术', color: 'blue', damage: 9, cooldown: 0.95, description: '减速敌人 1.6 秒' }
  ];
  class Tower {
    constructor(random = Math.random) {
      this.random = random; this.status = 'ready'; this.wave = 0; this.maxWaves = 6; this.coins = 70; this.health = 10; this.score = 0; this.kills = 0;
      this.board = Array(12).fill(null); this.selected = null; this.enemies = []; this.beams = []; this.spawned = 0; this.spawnTimer = 0; this.time = 0;
      [0, 0, 1, 2].forEach((type, i) => { this.board[i + 8] = { type, level: 1, cooldown: 0 }; });
    }
    recruit() {
      if (!['ready', 'playing'].includes(this.status)) return '先继续游戏再招募';
      const empty = this.board.map((u, i) => u ? -1 : i).filter(i => i >= 0);
      if (!empty.length) return '阵地已满，合成相同兵种腾出位置';
      if (this.coins < 15) return '铜钱不足，击败小妖可以赚取铜钱';
      const index = empty[Math.floor(this.random() * empty.length)];
      this.board[index] = { type: Math.floor(this.random() * 3), level: 1, cooldown: 0 }; this.coins -= 15; return index;
    }
    move(from, to) {
      if (!['ready', 'playing'].includes(this.status) || from === to || !this.board[from] || to < 0 || to >= 12) return false;
      const a = this.board[from], b = this.board[to];
      if (!b) { this.board[to] = a; this.board[from] = null; return 'move'; }
      if (a.type === b.type && a.level === b.level && a.level < 5) { b.level++; b.cooldown = 0; this.board[from] = null; this.score += 30 * b.level; return 'merge'; }
      return false;
    }
    start() {
      if (this.status !== 'ready') return false;
      this.wave++; this.spawned = 0; this.spawnTimer = 0.35; this.status = 'playing'; return true;
    }
    pause() { if (this.status === 'playing') this.status = 'paused'; else if (this.status === 'paused') this.status = 'playing'; }
    step(dt) {
      if (this.status !== 'playing') return;
      this.time += dt; this.beams = this.beams.map(b => ({ ...b, life: b.life - dt })).filter(b => b.life > 0);
      const count = 5 + this.wave * 2;
      this.spawnTimer -= dt;
      if (this.spawned < count && this.spawnTimer <= 0) {
        const lane = (this.spawned + this.wave) % 4, boss = this.wave >= 3 && this.spawned === count - 1;
        const hp = (24 + this.wave * 13) * (boss ? 2.4 : 1);
        this.enemies.push({ id: this.wave * 100 + this.spawned, lane, y: -0.06, hp, maxHp: hp, speed: (0.047 + this.wave * 0.006) * (boss ? 0.7 : 1), slow: 0, boss });
        this.spawned++; this.spawnTimer += Math.max(0.48, 1.1 - this.wave * 0.075);
      }
      this.enemies.forEach(e => { e.slow = Math.max(0, e.slow - dt); e.y += e.speed * (e.slow > 0 ? 0.42 : 1) * dt; });
      this.board.forEach((u, index) => {
        if (!u) return;
        u.cooldown -= dt;
        const target = this.enemies.filter(e => e.hp > 0 && e.lane === index % 4).sort((a, b) => b.y - a.y)[0];
        if (!target || u.cooldown > 0) return;
        const def = units[u.type], damage = def.damage * Math.pow(2, u.level - 1);
        target.hp -= damage; if (u.type === 2) target.slow = 1.6;
        if (u.type === 1) this.enemies.forEach(e => { if (e !== target && e.lane === target.lane && Math.abs(e.y - target.y) < 0.16) e.hp -= damage * 0.6; });
        this.beams.push({ lane: index % 4, y: target.y, type: u.type, life: 0.16 }); u.cooldown = def.cooldown;
      });
      this.enemies = this.enemies.filter(e => {
        if (e.hp <= 0) { this.coins += e.boss ? 14 : 6; this.kills++; this.score += e.boss ? 100 : 25; return false; }
        if (e.y >= 1) { this.health -= e.boss ? 2 : 1; return false; } return true;
      });
      if (this.health <= 0) { this.health = 0; this.status = 'lost'; }
      else if (this.spawned >= count && !this.enemies.length) {
        this.coins += 45; this.score += 100;
        if (this.wave >= this.maxWaves) { this.status = 'won'; this.score += this.health * 80; } else this.status = 'ready';
      }
    }
  }
  const api = { seeded, shuffle, Market, Fridge, Parcel, Tower, groceries, districts, units, rotate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MiniCore = api;
})(typeof globalThis === 'undefined' ? this : globalThis);

;
/* app.js */
(function () {
  'use strict';
  const UI = window.LittleDays, Core = window.MiniCore, game = document.body.dataset.game;
  const configs = {
    tower: { name: '字守长街', english: 'WORDS BECOME WARRIORS', subtitle: '一字一兵，一合一阶。用你的智慧，守住这条长街。', goal: '一合一阶，守住长街', rules: ['点击一个兵，再点击空位可移动。相同文字、相同等级可合成，最高五阶。', '每一列守一条路。弓手快射、火术溅射、冰术减速，记得照顾四路。', '招募花费 15 铜钱，击败小妖赚铜钱。守过 6 波即获胜，城防归零则失败。'], extra: '先在备战时调整阵容，再点击「迎战」。每波结束获得 45 铜钱。战斗中也可以招募和合成。快捷键：S 招募，空格迎战或暂停。', hud: [['wave', '来袭波次'], ['coins', '铜钱'], ['health', '城防'], ['score', '得分']] },
    market: { name: '夜市收摊整理', english: 'A TIDY END TO A LIVELY NIGHT', subtitle: '人间烟火散场，把每一份热闹放回它的位置。', goal: '同类归箱，收摊回家', rules: ['点击箱子选中顶部物品，再点击另一个箱子，每次移动一件。', '只能放进空箱，或顶部物品相同且未满的箱子，每箱最多 4 件。', '把所有物品分好类，每个非空箱都装满同一种物品，就能收摊。'], extra: '没有倒计时，可以慢慢想。遇到难题可撤销或查看一个可行移动提示。提示不保证步数最少；需要时多撤销几步。快捷键 Z 撤销、H 提示。', hud: [['level', '今日摊位'], ['moves', '移动次数'], ['completed', '整理完成'], ['time', '用时']] },
    fridge: { name: '冰箱补货', english: 'A LITTLE SPACE FOR FRESHNESS', subtitle: '转一转，挪一挪。把刚刚好的新鲜，装进小小冰箱。', goal: '让每份新鲜，都有位置', rules: ['先在购物篮选一份食材，再点击冰箱格子放入，以形状左上角定位。', '点击「旋转」调整形状，食材不能重叠、越界或占用冰块格。', '点击已放食材可以取回。把 8 份食材全部装好，即可通关。'], extra: '也支持从购物篮拖到冰箱。鼠标悬停显示放置预览；手机上点选食材、旋转后点击格子即可。快捷键 R 旋转、Z 撤销。', hud: [['level', '补货轮次'], ['packed', '收纳进度'], ['moves', '操作次数'], ['time', '用时']] },
    parcel: { name: '快递分拣', english: 'EVERY PARCEL HAS A PLACE', subtitle: '看清地址，稳稳送达。把每一份期待，送向正确的方向。', goal: '看准地址，一件不落', rules: ['点击「开始上班」启动倒计时，看清当前包裹的收件区域。', '点击对应分区送出包裹，连续正确会获得连击加分。', '标有易碎的包裹要先加固。处理完本批即获胜，失误 3 次或超时则失败。'], extra: '快捷键 1 / 2 / 3 / 4 对应青山、海港、松林、花田；空格加固当前易碎包裹；P 暂停。下一关会增加件数、缩短时间。', hud: [['time', '剩余时间'], ['processed', '处理进度'], ['combo', '当前连击'], ['mistakes', '失误次数']] }
  };
  const config = configs[game];
  const ruleHTML = `<ol class="rule-list">${config.rules.map(rule => `<li>${rule}</li>`).join('')}</ol>`;
  document.querySelector('#app').outerHTML = `
    <header class="site-header play-header wrap"><a class="back-link" href="../index.html">← 返回游戏铺</a><a class="brand" href="../index.html"><span class="brand-mark">✳</span> 小日子<span class="brand-sub">游戏铺</span></a><button class="icon-button sound-toggle" aria-label="开启音效">♪</button></header>
    <main class="wrap"><div class="game-heading"><div><p class="eyebrow">${config.english}</p><h1>${config.name}</h1><p class="game-subtitle">${config.subtitle}</p></div><span class="level-badge" id="level-badge"></span></div>
      <div class="play-layout"><section class="play-panel" aria-label="${config.name}游戏区"><div class="hud">${config.hud.map(([id, label]) => `<div class="hud-item"><span class="hud-label">${label}</span><strong class="hud-value" id="hud-${id}">0</strong></div>`).join('')}</div><div id="surface" class="game-surface ${game}-surface"></div><div class="progress-track"><div class="progress-fill" id="progress"></div></div><div class="game-toolbar" id="toolbar"></div></section>
      <aside class="side-column"><section class="side-panel"><p class="side-eyebrow">HOW TO PLAY</p><h2>${config.goal}</h2>${ruleHTML}<div class="side-actions"><button class="secondary-button" id="restart-button">↻ 重新开始</button><button class="secondary-button" id="help-button">? 玩法说明</button></div><div class="side-footer">${game === 'tower' || game === 'parcel' ? '离开页面或查看说明时，计时会暂停。' : '不用赶时间，慢慢来就很好。'}</div></section><section class="side-panel"><p class="side-eyebrow">YOUR LITTLE ACHIEVEMENTS</p><div class="best-line"><span>最高得分</span><strong id="best-score">0</strong></div><div class="best-line"><span>累计通关</span><strong id="wins-count">0 次</strong></div><p class="side-footer">每一点小进步，都值得被记住。</p></section></aside></div>
      <footer class="play-footer"><span>✳ 小日子游戏铺 · ${config.name}</span><span>鼠标与触屏均可玩 · 成绩自动保存</span></footer></main>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <dialog id="help-dialog"><button class="close-button" data-close-dialog aria-label="关闭说明">×</button><p class="eyebrow">A LITTLE GUIDE</p><h2>怎么玩？</h2>${ruleHTML}<p class="help-extra">${config.extra}</p><button class="primary-button wide" data-close-dialog>知道了，继续玩 →</button></dialog>
    <dialog id="result-dialog"><span class="result-symbol" aria-hidden="true">✳</span><h2></h2><p class="result-description"></p><strong class="result-score"></strong><div class="result-score-label">本 局 得 分</div><div class="result-buttons"><button class="primary-button wide" id="next-button">下一关 →</button><button class="secondary-button" data-close-dialog>留在这里看看</button><a class="back-link" style="justify-content:center;margin-top:8px" href="../index.html">← 回游戏铺，换个心情</a></div></dialog>`;

  const surface = document.querySelector('#surface'), toolbar = document.querySelector('#toolbar');
  const roman = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'];
  const goods = [{ name: '烤串', icon: '🍢' }, { name: '奶茶', icon: '🧋' }, { name: '面条', icon: '🍜' }, { name: '饺子', icon: '🥟' }, { name: '饭团', icon: '🍙' }, { name: '甜点', icon: '🧁' }];
  let model, level = game === 'tower' ? 1 : Math.max(1, UI.record(game).level), selected = null, hint = null, finished = false, signature = '', lastFrame = performance.now(), hudFrame = 0;
  const app = {
    get model() { return model; },
    restart(next = false) {
      if (next && game !== 'tower') level++;
      document.querySelector('#result-dialog').close();
      clearTimeout(UI.toastTimer);
      document.querySelector('#toast').classList.remove('visible');
      document.querySelector('#toast').textContent = '';
      selected = null; hint = null; finished = false; signature = '';
      model = game === 'tower' ? new Core.Tower() : game === 'market' ? new Core.Market(level) : game === 'fridge' ? new Core.Fridge(level) : new Core.Parcel(level);
      const count = UI.record(game);
      UI.stat('best-score', count.best); UI.stat('wins-count', `${count.wins} 次`);
      UI.stat('level-badge', game === 'tower' ? '六波守城挑战' : `第 ${String(level).padStart(2, '0')} 关`);
      render(); updateHUD();
    },
    key(event) {
      const key = event.key.toLowerCase();
      if (game === 'tower') {
        if (key === 's') recruit();
        if (event.code === 'Space') { event.preventDefault(); towerStart(); }
      } else if (game === 'market') {
        if (key === 'z') undo();
        if (key === 'h') showHint();
      } else if (game === 'fridge') {
        if (key === 'r') rotatePiece();
        if (key === 'z') undo();
      } else if (game === 'parcel') {
        if (/^[1-4]$/.test(key)) sortParcel(Number(key) - 1);
        if (event.code === 'Space') { event.preventDefault(); packParcel(); }
        if (key === 'p') { model.pause(); renderParcel(); }
      }
    }
  };
  window.gameApp = app;

  function updateHUD() {
    const time = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
    if (game === 'tower') {
      UI.stat('hud-wave', `${model.wave} / 6`); UI.stat('hud-coins', model.coins); UI.stat('hud-health', `${model.health} / 10`); UI.stat('hud-score', model.score);
      document.querySelector('#progress').style.width = `${model.wave / 6 * 100}%`;
    } else if (game === 'market') {
      UI.stat('hud-level', String(level).padStart(2, '0')); UI.stat('hud-moves', model.moves); UI.stat('hud-completed', `${model.completed} / ${model.kinds}`); UI.stat('hud-time', time(model.elapsed));
      document.querySelector('#progress').style.width = `${model.completed / model.kinds * 100}%`;
    } else if (game === 'fridge') {
      UI.stat('hud-level', String(level).padStart(2, '0')); UI.stat('hud-packed', `${Object.keys(model.placed).length} / 8`); UI.stat('hud-moves', model.moves); UI.stat('hud-time', time(model.elapsed));
      document.querySelector('#progress').style.width = `${Object.keys(model.placed).length / 8 * 100}%`;
    } else {
      UI.stat('hud-time', `${Math.ceil(model.remaining)}s`); UI.stat('hud-processed', `${model.processed} / ${model.total}`); UI.stat('hud-combo', `${model.combo} 连`); UI.stat('hud-mistakes', `${model.mistakes} / 3`);
      document.querySelector('#hud-time').classList.toggle('danger', model.remaining <= 10);
      document.querySelector('#progress').style.width = `${model.remaining / model.duration * 100}%`;
    }
  }

  function render() {
    if (game === 'market') renderMarket();
    else if (game === 'fridge') renderFridge();
    else if (game === 'parcel') renderParcel();
    else renderTower();
    updateHUD();
  }
  function finish() {
    if (finished || !['won', 'lost'].includes(model.status)) return;
    finished = true;
    const won = model.status === 'won';
    if (won) {
      UI.save(game, model.score, game === 'tower' ? 1 : level + 1);
      UI.stat('best-score', UI.record(game).best); UI.stat('wins-count', `${UI.record(game).wins} 次`);
    }
    const messages = {
      tower: won ? ['长街无恙，灯火常明', `守过了全部 6 波，击退 ${model.kills} 只小妖。城防还剩 ${model.health} 点，好一位守城人！`] : ['长街暂时失守了', `守到了第 ${model.wave} 波。下次试试让四路都有守军，再合成更高阶的兵种。`],
      market: ['收摊啦，辛苦了', `用 ${model.moves} 步把所有物品整理妥当。带着整整齐齐的好心情回家吧。`],
      fridge: ['新鲜，刚刚好装下', `8 份食材全部归位，用了 ${model.moves} 次操作。下一轮的空间会更紧凑一点。`],
      parcel: won ? ['今日金牌分拣员', `本批 ${model.total} 件全部处理，正确 ${model.correct} 件，最高 ${model.maxCombo} 连击。每一份期待都有了去处。`] : ['休息一下，再出发', `${model.remaining <= 0 ? '时间到了' : '本批已失误 3 次'}。正确送出 ${model.correct} 件，下次记得看地址，易碎件先加固。`]
    };
    const [title, text] = messages[game];
    UI.result({ won, title, text, score: model.score, next: won && game !== 'tower' });
  }

  function renderMarket() {
    surface.innerHTML = `<div class="market-sign">深夜十一点 · 收摊时间</div><div class="crates-grid ${model.boxes.length === 6 ? 'six' : ''}">${model.boxes.map((box, i) => {
      const done = box.length === 4 && box.every(item => item === box[0]);
      return `<button class="crate-button ${selected === i ? 'selected' : ''} ${done ? 'crate-done' : ''} ${hint && (hint.from === i || hint.to === i) ? 'hint-target' : ''}" data-crate="${i}" aria-label="${i + 1} 号箱，${box.length} 件${box.length ? `，顶部${goods[box.at(-1)].name}` : '，空箱'}" aria-pressed="${selected === i}"><span class="crate-stack">${box.map(type => `<span class="crate-item kind-${type}"><span>${goods[type].icon}</span><small>${goods[type].name}</small></span>`).join('')}</span><span class="crate-label">${String(i + 1).padStart(2, '0')} 号箱 ${done ? '✓' : `${box.length}/4`}</span></button>`;
    }).join('')}</div><div class="market-legend">${goods.slice(0, model.kinds).map(g => `<span>${g.icon} ${g.name}</span>`).join('')}</div>`;
    toolbar.innerHTML = `<span class="toolbar-hint">${selected === null ? '点选箱子 → 再点目标箱子' : `已选 ${selected + 1} 号箱 · 再点相同顶部或空箱`}</span><div class="tool-group"><button class="small-button" data-action="undo" ${model.history.length ? '' : 'disabled'}>↶ 撤销</button><button class="small-button" data-action="hint">✧ 提示</button></div>`;
  }
  function clickCrate(index) {
    if (model.status !== 'playing') return;
    hint = null;
    if (selected === null) { if (!model.boxes[index].length) return UI.toast('先选择一个有物品的箱子'); selected = index; UI.sound(); }
    else if (selected === index) selected = null;
    else if (model.move(selected, index)) { selected = null; UI.sound('good'); }
    else { UI.toast('只能放在相同物品上，或有空位的空箱里', true); selected = model.boxes[index].length ? index : selected; }
    render(); finish();
  }
  function undo() {
    if (!model.undo?.()) return UI.toast('暂时没有可以撤销的操作');
    selected = null; hint = null; render(); UI.sound();
  }
  function showHint() {
    hint = model.hint();
    if (hint) { selected = hint.from; UI.toast(`试试把 ${hint.from + 1} 号箱顶部的${goods[model.boxes[hint.from].at(-1)].name}放到 ${hint.to + 1} 号箱`); }
    else UI.toast('暂时没有有效移动，可以撤销几步再试试', true);
    render();
  }

  function pieceHTML(piece, small = false) {
    const width = Math.max(...piece.cells.map(c => c[0])) + 1, height = Math.max(...piece.cells.map(c => c[1])) + 1;
    return `<span class="piece-preview" style="grid-template-columns:repeat(${width},${small ? 12 : 14}px)">${Array.from({ length: width * height }, (_, n) => `<span class="piece-pixel ${piece.cells.some(([x, y]) => y * width + x === n) ? piece.color : 'hollow'}"${small ? ' style="width:12px;height:12px"' : ''}></span>`).join('')}</span>`;
  }
  function renderFridge() {
    surface.innerHTML = `<div class="fridge-stage"><div><div class="fridge-frame"><div class="fridge-top-label"><span>FRESH LITTLE THINGS</span><span>4°C</span></div><div class="fridge-grid" role="group" aria-label="冰箱 5 行 6 列格子">${model.board.map((id, i) => {
      const piece = id !== null && id >= 0 ? model.pieces[id] : null;
      const first = piece && model.board.indexOf(id) === i;
      return `<button class="fridge-cell ${id === -1 ? 'blocked' : piece ? `occupied ${piece.color}` : ''}" data-cell="${i}" aria-label="第 ${Math.floor(i / 6) + 1} 行第 ${i % 6 + 1} 列，${id === -1 ? '冰块不可放置' : piece ? piece.name + '，点击取回' : '空位'}">${id === -1 ? '❄' : first ? piece.icon : ''}</button>`;
    }).join('')}</div></div><div class="fridge-selection"><span id="selected-piece">${selected === null ? '先从购物篮选一份食材' : `${model.pieces[selected].icon} 已选：${model.pieces[selected].name}`}</span><button class="rotate-button" data-action="rotate" ${selected === null ? 'disabled' : ''}>↻ 旋转 <span class="desktop-tip">R</span></button></div><p class="fridge-instructions">点击空格放入 · 点击食材取回 · ❄ 冰块占位<br>形状以左上角为起点，也可以拖动食材放入。</p></div><div class="grocery-tray"><p class="tray-caption">购物篮 / ${8 - Object.keys(model.placed).length} 份待收纳</p>${model.pieces.map((piece, id) => `<button class="grocery ${model.placed[id] ? 'placed' : ''} ${selected === id ? 'selected' : ''}" data-piece="${id}" draggable="${!model.placed[id]}" ${model.placed[id] ? 'disabled' : ''} aria-label="选择${piece.name}，占 ${piece.cells.length} 格" aria-pressed="${selected === id}">${pieceHTML(piece)}<span class="grocery-name">${piece.icon} ${piece.name}</span></button>`).join('')}</div></div>`;
    toolbar.innerHTML = `<span class="toolbar-hint">腾挪一下，总有刚刚好的位置。</span><button class="small-button" data-action="undo" ${model.history.length ? '' : 'disabled'}>↶ 撤销</button>`;
  }
  function clickFridge(index) {
    if (model.status !== 'playing') return;
    const id = model.board[index];
    if (id !== null && id >= 0) { model.remove(id); selected = id; UI.sound(); }
    else if (id === -1) return UI.toast('这里是冰块，留给它一点位置吧', true);
    else if (selected === null) return UI.toast('先从购物篮里选一份食材');
    else if (model.place(selected, index % 6, Math.floor(index / 6))) { selected = null; UI.sound('good'); }
    else return UI.toast('这里放不下，试试旋转或换个位置', true);
    render(); finish();
  }
  function rotatePiece() {
    if (selected === null) return UI.toast('先选择一份购物篮里的食材');
    model.rotate(selected); render(); UI.sound();
  }
  function clearGhost() { surface.querySelectorAll('.ghost-good,.ghost-bad').forEach(el => el.classList.remove('ghost-good', 'ghost-bad')); }
  function ghost(index) {
    clearGhost();
    if (selected === null || model.status !== 'playing') return;
    const good = model.canPlace(selected, index % 6, Math.floor(index / 6));
    model.indices(selected, index % 6, Math.floor(index / 6)).forEach(([x, y]) => { if (x >= 0 && x < 6 && y >= 0 && y < 5) surface.querySelector(`[data-cell="${y * 6 + x}"]`).classList.add(good ? 'ghost-good' : 'ghost-bad'); });
  }

  function renderParcel() {
    const parcel = model.current, district = parcel ? Core.districts[parcel.district] : null;
    surface.innerHTML = `<div class="station-label"><span>小日子快递 · 分拣站</span><span>本批 ${model.total} 件</span></div><div class="conveyor">${parcel ? `<div class="shipping-box"><div class="shipping-label"><div class="shipping-to">收件区域 / DESTINATION</div><div class="shipping-district">${district.name}</div><div class="shipping-street">${district.street}</div><i class="barcode"></i><div class="shipping-number">LD ${parcel.number} · ${parcel.icon}</div></div>${parcel.fragile ? `<span class="shipping-fragile ${parcel.packed ? 'packed' : ''}">${parcel.packed ? '✓ 已加固<br>放心送达' : '⚠ 易碎<br>先加固包装'}</span>` : ''}</div><div class="next-parcels" aria-label="待处理包裹">${model.queue.slice(1, 4).map(p => `<div class="queue-box"><span>${Core.districts[p.district].short}</span></div>`).join('')}</div>` : '<div class="empty-message">本批包裹已处理</div>'}</div>
      <div class="parcel-controls"><button class="pack-button" data-action="pack" ${model.status !== 'playing' || !parcel?.fragile || parcel.packed ? 'disabled' : ''}>${parcel?.packed ? '✓ 已加固' : '▧ 加固包装'} <span class="desktop-tip">空格</span></button><span class="combo-label">${model.combo >= 3 ? `✦ ${model.combo} 连击，手感火热！` : '看清地址，稳稳送达'}</span></div><div class="bins-grid">${Core.districts.map((d, i) => `<button class="sort-bin" data-bin="${i}" ${model.status !== 'playing' ? 'disabled' : ''} aria-label="${i + 1} ${d.name}分拣口"><span class="bin-icon" aria-hidden="true">${d.icon}</span><span class="bin-name">${d.name}</span><br><span class="keycap">${i + 1}</span></button>`).join('')}</div>
      ${['ready', 'paused'].includes(model.status) ? `<div class="parcel-overlay"><span class="overlay-icon">▧</span><h2>${model.status === 'ready' ? '准备好上班了吗？' : '喝口水，歇一歇'}</h2><p>${model.status === 'ready' ? `${model.duration} 秒内处理 ${model.total} 件包裹<br>看准区域，易碎件记得先加固。` : '计时已暂停，包裹会等你回来。'}</p><button class="primary-button" data-action="parcel-start">${model.status === 'ready' ? '开始上班 →' : '继续分拣 →'}</button></div>` : ''}`;
    toolbar.innerHTML = `<span class="toolbar-hint">当前得分 <strong>${model.score}</strong> · 最高 ${model.maxCombo} 连击</span><button class="small-button" data-action="parcel-pause" ${['ready', 'won', 'lost'].includes(model.status) ? 'disabled' : ''}>${model.status === 'paused' ? '▶ 继续' : 'Ⅱ 暂停'}</button>`;
  }
  function packParcel() { if (model.pack()) { UI.toast('已加固，现在可以送往对应分区'); renderParcel(); } }
  function sortParcel(index) {
    const result = model.sort(index);
    if (!result) return;
    if (result.good) UI.sound('good'); else UI.toast(result.reason, true);
    render(); finish();
  }

  function renderTower() {
    if (!surface.querySelector('#battlefield')) {
      surface.innerHTML = `<div class="status-strip" id="tower-status"></div><div class="tower-field"><canvas id="battlefield" role="img" aria-label="四路小妖从上方来袭，守军从下方攻击"></canvas><div id="tower-overlay"></div></div><div class="city-wall"></div><div class="tower-board" id="tower-board"></div><div class="tower-command"><button class="recruit-button" data-action="recruit">＋ 招募一兵 <small>15 铜钱</small></button><button class="primary-button" data-action="tower-start" id="wave-button"></button></div><div class="tower-legend"><span><strong>弓</strong>快速单攻</span><span><strong>火</strong>邻近溅射</span><span><strong>冰</strong>减速控场</span></div>`;
      toolbar.innerHTML = `<span class="toolbar-hint">点选兵种 → 空位移动 / 同字同阶合成</span><button class="pause-button" data-action="tower-pause" id="tower-pause" aria-label="暂停战斗">Ⅱ</button>`;
    }
    const boardSignature = model.board.map(u => u ? `${u.type}:${u.level}` : '-').join('|') + selected + model.status + model.wave;
    if (signature !== boardSignature) {
      signature = boardSignature;
      document.querySelector('#tower-board').innerHTML = model.board.map((unit, index) => `<button class="tower-cell ${unit ? `has-unit type-${unit.type}` : ''} ${selected === index ? 'selected' : ''}" data-tower="${index}" ${['paused', 'won', 'lost'].includes(model.status) ? 'disabled' : ''} aria-pressed="${selected === index}" aria-label="第 ${index % 4 + 1} 路第 ${Math.floor(index / 4) + 1} 排，${unit ? `${Core.units[unit.type].label}${unit.level}阶` : '空位'}">${unit ? `<span class="unit-word">${Core.units[unit.type].name}</span><span class="unit-level">${roman[unit.level - 1]} 阶<br>${'·'.repeat(unit.level)}</span>` : ''}</button>`).join('');
      const overlay = document.querySelector('#tower-overlay');
      overlay.className = ['ready', 'paused'].includes(model.status) ? 'tower-overlay' : '';
      overlay.innerHTML = model.status === 'ready' ? `<h2>${model.wave ? `第 ${model.wave} 波，守住了` : '一字一兵，守护长街'}</h2><p>${model.wave ? '获得 45 铜钱，调整阵容迎接下一波。' : '先招募守军，让四条路都有兵种。<br>准备好了，就点击下方「迎战」。'}</p>` : model.status === 'paused' ? '<h2>长街小憩</h2><p>战斗已暂停</p><button class="primary-button" data-action="tower-start">继续守城 →</button>' : '';
    }
    UI.stat('tower-status', model.status === 'playing' ? `第 ${model.wave} 波来袭 · 已出现 ${model.spawned}/${5 + model.wave * 2} 只小妖` : model.status === 'ready' ? '备战时间 · 可以自由招募、移动、合成' : model.status === 'paused' ? '暂停中 · 小妖也在休息' : model.status === 'won' ? '长街已守住 · 灯火常明' : '城防耗尽 · 再整旗鼓');
    const waveButton = document.querySelector('#wave-button');
    waveButton.textContent = model.status === 'ready' ? `迎战第 ${model.wave + 1} 波 →` : model.status === 'paused' ? '继续战斗 →' : model.status === 'playing' ? 'Ⅱ 暂停战斗' : '本局已结束';
    waveButton.disabled = ['won', 'lost'].includes(model.status);
    surface.querySelector('[data-action="recruit"]').disabled = !['ready', 'playing'].includes(model.status) || model.coins < 15 || model.board.every(Boolean);
    const pause = document.querySelector('#tower-pause');
    pause.disabled = !['playing', 'paused'].includes(model.status); pause.textContent = model.status === 'paused' ? '▶' : 'Ⅱ'; pause.setAttribute('aria-label', model.status === 'paused' ? '继续战斗' : '暂停战斗');
    drawBattle();
  }
  function drawBattle() {
    const canvas = document.querySelector('#battlefield');
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(bounds.width * dpr) || canvas.height !== Math.round(bounds.height * dpr)) { canvas.width = Math.round(bounds.width * dpr); canvas.height = Math.round(bounds.height * dpr); }
    const ctx = canvas.getContext('2d'), w = bounds.width, h = bounds.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#acb89a'; ctx.font = '9px sans-serif'; ctx.fillText(`第 ${i + 1} 路`, w / 4 * (i + 0.5), 15); }
    model.beams.forEach(beam => {
      const x = w / 4 * (beam.lane + 0.5), y = 28 + beam.y * (h - 46);
      ctx.strokeStyle = ['#729252', '#d59354', '#81b5bd'][beam.type]; ctx.globalAlpha = Math.min(1, beam.life * 5); ctx.lineWidth = beam.type === 1 ? 5 : 2;
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x, y); ctx.stroke(); ctx.globalAlpha = 1;
    });
    model.enemies.forEach(enemy => {
      const x = w / 4 * (enemy.lane + 0.5), y = 30 + enemy.y * (h - 52), size = enemy.boss ? 35 : 28;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(model.time * 4 + enemy.id) * .07);
      ctx.fillStyle = enemy.slow > 0 ? '#b5cbd0' : enemy.boss ? '#997563' : '#aba18a';
      ctx.beginPath(); ctx.roundRect(-size / 2, -size / 2, size, size, 7); ctx.fill();
      ctx.fillStyle = '#fffbec'; ctx.font = `${enemy.boss ? 22 : 18}px "SimSun",serif`; ctx.fillText(enemy.boss ? '魔' : '妖', 0, 1);
      ctx.fillStyle = '#d4d8c6'; ctx.fillRect(-size / 2, -size / 2 - 7, size, 3);
      ctx.fillStyle = enemy.hp / enemy.maxHp > .4 ? '#829966' : '#c48662'; ctx.fillRect(-size / 2, -size / 2 - 7, size * Math.max(0, enemy.hp / enemy.maxHp), 3); ctx.restore();
    });
    if (!model.enemies.length && model.status === 'playing') { ctx.fillStyle = '#9fac8e'; ctx.font = '12px sans-serif'; ctx.fillText('小妖正在赶来的路上…', w / 2, h / 2); }
  }
  function recruit() {
    const result = model.recruit();
    if (typeof result === 'string') UI.toast(result, true); else { UI.sound(); selected = result; }
    render();
  }
  function towerStart() {
    if (model.status === 'ready') { model.start(); selected = null; UI.sound(); }
    else model.pause();
    render();
  }
  function clickTower(index) {
    if (!['ready', 'playing'].includes(model.status)) return;
    if (selected === null) { if (model.board[index]) { selected = index; UI.sound(); } }
    else if (selected === index) selected = null;
    else {
      const result = model.move(selected, index);
      if (result) { UI.sound(result === 'merge' ? 'good' : 'tap'); if (result === 'merge') UI.toast(`合成成功！${Core.units[model.board[index].type].name}升至${model.board[index].level}阶`); selected = null; }
      else { if (model.board[index]) selected = index; UI.toast('相同文字、相同等级才能合成，或移到空位', true); }
    }
    render();
  }

  function action(name) {
    if (name === 'undo') undo();
    else if (name === 'hint') showHint();
    else if (name === 'rotate') rotatePiece();
    else if (name === 'pack') packParcel();
    else if (name === 'recruit') recruit();
    else if (name === 'tower-start') towerStart();
    else if (name === 'tower-pause') { model.pause(); render(); }
    else if (name === 'parcel-start') { if (model.status === 'ready') model.start(); else model.pause(); render(); UI.sound(); }
    else if (name === 'parcel-pause') { model.pause(); render(); }
  }
  document.querySelector('.play-panel').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.action) action(button.dataset.action);
    else if (button.dataset.crate !== undefined) clickCrate(Number(button.dataset.crate));
    else if (button.dataset.cell !== undefined) clickFridge(Number(button.dataset.cell));
    else if (button.dataset.piece !== undefined) { selected = Number(button.dataset.piece); render(); UI.sound(); }
    else if (button.dataset.bin !== undefined) sortParcel(Number(button.dataset.bin));
    else if (button.dataset.tower !== undefined) clickTower(Number(button.dataset.tower));
  });
  surface.addEventListener('mouseover', event => { const cell = event.target.closest('[data-cell]'); if (cell) ghost(Number(cell.dataset.cell)); });
  surface.addEventListener('focusin', event => { const cell = event.target.closest('[data-cell]'); if (cell) ghost(Number(cell.dataset.cell)); });
  surface.addEventListener('mouseleave', clearGhost);
  surface.addEventListener('dragstart', event => {
    const piece = event.target.closest('[data-piece]'); if (!piece || model.placed[piece.dataset.piece]) return;
    selected = Number(piece.dataset.piece); event.dataTransfer.setData('text/plain', String(selected)); event.dataTransfer.effectAllowed = 'move';
  });
  surface.addEventListener('dragover', event => { const cell = event.target.closest('[data-cell]'); if (cell) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; ghost(Number(cell.dataset.cell)); } });
  surface.addEventListener('drop', event => {
    const cell = event.target.closest('[data-cell]'); if (!cell) return;
    event.preventDefault(); const raw = event.dataTransfer.getData('text/plain'); if (!raw) return;
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 0 || id >= model.pieces.length || model.placed[id]) return;
    selected = id;
    const index = Number(cell.dataset.cell);
    if (model.place(id, index % 6, Math.floor(index / 6))) { selected = null; UI.sound('good'); render(); finish(); }
    else { UI.toast('这里放不下，试试旋转或换个位置', true); render(); }
    clearGhost();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && ['tower', 'parcel'].includes(game) && model.status === 'playing') { model.pause(); render(); }
    lastFrame = performance.now();
  });
  function frame(now) {
    const dt = Math.min(.1, Math.max(0, (now - lastFrame) / 1000)); lastFrame = now;
    if (!document.hidden && !document.querySelector('dialog[open]')) {
      if (['tower', 'parcel'].includes(game)) {
        const previous = model.status; model.step(dt);
        if (game === 'tower') drawBattle();
        if (previous !== model.status) render();
        if (now - hudFrame > 100) { if (game === 'tower') renderTower(); updateHUD(); hudFrame = now; }
        finish();
      } else if (model.status === 'playing') { model.elapsed += dt; if (now - hudFrame > 250) { updateHUD(); hudFrame = now; } }
    }
    requestAnimationFrame(frame);
  }
  app.restart(); requestAnimationFrame(frame);
})();
