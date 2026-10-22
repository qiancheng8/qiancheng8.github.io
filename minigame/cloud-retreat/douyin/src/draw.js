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
