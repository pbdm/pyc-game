// 子弹类
class Projectile {
    constructor(x, y, target, damage) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = GameConfig.projectile.speed;
    }
    
    update() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.speed) {
            this.x = this.target.x;
            this.y = this.target.y;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    hitEnemy(enemy) {
        const distance = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
        return distance < 20;
    }
    
    isOutOfBounds(width, height) {
        return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
    }
    
    draw(ctx) {
        ctx.fillStyle = GameConfig.projectile.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, GameConfig.projectile.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
