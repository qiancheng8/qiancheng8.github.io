(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RetroSocial = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const KEY = '8090-social-v1';
  function create(platform) {
    let saved = {}; try { saved = JSON.parse(platform.read(KEY) || '{}') || {}; } catch (_) { /* Start a fresh guest identity. */ }
    const c = { enabled: platform.enabled !== false, player: saved.player || null, token: typeof saved.token === 'string' ? saved.token : '', queue: Array.isArray(saved.queue) ? saved.queue.slice(0, 60) : [], status: 'idle', message: '', busy: false };
    let registering = null, flushing = null;
    c.persist = function () {
      try { if (platform.write(KEY, JSON.stringify({ player: c.player, token: c.token, queue: c.queue })) === false) { c.message = '本机存储不可用，身份和待同步成绩可能无法保留。'; return false; } } catch (_) { c.message = '本机存储空间不足，待同步成绩暂存在内存。'; return false; } return true;
    };
    function notify() { if (platform.onChange) platform.onChange(c); }
    async function request(method, path, data, anonymous) {
      if (!c.enabled) throw new Error('联网服务尚未配置，当前可继续离线游玩。');
      const result = await platform.request(method, path, data, anonymous ? '' : c.token);
      return result;
    }
    c.ensure = function () {
      if (!c.enabled) return Promise.reject(new Error('联网服务尚未配置，当前可继续离线游玩。'));
      if (c.token && c.player) return Promise.resolve(c.player);
      if (registering) return registering;
      registering = request('POST', '/api/players', {}, true).then(data => { c.player = data.player; c.token = data.token; c.persist(); notify(); return c.player; }).finally(() => { registering = null; }); return registering;
    };
    c.call = async function (method, path, data) {
      await c.ensure();
      try { return await request(method, path, data); } catch (e) {
        if (e.status === 401) { c.player = null; c.token = ''; c.persist(); notify(); }
        throw e;
      }
    };
    c.rename = async nickname => { const result = await c.call('PATCH', '/api/me', { nickname }); c.player = result.player; c.persist(); notify(); return result.player; };
    c.recommendations = (page, size) => c.call('GET', '/api/recommendations?page=' + (page || 0) + '&size=' + (size || 5));
    c.recommend = (title, reason) => c.call('POST', '/api/recommendations', { title, reason });
    c.vote = (id, voted) => c.call('PUT', '/api/recommendations/' + encodeURIComponent(id) + '/vote', { voted });
    c.leaderboard = (gameId, page, size) => c.call('GET', '/api/leaderboards/' + encodeURIComponent(gameId) + '?page=' + (page || 0) + '&size=' + (size || 5));
    c.enqueue = function (run) {
      if (!c.enabled || c.queue.some(entry => entry.id === run.id)) return;
      if (c.queue.length >= 60) { c.message = '待同步对局较多，请先联网同步已有成绩。'; notify(); return; }
      c.queue.push(run); c.persist(); notify(); c.flush();
    };
    c.flush = function () {
      if (flushing) return flushing;
      if (!c.enabled || !c.queue.length) return Promise.resolve();
      flushing = (async () => {
        c.status = 'syncing'; notify();
        while (c.queue.length) {
          const run = c.queue[0];
          try {
            await c.call('POST', '/api/scores', run); c.queue.shift(); c.message = '成绩已核验并同步'; c.persist();
          } catch (e) {
            c.message = e.message || '连接失败，成绩将在联网后重试。';
            if ([400, 404, 409, 413].includes(e.status)) {
              const rejected = new Set([run.id]); c.queue.shift();
              c.queue = c.queue.filter(entry => { if (rejected.has(entry.parentId)) { rejected.add(entry.id); return false; } return true; }); c.persist();
            } else { c.status = 'pending'; notify(); return; }
          }
        }
        c.status = 'synced'; notify();
      })().catch(e => { c.status = 'pending'; c.message = e.message || '连接失败，稍后可重试。'; notify(); }).finally(() => { flushing = null; if (c.queue.length && c.status === 'synced') c.flush(); });
      return flushing;
    };
    return c;
  }
  return { create, KEY };
});
