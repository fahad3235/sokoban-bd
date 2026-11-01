// Sokoban BD — headless-Chrome smoke via raw CDP. Run: node tests/smoke.mjs [--mobile]
// Expects chrome listening on 127.0.0.1:9225 (headless_shell --remote-debugging-port=9225).
const MOBILE = process.argv.includes('--mobile');
const targets = await (await fetch('http://127.0.0.1:9225/json')).json();
const wsUrl = targets.find(t => t.type === 'page').webSocketDebuggerUrl;
const ws = new WebSocket(wsUrl);
let id = 0; const pending = new Map(); const errors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + JSON.stringify(m.params.args));
});
await new Promise(r => { ws.addEventListener('open', r, { once: true }); });
function send(method, params = {}) {
  const mid = ++id;
  return new Promise((res, rej) => { pending.set(mid, { res, rej }); ws.send(JSON.stringify({ id: mid, method, params })); });
}
function ev(expr) { return send('Runtime.evaluate', { expression: expr, returnByValue: true }).then(r => r.result.value); }
let pass = 0, fail = 0;
function check(cond, name, extra = '') { if (cond) pass++; else { fail++; console.log('FAIL ' + name + ' ' + extra); } }
await send('Page.enable'); await send('Runtime.enable');
if (MOBILE) await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const PAGE = 'file:///home/hatch/workspace/muse-project-factory/builds/sokoban-bd/index.html';
await send('Page.navigate', { url: PAGE });
await new Promise(r => setTimeout(r, 1500));
await ev(`localStorage.clear();`);
await send('Page.navigate', { url: PAGE });
await new Promise(r => setTimeout(r, 1500));

check(await ev(`document.querySelector('h1').textContent === 'Sokoban BD'`), 'h1 title', await ev(`document.querySelector('h1').textContent`));
check(await ev(`document.querySelectorAll('.cell').length === 35`), 'L1 board 35 cells (7x5)', String(await ev(`document.querySelectorAll('.cell').length`)));
check(await ev(`document.querySelectorAll('.lvl-btn').length === 12`), '12 level buttons', String(await ev(`document.querySelectorAll('.lvl-btn').length`)));
check(await ev(`document.getElementById('levelName').textContent.includes('Level 1')`), 'level 1 label');
check(await ev(`document.getElementById('movesNum').textContent === '0'`), 'initial moves 0');
// L1: one ArrowRight push wins the level
await ev(`document.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight'}));`);
check(await ev(`document.getElementById('winBanner').style.display === 'block'`), 'win banner after 1 push');
check(await ev(`document.getElementById('movesNum').textContent === '1'`), 'moves 1 after win');
check(await ev(`document.getElementById('pushesNum').textContent === '1'`), 'pushes 1 after win');
check(await ev(`document.getElementById('bestNum').textContent === '1'`), 'best 1 recorded');
check(await ev(`!!document.querySelector('.lvl-btn.done')`), 'level 1 marked done');
// Undo is blocked after a win
await ev(`document.getElementById('undoBtn').click();`);
check(await ev(`document.getElementById('movesNum').textContent === '1'`), 'undo blocked after win');
// Next level -> L2; push up, then undo restores 0/0
await ev(`document.getElementById('winNext').click();`);
check(await ev(`document.getElementById('levelName').textContent.includes('Level 2')`), 'level 2 after next');
await ev(`document.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowUp'}));`);
check(await ev(`document.getElementById('movesNum').textContent === '1' && document.getElementById('pushesNum').textContent === '1'`), 'L2 push up: 1 move 1 push');
await ev(`document.getElementById('undoBtn').click();`);
check(await ev(`document.getElementById('movesNum').textContent === '0' && document.getElementById('pushesNum').textContent === '0'`), 'undo restores 0 moves 0 pushes');
// Reload persistence: level 1 done, best 1
await send('Page.navigate', { url: PAGE });
await new Promise(r => setTimeout(r, 1500));
check(await ev(`!!document.querySelector('.lvl-btn.done')`), 'done persists after reload');
// BN toggle
await ev(`document.getElementById('langBtn').click();`);
check(await ev(`document.querySelector('h1').textContent === 'সোকোবান বিডি'`), 'BN title', await ev(`document.querySelector('h1').textContent`));
check(await ev(`document.getElementById('movesNum').textContent === '০'`), 'BN digit 0', await ev(`document.getElementById('movesNum').textContent`));
if (MOBILE) {
  check(await ev(`document.documentElement.scrollWidth <= 391`), '390px no horizontal overflow', String(await ev(`document.documentElement.scrollWidth`)));
}
check(errors.length === 0, '0 console/page errors', errors.join(' | '));
console.log(pass + ' smoke checks passed, ' + fail + ' failed' + (MOBILE ? ' (mobile)' : ' (desktop)'));
process.exit(fail ? 1 : 0);
