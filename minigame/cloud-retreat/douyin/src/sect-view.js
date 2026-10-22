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
