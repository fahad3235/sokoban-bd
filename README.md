# Sokoban BD

An offline, bilingual (English / বাংলা) Sokoban push-box puzzle game for Bangladesh.
Twelve handcrafted levels, keyboard + touch controls, undo, per-level best scores,
and progress saved in your browser. No account, no server, no network requests.

## Problem

Most Sokoban games online are ad-heavy, account-gated, or English-only, and many
ship levels that are impossible to solve. Students and casual players who want a
quick, focused puzzle — on a bus, in class breaks, or with patchy connectivity —
need something that opens instantly, works offline, and speaks their language,
with every level proven solvable before it ships.

## Features

1. **12 handcrafted levels** — from a one-push tutorial to a four-box finale,
   each proven solvable by a built-in solver (see Testing).
2. **Keyboard + touch controls** — Arrow keys / WASD, plus an on-screen D-pad
   for phones.
3. **Undo & reset** — undo any move (moves and pushes both roll back); reset
   restarts the current level.
4. **Progress & best scores** — completed levels stay marked, and the fewest
   moves per level is saved as your Best, all in `localStorage`.
5. **Level select** — jump to any level; solved levels show a ✓.
6. **EN / বাংলা toggle** — persisted, with Bengali digits.
7. **100% offline** — vanilla HTML/CSS/JavaScript, zero network requests.

## How to play

Push every box (amber) onto a target (red ring). A box on a target turns green.
You can push one box at a time and you can never pull. A box pushed into a
corner (not on a target) is stuck — press Reset and think again.

## Stack

Vanilla HTML/CSS/JavaScript. No dependencies, no build step.

## Run locally

Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Testing

```bash
node tests/unit.test.js        # pure logic + solver verification (node)
node tests/smoke.mjs           # headless-Chrome browser smoke tests (desktop)
node tests/smoke.mjs --mobile  # headless-Chrome browser smoke tests (390px)
```

The smoke tests expect a headless shell on `127.0.0.1:9225`, e.g.:

```bash
headless_shell --no-sandbox --remote-debugging-port=9225 about:blank
```

See `TEST_RESULTS.md` for the recorded results.

## Limitations

- Progress lives only in this browser's `localStorage`; clearing site data
  erases it. There is no cloud sync.
- Levels are fixed (no level editor or random levels) — 12 levels by design.
- The solver proves solvability and minimum pushes, not minimum moves;
  your Best score counts moves, so it can be higher than the push optimum.

## Status

Complete and tested. See `TEST_RESULTS.md`.
