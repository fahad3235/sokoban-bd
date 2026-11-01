// Sokoban BD — node unit tests. Run: node tests/unit.test.js
'use strict';
const assert = require('assert');
const S = require('../js/logic.js');
const I = require('../js/i18n.js');

let pass = 0;
function check(cond, name) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; }
  else pass++;
}

// --- structure: 12 levels, all valid ---
check(S.LEVELS.length === 12, '12 levels');
S.LEVELS.forEach((lvl, i) => {
  const errs = S.validateLevel(lvl);
  check(errs.length === 0, 'level ' + (i + 1) + ' valid (' + errs.join(';') + ')');
  check(typeof lvl.nameEn === 'string' && lvl.nameEn.length > 0, 'level ' + (i + 1) + ' has EN name');
  check(typeof lvl.nameBn === 'string' && lvl.nameBn.length > 0, 'level ' + (i + 1) + ' has BN name');
});

// --- move rules on level 1 ---
// ####### / #     # / # @$. # / #     # / #######
// player (2,2), box (3,2), target (4,2)
const p1 = S.parseLevel(S.LEVELS[0]);
const s0 = { player: p1.player.slice(), boxes: p1.boxes.map(b => b.slice()) };
check(JSON.stringify(p1.player) === '[2,2]', 'L1 player at (2,2)');
check(JSON.stringify(p1.boxes) === '[[3,2]]', 'L1 box at (3,2)');
check(!S.isWin(s0, p1.targets), 'L1 not won initially');
const walkLeft = S.move(s0, p1.walls, 'left');
check(walkLeft && walkLeft.player[0] === 1 && !walkLeft.pushed, 'walk left into floor, no push');
const walkUp = S.move(s0, p1.walls, 'up');
check(walkUp && walkUp.player[1] === 1, 'walk up into open floor');
const pushRight = S.move(s0, p1.walls, 'right');
check(pushRight && pushRight.pushed, 'push right reports pushed');
check(JSON.stringify(pushRight.boxes) === '[[4,2]]', 'box lands on target (4,2)');
check(S.isWin(pushRight, p1.targets), 'L1 won after one push');
const wallHit = S.move({ player: [1, 2], boxes: [[3, 2]] }, p1.walls, 'left');
check(wallHit === null, 'walk into wall blocked');
const pushWall = S.move({ player: [4, 2], boxes: [[5, 2]] }, p1.walls, 'right');
check(pushWall === null, 'push box into wall blocked');
const pushBox = S.move({ player: [2, 2], boxes: [[3, 2], [4, 2]] }, p1.walls, 'right');
check(pushBox === null, 'push box into box blocked');
check(S.move(s0, p1.walls, 'north') === null, 'unknown direction rejected');
check(JSON.stringify(s0.player) === '[2,2]' && JSON.stringify(s0.boxes) === '[[3,2]]', 'move is immutable (input untouched)');

// --- i18n ---
check(I.bnDigits('0123456789') === '০১২৩৪৫৬৭৮৯', 'Bengali digits 0-9');
check(I.fmt('bn', 12) === '১২', 'fmt bn 12');
check(I.fmt('en', 12) === '12', 'fmt en 12');
const enKeys = Object.keys(I.STR.en).sort().join(',');
const bnKeys = Object.keys(I.STR.bn).sort().join(',');
check(enKeys === bnKeys, 'EN/BN string keys match');

// --- solver: every level solvable, no cap ---
S.LEVELS.forEach((lvl, i) => {
  const parsed = S.parseLevel(lvl);
  const res = S.solve(parsed);
  check(res.solvable && !res.capped, 'level ' + (i + 1) + ' solvable (minPushes=' + res.minPushes + ')');
  check(res.minPushes > 0 && res.minPushes <= 60, 'level ' + (i + 1) + ' minPushes sane: ' + res.minPushes);
  console.log('  level ' + (i + 1) + ' (' + lvl.nameEn + '): minPushes=' + res.minPushes);
});

console.log(pass + ' unit checks passed');
