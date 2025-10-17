import { distance } from './Utils.js';

export class Trap {
  constructor({ x, y, spec }) {
    this.x = x; this.y = y; this.spec = spec;
    this.cooldown = 0; // seconds
    this.charges = spec.charges;
    this.radius = Math.max(6, spec.range);
  }

  isActive() { return this.charges > 0 || this.charges === Infinity; }

  update(dt, game) {
    if (!this.isActive()) return;
    this.cooldown -= dt; if (this.cooldown < 0) this.cooldown = 0;
    if (this.cooldown > 0) return;
    // trigger
    let triggered = false;
    for (const e of game.enemies) {
      if (!e.isAlive()) continue;
      const d = distance(this, e);
      if (d <= this.spec.range + e.radius) {
        const realDamage = Math.max(0, this.spec.damage - (e.trapReduce || 0));
        if (realDamage > 0) {
          e.takeDamage(realDamage);
          triggered = true;
        }
      }
    }
    if (triggered) {
      if (this.spec.lifeSteal && this.spec.lifeSteal > 0) game.healBase(this.spec.lifeSteal);
      if (this.charges !== Infinity) this.charges -= 1;
      this.cooldown = this.spec.cooldown;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = 'rgba(255,0,0,.25)';
    ctx.beginPath();
    ctx.arc(0, 0, this.spec.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}


