/* core.js */
(function (root) {
  'use strict';
  const VERSION = 3;
  const TYPES = {
    fire: { words: ['火', '炎', '焱'], name: '赤焰字灵', role: '范围灼烧 · 以火破阵', description: '火光所及，墨兽俱伤。攻击会溅射周围敌人，最擅长应对成群墨兽。', damage: 16, cooldown: 1.05, range: 2.65, color: '#b8704e' },
    wood: { words: ['木', '林', '森'], name: '青木字灵', role: '疾射染毒 · 生生不息', description: '枝叶如箭，连绵不绝。快速攻击并施加持续 3 秒的青毒，同系毒素取最强值。', damage: 6, cooldown: .42, range: 2.5, color: '#6d8a53' },
    water: { words: ['水', '沝', '淼'], name: '流泉字灵', role: '凝流减速 · 以柔克刚', description: '一滴成泉，流水留敌。攻击令敌人减速 42%，持续 2 秒，为队友争取输出时间。', damage: 9, cooldown: .9, range: 2.6, color: '#6a93a0' },
    earth: { words: ['土', '圭', '垚'], name: '镇岳字灵', role: '震地破甲 · 镇守一方', description: '震击短暂眩晕目标，并破除甲兽护甲 3 秒。首领受到的眩晕时间减半。', damage: 26, cooldown: 1.35, range: 2.5, color: '#a58a59' },
    metal: { words: ['金', '鍂', '鑫'], name: '流金字灵', role: '连锁穿甲 · 锐不可当', description: '金光在最多 3 个相邻敌人间弹射，后续伤害逐次衰减至 65%。攻击无视护甲。', damage: 24, cooldown: 1.3, range: 2.9, color: '#a69245' }
  };
  const MODES = {
    classic: { name: '山河守城', word: '守', waves: 12, bossEvery: 6, health: 20, ink: 80, scale: 1, description: '十二波完整守城，循序搭出你的五行字阵。', tag: '经典 · 约 6 分钟' },
    quick: { name: '六波速战', word: '疾', waves: 6, bossEvery: 3, health: 15, ink: 120, scale: 1.15, description: '开局多给灵墨，三波就有首领，六波决胜。', tag: '快节奏 · 约 3 分钟' },
    endless: { name: '无尽试炼', word: '无', waves: 0, bossEvery: 5, health: 20, ink: 90, scale: 1, description: '墨潮永不止息，每五波一位首领，挑战最高波次。', tag: '生存 · 越战越强' },
    daily: { name: '每日一阵', word: '日', waves: 10, bossEvery: 5, health: 15, ink: 100, scale: 1.12, description: '每天同一份开局与天候，迎战十波墨潮。', tag: '每日更新 · 同日同起局' },
    bossrush: { name: '百魁试剑', word: '魁', waves: 8, bossEvery: 1, health: 18, ink: 120, scale: 1, description: '八轮首领连战，第四、八轮双魁登场。', tag: '首领连战 · 集火破局' },
    draft: { name: '择字成章', word: '择', waves: 10, bossEvery: 5, health: 18, ink: 100, scale: 1.15, description: '每次召唤三选一，自选字灵组出心中的阵容。', tag: '自选召唤 · 阵容构筑' }
  };
  const DIFFICULTIES = {
    easy: { name: '休闲', health: 5, ink: 40, enemyHealth: .68, enemySpeed: .9, count: .85, reward: 1.1, score: .7, description: '敌人更弱，城防与灵墨更充足，轻松试阵。' },
    normal: { name: '标准', health: 0, ink: 0, enemyHealth: 1, enemySpeed: 1, count: 1, reward: 1, score: 1, description: '原有难度，适合熟悉五行配合。' },
    hard: { name: '困难', health: -3, ink: 0, enemyHealth: 2.4, enemySpeed: 1.12, count: 1.12, reward: 1, score: 1.6, description: '敌人生命 ×2.4，速度与数量增加，战绩计分 ×1.6。' },
    nightmare: { name: '噩梦', health: -6, ink: -10, enemyHealth: 3.5, enemySpeed: 1.24, count: 1.25, reward: .95, score: 2.4, description: '敌人生命 ×3.5，城防与灵墨更紧张，战绩计分 ×2.4。' }
  };
  const UPGRADES = {
    training: { name: '研习兵法', word: '兵', base: 80, step: 60, max: 5, description: '每级全体字灵伤害 +8%，最高五级。' },
    walls: { name: '修筑城垣', word: '城', base: 60, step: 50, max: 3, description: '每级城防上限 +3，并立即恢复 3 城防。' },
    focus: { name: '修缮文台', word: '文', base: 50, step: 40, max: 3, description: '每级文气上限 +15，并立即恢复 15 文气。' }
  };
  const WEATHER = {
    calm: { name: '晴和', word: '晴', description: '风平浪静，各系字灵正常发挥。' },
    rain: { name: '春雨', word: '雨', description: '水系减速额外 8%，木系毒伤提升 20%。' },
    wind: { name: '疾风', word: '风', description: '墨兽移动速度提升 18%，注意减速与眩晕。' },
    ember: { name: '燎原', word: '燎', description: '火系伤害提升 25%，火借风势。' },
    mist: { name: '山岚', word: '岚', description: '所有字灵射程减少 0.4 格，主动法术不受影响。' }
  };
  const SPELLS = {
    flame: { name: '天火', word: '焚', cost: 45, cooldown: 16, targeted: true, description: '点击战场，对 1.75 格内的敌人造成 120 + 波次×32 伤害，无视护甲。' },
    freeze: { name: '凝时', word: '凝', cost: 35, cooldown: 20, targeted: false, description: '冻结场上所有墨兽 3.5 秒，首领持续时间减半。' },
    mend: { name: '回春', word: '愈', cost: 60, cooldown: 30, targeted: false, description: '立即恢复 5 点城防，满城防时不会消耗文气。' }
  };
  const ENEMIES = {
    normal: { hp: 30, speed: 1.05, word: '墨', reward: 4, breach: 1, name: '墨团', description: '普通墨兽，成群前来。火系群攻最有效。' },
    swift: { hp: 22, speed: 1.65, word: '影', reward: 4, breach: 1, name: '疾影', description: '生命较少、移动很快，水系和凝时可留住它。' },
    tank: { hp: 82, speed: .83, word: '魇', reward: 7, breach: 2, name: '重魇', description: '生命厚重，入城扣除 2 点城防。' },
    armored: { hp: 65, speed: .95, word: '甲', reward: 7, breach: 2, armor: .45, name: '铁甲兽', description: '护甲减免 45% 普通伤害。土系破甲，金系、青毒和天火可无视护甲。' },
    healer: { hp: 72, speed: .88, word: '巫', reward: 8, breach: 2, name: '墨巫', description: '每 3 秒治疗附近墨兽，首领获得的治疗较少。集火或冻结它。' },
    splitter: { hp: 58, speed: 1.05, word: '孽', reward: 6, breach: 1, name: '分裂孽', description: '被击败后化成两只小墨子，群攻与弹射可收拾残局。' },
    child: { hp: 14, speed: 1.4, word: '子', reward: 1, breach: 1, name: '小墨子', description: '分裂而来的小兽，生命少但速度较快。' },
    boss: { hp: 145, speed: .68, word: '魁', reward: 40, breach: 5, name: '墨魁', description: '首领生命极高、控制时间减半，入城扣除 5 点城防。' }
  };
  const TARGETS = { front: '最靠近城门', weak: '剩余生命最少', strong: '最大生命最高' };
  const SYNERGIES = [
    { key: 'triad', name: '三才共鸣', description: '三种不同字灵：全体伤害 +8%', need: 3 },
    { key: 'cycle', name: '五行轮转', description: '五种字灵齐聚：全体攻速 +12%', need: 5 },
    { key: 'fire', name: '烈火燎原', description: '三个火系字灵：溅射半径 +0.35 格', need: 3 },
    { key: 'wood', name: '青林成荫', description: '三个木系字灵：青毒伤害 +35%', need: 3 },
    { key: 'water', name: '百川归海', description: '三个水系字灵：减速 +8%，持续 +1 秒', need: 3 },
    { key: 'earth', name: '群山镇岳', description: '两个土系字灵：眩晕时间 +0.2 秒', need: 2 },
    { key: 'metal', name: '金石相鸣', description: '两个金系字灵：额外弹射一次', need: 2 }
  ];
  const PADS = [[0, 0], [2, 0], [4, 0], [6, 0], [1, 3], [3, 3], [5, 3], [7, 1], [0, 5], [1, 6], [3, 6], [5, 6], [7, 4], [9, 4], [7, 7], [9, 6]].map(([x, y]) => ({ x: x + .5, y: y + .5 }));
  const PATH = [{ x: -.5, y: 1.5 }, { x: 2.5, y: 1.5 }, { x: 2.5, y: 5.5 }, { x: 6.5, y: 5.5 }, { x: 6.5, y: 2.5 }, { x: 8.5, y: 2.5 }, { x: 8.5, y: 7.5 }, { x: 10.2, y: 7.5 }];
  const SEGMENTS = PATH.slice(1).map((p, i) => Math.hypot(p.x - PATH[i].x, p.y - PATH[i].y));
  const PATH_LENGTH = SEGMENTS.reduce((a, b) => a + b, 0);
  const BLESSINGS = {
    power: { name: '笔锋如刃', word: '锋', description: '所有字灵伤害提升 22%' },
    haste: { name: '行云流水', word: '疾', description: '所有字灵攻击速度提升 20%' },
    range: { name: '目及山河', word: '远', description: '所有字灵射程增加 0.55 格' },
    fortune: { name: '落笔生金', word: '墨', description: '立即获得 50 灵墨，召唤便宜 4 墨' },
    renewal: { name: '枯木逢春', word: '生', description: '恢复 7 点城防，之后每波恢复 2 点' },
    frost: { name: '寒泉映月', word: '寒', description: '水系减速强化至 62%，持续增加 1 秒' },
    flow: { name: '文思泉涌', word: '思', description: '战斗中每秒额外恢复 1 点文气' },
    bounty: { name: '点墨成金', word: '财', description: '每次击杀额外获得 1 灵墨' },
    craft: { name: '妙笔生花', word: '巧', description: '每次合成额外获得 5 灵墨和 4 文气' }
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function dailySeed(day) { let seed = 2166136261; for (const c of day) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619); return seed >>> 0; }
  function positionAt(d) {
    let rest = Math.max(0, d);
    for (let i = 0; i < SEGMENTS.length; i++) {
      if (rest <= SEGMENTS[i]) {
        const t = rest / SEGMENTS[i];
        return { x: PATH[i].x + (PATH[i + 1].x - PATH[i].x) * t, y: PATH[i].y + (PATH[i + 1].y - PATH[i].y) * t };
      }
      rest -= SEGMENTS[i];
    }
    return { ...PATH[PATH.length - 1] };
  }
  class Game {
    constructor(seed = Date.now(), options = {}) {
      this.mode = has(MODES, options.mode) ? options.mode : 'classic';
      this.difficulty = has(DIFFICULTIES, options.difficulty) ? options.difficulty : 'normal';
      this.rules = { weather: options.rules?.weather !== false, spells: options.rules?.spells !== false };
      this.upgrades = { training: 0, walls: 0, focus: 0 };
      this.day = this.mode === 'daily' ? options.day || dateKey() : '';
      this.seed = (this.mode === 'daily' ? dailySeed(this.day) : seed) >>> 0; this.initialSeed = this.seed;
      this.runId = options.runId || `run-${this.mode}-${this.initialSeed.toString(16)}`;
      this.status = 'ready'; this.wave = 0; this.health = this.maxHealth; this.ink = Math.max(20, MODES[this.mode].ink + DIFFICULTIES[this.difficulty].ink);
      this.energy = 50; this.spellCooldowns = { flame: 0, freeze: 0, mend: 0 }; this.casts = 0; this.waveEvent = 'calm';
      this.score = 0; this.kills = 0; this.merges = 0; this.elapsed = 0;
      this.board = Array(PADS.length).fill(null); this.nextId = 1;
      this.board[5] = this.makeTower('fire'); this.board[6] = this.makeTower('fire');
      this.board[10] = this.makeTower('wood'); this.board[12] = this.makeTower('water');
      this.queue = ['fire', 'wood', 'water']; this.fillQueue();
      this.enemies = []; this.spawnList = []; this.spawnTimer = 0; this.spawned = 0; this.total = 0;
      this.blessings = []; this.offers = []; this.events = []; this.recorded = false;
    }
    random() { let n = this.seed += 0x6D2B79F5; n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61); this.seed >>>= 0; return ((n ^ n >>> 14) >>> 0) / 4294967296; }
    shuffle(list) { const result = [...list]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
    makeTower(type, level = 1, invested = 20 * 2 ** (level - 1)) { return { id: this.nextId++, type, level, cooldown: .12, target: 'front', invested }; }
    fillQueue() { while (this.queue.length < 7 || this.mode === 'draft' && new Set(this.queue).size < 3) this.queue.push(...this.shuffle(Object.keys(TYPES))); }
    get goal() { return MODES[this.mode].waves; }
    get maxHealth() { return Math.max(5, MODES[this.mode].health + DIFFICULTIES[this.difficulty].health) + this.upgrades.walls * 3; }
    get rankedScore() { return Math.round(this.score * DIFFICULTIES[this.difficulty].score); }
    get cleared() { return ['ready', 'upgrade', 'won'].includes(this.status) ? this.wave : Math.max(0, this.wave - 1); }
    get maxEnergy() { return 100 + this.upgrades.focus * 15; }
    gainEnergy(amount) { this.energy = Math.min(this.maxEnergy, this.energy + amount); }
    synergies() {
      const counts = Object.fromEntries(Object.keys(TYPES).map(type => [type, this.board.filter(t => t?.type === type).length]));
      const unique = Object.values(counts).filter(Boolean).length;
      return SYNERGIES.map(s => ({ ...s, count: s.key === 'triad' || s.key === 'cycle' ? unique : counts[s.key], active: (s.key === 'triad' || s.key === 'cycle' ? unique : counts[s.key]) >= s.need }));
    }
    weatherFor(wave) { return !this.rules.weather || wave <= 1 ? 'calm' : ['calm', 'rain', 'wind', 'ember', 'mist'][(wave - 2 + this.initialSeed % 5) % 5]; }
    isBossWave(wave) { return wave % MODES[this.mode].bossEvery === 0 || this.goal > 0 && wave === this.goal; }
    wavePlan(wave) {
      const count = Math.max(4, Math.round((this.mode === 'bossrush' ? 3 + Math.ceil(wave * .65) : 6 + wave) * DIFFICULTIES[this.difficulty].count));
      const plan = Array.from({ length: count }, (_, i) => wave >= 7 && i % 9 === 7 ? 'healer' : wave >= 5 && i % 7 === 5 ? 'splitter' : wave >= 4 && i % 6 === 3 ? 'armored' : wave >= 3 && i % 5 === 4 ? 'tank' : wave >= 2 && i % 4 === 2 ? 'swift' : 'normal');
      if (this.isBossWave(wave)) plan.push('boss');
      if (this.mode === 'bossrush' && wave % 4 === 0) plan.push('boss');
      return plan;
    }
    get cost() { return Math.max(8, (this.mode === 'draft' ? 24 : 20) - 4 * this.blessings.filter(b => b === 'fortune').length); }
    get recruitChoices() { return [...new Set(this.queue)].slice(0, 3); }
    refund(index) { return this.board[index] ? Math.floor(this.board[index].invested * .4) : 0; }
    upgradeCost(key) { return has(UPGRADES, key) ? UPGRADES[key].base + this.upgrades[key] * UPGRADES[key].step : Infinity; }
    buyUpgrade(key) {
      if (!has(UPGRADES, key)) return { error: '未知城务' };
      if (this.status !== 'ready') return { error: '请在波间布阵时办理城务' };
      if (key === 'focus' && !this.rules.spells) return { error: '本局禁用法术，无需修缮文台' };
      if (this.upgrades[key] >= UPGRADES[key].max) return { error: '这项城务已达满级' };
      const cost = this.upgradeCost(key); if (this.ink < cost) return { error: `还差 ${cost - this.ink} 灵墨` };
      this.ink -= cost; this.upgrades[key]++;
      if (key === 'walls') this.health = Math.min(this.maxHealth, this.health + 3);
      if (key === 'focus') this.gainEnergy(15);
      this.emit('townUpgrade', { key, level: this.upgrades[key] }); return { key, level: this.upgrades[key] };
    }
    get editable() { return ['ready', 'playing', 'paused'].includes(this.status); }
    stats(tower) {
      const type = TYPES[tower.type], scale = 2.5 ** (tower.level - 1);
      const active = new Set(this.synergies().filter(s => s.active).map(s => s.key));
      const weather = ['playing', 'paused'].includes(this.status) ? this.waveEvent : this.weatherFor(this.wave + 1);
      const count = key => this.blessings.filter(b => b === key).length;
      const power = 1 + count('power') * .22 + (active.has('triad') ? .08 : 0);
      return {
        damage: type.damage * scale * power * (1 + this.upgrades.training * .08) * (weather === 'ember' && tower.type === 'fire' ? 1.25 : 1),
        cooldown: type.cooldown / (1 + count('haste') * .2 + (active.has('cycle') ? .12 : 0)),
        range: Math.max(1.1, type.range + .55 * count('range') - (weather === 'mist' ? .4 : 0)),
        poison: 3 * scale * power * (1 + this.upgrades.training * .08) * (active.has('wood') ? 1.35 : 1) * (weather === 'rain' ? 1.2 : 1),
        slow: Math.min(.8, (this.blessings.includes('frost') ? .62 : .42) + (active.has('water') ? .08 : 0) + (weather === 'rain' ? .08 : 0)),
        slowDuration: 2 + (this.blessings.includes('frost') ? 1 : 0) + (active.has('water') ? 1 : 0),
        splash: .78 + .12 * tower.level + (active.has('fire') ? .35 : 0),
        stun: .2 + tower.level * .1 + (active.has('earth') ? .2 : 0),
        bounces: 3 + (active.has('metal') ? 1 : 0)
      };
    }
    retarget(index) {
      if (!this.editable || !this.board[index]) return false;
      const tower = this.board[index], keys = Object.keys(TARGETS); tower.target = keys[(keys.indexOf(tower.target) + 1) % keys.length];
      return tower.target;
    }
    reroll() {
      if (!this.editable) return { error: '此刻不能重书' };
      if (this.ink < 8) return { error: '重书需要 8 灵墨' };
      const alternatives = Object.keys(TYPES).filter(t => t !== this.queue[0]);
      this.ink -= 8; this.queue[0] = alternatives[Math.floor(this.random() * alternatives.length)];
      this.emit('reroll'); return { type: this.queue[0] };
    }
    spellError(key) {
      if (!has(SPELLS, key)) return '未知法术';
      if (!this.rules.spells) return '本局禁用主动法术';
      if (this.status !== 'playing') return '法术只能在战斗进行时使用';
      if (this.spellCooldowns[key] > 0) return `还需冷却 ${Math.ceil(this.spellCooldowns[key])} 秒`;
      if (this.energy < SPELLS[key].cost) return `还差 ${Math.ceil(SPELLS[key].cost - this.energy)} 文气，击杀与合成可以恢复`;
      if (key === 'mend' && this.health === this.maxHealth) return '城防完好，暂时无需回春';
      return '';
    }
    cast(key, point) {
      const error = this.spellError(key); if (error) return { error };
      if (SPELLS[key].targeted && (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 10 || point.y < 0 || point.y > 8)) return { error: '请点选战场内的落火位置' };
      const healed = key === 'mend' ? Math.min(5, this.maxHealth - this.health) : 0;
      this.energy -= SPELLS[key].cost; this.spellCooldowns[key] = SPELLS[key].cooldown; this.casts++;
      if (key === 'flame') for (const e of [...this.enemies]) if (e.hp > 0 && distance(e, point) <= 1.75) this.hit(e, 120 + this.wave * 32, 'spell');
      if (key === 'freeze') for (const e of this.enemies) if (e.hp > 0) e.stunTimer = Math.max(e.stunTimer, e.kind === 'boss' ? 1.75 : 3.5);
      if (key === 'mend') this.health += healed;
      this.enemies = this.enemies.filter(e => e.hp > 0);
      if (!this.enemies.length && !this.spawnList.length) this.completeWave();
      this.emit('spell', { key, point, healed }); return { key, healed };
    }
    emit(type, data = {}) { this.events.push({ type, ...data }); }
    consumeEvents() { return this.events.splice(0); }
    summon(index, choice) {
      if (!this.editable) return { error: '此刻还不能落字' };
      if (this.ink < this.cost) return { error: `还差 ${this.cost - this.ink} 灵墨，击败墨兽可获得灵墨` };
      if (index === undefined) {
        // Keep recruits close to useful bends, rather than stranding them at the entrance.
        index = [6, 5, 12, 10, 11, 7, 13, 4, 3, 15, 14, 9, 2, 1, 8, 0].find(i => !this.board[i]);
      }
      if (!Number.isInteger(index) || index < 0 || index >= PADS.length || this.board[index]) return { error: '字阵已满，试试合成或送别字灵' };
      if (this.mode === 'draft' && choice === undefined) return { choiceRequired: true, choices: this.recruitChoices, index };
      if (this.mode === 'draft' && !this.recruitChoices.includes(choice)) return { error: '请选择本次可招募的字灵' };
      const paid = this.cost, type = this.mode === 'draft' ? choice : this.queue[0];
      this.ink -= paid; this.queue.splice(this.mode === 'draft' ? this.queue.indexOf(type) : 0, 1);
      this.board[index] = this.makeTower(type, 1, paid); this.fillQueue();
      this.emit('summon', { index, element: this.board[index].type });
      return { index, tower: this.board[index] };
    }
    canMerge(a, b) { const x = this.board[a], y = this.board[b]; return a !== b && !!x && !!y && x.type === y.type && x.level === y.level && x.level < 3; }
    move(from, to) {
      if (!this.editable || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= PADS.length || to >= PADS.length || from === to || !this.board[from]) return false;
      const source = this.board[from], target = this.board[to];
      if (this.canMerge(from, to)) {
        target.level++; target.invested += source.invested; target.cooldown = Math.min(target.cooldown, .15); this.board[from] = null;
        this.merges++; this.score += 40 * target.level;
        this.gainEnergy(8 + (this.blessings.includes('craft') ? 4 : 0));
        if (this.blessings.includes('craft')) this.ink += 5;
        this.emit('merge', { index: to, element: target.type, level: target.level });
        return { merged: true, index: to };
      }
      [this.board[from], this.board[to]] = [target, source];
      this.emit('move', { from, to }); return { merged: false, swapped: !!target, index: to };
    }
    mergeAll() {
      if (!this.editable) return 0;
      let count = 0;
      for (let level = 1; level < 3; level++) {
        for (const type of Object.keys(TYPES)) {
          let pair = this.board.map((t, i) => t?.type === type && t.level === level ? i : -1).filter(i => i >= 0);
          while (pair.length >= 2) { this.move(pair.shift(), pair.shift()); count++; }
        }
      }
      return count;
    }
    sell(index) {
      if (!this.editable || !Number.isInteger(index) || !this.board[index]) return false;
      const refund = this.refund(index);
      this.ink += refund; this.board[index] = null; this.emit('sell', { index, refund }); return refund;
    }
    startWave() {
      if (this.status === 'paused') { this.status = 'playing'; this.emit('resume'); return true; }
      if (this.status !== 'ready' || this.goal > 0 && this.wave >= this.goal) return false;
      this.wave++; this.status = 'playing'; this.spawned = 0;
      this.waveEvent = this.weatherFor(this.wave); this.spawnList = this.wavePlan(this.wave);
      this.total = this.spawnList.length; this.spawnTimer = .6;
      this.board.forEach(t => { if (t) t.cooldown = Math.min(t.cooldown, .15); });
      this.emit('waveStart', { wave: this.wave, boss: this.isBossWave(this.wave) }); return true;
    }
    pause() { if (this.status !== 'playing') return false; this.status = 'paused'; this.emit('pause'); return true; }
    spawn(kind, d = 0, reinforcement = false) {
      const scale = (1 + this.wave * .22 + this.wave ** 2 * .085) * MODES[this.mode].scale * DIFFICULTIES[this.difficulty].enemyHealth;
      const config = ENEMIES[kind], baseHp = (kind === 'boss' && this.goal > 0 && this.wave === this.goal ? 270 : config.hp) * (kind === 'boss' && this.mode === 'bossrush' ? 2.4 : 1);
      const enemy = { hp: baseHp * scale, maxHp: baseHp * scale, speed: config.speed * DIFFICULTIES[this.difficulty].enemySpeed, word: config.word, reward: config.reward, breach: config.breach, armor: config.armor || 0, id: this.nextId++, kind, d, ...positionAt(d), slowTimer: 0, slow: 0, poisonTimer: 0, poison: 0, hitFlash: 0, stunTimer: 0, breakTimer: 0, healTimer: 3 };
      this.enemies.push(enemy); if (!reinforcement) this.spawned++; this.emit('spawn', { id: enemy.id, kind }); return enemy;
    }
    hit(enemy, damage, element) {
      if (enemy.hp <= 0) return;
      damage *= enemy.armor > 0 && enemy.breakTimer <= 0 && !['poison', 'metal', 'spell'].includes(element) ? 1 - enemy.armor : 1;
      enemy.hp -= damage; enemy.hitFlash = .13;
      this.emit('hit', { x: enemy.x, y: enemy.y, damage, element, id: enemy.id });
      if (enemy.hp <= 0) {
        const reward = Math.max(1, Math.round(enemy.reward * DIFFICULTIES[this.difficulty].reward)) + (this.blessings.includes('bounty') ? 1 : 0);
        this.ink += reward; this.gainEnergy(enemy.kind === 'boss' ? 10 : 3); this.kills++; this.score += enemy.kind === 'boss' ? 300 : 15;
        this.emit('kill', { x: enemy.x, y: enemy.y, element, reward, boss: enemy.kind === 'boss' });
        if (enemy.kind === 'splitter') { this.spawn('child', Math.max(0, enemy.d - .12), true); this.spawn('child', Math.min(PATH_LENGTH - .01, enemy.d + .12), true); this.emit('split', { x: enemy.x, y: enemy.y }); }
      }
    }
    step(seconds) {
      if (this.status !== 'playing' || !Number.isFinite(seconds) || seconds <= 0) return;
      let remaining = Math.min(seconds, 1);
      while (remaining > .00001 && this.status === 'playing') { const dt = Math.min(remaining, .05); this.tick(dt); remaining -= dt; }
    }
    tick(dt) {
      this.elapsed += dt; this.spawnTimer -= dt;
      this.gainEnergy(dt * (.35 + (this.blessings.includes('flow') ? 1 : 0)));
      for (const key of Object.keys(SPELLS)) this.spellCooldowns[key] = Math.max(0, this.spellCooldowns[key] - dt);
      if (this.spawnList.length && this.spawnTimer <= 0) { this.spawn(this.spawnList.shift()); this.spawnTimer += Math.max(.4, .95 - this.wave * .025); }
      for (const e of this.enemies) {
        if (e.hp <= 0) continue;
        e.hitFlash = Math.max(0, e.hitFlash - dt);
        e.breakTimer = Math.max(0, e.breakTimer - dt);
        if (e.poisonTimer > 0) { const active = Math.min(dt, e.poisonTimer); e.poisonTimer = Math.max(0, e.poisonTimer - dt); this.hit(e, e.poison * active, 'poison'); if (e.poisonTimer === 0) e.poison = 0; }
        if (e.hp <= 0) continue;
        const frozen = e.stunTimer > 0; e.stunTimer = Math.max(0, e.stunTimer - dt);
        if (!frozen) e.d += e.speed * (this.waveEvent === 'wind' ? 1.18 : 1) * (e.slowTimer > 0 ? 1 - e.slow : 1) * dt;
        e.slowTimer = Math.max(0, e.slowTimer - dt); Object.assign(e, positionAt(e.d));
        if (e.kind === 'healer' && !frozen) {
          e.healTimer = Math.max(0, e.healTimer - dt);
          if (e.healTimer === 0) {
            e.healTimer = 3;
            for (const ally of this.enemies) if (ally.hp > 0 && distance(e, ally) <= 1.6) ally.hp = Math.min(ally.maxHp, ally.hp + ally.maxHp * (ally.kind === 'boss' ? .015 : .055));
            this.emit('heal', { x: e.x, y: e.y });
          }
        }
        if (e.d >= PATH_LENGTH) {
          e.escaped = true; e.hp = 0; this.health = Math.max(0, this.health - e.breach);
          this.emit('breach', { damage: e.breach, x: 9.5, y: 7.5 });
          if (this.health === 0) { this.finish(false); return; }
        }
      }
      for (let i = 0; i < this.board.length; i++) {
        const tower = this.board[i]; if (!tower) continue;
        tower.cooldown -= dt; if (tower.cooldown > 0) continue;
        const stats = this.stats(tower), point = PADS[i];
        const targets = this.enemies.filter(e => e.hp > 0 && distance(point, e) <= stats.range).sort((a, b) => tower.target === 'weak' ? a.hp - b.hp || b.d - a.d : tower.target === 'strong' ? b.maxHp - a.maxHp || b.d - a.d : b.d - a.d);
        const target = targets[0]; if (!target) { tower.cooldown = 0; continue; }
        tower.cooldown += stats.cooldown;
        this.emit('shot', { from: i, to: { x: target.x, y: target.y }, element: tower.type, level: tower.level });
        if (tower.type === 'fire') {
          for (const e of this.enemies) if (e.hp > 0 && distance(target, e) <= stats.splash) this.hit(e, stats.damage * (e === target ? 1 : .7), 'fire');
        } else if (tower.type === 'metal') {
          let current = target; const struck = new Set();
          for (let hop = 0; current && hop < stats.bounces; hop++) {
            struck.add(current.id); this.hit(current, stats.damage * .65 ** hop, 'metal');
            const next = this.enemies.filter(e => e.hp > 0 && !struck.has(e.id) && distance(current, e) <= 1.8).sort((a, b) => distance(current, a) - distance(current, b))[0];
            if (next && hop + 1 < stats.bounces) this.emit('chain', { from: { x: current.x, y: current.y }, to: { x: next.x, y: next.y } });
            current = next;
          }
        } else {
          if (tower.type === 'water') { target.slow = stats.slow; target.slowTimer = stats.slowDuration; }
          if (tower.type === 'wood') { target.poison = Math.max(target.poison, stats.poison); target.poisonTimer = 3; }
          if (tower.type === 'earth') { target.breakTimer = 3; target.stunTimer = Math.max(target.stunTimer, stats.stun * (target.kind === 'boss' ? .5 : 1)); }
          this.hit(target, stats.damage, tower.type);
        }
      }
      this.enemies = this.enemies.filter(e => e.hp > 0);
      if (!this.spawnList.length && !this.enemies.length) this.completeWave();
    }
    completeWave() {
      const reward = Math.round((20 + this.wave * 4) * DIFFICULTIES[this.difficulty].reward); this.ink += reward; this.score += 100 + this.health * 3;
      this.gainEnergy(10);
      if (this.blessings.includes('renewal')) this.health = Math.min(this.maxHealth, this.health + 2);
      this.emit('waveComplete', { wave: this.wave, reward });
      if (this.goal > 0 && this.wave === this.goal) { this.finish(true); return; }
      if (this.wave % 3 === 0) {
        this.status = 'upgrade';
        let available = Object.keys(BLESSINGS).filter(key => !this.blessings.includes(key));
        if (available.length < 3) available = [...new Set([...available, 'power', 'haste', 'range', 'fortune'])];
        this.offers = this.shuffle(available).slice(0, 3);
        this.emit('upgrade', { offers: [...this.offers] });
      } else this.status = 'ready';
    }
    chooseBlessing(key) {
      if (this.status !== 'upgrade' || !this.offers.includes(key)) return false;
      this.blessings.push(key); this.offers = []; this.status = 'ready';
      if (key === 'fortune') this.ink += 50;
      if (key === 'renewal') this.health = Math.min(this.maxHealth, this.health + 7);
      this.emit('blessing', { key }); return true;
    }
    finish(won) { this.enemies = this.enemies.filter(e => e.hp > 0); this.status = won ? 'won' : 'lost'; this.emit('finish', { won }); }
    serialize() {
      const data = {};
      for (const key of Object.keys(this)) if (key !== 'events') data[key] = clone(this[key]);
      return { version: VERSION, ...data };
    }
    static restore(saved) {
      if (!saved || ![1, 2, VERSION].includes(saved.version)) return null;
      let data;
      try { data = clone(saved); } catch { return null; }
      if (!Array.isArray(data.board) || !Array.isArray(data.enemies)) return null;
      if (data.version === 1) {
        Object.assign(data, { version: 2, mode: 'classic', day: '', initialSeed: data.seed, energy: 50, spellCooldowns: { flame: 0, freeze: 0, mend: 0 }, casts: 0, waveEvent: 'calm' });
        data.board = data.board.map(t => t && { ...t, target: 'front' });
        data.enemies = data.enemies.map(e => e && { ...e, armor: 0, stunTimer: 0, breakTimer: 0, healTimer: 3 });
      }
      if (data.version === 2) {
        Object.assign(data, { version: VERSION, difficulty: 'normal', rules: { weather: true, spells: true }, upgrades: { training: 0, walls: 0, focus: 0 }, runId: `legacy-${data.mode}-${data.initialSeed}-${data.wave}-${data.score}` });
        data.board = data.board.map(t => t && { ...t, invested: 20 * 2 ** (t.level - 1) });
      }
      if (!has(MODES, data.mode) || !['ready', 'playing', 'paused', 'upgrade', 'won', 'lost'].includes(data.status) || data.board.length !== PADS.length || !Number.isInteger(data.wave) || data.wave < 0 || (MODES[data.mode].waves > 0 && data.wave > MODES[data.mode].waves)) return null;
      const finite = value => Number.isFinite(value) && value >= 0;
      if (!has(DIFFICULTIES, data.difficulty) || !data.rules || typeof data.rules.weather !== 'boolean' || typeof data.rules.spells !== 'boolean' || !data.upgrades || !Object.keys(UPGRADES).every(key => Number.isInteger(data.upgrades[key]) && data.upgrades[key] >= 0 && data.upgrades[key] <= UPGRADES[key].max) || typeof data.runId !== 'string' || !/^[\w:-]{1,120}$/.test(data.runId)) return null;
      const maxHealth = Math.max(5, MODES[data.mode].health + DIFFICULTIES[data.difficulty].health) + data.upgrades.walls * 3;
      if (!['health', 'ink', 'score', 'kills', 'merges', 'elapsed', 'seed', 'initialSeed', 'nextId', 'spawned', 'total', 'energy', 'casts'].every(key => finite(data[key])) || !Number.isFinite(data.spawnTimer) || data.health > maxHealth || data.energy > 100 + data.upgrades.focus * 15 || !has(WEATHER, data.waveEvent) || typeof data.day !== 'string' || data.mode === 'daily' && !/^\d{4}-\d{2}-\d{2}$/.test(data.day)) return null;
      if (!data.spellCooldowns || !Object.keys(SPELLS).every(key => finite(data.spellCooldowns[key]) && data.spellCooldowns[key] <= SPELLS[key].cooldown)) return null;
      if (data.board.some(t => t !== null && (!t || !has(TYPES, t.type) || ![1, 2, 3].includes(t.level) || !finite(t.cooldown) || !Number.isInteger(t.id) || !has(TARGETS, t.target) || !Number.isInteger(t.invested) || t.invested < 1 || t.invested > 10000000))) return null;
      if (!Array.isArray(data.queue) || data.queue.length < 4 || !data.queue.every(t => has(TYPES, t)) || !Array.isArray(data.blessings) || !data.blessings.every(b => has(BLESSINGS, b))) return null;
      if (data.mode === 'draft' && new Set(data.queue).size < 3) return null;
      if (data.blessings.some(b => !['power', 'haste', 'range', 'fortune'].includes(b) && data.blessings.indexOf(b) !== data.blessings.lastIndexOf(b))) return null;
      if (typeof data.recorded !== 'boolean' || !Array.isArray(data.offers) || !data.offers.every(b => has(BLESSINGS, b)) || (data.status === 'upgrade' && data.offers.length !== 3) || !Array.isArray(data.spawnList) || !data.spawnList.every(k => has(ENEMIES, k))) return null;
      if (data.enemies.some(e => !e || !has(ENEMIES, e.kind) || !['hp', 'maxHp', 'speed', 'reward', 'breach', 'd', 'slowTimer', 'slow', 'poisonTimer', 'poison', 'hitFlash', 'stunTimer', 'breakTimer', 'healTimer', 'armor'].every(k => finite(e[k])) || !Number.isFinite(e.x) || !Number.isFinite(e.y) || e.maxHp <= 0 || e.slow > 1 || e.armor >= 1)) return null;
      const goal = MODES[data.mode].waves;
      if ((data.status === 'won' && (!goal || data.wave !== goal)) || (data.status === 'lost' && data.health !== 0) || (data.status === 'ready' && (goal > 0 && data.wave === goal || data.enemies.length || data.spawnList.length))) return null;
      const game = new Game(1, { mode: data.mode, day: data.day, difficulty: data.difficulty, rules: data.rules, runId: data.runId });
      for (const key of Object.keys(game)) if (key !== 'events') game[key] = clone(data[key]);
      game.events = [];
      if (game.status === 'playing') game.status = 'paused';
      return game;
    }
  }
  const API = { Game, TYPES, PADS, PATH, PATH_LENGTH, BLESSINGS, MODES, DIFFICULTIES, UPGRADES, WEATHER, SPELLS, ENEMIES, TARGETS, SYNERGIES, dateKey, dailySeed, positionAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.ZizhenCore = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);

;
/* leaderboard.js */
(function (root) {
  'use strict';
  const Core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.ZizhenCore;
  const { MODES, DIFFICULTIES } = Core;
  const LIMIT = 200, VERSION = 1, FORMAT = 'zizhen-local-records';
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const integer = (value, max = 1e9) => Number.isInteger(value) && value >= 0 && value <= max;
  const playerName = value => Array.from(typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, '').trim() : '').slice(0, 16).join('') || '无名守阵人';
  const ruleKey = rules => `${rules.weather ? 1 : 0}${rules.spells ? 1 : 0}`;
  function validDay(day) {
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
    const d = new Date(`${day}T00:00:00.000Z`); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === day;
  }
  function cleanEntry(raw) {
    if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || !/^[\w:-]{1,120}$/.test(raw.id) || !own(MODES, raw.mode) || !own(DIFFICULTIES, raw.difficulty) || !['won', 'lost'].includes(raw.outcome) || typeof raw.name !== 'string') return null;
    if (!raw.rules || typeof raw.rules.weather !== 'boolean' || typeof raw.rules.spells !== 'boolean' || !['wave', 'score', 'rawScore', 'elapsedMs', 'health', 'kills', 'merges', 'casts'].every(k => integer(raw[k])) || raw.health > 50 || raw.elapsedMs > 604800000) return null;
    const goal = MODES[raw.mode].waves;
    if (goal && raw.wave > goal || raw.outcome === 'won' && (!goal || raw.wave !== goal) || raw.outcome === 'lost' && raw.health !== 0 || raw.score !== Math.round(raw.rawScore * DIFFICULTIES[raw.difficulty].score)) return null;
    if (raw.mode === 'daily' ? !validDay(raw.day) : raw.day !== '') return null;
    if (typeof raw.finishedAt !== 'string' || !Number.isFinite(Date.parse(raw.finishedAt))) return null;
    return { id: raw.id, name: playerName(raw.name), mode: raw.mode, difficulty: raw.difficulty, rules: { weather: raw.rules.weather, spells: raw.rules.spells }, outcome: raw.outcome, wave: raw.wave, score: raw.score, rawScore: raw.rawScore, elapsedMs: raw.elapsedMs, health: raw.health, kills: raw.kills, merges: raw.merges, casts: raw.casts, day: raw.day, finishedAt: new Date(raw.finishedAt).toISOString() };
  }
  function normalize(entries) {
    if (!Array.isArray(entries)) return [];
    const seen = new Set();
    return entries.map(cleanEntry).filter(e => e && !seen.has(e.id) && seen.add(e.id)).sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)).slice(0, LIMIT);
  }
  function fromGame(game, name, finishedAt = new Date().toISOString()) {
    if (!['won', 'lost'].includes(game.status)) return null;
    return cleanEntry({ id: game.runId, name: playerName(name), mode: game.mode, difficulty: game.difficulty, rules: game.rules, outcome: game.status, wave: game.cleared, score: game.rankedScore, rawScore: game.score, elapsedMs: Math.round(game.elapsed * 1000), health: game.health, kills: game.kills, merges: game.merges, casts: game.casts, day: game.day, finishedAt });
  }
  function compare(a, b) {
    return Number(b.outcome === 'won') - Number(a.outcome === 'won') || b.wave - a.wave || b.score - a.score || b.health - a.health || a.elapsedMs - b.elapsedMs;
  }
  function matching(entries, filters = {}) {
    return normalize(entries).filter(e => (!filters.mode || e.mode === filters.mode) && (!filters.difficulty || e.difficulty === filters.difficulty) && (!filters.rules || ruleKey(e.rules) === filters.rules) && (!filters.day || e.day === filters.day));
  }
  function leaderboard(entries, filters = {}) {
    const sorted = matching(entries, filters).sort((a, b) => compare(a, b) || a.finishedAt.localeCompare(b.finishedAt)), names = new Set(), best = [];
    for (const e of sorted) { const key = e.name.normalize('NFKC').toLocaleLowerCase('en-US'); if (!names.has(key)) { names.add(key); best.push(e); } }
    let rank = 0;
    return best.map((e, i) => { if (i === 0 || compare(e, best[i - 1]) !== 0) rank = i + 1; return { ...e, rank }; });
  }
  function append(entries, entry) { return normalize([...normalize(entries), entry]); }
  function pack(entries) { return { format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), entries: normalize(entries) }; }
  function unpack(text) {
    let data;
    try { data = JSON.parse(text); } catch { return { error: '文件不是有效的 JSON 战绩文件' }; }
    if (!data || data.format !== FORMAT || data.version !== VERSION || !Array.isArray(data.entries) || data.entries.length > 1000 || data.entries.some(e => !cleanEntry(e))) return { error: '战绩文件格式或记录内容不正确，未导入任何数据' };
    return { entries: normalize(data.entries) };
  }
  const API = { LIMIT, VERSION, playerName, ruleKey, validDay, cleanEntry, normalize, fromGame, compare, matching, leaderboard, append, pack, unpack };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.ZizhenRank = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);

