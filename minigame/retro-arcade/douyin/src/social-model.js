(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RetroSocialModel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const RULES_VERSION = 1, STEP = 1 / 120, DIRECTIONS = ['up', 'right', 'down', 'left', 'fire'];
  const RULES = { sokoban: '关卡高优先，同关步数少优先', mines: '仅记录通关，用时少优先', tank: '最高得分优先，同分关卡高优先', bees: '最高得分优先，同分关卡高优先', breakout: '最高得分优先，同分关卡高优先', snake: '最高得分优先', tetris: '最高得分优先，同分等级高优先' };
  function mask(input) { return DIRECTIONS.reduce((value, key, i) => value | (input[key] ? 1 << i : 0), 0); }
  function input(bits) { const value = {}; DIRECTIONS.forEach((key, i) => { if (bits & (1 << i)) value[key] = true; }); return value; }
  function metric(state, ticks) {
    const gameId = state.type, timeMs = Math.round(ticks * STEP * 1000), level = state.level + 1;
    if (gameId === 'sokoban') return state.status === 'won' ? { gameId, score: level, level, steps: state.steps, pushes: state.pushes, timeMs, order: [level, -state.steps, -state.pushes, -timeMs], label: '第' + level + '关 · ' + state.steps + '步' } : null;
    if (gameId === 'mines') { const elapsed = Math.round(state.time * 1000); return state.status === 'won' ? { gameId, score: state.score, level: 1, steps: 0, pushes: 0, timeMs: elapsed, order: [-elapsed, state.score, 0, 0], label: (elapsed / 1000).toFixed(1) + ' 秒' } : null; }
    return { gameId, score: state.score, level, steps: 0, pushes: 0, timeMs, order: [state.score, level, -timeMs, 0], label: state.score + ' 分' };
  }
  return { RULES_VERSION, STEP, RULES, mask, input, metric };
});
