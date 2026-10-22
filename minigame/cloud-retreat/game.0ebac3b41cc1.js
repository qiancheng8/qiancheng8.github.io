/* 云间一亩田 v1.1.0 · generated browser bundle */
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

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else (root.CloudRetreat = root.CloudRetreat || {}).Draw = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const C = { paper: '#f7f5e9', ink: '#284d43', muted: '#819084', line: '#dce3d3', green: '#3e705b', pale: '#e7eddd', gold: '#c5a263', orange: '#c87d5b', white: '#fffef7' };
  const sans = '"PingFang SC", "Microsoft YaHei", sans-serif';
  const serif = '"Noto Serif SC", "Songti SC", SimSun, serif';
  function round(ctx, x, y, w, h, r = 12) {
    r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function box(ctx, x, y, w, h, fill, r = 12, stroke) { round(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } }
  function text(ctx, str, x, y, size = 14, color = C.ink, weight = 400, align = 'left', family = sans) { ctx.fillStyle = color; ctx.font = weight + ' ' + size + 'px ' + family; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(String(str), x, y); }
  function lines(ctx, str, x, y, size, color, lineHeight = 24, align = 'left') { String(str).split('\n').forEach((t, i) => text(ctx, t, x, y + i * lineHeight, size, color, 400, align)); }
  function wrap(ctx, str, x, y, maxWidth, size = 13, color = C.muted, lineHeight = 22, maxLines = 5) {
    ctx.font = '400 ' + size + 'px ' + sans; const out = []; let line = '';
    for (const ch of String(str)) { if (ch === '\n' || (line && ctx.measureText(line + ch).width > maxWidth)) { out.push(line); line = ch === '\n' ? '' : ch; } else line += ch; }
    if (line) out.push(line); out.slice(0, maxLines).forEach((v, i) => text(ctx, v, x, y + i * lineHeight, size, color)); return Math.min(out.length, maxLines) * lineHeight;
  }
  function path(ctx, pts, fill, stroke, width = 1) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); } }
  function ellipse(ctx, x, y, rx, ry, fill, stroke) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); } }
  function line(ctx, x, y, xx, yy, color, width = 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(xx, yy); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.stroke(); }
  function star(ctx, x, y, r, color) { path(ctx, [[x, y - r], [x + r * .25, y - r * .25], [x + r, y], [x + r * .25, y + r * .25], [x, y + r], [x - r * .25, y + r * .25], [x - r, y], [x - r * .25, y - r * .25]], color); }
  function cloud(ctx, x, y, s = 1, alpha = 1) { ctx.save(); ctx.globalAlpha *= alpha; ellipse(ctx, x, y, 49 * s, 10 * s, '#fffef5'); ellipse(ctx, x - 18 * s, y - 7 * s, 20 * s, 12 * s, '#fffef5'); ellipse(ctx, x + 10 * s, y - 12 * s, 25 * s, 17 * s, '#fffef5'); ellipse(ctx, x + 30 * s, y - 3 * s, 21 * s, 10 * s, '#fffef5'); ctx.restore(); }
  function icon(ctx, name, x, y, size = 20, color = C.green) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24); ctx.lineWidth = 1.7; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (name === 'leaf' || name === 'wood') {
      ctx.beginPath(); ctx.moveTo(-7, 7); ctx.bezierCurveTo(-13, -3, -1, -10, 9, -9); ctx.bezierCurveTo(12, 3, 6, 11, -3, 7); ctx.stroke(); line(ctx, -7, 10, 6, -5, color, 1.6); line(ctx, -2, 3, -3, -3, color, 1.2);
    } else if (name === 'water' || name === 'dew') {
      ctx.beginPath(); ctx.moveTo(0, -11); ctx.bezierCurveTo(-3, -5, -9, 0, -8, 5); ctx.bezierCurveTo(-5, 14, 8, 11, 8, 3); ctx.bezierCurveTo(8, -1, 3, -7, 0, -11); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 4, 4, .1, 1.7); ctx.stroke();
    } else if (name === 'stone') { path(ctx, [[-9, -4], [-3, -10], [6, -8], [11, 0], [4, 10], [-6, 8]], null, color, 1.7); path(ctx, [[-9, -4], [0, -2], [6, -8]], null, color, 1.1); line(ctx, 0, -2, 4, 10, color, 1.1); line(ctx, 0, -2, -6, 8, color, 1.1);
    } else if (name === 'qi' || name === 'star') { star(ctx, 0, 0, 11, color); ellipse(ctx, 0, 0, 2, 2, C.paper);
    } else if (name === 'gate') { line(ctx, -8, 10, -8, -7, color, 1.8); line(ctx, 8, 10, 8, -7, color, 1.8); line(ctx, -12, -7, 12, -7, color, 2); line(ctx, -11, -3, 11, -3, color, 1.5); path(ctx, [[-13, -8], [-7, -12], [7, -12], [13, -8]], null, color, 1.5); box(ctx, -3, -7, 6, 8, C.paper, 1, color);
    } else if (name === 'home') { path(ctx, [[-11, -2], [0, -11], [11, -2]], null, color, 1.7); box(ctx, -8, -2, 16, 12, null, 2, color); box(ctx, -2, 2, 5, 8, null, 1, color);
    } else if (name === 'cloud') { ctx.beginPath(); ctx.moveTo(-8, 7); ctx.bezierCurveTo(-16, 6, -13, -4, -6, -4); ctx.bezierCurveTo(-6, -13, 7, -14, 9, -4); ctx.bezierCurveTo(17, -4, 16, 8, 8, 8); ctx.lineTo(-8, 8); ctx.stroke(); line(ctx, -3, 2, 4, 2, color, 1.5);
    } else if (name === 'furnace') { box(ctx, -8, -5, 16, 14, null, 5, color); line(ctx, -10, -7, 10, -7, color, 1.8); line(ctx, -5, 11, -6, 13, color, 2); line(ctx, 5, 11, 6, 13, color, 2); ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(-4, -14, 1, -17); ctx.stroke(); ellipse(ctx, 0, 2, 3, 3, null, color);
    } else if (name === 'book') { box(ctx, -9, -10, 18, 21, null, 2, color); line(ctx, -5, -10, -5, 10, color, 1); line(ctx, -1, -4, 5, -4, color, 1.3); line(ctx, -1, 1, 5, 1, color, 1.3);
    } else if (name === 'settings') { for (let i = 0; i < 3; i++) { const yy = (i - 1) * 7; line(ctx, -10, yy, 10, yy, color, 1.5); ellipse(ctx, i % 2 ? 5 : -4, yy, 2.5, 2.5, C.paper, color); }
    } else if (name === 'sound') { path(ctx, [[-10, -4], [-5, -4], [1, -9], [1, 9], [-5, 4], [-10, 4]], null, color, 1.7); ctx.beginPath(); ctx.arc(0, 0, 8, -.8, .8); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 12, -.7, .7); ctx.stroke();
    } else if (name === 'close') { line(ctx, -6, -6, 6, 6, color, 1.7); line(ctx, 6, -6, -6, 6, color, 1.7);
    } else if (name === 'check') { line(ctx, -7, 0, -1, 6, color, 2); line(ctx, -1, 6, 9, -6, color, 2);
    } else if (name === 'lock') { box(ctx, -7, -1, 14, 12, null, 3, color); ctx.beginPath(); ctx.arc(0, -2, 5, Math.PI, 0); ctx.stroke(); ellipse(ctx, 0, 5, 1.5, 1.5, color);
    } else if (name === 'arrow') { line(ctx, -8, 0, 8, 0, color, 1.6); line(ctx, 3, -5, 8, 0, color, 1.6); line(ctx, 3, 5, 8, 0, color, 1.6);
    } else if (name === 'help') { ellipse(ctx, 0, 0, 10, 10, null, color); text(ctx, '?', 0, 0, 16, color, 500, 'center');
    } else if (name === 'fire') { ctx.beginPath(); ctx.moveTo(1, -11); ctx.bezierCurveTo(6, -3, 12, 1, 6, 8); ctx.bezierCurveTo(-3, 15, -14, 3, -5, -5); ctx.quadraticCurveTo(-5, 1, -1, 0); ctx.quadraticCurveTo(4, -4, 1, -11); ctx.stroke();
    } else if (name === 'earth') { path(ctx, [[-11, 8], [-3, -7], [2, 1], [6, -4], [12, 8]], null, color, 1.7);
    } else if (name === 'metal') { path(ctx, [[0, -11], [9, 0], [0, 11], [-9, 0]], null, color, 1.7); line(ctx, 0, -5, 0, 5, color, 1.4);
    } else { ellipse(ctx, 0, 0, 7, 7, null, color); }
    ctx.restore();
  }
  function plant(ctx, type, x, y, scale = 1, mature = false, time = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * .8 + x) * .025); ctx.scale(scale, scale); ctx.lineCap = 'round';
    if (type === 'wood') {
      for (let i = -1; i <= 1; i++) {
        const xx = i * 8, h = 31 + (i === 0 ? 13 : 0); line(ctx, xx, 0, xx + 2, -h, '#477557', 4); line(ctx, xx - 2, -h * .42, xx + 3, -h * .42, '#b9cba0', 1.5); line(ctx, xx - 1, -h * .72, xx + 4, -h * .72, '#b9cba0', 1.5);
        path(ctx, [[xx, -h * .7], [xx - 17, -h * .83], [xx - 11, -h * .48]], '#709657'); path(ctx, [[xx + 1, -h * .9], [xx + 16, -h * 1.05], [xx + 12, -h * .65]], '#88a66a');
      }
    } else if (type === 'water') {
      ellipse(ctx, 0, -2, 21, 8, '#8bb6ae'); ellipse(ctx, -9, -6, 12, 5, '#6e9d83'); line(ctx, 2, -4, 4, -27, '#608d7c', 2);
      for (let i = -1; i <= 1; i++) { ctx.save(); ctx.translate(3 + i * 6, -28); ctx.rotate(i * .55); ellipse(ctx, 0, -4, 6, 11, i ? '#bbd6dc' : '#e1eef0', '#86b2bd'); ctx.restore(); }
      ellipse(ctx, 4, -25, 5, 3, '#e4cb81');
    } else if (type === 'fire') {
      for (let i = -1; i <= 1; i++) {
        const yy = -27 - (i === 0 ? 9 : 0); line(ctx, i * 9, 0, i * 10, yy, '#6f8c61', 2); path(ctx, [[i * 9, -8], [i * 9 - 10, -18], [i * 9, -15]], '#87a56f');
        for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; ellipse(ctx, i * 10 + Math.cos(a) * 6, yy + Math.sin(a) * 6, 5, 5, k % 2 ? '#de9a6c' : '#cc805a'); } ellipse(ctx, i * 10, yy, 3, 3, '#f4d991');
      }
    } else if (type === 'earth') {
      for (const [xx, yy, rr] of [[-11, -5, 10], [6, -13, 15], [17, 0, 7]]) { box(ctx, xx - 3, yy - 10, 6, 14, '#e8dcc1', 2); ellipse(ctx, xx, yy - 11, rr, rr * .6, '#bb9469'); ellipse(ctx, xx - 3, yy - 13, 2, 1.5, '#eee3c4'); ellipse(ctx, xx + 4, yy - 12, 2.2, 1.5, '#eee3c4'); }
    } else if (type === 'metal') {
      for (let i = -1; i <= 1; i++) { const xx = i * 9, h = 29 + (i === 0 ? 9 : 0); line(ctx, xx, 0, xx + 4, -h, '#a69b57', 2); for (let k = 0; k < 4; k++) { const yy = -h + k * 6; ellipse(ctx, xx, yy, 5, 3, '#d2b76b'); ellipse(ctx, xx + 7, yy + 2, 5, 3, '#e1cb83'); } path(ctx, [[xx, -6], [xx - 13, -18], [xx - 7, -2]], '#91a16d'); }
    }
    if (mature) { star(ctx, -22 + Math.sin(time * 1.3) * 2, -34, 3.5, '#d7b767'); star(ctx, 21, -18 + Math.cos(time) * 3, 2.5, '#cdb273'); }
    ctx.restore();
  }
  function pine(ctx, x, y, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); line(ctx, 0, 0, 2, -71, '#8d8b68', 6); line(ctx, 2, -38, -25, -59, '#8d8b68', 3); line(ctx, 2, -43, 26, -70, '#8d8b68', 3);
    [[-21, -58, 29, 12], [20, -72, 34, 13], [-5, -87, 29, 13], [17, -47, 23, 10]].forEach(([xx, yy, rx, ry], i) => { ellipse(ctx, xx, yy, rx, ry, ['#779475', '#62846c', '#8ba27c', '#709174'][i]); ellipse(ctx, xx - 5, yy - 5, rx * .8, ry * .7, '#91aa84'); });
    ctx.restore();
  }
  function cottage(ctx, x, y, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ellipse(ctx, 0, 2, 52, 10, '#9dac87'); path(ctx, [[-33, -34], [1, -43], [34, -24], [34, 0], [0, 10], [-33, -8]], '#eee5c9'); path(ctx, [[0, -25], [34, -24], [34, 0], [0, 10]], '#d1ceb0');
    path(ctx, [[-45, -33], [-9, -65], [2, -65], [45, -31], [4, -18]], '#637c6c'); path(ctx, [[-45, -33], [-9, -65], [-7, -58], [4, -26], [45, -31], [4, -18]], '#78917a');
    line(ctx, -9, -65, 2, -65, '#b1b795', 3); line(ctx, -45, -33, 4, -18, '#3b6258', 3); line(ctx, 4, -18, 45, -31, '#3b6258', 3);
    box(ctx, -16, -19, 12, 22, '#788373', 2); box(ctx, 12, -15, 11, 10, '#b7ad7a', 1); line(ctx, 17, -15, 17, -5, '#ece1b8', 1); line(ctx, 12, -10, 23, -10, '#ece1b8', 1);
    line(ctx, -37, -25, -37, -2, '#a89773', 2); ellipse(ctx, -37, -19, 4, 7, '#ce9a6c');
    ctx.restore();
  }
  function cat(ctx, x, y, time) {
    ctx.save(); ctx.translate(x, y + Math.sin(time) * .8); ellipse(ctx, 0, 4, 17, 5, '#a8b294'); ctx.beginPath(); ctx.moveTo(9, 0); ctx.bezierCurveTo(30, 9, 31, -10, 20, -12); ctx.strokeStyle = '#eee4c7'; ctx.lineWidth = 5; ctx.stroke(); ellipse(ctx, 0, -2, 14, 11, '#eee4c7'); ellipse(ctx, -5, -12, 10, 9, '#f6f0db'); path(ctx, [[-14, -16], [-14, -26], [-6, -19]], '#e6dcc1'); path(ctx, [[-1, -20], [6, -26], [4, -13]], '#e6dcc1'); line(ctx, -11, -12, -8, -12, '#6d7963', 1.3); line(ctx, -2, -12, 1, -12, '#6d7963', 1.3); text(ctx, 'z', 18, -27 + Math.sin(time) * 2, 12, '#8fa38a', 400, 'center'); ctx.restore();
  }
  function person(ctx, x, y, s = 1, time = 0) {
    ctx.save(); ctx.translate(x, y + Math.sin(time * 2) * 2); ctx.scale(s, s); ellipse(ctx, 0, 1, 14, 4, '#bdc8ac'); path(ctx, [[-7, -27], [7, -27], [14, -2], [-14, -2]], '#6c8d7c'); path(ctx, [[-2, -27], [3, -27], [5, -3], [-4, -3]], '#dce5c7'); ellipse(ctx, 0, -33, 7, 8, '#ddc8a5'); path(ctx, [[-15, -38], [0, -51], [15, -38], [0, -34]], '#c6b383', '#96845b'); line(ctx, 13, -23, 24, -37, '#a3926c', 2); line(ctx, 23, -37, 29, -44, '#e2dcc3', 3); ctx.restore();
  }
  function spirit(ctx, type, x, y, scale = 1, time = 0) {
    ctx.save(); ctx.translate(x, y + Math.sin(time * 1.3) * 1.2); ctx.scale(scale, scale);
    ellipse(ctx, 0, 5, 35, 7, '#d9dfc9');
    if (type === 'crane') {
      line(ctx, -3, 0, -7, -27, '#9a936c', 2); line(ctx, 10, 0, 7, -27, '#9a936c', 2); line(ctx, -10, 1, -1, 1, '#9a936c', 2); line(ctx, 4, 1, 13, 1, '#9a936c', 2);
      ellipse(ctx, 0, -32, 22, 15, '#edeedc'); path(ctx, [[-9, -37], [-29, -45], [-20, -24], [9, -25]], '#9daf9f');
      ctx.beginPath(); ctx.moveTo(15, -33); ctx.bezierCurveTo(35, -34, 12, -61, 28, -68); ctx.strokeStyle = '#eeefdd'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke(); ellipse(ctx, 29, -69, 7, 7, '#edeedc'); path(ctx, [[35, -71], [52, -68], [35, -65]], '#b7a279'); ellipse(ctx, 30, -71, 1.2, 1.2, '#57735e'); ellipse(ctx, 28, -76, 4, 2, '#b9846c');
      path(ctx, [[-19, -33], [-33, -34], [-27, -25]], '#718d7c');
    } else {
      if (type === 'fox') { ctx.save(); ctx.rotate(-.3); ctx.beginPath(); ctx.moveTo(8, -4); ctx.bezierCurveTo(56, 8, 60, -32, 31, -43); ctx.bezierCurveTo(37, -22, 14, -31, 8, -4); ctx.fillStyle = '#c79972'; ctx.fill(); path(ctx, [[40, -35], [49, -27], [48, -18], [38, -21], [31, -43]], '#ede5ca'); ctx.restore(); }
      else { ctx.beginPath(); ctx.moveTo(19, -2); ctx.bezierCurveTo(53, 10, 53, -19, 36, -16); ctx.strokeStyle = '#d9ccab'; ctx.lineWidth = 9; ctx.stroke(); }
      ellipse(ctx, 0, -14, 25, 20, type === 'fox' ? '#d7ae83' : '#e9dfc0'); ellipse(ctx, -4, -39, 22, 18, type === 'fox' ? '#d3a57b' : '#f3ebd3');
      path(ctx, [[-24, -46], [-24, -68], [-9, -53]], type === 'fox' ? '#c49770' : '#ded2af'); path(ctx, [[8, -52], [17, -66], [17, -42]], type === 'fox' ? '#c49770' : '#ded2af'); path(ctx, [[-21, -50], [-21, -60], [-15, -52]], '#ead4bc'); path(ctx, [[10, -52], [15, -60], [14, -48]], '#ead4bc');
      if (type === 'fox') path(ctx, [[-23, -37], [-7, -29], [15, -39], [6, -23], [-8, -21]], '#f5e9cd');
      line(ctx, -17, -39, -12, -40, '#5e775f', 1.5); line(ctx, 3, -40, 8, -39, '#5e775f', 1.5); path(ctx, [[-7, -34], [-3, -34], [-5, -31]], '#a38d74');
      box(ctx, -20, -24, 34, 5, '#88a285', 2); ellipse(ctx, -4, -18, 3, 4, '#c5ae71');
      if (type === 'cat') { line(ctx, -5, -55, -5, -50, '#cbbb96', 2); line(ctx, -12, -54, -11, -50, '#cbbb96', 2); line(ctx, 2, -54, 1, -50, '#cbbb96', 2); }
    }
    star(ctx, -36, -47 + Math.cos(time) * 3, 3, '#c4b276'); ctx.restore();
  }
  function relic(ctx, type, x, y, scale = 1, time = 0) {
    ctx.save(); ctx.translate(x, y + Math.sin(time * .8) * 1.2); ctx.scale(scale, scale);
    if (type === 'bell') {
      ctx.beginPath(); ctx.arc(0, -22, 7, Math.PI, 0); ctx.strokeStyle = '#a29369'; ctx.lineWidth = 2; ctx.stroke();
      path(ctx, [[-15, 8], [-12, -15], [-5, -24], [5, -24], [12, -15], [15, 8]], '#a3b18a', '#819873', 1.5); ellipse(ctx, 0, 8, 15, 4, '#d2d4a4', '#91a07b'); ellipse(ctx, 0, 11, 3, 4, '#c2ac74'); line(ctx, 0, 15, 0, 29, '#a49e73', 1.5); path(ctx, [[0, 24], [-8, 34], [2, 32], [8, 36]], '#91a58a');
    } else if (type === 'lamp') {
      path(ctx, [[-17, -18], [0, -30], [17, -18], [13, 12], [-13, 12]], '#d9cb99', '#a89c72', 1.5); path(ctx, [[-19, -19], [0, -35], [19, -19]], '#7f987c'); ellipse(ctx, 0, -6, 7, 11, '#f1dfaa'); star(ctx, 0, -8, 7, '#c8a572'); line(ctx, -6, -17, -6, 9, '#b3a572', 1); line(ctx, 6, -17, 6, 9, '#b3a572', 1); box(ctx, -15, 12, 30, 4, '#829579', 2); line(ctx, 0, 16, 0, 30, '#aa9c70', 1.5);
    } else {
      ctx.rotate(.35); path(ctx, [[-5, 5], [-5, -30], [0, -44], [5, -30], [5, 5]], '#ccd8cb', '#8ca59a', 1.5); line(ctx, 0, -33, 0, 4, '#ecedde', 1.5); box(ctx, -14, 4, 28, 5, '#bba774', 2); box(ctx, -3, 9, 6, 18, '#8ca082', 2); ellipse(ctx, 0, 28, 4, 3, '#b7a579');
    }
    ctx.restore();
  }
  function mountain(ctx, x, y, w, h, color) { ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.bezierCurveTo(x - w * .35, y - h * .6, x - w * .13, y - h * .45, x, y - h); ctx.bezierCurveTo(x + w * .12, y - h * .94, x + w * .2, y - h * .2, x + w / 2, y); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); }
  function island(ctx, fieldY, time, companion = null) {
    // All artwork is original Canvas geometry, shared by web, wx and tt.
    const yy = fieldY;
    ellipse(ctx, 210, yy + 148, 130, 13, '#e0e7d5');
    path(ctx, [[44, yy + 29], [70, yy + 90], [122, yy + 104], [157, yy + 147], [187, yy + 126], [219, yy + 162], [255, yy + 115], [301, yy + 128], [350, yy + 77], [378, yy + 25]], '#a9b29a');
    path(ctx, [[70, yy + 72], [122, yy + 104], [157, yy + 147], [146, yy + 91], [175, yy + 51]], '#c1c4a7'); path(ctx, [[217, yy + 72], [219, yy + 162], [255, yy + 115], [278, yy + 80]], '#8f9f8b'); path(ctx, [[285, yy + 69], [301, yy + 128], [350, yy + 77], [341, yy + 49]], '#b9bea2');
    ctx.beginPath(); ctx.moveTo(43, yy + 20); ctx.bezierCurveTo(45, yy - 19, 103, yy - 64, 182, yy - 52); ctx.bezierCurveTo(251, yy - 76, 357, yy - 35, 379, yy + 17); ctx.bezierCurveTo(398, yy + 54, 300, yy + 98, 222, yy + 98); ctx.bezierCurveTo(120, yy + 101, 31, yy + 67, 43, yy + 20); ctx.closePath(); ctx.fillStyle = '#b7c89f'; ctx.fill(); ctx.strokeStyle = '#d8dfb9'; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(61, yy + 23); ctx.bezierCurveTo(99, yy - 7, 98, yy - 30, 124, yy - 32); ctx.bezierCurveTo(185, yy - 13, 144, yy + 35, 185, yy + 70); ctx.strokeStyle = '#d6d9b6'; ctx.lineWidth = 15; ctx.stroke();
    // A ribbon of water runs over the right edge.
    ctx.beginPath(); ctx.moveTo(336, yy + 31); ctx.bezierCurveTo(356, yy + 62, 321, yy + 68, 335, yy + 96); ctx.bezierCurveTo(341, yy + 118, 325, yy + 128, 331, yy + 149); ctx.strokeStyle = '#a8c6b7'; ctx.lineWidth = 13; ctx.stroke(); ctx.strokeStyle = '#d4e4cf'; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 9; i++) { const x = 56 + i * 36; const y = yy + 56 + Math.sin(i * 2) * 15; if (i < 3 || i > 6) { line(ctx, x, y, x - 2, y - 8, '#83a27b', 2); line(ctx, x, y, x + 4, y - 7, '#88a97d', 2); } }
    cottage(ctx, 109, yy - 34, .83); pine(ctx, 316, yy - 25, .83); pine(ctx, 70, yy - 2, .45);
    for (const [xx, y] of [[85, yy + 48], [293, yy + 76], [311, yy + 67]]) { ellipse(ctx, xx, y, 6, 3, '#9daa8f'); ellipse(ctx, xx - 1, y - 2, 5, 3, '#e3e1bf'); }
    // Vines on the floating rock.
    for (const x of [100, 148, 277, 312]) { ctx.beginPath(); ctx.moveTo(x, yy + 89); ctx.quadraticCurveTo(x - 13, yy + 119, x - 5, yy + 127); ctx.strokeStyle = '#7f9d75'; ctx.lineWidth = 2; ctx.stroke(); ellipse(ctx, x - 6, yy + 108, 5, 2, '#7f9d75'); }
    if (companion) spirit(ctx, companion, 292, yy + 96, .47, time); else cat(ctx, 291, yy + 91, time);
  }
  function backdrop(ctx, y, h, time, theme = 0) {
    const grad = ctx.createLinearGradient(0, y, 0, y + h); grad.addColorStop(0, theme === 2 ? '#e3e7e9' : '#edf0df'); grad.addColorStop(1, '#f7f5e9'); ctx.fillStyle = grad; ctx.fillRect(0, y, 420, h);
    ellipse(ctx, 320, y + 65, 29, 29, theme === 1 ? '#ebc6a4' : '#e6d7a6'); ellipse(ctx, 320, y + 65, 37, 37, null, '#e4ddbd');
    mountain(ctx, 40, y + h * .7, 230, h * .55, '#dce3ce'); mountain(ctx, 355, y + h * .69, 240, h * .49, '#d7e0cc'); mountain(ctx, 90, y + h * .8, 270, h * .5, '#cdd9bf'); mountain(ctx, 375, y + h * .84, 210, h * .42, '#c4d3b9');
    cloud(ctx, 34 + Math.sin(time * .1) * 14, y + 111, .8, .6); cloud(ctx, 365 + Math.sin(time * .12 + 2) * 14, y + h * .68, .9, .7); cloud(ctx, 48 + Math.cos(time * .08) * 14, y + h * .9, 1.5, .8);
    for (let i = 0; i < 3; i++) { const xx = 117 + i * 14 + Math.sin(time * .2) * 8, yy = y + 48 + i % 2 * 7; ctx.beginPath(); ctx.moveTo(xx - 4, yy); ctx.quadraticCurveTo(xx - 2, yy - 3, xx, yy); ctx.quadraticCurveTo(xx + 2, yy - 3, xx + 4, yy); ctx.strokeStyle = '#94aa91'; ctx.lineWidth = 1; ctx.stroke(); }
  }
  function furnace(ctx, x, y, scale = 1, lit = false, time = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ellipse(ctx, 0, 9, 63, 12, '#dce2cd');
    box(ctx, -35, -4, 12, 17, '#738a78', 3); box(ctx, 23, -4, 12, 17, '#738a78', 3);
    const g = ctx.createLinearGradient(-40, -70, 42, 0); g.addColorStop(0, '#a9b79a'); g.addColorStop(.55, '#7e9a82'); g.addColorStop(1, '#5a7d6d');
    ctx.beginPath(); ctx.moveTo(-44, -61); ctx.bezierCurveTo(-59, 0, -28, 10, 0, 10); ctx.bezierCurveTo(35, 10, 56, -1, 44, -61); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ellipse(ctx, 0, -61, 46, 10, '#9bb092', '#5c7e6b'); box(ctx, -51, -75, 102, 12, '#6f8b75', 6); path(ctx, [[-36, -75], [-12, -93], [12, -93], [36, -75]], '#9daf8e'); ellipse(ctx, 0, -97, 9, 6, '#6c8770');
    ctx.strokeStyle = '#6d8972'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(-46, -42, 11, 1.5, 4.8); ctx.stroke(); ctx.beginPath(); ctx.arc(46, -42, 11, -1.5, 1.5); ctx.stroke();
    ellipse(ctx, 0, -28, 15, 17, lit ? '#e4c183' : '#6b8872'); icon(ctx, 'fire', 0, -29, 17, lit ? '#b98050' : '#9fb08c'); line(ctx, -27, -51, -30, -12, '#bac8a6', 2);
    for (let i = 0; i < 3; i++) { const xx = (i - 1) * 13; const yy = -114 - ((time * 10 + i * 15) % 44); ctx.globalAlpha = .4 - ((time * 10 + i * 15) % 44) / 130; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.bezierCurveTo(xx - 10, yy - 7, xx + 10, yy - 11, xx, yy - 20); ctx.strokeStyle = lit ? '#bda684' : '#a4b499'; ctx.lineWidth = 3; ctx.stroke(); } ctx.restore();
  }
  return { C, sans, serif, round, box, text, lines, wrap, path, ellipse, line, star, cloud, icon, plant, pine, cottage, cat, person, spirit, relic, mountain, island, backdrop, furnace };
});

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./draw.js'));
  else root.CloudRetreat.SectView = factory(root.CloudRetreat.Core, root.CloudRetreat.Draw);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (K, D) {
  'use strict';
  const { C, box, text, wrap, icon, ellipse } = D;
  const fmt = n => Math.floor(n).toLocaleString('en-US');
  const secs = ms => Math.max(0, Math.ceil(ms / 1000));
  function costText(s, cost) {
    const bits = [];
    if (cost.favor) bits.push('云笺 ' + fmt(s.favor) + '/' + cost.favor);
    if (cost.ore) bits.push('砂 ' + fmt(s.ore) + '/' + cost.ore);
    Object.entries(cost.herbs || {}).forEach(([id, n]) => bits.push(K.crop(id).element + ' ' + fmt(s.herbs[id]) + '/' + n));
    Object.entries(cost.pills || {}).forEach(([id, n]) => bits.push(K.recipe(id).name + ' ' + fmt(s.pills[id]) + '/' + n));
    if (cost.stones) bits.push('石 ' + fmt(s.stones) + '/' + cost.stones);
    return bits.join(' · ');
  }
  function giftText(g) { return [g.favor ? '云笺 +' + g.favor : '', g.ore ? '星砂 +' + g.ore : '', g.stones ? '灵石 +' + g.stones : ''].filter(Boolean).join(' · '); }
  function render(v) {
    const c = v.ctx, a = v.a, s = a.state, y = v.top + 123, g = K.SECT_GOALS[s.sect.goal], done = g && K.sectProgress(s) >= g.target;
    box(c, 22, y, 376, 48, '#fffdf1', 12, '#e1e6d2'); icon(c, done ? 'check' : 'gate', 43, y + 24, 18, done ? '#739373' : '#a0ad8c');
    text(c, g ? g.name : '山门相伴，云间有友', 63, y + 16, 13, C.ink, 600); text(c, g ? g.desc + ' ' + K.sectProgress(s) + '/' + g.target : '试试不同灵伴、功法和灵器的搭配。', 63, y + 34, 10, C.muted);
    text(c, done ? '领取赠礼 ›' : '山门手帖 ›', 382, y + 25, 10, done ? '#ac9156' : '#8f9d82', 500, 'right'); v.hit('sect-goal', done ? '领取山门赠礼，' + giftText(g) : '查看山门玩法与成长手帖', 22, y, 376, 48, done ? 'sectClaim' : 'modal', done ? null : 'sectHelp');
    const tabs = [{ id: 'spirits', label: '灵伴' }, { id: 'orders', label: '委托' }, { id: 'manuals', label: '功法' }, { id: 'relics', label: '灵器' }], ty = y + 61;
    box(c, 22, ty, 376, 39, '#e9edde', 12);
    tabs.forEach((t, i) => { const x = 25 + i * 93, active = a.sectTab === t.id; if (active) box(c, x, ty + 3, 91, 33, '#fdfcf2', 10); text(c, t.label, x + 45, ty + 20, 13, active ? C.green : '#96a189', active ? 600 : 400, 'center'); v.hit('sect:' + t.id, '山门·' + t.label, x, ty + 2, 91, 35, 'sectTab', t.id); });
    icon(c, 'book', 32, ty + 66, 13, '#a49464'); text(c, '云笺 ' + fmt(s.favor), 44, ty + 66, 11, '#8d8e68'); icon(c, 'star', 148, ty + 66, 13, '#a5a47e'); text(c, '星砂 ' + fmt(s.ore), 160, ty + 66, 11, '#8d8e68');
    const active = K.spirit(s.spirits.active); text(c, active ? '契印 · ' + active.name : '云笺来自邻里委托', 393, ty + 66, 10, C.muted, 400, 'right');
    const content = ty + 94;
    if (a.sectTab === 'spirits') spirits(v, content);
    else if (a.sectTab === 'orders') orders(v, content);
    else if (a.sectTab === 'manuals') manuals(v, content);
    else relics(v, content);
  }
  function spirits(v, y) {
    const c = v.ctx, a = v.a, s = a.state, selected = a.spiritSelection, p = K.spirit(selected), pet = s.spirits.owned[selected], m = s.spirits.mission;
    K.SPIRITS.forEach((p, i) => {
      const x = 22 + i * 128, owned = s.spirits.owned[p.id], chosen = selected === p.id;
      box(c, x, y, 120, 49, chosen ? '#e4ecd6' : '#eeefe1', 12, chosen ? '#b4c69e' : null); text(c, p.name, x + 14, y + 17, 14, p.color, 600, 'left', D.serif); text(c, owned ? 'Lv.' + owned.level : p.cost ? p.cost + ' 云笺' : '免费结缘', x + 14, y + 35, 9, C.muted); icon(c, p.id === 'cat' ? 'leaf' : p.id === 'fox' ? 'fire' : 'cloud', x + 98, y + 25, 19, p.color); v.hit('spirit:' + p.id, '查看' + p.kind + p.name + (owned ? '，等级' + owned.level : '，尚未结缘'), x, y, 120, 49, 'selectSpirit', p.id);
    });
    const artH = Math.min(132, Math.max(112, v.navY - y - 260)), centerY = y + 66 + artH * .72;
    ellipse(c, 93, centerY - 26, 57, 55, '#edf0df'); D.spirit(c, selected, 94, centerY + 19, .98, v.time);
    text(c, p.kind, 165, y + 76, 20, C.ink, 600, 'left', D.serif); text(c, p.desc, 165, y + 102, 10, C.muted);
    const level = pet ? pet.level : 1, suffix = selected === 'fox' ? '' : '%';
    text(c, '契印：' + p.trait + ' +' + level * p.perLevel + suffix, 165, y + 128, 12, '#82946e', 500);
    if (pet) { v.progress(166, y + 149, 214, pet.level === 5 ? 1 : pet.bond / (pet.level * 20), '#a5b489', 4); text(c, pet.level === 5 ? '亲密修行圆满 · Lv.5' : '亲密 ' + pet.bond + '/' + pet.level * 20 + ' · 满后自动成长', 165, y + 166, 9, C.muted); }
    else text(c, '结缘后即可缔结契印、喂养和派遣采集。', 165, y + 156, 9, C.muted);
    const by = y + 192;
    if (!pet) v.button('spirit-adopt', p.cost ? '结缘 · 云笺 ' + p.cost : '与豆包结缘 · 免费', 22, by, 376, 44, 'adoptSpirit', selected, { secondary: s.favor < p.cost, size: 14 });
    else {
      const away = m && m.spirit === selected; v.button('spirit-feed', pet.level === 5 ? '亲密圆满' : away ? '采集归来后可喂养' : '喂养 · ' + K.crop(p.food).name + ' ×2', 22, by, 251, 44, 'feedSpirit', selected, { secondary: true, disabled: pet.level === 5 || !!away, size: 12 });
      v.button('spirit-equip', s.spirits.active === selected ? '契印生效' : '缔结契印', 283, by, 115, 44, 'equipSpirit', selected, { secondary: s.spirits.active !== selected, disabled: s.spirits.active === selected, size: 12 });
    }
    const my = by + 58, mh = Math.max(105, Math.min(126, v.navY - my - 18)); box(c, 22, my, 376, mh, '#fdfbf0', 15, '#e0e4d1');
    const ready = m && v.now >= m.endsAt; icon(c, 'cloud', 45, my + 27, 23, '#96aa8c');
    text(c, m ? K.spirit(m.spirit).name + (ready ? '带着回礼归来' : '正在云外采集') : '云外拾星 · 灵伴采集', 68, my + 25, 14, C.ink, 600, 'left', D.serif);
    text(c, m ? '星砂 +' + m.reward.ore + ' · 修为 +' + m.reward.qi + ' · 一包灵植' : '45 秒一趟，带回星砂与灵植。', 39, my + 54, 10, C.muted);
    text(c, '离线也推进 · 契印加成继续生效', 39, my + 80, 9, '#9ca78e');
    v.button('spirit-dispatch', m ? ready ? '领取回礼' : '再等 ' + secs(m.endsAt - v.now) + '秒' : '派遣采集', 281, my + 52, 99, 39, m ? 'claimDispatch' : 'sendSpirit', null, { disabled: !!m && !ready, secondary: !ready, size: 12 });
  }
  function orders(v, y) {
    const c = v.ctx, s = v.a.state, gap = Math.min(124, (v.navY - y - 64) / 3);
    s.sect.orders.forEach((order, i) => {
      const o = K.commission(order.template), yy = y + i * gap, can = K.canAfford(s, o.cost); box(c, 22, yy, 376, gap - 10, '#fffdf2', 14, '#e3e6d2');
      text(c, o.name, 38, yy + 22, 14, C.ink, 600, 'left', D.serif); text(c, '回礼：云笺 +' + o.favor + ' · 灵石 +' + o.stones + ' · 修为 +' + o.qi, 38, yy + 46, 10, '#9a936b');
      text(c, '交付 ' + costText(s, o.cost), 38, yy + 74, 10, can ? '#7d976c' : C.muted);
      v.button('order:' + order.uid, can ? '交付委托' : '待备齐', 302, yy + 14, 80, 32, 'submitOrder', order.uid, { secondary: !can, size: 11, aria: '交付' + o.name + '，需要' + costText(s, o.cost) + '，奖励云笺' + o.favor });
    });
    const cooling = v.now < s.sect.refreshAt;
    v.button('orders-refresh', cooling ? '纸鹤送信中 · ' + secs(s.sect.refreshAt - v.now) + '秒' : '换一批委托 · 免费 / 每 30 秒一次', 22, v.navY - 53, 376, 39, 'refreshOrders', null, { secondary: true, disabled: cooling, size: 12 });
  }
  function manuals(v, y) {
    const c = v.ctx, s = v.a.state, gap = Math.min(133, (v.navY - y - 14) / 3);
    K.MANUALS.forEach((m, i) => {
      const yy = y + i * gap, lv = s.manuals.levels[m.id], active = s.manuals.active === m.id, cost = K.manualCost(s, m.id);
      box(c, 22, yy, 376, gap - 10, active ? '#edf1e1' : '#fffdf2', 14, active ? '#becda9' : '#e2e6d2');
      box(c, 37, yy + 16, 36, 42, '#e5ead5', 5); icon(c, m.icon, 55, yy + 37, 23, m.color);
      text(c, m.name + (lv ? ' · ' + lv + '重' : ' · 未习得'), 85, yy + 24, 15, C.ink, 600, 'left', D.serif); text(c, m.effect, 85, yy + 49, 11, m.color);
      text(c, lv === 5 ? '参悟圆满' : costText(s, cost), 38, yy + gap - 37, 9, C.muted);
      v.button('manual-study:' + m.id, lv === 5 ? '已圆满' : lv ? '参悟' : '习得', 222, yy + gap - 57, 77, 33, 'studyManual', m.id, { secondary: !K.canAfford(s, cost), disabled: lv === 5, size: 11, aria: (lv ? '参悟' : '习得') + m.name + '，' + costText(s, cost) });
      v.button('manual-equip:' + m.id, active ? '运转中' : '运转', 308, yy + gap - 57, 75, 33, 'equipManual', m.id, { secondary: !active, disabled: !lv || active, size: 11 });
    });
    text(c, '每次运转一门功法 · 可随时切换，已习得进度保留', 210, v.navY - 12, 9, '#98a58c', 400, 'center');
  }
  function relics(v, y) {
    const c = v.ctx, s = v.a.state, gap = Math.min(133, (v.navY - y - 14) / 3);
    K.RELICS.forEach((r, i) => {
      const yy = y + i * gap, lv = s.relics.levels[r.id], active = s.relics.active === r.id, cost = K.relicCost(s, r.id);
      box(c, 22, yy, 376, gap - 10, active ? '#edf1e1' : '#fffdf2', 14, active ? '#bdcba9' : '#e2e6d2'); D.relic(c, r.id, 56, yy + 43, .55, v.time);
      text(c, r.name + (lv ? ' · ' + lv + '阶' : ' · 未打造'), 85, yy + 24, 15, C.ink, 600, 'left', D.serif); text(c, r.effect, 85, yy + 49, 10, r.color);
      text(c, lv === 3 ? '淬炼圆满' : costText(s, cost), 38, yy + gap - 37, 9, C.muted);
      v.button('relic-forge:' + r.id, lv === 3 ? '已圆满' : lv ? '淬炼' : '打造', 222, yy + gap - 57, 77, 33, 'forgeRelic', r.id, { secondary: !K.canAfford(s, cost), disabled: lv === 3, size: 11, aria: (lv ? '淬炼' : '打造') + r.name + '，' + costText(s, cost) });
      v.button('relic-equip:' + r.id, active ? '已佩戴' : '佩戴', 308, yy + gap - 57, 75, 33, 'equipRelic', r.id, { secondary: !active, disabled: !lv || active, size: 11 });
    });
    text(c, '星砂来自灵伴采集与云游 · 每次佩戴一件灵器', 210, v.navY - 12, 9, '#98a58c', 400, 'center');
  }
  function help(v, y, h) {
    const c = v.ctx, s = v.a.state;
    text(c, '结缘 → 委托 → 养成 → 功法 → 采集 → 灵器', 40, y + 77, 11, C.muted);
    K.SECT_GOALS.forEach((g, i) => {
      const yy = y + 107 + i * 54, done = i < s.sect.goal, current = i === s.sect.goal;
      box(c, 38, yy, 344, 47, current ? '#e5ecd8' : '#f0f1e4', 10); ellipse(c, 57, yy + 23, 10, 10, done ? '#8aa47e' : '#e0e6d2'); if (done) icon(c, 'check', 57, yy + 23, 12, '#fffdec'); else text(c, i + 1, 57, yy + 23, 10, '#8ea07f', 500, 'center');
      text(c, g.name, 77, yy + 15, 12, C.ink, 500); text(c, g.desc, 77, yy + 33, 9, C.muted); text(c, done ? '已领取' : giftText(g), 368, yy + 23, 9, '#9b936b', 400, 'right');
    });
    wrap(c, '云笺由委托获得，星砂由采集和云游带回。每类加成选择一项；更换搭配立即生效，旧进度保留。', 40, y + 456, 335, 11, C.muted, 22, 3);
    const g = K.SECT_GOALS[s.sect.goal], ready = g && K.sectProgress(s) >= g.target;
    v.button('sect-help-done', ready ? '领取山门赠礼 · ' + giftText(g) : '去山门，结一段仙缘', 38, y + h - 70, 344, 46, ready ? 'sectClaim' : 'close', null, { size: 12 });
  }
  return { render, help };
});

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./draw.js'), require('./sect-view.js'));
  else root.CloudRetreat.View = factory(root.CloudRetreat.Core, root.CloudRetreat.Draw, root.CloudRetreat.SectView);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (K, D, Sect) {
  'use strict';
  const { C, box, text, lines, wrap, path, ellipse, line, star, icon } = D;
  const fmt = n => n >= 10000 ? (n / 10000).toFixed(1) + '万' : Math.floor(n).toLocaleString('en-US');
  const secs = ms => Math.max(0, Math.ceil(ms / 1000));
  class View {
    constructor(app) { this.a = app; this.hits = []; }
    hit(id, label, x, y, w, h, action, args, extra = {}) { this.hits.push({ id, label, x, y, w, h, action, args, ...extra }); }
    button(id, label, x, y, w, h, action, args, style = {}) {
      const c = this.ctx, disabled = style.disabled, secondary = style.secondary;
      box(c, x, y, w, h, disabled ? '#e3e7d8' : secondary ? '#edf0e2' : C.green, style.r || 13, secondary ? '#d8e1ce' : null);
      if (this.a.pressed === id && !disabled) box(c, x, y, w, h, 'rgba(255,255,255,.13)', style.r || 13);
      text(c, label, x + w / 2, y + h / 2 - (style.sub ? 7 : 0), style.size || 14, disabled ? '#9da895' : secondary ? C.ink : '#fffef3', 500, 'center');
      if (style.sub) text(c, style.sub, x + w / 2, y + h / 2 + 14, 10, disabled ? '#a2aa98' : secondary ? C.muted : '#d6e2cf', 400, 'center');
      this.hit(id, style.aria || label + (style.sub ? '，' + style.sub : ''), x, y, w, h, action, args, { disabled });
    }
    smallIcon(id, name, label, x, y, action, args) { box(this.ctx, x, y, 36, 36, '#eef0e2', 18); icon(this.ctx, name, x + 18, y + 18, 18); this.hit(id, label, x, y, 36, 36, action, args); }
    progress(x, y, w, ratio, color = C.green, h = 5) { box(this.ctx, x, y, w, h, '#e1e6d7', h / 2); if (ratio > 0) box(this.ctx, x, y, Math.max(h, w * Math.min(1, ratio)), h, color, h / 2); }
    render(now) {
      const a = this.a, s = a.state; this.ctx = a.ctx; this.hits = []; this.now = now; this.time = now / 1000;
      this.H = a.platform.height; this.top = a.platform.top; this.navY = this.H - a.platform.bottom - 72;
      const c = this.ctx; c.clearRect(0, 0, 420, this.H); c.fillStyle = C.paper; c.fillRect(0, 0, 420, this.H);
      this.header();
      if (a.tab === 'farm') this.farm();
      else if (a.tab === 'travel') this.travel();
      else if (a.tab === 'alchemy') this.alchemy();
      else if (a.tab === 'sect') Sect.render(this);
      else this.cultivation();
      this.nav();
      if (a.modal) this.modal();
      if (a.toast && now < a.toast.until) {
        const w = Math.min(380, Math.max(160, c.measureText(a.toast.text).width + 36));
        const y = a.modal ? this.H - 92 : this.navY - 46;
        box(c, (420 - w) / 2, y, w, 36, '#355e4fed', 18); text(c, a.toast.text, 210, y + 18, 11, '#fffef3', 400, 'center');
      }
      if (a.celebrateUntil > now) this.confetti();
      return this.hits;
    }
    header() {
      const c = this.ctx, s = this.a.state, t = this.top;
      box(c, 22, t + 5, 38, 38, '#e2e9d6', 13); icon(c, 'leaf', 41, t + 24, 25, '#628769');
      text(c, '云间一亩田', 71, t + 15, 21, C.ink, 600, 'left', D.serif); text(c, K.REALMS[s.realm].name + '  /  云上第 ' + (Math.floor((this.now - s.createdAt) / 86400000) + 1) + ' 天', 72, t + 39, 10, C.muted);
      this.smallIcon('journal', 'book', '云间札记与任务', 312, t + 7, 'modal', 'journal'); this.smallIcon('settings', 'settings', '设置与玩法说明', 358, t + 7, 'modal', 'settings');
      const y = t + 65; box(c, 22, y, 376, 46, '#eeefdf', 13);
      icon(c, 'stone', 44, y + 22, 19, '#9d9865'); text(c, fmt(s.stones), 61, y + 22, 16, C.ink, 600); line(c, 148, y + 13, 148, y + 33, '#d9dfcd');
      icon(c, 'qi', 172, y + 22, 17, '#7a9a78'); text(c, fmt(s.qi), 188, y + 22, 16, C.ink, 600); line(c, 281, y + 13, 281, y + 33, '#d9dfcd');
      icon(c, 'dew', 307, y + 22, 17, '#7a9ca0'); text(c, s.dew + '/4', 325, y + 22, 15, C.ink, 600); text(c, '灵露', 364, y + 22, 10, C.muted);
    }
    farm() {
      const a = this.a, s = a.state, c = this.ctx, now = this.now, t = this.top;
      const g = K.GOALS[s.goal], gp = K.goalProgress(s), done = g && gp >= g.target, gy = t + 123;
      box(c, 22, gy, 376, 53, '#fffdf2', 12, '#e4e5d2'); ellipse(c, 43, gy + 26, 11, 11, done ? '#65906d' : '#edf0df'); icon(c, done ? 'check' : 'leaf', 43, gy + 26, 13, done ? '#fffef1' : '#89a07a');
      text(c, g ? g.name : '自在云间，心有山河', 63, gy + 17, 13, C.ink, 600);
      text(c, g ? g.desc + '  ' + gp + '/' + g.target : '札记已集齐，日子还很长。', 63, gy + 36, 10, C.muted);
      text(c, done ? '领取赠礼  ›' : '云间札记  ›', 382, gy + 27, 11, done ? '#ad8b4c' : '#80917d', 500, 'right'); this.hit('goal', done ? '领取任务赠礼' : '查看云间札记', 22, gy, 376, 53, done ? 'claim' : 'modal', done ? null : 'journal');
      const seedY = this.navY - 164, artY = gy + 64, artH = seedY - artY - 6, fy = seedY - 176;
      c.save(); c.beginPath(); c.rect(0, artY, 420, artH); c.clip(); D.backdrop(c, artY, artH, this.time);
      text(c, '一 方 洞 天', 27, artY + 21, 13, '#6d8b70', 500, 'left', D.serif); text(c, '春和 · 轻风', 27, artY + 42, 9, '#97a18c');
      const pairs = K.links(s); box(c, 309, artY + 10, 86, 28, '#f9faefcf', 14); icon(c, 'qi', 325, artY + 24, 12, '#ae9b65'); text(c, '共鸣 ' + pairs.length + '  ›', 340, artY + 24, 10, '#73876b'); this.hit('resonance', '查看五行共鸣规则', 309, artY + 10, 86, 28, 'modal', 'resonance');
      D.island(c, fy, this.time, s.spirits.active);
      this.plotCenters = Array.from({ length: 9 }, (_, i) => ({ x: 210 + (i % 3 - Math.floor(i / 3)) * 48, y: fy + 8 + (i % 3 + Math.floor(i / 3)) * 24 }));
      for (let i = 0; i < 9; i++) {
        const { x, y } = this.plotCenters[i], p = s.plots[i], isReady = K.progress(p, now) >= 1;
        path(c, [[x - 44, y], [x, y + 23], [x + 44, y], [x + 44, y + 7], [x, y + 30], [x - 44, y + 7]], p ? '#a09b75' : '#a9b18e');
        path(c, [[x - 44, y], [x, y - 23], [x + 44, y], [x, y + 23]], isReady ? '#ddd3a0' : p ? '#c8bf94' : '#bec7a0', isReady ? '#f0e6b3' : '#e0dfb9', 2);
        if (!p) { line(c, x - 6, y, x + 6, y, '#8ca078', 1.5); line(c, x, y - 5, x, y + 5, '#8ca078', 1.5); }
      }
      // Fine golden threads show the actual strategy links between neighboring plots.
      for (const [i, j] of pairs) { const a = this.plotCenters[i], b = this.plotCenters[j]; line(c, a.x, a.y + 9, b.x, b.y + 9, '#ede3ae', 1.5); star(c, (a.x + b.x) / 2, (a.y + b.y) / 2 + 9, 3, '#f7edbb'); }
      const order = [...Array(9).keys()].sort((a, b) => this.plotCenters[a].y - this.plotCenters[b].y);
      order.forEach(i => {
        const { x, y } = this.plotCenters[i], p = s.plots[i];
        if (p) {
          const pr = K.progress(p, now), isReady = pr >= 1; D.plant(c, p.crop, x, y + 4, .38 + Math.min(1, pr) * .45, isReady, this.time);
          if (!isReady) { box(c, x - 15, y + 12, 30, 3, '#a8ab83', 1.5); box(c, x - 15, y + 12, Math.max(3, pr * 30), 3, '#e7edc6', 1.5); }
          else { ellipse(c, x + 28, y - 17, 6, 6, '#fbf0b8'); star(c, x + 28, y - 17, 3.5, '#b99c53'); }
        }
        this.hit('plot:' + i, '灵田' + (i + 1) + (p ? '，' + K.crop(p.crop).name + (K.progress(p, now) >= 1 ? '已成熟，点击收获' : '生长中，点击移栽') : '，空田，点击种植'), x - 44, y - 23, 88, 46, 'plot', i, { diamond: true });
      });
      D.cloud(c, 21 + Math.sin(this.time * .1) * 8, fy + 115, .7, .8); D.cloud(c, 376, fy + 128, .8, .7);
      if (a.rainUntil > now) { c.strokeStyle = '#83b5adb0'; c.lineWidth = 1.3; for (let i = 0; i < 30; i++) { const xx = 70 + i * 11, yy = artY + 42 + ((now / 4 + i * 31) % Math.max(1, artH - 100)); line(c, xx, yy, xx - 3, yy + 9, '#88b6ac90', 1.3); } }
      c.restore();
      text(c, '选一株灵植，再点空田种下', 24, seedY - 6, 10, '#84907c'); text(c, '免费种植 · 收获后自动续种', 395, seedY - 6, 9, '#97a18c', 400, 'right');
      K.CROPS.forEach((p, i) => {
        const x = 22 + i * 77, y = seedY + 10, selected = s.selectedCrop === p.id;
        box(c, x, y, 68, 69, selected ? '#e1ead5' : '#f0f0e1', 12, selected ? '#90ab7e' : '#e5e7d6'); icon(c, p.id, x + 20, y + 20, 18, p.color); text(c, p.element, x + 50, y + 20, 10, p.color, 500, 'center'); text(c, p.name, x + 34, y + 41, 10, C.ink, 500, 'center'); text(c, '库存 ' + fmt(s.herbs[p.id]), x + 34, y + 57, 9, '#87937d', 400, 'center');
        this.hit('seed:' + p.id, '选择' + p.name + '，' + p.element + '属性，库存' + s.herbs[p.id], x, y, 68, 69, 'seed', p.id);
      });
      const r = K.ready(s, now), empty = s.plots.filter(p => !p).length;
      const wait = s.plots.filter(Boolean).reduce((n, p) => Math.min(n, p.start + p.duration - now), Infinity);
      const label = r.length ? '一键收获 · ' + r.length + ' 块成熟' : empty ? '一键种满 · ' + empty + ' 块空田' : '静待花开 · ' + secs(wait) + '秒';
      this.button('farm-primary', label, 22, this.navY - 73, 258, 49, r.length ? 'harvestAll' : 'sow', null, { disabled: !r.length && !empty, size: 15 });
      this.button('rain', '唤灵雨', 290, this.navY - 73, 108, 49, 'rain', null, { secondary: true, sub: '灵露 ' + s.dew + '/4  ·  −12秒', size: 13 });
    }
    title(title, sub, y = this.top + 142) { text(this.ctx, title, 25, y, 24, C.ink, 600, 'left', D.serif); text(this.ctx, sub, 25, y + 27, 11, C.muted); }
    travel() {
      const c = this.ctx, a = this.a, s = a.state, j = s.journey, y = this.top + 139;
      if (!j) {
        this.title('去云深处，走走', '三站小旅行，遇见山河，也遇见自己。');
        const gap = Math.max(105, Math.min(132, (this.navY - y - 100) / 3));
        K.ROUTES.forEach((r, i) => {
          const yy = y + 60 + i * gap, unlocked = s.realm >= r.realm; box(c, 22, yy, 376, gap - 12, '#edf0e1', 17);
          c.save(); D.round(c, 22, yy, 376, gap - 12, 17); c.clip(); D.mountain(c, 344, yy + gap, 194, gap - 20, i === 2 ? '#d8dbe0' : i === 1 ? '#e1d5bd' : '#d3dfc2'); D.mountain(c, 294, yy + gap, 155, gap - 35, i === 2 ? '#c4cad5' : i === 1 ? '#d6c4a8' : '#c0d1b3'); c.restore();
          text(c, '0' + (i + 1) + ' / ' + (unlocked ? '可前往' : K.REALMS[r.realm].name + '解锁'), 40, yy + 20, 9, r.color, 500); text(c, r.name, 40, yy + 45, 20, C.ink, 600, 'left', D.serif); text(c, r.sub, 40, yy + 69, 10, C.muted);
          const cooling = this.now < s.travelReadyAt;
          this.button('route:' + i, !unlocked ? '未解锁' : cooling ? secs(s.travelReadyAt - this.now) + '秒' : '出发  →', 290, yy + 26, 88, 39, 'travel', i, { disabled: !unlocked || cooling, size: 12 });
        });
        text(c, '不消耗体力 · 出发间隔 45 秒 · 切换页面也能照料灵田', 210, this.navY - 30, 10, C.muted, 400, 'center'); return;
      }
      const r = K.ROUTES[j.route]; this.title(r.name, '把脚步放慢一点，总有新的风景。');
      const ty = y + 62;
      line(c, 75, ty + 17, 344, ty + 17, '#dce4cf', 2);
      ['遇见', '切磋', '寻宝'].forEach((n, i) => { const xx = 75 + i * 134; ellipse(c, xx, ty + 17, 15, 15, i <= j.step ? '#74977b' : '#e6ebdc'); text(c, i < j.step ? '✓' : i + 1, xx, ty + 17, 12, i <= j.step ? '#fffef4' : '#9ba68f', 500, 'center'); text(c, n, xx, ty + 44, 10, '#7a8f76', 400, 'center'); });
      const cardY = ty + 73, cardH = this.navY - cardY - 24;
      box(c, 22, cardY, 376, cardH, '#fdfcf2', 19, '#e1e5d3');
      if (j.status === 'reward') {
        const mid = cardY + Math.max(90, cardH * .27); D.cloud(c, 210, mid, 1.3); icon(c, 'home', 210, mid - 16, 42, '#74977c'); star(c, 270, mid - 39, 6, '#c8af6f');
        text(c, '山川有回礼', 210, mid + 51, 26, C.ink, 600, 'center', D.serif); text(c, '一路小小的遇见，都装进了行囊。', 210, mid + 84, 12, C.muted, 400, 'center');
        text(c, '灵石 +' + j.loot.stones + '   修为 +' + j.loot.qi + '   星砂 +' + j.loot.ore, 210, mid + 124, 14, '#709271', 600, 'center');
        const herbs = Object.entries(j.loot.herbs).filter(([, n]) => n).map(([id, n]) => K.crop(id).element + '灵植 ×' + n).join('  '); wrap(c, herbs || '一路清风，平安归来', 56, mid + 154, 310, 11, C.muted, 21, 2);
        this.button('settle', '收下回礼，回到云间', 42, cardY + cardH - 73, 336, 49, 'settle');
      } else if (j.status === 'battle') {
        const b = j.battle, cy = cardY + Math.max(115, cardH * .32);
        text(c, '与小石灵切磋', 210, cardY + 32, 22, C.ink, 600, 'center', D.serif); text(c, '自动交手中 · 选一次法术助阵', 210, cardY + 61, 11, C.muted, 400, 'center');
        D.person(c, 105 + (b.turn % 2 ? 7 : 0), cy + 40, 1.5, this.time);
        ellipse(c, 309, cy + 44, 34, 7, '#e0e4d5'); ellipse(c, 306, cy + 11, 32, 35, '#a4b39a'); ellipse(c, 299, cy - 2, 25, 25, '#bdc9ac'); line(c, 294, cy + 5, 298, cy + 5, '#55705c', 2); line(c, 310, cy + 5, 314, cy + 5, '#55705c', 2); path(c, [[297, cy + 17], [304, cy + 21], [312, cy + 16]], null, '#70836a', 1.5);
        star(c, 210, cy + 9, 12, '#c8b478'); text(c, '你', 105, cy + 69, 12, C.ink, 500, 'center'); text(c, '小石灵', 307, cy + 69, 12, C.ink, 500, 'center');
        this.progress(56, cy + 91, 104, b.hp / b.maxHp, '#8ba478', 6); this.progress(257, cy + 91, 104, b.enemy / b.maxEnemy, '#c5a075', 6); text(c, Math.ceil(b.hp) + '/' + b.maxHp, 108, cy + 112, 10, C.muted, 400, 'center'); text(c, Math.ceil(b.enemy) + '/' + b.maxEnemy, 309, cy + 112, 10, C.muted, 400, 'center');
        wrap(c, b.log, 50, cy + 153, 320, 11, C.muted, 21, 2);
        this.button('battle:heal', '春风化雨', 42, cardY + cardH - 89, 162, 62, 'battleSkill', 'heal', { secondary: true, sub: '回复四成气血', disabled: b.used });
        this.button('battle:wind', '御风而行', 216, cardY + cardH - 89, 162, 62, 'battleSkill', 'wind', { sub: '后续出手威力翻倍', disabled: b.used });
      } else {
        const e = K.encounter(s), illustrationY = cardY + Math.max(73, cardH * .22);
        D.mountain(c, 255, illustrationY + 28, 170, 73, '#e1e6d3'); D.cloud(c, 210, illustrationY + 15, 1.1); if (j.step === 0) { path(c, [[178, illustrationY - 5], [218, illustrationY - 37], [204, illustrationY - 2], [241, illustrationY + 3], [211, illustrationY + 11]], '#d2dbc4', '#9cae90'); } else if (j.step === 1) { ellipse(c, 210, illustrationY - 4, 24, 25, '#bac7aa'); line(c, 201, illustrationY - 6, 205, illustrationY - 6, '#708468', 2); line(c, 217, illustrationY - 6, 221, illustrationY - 6, '#708468', 2); } else star(c, 210, illustrationY - 15, 22, '#cbbb81');
        const textY = illustrationY + 68; text(c, e.title, 210, textY, 24, C.ink, 600, 'center', D.serif); lines(c, e.text, 210, textY + 43, 12, '#87917e', 25, 'center');
        const by = cardY + cardH - 150;
        e.choices.forEach((o, i) => this.button('choice:' + i, o.label, 42, by + i * 67, 336, 56, 'choice', i, { secondary: i === 1, sub: o.hint, size: 14 }));
      }
    }
    alchemy() {
      const c = this.ctx, s = this.a.state, y = this.top + 140;
      this.title('把草木，炼成仙丹', '一炉烟火，温养自己的小小仙途。');
      const fy = y + 191; D.furnace(c, 210, fy, .9, !!s.brewing, this.time);
      if (s.brewing) { const b = s.brewing, r = K.recipe(b.recipe); text(c, r.name + '炼制中 · ' + secs(b.endsAt - this.now) + '秒', 210, fy + 34, 13, C.green, 500, 'center'); this.progress(116, fy + 55, 188, (this.now - b.start) / (b.endsAt - b.start), '#9aad7f'); }
      else { text(c, '炉火正好，等一味草木香', 210, fy + 35, 11, '#8b987f', 400, 'center'); }
      const cardY = fy + 78, gap = Math.max(89, Math.min(109, (this.navY - cardY - 20) / 3));
      K.RECIPES.forEach((r, i) => {
        const yy = cardY + i * gap, locked = s.realm < r.realm;
        box(c, 22, yy, 376, gap - 9, '#fffdf3', 14, '#e3e5d2'); ellipse(c, 52, yy + 30, 17, 17, i === 0 ? '#e4ecd8' : i === 1 ? '#f1e4cf' : '#e2eaeb'); ellipse(c, 52, yy + 30, 8, 8, r.color); star(c, 49, yy + 27, 3, '#f8f5dc');
        text(c, r.name, 80, yy + 23, 16, C.ink, 600, 'left', D.serif); text(c, '持有 ' + s.pills[r.id] + '  ·  修为 +' + Math.round(r.qi * (1 + K.brewBonus(s))), 80, yy + 45, 10, C.muted);
        const ingredients = Object.entries(r.ingredients); let xx = 36;
        ingredients.forEach(([id, n]) => { const cr = K.crop(id); text(c, cr.element + ' ' + s.herbs[id] + '/' + n, xx, yy + gap - 27, 10, s.herbs[id] >= n ? cr.color : '#b1a395'); xx += ingredients.length > 3 ? 49 : 75; });
        this.button('brew:' + r.id, locked ? '待解锁' : s.brewing ? '炉火正忙' : '炼一炉', 294, yy + 19, 86, 36, 'brew', r.id, { secondary: !K.canBrew(s, r.id), disabled: locked || !!s.brewing, size: 12 });
      });
    }
    cultivation() {
      const c = this.ctx, s = this.a.state, r = K.REALMS[s.realm], y = this.top + 141;
      this.title('慢慢修，也会成仙', '不赌运气，积攒的每一分都算数。');
      const cy = y + Math.min(146, Math.max(108, (this.navY - this.top - 664) * .6 + 108)), radius = 68; ellipse(c, 210, cy, 80, 80, '#edf0df'); c.beginPath(); c.arc(210, cy, radius, 0, Math.PI * 2); c.lineWidth = 4; c.strokeStyle = '#dce5d0'; c.stroke();
      c.beginPath(); c.arc(210, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (s.realm === 7 ? 1 : Math.min(1, s.qi / r.qi))); c.strokeStyle = '#8da87b'; c.lineWidth = 4; c.lineCap = 'round'; c.stroke();
      D.person(c, 210, cy + 9, .85, this.time * .4); text(c, r.name, 210, cy + 36, 15, C.ink, 600, 'center', D.serif); text(c, '静修 +' + K.passiveRate(s).toFixed(2) + ' 修为/秒', 210, cy + 101, 11, C.muted, 400, 'center');
      text(c, '第 ' + (s.realm + 1) + ' 境', 55, cy - 5, 11, '#9ba98d'); text(c, s.realm === 7 ? '自在逍遥' : '下一境', 365, cy - 5, 11, '#9ba98d', 400, 'right'); text(c, s.realm === 7 ? '仙途圆满' : K.REALMS[s.realm + 1].name, 365, cy + 18, 12, '#6e8d70', 500, 'right');
      const by = cy + 126;
      const req = s.realm === 7 ? '满田清风，尽是逍遥' : '修为 ' + fmt(s.qi) + '/' + fmt(r.qi) + '  ·  ' + K.recipe(r.pill).name + ' ' + s.pills[r.pill] + '/' + r.count;
      this.button('breakthrough', s.realm === 7 ? '已至逍遥云仙' : '突破 · ' + K.REALMS[s.realm + 1].name, 22, by, 376, 58, 'breakthrough', null, { sub: req, disabled: s.realm === 7, secondary: !K.canBreakthrough(s), size: 15 });
      text(c, '经 营 小 岛', 25, by + 84, 12, '#70886d', 500, 'left', D.serif);
      const start = by + 102, gap = Math.max(62, Math.min(81, (this.navY - start - 18) / 3));
      K.BUILDINGS.forEach((b, i) => {
        const yy = start + i * gap, lv = s.buildings[b.id], cost = K.buildingCost(s, b.id); box(c, 22, yy, 376, gap - 7, '#efefe1', 12); icon(c, b.icon, 48, yy + (gap - 7) / 2, 24, '#8b9b7d');
        text(c, b.name + '  Lv.' + lv, 74, yy + 19, 13, C.ink, 500); text(c, b.sub + (b.id === 'spring' ? ' · +' + lv * 12 + '%' : b.id === 'cottage' ? ' · +' + (lv * .18).toFixed(2) + '/秒' : ' · +' + lv * 25 + '%'), 74, yy + 39, 10, C.muted);
        this.button('upgrade:' + b.id, lv === 5 ? '已圆满' : fmt(cost) + ' 灵石 ↑', 292, yy + 11, 88, gap - 29, 'upgrade', b.id, { secondary: s.stones < cost, disabled: lv === 5, size: 11 });
      });
    }
    nav() {
      const c = this.ctx, a = this.a, s = a.state, y = this.navY;
      box(c, 10, y, 400, 64, '#fdfcf2', 20, '#e3e6d4');
      [{ id: 'farm', title: '洞天', icon: 'leaf' }, { id: 'travel', title: '云游', icon: 'cloud' }, { id: 'alchemy', title: '丹房', icon: 'furnace' }, { id: 'cultivate', title: '修行', icon: 'qi' }, { id: 'sect', title: '山门', icon: 'gate' }].forEach((n, i) => {
        const x = 14 + i * 79, selected = a.tab === n.id;
        if (selected) box(c, x + 5, y + 7, 70, 49, '#e6eddc', 14); icon(c, n.icon, x + 40, y + 23, 21, selected ? C.green : '#9ba58e'); text(c, n.title, x + 40, y + 46, 11, selected ? C.green : '#9ba58e', selected ? 600 : 400, 'center');
        const sg = K.SECT_GOALS[s.sect.goal], mission = s.spirits.mission;
        const dot = n.id === 'farm' ? K.ready(s, this.now).length : n.id === 'sect' ? !s.stats.bonds || (sg && K.sectProgress(s) >= sg.target) || (mission && this.now >= mission.endsAt) : n.id === 'cultivate' && K.canBreakthrough(s);
        if (dot) ellipse(c, x + 56, y + 14, 3, 3, '#c19c61');
        this.hit('tab:' + n.id, '打开' + n.title, x, y + 4, 77, 55, 'tab', n.id);
      });
    }
    modal() {
      const a = this.a, c = this.ctx, s = a.state, type = typeof a.modal === 'string' ? a.modal : a.modal.type;
      c.fillStyle = '#193d326e'; c.fillRect(0, 0, 420, this.H); this.hits = [];
      const h = Math.min(this.H - 100, type === 'sectHelp' ? 600 : type === 'journal' ? 615 : type === 'help' || type === 'resonance' ? 579 : type === 'plot' ? 406 : type === 'settings' ? 490 : 355), y = (this.H - h) / 2;
      box(c, 18, y + 5, 384, h, '#234f3420', 24); box(c, 18, y, 384, h, '#faf8ed', 24, '#e6e5d2'); this.smallIcon('close', 'close', '关闭窗口', 347, y + 17, 'close');
      const title = { settings: '云间小事', help: '小岛生活指南', resonance: '五行，好好相处', journal: '云间札记', offline: '你不在时，云也很慢', plot: '照料这一格灵田', reset: '重新开始一段云间生活', sectHelp: '山门生活手帖' }[type] || '云间一亩田';
      text(c, title, 40, y + 38, 22, C.ink, 600, 'left', D.serif);
      if (type === 'sectHelp') Sect.help(this, y, h);
      else if (type === 'settings') {
        text(c, '把日子调成你喜欢的样子。', 40, y + 73, 12, C.muted);
        this.settingRow('sound-toggle', 'sound', '草木音效', s.settings.sound ? '已开启' : '已关闭', y + 105, 'sound');
        this.settingRow('vibration-toggle', 'qi', '轻触反馈', s.settings.vibration ? '已开启' : '已关闭', y + 170, 'vibration');
        box(c, 38, y + 247, 344, 60, '#edf0e1', 12); icon(c, 'check', 59, y + 273, 18); text(c, a.platform.storageOK ? '进度自动保存在当前设备' : '当前存储不可用，请保持游戏打开', 80, y + 266, 12, C.ink, 500); text(c, '离线静修最多累计 8 小时，成熟灵植等你收。', 80, y + 288, 10, C.muted);
        this.button('help', '看看玩法说明', 38, y + 328, 344, 47, 'modal', 'help', { secondary: true });
        this.button('reset-open', '重新开垦小岛', 38, y + 390, 344, 43, 'modal', 'reset', { secondary: true, size: 12 });
        text(c, '云间一亩田  v1.1  ·  云间有友', 210, y + h - 28, 9, '#a1aa95', 400, 'center');
      } else if (type === 'help' || type === 'resonance') {
        text(c, type === 'help' ? '点一点就能玩，余下的交给时间。' : '让相生的灵植做邻居，收获更多灵气。', 40, y + 76, 11, C.muted);
        const cards = type === 'help' ? [
          ['01', '种下去，也会再长出来', '选底部的灵植，再点空田；也可一键种满。金色闪光表示成熟。点击或一键收获后，会自动续种，种子免费。'],
          ['02', '五行相生，多一点收成', '水 → 木 → 火 → 土 → 金 → 水。上下左右相生的两格，各增产 20%；种齐五行再加 20%。点击生长中的田，可保留进度移栽。'],
          ['03', '炼一炉丹，去一趟远方', '丹房把灵植炼成丹药，修为和丹药足够就能突破，必定成功。云游共有三站，切磋自动进行，可点一次法术。']
        ] : [
          ['水', '水生木，木生火', '凝露莲邻着青芽竹，青芽竹邻着流萤花：每一对相生邻居，双方都获得 20% 产出加成。'],
          ['土', '火生土，土生金，金生水', '只看上下左右的四个邻格。每格最多四处相生；加成达到 40% 时，该格收获的灵植数量变成 2 株。'],
          ['五', '种齐五行，全田再加 20%', '推荐布局：第一行 水木火，第二行 金土土，第三行 水木火。先收获成熟灵植，再点击田格移栽。']
        ];
        cards.forEach(([n, title, body], i) => {
          const yy = y + 111 + i * 119; box(c, 38, yy, 344, 106, '#eef0e1', 14); text(c, n, 56, yy + 23, 12, '#91a17e', 500); text(c, title, 88, yy + 23, 14, C.ink, 600, 'left', D.serif); wrap(c, body, 55, yy + 50, 310, 11, '#7c8d75', 20, 3);
        });
        this.button('help-done', '记住了，去种一田清风', 38, y + h - 73, 344, 47, 'close');
      } else if (type === 'journal') {
        const page = a.journalPage, total = Math.ceil(K.GOALS.length / 4); text(c, '小小的进步，都是仙途上的好风景。', 40, y + 76, 11, C.muted);
        for (let i = 0; i < 4; i++) {
          const index = page * 4 + i, g = K.GOALS[index]; if (!g) break;
          const yy = y + 110 + i * 65, done = index < s.goal, current = index === s.goal;
          box(c, 38, yy, 344, 56, current ? '#e6edd9' : '#f0f0e3', 11, current ? '#bccca6' : null); ellipse(c, 57, yy + 26, 10, 10, done ? '#8ca67e' : '#e0e6d2'); if (done) icon(c, 'check', 57, yy + 26, 13, '#fffdec'); else text(c, index + 1, 57, yy + 26, 10, '#8ea07f', 500, 'center');
          text(c, g.name, 78, yy + 19, 13, current ? C.ink : '#8b9781', 500); text(c, g.desc, 78, yy + 39, 10, '#8b9781'); text(c, done ? '已领取' : K.goalProgress(s, index) + '/' + g.target, 366, yy + 28, 11, '#8f9e7e', 500, 'right');
        }
        this.button('journal-prev', '‹', 38, y + 379, 46, 29, 'journalPage', -1, { secondary: true, disabled: !page }); text(c, '第 ' + (page + 1) + ' / ' + total + ' 页', 210, y + 393, 10, C.muted, 400, 'center'); this.button('journal-next', '›', 336, y + 379, 46, 29, 'journalPage', 1, { secondary: true, disabled: page >= total - 1 });
        const latest = s.log[0]; text(c, '刚刚的云间小事', 41, y + 443, 11, '#94a185'); if (latest) wrap(c, latest.text, 41, y + 469, 335, 11, '#7d8c74', 21, 2);
        const g = K.GOALS[s.goal], claimable = g && K.goalProgress(s) >= g.target;
        this.button('claim', claimable ? '领取赠礼 · 灵石 +' + g.stones + ' / 修为 +' + g.qi : g ? '下一件小事：' + g.name : '札记圆满，自在云间', 38, y + h - 73, 344, 48, 'claim', null, { secondary: !claimable, disabled: !claimable, size: 12 });
      } else if (type === 'plot') {
        const i = a.modal.index, p = s.plots[i], cr = K.crop(p.crop), pr = K.progress(p, this.now); D.plant(c, cr.id, 79, y + 143, .9, pr >= 1, this.time);
        text(c, cr.name + ' · ' + cr.element, 129, y + 105, 18, C.ink, 600, 'left', D.serif); text(c, pr >= 1 ? '已成熟，等待收获' : '再等 ' + secs(p.start + p.duration - this.now) + ' 秒', 129, y + 135, 12, C.muted); text(c, '相生增产 +' + Math.round(K.bonus(s, i) * 100) + '%', 129, y + 160, 11, '#a38e5a');
        text(c, '移栽为另一株 · 保留生长进度', 40, y + 209, 11, C.muted);
        K.CROPS.forEach((r, j) => { const xx = 38 + j * 70; box(c, xx, y + 233, 64, 65, cr.id === r.id ? '#e0e9d1' : '#eeefdf', 12); icon(c, r.id, xx + 32, y + 254, 20, r.color); text(c, r.name, xx + 32, y + 281, 10, C.ink, 400, 'center'); this.hit('replant:' + r.id, '移栽为' + r.name, xx, y + 233, 64, 65, 'replant', { index: i, crop: r.id }, { disabled: pr >= 1 }); });
        this.button('plot-done', pr >= 1 ? '收下这份成熟的灵气' : '让它慢慢长大', 38, y + h - 77, 344, 48, pr >= 1 ? 'harvestPlot' : 'close', i);
      } else if (type === 'offline') {
        const o = a.offline; icon(c, 'cloud', 210, y + 113, 53, '#8da38b'); text(c, '离开 ' + Math.max(1, Math.floor(o.elapsed / 60000)) + ' 分钟，静修未曾停下。', 210, y + 173, 13, C.muted, 400, 'center'); text(c, '修为 +' + o.qi + '   ·   ' + o.ready + ' 块灵田已成熟', 210, y + 215, 18, C.green, 600, 'center'); text(c, o.capped ? '已按最多 8 小时结算。' : '所得已经存好，去田里看看吧。', 210, y + 250, 11, C.muted, 400, 'center'); this.button('offline-done', '回到我的小天地', 38, y + h - 73, 344, 47, 'close');
      } else if (type === 'reset') {
        wrap(c, '重新开垦会清空这台设备上的小岛、境界、灵植和札记，无法撤销。', 40, y + 106, 332, 14, '#8b8e7a', 28); this.button('reset-cancel', '继续照料现在的小岛', 38, y + 206, 344, 47, 'close'); this.button('reset-confirm', '清空进度，重新开始', 38, y + 269, 344, 43, 'reset', null, { secondary: true, size: 12 });
      }
    }
    settingRow(id, name, label, value, y, arg) { const c = this.ctx; box(c, 38, y, 344, 56, '#eef0e1', 12); icon(c, name, 60, y + 28, 20, '#8ca180'); text(c, label, 86, y + 28, 14, C.ink); const on = value === '已开启'; box(c, 311, y + 16, 50, 26, on ? '#86a37b' : '#d8dfcd', 13); ellipse(c, on ? 347 : 325, y + 29, 9, 9, '#fffef1'); text(c, value, 294, y + 28, 10, C.muted, 400, 'right'); this.hit(id, label + '，' + value + '，点击切换', 38, y, 344, 56, 'setting', arg); }
    confetti() { const c = this.ctx, a = this.a; for (let i = 0; i < 28; i++) { const elapsed = 2600 - (a.celebrateUntil - this.now), x = (i * 71.31) % 420, y = ((elapsed * .16 + i * 39) % (this.H + 40)) - 20; c.save(); c.translate(x, y); c.rotate(this.time + i); star(c, 0, 0, 2 + i % 3, ['#bbad6e', '#85a77b', '#d4b288'][i % 3]); c.restore(); } }
  }
  return { View, fmt };
});

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CloudRetreat.Platform = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function create(options) {
    const api = options.api || null, browser = !api, canvas = options.canvas || api.createCanvas(), ctx = canvas.getContext('2d');
    const p = { api, browser, canvas, ctx, height: 824, top: 16, bottom: 8, scale: 1, offsetX: 0, storageOK: true, callbacks: {}, now: () => Date.now() };
    let audio = null, nativeAudio = null;
    p.resize = function () {
      let w, h, dpr, safeTop = 0, safeBottom = 0;
      if (browser) { const rect = canvas.parentElement.getBoundingClientRect(); w = rect.width; h = rect.height; dpr = Math.min(2, window.devicePixelRatio || 1); const style = window.getComputedStyle(document.documentElement); safeTop = parseFloat(style.getPropertyValue('--safe-top')) || 0; safeBottom = parseFloat(style.getPropertyValue('--safe-bottom')) || 0; }
      else {
        let info; try { info = api.getWindowInfo ? api.getWindowInfo() : api.getSystemInfoSync(); } catch (_) { info = api.getSystemInfoSync(); }
        w = info.windowWidth || info.screenWidth || 375; h = info.windowHeight || info.screenHeight || 667; dpr = Math.min(2, info.pixelRatio || 1);
        safeTop = info.safeArea ? Math.max(0, info.safeArea.top) : 0;
        safeBottom = info.safeArea ? Math.max(0, (info.screenHeight || h) - info.safeArea.bottom) : 0;
        if (api.getMenuButtonBoundingClientRect) { try { const menu = api.getMenuButtonBoundingClientRect(); if (menu && menu.bottom > 0 && menu.bottom < h * .25) safeTop = Math.max(safeTop, menu.bottom + 4); } catch (_) { /* A host can omit menu geometry. */ } }
      }
      p.scale = Math.min(w / 420, (h - safeTop - safeBottom) / 760);
      p.offsetX = (w - 420 * p.scale) / 2; p.height = h / p.scale; p.top = safeTop / p.scale + 16; p.bottom = safeBottom / p.scale + 8;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr * p.scale, 0, 0, dpr * p.scale, dpr * p.offsetX, 0);
      p.cssWidth = w; p.cssHeight = h; if (p.callbacks.resize) p.callbacks.resize();
    };
    p.position = (x, y) => ({ x: (x - p.offsetX) / p.scale, y: y / p.scale });
    p.read = key => { try { const raw = browser ? window.localStorage.getItem(key) : api.getStorageSync(key); return raw || null; } catch (_) { p.storageOK = false; return null; } };
    p.write = (key, value) => { try { if (browser) window.localStorage.setItem(key, value); else api.setStorageSync(key, value); p.storageOK = true; return true; } catch (_) { p.storageOK = false; return false; } };
    p.requestFrame = fn => typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 33);
    p.cancelFrame = id => typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id);
    p.sound = function () {
      try {
        if (browser) {
          const Constructor = window.AudioContext || window.webkitAudioContext; if (!Constructor) return;
          if (!audio) audio = new Constructor(); if (audio.state === 'suspended') audio.resume();
          [523.25, 659.25, 783.99].forEach((f, i) => { const osc = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime + i * .065; osc.type = 'sine'; osc.frequency.value = f; gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.045, at + .015); gain.gain.exponentialRampToValueAtTime(.001, at + .24); osc.connect(gain); gain.connect(audio.destination); osc.start(at); osc.stop(at + .25); });
        } else if (api.createInnerAudioContext) {
          if (!nativeAudio) { nativeAudio = api.createInnerAudioContext(); nativeAudio.src = 'assets/chime.wav'; if (nativeAudio.onError) nativeAudio.onError(() => {}); }
          nativeAudio.stop(); nativeAudio.play();
        }
      } catch (_) { /* Sound is optional; a blocked audio context must not block play. */ }
    };
    p.vibrate = function () { try { if (!browser && api.vibrateShort) api.vibrateShort({ type: 'light' }); } catch (_) { /* Some devices have no haptic motor. */ } };
    p.bind = function (callbacks) {
      p.callbacks = callbacks; let down = null;
      const point = t => ({ x: t.clientX !== undefined ? t.clientX : t.x !== undefined ? t.x : t.screenX, y: t.clientY !== undefined ? t.clientY : t.y !== undefined ? t.y : t.screenY });
      function start(x, y) { down = { x, y }; callbacks.down(p.position(x, y)); }
      function end(x, y) { const valid = down && Math.hypot(x - down.x, y - down.y) < 15; down = null; callbacks.up(p.position(x, y), valid); }
      if (browser) {
        canvas.addEventListener('pointerdown', e => { e.preventDefault(); canvas.setPointerCapture(e.pointerId); const r = canvas.getBoundingClientRect(); start(e.clientX - r.left, e.clientY - r.top); });
        canvas.addEventListener('pointerup', e => { const r = canvas.getBoundingClientRect(); end(e.clientX - r.left, e.clientY - r.top); });
        canvas.addEventListener('pointercancel', () => { down = null; callbacks.up({ x: -1, y: -1 }, false); });
        window.addEventListener('resize', p.resize); document.addEventListener('visibilitychange', () => document.hidden ? callbacks.hide() : callbacks.show());
        window.addEventListener('pagehide', callbacks.hide);
        window.addEventListener('pageshow', () => { if (!document.hidden) callbacks.show(); });
      } else {
        api.onTouchStart(e => { const t = e.touches && e.touches[0]; if (t) { const p = point(t); start(p.x, p.y); } });
        api.onTouchEnd(e => { const t = e.changedTouches && e.changedTouches[0]; if (t) { const p = point(t); end(p.x, p.y); } });
        if (api.onTouchCancel) api.onTouchCancel(() => { down = null; callbacks.up({ x: -1, y: -1 }, false); });
        api.onHide(callbacks.hide); api.onShow(callbacks.show); if (api.onWindowResize) api.onWindowResize(p.resize);
      }
    };
    p.resize(); return p;
  }
  return { create };
});

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./view.js'));
  else root.CloudRetreat.Game = factory(root.CloudRetreat.Core, root.CloudRetreat.View);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (K, V) {
  'use strict';
  class Game {
    constructor(platform) {
      this.platform = platform; this.ctx = platform.ctx;
      const raw = platform.read(K.SAVE_KEY), loaded = raw ? K.load(raw, platform.now()) : { state: K.create(platform.now()), offline: null };
      this.state = loaded.state; this.offline = loaded.offline; this.modal = loaded.offline ? 'offline' : null; this.tab = 'farm'; this.view = new V.View(this); this.visible = true; this.running = false; this.frameId = null; this.lastPaint = 0; this.lastSave = platform.now(); this.toast = null; this.rainUntil = 0; this.celebrateUntil = 0; this.journalPage = Math.floor(this.state.goal / 4); this.pressed = null;
      this.sectTab = 'spirits'; this.spiritSelection = this.state.spirits.active || 'cat';
      platform.bind({ down: p => { const h = this.findHit(p); this.pressed = h ? h.id : null; }, up: (p, valid) => { const h = this.findHit(p), id = this.pressed; this.pressed = null; if (valid && h && h.id === id) this.activate(h.id); }, hide: () => this.suspend(), show: () => this.resume(), resize: () => this.draw() });
      if (loaded.invalid) this.notify('存档无法读取，已为你开垦一座新小岛');
      this.drain(); this.save(); this.draw();
    }
    findHit(p) {
      for (let i = this.view.hits.length - 1; i >= 0; i--) {
        const h = this.view.hits[i]; if (h.disabled || p.x < h.x || p.x > h.x + h.w || p.y < h.y || p.y > h.y + h.h) continue;
        if (h.diamond && Math.abs((p.x - h.x - h.w / 2) / (h.w / 2)) + Math.abs((p.y - h.y - h.h / 2) / (h.h / 2)) > 1) continue;
        return h;
      } return null;
    }
    activate(id) { const h = this.view.hits.find(h => h.id === id); if (h && !h.disabled) this.act(h.action, h.args); }
    notify(text, duration = 2800) { if (text) this.toast = { text, until: this.platform.now() + duration }; }
    feedback() { if (this.state.settings.sound) this.platform.sound(); if (this.state.settings.vibration) this.platform.vibrate(); }
    act(action, args) {
      const now = Math.max(this.state.lastAt, this.platform.now()), s = this.state;
      K.advance(s, now, this.visible && this.tab === 'travel' && !this.modal); this.drain(); let result = null;
      if (action === 'tab') { this.tab = args; this.modal = null; }
      else if (action === 'modal') { this.modal = args; if (args === 'journal') this.journalPage = Math.min(Math.ceil(K.GOALS.length / 4) - 1, Math.floor(s.goal / 4)); }
      else if (action === 'close') this.modal = null;
      else if (action === 'seed') s.selectedCrop = args;
      else if (action === 'plot') {
        const p = s.plots[args];
        if (!p) result = K.plant(s, args, s.selectedCrop, now);
        else if (K.progress(p, now) >= 1) result = K.harvest(s, [args], now);
        else this.modal = { type: 'plot', index: args };
      } else if (action === 'replant') { result = K.plant(s, args.index, args.crop, now); if (result.ok) this.modal = null; }
      else if (action === 'harvestPlot') { result = K.harvest(s, [args], now); this.modal = null; }
      else if (action === 'harvestAll') result = K.harvest(s, K.ready(s, now), now);
      else if (action === 'sow') result = K.sowAll(s, s.selectedCrop, now);
      else if (action === 'rain') { result = K.rain(s, now); if (result.ok) this.rainUntil = now + 1700; }
      else if (action === 'brew') result = K.brew(s, args, now);
      else if (action === 'upgrade') result = K.upgrade(s, args, now);
      else if (action === 'breakthrough') { result = K.breakthrough(s, now); if (result.ok) this.celebrateUntil = now + 2600; }
      else if (action === 'claim') { result = K.claimGoal(s, now); if (result.ok) { this.celebrateUntil = now + 2600; this.journalPage = Math.min(2, Math.floor(s.goal / 4)); } }
      else if (action === 'travel') result = K.startJourney(s, args, now);
      else if (action === 'choice') result = K.choose(s, args, now);
      else if (action === 'battleSkill') result = K.battleSkill(s, args);
      else if (action === 'settle') { result = K.settleJourney(s, now); if (result.ok) { this.tab = 'farm'; this.celebrateUntil = now + 2600; } }
      else if (action === 'sectTab') this.sectTab = args;
      else if (action === 'selectSpirit') this.spiritSelection = args;
      else if (action === 'adoptSpirit') result = K.adoptSpirit(s, args, now);
      else if (action === 'equipSpirit') result = K.equipSpirit(s, args);
      else if (action === 'feedSpirit') result = K.feedSpirit(s, args, now);
      else if (action === 'sendSpirit') result = K.sendSpirit(s, now);
      else if (action === 'claimDispatch') result = K.claimDispatch(s, now);
      else if (action === 'submitOrder') result = K.submitOrder(s, args, now);
      else if (action === 'refreshOrders') result = K.refreshOrders(s, now);
      else if (action === 'studyManual') result = K.studyManual(s, args, now);
      else if (action === 'equipManual') result = K.equipManual(s, args);
      else if (action === 'forgeRelic') result = K.forgeRelic(s, args, now);
      else if (action === 'equipRelic') result = K.equipRelic(s, args);
      else if (action === 'sectClaim') { result = K.claimSectGoal(s, now); if (result.ok) this.celebrateUntil = now + 2600; }
      else if (action === 'setting') { s.settings[args] = !s.settings[args]; result = { ok: true, text: args === 'sound' ? '音效已' + (s.settings.sound ? '开启' : '关闭') : '轻触反馈已' + (s.settings.vibration ? '开启' : '关闭') }; }
      else if (action === 'journalPage') this.journalPage = Math.max(0, Math.min(Math.ceil(K.GOALS.length / 4) - 1, this.journalPage + args));
      else if (action === 'reset') { this.state = K.create(now); this.tab = 'farm'; this.sectTab = 'spirits'; this.spiritSelection = 'cat'; this.modal = null; this.toast = null; this.offline = null; this.journalPage = 0; result = { ok: true, text: '一座新小岛，等你慢慢照料' }; }
      if (result) { this.notify(result.ok ? result.text : result.reason); if (result.ok) this.feedback(); }
      this.drain(); this.save(); this.draw();
    }
    drain() { while (this.state.events.length) { const e = this.state.events.shift(); if (e.type === 'realm') this.celebrateUntil = this.platform.now() + 2600; else { this.notify(e.text); this.feedback(); } } }
    save() { this.platform.write(K.SAVE_KEY, K.serialize(this.state)); this.lastSave = this.platform.now(); }
    draw() { this.view.render(this.platform.now()); if (this.onDraw) this.onDraw(this); }
    tick() {
      const now = this.platform.now(); K.advance(this.state, now, this.visible && this.tab === 'travel' && !this.modal); this.drain(); if (now - this.lastSave >= 5000) this.save(); this.draw();
    }
    start() {
      if (this.running) return; this.running = true;
      const frame = () => { this.frameId = null; if (!this.running || !this.visible) return; const now = this.platform.now(); if (now - this.lastPaint >= 32) { this.lastPaint = now; this.tick(); } this.frameId = this.platform.requestFrame(frame); };
      this.frame = frame; this.frameId = this.platform.requestFrame(frame);
    }
    suspend() { if (!this.visible) return; K.advance(this.state, this.platform.now(), false); this.save(); this.visible = false; this.pressed = null; if (this.frameId !== null) this.platform.cancelFrame(this.frameId); this.frameId = null; }
    resume() {
      if (this.visible) return; const now = this.platform.now(), elapsed = now - this.state.lastAt, before = this.state.qi; K.advance(this.state, now, false);
      if (elapsed >= 60000) { this.offline = { elapsed: Math.min(elapsed, K.OFFLINE_CAP), qi: Math.floor(this.state.qi - before), ready: K.ready(this.state, now).length, capped: elapsed > K.OFFLINE_CAP }; this.modal = 'offline'; }
      this.visible = true; this.drain(); this.save(); this.draw(); if (this.running && this.frameId === null) this.frameId = this.platform.requestFrame(this.frame);
    }
    stop() { this.running = false; if (this.frameId !== null) this.platform.cancelFrame(this.frameId); this.frameId = null; this.save(); }
  }
  return { Game };
});

