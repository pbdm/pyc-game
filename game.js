const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600, // Increased height for UI
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let grid = [];
const GRID_WIDTH = 30;
const GRID_HEIGHT = 12;
const CELL_SIZE = 40;

let gold = 650;
let goldText;

let turrets;
let projectiles;
let zombies;

const TURRET_TYPES = {
    'basic': { price: 50, damage: 50, range: 100, fireRate: 1000, color: 0x0000ff },
    'sniper': { price: 100, damage: 100, range: 200, fireRate: 1500, color: 0x00ff00 },
    'cannon': { price: 150, damage: 100, range: 150, fireRate: 600, color: 0xffff00 },
};

const Turret = new Phaser.Class({
    Extends: Phaser.GameObjects.Rectangle,

    initialize: function Turret(scene) {
        Phaser.GameObjects.Rectangle.call(this, scene, 0, 0, CELL_SIZE, CELL_SIZE, 0x0000ff);
        scene.physics.add.existing(this);
        this.type = null;
    },

    setType: function(type) {
        this.type = type;
        const stats = TURRET_TYPES[type];
        this.damage = stats.damage;
        this.range = stats.range;
        this.fireRate = stats.fireRate;
        this.nextTic = 0;
        this.setFillStyle(stats.color);
    },

    place: function(i, j) {
        this.y = i * CELL_SIZE + CELL_SIZE / 2;
        this.x = j * CELL_SIZE + CELL_SIZE / 2;
        grid[i][j].turret = this;
        this.body.setAllowGravity(false);
    },

    update: function(time, delta) {
        if (this.active && this.type && time > this.nextTic) {
            this.fire();
            this.nextTic = time + this.fireRate;
        }
    },

    fire: function() {
        const zombie = getFirstZombieInRange(this.x, this.y, this.range);
        if (zombie) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, zombie.x, zombie.y);
            addProjectile(this.x, this.y, angle, this.damage);
        }
    }
});

const Projectile = new Phaser.Class({
    Extends: Phaser.GameObjects.Rectangle,

    initialize: function Projectile(scene) {
        Phaser.GameObjects.Rectangle.call(this, scene, 0, 0, 10, 10, 0xff0000);
        scene.physics.add.existing(this);
        this.body.setAllowGravity(false);

        this.speed = 400;
        this.damage = 0;
        this.lifespan = 0;
    },

    fire: function(x, y, angle, damage) {
        this.setActive(true);
        this.setVisible(true);

        this.setPosition(x, y);
        this.setRotation(angle);

        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        this.damage = damage;
        this.lifespan = 1000; // Increased lifespan
    },

    update: function(time, delta) {
        this.lifespan -= delta;
        if (this.lifespan <= 0) {
            this.setActive(false);
            this.setVisible(false);
            this.body.stop();
        }
    }
});

const Zombie = new Phaser.Class({
    Extends: Phaser.GameObjects.Rectangle,

    initialize: function Zombie(scene, x, y, type) {
        Phaser.GameObjects.Rectangle.call(this, scene, x, y, CELL_SIZE / 2, CELL_SIZE / 2, 0xaa0000);
        scene.physics.add.existing(this);
        this.body.setAllowGravity(false);

        if (type === 'small') {
            this.health = 50; this.speed = 15; this.damage = 5; this.reward = 25;
        } else if (type === 'normal') {
            this.health = 100; this.speed = 10; this.damage = 10; this.reward = 50;
        } else if (type === 'ram') { //冲撞僵尸
            this.health = 200; this.speed = 40; this.damage = 20; this.reward = 100;
        } else if (type === 'giant') { //巨型僵尸
            this.health = 1000; this.speed = 5; this.damage = 100; this.reward = 500;
        } else if (type === 'boss') { //BOSS僵尸
            this.health = 10000; this.speed = 2.5; this.damage = 200; this.reward = 1000;
        }

        this.active = true;
        scene.add.existing(this);
    },
    
    update: function (time, delta) {
        if (this.x < config.width - CELL_SIZE) {
                this.body.velocity.x = this.speed;
        } else {
            this.body.velocity.x = 0;
        }
    },

    takeDamage: function(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.setActive(false);
            this.setVisible(false);
            this.destroy();
            gold += this.reward;
            goldText.setText('Gold: ' + gold);
        }
    }
});

let currentWave = 0;
let waveText;
let waves = [
    { small: 2 }, { normal: 1, small: 3 }, { normal: 5, small: 7 }, { normal: 7, small: 6 },
    { normal: 7, small: 7 }, { normal: 13, small: 5 }, { normal: 15, small: 5 }, { normal: 17, small: 6 },
    { normal: 20, small: 8 }, { normal: 40, small: 10 }, { normal: 60, small: 20 }, { normal: 80, small: 30, ram: 1},
    { normal: 100, small: 40, ram: 3 }, { normal: 110, small: 60, ram: 4 }, { normal: 120, small: 40, ram: 6 },
    { normal: 130, small: 20, ram: 8, giant: 1 }, { normal: 140, small: 25, ram: 10, giant: 1 },
    { normal: 160, small: 50, ram: 20, giant: 2 }, { normal: 170, small: 60, ram: 40, giant: 3 },
    { normal: 190, small: 65, ram: 60, giant: 4, boss: 1 }, { normal: 200, small: 70, ram: 120, giant: 8, boss: 2 }
];


