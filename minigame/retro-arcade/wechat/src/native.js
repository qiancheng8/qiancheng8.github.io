'use strict';
const Core = require('./core.js');
const Draw = require('./draw.js');
const Session = require('./session.js');
const Social = require('./social-client.js');
const OnlineConfig = require('./online-config.js');
const SocialModel = require('./social-model.js');

function start(api, options) {
  const canvas = api.createCanvas(), ctx = canvas.getContext('2d');
  let scale = 1, offsetX = 0, offsetY = 0, height = 800, scene = 'home', buttons = [], touches = new Map(), last = Date.now();
  let homePage = 0, infoPage = 0;
  const colors = { paper: '#f3eddd', ink: '#302e27', orange: '#c95936', green: '#65785a', muted: '#857d6c' };
  const audio = {};
  const apiBase = options && options.apiBase !== undefined ? options.apiBase : OnlineConfig.apiBase;
  let remoteData = null, remoteBusy = false, remoteMessage = '', socialPage = 0, boardIndex = 0, remoteVersion = 0, socialReturn = 'home', keyboardCommit = null;
  const proposal = { title: '', reason: '' };
  const social = Social.create({
    enabled: !!apiBase && typeof api.request === 'function',
    read(key) { try { return api.getStorageSync(key); } catch (_) { return null; } },
    write(key, value) { try { api.setStorageSync(key, value); return true; } catch (_) { return false; } },
    request(method, path, data, token) { return new Promise((resolve, reject) => api.request({ url: apiBase + path, method, data, timeout: 15000, header: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, success(result) { let value = result.data; if (typeof value === 'string') { try { value = JSON.parse(value); } catch (_) { reject(new Error('服务器返回了无效数据。')); return; } } if (result.statusCode >= 200 && result.statusCode < 300) resolve(value); else reject(Object.assign(new Error(value && value.error || '服务暂时不可用。'), { status: result.statusCode })); }, fail() { reject(new Error('连接失败，请检查网络后重试。')); } })); }
  });
  const session = Session.create({
    onResult: run => social.enqueue(run),
    read(key) { try { return api.getStorageSync(key); } catch (_) { return null; } },
    write(key, value) { try { api.setStorageSync(key, value); return true; } catch (_) { return false; } },
    sound(event) { try { const name = ['win', 'hurt', 'shoot'].includes(event) ? event : 'hit'; if (!audio[name]) { audio[name] = api.createInnerAudioContext(); audio[name].src = 'assets/' + name + '.wav'; if (audio[name].onError) audio[name].onError(() => {}); } audio[name].stop(); audio[name].play(); } catch (_) { /* Audio is optional. */ } }
  });
  if (api.onKeyboardConfirm) api.onKeyboardConfirm(result => { const commit = keyboardCommit; keyboardCommit = null; if (commit) commit(result.value || ''); });
  if (api.onKeyboardComplete) api.onKeyboardComplete(() => { keyboardCommit = null; });
  function editText(value, maxLength, commit) {
    if (!api.showKeyboard || !api.onKeyboardConfirm) { remoteMessage = '当前宿主暂不支持文字键盘，请在真机上输入。'; return; }
    keyboardCommit = commit; api.showKeyboard({ defaultValue: value, maxLength, multiple: false, confirmHold: false, confirmType: 'done', success() {}, fail() { keyboardCommit = null; remoteMessage = '键盘未能打开，请重试。'; } });
  }
  const short = (value, length) => [...String(value || '')].slice(0, length).join('') + ([...String(value || '')].length > length ? '…' : '');
  async function loadRemote() {
    const version = ++remoteVersion, mode = scene, gameId = Core.GAMES[boardIndex].id; remoteBusy = true; remoteMessage = '';
    try { await social.flush(); const data = mode === 'recommend' ? await social.recommendations(socialPage, 4) : await social.leaderboard(gameId, socialPage, 5); if (version === remoteVersion) remoteData = data; }
    catch (e) { if (version === remoteVersion) remoteMessage = e.message || '连接失败，请刷新重试。'; }
    finally { if (version === remoteVersion) remoteBusy = false; }
  }
  function openSocial(mode, gameId) {
    if (!['recommend', 'ranking', 'recommend-form'].includes(scene)) socialReturn = scene;
    if (session.state && session.state.status === 'playing') session.paused = true;
    scene = mode; socialPage = 0; remoteData = null; if (gameId) boardIndex = Core.GAMES.findIndex(g => g.id === gameId); clearInput(); loadRemote();
  }
  function socialBack() { remoteVersion++; remoteBusy = false; remoteMessage = ''; scene = socialReturn; clearInput(); }
  async function rename() {
    try { await social.ensure(); editText(social.player.nickname, 12, value => { social.rename(value).then(() => loadRemote()).catch(e => { remoteMessage = e.message; }); }); }
    catch (e) { remoteMessage = e.message; }
  }
  function resize() {
    let info; try { info = api.getWindowInfo ? api.getWindowInfo() : api.getSystemInfoSync(); } catch (_) { info = api.getSystemInfoSync(); }
    const w = info.windowWidth || 375, h = info.windowHeight || 812, dpr = Math.min(3, info.pixelRatio || 1);
    let top = info.safeArea ? info.safeArea.top : 20, bottom = info.safeArea ? Math.max(0, (info.screenHeight || h) - info.safeArea.bottom) : 12;
    if (api.getMenuButtonBoundingClientRect) { try { const menu = api.getMenuButtonBoundingClientRect(); if (menu && menu.bottom > 0 && menu.bottom < h / 4) top = Math.max(top, menu.bottom + 8); } catch (_) { /* No capsule in some previews. */ } }
    scale = Math.min(w / 420, (h - top - bottom) / 800); height = 800;
    offsetX = (w - 420 * scale) / 2; offsetY = top + Math.max(0, (h - top - bottom - height * scale) / 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY); ctx.imageSmoothingEnabled = false;
    clearInput();
  }
  function box(x, y, w, h, fill, border, shadow) {
    if (shadow) { ctx.fillStyle = colors.ink; ctx.fillRect(x + 3, y + 3, w, h); }
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h); }
  }
  function label(str, x, y, size, color, align, weight) { ctx.fillStyle = color || colors.ink; ctx.font = `${weight || 'normal'} ${size}px sans-serif`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); }
  function button(str, x, y, w, h, fill, onClick, action) {
    box(x, y, w, h, fill || colors.paper, colors.ink, true); label(str, x + w / 2, y + h / 2, 14, fill === colors.ink || fill === colors.orange ? '#fff6e1' : colors.ink, 'center', 'bold');
    buttons.push({ x, y, w, h, onClick, action, key: str });
  }
  function header() {
    label('8090', 24, 26, 27, colors.orange, 'left', '900'); label('像素游戏厅', 109, 27, 19, colors.ink, 'left', 'bold');
    button(session.sound ? '♪ 开' : '♪ 关', 327, 10, 65, 33, colors.paper, () => session.toggleSound());
    ctx.fillStyle = colors.ink; ctx.fillRect(24, 52, 368, 1.5);
  }
  function pager(page, total, y, change) {
    if (page > 0) button('← 上一页', 24, y, 110, 32, colors.paper, () => { change(page - 1); clearInput(); });
    label((page + 1) + ' / ' + total, 210, y + 16, 13, colors.muted, 'center');
    if (page + 1 < total) button('下一页 →', 282, y, 110, 32, colors.paper, () => { change(page + 1); clearInput(); });
  }
  function drawHome() {
    header();
    label('给长大后的你，留一枚游戏币。', 24, 80, 12, colors.muted);
    label('放学了，', 24, 125, 39, colors.ink, 'left', '900'); label('去游戏厅吧。', 24, 175, 39, colors.orange, 'left', '900');
    box(317, 99, 70, 74, '#dfba61', colors.ink, true); label('快乐', 352, 122, 18, colors.ink, 'center', 'bold'); label('不限量', 352, 149, 16, colors.ink, 'center', 'bold');
    button('▷  随便玩一个', 24, 211, 182, 42, colors.ink, () => launch(Core.GAMES[Math.floor(Math.random() * Core.GAMES.length)].id));
    label('免投币 · 点开就玩', 232, 234, 12, colors.muted);
    label('经典游戏 / SELECT A GAME', 24, 290, 13, colors.ink, 'left', 'bold'); label(String(Core.GAMES.length).padStart(2, '0') + ' 款', 390, 290, 12, colors.muted, 'right');
    Core.GAMES.slice(homePage * 4, homePage * 4 + 4).forEach((g, i) => {
      const x = 24 + (i % 2) * 190, y = 312 + Math.floor(i / 2) * 164;
      box(x, y, 178, 153, '#faf6eb', colors.ink, true);
      ctx.save(); ctx.beginPath(); ctx.rect(x + 1, y + 1, 176, 77); ctx.clip(); ctx.translate(x + 1, y - 43); ctx.scale(176 / 480, 176 / 480); Draw.thumbnail(ctx, g.id); ctx.restore();
      label(g.english, x + 11, y + 93, 8, colors.muted); label(g.title, x + 11, y + 117, 19, colors.ink, 'left', 'bold');
      label(g.category, x + 11, y + 139, 10, colors.muted); label('▶', x + 156, y + 130, 17, colors.orange, 'center');
      buttons.push({ x, y, w: 178, h: 153, key: g.id, onClick: () => launch(g.id) });
    });
    pager(homePage, Math.ceil(Core.GAMES.length / 4), 649, page => { homePage = page; });
    button('＋ 推荐游戏', 24, 696, 174, 36, '#dfba61', () => openSocial('recommend'));
    button('★ 游戏排行榜', 216, 696, 174, 36, colors.paper, () => openSocial('ranking'));
    button('我的战绩', 24, 744, 174, 34, colors.paper, () => { scene = 'records'; infoPage = 0; });
    button('怎么玩？', 216, 744, 174, 34, colors.paper, () => { scene = 'help'; infoPage = 0; });
  }
  function drawInfo() {
    header(); button('← 回游戏厅', 24, 74, 126, 38, colors.paper, () => { scene = 'home'; });
    label(scene === 'records' ? '每一分，都是童年。' : '找回手感，很简单。', 24, 161, 27, colors.ink, 'left', 'bold');
    Core.GAMES.slice(infoPage * 3, infoPage * 3 + 3).forEach((g, i) => {
      const y = 211 + i * 148, r = session.records[g.id];
      box(24, y, 368, 129, '#faf6eb', colors.ink, false); label(g.title, 42, y + 28, 22, colors.ink, 'left', 'bold');
      if (scene === 'records') { button('排行榜', 288, y + 15, 85, 31, colors.paper, () => openSocial('ranking', g.id)); label('游玩 ' + r.plays + ' 次    通关 ' + r.wins + ' 次', 42, y + 67, 15, colors.muted); label(g.id === 'sokoban' ? '已解锁第 ' + (r.level + 1) + ' / 8 关' : '最高分  ' + String(r.best).padStart(6, '0'), 42, y + 98, 15, colors.orange, 'left', 'bold'); }
      else {
        Core.HELP[g.id].forEach((str, j) => label(str, 42, y + 68 + j * 27, 12, colors.muted));
      }
    });
    pager(infoPage, Math.ceil(Core.GAMES.length / 3), 660, page => { infoPage = page; });
    label('游戏切到后台会自动暂停。', 210, 718, 12, colors.muted, 'center');
    label('原创代码与像素素材 · 经典玩法致敬', 210, 747, 11, colors.muted, 'center');
  }
  function drawSocial() {
    header(); button('← 返回', 24, 74, 100, 35, colors.paper, socialBack);
    if (scene === 'recommend-form') {
      label('推荐一款，找回童年。', 24, 158, 26, colors.ink, 'left', 'bold');
      label('游戏名称 · 最多 32 字', 24, 218, 12, colors.muted);
      button(short(proposal.title, 21) || '点这里输入游戏名', 24, 242, 368, 57, colors.paper, () => editText(proposal.title, 32, value => { proposal.title = value; }));
      label('推荐理由 · 选填，最多 120 字', 24, 341, 12, colors.muted);
      button(short(proposal.reason, 24) || '说说你为什么想玩它', 24, 367, 368, 72, colors.paper, () => editText(proposal.reason, 120, value => { proposal.reason = value; }));
      label('相同提名会合并，每人每款游戏只计一票。', 24, 482, 12, colors.muted);
      button(remoteBusy ? '正在提交…' : '推荐并投一票', 24, 529, 368, 47, colors.orange, async () => {
        if (remoteBusy) return; remoteBusy = true; remoteMessage = '';
        try { await social.recommend(proposal.title, proposal.reason); proposal.title = proposal.reason = ''; scene = 'recommend'; socialPage = 0; remoteData = null; await loadRemote(); }
        catch (e) { remoteMessage = e.message; } finally { remoteBusy = false; }
      });
      button('返回推荐榜', 24, 600, 368, 38, colors.paper, () => { scene = 'recommend'; loadRemote(); });
    } else if (scene === 'recommend') {
      label('下一款，听你的。', 24, 149, 28, colors.ink, 'left', 'bold');
      label('提名经典游戏，为喜欢的推荐投一票。', 24, 183, 12, colors.muted);
      button('＋ 我来推荐', 24, 212, 175, 36, '#dfba61', () => { scene = 'recommend-form'; remoteVersion++; remoteBusy = false; remoteMessage = ''; });
      button(social.player ? short(social.player.nickname, 10) : '设置昵称', 217, 212, 175, 36, colors.paper, rename);
      if (remoteData && remoteData.rows) remoteData.rows.forEach((row, i) => {
        const y = 272 + i * 80; box(24, y, 368, 68, '#faf6eb', colors.ink, false);
        label(String(row.rank).padStart(2, '0'), 38, y + 23, 18, colors.orange, 'left', 'bold'); label(short(row.title, 13), 75, y + 22, 16, colors.ink, 'left', 'bold');
        label(short(row.reason || '这款经典，值得再玩一次。', 19), 75, y + 49, 10, colors.muted);
        button(row.votes + (row.voted ? ' 已投' : ' 赞'), 307, y + 16, 71, 35, row.voted ? '#dfba61' : colors.paper, async () => {
          if (remoteBusy) return; remoteBusy = true;
          try { await social.vote(row.id, !row.voted); await loadRemote(); } catch (e) { remoteMessage = e.message; } finally { remoteBusy = false; }
        });
      });
      if (!remoteBusy && remoteData && !remoteData.rows.length) label('还没有提名，第一票交给你。', 210, 381, 15, colors.muted, 'center');
      if (remoteData) pager(socialPage, Math.max(1, Math.ceil(remoteData.total / 4)), 617, page => { socialPage = page; loadRemote(); });
    } else {
      const game = Core.GAMES[boardIndex];
      button('←', 24, 124, 42, 35, colors.paper, () => { boardIndex = (boardIndex + Core.GAMES.length - 1) % Core.GAMES.length; socialPage = 0; remoteData = null; loadRemote(); });
      label(game.title + '榜', 210, 143, 25, colors.ink, 'center', 'bold');
      button('→', 350, 124, 42, 35, colors.paper, () => { boardIndex = (boardIndex + 1) % Core.GAMES.length; socialPage = 0; remoteData = null; loadRemote(); });
      label(SocialModel.RULES[game.id], 210, 181, 12, colors.muted, 'center');
      button(social.player ? social.player.nickname + ' · 改昵称' : '设置我的昵称', 24, 212, 368, 32, colors.paper, rename);
      label('名次 / 玩家', 35, 267, 11, colors.muted); label('最佳成绩', 378, 267, 11, colors.muted, 'right');
      if (remoteData && remoteData.rows) remoteData.rows.forEach((row, i) => {
        const y = 286 + i * 58; box(24, y, 368, 49, social.player && row.player_id === social.player.id ? '#e7dfb7' : '#faf6eb', colors.ink, false);
        label(String(row.rank).padStart(2, '0'), 37, y + 25, 18, colors.orange, 'left', 'bold'); label(short(row.nickname, 10), 82, y + 25, 14, colors.ink); label(row.label, 378, y + 25, 13, colors.green, 'right', 'bold');
      });
      if (!remoteBusy && remoteData && !remoteData.rows.length) label('榜单还空着，来留下第一个成绩。', 210, 385, 14, colors.muted, 'center');
      const mine = remoteData && remoteData.mine; box(24, 594, 368, 43, '#e8e3d2', colors.ink, false);
      label(mine ? '我的名次 #' + mine.rank + '　' + mine.label : '我的名次：暂无有效成绩', 210, 616, 13, colors.ink, 'center', 'bold');
      if (remoteData) pager(socialPage, Math.max(1, Math.ceil(remoteData.total / 5)), 655, page => { socialPage = page; loadRemote(); });
    }
    if (remoteBusy) label('正在连接游戏厅…', 210, 711, 13, colors.green, 'center');
    else if (remoteMessage) label(short(remoteMessage, 32), 210, 711, 11, colors.orange, 'center');
    else label(social.queue.length ? social.queue.length + ' 局成绩待同步' : '真实票数 · 对局操作核验成绩', 210, 711, 11, colors.muted, 'center');
    if (scene !== 'recommend-form') button('↻ 刷新 / 重试同步', 24, 745, 368, 34, colors.paper, loadRemote);
  }
  function drawGame() {
    const s = session.state, g = Core.GAMES.find(g => g.id === s.type);
    const hud = Core.hud(s);
    button('← 大厅', 24, 12, 79, 35, colors.paper, leave);
    label(g.title, 210, 30, 22, colors.ink, 'center', 'bold');
    button(session.paused ? '继续' : '暂停', 317, 12, 74, 35, colors.paper, () => session.action('pause'));
    label(hud.stage, 24, 82, 13, colors.muted, 'left', 'bold');
    label(hud.score, 390, 82, 16, colors.orange, 'right', 'bold');
    label(hud.detail, 24, 116, 12, colors.muted);
    box(22, 142, 374, 374, colors.ink, colors.ink, true);
    ctx.save(); ctx.translate(25, 145); ctx.scale(368 / 480, 368 / 480); Draw.render(ctx, s); ctx.restore();
    button('重玩本关', 24, 539, 112, 36, colors.paper, () => session.action('restart'));
    if (s.type === 'sokoban') button('撤销一步', 152, 539, 112, 36, colors.paper, () => session.action('undo'));
    if (s.type === 'mines') button(s.flagMode ? '插旗模式 开' : '插旗模式 关', 152, 539, 112, 36, s.flagMode ? '#dfba61' : colors.paper, () => session.action('flag'));
    button(session.sound ? '♪ 音效开' : '♪ 音效关', 280, 539, 112, 36, colors.paper, () => session.toggleSound());
    if (!['bees', 'breakout'].includes(s.type)) { button(s.type === 'tetris' ? '↻' : '↑', 82, 610, 54, 50, colors.paper, null, 'up'); button('↓', 82, 668, 54, 50, colors.paper, null, 'down'); }
    button('←', 24, 668, 54, 50, colors.paper, null, 'left'); button('→', 140, 668, 54, 50, colors.paper, null, 'right');
    if (s.type !== 'sokoban') button(s.type === 'mines' && s.flagMode ? '插 旗' : Core.CONTROL[s.type].action, 282, 635, 99, 78, colors.orange, null, 'fire');
    else { label('慢慢想，', 287, 656, 18, colors.green, 'left', 'bold'); label('总会有出路。', 287, 687, 14, colors.muted); }
    const touchHints = { sokoban: '按住方向键移动 · 撤销不限次数', tank: '方向键移动 · 按住开火连续射击', bees: '左右移动 · 按住开火连续射击', tetris: '↑ 旋转 · ↓ 加速 · 点「落下」直接落底', snake: '方向键转弯 · 按住「加速」更快移动', breakout: '左右移动或在画面内滑动 · 点「发球」开始', mines: '直接点格子翻开 · 点「插旗模式」切换标记' };
    label(touchHints[s.type], 210, 760, 11, colors.muted, 'center');
    if (session.paused || s.status !== 'playing') {
      ctx.fillStyle = 'rgba(28,29,25,.78)'; ctx.fillRect(0, 0, 420, 800); buttons = [];
      box(38, 254, 344, 262, colors.paper, colors.ink, true);
      const paused = session.paused, won = s.status === 'won', lastLevel = won && s.type === 'sokoban' && s.level === Core.LEVELS.length - 1, next = Core.canAdvance(s);
      label(paused ? '休息一下，快乐等你。' : won ? (lastLevel ? '仓库整理大师！' : '漂亮！这关拿下。') : '再来一局，就现在。', 210, 303, 24, colors.ink, 'center', 'bold');
      label(paused ? '游戏已暂停，进度停在这一刻。' : s.type === 'sokoban' ? s.steps + ' 步完成 · 已保存通关记录' : '本局得分 ' + s.score + ' · 最高分 ' + session.records[s.type].best, 210, 351, 13, colors.muted, 'center');
      button(paused ? '继续游戏' : next ? '下一关  →' : '再玩一次', 68, 390, 284, 44, colors.orange, () => session.action(paused ? 'pause' : next ? 'next' : 'restart'));
      button('返回游戏厅', 68, 451, 134, 38, colors.paper, leave);
      button('查看排行榜', 218, 451, 134, 38, colors.paper, () => openSocial('ranking', s.type));
    }
  }
  function launch(type) { session.start(type); scene = 'game'; clearInput(); }
  function leave() { clearInput(); session.leave(); scene = 'home'; }
  function clearInput() { touches.clear(); session.input = {}; }
  function point(t) { return { x: ((t.clientX === undefined ? t.x : t.clientX) - offsetX) / scale, y: ((t.clientY === undefined ? t.y : t.clientY) - offsetY) / scale }; }
  const hit = p => [...buttons].reverse().find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
  function refreshInput() {
    session.input = {};
    touches.forEach(t => { const b = hit(t); if (!t.board && b && b.action) session.input[b.action] = true; });
  }
  function boardPoint(p) { return { x: (p.x - 25) * 480 / 368, y: (p.y - 145) * 480 / 368 }; }
  function boardTouch(p) { return scene === 'game' && session.state && !session.paused && session.state.status === 'playing' && p.x >= 25 && p.x <= 393 && p.y >= 145 && p.y <= 513 && ['mines', 'breakout'].includes(session.state.type); }
  api.onTouchStart(e => {
    (e.changedTouches || e.touches || []).forEach(t => { const p = point(t), b = hit(p), board = boardTouch(p); touches.set(t.identifier || 0, { ...p, initial: b, board }); if (board) { const q = boardPoint(p); session.pointer(q.x, q.y); if (session.state.type === 'breakout') session.action('fire'); } else if (b && b.action) session.action(b.action); });
    refreshInput();
  });
  if (api.onTouchMove) api.onTouchMove(e => { (e.changedTouches || e.touches || []).forEach(t => { const old = touches.get(t.identifier || 0); if (old) { const p = point(t); touches.set(t.identifier || 0, { ...p, initial: old.initial, board: old.board }); if (old.board && session.state && session.state.type === 'breakout') { const q = boardPoint(p); session.pointer(q.x, q.y); } } }); refreshInput(); });
  api.onTouchEnd(e => {
    (e.changedTouches || []).forEach(t => { const old = touches.get(t.identifier || 0), b = hit(point(t)); touches.delete(t.identifier || 0); if (old && old.initial && b && !b.action && old.initial.x === b.x && old.initial.y === b.y && old.initial.key === b.key && b.onClick) b.onClick(); });
    refreshInput();
  });
  if (api.onTouchCancel) api.onTouchCancel(clearInput);
  api.onHide(() => { if (session.state && session.state.status === 'playing') session.paused = true; clearInput(); session.record(); session.save(); });
  api.onShow(() => { last = Date.now(); clearInput(); social.flush(); });
  if (api.onNetworkStatusChange) api.onNetworkStatusChange(result => { if (result.isConnected) social.flush(); });
  if (api.onWindowResize) api.onWindowResize(resize);
  const requestFrame = canvas.requestAnimationFrame ? cb => canvas.requestAnimationFrame(cb) : typeof requestAnimationFrame === 'function' ? requestAnimationFrame : cb => setTimeout(cb, 16);
  function frame() {
    const now = Date.now(), dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
    session.tick(dt);
    ctx.fillStyle = colors.paper; ctx.fillRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);
    buttons = []; if (scene === 'game' && session.state) drawGame(); else if (scene === 'home') drawHome(); else if (['recommend', 'ranking', 'recommend-form'].includes(scene)) drawSocial(); else drawInfo();
    requestFrame(frame);
  }
  resize(); frame(); social.flush();
  return { session, canvas, launch, social };
}
module.exports = { start };