;
(function () {
  'use strict';
  const lib = window.CloudRetreat, canvas = document.getElementById('game'), controls = document.getElementById('game-controls');
  const platform = lib.Platform.create({ canvas }), game = new lib.Game.Game(platform), nodes = new Map();
  let lastSummary = 0, lastControls = '';
  function update() {
    const signature = platform.cssWidth + '/' + platform.height + '/' + platform.scale + '/' + game.view.hits.map(h => [h.id, h.label, h.x, h.y, h.w, h.h, h.disabled].join('|')).join(';');
    if (signature !== lastControls) {
    lastControls = signature;
    const seen = new Set();
    game.view.hits.forEach((h, index) => {
      seen.add(h.id); let node = nodes.get(h.id);
      if (!node) { node = document.createElement('button'); node.type = 'button'; node.dataset.action = h.id; node.addEventListener('click', e => { e.preventDefault(); game.activate(h.id); }); nodes.set(h.id, node); controls.appendChild(node); }
      node.setAttribute('aria-label', h.label); node.title = h.label; node.disabled = !!h.disabled;
      const x = (h.x * platform.scale + platform.offsetX) / platform.cssWidth * 100, y = h.y / platform.height * 100;
      node.style.left = x + '%'; node.style.top = y + '%'; node.style.width = h.w * platform.scale / platform.cssWidth * 100 + '%'; node.style.height = h.h / platform.height * 100 + '%'; node.style.clipPath = h.diamond ? 'polygon(50% 0,100% 50%,50% 100%,0 50%)' : '';
      if (controls.children[index] !== node) controls.insertBefore(node, controls.children[index] || null);
    });
    for (const [key, node] of nodes) if (!seen.has(key)) { node.remove(); nodes.delete(key); }
    }
    const now = Date.now(); if (now - lastSummary < 900) return; lastSummary = now;
    const s = game.state, K = lib.Core, ready = K.ready(s, now).length;
    document.getElementById('stat-harvest').textContent = s.stats.harvests; document.getElementById('stat-links').textContent = K.links(s).length; document.getElementById('stat-travel').textContent = s.stats.journeys;
    document.getElementById('save-status').textContent = platform.storageOK ? '进度已存于本机' : '存档暂不可用';
    const g = K.GOALS[s.goal]; document.getElementById('island-note').textContent = ready ? ready + ' 块灵田成熟了，收下一捧好光景。' : s.brewing ? K.recipe(s.brewing.recipe).name + '正在炉中，草木香就快来了。' : g ? '下一件小事：' + g.desc + '。' : '清风满田，今天也做一位闲人。';
  }
  game.onDraw = update; update(); game.start();
  document.getElementById('open-guide').addEventListener('click', () => game.act('modal', 'help'));
  window.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'Escape' && game.modal) { e.preventDefault(); game.act('close'); }
    else if (e.key >= '1' && e.key <= '5') { e.preventDefault(); game.act('tab', ['farm', 'travel', 'alchemy', 'cultivate', 'sect'][Number(e.key) - 1]); }
    else if ((e.key === ' ' || e.key.toLowerCase() === 'r') && !game.modal && game.tab === 'farm' && e.target.tagName !== 'BUTTON') { e.preventDefault(); game.activate(e.key === ' ' ? 'farm-primary' : 'rain'); }
  });
  // Read-only diagnostics for local QA; gameplay always goes through the same action and hit testing paths.
  window.cloudGame = game;
})();
