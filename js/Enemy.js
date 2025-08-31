// 敌人类
class Enemy {
    constructor(x, y, type, config) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.maxHealth = config.health;
        this.health = config.health;
        this.speed = config.speed;
        this.reward = config.reward;
        this.color = config.color;
        this.pathIndex = 0;
        this.reachedEnd = false;
    }
    
    update(path) {
        if (this.pathIndex >= path.length - 1) {
            this.reachedEnd = true;
            return;
        }
        
        const target = path[this.pathIndex + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.speed) {
            this.pathIndex++;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        const barWidth = GameConfig.ui.healthBarWidth;
        const barHeight = GameConfig.ui.healthBarHeight;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = GameConfig.ui.healthBarBackground;
        ctx.fillRect(this.x - barWidth/2, this.y - 25, barWidth, barHeight);
        
        ctx.fillStyle = GameConfig.ui.healthBarForeground;
        ctx.fillRect(this.x - barWidth/2, this.y - 25, barWidth * healthPercent, barHeight);
    }
}
