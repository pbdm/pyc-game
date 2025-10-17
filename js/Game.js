import { BASE_CONFIG, ENEMIES, TOWERS, TRAPS, DEFENSES, WAVES, UNLOCKS } from './config.js';
import { Enemy } from './Enemy.js';
import { Tower } from './Tower.js';
import { Trap } from './Trap.js';
import { Defense } from './Defense.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reset();
  }

  reset() {
    this.time = 0;
    this.baseHp = BASE_CONFIG.baseHp;
    this.gold = BASE_CONFIG.initialGold;
    this.waveIndex = 0; // 0..20
    this.waveActive = false; // 正在进行一波（包含生成或战斗中）
    this.enemies = [];
    this.towers = [];
    this.traps = [];
    this.defenses = [];
    this.projectiles = [];
    this.placing = null; // { category: 'tower'|'trap'|'defense', key, spec }
    this.mouse = { x: 0, y: 0 };
    this.unlocked = { tower: new Set(['basic']), trap: new Set(), defense: new Set(), pit: new Set() };
  }

  damageBase(amount) {
    this.baseHp = Math.max(0, this.baseHp - amount);
  }
  healBase(amount) {
    this.baseHp = Math.min(BASE_CONFIG.baseHp, this.baseHp + amount);
  }

  addGold(n) { this.gold += n; }
  spendGold(n) { if (this.gold >= n) { this.gold -= n; return true; } return false; }

  spawnEnemy(typeKey) {
    const spec = ENEMIES[typeKey];
    const e = new Enemy({ ...spec, type: typeKey });
    e.x = 0; // spawn inside canvas so玩家能立即看到
    // random lane
    e.y = 60 + Math.random() * (this.canvas.height - 120);
    this.enemies.push(e);
  }

  startWave() {
    if (this.waveSpawning) return;
    if (this.waveActive) return; // 当前波未结束
    if (this.waveIndex >= WAVES.length) return;
    const wave = WAVES[this.waveIndex];
    this.waveSpawning = true;
    this.waveActive = true;
    const entries = Object.entries(wave);
    let queue = [];
    for (const [k, count] of entries) {
      for (let i = 0; i < count; i++) queue.push(k);
    }
    // shuffle a bit
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    let idx = 0;
    const spawnRate = 0.5; // seconds between spawns
    let timer = 0;
    // 立即生成第一只，提供点击反馈
    if (queue.length > 0) {
      this.spawnEnemy(queue[idx++]);
    }
    this.waveTimer = (dt) => {
      timer += dt;
      if (timer >= spawnRate && idx < queue.length) {
        timer = 0;
        this.spawnEnemy(queue[idx++]);
      }
      if (idx >= queue.length) {
        // wave finished spawning
        this.waveSpawning = false;
        this.waveTimer = null;
      }
    };
  }

  tryPlace(category, key, worldX, worldY) {
    if (category === 'tower') {
      const spec = TOWERS[key];
      if (!this.spendGold(spec.price)) return false;
      this.towers.push(new Tower({ x: worldX, y: worldY, spec }));
      return true;
    }
    if (category === 'trap') {
      const spec = TRAPS[key];
      if (!this.spendGold(spec.price)) return false;
      this.traps.push(new Trap({ x: worldX, y: worldY, spec }));
      return true;
    }
    if (category === 'defense') {
      const spec = DEFENSES[key];
      if (!this.spendGold(spec.price)) return false;
      const w = 40, h = 40;
      const x = Math.floor(worldX / w) * w;
      const y = Math.floor(worldY / h) * h;
      this.defenses.push(new Defense({ x, y, w, h, spec }));
      return true;
    }
    return false;
  }

  claimLoot() {
    // grant gold for dead enemies
    for (const e of this.enemies) {
      if (e._goldGranted) continue;
      if (!e.isAlive()) { this.addGold(e.gold); e._goldGranted = true; }
    }
  }

  checkWaveEndAndUnlock() {
    // 只有在一波已经开始且当前不在生成中，且场上没有存活敌人时，才推进波次
    if (!this.waveActive) return;
    if (this.waveSpawning) return;
    const alive = this.enemies.some(e => e.isAlive());
    if (!alive) {
      // unlock by wave number (1-based)
      const nextNo = this.waveIndex + 1; // current wave number
      const rules = UNLOCKS[nextNo];
      if (rules) {
        if (rules.towers) rules.towers.forEach(t => this.unlocked.tower.add(t));
        if (rules.traps) rules.traps.forEach(t => this.unlocked.trap.add(t));
        if (rules.defenses) rules.defenses.forEach(t => this.unlocked.defense.add(t));
        if (rules.pits) rules.pits.forEach(t => this.unlocked.pit.add(t));
        this._unlockedDirty = true;
      }
      this.waveIndex += 1;
      this.waveActive = false;
    }
  }

  update(dt) {
    this.time += dt;
    if (this.waveTimer) this.waveTimer(dt);
    for (const t of this.towers) t.update(dt, this);
    for (const p of this.projectiles) p.update(dt, this);
    for (const e of this.enemies) e.update(dt, this);
    for (const tr of this.traps) tr.update(dt, this);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.claimLoot();
    this.checkWaveEndAndUnlock();
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(100,116,139,.15)';
    const w = this.canvas.width, h = this.canvas.height;
    for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }

  drawBase() {
    const ctx = this.ctx; const b = BASE_CONFIG.baseRect;
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawBase();
    for (const d of this.defenses) d.draw(ctx);
    for (const tr of this.traps) tr.draw(ctx);
    for (const t of this.towers) t.draw(ctx);
    for (const p of this.projectiles) p.draw(ctx);
    for (const e of this.enemies) e.draw(ctx);
  }
}


