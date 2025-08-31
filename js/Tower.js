// 塔类
class Tower {
    constructor(x, y, type, config) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.damage = config.damage;
        this.range = config.range;
        this.fireRate = config.fireRate;
        this.color = config.color;
        this.lastFired = 0;
    }
    
    update(enemies) {
        // 塔的逻辑更新
    }
    
    canFire() {
        return Date.now() - this.lastFired >= this.fireRate;
    }
    
    findTarget(enemies) {
        for (const enemy of enemies) {
            const distance = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
            if (distance <= this.range) {
                return enemy;
            }
        }
        return null;
    }
    
    draw(ctx) {
        // 绘制攻击范围
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 绘制防御塔图片
        const img = this.getTowerImage();
        if (img) {
            const size = 40;
            ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
        } else {
            // 如果图片加载失败，使用备用颜色绘制
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    getTowerImage() {
        if (!this._towerImage) {
            this._towerImage = new Image();
            this._towerImage.src = `images/${this.type}.png`;
        }
        return this._towerImage.complete ? this._towerImage : null;
    }
}
