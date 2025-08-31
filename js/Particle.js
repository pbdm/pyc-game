// 粒子类
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * GameConfig.particle.speed;
        this.vy = (Math.random() - 0.5) * GameConfig.particle.speed;
        this.life = GameConfig.particle.maxLife;
        this.maxLife = GameConfig.particle.maxLife;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = GameConfig.particle.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, GameConfig.particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}