;
/* game.js */
(() => {
  'use strict';
  const { Game, TYPES, PADS, BLESSINGS, MODES, DIFFICULTIES, UPGRADES, WEATHER, SPELLS, ENEMIES, TARGETS, dateKey } = ZizhenCore;
  const Rank = ZizhenRank;
  const $ = selector => document.querySelector(selector);
  const SAVE_KEY = 'little-days:zizhen:run:v1', RECORD_KEY = 'little-days:zizhen:record:v1', SETTINGS_KEY = 'little-days:zizhen:settings:v1';
  const RANK_KEY = 'little-days:zizhen:leaderboard:v1';
  let storageAvailable = true;
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { storageAvailable = false; return false; } };
  const rawSettings = read(SETTINGS_KEY) || {};
  const settings = { sound: rawSettings.sound === true, speed: [1, 2, 3].includes(rawSettings.speed) ? rawSettings.speed : 1, volume: Number.isFinite(rawSettings.volume) ? Math.max(0, Math.min(100, rawSettings.volume)) : 50, autoNext: rawSettings.autoNext === true, effects: rawSettings.effects !== false, numbers: rawSettings.numbers !== false, difficulty: Object.hasOwn(DIFFICULTIES, rawSettings.difficulty) ? rawSettings.difficulty : 'normal', rules: { weather: rawSettings.rules?.weather !== false, spells: rawSettings.rules?.spells !== false }, playerName: Rank.playerName(rawSettings.playerName) };
  const rawRecord = read(RECORD_KEY) || {};
  const cleanRecord = value => ({ bestScore: Math.max(0, Number(value?.bestScore) || 0), bestWave: Math.max(0, Number(value?.bestWave) || 0), wins: Math.max(0, Number(value?.wins) || 0), played: Math.max(0, Number(value?.played) || 0) });
  const record = { ...cleanRecord(rawRecord), modes: Object.fromEntries(Object.keys(MODES).map(mode => [mode, cleanRecord(rawRecord.modes?.[mode] || (mode === 'classic' ? rawRecord : {}))])) };
  const newRunId = () => window.crypto?.randomUUID?.() || `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  let history = Rank.normalize(read(RANK_KEY)?.entries);
  let model = Game.restore(read(SAVE_KEY)) || new Game(Date.now(), { difficulty: settings.difficulty, rules: settings.rules, runId: newRunId() });
  let selected = -1, guideType = 'fire', inspectorKey = '', padKeys = [], toastTimer, bannerTimer, resumeAfterModal = false, modalKind = '';
  let drag = null, suppressClick = false, effects = [], clock = 0, lastFrame = 0, uiTimer = 0, saveTimer = 0;
  let audioContext, lastTone = 0;
  let aiming = false, aimPoint = null, intelKey = '';
  let draftIndex = -1, autoKey = '', autoRemaining = 3;
  let rankFilters = { mode: model.mode, difficulty: model.difficulty, rules: Rank.ruleKey(model.rules), day: model.day || dateKey(), view: 'board', limit: 50 };
  const canvas = $('#battle-canvas'), ctx = canvas.getContext('2d');
  const field = $('#battlefield'), dialog = $('#game-dialog');
  const setText = (selector, value) => { const el = $(selector); const text = String(value); if (el.textContent !== text) el.textContent = text; };
  const word = tower => TYPES[tower.type].words[tower.level - 1];
  const numeral = ['', '一', '二', '三'];
  const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const minutes = ms => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  const formatFinish = stamp => new Date(stamp).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  function syncHistoryBests() {
    for (const e of history) { record.bestScore = Math.max(record.bestScore, e.score); record.bestWave = Math.max(record.bestWave, e.wave); const r = record.modes[e.mode]; r.bestScore = Math.max(r.bestScore, e.score); r.bestWave = Math.max(r.bestWave, e.wave); }
    record.played = Math.max(record.played, history.length); record.wins = Math.max(record.wins, history.filter(e => e.outcome === 'won').length);
    for (const mode of Object.keys(MODES)) { const entries = history.filter(e => e.mode === mode); record.modes[mode].played = Math.max(record.modes[mode].played, entries.length); record.modes[mode].wins = Math.max(record.modes[mode].wins, entries.filter(e => e.outcome === 'won').length); }
    if (history.length) write(RECORD_KEY, record);
  }

  function toast(message) {
    clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('show');
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3000);
  }
  function save() {
    write(SAVE_KEY, model.serialize());
    setText('#save-status', storageAvailable ? `本机自动存档 · ${MODES[model.mode].tag}` : '当前浏览器无法存档 · 本局仍可正常游玩');
  }
  function updateRecord(terminal = false) {
    const cleared = model.cleared, modeRecord = record.modes[model.mode];
    record.bestWave = Math.max(record.bestWave, cleared); record.bestScore = Math.max(record.bestScore, model.rankedScore);
    modeRecord.bestWave = Math.max(modeRecord.bestWave, cleared); modeRecord.bestScore = Math.max(modeRecord.bestScore, model.rankedScore);
    if (terminal && !model.recorded) { if (!history.some(e => e.id === model.runId)) { record.played++; modeRecord.played++; if (model.status === 'won') { record.wins++; modeRecord.wins++; } } model.recorded = true; }
    write(RECORD_KEY, record);
    if (terminal) {
      const entry = Rank.fromGame(model, settings.playerName);
      if (entry) { history = Rank.append(history, entry); write(RANK_KEY, Rank.pack(history)); }
    }
  }
  function playTone(kind = 'click') {
    if (!settings.sound || settings.volume <= 0) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const now = audioContext.currentTime;
      if (kind === 'shot' && now - lastTone < .1) return;
      lastTone = now;
      const frequencies = { click: 390, shot: 210, merge: 660, summon: 440, wave: 330, win: 880, breach: 110 };
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      const duration = kind === 'win' || kind === 'merge' ? .3 : .1;
      oscillator.type = kind === 'breach' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequencies[kind] || 390, now);
      oscillator.frequency.exponentialRampToValueAtTime((frequencies[kind] || 390) * (kind === 'merge' ? 1.5 : .6), now + duration);
      gain.gain.setValueAtTime((kind === 'shot' ? .018 : .07) * settings.volume / 100, now); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + duration);
    } catch { settings.sound = false; renderSound(); }
  }
  function renderSound() {
    $('#sound-button').innerHTML = icon(settings.sound ? 'volume' : 'mute');
    $('#sound-button').setAttribute('aria-label', settings.sound ? '关闭音效' : '开启音效');
    $('#sound-button').title = settings.sound ? '关闭音效' : '开启音效';
    $('#sound-button').setAttribute('aria-pressed', String(settings.sound));
  }
  function buildPads() {
    $('#tower-pads').innerHTML = PADS.map((p, i) => `<button class="tower-pad empty" data-pad="${i}" style="left:${p.x * 10}%;top:${p.y * 12.5}%" aria-label="空位 ${i + 1}，点击召唤字灵"></button>`).join('');
    $('#wave-track').dataset.track = '';
  }
  function renderTrack() {
    const start = model.goal ? 1 : Math.floor(Math.max(0, model.wave - 1) / 10) * 10 + 1;
    const count = model.goal || 10, trackKey = `${model.mode}:${start}`;
    if ($('#wave-track').dataset.track !== trackKey) {
      $('#wave-track').dataset.track = trackKey;
      $('#wave-track').setAttribute('aria-label', model.goal ? `${model.goal} 波挑战进度` : `无尽试炼第 ${start} 至 ${start + 9} 波`);
      $('#wave-track').innerHTML = Array.from({ length: count }, (_, i) => { const wave = start + i; return `<span class="wave-step${model.isBossWave(wave) ? ' boss' : ''}" data-wave="${wave}" title="第 ${wave} 波${model.isBossWave(wave) ? ' · 魁首' : ''}"></span>`; }).join('');
    }
    document.querySelectorAll('.wave-step').forEach(el => { const wave = Number(el.dataset.wave); el.classList.toggle('active', wave === model.wave && ['playing', 'paused'].includes(model.status)); el.classList.toggle('done', wave <= model.cleared); });
  }
  function renderPads() {
    const tutorial = model.wave === 0 && model.merges === 0 && selected === -1;
    document.querySelectorAll('[data-pad]').forEach((el, i) => {
      const tower = model.board[i], key = tower ? `${tower.id}:${tower.type}:${tower.level}` : 'empty';
      if (padKeys[i] !== key) {
        el.innerHTML = tower ? `<span class="tower-word">${word(tower)}</span><span class="tower-level">${'<i></i>'.repeat(tower.level)}</span>` : '';
        for (const className of [...Object.keys(TYPES), 'tier-1', 'tier-2', 'tier-3']) el.classList.remove(className);
        if (tower) el.classList.add(tower.type, `tier-${tower.level}`);
        el.classList.toggle('empty', !tower); el.classList.toggle('occupied', !!tower);
        el.setAttribute('aria-label', tower ? `字灵${word(tower)}，${numeral[tower.level]}阶，位置${i + 1}` : `空位 ${i + 1}，点击召唤字灵`);
        padKeys[i] = key;
      }
      el.classList.toggle('selected', selected === i);
      el.setAttribute('aria-pressed', String(selected === i));
      el.classList.toggle('mergeable', selected >= 0 ? model.canMerge(selected, i) : tutorial && [5, 6].includes(i));
      el.disabled = !model.editable;
    });
  }
  function renderInspector() {
    const tower = selected >= 0 ? model.board[selected] : null;
    if (!tower) selected = -1;
    const type = tower ? tower.type : guideType;
    const key = `${selected}:${tower?.id}:${tower?.level}:${tower?.target}:${type}:${model.blessings.join()}:${Object.values(model.upgrades).join()}:${model.board.map(t => t?.type || '-').join()}:${model.waveEvent}:${model.status}`;
    if (inspectorKey === key) return;
    inspectorKey = key;
    setText('#inspector-title', tower ? `${word(tower)} · ${numeral[tower.level]}阶字灵` : '字灵图鉴');
    $('#deselect-button').hidden = !tower; $('#guide-caption').hidden = !!tower;
    document.querySelectorAll('[data-element]').forEach(el => { const active = el.dataset.element === type; el.classList.toggle('active', active); el.setAttribute('aria-selected', String(active)); });
    $('#evolution').innerHTML = TYPES[type].words.map((w, i) => `${i ? '<span>→</span>' : ''}<div class="word-${type}${tower?.level === i + 1 ? ' is-current' : ''}"><strong class="evo-word">${w}</strong><small class="evo-label">${numeral[i + 1]}阶${i === 2 ? ' · 满阶' : ''}</small></div>`).join('');
    setText('#element-description', TYPES[type].description);
    const stats = model.stats(tower || { type, level: 1 });
    $('#tower-stats').innerHTML = `<div>伤害<strong>${Math.round(stats.damage)} · ${{ fire: '群攻', wood: '青毒', water: '减速', earth: '破甲', metal: '弹射' }[type]}</strong></div><div>攻速<strong>${stats.cooldown.toFixed(2)} 秒</strong></div><div>射程<strong>${stats.range.toFixed(1)} 格</strong></div>`;
    $('#target-button').hidden = !tower;
    if (tower) $('#target-button').textContent = `索敌：${TARGETS[tower.target]} ⇄`;
    $('#sell-button').hidden = !tower;
    if (tower) $('#sell-button').innerHTML = `送别字灵 <span>返还 ${model.refund(selected)} 灵墨</span>`;
  }
  function render() {
    if (selected >= 0 && !model.board[selected]) selected = -1;
    setText('#health', model.health); setText('#max-health', model.maxHealth); setText('#wave-goal', model.goal || '∞'); $('#health').classList.toggle('danger', model.health <= 7);
    setText('#mode-chapter', MODES[model.mode].name); setText('#mode-tag', model.mode === 'daily' ? model.day : model.goal ? `目标 · ${model.goal} 波` : '墨潮不息 · 挑战极限');
    setText('#ink', model.ink); setText('#wave', String(Math.max(1, model.wave)).padStart(2, '0')); setText('#score', model.rankedScore.toLocaleString('zh-CN'));
    setText('#difficulty-badge', DIFFICULTIES[model.difficulty].name); $('#difficulty-badge').dataset.difficulty = model.difficulty; $('#difficulty-badge').title = `${DIFFICULTIES[model.difficulty].description} 本局规则：${model.rules.weather ? '天气开启' : '无天气'}、${model.rules.spells ? '法术开启' : '禁法术'}`;
    $('#town-button').disabled = !['ready', 'playing', 'paused'].includes(model.status); $('#auto-next').checked = settings.autoNext;
    const labels = { ready: '· 布阵中', playing: '· 墨兽来袭', paused: '· 小憩片刻', upgrade: '· 山河馈赠', won: '· 山河无恙', lost: '· 此阵已终' };
    setText('#phase-label', labels[model.status]);
    $('#pause-button').disabled = !['playing', 'paused'].includes(model.status);
    $('#pause-button').innerHTML = `${icon(model.status === 'paused' ? 'play' : 'pause')}<span>${model.status === 'paused' ? '继续' : '暂停'}</span>`;
    $('#pause-button').setAttribute('aria-label', model.status === 'paused' ? '继续战斗' : '暂停战斗');
    $('#pause-overlay').hidden = model.status !== 'paused' || dialog.open;
    $('#speed-button').innerHTML = `${settings.speed}× <span>速度</span>`;
    $('#speed-button').setAttribute('aria-label', `当前 ${settings.speed} 倍速，点击切换`);
    const startLabels = { ready: `迎战 · 第 ${model.wave + 1} 波`, playing: '字灵正在守护', paused: '继续守护山河', upgrade: '择一份山河馈赠', won: '查看守城战绩', lost: '查看本局战绩' };
    $('#start-button span').textContent = startLabels[model.status]; $('#start-button').disabled = model.status === 'playing';
    $('#start-button svg use').setAttribute('href', model.status === 'upgrade' ? '#i-spark' : '#i-play');
    $('#merge-button').disabled = !model.editable;
    $('#target-button').disabled = !model.editable; $('#sell-button').disabled = !model.editable;
    const nextType = model.queue[0], next = TYPES[nextType];
    setText('#next-word', next.words[0]); $('#next-word').className = `word-${nextType}`;
    setText('#next-name', model.mode === 'draft' ? '三择其一，自成文章' : next.name); setText('#next-role', model.mode === 'draft' ? `${model.recruitChoices.map(type => TYPES[type].words[0]).join(' / ')} · 招募时自选` : next.role); setText('#summon-cost', model.cost); setText('#summon-action', model.mode === 'draft' ? '择字召唤' : '召唤字灵');
    const occupied = model.board.filter(Boolean).length;
    setText('#pad-count', `${occupied} / 16 字`);
    $('#summon-button').disabled = !model.editable || model.ink < model.cost || occupied === 16;
    $('#summon-button').title = occupied === 16 ? '字阵已满，先合成或送别字灵' : model.ink < model.cost ? '击败墨兽可获得更多灵墨' : '召唤到空位，也可直接点击空位';
    const preview = model.queue.slice(1, 4).join();
    if ($('#next-preview').dataset.queue !== preview) { $('#next-preview').dataset.queue = preview; $('#next-preview').innerHTML = model.queue.slice(1, 4).map(t => `<span class="preview-glyph word-${t}">${TYPES[t].words[0]}</span>`).join(''); }
    const activeBattle = ['playing', 'paused'].includes(model.status);
    setText('#enemy-count', activeBattle ? `主力 ${model.spawned} / ${model.total} · 场上 ${model.enemies.filter(e => e.hp > 0).length}` : model.status === 'ready' ? model.wave ? `守住第 ${model.wave} 波 · 调整后再迎战` : '准备好，就让墨兽来吧' : model.status === 'upgrade' ? '择一馈赠，继续前行' : `共击退 ${model.kills} 只墨兽`);
    if (model.status !== 'playing') { aiming = false; aimPoint = null; }
    setText('#battle-hint', aiming ? '点战场落下天火，再点法术取消' : selected >= 0 ? '点空位移动，点同字合成' : '同字同阶，合二为一');
    $('#field-message').hidden = model.wave > 0 || model.merges > 0 || selected >= 0;
    renderTrack(); renderTactics(); renderSpells(); renderIntel();
    setText('#blessing-count', `${model.blessings.length} / ${model.goal ? Math.floor((model.goal - 1) / 3) : '∞'}`);
    const blessingKey = model.blessings.join();
    if ($('#blessings').dataset.keys !== blessingKey) { $('#blessings').dataset.keys = blessingKey; $('#blessings').innerHTML = model.blessings.length ? [...new Set(model.blessings)].map(b => { const count = model.blessings.filter(key => key === b).length; return `<div class="blessing-chip"><span>${BLESSINGS[b].word}</span><div><strong>${BLESSINGS[b].name}${count > 1 ? ` ×${count}` : ''}</strong><small>${BLESSINGS[b].description}</small></div></div>`; }).join('') : '<p>每守住 3 波，可择一份馈赠。<br>字有灵，山河亦有回响。</p>'; }
    $('#reroll-button').disabled = !model.editable || model.ink < 8;
    renderPads(); renderInspector();
  }
  function renderTactics() {
    const synergies = model.synergies(), key = synergies.map(s => s.count).join();
    if ($('#synergy-list').dataset.counts === key) return;
    $('#synergy-list').dataset.counts = key;
    $('#synergy-list').innerHTML = synergies.map(s => `<span class="synergy-row${s.active ? ' active' : ''}" title="${s.description}"><i></i><span>${s.name}</span><small>${s.count} / ${s.need}</small></span>`).join('');
  }
  function renderSpells() {
    setText('#energy-value', Math.floor(model.energy)); $('#energy-value').title = `文气上限 ${model.maxEnergy}`; $('#energy-fill').style.width = `${model.energy / model.maxEnergy * 100}%`;
    $('.energy-status small').textContent = model.rules.spells ? '击杀 · 合成恢复' : '本局禁用法术';
    $('#aim-hint').hidden = !aiming; field.classList.toggle('aiming', aiming);
    document.querySelectorAll('[data-spell]').forEach(button => {
      const key = button.dataset.spell, spell = SPELLS[key], cooldown = model.spellCooldowns[key];
      button.disabled = !!model.spellError(key); button.classList.toggle('aimed', aiming && key === 'flame');
      button.title = `${spell.description} ${model.spellError(key)}`;
      button.setAttribute('aria-label', `${spell.name}，${cooldown > 0 ? `冷却 ${Math.ceil(cooldown)} 秒` : `消耗 ${spell.cost} 文气`}`);
      setText(`[data-spell-state="${key}"]`, aiming && key === 'flame' ? '选落点' : cooldown > 0 ? `${Math.ceil(cooldown)} 秒` : `${spell.cost} 气`);
    });
  }
  function renderIntel() {
    const preview = ['ready', 'upgrade'].includes(model.status), wave = preview ? model.wave + 1 : Math.max(1, model.wave);
    const weather = preview ? model.weatherFor(wave) : model.waveEvent, key = `${model.mode}:${wave}:${preview}:${weather}`;
    if (intelKey === key) return; intelKey = key;
    setText('#weather-info', `${WEATHER[weather].word} · ${WEATHER[weather].name}`); $('#weather-info').title = WEATHER[weather].description; field.dataset.weather = weather;
    const priority = ['boss', 'healer', 'armored', 'splitter', 'tank', 'swift'];
    const kinds = [...new Set(model.wavePlan(wave))].filter(k => k !== 'normal').sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
    const bosses = model.wavePlan(wave).filter(k => k === 'boss').length;
    setText('#wave-threats', `${preview ? '下波' : '本波'} · ${kinds.length ? kinds.map(k => `${ENEMIES[k].word}${k === 'boss' && bosses > 1 ? `×${bosses}` : ''}`).join(' / ') : '墨团'}`);
    $('#wave-threats').title = kinds.length ? kinds.map(k => ENEMIES[k].name).join('、') : ENEMIES.normal.description;
  }
  function padAnimation(index, animation) {
    const el = $(`[data-pad="${index}"]`); if (!el) return;
    el.classList.remove(animation); void el.offsetWidth; el.classList.add(animation); setTimeout(() => el.classList.remove(animation), 470);
  }
  function addEffect(effect) { if ((effect.kind === 'number' ? settings.numbers : settings.effects) && effects.length < 200) effects.push({ age: 0, ...effect }); }
  function burst(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) { const angle = i / count * Math.PI * 2 + Math.random() * .4; addEffect({ kind: 'particle', x, y, vx: Math.cos(angle) * (1 + Math.random()), vy: Math.sin(angle) * (1 + Math.random()), duration: .5, color }); }
  }
  function processEvents() {
    for (const event of model.consumeEvents()) {
      if (event.type === 'shot') {
        addEffect({ kind: 'shot', from: PADS[event.from], to: event.to, duration: .2, color: TYPES[event.element].color, element: event.element }); playTone('shot');
      } else if (event.type === 'hit' && event.element !== 'poison') {
        if (event.damage >= 10 && Math.random() < .45) addEffect({ kind: 'number', text: String(Math.round(event.damage)), x: event.x, y: event.y - .35, color: event.element === 'fire' ? '#9d6445' : '#647950', duration: .65 });
        if (event.element === 'fire') addEffect({ kind: 'ring', x: event.x, y: event.y, duration: .28, color: '#c78655', radius: .44 });
      } else if (event.type === 'kill') {
        burst(event.x, event.y, TYPES[event.element]?.color || '#83966e', event.boss ? 18 : 5);
        addEffect({ kind: 'number', text: `+${event.reward}墨`, x: event.x, y: event.y - .15, color: '#778458', duration: .9 });
      } else if (event.type === 'merge') {
        selected = event.index; padAnimation(event.index, 'just-merged'); burst(PADS[event.index].x, PADS[event.index].y, TYPES[event.element].color, 14); playTone('merge');
        toast(`合成「${TYPES[event.element].words[event.level - 1]}」！${event.level === 3 ? '三字成境，已达满阶' : '威力提升至原来的 2.5 倍'}`);
      } else if (event.type === 'summon') { padAnimation(event.index, 'just-summoned'); playTone('summon');
      } else if (event.type === 'waveStart') {
        selected = -1; effects = []; playTone('wave');
        const banner = $('#wave-banner'); banner.textContent = `第 ${model.wave} 波 · ${event.boss ? '魁首现身' : model.wave === 1 ? '落字，迎敌' : '墨潮又起'}`;
        banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => banner.classList.remove('show'), 2400);
      } else if (event.type === 'waveComplete') { updateRecord(); toast(`第 ${event.wave} 波守住了！山河回赠 ${event.reward} 灵墨`); save();
      } else if (event.type === 'upgrade') { openUpgrade();
      } else if (event.type === 'finish') { playTone(event.won ? 'win' : 'breach'); updateRecord(true); save(); openResult();
      } else if (event.type === 'breach') { playTone('breach'); burst(9.5, 7.5, '#ae7055', 8); toast(`墨兽入城，城防 −${event.damage}`);
      } else if (event.type === 'blessing') { playTone('merge'); toast(`获得「${BLESSINGS[event.key].name}」`); }
      else if (event.type === 'chain') { addEffect({ kind: 'shot', from: event.from, to: event.to, duration: .22, color: TYPES.metal.color, element: 'metal' }); }
      else if (event.type === 'heal') { addEffect({ kind: 'ring', x: event.x, y: event.y, duration: .7, color: '#819a67', radius: 1.2 }); }
      else if (event.type === 'split') { burst(event.x, event.y, '#8a7790', 7); }
      else if (event.type === 'spell') {
        playTone('merge');
        if (event.key === 'flame') { burst(event.point.x, event.point.y, '#c07a4e', 24); addEffect({ kind: 'ring', ...event.point, duration: .7, color: '#c07a4e', radius: 1.75 }); }
        if (event.key === 'freeze') { for (const enemy of model.enemies) addEffect({ kind: 'ring', x: enemy.x, y: enemy.y, duration: .65, color: '#77a9bc', radius: .5 }); }
        if (event.key === 'mend') { addEffect({ kind: 'number', x: 9, y: 7, duration: 1.5, text: `+${event.healed} 城防`, color: '#658755' }); toast(`春回山河，城防恢复 ${event.healed} 点`); }
      }
      else if (event.type === 'townUpgrade') { playTone('merge'); toast(`「${UPGRADES[event.key].name}」升至 ${event.level} 级`); }
    }
  }
  function act(action) { autoKey = ''; const result = action(); processEvents(); render(); save(); return result; }
  function summon(index) { const result = act(() => model.summon(index)); if (result.error) toast(result.error); else if (result.choiceRequired) openDraft(result.index); }
  function move(from, to) {
    const result = act(() => model.move(from, to));
    if (result) { selected = result.index; if (!result.merged) playTone(); render(); }
  }
  function clickPad(index) {
    if (!model.editable) return;
    autoKey = '';
    if (selected === index) selected = -1;
    else if (selected >= 0 && model.board[selected]) { move(selected, index); return; }
    else if (model.board[index]) { selected = index; guideType = model.board[index].type; playTone(); }
    else { summon(index); return; }
    render();
  }
  function start() {
    if (model.status === 'upgrade') { openUpgrade(); return; }
    if (['won', 'lost'].includes(model.status)) { openResult(); return; }
    act(() => model.startWave());
  }
  function pause() {
    if (model.status === 'paused') start(); else act(() => model.pause());
  }
  function mergeAll() {
    const count = act(() => model.mergeAll());
    if (count === 0) toast('还没有同阶同字的组合，再召唤几个字灵吧');
    else if (count > 1) toast(`一气呵成，完成 ${count} 次合成`);
  }
  function useSpell(key) {
    if (key === 'flame' && aiming) { aiming = false; aimPoint = null; render(); return; }
    if (key !== 'flame') { aiming = false; aimPoint = null; }
    const error = model.spellError(key); if (error) { render(); toast(error); return; }
    if (SPELLS[key].targeted) { aiming = true; selected = -1; aimPoint = null; render(); toast('点选战场上的天火落点'); }
    else { const result = act(() => model.cast(key)); if (result.error) toast(result.error); }
  }
  function openModal(content, kind) {
    if (dialog.open && modalKind === kind) return;
    aiming = false; aimPoint = null;
    resumeAfterModal = model.status === 'playing';
    if (resumeAfterModal) { model.pause(); model.consumeEvents(); save(); }
    modalKind = kind; $('#dialog-content').innerHTML = content;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    const heading = $('#dialog-title'); heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
    render();
  }
  function closeModal() { if (dialog.open) dialog.close(); }
  function openHelp() {
    openModal(`<p class="dialog-eyebrow">MORE WAYS TO GUARD YOUR LITTLE WORLD</p><h2 class="dialog-title" id="dialog-title">字里行间，皆可成阵。</h2><p class="dialog-copy">右上角「玩法」可切换六种模式；「设置」调整难度与偏好，「战榜」查看本机记录。本局是「${MODES[model.mode].name}」。</p><div class="help-step"><span>一</span><div><h3>落字与合字</h3><p>点空位或「召唤字灵」消耗灵墨。拖动同阶同字合成，最高三阶；也可先点选再点目标。不同字灵会交换位置。花 8 墨「重书」可以换掉下一字。</p></div></div><div class="help-step"><span>二</span><div><h3>五行有分工，留阵也有力量</h3><p>火系群攻、木系带毒、水系减速、土系眩晕破甲、金系弹射穿甲。五行阵意按字灵个数触发，保留多个同系一阶字灵有时更合适。点选字灵后可切换索敌方式。</p></div></div><div class="help-step"><span>三</span><div><h3>主动法术，扭转战局</h3><p>击杀与合成积攒文气。「天火」需再点战场选落点；「凝时」冻结全场，「回春」恢复城防。法术只在战斗中可用，暂停与布阵时不会恢复冷却。</p></div></div><div class="help-step"><span>四</span><div><h3>看天候，也要看对手</h3><p>春雨强化水木，燎原强化火系，疾风加快墨兽，山岚缩短射程。每波提前展示天气和特殊墨兽；图鉴可查看护甲、治疗与分裂的应对方法。每守住三波可选馈赠。</p></div></div><div class="help-keys"><kbd>S</kbd> 召唤　<kbd>M</kbd> 合成　<kbd>R</kbd> 重书　<kbd>空格</kbd> 迎战 / 暂停<br><kbd>1</kbd> 天火落点　<kbd>2</kbd> 凝时　<kbd>3</kbd> 回春　<kbd>Esc</kbd> 取消<br>切到后台会暂停，本局自动存档。每日一阵使用本机日期，难度、模式与规则分榜；波间还可办理城务升级。</div><div class="dialog-actions"><button class="primary-button" data-dialog-action="close">记住了，落字成阵 ${icon('arrow')}</button></div>`, 'help');
  }
  function openModes() {
    openModal(`<p class="dialog-eyebrow">CHOOSE YOUR NEXT CHAPTER</p><h2 class="dialog-title" id="dialog-title">今天，守哪一阵？</h2><p class="dialog-copy">选择玩法会按下方难度开启新局，替换当前字阵。历史战绩保留，天气与法术开关沿用设置。</p><label class="mode-difficulty">新局难度<select id="mode-difficulty">${difficultyOptions(settings.difficulty)}</select></label><p class="setting-note" id="mode-difficulty-note">${DIFFICULTIES[settings.difficulty].description}</p><div class="mode-options">${Object.entries(MODES).map(([key, mode]) => { const best = record.modes[key]; return `<button class="mode-option${model.mode === key ? ' current' : ''}" data-new-mode="${key}"><span>${mode.word}</span><div><strong>${mode.name}${model.mode === key ? '<em>当前</em>' : ''}</strong><small>${mode.description}</small><p>${key === 'daily' ? `${dateKey()} · ` : ''}${mode.tag}${best.played || best.bestWave ? ` · 最佳 ${best.bestWave} 波` : ''}</p></div></button>`; }).join('')}</div><div class="dialog-actions"><button class="secondary-button" data-dialog-action="close">接着守这一阵</button></div>`, 'modes');
  }
  function difficultyOptions(value) { return Object.entries(DIFFICULTIES).map(([key, item]) => `<option value="${key}"${key === value ? ' selected' : ''}>${item.name} · 计分 ×${item.score}</option>`).join(''); }
  function openDraft(index) {
    draftIndex = index;
    openModal(`<p class="dialog-eyebrow">PICK A GLYPH, WRITE YOUR FORMATION</p><h2 class="dialog-title" id="dialog-title">这一次，落下哪一字？</h2><p class="dialog-copy">选中后消耗 ${model.cost} 灵墨，落在第 ${index + 1} 个空位。取消不消耗灵墨。</p><div class="draft-options">${model.recruitChoices.map(type => `<button data-draft="${type}" class="draft-option"><span class="word-${type}">${TYPES[type].words[0]}</span><strong>${TYPES[type].name}</strong><small>${TYPES[type].role}</small></button>`).join('')}</div><div class="dialog-actions"><button class="secondary-button" data-dialog-action="close">先想一想</button></div>`, 'draft');
  }
  function townContents() {
    return `<p class="dialog-eyebrow">BUILD FOR THE WAVES TO COME</p><h2 class="dialog-title" id="dialog-title">修一分城，添一分胜算。</h2><p class="dialog-copy">城务只在波间布阵时可购买。本局持有 ${model.ink} 灵墨，升级会消耗灵墨。</p><div class="town-options">${Object.entries(UPGRADES).map(([key, item]) => { const level = model.upgrades[key], full = level >= item.max, disabled = model.status !== 'ready' || full || model.ink < model.upgradeCost(key) || key === 'focus' && !model.rules.spells; return `<div class="town-option"><span>${item.word}</span><div><strong>${item.name}<small>${level} / ${item.max} 级</small></strong><p>${item.description}</p></div><button data-town-upgrade="${key}"${disabled ? ' disabled' : ''}>${full ? '已满级' : `${model.upgradeCost(key)} 墨`}</button></div>`; }).join('')}</div><p class="setting-note">${model.status === 'ready' ? '研习强化全军；修城、文台在增加上限时也会补充资源。' : '请先完成当前波次，再来办理城务。'}</p><div class="dialog-actions"><button class="primary-button" data-dialog-action="close">回阵守护</button></div>`;
  }
  function openTown() { openModal(townContents(), 'town'); }
  function openSettings() {
    const check = value => value ? ' checked' : '';
    openModal(`<p class="dialog-eyebrow">MAKE ROOM FOR YOUR WAY TO PLAY</p><h2 class="dialog-title" id="dialog-title">难易由心，落字随意。</h2><p class="dialog-copy">难度与战场规则在新局生效，当前对局保持原规则。昵称、音量、速度和显示设置保存后立即生效。</p><section class="settings-group"><h3>守阵人</h3><label class="setting-field">排行榜昵称<input id="setting-name" maxlength="32" value="${escape(settings.playerName)}" autocomplete="off"></label></section><section class="settings-group"><h3>新局规则</h3><label class="setting-field">难度<select id="setting-difficulty">${difficultyOptions(settings.difficulty)}</select></label><p class="setting-note" id="difficulty-note">${DIFFICULTIES[settings.difficulty].description}</p><div class="setting-checks"><label><input type="checkbox" id="setting-weather"${check(settings.rules.weather)}> 开启天气变化</label><label><input type="checkbox" id="setting-spells"${check(settings.rules.spells)}> 开启主动法术</label></div><p class="setting-note">不同难度、天气与法术规则分开排名。对局中途不能改变计分规则。</p></section><section class="settings-group"><h3>游玩偏好</h3><div class="setting-grid"><label class="setting-field">战斗速度<select id="setting-speed">${[1, 2, 3].map(speed => `<option value="${speed}"${settings.speed === speed ? ' selected' : ''}>${speed} 倍速</option>`).join('')}</select></label><label class="setting-field volume-field">音量 <output id="volume-value">${settings.volume}%</output><input type="range" id="setting-volume" min="0" max="100" value="${settings.volume}"></label></div><div class="setting-checks"><label><input type="checkbox" id="setting-sound"${check(settings.sound)}> 开启音效</label><label><input type="checkbox" id="setting-auto"${check(settings.autoNext)}> 三秒后自动迎战</label><label><input type="checkbox" id="setting-effects"${check(settings.effects)}> 战斗特效</label><label><input type="checkbox" id="setting-numbers"${check(settings.numbers)}> 飘字与伤害数字</label></div></section><div class="dialog-actions"><button class="secondary-button" data-dialog-action="close">取消</button><button class="secondary-button" data-settings="save">保存设置</button><button class="primary-button" data-settings="new">保存并开新局</button></div>`, 'settings');
  }
  function applySettings(startNew) {
    const difficulty = $('#setting-difficulty').value, volume = Number($('#setting-volume').value);
    Object.assign(settings, { playerName: Rank.playerName($('#setting-name').value), difficulty: Object.hasOwn(DIFFICULTIES, difficulty) ? difficulty : 'normal', rules: { weather: $('#setting-weather').checked, spells: $('#setting-spells').checked }, speed: Number($('#setting-speed').value), volume: Math.max(0, Math.min(100, volume)), sound: $('#setting-sound').checked, autoNext: $('#setting-auto').checked, effects: $('#setting-effects').checked, numbers: $('#setting-numbers').checked });
    write(SETTINGS_KEY, settings); autoKey = ''; effects = []; renderSound();
    if (startNew) { newGame(model.mode, { difficulty: settings.difficulty, rules: settings.rules }); toast(`已开启${DIFFICULTIES[settings.difficulty].name}新局`); }
    else { closeModal(); render(); toast('设置已保存；难度与战场规则在新局生效'); }
  }
  const RULE_NAMES = { '11': '天气＋法术', '10': '天气＋禁法术', '01': '无天气＋法术', '00': '无天气＋禁法术' };
  function rankContents() {
    const board = rankFilters.view === 'board', filters = { mode: rankFilters.mode || undefined, difficulty: rankFilters.difficulty || undefined, rules: rankFilters.rules || undefined, day: rankFilters.mode === 'daily' ? rankFilters.day : undefined };
    const entries = board ? Rank.leaderboard(history, filters) : Rank.matching(history, filters), shown = entries.slice(0, rankFilters.limit);
    const option = (key, text, selected) => `<option value="${key}"${selected === key ? ' selected' : ''}>${text}</option>`;
    return `<p class="dialog-eyebrow">LOCAL RECORDS · YOUR OWN HALL OF GLYPHS</p><h2 class="dialog-title" id="dialog-title">一阵一名，榜上留字。</h2><p class="dialog-copy rank-intro">本机排行榜，离线可用。每个昵称仅列本榜最佳一局，保留最近 ${Rank.LIMIT} 局。数据存在当前浏览器，可导入导出。</p><div class="rank-tabs"><button data-rank-view="board" class="${board ? 'active' : ''}">排行榜</button><button data-rank-view="history" class="${!board ? 'active' : ''}">对局记录</button><span>${history.length} 局记录</span></div><div class="rank-filters"><label>模式<select id="rank-mode" data-rank-filter="mode">${!board ? option('', '全部模式', rankFilters.mode) : ''}${Object.entries(MODES).map(([key, item]) => option(key, item.name, rankFilters.mode)).join('')}</select></label><label>难度<select id="rank-difficulty" data-rank-filter="difficulty">${!board ? option('', '全部难度', rankFilters.difficulty) : ''}${Object.entries(DIFFICULTIES).map(([key, item]) => option(key, item.name, rankFilters.difficulty)).join('')}</select></label><label>规则<select id="rank-rules" data-rank-filter="rules">${!board ? option('', '全部规则', rankFilters.rules) : ''}${Object.entries(RULE_NAMES).map(([key, name]) => option(key, name, rankFilters.rules)).join('')}</select></label>${rankFilters.mode === 'daily' ? `<label class="rank-day">挑战日期<input type="date" id="rank-day" data-rank-filter="day" value="${escape(rankFilters.day)}"></label>` : ''}</div><p class="rank-order">${board ? '通关 → 波次 → 战绩 → 剩余城防 → 战斗用时；相同成绩共享名次。' : '按完成时间倒序排列，未结束的对局不会提前入榜。'}</p><div class="rank-rows">${shown.length ? shown.map((e, i) => `<article class="rank-row${board && e.rank <= 3 ? ' podium' : ''}" data-record-id="${escape(e.id)}"><span class="rank-place">${board ? String(e.rank).padStart(2, '0') : String(i + 1).padStart(2, '0')}</span><div class="rank-player"><strong>${escape(e.name)}</strong><small>${e.outcome === 'won' ? '通关' : '止步'} · ${e.wave} 波 · ${e.health} 城防 · ${minutes(e.elapsedMs)}${!board ? ` · ${MODES[e.mode].name} / ${DIFFICULTIES[e.difficulty].name}` : ''}</small><time>${escape(formatFinish(e.finishedAt))}</time></div><div class="rank-points"><strong>${e.score.toLocaleString('zh-CN')}</strong><small>战绩</small></div></article>`).join('') : '<div class="rank-empty"><span>榜</span><strong>此榜尚无战绩</strong><p>完成一局后自动收录，也可以导入以前导出的战绩文件。</p></div>'}</div>${entries.length > shown.length ? `<button class="rank-more" data-dialog-action="rank-more">再显示 50 局（${shown.length} / ${entries.length}）</button>` : ''}<div class="rank-file-actions"><button data-dialog-action="rank-export"${history.length ? '' : ' disabled'}>导出全部战绩 ↓</button><button data-dialog-action="rank-import">导入战绩 ↑</button></div><div class="dialog-actions"><button class="primary-button" data-dialog-action="close">回到字阵</button></div>`;
  }
  function openRank() {
    rankFilters = { mode: model.mode, difficulty: model.difficulty, rules: Rank.ruleKey(model.rules), day: model.day || dateKey(), view: 'board', limit: 50 };
    openModal(rankContents(), 'rank');
  }
  function refreshRank(focusId) {
    const top = dialog.scrollTop; $('#dialog-content').innerHTML = rankContents(); dialog.scrollTop = top;
    if (focusId) $(`#${focusId}`)?.focus({ preventScroll: true });
  }
  function exportRank() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(Rank.pack(history), null, 2)], { type: 'application/json;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `字阵战绩-${dateKey()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('已导出本机战绩');
  }
  function openCodex() {
    openModal(`<p class="dialog-eyebrow">KNOW WHAT COMES WITH THE INK</p><h2 class="dialog-title" id="dialog-title">墨兽有别，应变有方。</h2><div class="codex-list">${Object.entries(ENEMIES).map(([key, enemy]) => `<div class="codex-row"><span class="enemy-glyph enemy-${key}">${enemy.word}</span><div><strong>${enemy.name}</strong><p>${enemy.description}</p></div></div>`).join('')}</div><div class="dialog-actions"><button class="primary-button" data-dialog-action="close">知己知彼，回阵迎敌</button></div>`, 'codex');
  }
  function openTactics() {
    openModal(`<p class="dialog-eyebrow">A FORMATION IS MORE THAN ITS PARTS</p><h2 class="dialog-title" id="dialog-title">五行相照，字字生辉。</h2><p class="dialog-copy">羁绊按场上字灵个数计算，与阶数无关。合成后个数减少，可能暂时失去阵意；移动位置不会影响羁绊。</p><div class="trait-list">${model.synergies().map(s => `<div class="trait-row${s.active ? ' active' : ''}"><strong>${s.name}<small>${s.count} / ${s.need}${s.active ? ' · 生效中' : ''}</small></strong><p>${s.description}</p></div>`).join('')}</div><div class="dialog-actions"><button class="primary-button" data-dialog-action="close">明白了，继续布阵</button></div>`, 'tactics');
  }
  function openWeather() {
    const weather = ['ready', 'upgrade'].includes(model.status) ? model.weatherFor(model.wave + 1) : model.waveEvent;
    openModal(`<p class="dialog-eyebrow">READ THE SKY, CHANGE YOUR FORMATION</p><h2 class="dialog-title" id="dialog-title">因天而变，借势成阵。</h2><p class="dialog-copy">每波开战前可预知天候。${WEATHER[weather].name}：${WEATHER[weather].description}</p><div class="codex-list">${Object.entries(WEATHER).map(([key, item]) => `<div class="codex-row"><span class="enemy-glyph weather-glyph">${item.word}</span><div><strong>${item.name}${key === weather ? ' · 当前预告' : ''}</strong><p>${item.description}</p></div></div>`).join('')}</div><div class="dialog-actions"><button class="primary-button" data-dialog-action="close">观天布阵，继续守护</button></div>`, 'weather');
  }
  function openUpgrade() {
    openModal(`<p class="dialog-eyebrow">A GIFT FROM THE MOUNTAINS</p><h2 class="dialog-title" id="dialog-title">山河记得你的守护。</h2><p class="dialog-copy">已守住第 ${model.wave} 波。择一份馈赠，为接下来的字阵添一分力量。</p><div class="upgrade-options">${model.offers.map(key => `<button class="upgrade-option" data-blessing="${key}"><span>${BLESSINGS[key].word}</span><div><strong>${BLESSINGS[key].name}</strong><small>${BLESSINGS[key].description}</small></div><span>↗</span></button>`).join('')}</div>`, 'upgrade');
  }
  function openResult() {
    const won = model.status === 'won', cleared = model.cleared, best = record.modes[model.mode];
    openModal(`<div class="result-seal">${won ? '守' : model.mode === 'endless' ? '无' : '惜'}</div><p class="dialog-eyebrow">${MODES[model.mode].name} · ${DIFFICULTIES[model.difficulty].name}${model.day ? ` · ${model.day}` : ''}</p><h2 class="dialog-title" id="dialog-title">${won ? '字阵未散，山河无恙。' : model.mode === 'endless' ? '墨海无尽，字阵留名。' : '墨潮未尽，下次再守。'}</h2><p class="dialog-copy">${won ? `${model.goal} 波墨潮已退，这一次的守护圆满落笔。` : '换一套五行阵意，用城务补强阵容，再续一阵山河。'}本局施法 ${model.casts} 次，计分倍率 ×${DIFFICULTIES[model.difficulty].score}。</p><div class="result-stats"><div><strong>${model.rankedScore.toLocaleString('zh-CN')}</strong><span>本局战绩</span></div><div><strong>${cleared}<small> /${model.goal || '∞'}</small></strong><span>守住波次</span></div><div><strong>${model.merges}</strong><span>字灵合成</span></div></div><p class="result-best">本模式历史最佳 ${best.bestScore.toLocaleString('zh-CN')} 分（全部难度） · 可在战榜查看本局</p><div class="dialog-actions result-actions"><button class="secondary-button" data-dialog-action="close">回看字阵</button><button class="secondary-button" data-dialog-action="rank">查看战榜</button><button class="secondary-button" data-dialog-action="modes">换个玩法</button><button class="primary-button" data-dialog-action="new-game">再守一次</button></div>`, 'result');
  }
  function confirmRestart() {
    if (['won', 'lost'].includes(model.status)) { newGame(); return; }
    openModal('<p class="dialog-eyebrow">A FRESH PAGE</p><h2 class="dialog-title" id="dialog-title">重新落笔？</h2><p class="dialog-copy">将重新开始本局，当前字阵会被替换。历史最佳战绩会保留。</p><div class="dialog-actions"><button class="secondary-button" data-dialog-action="close">接着守护</button><button class="primary-button" data-dialog-action="new-game">重开字阵</button></div>', 'restart');
  }
  function newGame(mode = model.mode, options = {}) {
    resumeAfterModal = false; closeModal(); modalKind = '';
    model = new Game(Date.now(), { mode, difficulty: options.difficulty || model.difficulty, rules: options.rules || model.rules, runId: newRunId() }); selected = -1; effects = []; inspectorKey = ''; padKeys = []; aiming = false; aimPoint = null; intelKey = ''; autoKey = ''; $('#auto-countdown').textContent = ''; $('#wave-track').dataset.track = '';
    clearTimeout(bannerTimer); $('#wave-banner').classList.remove('show'); render(); save(); toast('新纸已铺，落字成阵');
  }

  function resize() {
    const rect = field.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    field.style.setProperty('--tower-font', `${Math.max(18, Math.min(43, rect.height * .082))}px`);
  }
  function roundedRect(x, y, width, height, radius) { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); }
  function drawEnemy(enemy) {
    const boss = enemy.kind === 'boss', tank = enemy.kind === 'tank', r = boss ? .33 : tank ? .245 : .205;
    const bob = Math.sin(clock * 7 + enemy.id) * .018, x = enemy.x, y = enemy.y + bob;
    ctx.save();
    ctx.fillStyle = '#4351351c'; ctx.beginPath(); ctx.ellipse(x, y + r + .035, r * .9, .055, 0, 0, Math.PI * 2); ctx.fill();
    if (boss) { ctx.strokeStyle = '#97726733'; ctx.lineWidth = .02; ctx.beginPath(); ctx.arc(x, y, r + .11 + Math.sin(clock * 3) * .025, 0, Math.PI * 2); ctx.stroke(); }
    if (enemy.slowTimer > 0) { ctx.fillStyle = '#85b2bf30'; ctx.strokeStyle = '#8aaeb750'; ctx.lineWidth = .02; ctx.beginPath(); ctx.ellipse(x, y + r, r * 1.25, .085, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.translate(x, y); ctx.rotate(Math.sin(clock * 5 + enemy.id) * .06);
    ctx.fillStyle = enemy.hitFlash > 0 ? '#a29c7e' : boss ? '#6f5050' : enemy.kind === 'armored' ? '#697575' : enemy.kind === 'healer' ? '#788066' : enemy.kind === 'splitter' ? '#7c6e80' : tank ? '#626c58' : enemy.kind === 'swift' ? '#7d8068' : '#58634f';
    roundedRect(-r, -r, r * 2, r * 2, boss ? .075 : .06); ctx.fill();
    if (enemy.poisonTimer > 0) { ctx.strokeStyle = '#9cbb6f'; ctx.lineWidth = .026; ctx.stroke(); }
    if (enemy.armor > 0 && enemy.breakTimer <= 0) { ctx.strokeStyle = '#bcc5bd'; ctx.lineWidth = .025; roundedRect(-r + .03, -r + .03, r * 2 - .06, r * 2 - .06, .04); ctx.stroke(); }
    if (enemy.stunTimer > 0) { ctx.strokeStyle = '#a4d0db'; ctx.lineWidth = .045; roundedRect(-r - .04, -r - .04, r * 2 + .08, r * 2 + .08, .08); ctx.stroke(); }
    if (enemy.breakTimer > 0) { ctx.strokeStyle = '#cba27d'; ctx.lineWidth = .025; ctx.beginPath(); ctx.moveTo(r * .6, -r - .05); ctx.lineTo(r * .15, -r * .3); ctx.lineTo(r * .6, 0); ctx.stroke(); }
    ctx.fillStyle = '#f1efde'; ctx.font = `${boss ? .43 : tank ? .33 : .28}px KaiTi, SimSun, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(enemy.word, 0, .015);
    ctx.restore();
    const barWidth = boss ? .93 : tank ? .62 : .51, barY = y - r - .13;
    ctx.fillStyle = '#66725029'; roundedRect(x - barWidth / 2, barY, barWidth, .044, .022); ctx.fill();
    ctx.fillStyle = boss ? '#9c7665' : enemy.poisonTimer > 0 ? '#7c9b50' : '#83946c'; roundedRect(x - barWidth / 2, barY, barWidth * Math.max(0, enemy.hp / enemy.maxHp), .044, .022); ctx.fill();
    if (boss) { ctx.fillStyle = '#8e7868'; ctx.font = '.13px Microsoft YaHei,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('魁 首', x, barY - .09); }
  }
  function draw(dt) {
    if (!ctx || !canvas.width) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(canvas.width / 10, 0, 0, canvas.height / 8, 0, 0);
    const tower = model.board[selected];
    if (aiming && aimPoint) {
      ctx.fillStyle = '#bd714524'; ctx.strokeStyle = '#b97849'; ctx.lineWidth = .025; ctx.setLineDash([.08, .06]);
      ctx.beginPath(); ctx.arc(aimPoint.x, aimPoint.y, 1.75, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(aimPoint.x - .18, aimPoint.y); ctx.lineTo(aimPoint.x + .18, aimPoint.y); ctx.moveTo(aimPoint.x, aimPoint.y - .18); ctx.lineTo(aimPoint.x, aimPoint.y + .18); ctx.stroke();
    }
    if (tower) {
      const p = PADS[selected], stats = model.stats(tower);
      ctx.fillStyle = `${TYPES[tower.type].color}0b`; ctx.strokeStyle = `${TYPES[tower.type].color}66`; ctx.lineWidth = .017; ctx.setLineDash([.07, .07]);
      ctx.beginPath(); ctx.arc(p.x, p.y, stats.range, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    }
    for (const e of [...model.enemies].sort((a, b) => a.y - b.y)) drawEnemy(e);
    for (const effect of effects) {
      effect.age += dt; const t = Math.min(1, effect.age / effect.duration);
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t); ctx.strokeStyle = effect.color; ctx.fillStyle = effect.color;
      if (effect.kind === 'shot') {
        const x = effect.from.x + (effect.to.x - effect.from.x) * t, y = effect.from.y + (effect.to.y - effect.from.y) * t;
        ctx.lineWidth = effect.element === 'wood' ? .025 : .035;
        ctx.globalAlpha = (1 - t) * .5; ctx.beginPath(); ctx.moveTo(effect.from.x, effect.from.y); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = 1 - t * .5; ctx.beginPath(); ctx.arc(x, y, effect.element === 'fire' ? .08 : .05, 0, Math.PI * 2); ctx.fill();
      } else if (effect.kind === 'particle') {
        ctx.beginPath(); ctx.arc(effect.x + effect.vx * effect.age, effect.y + effect.vy * effect.age, .035 * (1 - t * .6), 0, Math.PI * 2); ctx.fill();
      } else if (effect.kind === 'number') {
        ctx.font = `${effect.text.includes('墨') ? .14 : .18}px Segoe UI,Microsoft YaHei,sans-serif`; ctx.textAlign = 'center'; ctx.fillText(effect.text, effect.x, effect.y - t * .55);
      } else if (effect.kind === 'ring') {
        ctx.lineWidth = .022; ctx.globalAlpha = (1 - t) * .6; ctx.beginPath(); ctx.arc(effect.x, effect.y, .1 + effect.radius * t, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    effects = effects.filter(e => e.age < e.duration);
  }
  function frame(time) {
    const dt = Math.min((time - (lastFrame || time)) / 1000, .1); lastFrame = time; clock += dt;
    model.step(dt * settings.speed); processEvents(); updateAuto(dt); draw(dt);
    uiTimer += dt; saveTimer += dt;
    if (uiTimer > .1) { render(); uiTimer = 0; }
    if (saveTimer > 2) { if (model.status === 'playing') save(); saveTimer = 0; }
    requestAnimationFrame(frame);
  }
  function updateAuto(dt) {
    if (!settings.autoNext || document.hidden || dialog.open || model.status !== 'ready' || model.wave === 0 || drag?.active) { autoKey = ''; setText('#auto-countdown', ''); return; }
    const key = `${model.runId}:${model.wave}`;
    if (autoKey !== key) { autoKey = key; autoRemaining = 3; }
    else autoRemaining -= dt;
    setText('#auto-countdown', `${Math.max(1, Math.ceil(autoRemaining))} 秒`);
    if (autoRemaining <= 0) { autoKey = ''; setText('#auto-countdown', ''); start(); }
  }

  $('#tower-pads').addEventListener('click', event => {
    if (suppressClick) { suppressClick = false; return; }
    const pad = event.target.closest('[data-pad]'); if (pad) clickPad(Number(pad.dataset.pad));
  });
  $('#tower-pads').addEventListener('pointerdown', event => {
    const pad = event.target.closest('[data-pad]'), index = Number(pad?.dataset.pad);
    if (aiming || !pad || !model.board[index] || !model.editable || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag = { index, x: event.clientX, y: event.clientY, active: false, pointerId: event.pointerId, pad };
    pad.setPointerCapture(event.pointerId);
  });
  $('#tower-pads').addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 7) {
      drag.active = true; selected = drag.index; drag.pad.classList.add('dragging');
      const tower = model.board[drag.index]; $('#drag-ghost').textContent = word(tower); $('#drag-ghost').style.color = TYPES[tower.type].color; $('#drag-ghost').hidden = false; render();
    }
    if (!drag.active) return;
    event.preventDefault(); $('#drag-ghost').style.left = `${event.clientX}px`; $('#drag-ghost').style.top = `${event.clientY}px`;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-pad]');
    document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    if (target && Number(target.dataset.pad) !== drag.index) target.classList.add('drop-target');
  });
  function endDrag(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const current = drag; drag = null;
    current.pad.classList.remove('dragging'); document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target')); $('#drag-ghost').hidden = true;
    if (current.active) {
      suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
      const target = !cancelled && document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-pad]');
      if (target && Number(target.dataset.pad) !== current.index) move(current.index, Number(target.dataset.pad));
      else { selected = current.index; render(); }
    }
  }
  $('#tower-pads').addEventListener('pointerup', event => endDrag(event));
  $('#tower-pads').addEventListener('pointercancel', event => endDrag(event, true));
  $('#summon-button').addEventListener('click', () => summon());
  $('#reroll-button').addEventListener('click', () => { const result = act(() => model.reroll()); if (result.error) toast(result.error); else { playTone('summon'); toast(`重书为「${TYPES[result.type].words[0]}」，消耗 8 灵墨`); } });
  $('#target-button').addEventListener('click', () => act(() => model.retarget(selected)));
  document.querySelectorAll('[data-spell]').forEach(button => button.addEventListener('click', () => useSpell(button.dataset.spell)));
  field.addEventListener('pointermove', event => { if (aiming) { const rect = field.getBoundingClientRect(); aimPoint = { x: (event.clientX - rect.left) / rect.width * 10, y: (event.clientY - rect.top) / rect.height * 8 }; } });
  field.addEventListener('pointerleave', () => { aimPoint = null; });
  field.addEventListener('click', event => {
    if (!aiming || model.status !== 'playing') return;
    event.preventDefault(); event.stopPropagation();
    const rect = field.getBoundingClientRect(), point = { x: (event.clientX - rect.left) / rect.width * 10, y: (event.clientY - rect.top) / rect.height * 8 };
    aiming = false; aimPoint = null;
    const result = act(() => model.cast('flame', point)); if (result.error) toast(result.error);
  }, true);
  $('#merge-button').addEventListener('click', mergeAll);
  $('#start-button').addEventListener('click', start);
  $('#pause-button').addEventListener('click', pause);
  $('#resume-button').addEventListener('click', start);
  $('#speed-button').addEventListener('click', () => { settings.speed = settings.speed % 3 + 1; write(SETTINGS_KEY, settings); render(); playTone(); });
  $('#sound-button').addEventListener('click', () => { settings.sound = !settings.sound; playTone(); write(SETTINGS_KEY, settings); renderSound(); });
  $('#help-button').addEventListener('click', openHelp);
  $('#mode-button').addEventListener('click', openModes);
  $('#settings-button').addEventListener('click', openSettings);
  $('#difficulty-badge').addEventListener('click', openSettings);
  $('#rank-button').addEventListener('click', openRank);
  $('#town-button').addEventListener('click', openTown);
  $('#auto-next').addEventListener('change', event => { settings.autoNext = event.target.checked; autoKey = ''; write(SETTINGS_KEY, settings); render(); });
  $('#codex-button').addEventListener('click', openCodex);
  $('#weather-info').addEventListener('click', openWeather);
  $('#tactics-button').addEventListener('click', openTactics);
  $('#restart-button').addEventListener('click', confirmRestart);
  $('#deselect-button').addEventListener('click', () => { selected = -1; render(); });
  $('#sell-button').addEventListener('click', () => { const refund = act(() => model.sell(selected)); if (refund) { selected = -1; render(); toast(`字灵归隐，返还 ${refund} 灵墨`); } });
  document.querySelectorAll('[data-element]').forEach(el => el.addEventListener('click', () => { selected = -1; guideType = el.dataset.element; render(); }));
  dialog.addEventListener('click', event => {
    const mode = event.target.closest('[data-new-mode]');
    if (mode) { settings.difficulty = $('#mode-difficulty').value; write(SETTINGS_KEY, settings); newGame(mode.dataset.newMode, { difficulty: settings.difficulty, rules: settings.rules }); return; }
    const draft = event.target.closest('[data-draft]');
    if (draft) { const result = act(() => model.summon(draftIndex, draft.dataset.draft)); if (result.error) toast(result.error); else closeModal(); return; }
    const town = event.target.closest('[data-town-upgrade]');
    if (town && !town.disabled) { const result = act(() => model.buyUpgrade(town.dataset.townUpgrade)); if (result.error) toast(result.error); $('#dialog-content').innerHTML = townContents(); return; }
    const setting = event.target.closest('[data-settings]');
    if (setting) { applySettings(setting.dataset.settings === 'new'); return; }
    const view = event.target.closest('[data-rank-view]');
    if (view) { rankFilters = { mode: view.dataset.rankView === 'board' ? model.mode : '', difficulty: view.dataset.rankView === 'board' ? model.difficulty : '', rules: view.dataset.rankView === 'board' ? Rank.ruleKey(model.rules) : '', day: model.day || dateKey(), view: view.dataset.rankView, limit: 50 }; refreshRank(); return; }
    const blessing = event.target.closest('[data-blessing]');
    if (blessing) { const key = blessing.dataset.blessing; resumeAfterModal = false; closeModal(); act(() => model.chooseBlessing(key)); return; }
    const action = event.target.closest('[data-dialog-action]')?.dataset.dialogAction;
    if (action === 'close') closeModal(); if (action === 'new-game') newGame();
    if (action === 'modes') openModes();
    if (action === 'rank') openRank();
    if (action === 'rank-more') { rankFilters.limit += 50; refreshRank(); }
    if (action === 'rank-export') exportRank();
    if (action === 'rank-import') { $('#rank-import-file').value = ''; $('#rank-import-file').click(); }
  });
  dialog.addEventListener('change', event => {
    const el = event.target;
    if (el.id === 'mode-difficulty') setText('#mode-difficulty-note', DIFFICULTIES[el.value].description);
    if (el.id === 'setting-difficulty') setText('#difficulty-note', DIFFICULTIES[el.value].description);
    if (el.dataset.rankFilter) { rankFilters[el.dataset.rankFilter] = el.dataset.rankFilter === 'day' && !Rank.validDay(el.value) ? model.day || dateKey() : el.value; rankFilters.limit = 50; refreshRank(el.id); }
  });
  dialog.addEventListener('input', event => { if (event.target.id === 'setting-volume') setText('#volume-value', `${event.target.value}%`); });
  $('#rank-import-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    if (file.size > 1048576) { toast('战绩文件不能超过 1 MB'); return; }
    let text; try { text = await file.text(); } catch { toast('无法读取战绩文件'); return; }
    const parsed = Rank.unpack(text); if (parsed.error) { toast(parsed.error); return; }
    const before = new Set(history.map(e => e.id)); history = Rank.normalize([...history, ...parsed.entries]);
    const added = history.filter(e => !before.has(e.id)).length, saved = write(RANK_KEY, Rank.pack(history));
    syncHistoryBests();
    if (modalKind === 'rank') refreshRank();
    toast(saved ? `已导入 ${added} 局新战绩，重复对局已自动去除` : '已导入，但当前浏览器无法持久保存');
  });
  dialog.addEventListener('cancel', event => { if (modalKind === 'upgrade') event.preventDefault(); });
  dialog.addEventListener('close', () => {
    const shouldResume = resumeAfterModal; resumeAfterModal = false; modalKind = '';
    if (shouldResume && !document.hidden && model.status === 'paused') act(() => model.startWave()); else render();
  });
  document.addEventListener('keydown', event => {
    if (dialog.open || event.repeat || event.ctrlKey || event.altKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    // A focused button owns Enter/Space; keeping native activation avoids double actions.
    if (event.code === 'Space' && event.target.closest('button')) return;
    if (event.code === 'Space') { event.preventDefault(); if (model.status === 'playing') pause(); else start(); }
    else if (event.code === 'KeyS') { event.preventDefault(); summon(); }
    else if (event.code === 'KeyM') { event.preventDefault(); mergeAll(); }
    else if (event.code === 'KeyR') { event.preventDefault(); const result = act(() => model.reroll()); if (result.error) toast(result.error); }
    else if (['Digit1', 'Digit2', 'Digit3'].includes(event.code)) { event.preventDefault(); useSpell({ Digit1: 'flame', Digit2: 'freeze', Digit3: 'mend' }[event.code]); }
    else if (event.code === 'Escape') { selected = -1; aiming = false; aimPoint = null; render(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { resumeAfterModal = false; if (model.status === 'playing') act(() => model.pause()); else save(); } });
  window.addEventListener('pagehide', save);
  new ResizeObserver(resize).observe(field);
  window.zizhenApp = { get model() { return model; }, get settings() { return { ...settings }; }, render, processEvents, newGame };
  syncHistoryBests(); buildPads(); renderSound(); render(); resize(); save(); requestAnimationFrame(frame);
  if (model.status === 'upgrade') openUpgrade();
  else if (['won', 'lost'].includes(model.status)) { updateRecord(true); save(); openResult(); }
  else if (model.status === 'paused') toast('已接上上次的字阵，继续守护山河吧');
})();
