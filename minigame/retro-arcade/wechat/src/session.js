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
