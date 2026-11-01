// Sokoban BD — DOM controller. Depends on js/logic.js + js/i18n.js.
(function () {
  'use strict';
  var S = window.Sokoban, I = window.SokobanI18n;
  var KEY = 'sokoban-bd-v1';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  var store = load();
  var lang = store.lang === 'bn' ? 'bn' : 'en';
  var levelIdx = Number.isInteger(store.level) && store.level >= 0 && store.level < S.LEVELS.length ? store.level : 0;
  var best = store.best || {};       // levelIdx -> min moves
  var done = store.done || {};       // levelIdx -> true
  var parsed, state, history, moves, pushes, won;

  function t(k) { return I.STR[lang][k]; }
  function $(id) { return document.getElementById(id); }

  function startLevel(idx) {
    levelIdx = idx;
    parsed = S.parseLevel(S.LEVELS[idx]);
    state = { player: parsed.player.slice(), boxes: parsed.boxes.map(function (b) { return b.slice(); }) };
    history = []; moves = 0; pushes = 0; won = false;
    persist(); renderAll();
  }
  function persist() {
    save({ lang: lang, level: levelIdx, best: best, done: done });
  }
  function cellClass(x, y) {
    var k = S.key(x, y);
    var isTarget = !!parsed.targets[k];
    var isBox = false;
    for (var i = 0; i < state.boxes.length; i++) {
      if (state.boxes[i][0] === x && state.boxes[i][1] === y) { isBox = true; break; }
    }
    var isPlayer = state.player[0] === x && state.player[1] === y;
    if (parsed.walls[k]) return 'wall';
    if (isPlayer) return isTarget ? 'player-target' : 'player';
    if (isBox) return isTarget ? 'box-target' : 'box';
    if (isTarget) return 'target';
    return 'floor';
  }
  function renderBoard() {
    var board = $('board');
    board.style.gridTemplateColumns = 'repeat(' + parsed.w + ', 1fr)';
    var html = '';
    for (var y = 0; y < parsed.h; y++) {
      for (var x = 0; x < parsed.w; x++) {
        html += '<div class="cell ' + cellClass(x, y) + '" data-x="' + x + '" data-y="' + y + '"></div>';
      }
    }
    board.innerHTML = html;
  }
  function renderStats() {
    var lvl = S.LEVELS[levelIdx];
    $('levelName').textContent = t('level') + ' ' + I.fmt(lang, levelIdx + 1) + ' — ' + (lang === 'bn' ? lvl.nameBn : lvl.nameEn);
    $('movesNum').textContent = I.fmt(lang, moves);
    $('pushesNum').textContent = I.fmt(lang, pushes);
    var b = best[levelIdx];
    $('bestNum').textContent = b === undefined ? '—' : I.fmt(lang, b);
    $('movesLabel').textContent = t('moves');
    $('pushesLabel').textContent = t('pushes');
    $('bestLabel').textContent = t('best');
  }
  function renderLevels() {
    var wrap = $('levelGrid');
    var html = '';
    for (var i = 0; i < S.LEVELS.length; i++) {
      var cls = 'lvl-btn' + (i === levelIdx ? ' active' : '') + (done[i] ? ' done' : '');
      html += '<button class="' + cls + '" data-lvl="' + i + '">' + I.fmt(lang, i + 1) + (done[i] ? ' ✓' : '') + '</button>';
    }
    wrap.innerHTML = html;
    wrap.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () { startLevel(parseInt(btn.dataset.lvl, 10)); });
    });
    var n = Object.keys(done).length;
    $('progressText').textContent = I.fmt(lang, n) + '/12 ' + t('completed');
  }
  function renderChrome() {
    $('title').textContent = t('title');
    $('tagline').textContent = t('tagline');
    $('undoBtn').textContent = '↩ ' + t('undo');
    $('resetBtn').textContent = '↻ ' + t('reset');
    $('prevBtn').textContent = '◀ ' + t('prev');
    $('nextBtn').textContent = t('next') + ' ▶';
    $('levelsLabel').textContent = t('levelsLabel');
    $('howTitle').textContent = t('howTitle');
    $('how1').textContent = t('how1');
    $('how2').textContent = t('how2');
    $('how3').textContent = t('how3');
    $('how4').textContent = t('how4');
    $('footer').textContent = t('footer');
    $('langBtn').textContent = lang === 'bn' ? 'English' : 'বাংলা';
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }
  function renderWin() {
    var banner = $('winBanner');
    if (!won) { banner.style.display = 'none'; return; }
    banner.style.display = 'block';
    $('winTitle').textContent = t('win');
    $('winSub').textContent = t('winSub') + ' ' + t('moves') + ': ' + I.fmt(lang, moves) + ' · ' + t('pushes') + ': ' + I.fmt(lang, pushes);
    var last = levelIdx === S.LEVELS.length - 1;
    var all = Object.keys(done).length === S.LEVELS.length;
    $('winTitle').textContent = all ? t('allDone') : t('win');
    $('winNext').textContent = last ? t('playAgain') : t('nextLevelBtn');
    $('winNext').disabled = false;
  }
  function renderAll() { renderChrome(); renderBoard(); renderStats(); renderLevels(); renderWin(); }

  function doMove(dir) {
    if (won) return;
    var next = S.move(state, parsed.walls, dir);
    if (!next) return;
    history.push({ player: state.player.slice(), boxes: state.boxes.map(function (b) { return b.slice(); }), pushed: next.pushed });
    state = { player: next.player, boxes: next.boxes };
    moves++;
    if (next.pushed) pushes++;
    if (S.isWin(state, parsed.targets)) {
      won = true;
      done[levelIdx] = true;
      if (best[levelIdx] === undefined || moves < best[levelIdx]) best[levelIdx] = moves;
      persist();
    }
    renderBoard(); renderStats(); renderLevels(); renderWin();
  }
  function undo() {
    if (!history.length || won) return;
    var prev = history.pop();
    state = { player: prev.player, boxes: prev.boxes };
    moves = Math.max(0, moves - 1);
    if (prev.pushed) pushes = Math.max(0, pushes - 1);
    renderBoard(); renderStats();
  }

  document.addEventListener('keydown', function (e) {
    var map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
    if (map[e.key]) { e.preventDefault(); doMove(map[e.key]); }
  });
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-dir]').forEach(function (btn) {
      btn.addEventListener('click', function () { doMove(btn.dataset.dir); });
    });
    $('undoBtn').addEventListener('click', undo);
    $('resetBtn').addEventListener('click', function () { startLevel(levelIdx); });
    $('prevBtn').addEventListener('click', function () { if (levelIdx > 0) startLevel(levelIdx - 1); });
    $('nextBtn').addEventListener('click', function () { if (levelIdx < S.LEVELS.length - 1) startLevel(levelIdx + 1); });
    $('winNext').addEventListener('click', function () {
      if (levelIdx < S.LEVELS.length - 1) startLevel(levelIdx + 1); else startLevel(levelIdx);
    });
    $('langBtn').addEventListener('click', function () {
      lang = lang === 'bn' ? 'en' : 'bn';
      persist(); renderAll();
    });
    startLevel(levelIdx);
  });
})();
