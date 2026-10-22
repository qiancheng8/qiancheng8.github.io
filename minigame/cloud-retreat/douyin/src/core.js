(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else (root.CloudRetreat = root.CloudRetreat || {}).Core = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 1;
  const SAVE_KEY = 'cloud-retreat.save.v1';
  const OFFLINE_CAP = 8 * 3600 * 1000;
  const DEW_INTERVAL = 60000;
  const CROPS = [
    { id: 'wood', name: '青芽竹', element: '木', color: '#578b62', pale: '#e3eddc', time: 22000, stones: 8, qi: 5, desc: '一节青竹，攒一点生机。' },
    { id: 'fire', name: '流萤花', element: '火', color: '#c87956', pale: '#f7e2d4', time: 26000, stones: 10, qi: 6, desc: '把人间灯火，种在云端。' },
    { id: 'earth', name: '云眠菇', element: '土', color: '#a38759', pale: '#efe7d6', time: 30000, stones: 12, qi: 7, desc: '云朵睡着时，会长出小蘑菇。' },
    { id: 'metal', name: '金穗草', element: '金', color: '#b09845', pale: '#f3edcf', time: 24000, stones: 9, qi: 6, desc: '风一吹，满田都是小铃铛。' },
    { id: 'water', name: '凝露莲', element: '水', color: '#5e94a4', pale: '#dfedf0', time: 20000, stones: 7, qi: 5, desc: '清露一滴，映出整个天空。' }
  ];
  const REALMS = [
    { name: '初识灵机', short: '初识', qi: 100, pill: 'qing', count: 1, desc: '一粒仙丹，一步仙途。' },
    { name: '炼气初境', short: '炼气', qi: 280, pill: 'qing', count: 2, desc: '草木与你一同呼吸。' },
    { name: '炼气圆满', short: '圆满', qi: 650, pill: 'yuan', count: 1, desc: '浮云之上，渐入佳境。' },
    { name: '筑基初境', short: '筑基', qi: 1300, pill: 'yuan', count: 2, desc: '以一亩田，筑一颗道心。' },
    { name: '筑基圆满', short: '圆满', qi: 2400, pill: 'five', count: 1, desc: '五行流转，道法自然。' },
    { name: '金丹初境', short: '金丹', qi: 4200, pill: 'five', count: 2, desc: '一颗金丹，照见山河。' },
    { name: '金丹圆满', short: '圆满', qi: 7000, pill: 'five', count: 3, desc: '云山万里，心自逍遥。' },
    { name: '逍遥云仙', short: '逍遥', qi: 0, pill: null, count: 0, desc: '仙途未必遥远，闲心自有天地。' }
  ];
  const RECIPES = [
    { id: 'qing', name: '清露丹', sub: '以草木清露，养一缕灵气', color: '#6e9572', ingredients: { wood: 2, water: 1 }, time: 6000, qi: 40, realm: 0 },
    { id: 'yuan', name: '归元丹', sub: '取萤火金穗，温养根基', color: '#c18b5e', ingredients: { fire: 2, earth: 2, metal: 1 }, time: 9000, qi: 100, realm: 1 },
    { id: 'five', name: '五行仙露', sub: '集五行之灵，化万物之息', color: '#7296a9', ingredients: { wood: 2, fire: 2, earth: 2, metal: 2, water: 2 }, time: 12000, qi: 240, realm: 2 }
  ];
  const BUILDINGS = [
    { id: 'spring', name: '听雨灵泉', sub: '灵植生长更快', icon: 'water', cost: 60 },
    { id: 'cottage', name: '松风云庐', sub: '静修所得更多', icon: 'home', cost: 80 },
    { id: 'furnace', name: '小山丹炉', sub: '炼丹修为更多', icon: 'furnace', cost: 70 }
  ];
  const ROUTES = [
    { id: 0, name: '听风竹海', sub: '竹叶响时，奇遇便来了', realm: 0, color: '#678f73', reward: 1 },
    { id: 1, name: '落霞山径', sub: '循一缕晚霞，寻山中故人', realm: 1, color: '#bf8e6f', reward: 1.65 },
    { id: 2, name: '星眠云屿', sub: '在星光深处，捡一场好梦', realm: 3, color: '#8a91b0', reward: 2.6 }
  ];
  const SPIRITS = [
    { id: 'cat', name: '豆包', kind: '听雨灵狸', cost: 0, food: 'wood', color: '#8a9f73', trait: '收获灵石', perLevel: 6, desc: '喜欢晒太阳，也喜欢帮你数灵石。' },
    { id: 'fox', name: '晚灯', kind: '赤尾灵狐', cost: 40, food: 'fire', color: '#be8c66', trait: '切磋威力', perLevel: 3, desc: '尾巴藏着晚霞，出门时最会壮胆。' },
    { id: 'crane', name: '知白', kind: '衔露云鹤', cost: 70, food: 'water', color: '#83a0a4', trait: '炼丹修为', perLevel: 10, desc: '衔来一滴清露，替你看一炉烟火。' }
  ];
  const MANUALS = [
    { id: 'verdant', name: '青禾养元篇', icon: 'leaf', color: '#849a70', effect: '收获修为 +8% / 重', cost: 12 },
    { id: 'cloud', name: '闲云坐忘录', icon: 'cloud', color: '#89a2a3', effect: '静修 +0.12 / 秒 / 重', cost: 16 },
    { id: 'wind', name: '过山听风步', icon: 'qi', color: '#b29d75', effect: '切磋威力 +2 / 重', cost: 14 }
  ];
  const RELICS = [
    { id: 'bell', name: '青露铃', element: 'wood', color: '#8b9e75', effect: '收获灵石 +8%、修为 +6% / 阶' },
    { id: 'lamp', name: '照山灯', element: 'fire', color: '#b79468', effect: '炼丹修为 +15% / 阶' },
    { id: 'sword', name: '归云剑', element: 'metal', color: '#8c9fa4', effect: '切磋威力 +4 / 阶' }
  ];
  const COMMISSIONS = [
    { id: 'tea', name: '鹤来茶亭 · 新茶待客', cost: { herbs: { wood: 3, water: 1 } }, favor: 12, stones: 24, qi: 10, realm: 0 },
    { id: 'lights', name: '灯火驿站 · 点一盏灯', cost: { herbs: { fire: 3, earth: 1 } }, favor: 14, stones: 28, qi: 12, realm: 0 },
    { id: 'medicine', name: '山泉药庐 · 温养来客', cost: { pills: { qing: 1 } }, favor: 20, stones: 45, qi: 15, realm: 0 },
    { id: 'study', name: '折枝书舍 · 修一卷书', cost: { herbs: { wood: 4, metal: 2 } }, favor: 16, stones: 32, qi: 16, realm: 0 },
    { id: 'kitchen', name: '松溪小厨 · 熬山菌汤', cost: { herbs: { earth: 3, water: 2 } }, favor: 14, stones: 30, qi: 12, realm: 0 },
    { id: 'watch', name: '巡山守望 · 山道引灯', cost: { herbs: { fire: 2, metal: 3 } }, favor: 16, stones: 36, qi: 18, realm: 0 },
    { id: 'festival', name: '四时花会 · 五色春光', cost: { herbs: { wood: 2, fire: 2, earth: 2, metal: 2, water: 2 } }, favor: 30, stones: 60, qi: 30, realm: 0 },
    { id: 'alchemy', name: '云上丹会 · 归元一炉', cost: { pills: { yuan: 1 } }, favor: 34, stones: 75, qi: 25, realm: 1 }
  ];
  const SECT_GOALS = [
    { name: '结一段仙缘', desc: '与第一位灵伴结缘', metric: 'bonds', target: 1, favor: 8 },
    { name: '云间好邻里', desc: '交付一份山门委托', metric: 'orders', target: 1, ore: 1, stones: 20 },
    { name: '一口草木香', desc: '喂养灵伴一次', metric: 'feeds', target: 1, favor: 8 },
    { name: '草木皆有师', desc: '习得一门功法', metric: 'manuals', target: 1, ore: 1 },
    { name: '云外拾星砂', desc: '领取一次灵伴采集回礼', metric: 'dispatches', target: 1, favor: 10 },
    { name: '小物亦成灵', desc: '打造第一件灵器', metric: 'crafted', target: 1, favor: 15, stones: 30 }
  ];
  const GOALS = [
    { name: '第一捧灵气', desc: '收获 3 块灵田', metric: 'harvests', target: 3, stones: 30, qi: 15 },
    { name: '种满小天地', desc: '让 9 块灵田都有灵植', metric: 'planted', target: 9, stones: 40, qi: 20 },
    { name: '一炉草木香', desc: '炼成 1 炉仙丹', metric: 'brews', target: 1, stones: 50, qi: 25 },
    { name: '出门听听风', desc: '完成 1 次云游', metric: 'journeys', target: 1, stones: 60, qi: 30 },
    { name: '初踏仙途', desc: '突破至炼气初境', metric: 'realm', target: 1, stones: 80, qi: 40 },
    { name: '五行相逢', desc: '布置出 6 处相生共鸣', metric: 'links', target: 6, stones: 100, qi: 60 },
    { name: '把小日子过好', desc: '累计升级建筑 3 次', metric: 'upgrades', target: 3, stones: 120, qi: 80 },
    { name: '云间有来客', desc: '完成 3 次云游', metric: 'journeys', target: 3, stones: 160, qi: 100 },
    { name: '长风送我行', desc: '突破至筑基初境', metric: 'realm', target: 3, stones: 220, qi: 160 },
    { name: '满田都是好光景', desc: '累计收获 100 块灵田', metric: 'harvests', target: 100, stones: 300, qi: 240 },
    { name: '五行酿成露', desc: '炼成 1 炉五行仙露', metric: 'fiveBrews', target: 1, stones: 360, qi: 300 },
    { name: '山河入一梦', desc: '突破至逍遥云仙', metric: 'realm', target: 7, stones: 888, qi: 888 }
  ];
  const NARRATIVES = [
    { title: '一只迷路的纸鹤', text: '风把小纸鹤吹进了竹梢。它扑腾着翅膀，\n像是有很要紧的信，想送给某个人。', choices: [{ label: '送它一程', hint: '修为 +18', qi: 18 }, { label: '借它一阵顺风', hint: '灵石 +28', stones: 28 }] },
    { title: '山里人的一碗茶', text: '转过石阶，一位老者正好沏了新茶。\n“赶路的人，先坐下来歇歇吧。”', choices: [{ label: '坐下聊聊草木', hint: '灵植 +3', herbs: 3 }, { label: '以清露回赠', hint: '消耗灵露 1 · 修为 +50', dewCost: 1, qi: 50 }] },
    { title: '藏在云里的小摊', text: '云雾里支着一把纸伞，摊主是只胖狸猫。\n它眯着眼说：“今天，只做一笔好买卖。”', choices: [{ label: '换一包山中灵植', hint: '消耗灵石 15 · 灵植 +5', stoneCost: 15, herbs: 5 }, { label: '帮它招呼生意', hint: '灵石 +22 · 修为 +10', stones: 22, qi: 10 }] }
  ];
  const cap = (n, max = 1e9) => Math.min(max, Math.max(0, Number.isFinite(n) ? n : 0));
  const int = (n, max) => Math.floor(cap(n, max));
  const crop = id => CROPS.find(c => c.id === id);
  const recipe = id => RECIPES.find(c => c.id === id);
  function random(s) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
  function create(now = Date.now(), seed = now >>> 0) {
    const s = { version: VERSION, seed, createdAt: now, lastAt: now, realm: 0, stones: 80, qi: 0, dew: 3, dewAt: now, herbs: {}, pills: { qing: 0, yuan: 0, five: 0 }, plots: Array(9).fill(null), buildings: { spring: 0, cottage: 0, furnace: 0 }, stats: { harvests: 0, planted: 5, brews: 0, journeys: 0, upgrades: 0, links: 0, fiveBrews: 0 }, goal: 0, brewing: null, journey: null, travelReadyAt: 0, selectedCrop: 'wood', settings: { sound: false, vibration: true }, log: [{ text: '一座小岛，一亩灵田。今天起，在云间慢慢修行。', at: now }], events: [] };
    CROPS.forEach(c => { s.herbs[c.id] = 0; });
    [0, 1, 3].forEach(i => { s.plots[i] = { crop: 'wood', start: now - 23000, duration: 22000 }; });
    [2, 4].forEach(i => { s.plots[i] = { crop: 'water', start: now - 8000, duration: 20000 }; });
    initializeSect(s); return s;
  }
  function note(s, text, now) { s.log.unshift({ text, at: now }); s.log = s.log.slice(0, 24); }
  function emit(s, type, text, data) { s.events.push({ type, text, ...data }); if (s.events.length > 30) s.events.shift(); }
  function duration(s, id) { return Math.round(crop(id).time / (1 + s.buildings.spring * 0.12 + s.realm * 0.04)); }
  function passiveRate(s) { return 0.22 + s.buildings.cottage * 0.18 + s.realm * 0.08 + effects(s).passive; }
  function adjacent(i) { const a = []; if (i % 3 > 0) a.push(i - 1); if (i % 3 < 2) a.push(i + 1); if (i > 2) a.push(i - 3); if (i < 6) a.push(i + 3); return a; }
  function resonates(a, b) { const ia = CROPS.findIndex(c => c.id === a); const ib = CROPS.findIndex(c => c.id === b); return ia >= 0 && ib >= 0 && ((ia + 1) % 5 === ib || (ib + 1) % 5 === ia); }
  function links(s) { const a = []; s.plots.forEach((p, i) => { if (p) adjacent(i).forEach(j => { if (j > i && s.plots[j] && resonates(p.crop, s.plots[j].crop)) a.push([i, j]); }); }); return a; }
  function bonus(s, i) { const p = s.plots[i]; if (!p) return 0; const near = adjacent(i).filter(j => s.plots[j] && resonates(p.crop, s.plots[j].crop)).length; const all = new Set(s.plots.filter(Boolean).map(p => p.crop)).size === 5; return near * 0.2 + (all ? 0.2 : 0); }
  function progress(p, now) { return p ? Math.min(1, Math.max(0, (now - p.start) / p.duration)) : 0; }
  function ready(s, now) { return s.plots.map((p, i) => progress(p, now) >= 1 ? i : -1).filter(i => i >= 0); }
  function syncStats(s) { s.stats.planted = Math.max(s.stats.planted, s.plots.filter(Boolean).length); s.stats.links = Math.max(s.stats.links, links(s).length); }
  function initializeSect(s) {
    s.favor = 0; s.ore = 0;
    s.spirits = { owned: {}, active: null, mission: null };
    s.manuals = { levels: { verdant: 0, cloud: 0, wind: 0 }, active: null };
    s.relics = { levels: { bell: 0, lamp: 0, sword: 0 }, active: null };
    s.sect = { orders: [{ uid: 1, template: 'tea' }, { uid: 2, template: 'lights' }, { uid: 3, template: 'medicine' }], nextOrder: 4, refreshAt: 0, goal: 0 };
    ['bonds', 'feeds', 'orders', 'manuals', 'crafted', 'dispatches'].forEach(k => { s.stats[k] = 0; });
  }
  function spirit(id) { return SPIRITS.find(p => p.id === id); }
  function commission(id) { return COMMISSIONS.find(p => p.id === id); }
  function effects(s) {
    const out = { harvestStones: 0, harvestQi: 0, brewQi: 0, power: 0, passive: 0 };
    const pet = s.spirits && s.spirits.owned[s.spirits.active], ml = s.manuals, rl = s.relics;
    if (pet) { if (s.spirits.active === 'cat') out.harvestStones += .06 * pet.level; if (s.spirits.active === 'fox') out.power += 3 * pet.level; if (s.spirits.active === 'crane') out.brewQi += .1 * pet.level; }
    if (ml && ml.active) { const lv = ml.levels[ml.active] || 0; if (ml.active === 'verdant') out.harvestQi += .08 * lv; if (ml.active === 'cloud') out.passive += .12 * lv; if (ml.active === 'wind') out.power += 2 * lv; }
    if (rl && rl.active) { const lv = rl.levels[rl.active] || 0; if (rl.active === 'bell') { out.harvestStones += .08 * lv; out.harvestQi += .06 * lv; } if (rl.active === 'lamp') out.brewQi += .15 * lv; if (rl.active === 'sword') out.power += 4 * lv; }
    return out;
  }
  function brewBonus(s) { return s.buildings.furnace * .25 + effects(s).brewQi; }
  function canAfford(s, cost) {
    return ['stones', 'favor', 'ore'].every(k => (cost[k] || 0) <= s[k]) && Object.entries(cost.herbs || {}).every(([id, n]) => s.herbs[id] >= n) && Object.entries(cost.pills || {}).every(([id, n]) => s.pills[id] >= n);
  }
  function pay(s, cost) {
    ['stones', 'favor', 'ore'].forEach(k => { s[k] -= cost[k] || 0; }); Object.entries(cost.herbs || {}).forEach(([id, n]) => { s.herbs[id] -= n; }); Object.entries(cost.pills || {}).forEach(([id, n]) => { s.pills[id] -= n; });
  }
  function adoptSpirit(s, id, now) {
    const p = spirit(id); if (!p || s.spirits.owned[id]) return { ok: false, reason: '这位灵伴已经与你结缘了。' };
    if (s.favor < p.cost) return { ok: false, reason: '还需云笺 ' + p.cost + '，交付山门委托就能获得。' };
    s.favor -= p.cost; s.spirits.owned[id] = { level: 1, bond: 0 }; if (!s.spirits.active) s.spirits.active = id; s.stats.bonds++;
    note(s, '与' + p.kind + '「' + p.name + '」结缘。小岛从此多了一位伙伴。', now);
    return { ok: true, text: p.name + '来啦 · ' + (s.spirits.active === id ? '契印加成已生效' : '可切换契印获得加成') };
  }
  function equipSpirit(s, id) {
    if (!spirit(id) || !s.spirits.owned[id]) return { ok: false, reason: '先与这位灵伴结缘吧。' };
    s.spirits.active = id; return { ok: true, text: '与' + spirit(id).name + '缔结契印 · 加成已切换' };
  }
  function feedSpirit(s, id, now) {
    const p = spirit(id), pet = s.spirits.owned[id];
    if (!p || !pet) return { ok: false, reason: '先与灵伴结缘，再请它吃点好东西。' };
    if (pet.level >= 5) return { ok: false, reason: p.name + '已经长大，亲密修行圆满啦。' };
    if (s.spirits.mission && s.spirits.mission.spirit === id) return { ok: false, reason: '它还在采集，领回礼后再喂养吧。' };
    if (s.herbs[p.food] < 2) return { ok: false, reason: '喂养需要' + crop(p.food).name + ' ×2。' };
    s.herbs[p.food] -= 2; pet.bond += 10; s.stats.feeds++;
    const upgraded = pet.bond >= pet.level * 20;
    if (upgraded) { pet.bond -= pet.level * 20; pet.level++; if (pet.level === 5) pet.bond = 0; note(s, p.name + '成长至 ' + pet.level + ' 级，契印变得更强了。', now); }
    return { ok: true, text: upgraded ? p.name + '长到 Lv.' + pet.level + '啦' : p.name + '亲密度 +10 · 再喂养就会慢慢长大' };
  }
  function sendSpirit(s, now) {
    const id = s.spirits.active, p = spirit(id), pet = s.spirits.owned[id];
    if (!p || !pet) return { ok: false, reason: '先结缘一位灵伴，再请它出门采集。' };
    if (s.spirits.mission) return { ok: false, reason: '还有一位灵伴在外，先接它回家吧。' };
    const herbs = { [p.food]: 2 }, second = id === 'cat' ? 'water' : id === 'fox' ? 'metal' : 'earth'; herbs[second] = 2;
    for (let i = 0; i < pet.level; i++) { const c = CROPS[Math.floor(random(s) * 5)].id; herbs[c] = (herbs[c] || 0) + 1; }
    s.spirits.mission = { spirit: id, start: now, endsAt: now + 45000, reward: { ore: 2 + pet.level, qi: 10 + pet.level * 4, herbs } };
    return { ok: true, text: p.name + '踏云出门，45 秒后带星砂与灵植回来' };
  }
  function claimDispatch(s, now) {
    const m = s.spirits.mission;
    if (!m || now < m.endsAt) return { ok: false, reason: '灵伴还在采集，再等一会儿。' };
    const reward = m.reward; s.ore = cap(s.ore + reward.ore); s.qi = cap(s.qi + reward.qi); Object.entries(reward.herbs).forEach(([id, n]) => { s.herbs[id] = cap(s.herbs[id] + n); });
    s.stats.dispatches++; s.spirits.mission = null; note(s, spirit(m.spirit).name + '采集归来，带回星砂 ' + reward.ore + ' 与一包灵植。', now);
    return { ok: true, text: '灵伴归来 · 星砂 +' + reward.ore + ' · 修为 +' + reward.qi, reward };
  }
  function makeOrder(s, excluded) {
    const pool = COMMISSIONS.filter(o => s.realm >= o.realm && !excluded.includes(o.id)); const choice = pool[Math.floor(random(s) * pool.length)];
    return { uid: s.sect.nextOrder++, template: choice.id };
  }
  function submitOrder(s, uid, now) {
    const i = s.sect.orders.findIndex(o => o.uid === uid); if (i < 0) return { ok: false, reason: '这份委托已经交付，看看新的来信吧。' };
    const o = commission(s.sect.orders[i].template); if (!canAfford(s, o.cost)) return { ok: false, reason: '材料还没备齐，先种植或炼丹，再来交付。' };
    pay(s, o.cost); s.favor = cap(s.favor + o.favor); s.stones = cap(s.stones + o.stones); s.qi = cap(s.qi + o.qi); s.stats.orders++;
    const next = makeOrder(s, s.sect.orders.map(o => o.template)); s.sect.orders[i] = next; note(s, '完成「' + o.name + '」，邻里赠你云笺 ' + o.favor + '。', now);
    return { ok: true, text: '委托完成 · 云笺 +' + o.favor + ' · 灵石 +' + o.stones };
  }
  function refreshOrders(s, now) {
    if (now < s.sect.refreshAt) return { ok: false, reason: '纸鹤正在送信，再等 ' + Math.ceil((s.sect.refreshAt - now) / 1000) + ' 秒。' };
    const old = s.sect.orders.map(o => o.template), next = [];
    for (let i = 0; i < 3; i++) next.push(makeOrder(s, [...old, ...next.map(o => o.template)]));
    s.sect.orders = next; s.sect.refreshAt = now + 30000; return { ok: true, text: '新的邻里来信到了 · 免费刷新，每 30 秒一次' };
  }
  function manualCost(s, id) { const m = MANUALS.find(m => m.id === id); return m ? { favor: m.cost * (s.manuals.levels[id] + 1), stones: 20 * (s.manuals.levels[id] + 1) } : null; }
  function studyManual(s, id, now) {
    const m = MANUALS.find(m => m.id === id), lv = s.manuals.levels[id];
    if (!m || lv >= 5) return { ok: false, reason: '这门功法已经参悟圆满了。' };
    const cost = manualCost(s, id); if (!canAfford(s, cost)) return { ok: false, reason: '参悟需要云笺 ' + cost.favor + '、灵石 ' + cost.stones + '。' };
    pay(s, cost); s.manuals.levels[id]++; if (!lv) s.stats.manuals++; if (!s.manuals.active) s.manuals.active = id;
    note(s, '参悟《' + m.name + '》至第 ' + (lv + 1) + ' 重。', now); return { ok: true, text: '参悟成功 · ' + m.name + ' ' + (lv + 1) + ' 重' };
  }
  function equipManual(s, id) {
    const m = MANUALS.find(m => m.id === id); if (!m || !s.manuals.levels[id]) return { ok: false, reason: '先习得功法，再选择运转。' };
    s.manuals.active = id; return { ok: true, text: '正在运转《' + m.name + '》' };
  }
  function relicCost(s, id) { const r = RELICS.find(r => r.id === id); if (!r) return null; const rank = s.relics.levels[id] + 1; return { ore: rank * 3, stones: rank * 40, herbs: { [r.element]: rank * 3 } }; }
  function forgeRelic(s, id, now) {
    const r = RELICS.find(r => r.id === id), lv = s.relics.levels[id]; if (!r || lv >= 3) return { ok: false, reason: '这件灵器已经淬炼圆满了。' };
    const cost = relicCost(s, id); if (!canAfford(s, cost)) return { ok: false, reason: '星砂或灵植还不够，可让灵伴采集，或云游带回星砂。' };
    pay(s, cost); s.relics.levels[id]++; if (!lv) s.stats.crafted++; if (!s.relics.active) s.relics.active = id;
    note(s, (lv ? '淬炼' : '打造') + '「' + r.name + '」至 ' + (lv + 1) + ' 阶。', now); return { ok: true, text: r.name + '已成 · ' + (lv + 1) + ' 阶' };
  }
  function equipRelic(s, id) { const r = RELICS.find(r => r.id === id); if (!r || !s.relics.levels[id]) return { ok: false, reason: '先打造这件灵器，再佩戴吧。' }; s.relics.active = id; return { ok: true, text: '已佩戴' + r.name + ' · 加成生效' }; }
  function sectProgress(s, index = s.sect.goal) { const g = SECT_GOALS[index]; return g ? Math.min(g.target, s.stats[g.metric]) : 0; }
  function claimSectGoal(s, now) {
    const g = SECT_GOALS[s.sect.goal]; if (!g || sectProgress(s) < g.target) return { ok: false, reason: '跟着山门手帖，结识更多云间朋友。' };
    ['favor', 'ore', 'stones'].forEach(k => { s[k] = cap(s[k] + (g[k] || 0)); }); s.sect.goal++; note(s, '完成山门手帖「' + g.name + '」。', now);
    return { ok: true, text: '山门赠礼 · ' + (g.favor ? '云笺 +' + g.favor : '星砂 +' + g.ore) + (g.stones ? ' · 灵石 +' + g.stones : '') };
  }
  function loadSect(s, v, now) {
    s.favor = int(v.favor); s.ore = int(v.ore);
    const pets = v.spirits, manuals = v.manuals, relics = v.relics;
    if (pets && typeof pets === 'object') {
      for (const p of SPIRITS) {
        const saved = pets.owned && pets.owned[p.id];
        if (saved && typeof saved === 'object' && Number.isFinite(saved.level) && saved.level >= 1) { const lv = int(saved.level, 5); s.spirits.owned[p.id] = { level: lv, bond: lv === 5 ? 0 : int(saved.bond, lv * 20 - 1) }; }
      }
      if (spirit(pets.active) && s.spirits.owned[pets.active]) s.spirits.active = pets.active;
      const m = pets.mission;
      if (m && spirit(m.spirit) && s.spirits.owned[m.spirit] && Number.isFinite(m.start) && Number.isFinite(m.endsAt) && m.endsAt >= m.start && m.reward && typeof m.reward === 'object') {
        const reward = { ore: int(m.reward.ore, 7), qi: int(m.reward.qi, 30), herbs: {} };
        CROPS.forEach(c => { const n = int(m.reward.herbs && m.reward.herbs[c.id], 9); if (n) reward.herbs[c.id] = n; });
        s.spirits.mission = { spirit: m.spirit, start: cap(m.start, now), endsAt: cap(m.endsAt, now + 45000), reward };
      }
    }
    for (const [saved, slot, definitions, max] of [[manuals, s.manuals, MANUALS, 5], [relics, s.relics, RELICS, 3]]) {
      if (!saved || typeof saved !== 'object') continue;
      definitions.forEach(d => { slot.levels[d.id] = int(saved.levels && saved.levels[d.id], max); });
      if (definitions.some(d => d.id === saved.active) && slot.levels[saved.active]) slot.active = saved.active;
    }
    s.stats.bonds = Math.max(s.stats.bonds, Object.keys(s.spirits.owned).length);
    s.stats.manuals = Math.max(s.stats.manuals, Object.values(s.manuals.levels).filter(Boolean).length);
    s.stats.crafted = Math.max(s.stats.crafted, Object.values(s.relics.levels).filter(Boolean).length);
    if (v.sect && typeof v.sect === 'object') {
      const g = v.sect;
      if (Array.isArray(g.orders) && g.orders.length === 3 && g.orders.every(o => o && commission(o.template) && Number.isInteger(o.uid) && o.uid > 0 && o.uid < 1e9) && new Set(g.orders.map(o => o.uid)).size === 3 && new Set(g.orders.map(o => o.template)).size === 3) {
        s.sect.orders = g.orders.map(o => ({ uid: o.uid, template: o.template }));
      }
      s.sect.nextOrder = Math.max(int(g.nextOrder), ...s.sect.orders.map(o => o.uid + 1)); s.sect.refreshAt = cap(g.refreshAt, now + 30000); s.sect.goal = int(g.goal, SECT_GOALS.length);
    }
  }
  function plant(s, index, id, now) {
    if (!Number.isInteger(index) || index < 0 || index > 8 || !crop(id)) return { ok: false, reason: '请选择一块灵田和一株灵植。' };
    const old = s.plots[index];
    if (old && progress(old, now) >= 1) return { ok: false, reason: '灵植已成熟，先收获再移栽吧。' };
    const ratio = old ? progress(old, now) : 0;
    const d = duration(s, id);
    s.plots[index] = { crop: id, start: now - ratio * d, duration: d };
    s.selectedCrop = id; syncStats(s);
    return { ok: true, text: old ? '已移栽，保留原来的生长进度' : '种下一株' + crop(id).name };
  }
  function sowAll(s, id, now) {
    if (!crop(id)) return { ok: false, reason: '请先选择灵植。' };
    let count = 0; s.plots.forEach((p, i) => { if (!p) { plant(s, i, id, now); count++; } });
    return count ? { ok: true, count, text: '种好 ' + count + ' 块灵田，等风也等长大' } : { ok: false, reason: '灵田已经种满啦。' };
  }
  function harvest(s, indices, now) {
    const result = { ok: false, count: 0, stones: 0, qi: 0, herbs: {} }, buffs = effects(s);
    const valid = [...new Set(indices)].filter(i => Number.isInteger(i) && i >= 0 && i < 9 && progress(s.plots[i], now) >= 1);
    // Calculate all rewards before replanting so a group harvest has one consistent layout bonus.
    for (const i of valid) {
      const p = s.plots[i], c = crop(p.crop), b = bonus(s, i), n = b >= 0.4 ? 2 : 1;
      const stones = Math.round(c.stones * (1 + b) * (1 + s.realm * 0.08) * (1 + buffs.harvestStones));
      const qi = Math.round(c.qi * (1 + b) * (1 + buffs.harvestQi));
      result.stones += stones; result.qi += qi; result.herbs[c.id] = (result.herbs[c.id] || 0) + n; result.count++;
    }
    if (!result.count) return { ...result, reason: '灵植正在长大，再等等就好。' };
    for (const i of valid) { const id = s.plots[i].crop; s.plots[i] = { crop: id, start: now, duration: duration(s, id) }; }
    for (const [id, n] of Object.entries(result.herbs)) s.herbs[id] = cap(s.herbs[id] + n);
    s.stones = cap(s.stones + result.stones); s.qi = cap(s.qi + result.qi); s.stats.harvests += result.count;
    result.ok = true; result.text = '灵石 +' + result.stones + '  ·  修为 +' + result.qi + '，已自动续种';
    return result;
  }
  function rain(s, now) {
    if (!s.dew) return { ok: false, reason: '灵露每分钟恢复 1 滴，最多存 4 滴。' };
    if (!s.plots.some(p => p && progress(p, now) < 1)) return { ok: false, reason: '种下灵植后，再唤一场雨吧。' };
    if (s.dew === 4) s.dewAt = now;
    s.dew--; s.plots.forEach(p => { if (p && progress(p, now) < 1) p.start -= 12000; });
    return { ok: true, text: '好雨知时节，整片灵田快长 12 秒' };
  }
  function canBrew(s, id) { const r = recipe(id); return !!r && !s.brewing && s.realm >= r.realm && Object.entries(r.ingredients).every(([k, n]) => s.herbs[k] >= n); }
  function brew(s, id, now) {
    const r = recipe(id);
    if (!r || s.realm < r.realm) return { ok: false, reason: '继续修行，就能解锁这张丹方。' };
    if (s.brewing) return { ok: false, reason: '炉火正温，再等这一炉出丹。' };
    if (!canBrew(s, id)) return { ok: false, reason: '灵植还不够，去灵田收一收吧。' };
    Object.entries(r.ingredients).forEach(([k, n]) => { s.herbs[k] -= n; });
    s.brewing = { recipe: id, start: now, endsAt: now + r.time, bonus: brewBonus(s) };
    return { ok: true, text: '炉火已起，' + r.time / 1000 + ' 秒后自动收丹' };
  }
  function buildingCost(s, id) { const b = BUILDINGS.find(b => b.id === id); return b ? Math.round(b.cost * Math.pow(1.85, s.buildings[id])) : Infinity; }
  function upgrade(s, id, now) {
    const b = BUILDINGS.find(b => b.id === id);
    if (!b || s.buildings[id] >= 5) return { ok: false, reason: '这座建筑已经圆满了。' };
    const cost = buildingCost(s, id);
    if (s.stones < cost) return { ok: false, reason: '还差 ' + Math.ceil(cost - s.stones) + ' 灵石，再收一轮灵田吧。' };
    s.stones -= cost; s.buildings[id]++; s.stats.upgrades++;
    if (id === 'spring') s.plots.forEach(p => { if (p) { const r = progress(p, now); p.duration = duration(s, p.crop); p.start = now - r * p.duration; } });
    note(s, b.name + '升至 ' + s.buildings[id] + ' 级。小岛又好了一点。', now);
    return { ok: true, text: b.name + '升至 ' + s.buildings[id] + ' 级' };
  }
  function canBreakthrough(s) { const r = REALMS[s.realm]; return s.realm < REALMS.length - 1 && s.qi >= r.qi && s.pills[r.pill] >= r.count; }
  function breakthrough(s, now) {
    if (s.realm === REALMS.length - 1) return { ok: false, reason: '已至逍遥云仙，继续经营你的小天地吧。' };
    const r = REALMS[s.realm];
    if (!canBreakthrough(s)) return { ok: false, reason: '还需修为 ' + r.qi + ' 与' + recipe(r.pill).name + ' ×' + r.count };
    s.qi -= r.qi; s.pills[r.pill] -= r.count; s.realm++;
    note(s, '你突破至「' + REALMS[s.realm].name + '」。风也为你停留了一瞬。', now);
    emit(s, 'realm', REALMS[s.realm].name);
    return { ok: true, text: '突破成功 · ' + REALMS[s.realm].name };
  }
  function goalProgress(s, index = s.goal) { const g = GOALS[index]; return g ? Math.min(g.target, g.metric === 'realm' ? s.realm : s.stats[g.metric]) : 0; }
  function claimGoal(s, now) {
    const g = GOALS[s.goal];
    if (!g || goalProgress(s) < g.target) return { ok: false, reason: '慢慢来，云间的日子还很长。' };
    s.stones = cap(s.stones + g.stones); s.qi = cap(s.qi + g.qi); s.goal++;
    note(s, '完成札记「' + g.name + '」，收下了云间赠礼。', now);
    return { ok: true, text: '札记完成 · 灵石 +' + g.stones + ' · 修为 +' + g.qi };
  }
  function power(s) { return 9 + s.realm * 4 + s.buildings.furnace + Math.floor(links(s).length / 3) + effects(s).power; }
  function startJourney(s, routeId, now) {
    const r = ROUTES[routeId];
    if (s.journey) return { ok: false, reason: '还有一段云路，等你走完。' };
    if (!r || s.realm < r.realm) return { ok: false, reason: '先提升境界，再去更远的云山。' };
    if (now < s.travelReadyAt) return { ok: false, reason: '歇歇脚，' + Math.ceil((s.travelReadyAt - now) / 1000) + ' 秒后再出发' };
    s.journey = { route: routeId, step: 0, narrative: Math.floor(random(s) * NARRATIVES.length), status: 'event', loot: { stones: 0, qi: 0, ore: 1 + routeId, herbs: {} }, battle: null };
    s.travelReadyAt = now + 45000;
    return { ok: true, text: '出发，去' + r.name + '听听风' };
  }
  function encounter(s) {
    const j = s.journey; if (!j) return null;
    if (j.step === 0) return NARRATIVES[j.narrative];
    if (j.step === 1) return { title: '守泉的小石灵', text: '一块圆滚滚的石头伸了个懒腰，拦住去路。\n“想喝山泉？先陪我过两招！”', choices: [{ label: '御风切磋', hint: '自动交手 · 灵石与修为', battle: true }, { label: '送它两株青芽竹', hint: '青芽竹 ×2 · 和气生财', woodCost: 2, stones: 38, qi: 24 }] };
    return { title: '带一片云回家', text: '翻过最后一道山梁，天地忽然很静。\n掌心落下一点星光，是山川送你的回礼。', choices: [{ label: '采一束山中灵植', hint: '灵植 +6 · 修为 +20', herbs: 6, qi: 20 }, { label: '把星光酿成清露', hint: '灵露 +1 · 灵石 +35', dew: 1, stones: 35 }] };
  }
  function addLoot(s, choice) {
    const j = s.journey, multi = ROUTES[j.route].reward;
    if (choice.stones) j.loot.stones += Math.round(choice.stones * multi);
    if (choice.qi) j.loot.qi += Math.round(choice.qi * multi);
    if (choice.herbs) for (let i = 0; i < Math.round(choice.herbs * multi); i++) { const id = CROPS[Math.floor(random(s) * 5)].id; j.loot.herbs[id] = (j.loot.herbs[id] || 0) + 1; }
    if (choice.dew) s.dew = Math.min(4, s.dew + choice.dew);
  }
  function nextStop(s) { s.journey.step++; if (s.journey.step >= 3) s.journey.status = 'reward'; else s.journey.status = 'event'; }
  function choose(s, index, now) {
    const j = s.journey; if (!j || j.status !== 'event' || (index !== 0 && index !== 1)) return { ok: false, reason: '先走完眼前这段云路。' };
    const choice = encounter(s).choices[index];
    if ((choice.dewCost || 0) > s.dew) return { ok: false, reason: '灵露不够，选另一条路也有好风景。' };
    if ((choice.stoneCost || 0) > s.stones) return { ok: false, reason: '灵石不够，帮摊主招呼生意也不错。' };
    if ((choice.woodCost || 0) > s.herbs.wood) return { ok: false, reason: '青芽竹还不够，可以御风切磋。' };
    s.dew -= choice.dewCost || 0; s.stones -= choice.stoneCost || 0; s.herbs.wood -= choice.woodCost || 0;
    if (choice.battle) {
      const hp = 70 + s.realm * 14; j.status = 'battle'; j.battle = { hp, maxHp: hp, enemy: 40 + j.route * 32, maxEnemy: 40 + j.route * 32, turn: 0, lastAt: now, used: false, boost: false, log: '小石灵拍拍肚皮，做好了准备。' };
    } else { addLoot(s, choice); nextStop(s); }
    return { ok: true };
  }
  function battleSkill(s, type) {
    const j = s.journey, b = j && j.battle;
    if (!j || j.status !== 'battle' || b.used || !['heal', 'wind'].includes(type)) return { ok: false, reason: '每场切磋只能施展一次法术。' };
    b.used = true;
    if (type === 'heal') { b.hp = Math.min(b.maxHp, b.hp + Math.round(b.maxHp * 0.4)); b.log = '春风化雨，回复了四成气血。'; }
    else { b.boost = true; b.log = '御风而行，后续出手威力翻倍。'; }
    return { ok: true, text: b.log };
  }
  function settleJourney(s, now) {
    const j = s.journey;
    if (!j || j.status !== 'reward') return { ok: false, reason: '还有风景没看完呢。' };
    s.stones = cap(s.stones + j.loot.stones); s.qi = cap(s.qi + j.loot.qi); s.ore = cap(s.ore + j.loot.ore);
    Object.entries(j.loot.herbs).forEach(([k, n]) => { s.herbs[k] = cap(s.herbs[k] + n); });
    s.stats.journeys++; note(s, '从' + ROUTES[j.route].name + '归来，带回灵石 ' + j.loot.stones + '、修为 ' + j.loot.qi + '。', now);
    const reward = { ...j.loot }; s.journey = null;
    return { ok: true, text: '平安归来 · 灵石 +' + reward.stones + ' · 星砂 +' + reward.ore, reward };
  }
  function advance(s, now, battleActive = false) {
    // A clock moving backwards must never grant progress or an extra offline payout.
    const effectiveNow = Math.max(s.lastAt, now), dt = Math.min(OFFLINE_CAP, effectiveNow - s.lastAt);
    s.qi = cap(s.qi + dt / 1000 * passiveRate(s)); s.lastAt = effectiveNow;
    if (s.dew < 4 && effectiveNow >= s.dewAt + DEW_INTERVAL) {
      const n = Math.floor((effectiveNow - s.dewAt) / DEW_INTERVAL); s.dew = Math.min(4, s.dew + n); s.dewAt += n * DEW_INTERVAL;
    }
    if (s.dew === 4) s.dewAt = effectiveNow;
    if (s.brewing && effectiveNow >= s.brewing.endsAt) {
      const b = s.brewing, r = recipe(b.recipe), qi = Math.round(r.qi * (1 + b.bonus)); s.pills[r.id] = cap(s.pills[r.id] + 1); s.qi = cap(s.qi + qi); s.stats.brews++; if (r.id === 'five') s.stats.fiveBrews++;
      note(s, r.name + '出炉，修为 +' + qi + '。', now); emit(s, 'brew', r.name + '出炉 · 修为 +' + qi); s.brewing = null;
    }
    const j = s.journey;
    if (j && j.status === 'battle') {
      const b = j.battle;
      if (!battleActive) b.lastAt = effectiveNow;
      else {
        let rounds = Math.min(4, Math.floor((effectiveNow - b.lastAt) / 550));
        while (rounds-- > 0 && j.status === 'battle') {
          b.lastAt += 550; b.turn++;
          if (b.turn % 2) { const hit = power(s) * (b.boost ? 2 : 1); b.enemy = Math.max(0, b.enemy - hit); b.log = '你御风出手，小石灵气血 −' + hit; }
          else { const hit = 7 + j.route * 4; b.hp = Math.max(0, b.hp - hit); b.log = '小石灵滚来滚去，你的气血 −' + hit; }
          if (!b.enemy) { addLoot(s, { stones: 48, qi: 32 }); emit(s, 'battle', '切磋获胜！小石灵送你一捧山泉。'); nextStop(s); }
          else if (!b.hp) { addLoot(s, { qi: 8 }); emit(s, 'battle', '小石灵请你喝了山泉。休息过后，继续看风景。'); nextStop(s); }
        }
      }
    }
    syncStats(s); return dt;
  }
  function serialize(s) { const { events, ...persistent } = s; return JSON.stringify(persistent); }
  function load(raw, now = Date.now()) {
    let v; try { v = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return { state: create(now), offline: null, invalid: true }; }
    if (!v || typeof v !== 'object' || v.version !== VERSION || !Array.isArray(v.plots) || v.plots.length !== 9) return { state: create(now), offline: null, invalid: !!raw };
    const s = create(now); s.createdAt = cap(v.createdAt, now); s.lastAt = cap(Number.isFinite(v.lastAt) ? v.lastAt : now, now + OFFLINE_CAP); s.seed = int(v.seed, 4294967295);
    const savedNow = Math.max(now, s.lastAt);
    s.realm = int(v.realm, REALMS.length - 1); s.stones = cap(v.stones); s.qi = cap(v.qi); s.dew = int(v.dew, 4); s.dewAt = cap(v.dewAt, savedNow);
    CROPS.forEach(c => { s.herbs[c.id] = int(v.herbs && v.herbs[c.id]); });
    RECIPES.forEach(r => { s.pills[r.id] = int(v.pills && v.pills[r.id]); });
    BUILDINGS.forEach(b => { s.buildings[b.id] = int(v.buildings && v.buildings[b.id], 5); });
    Object.keys(s.stats).forEach(k => { s.stats[k] = int(v.stats && v.stats[k]); });
    s.goal = int(v.goal, GOALS.length); s.selectedCrop = crop(v.selectedCrop) ? v.selectedCrop : 'wood';
    s.settings.sound = !!(v.settings && v.settings.sound); s.settings.vibration = !v.settings || v.settings.vibration !== false;
    s.plots = v.plots.map(p => p && crop(p.crop) && Number.isFinite(p.start) && Number.isFinite(p.duration) && p.duration > 0 ? { crop: p.crop, start: Math.max(savedNow - OFFLINE_CAP - 60000, Math.min(savedNow, p.start)), duration: Math.max(2000, Math.min(60000, p.duration)) } : null);
    if (v.brewing && recipe(v.brewing.recipe) && Number.isFinite(v.brewing.endsAt)) s.brewing = { recipe: v.brewing.recipe, start: cap(v.brewing.start, now), endsAt: cap(v.brewing.endsAt, now + 12000), bonus: cap(v.brewing.bonus, 3) };
    s.travelReadyAt = cap(v.travelReadyAt, now + 45000);
    if (v.journey && ROUTES[v.journey.route] && v.journey.route <= 2 && Number.isInteger(v.journey.step) && v.journey.step >= 0 && v.journey.step <= 3 && ['event', 'battle', 'reward'].includes(v.journey.status)) {
      const j = v.journey;
      s.journey = { route: int(j.route, 2), step: int(j.step, 3), narrative: int(j.narrative, NARRATIVES.length - 1), status: j.status, loot: { stones: cap(j.loot && j.loot.stones, 2000), qi: cap(j.loot && j.loot.qi, 2000), ore: int(j.loot && j.loot.ore, 3), herbs: {} }, battle: null };
      CROPS.forEach(c => { s.journey.loot.herbs[c.id] = int(j.loot && j.loot.herbs && j.loot.herbs[c.id], 100); });
      if (j.status === 'battle') {
        if (!j.battle || j.step !== 1) s.journey = null;
        else { const b = j.battle; s.journey.battle = { hp: cap(b.hp, 300), maxHp: Math.max(1, cap(b.maxHp, 300)), enemy: cap(b.enemy, 200), maxEnemy: Math.max(1, cap(b.maxEnemy, 200)), turn: int(b.turn, 500), lastAt: now, used: !!b.used, boost: !!b.boost, log: typeof b.log === 'string' ? b.log.slice(0, 100) : '风停了，切磋继续。' }; }
      } else if ((j.status === 'reward' && j.step !== 3) || (j.status === 'event' && j.step >= 3)) s.journey = null;
    }
    if (Array.isArray(v.log)) s.log = v.log.filter(l => l && typeof l.text === 'string').slice(0, 24).map(l => ({ text: l.text.slice(0, 180), at: cap(l.at, now) }));
    loadSect(s, v, savedNow);
    const elapsed = Math.max(0, now - s.lastAt), before = s.qi;
    advance(s, now, false);
    const offline = elapsed >= 60000 ? { elapsed: Math.min(elapsed, OFFLINE_CAP), qi: Math.floor(s.qi - before), ready: ready(s, now).length, capped: elapsed > OFFLINE_CAP } : null;
    return { state: s, offline, invalid: false };
  }
  return { VERSION, SAVE_KEY, OFFLINE_CAP, CROPS, REALMS, RECIPES, BUILDINGS, ROUTES, GOALS, SPIRITS, MANUALS, RELICS, COMMISSIONS, SECT_GOALS, create, load, serialize, crop, recipe, duration, passiveRate, adjacent, resonates, links, bonus, progress, ready, plant, sowAll, harvest, rain, canBrew, brew, buildingCost, upgrade, canBreakthrough, breakthrough, goalProgress, claimGoal, power, startJourney, encounter, choose, battleSkill, settleJourney, advance, spirit, commission, effects, brewBonus, canAfford, adoptSpirit, equipSpirit, feedSpirit, sendSpirit, claimDispatch, submitOrder, refreshOrders, manualCost, studyManual, equipManual, relicCost, forgeRelic, equipRelic, sectProgress, claimSectGoal };
});
