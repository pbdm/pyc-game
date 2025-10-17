import { Game } from './Game.js';
import { TOWERS, TRAPS, DEFENSES, BASE_CONFIG } from './config.js';
import { formatPrice } from './Utils.js';

const canvas = document.getElementById('game');
const goldEl = document.getElementById('gold');
const baseHpEl = document.getElementById('baseHp');
const waveEl = document.getElementById('wave');
const startWaveBtn = document.getElementById('startWaveBtn');
const restartBtn = document.getElementById('restartBtn');
const towerButtons = document.getElementById('towerButtons');
const trapButtons = document.getElementById('trapButtons');
const defenseButtons = document.getElementById('defenseButtons');

const game = new Game(canvas);

function rebuildToolbar() {
  function addButtons(map, container, category) {
    container.innerHTML = '';
    Object.values(map).forEach(spec => {
      const unlocked = category === 'tower'
        ? (spec.key === 'basic' || game.unlocked.tower.has(spec.key))
        : category === 'trap'
          ? game.unlocked.trap.has(spec.key)
          : game.unlocked.defense.has(spec.key);
      const btn = document.createElement('button');
      btn.className = 'item-btn' + (unlocked ? '' : ' disabled');
      btn.disabled = !unlocked;
      btn.innerHTML = `<div class="item-title">${spec.name}</div><div class="item-sub">价格：${formatPrice(spec.price)}${unlocked ? '' : '（未解锁）'}</div>`;
      btn.onclick = () => { if (unlocked) game.placing = { category, key: spec.key }; };
      container.appendChild(btn);
    });
  }
  addButtons(TOWERS, towerButtons, 'tower');
  addButtons(TRAPS, trapButtons, 'trap');
  addButtons(DEFENSES, defenseButtons, 'defense');
}

rebuildToolbar();

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  game.mouse.x = e.clientX - rect.left;
  game.mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
  if (!game.placing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const ok = game.tryPlace(game.placing.category, game.placing.key, x, y);
  if (ok) game.placing = null;
});

startWaveBtn.onclick = () => { game.startWave(); };
restartBtn.onclick = () => { game.reset(); rebuildToolbar(); };

let last = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.draw();
  if (game._unlockedDirty) { game._unlockedDirty = false; rebuildToolbar(); }
  // HUD
  goldEl.textContent = Math.floor(game.gold);
  baseHpEl.textContent = Math.floor(game.baseHp);
  // 显示当前关卡号：未开始显示当前+1，已开始则显示当前+1
  waveEl.textContent = Math.min(game.waveIndex + 1, 21);
  // 正在生成时禁用按钮
  startWaveBtn.disabled = !!game.waveSpawning || !!game.waveActive;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);


