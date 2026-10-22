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