function getFirstZombieInRange(x, y, range) {
    const zombieUnits = zombies.getChildren();
    for (let i = 0; i < zombieUnits.length; i++) {
        const zombie = zombieUnits[i];
        if (zombie.active && Phaser.Math.Distance.Between(x, y, zombie.x, zombie.y) <= range) {
            return zombie;
        }
    }
    return false;
}

function addProjectile(x, y, angle, damage) {
    const projectile = projectiles.get();
    if (projectile) {
        projectile.fire(x, y, angle, damage);
    }
}

function preload() {
    // No assets to load
}

function create() {
    // Create the grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            let color = (x + y) % 2 === 0 ? 0x8BC34A : 0x7CB342; // Alternating green colors
            let cell = this.add.rectangle(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE, CELL_SIZE, color);
            cell.setStrokeStyle(1, 0x689F38);
            cell.setInteractive();
            cell.on('pointerdown', () => placeTurret(this, y, x));
            grid[y][x] = {
                cell: cell,
                turret: null
            };
        }
    }

    // Create the base on the right side
    let baseY = Math.floor(GRID_HEIGHT / 2) * CELL_SIZE;
    let baseX = (GRID_WIDTH - 1.5) * CELL_SIZE;
    this.base = this.add.rectangle(baseX, baseY, CELL_SIZE, CELL_SIZE * 3, 0x424242);
    this.physics.add.existing(this.base, true);
    this.base.health = 1000;

    zombies = this.physics.add.group({ classType: Zombie, runChildUpdate: true });
    turrets = this.add.group({ classType: Turret, runChildUpdate: true });
    projectiles = this.physics.add.group({ classType: Projectile, runChildUpdate: true });

    this.physics.add.collider(zombies, this.base, (base, zombie) => {
        base.health -= zombie.damage;
        zombie.destroy();
        console.log("Base health:", base.health);
        if (base.health <= 0) {
            console.log("Game Over");
            this.physics.pause();
        }
    });

    this.physics.add.overlap(projectiles, zombies, (projectile, zombie) => {
        if (zombie.active && projectile.active) {
            zombie.takeDamage(projectile.damage);
            projectile.setActive(false);
            projectile.setVisible(false);
            projectile.destroy();
        }
    });

    goldText = this.add.text(10, 500, 'Gold: ' + gold, { fontSize: '20px', fill: '#fff' });
    waveText = this.add.text(10, 530, 'Wave: ' + currentWave, { fontSize: '20px', fill: '#fff' });

    let yPos = 500;
    for(const key in TURRET_TYPES){
        const turret = TURRET_TYPES[key];
        const button = this.add.text(200, yPos, `Buy ${key} (${turret.price}g)`, { fontSize: '20px', fill: '#fff' });
        button.setInteractive();
        button.on('pointerdown', () => {
            selectedTurret = key;
        });
        yPos += 30;
    }


    const nextWaveButton = this.add.text(800, 500, 'Next Wave', { fontSize: '20px', fill: '#fff' });
    nextWaveButton.setInteractive();
    nextWaveButton.on('pointerdown', () => {
        if (zombies.countActive(true) === 0) {
            currentWave++;
            waveText.setText('Wave: ' + currentWave);
            spawnWave(currentWave);
        }
    });
}

function spawnWave(waveNumber) {
    const wave = waves[waveNumber - 1];
    if (wave) {
        for (const zombieType in wave) {
            for (let i = 0; i < wave[zombieType]; i++) {
                let y = Phaser.Math.Between(0, GRID_HEIGHT - 1) * CELL_SIZE + CELL_SIZE / 2;
                let newZombie = zombies.get(0, y, zombieType)
                if(newZombie){
                    newZombie.setActive(true);
                    newZombie.setVisible(true);
                }
            }
        }
    }
}

let selectedTurret = null;

function placeTurret(scene, i, j) {
    if (selectedTurret) {
        const turretStats = TURRET_TYPES[selectedTurret];
        if (gold >= turretStats.price && !grid[i][j].turret) {
            const turret = turrets.get();
            if (turret) {
                turret.setActive(true);
                turret.setVisible(true);
                turret.setType(selectedTurret);
                turret.place(i, j);
                gold -= turretStats.price;
                goldText.setText('Gold: ' + gold);
            }
        }
        selectedTurret = null;
    }
}

function update(time, delta) {
    // Game loop
}