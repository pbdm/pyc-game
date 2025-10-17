import { angleBetween, distance } from './Utils.js';
import { Projectile } from './Projectile.js';

export class Tower {
  constructor({ x, y, spec }) {
    this.x = x; this.y = y;
    this.spec = spec; // from TOWERS
    this.range = spec.range;
    this.damage = spec.damage;
    this.rpm = spec.rpm;
    this.cooldown = 0; // seconds
  }

  findTarget(game) {
    let best = null, bestD = Infinity;
    for (const e of game.enemies) {
      if (!e.isAlive()) continue;
      const d = distance(this, e);
      if (d <= this.range && d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  update(dt, game) {
    this.cooldown -= dt;
    if (this.cooldown < 0) this.cooldown = 0;
    const target = this.findTarget(game);
    if (!target) return;
    if (this.cooldown === 0) {
      // fire
      const a = angleBetween(this, target);
      const vx = Math.cos(a), vy = Math.sin(a);
      game.projectiles.push(new Projectile({ x: this.x, y: this.y, vx, vy, damage: this.damage, target }));
      const shotsPerSec = this.rpm / 60;
      this.cooldown = 1 / shotsPerSec;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,.2)';
    ctx.beginPath();
    ctx.arc(0, 0, this.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}


