// Sokoban BD — pure game logic (browser + node). No DOM, no network.
(function (root) {
  'use strict';
  var DIRS = {
    up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]
  };

  // Levels: '#'=wall ' '=floor '.'=target '$'=box '*'=box on target
  //         '@'=player '+'=player on target. boxes.length === targets.length.
  var LEVELS = [
    { nameEn: 'First Push', nameBn: 'প্রথম ঠেলা', grid: [
      '#######',
      '#     #',
      '# @$. #',
      '#     #',
      '#######'
    ] },
    { nameEn: 'Double Trouble', nameBn: 'জোড়া বাক্স', grid: [
      '########',
      '#      #',
      '# $$   #',
      '# @  ..#',
      '#      #',
      '########'
    ] },
    { nameEn: 'Two Corners', nameBn: 'দুই কোণ', grid: [
      '########',
      '#      #',
      '# .$   #',
      '#  @   #',
      '#   $. #',
      '#      #',
      '########'
    ] },
    { nameEn: 'Straight Shot', nameBn: 'সোজা পথ', grid: [
      '########',
      '#      #',
      '# @ $ .#',
      '#  ### #',
      '#      #',
      '########'
    ] },
    { nameEn: 'Around the Wall', nameBn: 'দেয়ালের পাশ দিয়ে', grid: [
      '#########',
      '#   #   #',
      '# @ $   #',
      '#   # . #',
      '#   #   #',
      '#########'
    ] },
    { nameEn: 'Blocked Pair', nameBn: 'আটকে থাকা জোড়া', grid: [
      '##########',
      '#        #',
      '# @ $$ . #',
      '#      . #',
      '##########'
    ] },
    { nameEn: 'The Pocket', nameBn: 'খোপ', grid: [
      '#########',
      '#       #',
      '# .#    #',
      '# $#    #',
      '# @# $ .#',
      '#       #',
      '#########'
    ] },
    { nameEn: 'Three Boxes', nameBn: 'তিনটি বাক্স', grid: [
      '##########',
      '#        #',
      '# . $    #',
      '# @ $ .  #',
      '#   $  . #',
      '#        #',
      '##########'
    ] },
    { nameEn: "Three's Company", nameBn: 'তিন বন্ধু', grid: [
      '###########',
      '#         #',
      '# . . .   #',
      '# @ $$$   #',
      '#         #',
      '###########'
    ] },
    { nameEn: 'The Corral', nameBn: 'ঘের', grid: [
      '##########',
      '#        #',
      '# ###    #',
      '# # $  . #',
      '# #@$   .#',
      '# ###    #',
      '#        #',
      '##########'
    ] },
    { nameEn: 'Four Boxes', nameBn: 'চারটি বাক্স', grid: [
      '###########',
      '#         #',
      '# . . . . #',
      '# @$$$$   #',
      '#         #',
      '###########'
    ] },
    { nameEn: 'Final Walls', nameBn: 'শেষ দেয়াল', grid: [
      '############',
      '#          #',
      '# . . . .  #',
      '# @ $$$$ # #',
      '#        # #',
      '#          #',
      '############'
    ] }
  ];

  function key(x, y) { return x + ',' + y; }

  function parseLevel(level) {
    var walls = {}, targets = {}, boxes = [], player = null;
    var h = level.grid.length, w = 0;
    level.grid.forEach(function (row) { if (row.length > w) w = row.length; });
    level.grid.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var c = row[x];
        if (c === '#') walls[key(x, y)] = true;
        else if (c === '.') targets[key(x, y)] = true;
        else if (c === '$') boxes.push([x, y]);
        else if (c === '*') { boxes.push([x, y]); targets[key(x, y)] = true; }
        else if (c === '@') player = [x, y];
        else if (c === '+') { player = [x, y]; targets[key(x, y)] = true; }
      }
    });
    return { w: w, h: h, walls: walls, targets: targets, boxes: boxes, player: player };
  }

  function validateLevel(level) {
    var errors = [];
    var p = parseLevel(level);
    if (!p.player) errors.push('no player');
    var targetCount = Object.keys(p.targets).length;
    if (p.boxes.length === 0) errors.push('no boxes');
    if (p.boxes.length !== targetCount) errors.push('boxes(' + p.boxes.length + ') != targets(' + targetCount + ')');
    // every row same width, surrounded by walls on the border
    var w = level.grid[0].length;
    level.grid.forEach(function (row, y) {
      if (row.length !== w) errors.push('row ' + y + ' width ' + row.length + ' != ' + w);
    });
    return errors;
  }

  // state: {player:[x,y], boxes:[[x,y],...]} — immutable move, returns null if blocked.
  function move(state, walls, dir) {
    var d = DIRS[dir];
    if (!d) return null;
    var nx = state.player[0] + d[0], ny = state.player[1] + d[1];
    if (walls[key(nx, ny)]) return null;
    var boxIdx = -1;
    for (var i = 0; i < state.boxes.length; i++) {
      if (state.boxes[i][0] === nx && state.boxes[i][1] === ny) { boxIdx = i; break; }
    }
    var boxes = state.boxes.map(function (b) { return [b[0], b[1]]; });
    var pushed = false;
    if (boxIdx >= 0) {
      var bx = nx + d[0], by = ny + d[1];
      if (walls[key(bx, by)]) return null;
      for (var j = 0; j < boxes.length; j++) {
        if (boxes[j][0] === bx && boxes[j][1] === by) return null;
      }
      boxes[boxIdx] = [bx, by];
      pushed = true;
    }
    return { player: [nx, ny], boxes: boxes, pushed: pushed };
  }

  function isWin(state, targets) {
    for (var i = 0; i < state.boxes.length; i++) {
      if (!targets[key(state.boxes[i][0], state.boxes[i][1])]) return false;
    }
    return state.boxes.length > 0;
  }

  function stateKey(state) {
    var bs = state.boxes.map(function (b) { return key(b[0], b[1]); }).sort().join(';');
    return key(state.player[0], state.player[1]) + '|' + bs;
  }

  // Push-macro BFS solver: proves solvability and gives minimum pushes.
  // Returns {solvable, minPushes} (minPushes -1 if unsolvable).
  function solve(parsed) {
    var start = { player: parsed.player, boxes: parsed.boxes };
    var seen = {};
    seen[stateKey(start)] = true;
    var queue = [{ state: start, pushes: 0 }];
    var guard = 0;
    while (queue.length) {
      var cur = queue.shift();
      if (isWin(cur.state, parsed.targets)) return { solvable: true, minPushes: cur.pushes };
      if (++guard > 500000) return { solvable: false, minPushes: -1, capped: true };
      // reachable floor for the player (walls + boxes block)
      var blocked = {};
      Object.keys(parsed.walls).forEach(function (k) { blocked[k] = true; });
      cur.state.boxes.forEach(function (b) { blocked[key(b[0], b[1])] = true; });
      var reach = {};
      var stack = [cur.state.player];
      reach[key(cur.state.player[0], cur.state.player[1])] = true;
      while (stack.length) {
        var p = stack.pop();
        ['up', 'down', 'left', 'right'].forEach(function (dn) {
          var d = DIRS[dn];
          var q = [p[0] + d[0], p[1] + d[1]];
          var k = key(q[0], q[1]);
          if (!blocked[k] && !reach[k]) { reach[k] = true; stack.push(q); }
        });
      }
      // try pushing each box in each direction
      for (var i = 0; i < cur.state.boxes.length; i++) {
        var b = cur.state.boxes[i];
        ['up', 'down', 'left', 'right'].forEach(function (dn) {
          var d = DIRS[dn];
          var from = [b[0] - d[0], b[1] - d[1]];
          var to = [b[0] + d[0], b[1] + d[1]];
          if (!reach[key(from[0], from[1])]) return;
          if (parsed.walls[key(to[0], to[1])]) return;
          for (var j = 0; j < cur.state.boxes.length; j++) {
            if (cur.state.boxes[j][0] === to[0] && cur.state.boxes[j][1] === to[1]) return;
          }
          var nb = cur.state.boxes.map(function (x) { return [x[0], x[1]]; });
          nb[i] = to;
          var ns = { player: [b[0], b[1]], boxes: nb };
          var k2 = stateKey(ns);
          if (!seen[k2]) { seen[k2] = true; queue.push({ state: ns, pushes: cur.pushes + 1 }); }
        });
      }
    }
    return { solvable: false, minPushes: -1 };
  }

  var api = { DIRS: DIRS, LEVELS: LEVELS, parseLevel: parseLevel, validateLevel: validateLevel,
    move: move, isWin: isWin, solve: solve, stateKey: stateKey, key: key };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Sokoban = api;
})(typeof window !== 'undefined' ? window : globalThis);
