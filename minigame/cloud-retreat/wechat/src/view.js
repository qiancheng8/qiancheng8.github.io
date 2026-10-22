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
