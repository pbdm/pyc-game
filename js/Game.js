// 游戏主类
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = GameConfig.game.canvasWidth;
        this.height = GameConfig.game.canvasHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // 游戏状态
        this.gameState = 'menu';
        this.score = GameConfig.initial.score;
        this.money = GameConfig.initial.money;
        this.health = GameConfig.initial.health;
        this.wave = GameConfig.initial.wave;
        this.selectedTower = null;
        this.isPlacingTower = false;
        
        // 游戏对象
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        // 路径点
        this.path = GameConfig.path;
        
        // 塔配置
        this.towerConfigs = GameConfig.towers;
        
        // 敌人配置
        this.enemyConfigs = GameConfig.enemies;
        
        this.init();
    }
    
    generateTowerOptions() {
        const towerOptionsContainer = document.getElementById('tower-options');
        towerOptionsContainer.innerHTML = '';
        
        Object.keys(this.towerConfigs).forEach(towerType => {
            const config = this.towerConfigs[towerType];
            const towerOption = document.createElement('div');
            towerOption.className = 'tower-option';
            towerOption.dataset.tower = towerType;
            
            towerOption.innerHTML = `
                <div class="tower-icon ${towerType}-tower"></div>
                <div class="tower-info">
                    <div>${config.name}</div>
                    <div class="tower-cost">${config.cost}金币</div>
                </div>
            `;
            
            towerOptionsContainer.appendChild(towerOption);
        });
    }
    
    init() {
        this.generateTowerOptions();
        this.setupEventListeners();
        this.gameLoop();
        this.updateUI();
        this.showMessage('点击"开始下一波"开始游戏！');
    }
    
    setupEventListeners() {
        // 塔选择
        document.querySelectorAll('.tower-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const towerType = e.currentTarget.dataset.tower;
                this.selectTower(towerType);
            });
        });
        
        // 游戏控制
        document.getElementById('startWave').addEventListener('click', () => {
            this.startWave();
        });
        
        document.getElementById('pauseGame').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartGame').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 鼠标事件
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
    }
    
    selectTower(towerType) {
        document.querySelectorAll('.tower-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelector(`[data-tower="${towerType}"]`).classList.add('selected');
        
        this.selectedTower = towerType;
        this.isPlacingTower = true;
        this.showMessage(`选择位置放置${this.getTowerName(towerType)}`);
    }
    
    getTowerName(towerType) {
        return this.towerConfigs[towerType]?.name || towerType;
    }
    
    handleCanvasClick(e) {
        if (!this.isPlacingTower) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.canPlaceTower(x, y)) {
            this.placeTower(x, y);
        } else {
            this.showMessage('无法在此位置放置防御塔！');
        }
    }
    
    handleMouseMove(e) {
        if (!this.isPlacingTower) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.draw();
        
        // 绘制塔预览
        this.ctx.globalAlpha = GameConfig.visual.towerPreviewAlpha;
        
        // 尝试绘制塔图片预览
        const img = this.getTowerPreviewImage();
        if (img) {
            const size = 40;
            this.ctx.drawImage(img, x - size/2, y - size/2, size, size);
        } else {
            // 如果图片加载失败，使用颜色预览
            this.ctx.fillStyle = this.canPlaceTower(x, y) ? GameConfig.visual.towerPreviewValid : GameConfig.visual.towerPreviewInvalid;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    getTowerPreviewImage() {
        if (!this._towerPreviewImage) {
            this._towerPreviewImage = new Image();
            this._towerPreviewImage.src = `images/${this.selectedTower}-tower.svg`;
        }
        return this._towerPreviewImage.complete ? this._towerPreviewImage : null;
    }
    
    canPlaceTower(x, y) {
        const cost = this.towerConfigs[this.selectedTower].cost;
        if (this.money < cost) return false;
        
        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i + 1];
            const distance = this.distanceToLine(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance < GameConfig.game.towerPlacementMinDistance) return false;
        }
        
        for (const tower of this.towers) {
            const distance = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            if (distance < GameConfig.game.towerSpacing) return false;
        }
        
        return true;
    }
    
    distanceToLine(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    placeTower(x, y) {
        const config = this.towerConfigs[this.selectedTower];
        const tower = new Tower(x, y, this.selectedTower, config);
        this.towers.push(tower);
        
        this.money -= config.cost;
        this.updateUI();
        
        this.isPlacingTower = false;
        this.selectedTower = null;
        
        document.querySelectorAll('.tower-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        this.showMessage('防御塔建造完成！');
    }
    
    startWave() {
        if (this.gameState === 'menu') {
            this.gameState = 'playing';
        } else if (this.gameState === 'waveComplete') {
            this.wave++;
            this.gameState = 'playing';
        }
        
        this.spawnEnemies();
        this.showMessage(`第${this.wave}波敌人来袭！`);
    }
    
    spawnEnemies() {
        const enemyCount = GameConfig.game.baseEnemyCount + this.wave * GameConfig.game.enemyCountPerWave;
        const enemyTypes = ['basic', 'fast', 'tank'];
        
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                const enemy = new Enemy(this.path[0].x, this.path[0].y, type, this.enemyConfigs[type]);
                this.enemies.push(enemy);
            }, i * GameConfig.game.enemySpawnInterval);
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showMessage('游戏已暂停');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showMessage('游戏继续');
        }
    }
    
    restartGame() {
        this.gameState = 'menu';
        this.score = GameConfig.initial.score;
        this.money = GameConfig.initial.money;
        this.health = GameConfig.initial.health;
        this.wave = GameConfig.initial.wave;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.selectedTower = null;
        this.isPlacingTower = false;
        
        // 重新生成防御塔选项（以防配置有变化）
        this.generateTowerOptions();
        
        this.updateUI();
        this.showMessage('游戏已重置！点击"开始下一波"开始游戏！');
    }
    
    update() {
        if (this.gameState !== 'playing' && this.gameState !== 'waveComplete') return;
        
        // 只在游戏进行中更新敌人
        if (this.gameState === 'playing') {
            this.enemies.forEach((enemy, index) => {
                enemy.update(this.path);
                
                if (enemy.reachedEnd) {
                    this.health -= GameConfig.game.enemyDamageToBase;
                    this.enemies.splice(index, 1);
                    this.updateUI();
                    
                    if (this.health <= 0) {
                        this.gameOver();
                    }
                }
            });
        }
        
        // 更新塔（在waveComplete状态下也继续攻击剩余敌人）
        this.towers.forEach(tower => {
            tower.update(this.enemies);
            
            if (tower.canFire()) {
                const target = tower.findTarget(this.enemies);
                if (target) {
                    const projectile = new Projectile(tower.x, tower.y, target, tower.damage);
                    this.projectiles.push(projectile);
                    tower.lastFired = Date.now();
                }
            }
        });
        
        // 更新子弹
        this.projectiles.forEach((projectile, index) => {
            projectile.update();
            
            this.enemies.forEach((enemy, enemyIndex) => {
                if (projectile.hitEnemy(enemy)) {
                    enemy.takeDamage(projectile.damage);
                    this.projectiles.splice(index, 1);
                    
                    for (let i = 0; i < GameConfig.particle.count; i++) {
                        this.particles.push(new Particle(enemy.x, enemy.y));
                    }
                    
                    if (enemy.health <= 0) {
                        this.money += enemy.reward;
                        this.score += enemy.reward;
                        this.enemies.splice(enemyIndex, 1);
                        this.updateUI();
                    }
                }
            });
            
            if (projectile.isOutOfBounds(this.width, this.height)) {
                this.projectiles.splice(index, 1);
            }
        });
        
        // 更新粒子
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // 检查波次是否完成
        if (this.enemies.length === 0 && this.gameState === 'playing') {
            this.gameState = 'waveComplete';
            this.money += GameConfig.game.waveBonus;
            this.updateUI();
            this.showMessage(`第${this.wave}波完成！点击"开始下一波"继续游戏！`);
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        this.drawPath();
        
        this.towers.forEach(tower => tower.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        this.drawBase();
    }
    
    drawBackground() {
        this.ctx.fillStyle = GameConfig.visual.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawPath() {
        this.ctx.strokeStyle = GameConfig.visual.pathColor;
        this.ctx.lineWidth = GameConfig.game.pathWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
    }
    
    drawBase() {
        this.ctx.fillStyle = GameConfig.ui.baseColor;
        this.ctx.fillRect(this.width - GameConfig.ui.baseWidth, this.height - GameConfig.ui.baseHeight, GameConfig.ui.baseWidth, GameConfig.ui.baseHeight);
        
        this.ctx.fillStyle = GameConfig.ui.baseTextColor;
        this.ctx.font = '16px Arial';
        this.ctx.fillText(GameConfig.ui.baseText, this.width - GameConfig.ui.baseWidth + 5, this.height - GameConfig.ui.baseHeight/2);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.showMessage('游戏结束！你的基地被摧毁了！');
    }
    
    updateUI() {
        document.getElementById('health').textContent = this.health;
        document.getElementById('money').textContent = this.money;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('score').textContent = this.score;
    }
    
    showMessage(message) {
        document.getElementById('gameMessage').textContent = message;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}
