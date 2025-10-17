import { BASE_CONFIG } from './config.js';
import { clamp } from './Utils.js';

export class Enemy {
  constructor(spec) {
    this.type = spec.type; // from ENEMIES key
    this.name = spec.name;
    this.damage = spec.damage;
    this.speed = spec.speed; // px/sec
    this.maxHp = spec.hp;
    this.hp = spec.hp;
    this.trapReduce = spec.trapReduce || 0;
    this.gold = spec.gold || 0;

    this.x = 0;
    this.y = 300;
    this.radius = 10;
    this.stopped = false; // blocked by defense/base
  }

  isAlive() { return this.hp > 0; }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  update(dt, game) {
    if (!this.isAlive()) return;
    // move towards base if not blocked
    const base = BASE_CONFIG.baseRect;
    const targetX = base.x; // left edge of base box
    if (!this.stopped) {
      this.x += this.speed * dt;
      if (this.x + this.radius >= targetX) {
        this.stopped = true;
      }
    } else {
      // damage base over time (per second)
      game.damageBase(this.damage * dt);
    }
    // collide with defenses placed in field, if inside, stop and damage them
    for (const d of game.defenses) {
      if (!d.isAlive()) continue;
      if (this.x >= d.x && this.x <= d.x + d.w && this.y >= d.y && this.y <= d.y + d.h) {
        this.stopped = true;
        d.takeHit(this.damage * dt);
      }
    }
  }

  draw(ctx) {
    if (!this.isAlive()) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#69f';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    // hp bar
    const w = 24, h = 4;
    ctx.fillStyle = '#222';
    ctx.fillRect(-w/2, -16, w, h);
    const pct = clamp(this.hp / this.maxHp, 0, 1);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(-w/2, -16, w * pct, h);
    ctx.restore();
  }
}


