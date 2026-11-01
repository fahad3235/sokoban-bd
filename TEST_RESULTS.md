# Sokoban BD — Test Results

Run: 2026-11-01, 14:00 slot (Asia/Dhaka). Stack: node v24.22.1, headless_shell
(Playwright chromium_headless_shell-1187) via raw CDP, file:// page.

## Unit tests — 78/78 passed (`node tests/unit.test.js`)

- 12 levels present; every level passes structural validation (player present,
  boxes == targets, uniform row width) and has EN + BN names.
- Level 1 move rules hand-verified: walk into floor, walk up into open floor,
  one right-push lands the box on its target and wins; wall walks, box-into-wall
  pushes, box-into-box pushes, and unknown directions all rejected; moves are
  immutable (input state untouched).
- i18n: Bengali digits 0–9 exact, EN/BN string key sets identical.
- Solver (push-macro BFS over player-reachable regions): every level solvable,
  none capped. Minimum pushes:
  L1 First Push 1, L2 Double Trouble 8, L3 Two Corners 2, L4 Straight Shot 2,
  L5 Around the Wall 3, L6 Blocked Pair 6, L7 The Pocket 3, L8 Three Boxes 7,
  L9 Three's Company 6, L10 The Corral 7, L11 Four Boxes 8, L12 Final Walls 8.

## Smoke tests — desktop 18/18, mobile 19/19

- Desktop: h1 title, 35 board cells (7x5 level 1), 12 level buttons, Level 1
  label, initial moves 0, ArrowRight wins level 1 (banner, moves 1, pushes 1,
  best 1, level marked done), undo blocked after a win, Next → level 2, push +
  undo restores 0 moves / 0 pushes, done persists after reload, BN toggle
  (title + Bengali digit ০), 0 console/page errors.
- Mobile (390px): same checks plus no horizontal overflow
  (document scrollWidth ≤ 391).

## Repairs

- 1 app fix found while designing tests: undo restored moves but not pushes.
  History entries now record the pushed flag, so undo rolls both back.
- 1 test-side fix before running: an early draft asserted moving up from
  level 1's start was wall-blocked; the cell above is open floor, so the
  assertion was corrected to expect a successful walk. No app change.
- 0 smoke-run app bugs.
