export class Defense {
  constructor({ x, y, w = 40, h = 40, spec }) {
    this.x = x; this.y = y; this.w = w; this.h = h; this.spec = spec;
    this.maxHp = spec.hp; this.hp = spec.hp;
  }

  isAlive() { return this.hp > 0; }

  takeHit(amount) {
    const dmg = Math.max(0, amount - (this.spec.reduce || 0));
    this.hp = Math.max(0, this.hp - dmg);
  }

  draw(ctx) {
    if (!this.isAlive()) return;
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    // hp bar
    ctx.fillStyle = '#0f0';
    const pct = this.hp / this.maxHp;
    ctx.fillRect(this.x, this.y - 4, this.w * pct, 3);
    ctx.restore();
  }
}


