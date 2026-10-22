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
