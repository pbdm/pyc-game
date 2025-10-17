import { distance } from './Utils.js';

export class Projectile {
  constructor({ x, y, vx, vy, speed = 300, damage = 10, target = null }) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.speed = speed;
    this.damage = damage;
    this.radius = 3;
    this.alive = true;
    this.target = target;
  }

  update(dt, game) {
    if (!this.alive) return;
    if (this.target && this.target.isAlive()) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      this.vx = dx / len;
      this.vy = dy / len;
    }
    this.x += this.vx * this.speed * dt;
    this.y += this.vy * this.speed * dt;

    // collision with enemies
    for (const e of game.enemies) {
      if (!e.isAlive()) continue;
      const d = distance(this, e);
      if (d <= (e.radius + this.radius)) {
        e.takeDamage(this.damage);
        this.alive = false;
        break;
      }
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}


