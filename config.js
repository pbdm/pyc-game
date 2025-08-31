// 游戏配置文件
const GameConfig = {
    // 游戏初始状态
    initial: {
        health: 100,
        money: 500,
        wave: 1,
        score: 0
    },

    // 防御塔配置
    towers: {
        basic: {
            name: '基础塔',
            cost: 50,
            damage: 20,
            range: 80,
            fireRate: 1000,
            color: '#3498db'
        },
        sniper: {
            name: '狙击塔',
            cost: 100,
            damage: 50,
            range: 150,
            fireRate: 2000,
            color: '#e74c3c'
        },
        cannon: {
            name: '炮塔',
            cost: 150,
            damage: 80,
            range: 100,
            fireRate: 1500,
            color: '#f39c12'
        },
        laser: {
            name: '激光塔',
            cost: 200,
            damage: 100,
            range: 120,
            fireRate: 800,
            color: '#e91e63'
        },
        bomb:{
            name: '轰炸塔',
            cost: 250,
            damage: 200,
            range:200,
            fireRate:500,
            color:'black'
        }
    },

    // 敌人配置
    enemies: {
        basic: {
            health: 100,
            speed: 1,
            reward: 10,
            color: '#e74c3c'
        },
        fast: {
            health: 80,
            speed: 2,
            reward: 15,
            color: '#9b59b6'
        },
        tank: {
            health: 200,
            speed: 0.5,
            reward: 25,
            color: '#34495e'
        }
    },

    // 游戏路径点
    path: [
        {x: 0, y: 300},
        {x: 200, y: 300},
        {x: 200, y: 100},
        {x: 600, y: 100},
        {x: 600, y: 500},
        {x: 800, y: 500}
    ],

    // 游戏参数
    game: {
        canvasWidth: 800,
        canvasHeight: 600,
        pathWidth: 40,
        towerPlacementMinDistance: 30,
        towerSpacing: 40,
        enemyDamageToBase: 10,
        waveBonus: 50,
        enemySpawnInterval: 1000,
        baseEnemyCount: 5,
        enemyCountPerWave: 2
    },

    // 子弹配置
    projectile: {
        speed: 5,
        size: 3,
        color: '#f39c12'
    },

    // 粒子效果配置
    particle: {
        count: 5,
        maxLife: 30,
        speed: 4,
        size: 2,
        color: '#f39c12'
    },

    // UI配置
    ui: {
        baseWidth: 50,
        baseHeight: 100,
        baseColor: '#e74c3c',
        baseTextColor: '#2c3e50',
        baseText: '基地',
        healthBarWidth: 30,
        healthBarHeight: 4,
        healthBarBackground: '#e74c3c',
        healthBarForeground: '#27ae60'
    },

    // 视觉效果配置
    visual: {
        background: '#f8f9fa',
        pathColor: '#95a5a6',
        towerPreviewValid: '#27ae60',
        towerPreviewInvalid: '#e74c3c',
        towerPreviewAlpha: 0.5
    }
};

// 导出配置（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}
