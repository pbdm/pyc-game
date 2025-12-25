import Phaser from 'phaser';
import { 
  GRID_SIZE, GRID_COLS, GRID_ROWS, COLORS, SCREEN_HEIGHT, SCREEN_WIDTH, TOTAL_HEIGHT,
  TURRET_STATS, TRAP_STATS, DEFENSE_ITEM_STATS, DEFENSE_TOOL_STATS,
  INITIAL_GOLD, BASE_HP, VERSION, PUBLISH_TIME
} from '../config/constants';
import { WAVES } from '../config/waves';
import { Turret } from '../entities/Turret';
import { Zombie } from '../entities/Zombie';
import { Projectile } from '../entities/Projectile';
import { DefenseItem } from '../entities/DefenseItem';
import { Trap } from '../entities/Trap';
import { SoundManager } from '../managers/SoundManager';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gold = INITIAL_GOLD;
    this.baseHp = BASE_HP;
    this.waveIndex = 0;
    this.waveActive = false;
    this.spawnTimer = 0;
    this.enemiesRemainingToSpawn = [];
    
    this.selectedItem = null; // { type: 'turret', key: 'basic' }
    this.shopCategory = 'turret'; // 'turret', 'trap', 'defense', 'tool'
    this.isPopupOpen = false;
    this.isGamePaused = false;
  }

  create() {
    this.soundManager = new SoundManager(this);
    
    this.createGrid();
    this.createBase();
    this.createGroups();
    this.createUI();
    
    // Inputs
    this.input.on('pointerdown', this.onMapClick, this);
    
    // Collisions
    this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHit, null, this);
    
    // Use processCallback for selective collision (e.g., Pits only stop specific zombies)
    this.physics.add.collider(this.enemies, this.defenseItems, this.onZombieHitWall, this.checkWallCollision, this);
    
    this.physics.add.collider(this.enemies, this.turrets, this.onZombieHitWall, null, this);
    this.physics.add.collider(this.enemies, this.base, this.onZombieHitWall, null, this);
    this.physics.add.overlap(this.enemies, this.traps, this.onZombieHitTrap, null, this);
    
    // Effects
    this.createEffects();

    // Events
    this.events.on('zombieKilled', (reward) => {
        this.gold += reward;
        this.updateStats();
    });

    // Keyboard Shortcuts
    this.createKeyboardShortcuts();

    // Orientation check for mobile
    if (!this.sys.game.device.os.desktop) {
        this.checkOrientation();
        this.scale.on('orientationchange', () => this.checkOrientation());
    }
  }

  createKeyboardShortcuts() {
      // Pause - Space
      this.input.keyboard.on('keydown-SPACE', () => {
          this.togglePause();
      });

      // Start Wave - Shift
      this.input.keyboard.on('keydown-SHIFT', () => {
          if (!this.waveActive && !this.isPopupOpen) {
              this.startWave();
          }
      });

      // Shop Categories - F1 to F4
      const categoryKeys = ['F1', 'F2', 'F3', 'F4'];
      const categories = ['turret', 'trap', 'defense', 'tool'];
      categoryKeys.forEach((key, index) => {
          this.input.keyboard.on(`keydown-${key}`, (event) => {
              event.preventDefault(); // Prevent default browser F-key behavior
              this.selectCategory(categories[index]);
          });
      });

      // Select Items - 1 to 9
      for (let i = 1; i <= 9; i++) {
          this.input.keyboard.on(`keydown-${i}`, () => {
              this.selectItemByIndex(i - 1);
          });
      }
  }

  selectItemByIndex(index) {
      let items = {};
      if (this.shopCategory === 'turret') items = TURRET_STATS;
      else if (this.shopCategory === 'trap') items = TRAP_STATS;
      else if (this.shopCategory === 'defense') items = DEFENSE_ITEM_STATS;
      else items = DEFENSE_TOOL_STATS;

      const keys = Object.keys(items);
      if (index < keys.length) {
          const key = keys[index];
          this.selectedItem = { type: this.shopCategory, key, stat: items[key] };
          this.updateShopUI();
      }
  }

  checkOrientation() {
      if (this.scale.orientation === Phaser.Scale.PORTRAIT) {
          this.showOrientationOverlay();
      } else {
          this.hideOrientationOverlay();
      }
  }

  showOrientationOverlay() {
      if (this.orientationOverlay) return;

      this.orientationOverlay = this.add.container(0, 0).setDepth(2000);
      
      const bg = this.add.rectangle(0, 0, SCREEN_WIDTH, TOTAL_HEIGHT, 0x000000, 0.9).setOrigin(0);
      const text = this.add.text(SCREEN_WIDTH/2, TOTAL_HEIGHT/2, '请横屏旋转手机以获得最佳体验\n\nPlease rotate your device to landscape', {
          fontSize: '32px',
          fill: '#fff',
          align: 'center',
          wordWrap: { width: SCREEN_WIDTH - 100 }
      }).setOrigin(0.5);

      this.orientationOverlay.add([bg, text]);
      this.physics.pause();
  }

  hideOrientationOverlay() {
      if (this.orientationOverlay) {
          this.orientationOverlay.destroy();
          this.orientationOverlay = null;
          if (!this.isGamePaused && !this.isPopupOpen) {
              this.physics.resume();
          }
      }
  }

  createEffects() {
      // Particle Manager
      this.particles = this.add.particles(0, 0, 'particle', {
          speed: 100,
          scale: { start: 1, end: 0 },
          blendMode: 'ADD',
          lifespan: 300,
          emitting: false
      });
  }

  createExplosion(x, y, color = 0xffffff, count = 10) {
      this.particles.emitParticleAt(x, y, count);
      // We can't easily change tint per emission in a single shared emitter without complex config,
      // but we can set tint for the whole manager or use multiple emitters.
      // For simplicity, let's just emit white or use a dedicated emitter if needed.
      // Actually, Phaser 3.60+ allows emitting with config overrides.
      // But let's keep it simple: White explosions for now, or use setTint if single emitter isn't running overlapping colors.
      // Better: Create a temporary emitter or just accept white.
  }
  
  showFloatingText(x, y, message, color = '#ffffff') {
      const text = this.add.text(x, y, message, {
          fontSize: '24px',
          fill: color,
          stroke: '#000',
          strokeThickness: 2,
          fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
          targets: text,
          y: y - 50,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => text.destroy()
      });
  }

  createGrid() {
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const texture = (x + y) % 2 === 0 ? 'grid_light' : 'grid_dark';
        this.add.image(x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, texture);
      }
    }
  }

  createBase() {
    this.base = this.physics.add.staticSprite(
      (GRID_COLS - 1) * GRID_SIZE + GRID_SIZE/2,
      (GRID_ROWS / 2) * GRID_SIZE,
      'base'
    );
    this.base.setScale(1, GRID_ROWS); 
    this.base.refreshBody();
    this.base.takeDamage = (amount) => this.damageBase(amount);
  }

  createGroups() {
    this.turrets = this.add.group({ classType: Turret, runChildUpdate: true });
    this.enemies = this.physics.add.group({ classType: Zombie, runChildUpdate: true });
    this.projectiles = this.physics.add.group({ classType: Projectile, runChildUpdate: true });
    this.defenseItems = this.physics.add.group({ classType: DefenseItem, runChildUpdate: false }); 
    this.traps = this.physics.add.group({ classType: Trap, runChildUpdate: true }); 
  }

  createUI() {
    // Background for bottom UI
    this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT + 75, SCREEN_WIDTH, 150, COLORS.UI_BACKGROUND)
        .setScrollFactor(0).setDepth(1000);
    
    // 1. Action Buttons (Top Left - High Visibility, Semi-Transparent)
    this.fullscreenBtn = this.add.text(20, 20, ' 全屏 ', { 
        fontSize: '32px', fill: '#fff', backgroundColor: '#0088ff', padding: { x: 15, y: 10 } 
    })
    .setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true })
    .setAlpha(0.7) // Semi-transparent
    .on('pointerdown', () => {
        if (this.scale.isFullscreen) this.scale.stopFullscreen();
        else this.scale.startFullscreen();
    });

    this.pauseBtn = this.add.text(140, 20, ' 暂停 ', { 
        fontSize: '32px', fill: '#000', backgroundColor: '#ffff00', padding: { x: 15, y: 10 } 
    })
    .setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true })
    .setAlpha(0.7) // Semi-transparent
    .on('pointerdown', () => this.togglePause());

    // 2. Stats (Top Right)
    const statStyle = { fontSize: '24px', fill: '#fff', stroke: '#000', strokeThickness: 4 };
    this.goldText = this.add.text(SCREEN_WIDTH - 20, 20, `金币: ${this.gold}`, statStyle)
        .setOrigin(1, 0).setScrollFactor(0).setDepth(2001);
    this.hpText = this.add.text(SCREEN_WIDTH - 20, 55, `生命: ${this.baseHp}`, statStyle)
        .setOrigin(1, 0).setScrollFactor(0).setDepth(2001);
    this.waveText = this.add.text(SCREEN_WIDTH - 20, 90, `波数: ${this.waveIndex + 1}`, statStyle)
        .setOrigin(1, 0).setScrollFactor(0).setDepth(2001);
    this.enemiesText = this.add.text(SCREEN_WIDTH - 20, 125, `剩余: 0`, { ...statStyle, fill: '#ffaaaa' })
        .setOrigin(1, 0).setScrollFactor(0).setDepth(2001);

    // 3. Shop Area (Bottom Left)
    const categories = [
        { key: 'turret', label: ' 炮塔 ' }, 
        { key: 'trap', label: ' 陷阱 ' }, 
        { key: 'defense', label: ' 防御 ' }, 
        { key: 'tool', label: ' 工具 ' }
    ];
    let catX = 20;
    categories.forEach(cat => {
        this.add.text(catX, SCREEN_HEIGHT + 15, cat.label, { 
            fontSize: '24px', fill: '#fff', backgroundColor: '#555', padding: { x: 12, y: 8 } 
        })
        .setScrollFactor(0).setDepth(1001).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.selectCategory(cat.key));
        catX += 120;
    });
    
    this.shopContainer = this.add.container(20, SCREEN_HEIGHT + 75).setScrollFactor(0).setDepth(1001);
    this.updateShopUI();
    
    // 4. Start Wave Button (Moved Up and Semi-Transparent)
    const nextWaveBtn = this.add.text(SCREEN_WIDTH - 20, SCREEN_HEIGHT + 5, ' 开始波数 ', { 
        fontSize: '36px', fill: '#fff', backgroundColor: '#00aa00', padding: { x: 25, y: 15 } 
    })
    .setOrigin(1, 0).setScrollFactor(0).setDepth(1001).setInteractive({ useHandCursor: true })
    .setAlpha(0.8) // Slightly more opaque than other buttons
    .on('pointerdown', () => this.startWave());

    // Version
    this.add.text(SCREEN_WIDTH - 10, TOTAL_HEIGHT - 5, `v${VERSION} (${PUBLISH_TIME})`, {
        fontSize: '12px', fill: '#666'
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(1001);
  }

  selectCategory(cat) {
    this.shopCategory = cat;
    this.updateShopUI();
  }

  updateShopUI() {
    this.shopContainer.removeAll(true);
    let items = {};
    if (this.shopCategory === 'turret') items = TURRET_STATS;
    else if (this.shopCategory === 'trap') items = TRAP_STATS;
    else if (this.shopCategory === 'defense') items = DEFENSE_ITEM_STATS;
    else items = DEFENSE_TOOL_STATS;
    
    let x = 0;
    for (const [key, stat] of Object.entries(items)) {
        const isSelected = this.selectedItem && this.selectedItem.key === key;
        const btn = this.add.text(x, 0, `${stat.name}\n$${stat.cost}`, { 
            fontSize: '18px', 
            fill: '#fff', 
            backgroundColor: isSelected ? '#ffaa00' : '#444', 
            padding: { x: 15, y: 15 }, 
            align: 'center'
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.selectedItem = { type: this.shopCategory, key, stat };
            this.updateShopUI(); // Refresh to show selection highlight
        });
        this.shopContainer.add(btn);
        x += 130;
    }
  }

  onMapClick(pointer) {
    if (this.isPopupOpen || this.isGamePaused) return;
    if (pointer.y > SCREEN_HEIGHT) return;
    if (!this.selectedItem) return;
    
    const gridX = Math.floor(pointer.x / GRID_SIZE);
    const gridY = Math.floor(pointer.y / GRID_SIZE);
    
    const x = gridX * GRID_SIZE + GRID_SIZE/2;
    const y = gridY * GRID_SIZE + GRID_SIZE/2;
    
    if (this.gold < this.selectedItem.stat.cost) {
        console.log("Not enough gold");
        return;
    }
    
    // Check occupancy
    // In a real game, checking overlap with existing entities is needed.
    // For now, assume player places correctly.
    
    this.gold -= this.selectedItem.stat.cost;
    this.updateStats();
    
    if (this.selectedItem.type === 'turret') {
        const turret = new Turret(this, x, y, this.selectedItem.key);
        this.turrets.add(turret);
        // Turret handles its own body in constructor? 
        // Let's check Turret.js. It calls this.scene.physics.add.existing(this, true).
        // Since this.turrets is NOT a physics group (just add.group), this is fine.
    } else if (this.selectedItem.type === 'defense' || this.selectedItem.type === 'tool') {
        const item = new DefenseItem(this, x, y, this.selectedItem.key);
        this.defenseItems.add(item);
        // defenseItems IS a physics group. It adds a dynamic body.
        // We need to make it static (immovable).
        item.body.setImmovable(true);
        item.body.moves = false; 
    } else if (this.selectedItem.type === 'trap') {
        const trap = new Trap(this, x, y, this.selectedItem.key);
        this.traps.add(trap);
        // traps IS a physics group.
        trap.body.setImmovable(true);
        trap.body.moves = false;
    }
  }

  startWave() {
    if (this.waveActive || this.waveIndex >= WAVES.length) return;
    
    const waveData = WAVES[this.waveIndex];
    this.generateWaveEnemies(waveData);
    this.waveActive = true;
    
    console.log(`Starting Wave ${waveData.level}`);
    this.updateStats();
  }

  generateWaveEnemies(waveData) {
    this.enemiesRemainingToSpawn = [];
    const types = ['normal', 'small', 'ram', 'giant', 'boss'];
    
    types.forEach(type => {
        const count = waveData[type] || 0;
        for(let i=0; i<count; i++) {
            this.enemiesRemainingToSpawn.push(type);
        }
    });
    Phaser.Utils.Array.Shuffle(this.enemiesRemainingToSpawn);
  }

  togglePause() {
    try {
        this.isGamePaused = !this.isGamePaused;
        
        if (this.isGamePaused) {
            console.log("Game Paused. Creating Menu...");
            this.physics.pause();
            if (this.soundManager) this.soundManager.suspend();
            this.pauseBtn.setText('继续');
            
            // Pause all animations safely
            this.children.list.forEach(child => {
                if (child.anims && typeof child.anims.pause === 'function') {
                    child.anims.pause();
                }
            });
            
            this.createPauseMenu();

        } else {
            console.log("Game Resumed. Destroying Menu...");
            this.physics.resume();
            if (this.soundManager) this.soundManager.resume();
            this.pauseBtn.setText('暂停');
            
            // Resume all animations safely
            this.children.list.forEach(child => {
                if (child.anims && typeof child.anims.resume === 'function') {
                    child.anims.resume();
                }
            });
            
            if (this.pauseMenuElements) {
                this.pauseMenuElements.forEach(el => el.destroy());
                this.pauseMenuElements = [];
            }
        }
    } catch (err) {
        console.error("Error in togglePause:", err);
        window.alert("Error toggling pause: " + err.message);
    }
  }

  createPauseMenu() {
    if (this.pauseMenuElements) {
        this.pauseMenuElements.forEach(el => el.destroy());
    }
    this.pauseMenuElements = [];

    // Use fixed constants for consistent positioning
    const cx = SCREEN_WIDTH / 2;
    const cy = TOTAL_HEIGHT / 2;
    const w = SCREEN_WIDTH;
    const h = TOTAL_HEIGHT;
    
    console.log(`Creating Pause Menu at ${cx}, ${cy} (Screen: ${w}x${h})`);

    // 1. Full screen overlay
    const overlay = this.add.rectangle(cx, cy, w, h, 0x000000, 0.7);
    overlay.setScrollFactor(0);
    overlay.setDepth(1000);
    overlay.setInteractive(); // Block clicks
    this.pauseMenuElements.push(overlay);
    
    // 2. Menu Background
    const bg = this.add.rectangle(cx, cy, 300, 240, 0x000000, 0.9);
    bg.setStrokeStyle(2, 0xffff00);
    bg.setScrollFactor(0);
    bg.setDepth(1001);
    this.pauseMenuElements.push(bg);
    
    // 3. Title
    const title = this.add.text(cx, cy - 90, '游戏暂停', { fontSize: '30px', fill: '#ffff00', fontStyle: 'bold' });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(1002);
    this.pauseMenuElements.push(title);

    // 4. Save Button
    const saveBtn = this.add.text(cx, cy - 20, '保存游戏', { 
        fontSize: '24px', fill: '#fff', backgroundColor: '#333', padding: { x: 20, y: 10 } 
    });
    saveBtn.setOrigin(0.5);
    saveBtn.setInteractive({ useHandCursor: true });
    saveBtn.setScrollFactor(0);
    saveBtn.setDepth(1002);
    
    saveBtn.on('pointerdown', () => this.saveGame());
    saveBtn.on('pointerover', () => saveBtn.setStyle({ fill: '#0f0' }));
    saveBtn.on('pointerout', () => saveBtn.setStyle({ fill: '#fff' }));
    this.pauseMenuElements.push(saveBtn);
        
    // 5. Load Button
    const loadBtn = this.add.text(cx, cy + 60, '读取存档', { 
        fontSize: '24px', fill: '#fff', backgroundColor: '#333', padding: { x: 20, y: 10 } 
    });
    loadBtn.setOrigin(0.5);
    loadBtn.setInteractive({ useHandCursor: true });
    loadBtn.setScrollFactor(0);
    loadBtn.setDepth(1002);
    
    loadBtn.on('pointerdown', () => this.loadGame());
    loadBtn.on('pointerover', () => loadBtn.setStyle({ fill: '#0f0' }));
    loadBtn.on('pointerout', () => loadBtn.setStyle({ fill: '#fff' }));
    this.pauseMenuElements.push(loadBtn);

    // 6. Close Button (X)
    const closeBtn = this.add.text(cx + 130, cy - 100, 'X', { 
        fontSize: '24px', fill: '#ff0000', backgroundColor: '#000', padding: { x: 5, y: 5 } 
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setScrollFactor(0);
    closeBtn.setDepth(1003);
    
    closeBtn.on('pointerdown', () => this.togglePause()); // Re-use togglePause to close
    this.pauseMenuElements.push(closeBtn);
  }

  saveGame() {
    try {
        console.log("Attempting to save game...");
        const gameState = {
            gold: this.gold,
            baseHp: this.baseHp,
            waveIndex: this.waveIndex,
            waveActive: this.waveActive,
            enemiesRemainingToSpawn: this.enemiesRemainingToSpawn,
            spawnTimer: this.spawnTimer, 
            turrets: this.turrets.getChildren().map(t => ({
                x: t.x, y: t.y, type: t.turretType, level: t.level || 1
            })),
            defenseItems: this.defenseItems.getChildren().map(d => ({
                x: d.x, y: d.y, type: d.itemType, hp: d.hp
            })),
            traps: this.traps.getChildren().map(t => ({
                x: t.x, y: t.y, type: t.trapType
            })),
            enemies: this.enemies.getChildren().map(e => ({
                x: e.x, y: e.y, type: e.zombieType, hp: e.hp
            }))
        };
        
        localStorage.setItem('pyc_tower_defense_save', JSON.stringify(gameState));
        console.log("Game saved successfully.");
        this.showFloatingText(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 100, '游戏已保存!', '#00ff00');
        window.alert("游戏已保存!");
    } catch (e) {
        console.error("Save failed:", e);
        window.alert("保存失败: " + e.message);
    }
  }

  loadGame() {
    try {
        console.log("Attempting to load game...");
        const saveString = localStorage.getItem('pyc_tower_defense_save');
        if (!saveString) {
            console.warn("No save file found.");
            window.alert("没有找到存档!");
            return;
        }
        
        const data = JSON.parse(saveString);
        
        // Restore Globals
        this.gold = data.gold;
        this.baseHp = data.baseHp;
        this.waveIndex = data.waveIndex;
        this.waveActive = data.waveActive;
        this.enemiesRemainingToSpawn = data.enemiesRemainingToSpawn || [];
        this.spawnTimer = this.time.now; 
        
        // Clear existing groups
        this.turrets.clear(true, true);
        this.enemies.clear(true, true);
        this.projectiles.clear(true, true);
        this.defenseItems.clear(true, true);
        this.traps.clear(true, true);
        
        // Safely stop particles
        if (this.particles) {
            // Check if it's a manager with emitters list
            if (this.particles.emitters && this.particles.emitters.list) {
                this.particles.emitters.list.forEach(e => e.stop());
            } 
            // Or if it's a single emitter (Phaser 3.60+)
            else if (typeof this.particles.stop === 'function') {
                this.particles.stop();
            }
        }
        
        // Restore Entities
        if (data.turrets) {
            data.turrets.forEach(t => {
                const turret = new Turret(this, t.x, t.y, t.type);
                if (t.level) turret.level = t.level;
                this.turrets.add(turret);
            });
        }
        
        if (data.defenseItems) {
            data.defenseItems.forEach(d => {
                const item = new DefenseItem(this, d.x, d.y, d.type);
                if (d.hp !== undefined) item.hp = d.hp;
                this.defenseItems.add(item);
                item.body.setImmovable(true);
                item.body.moves = false;
            });
        }
        
        if (data.traps) {
            data.traps.forEach(t => {
                const trap = new Trap(this, t.x, t.y, t.type);
                this.traps.add(trap);
                trap.body.setImmovable(true);
                trap.body.moves = false;
            });
        }
        
        if (data.enemies) {
            data.enemies.forEach(e => {
                const zombie = new Zombie(this, e.x, e.y, e.type);
                if (e.hp !== undefined) zombie.hp = e.hp;
                this.enemies.add(zombie);
                if (!this.isGamePaused) zombie.setMoveDirection(); 
            });
        }
        
        this.updateStats();
        console.log("Game loaded successfully.");
        window.alert("游戏已读取!");
        
        // Close menu and resume
        this.togglePause(); 
        
    } catch (e) {
        console.error("Load failed:", e);
        window.alert("读取失败: " + e.message);
    }
  }

  update(time, delta) {
    if (this.isGamePaused) return;

    if (this.waveActive) {
        if (this.enemiesRemainingToSpawn.length > 0) {
            if (time > this.spawnTimer + 1000) {
                const type = this.enemiesRemainingToSpawn.shift();
                this.spawnEnemy(type);
                this.spawnTimer = time;
            }
        } else if (this.enemies.getLength() === 0) {
            this.endWave();
        }
    }
  }

  spawnEnemy(type) {
    console.log(`Spawning enemy: ${type}`);
    const row = Phaser.Math.Between(0, GRID_ROWS - 1);
    const y = row * GRID_SIZE + GRID_SIZE/2;
    const x = 0; // Spawn at 0 to be visible immediately
    this.enemies.add(new Zombie(this, x, y, type));
  }

  damageBase(amount) {
      if (this.baseHp <= 0) return; // Already dead

      this.baseHp -= amount;
      this.updateStats();
      
      // Visual feedback
      this.cameras.main.shake(100, 0.005); // Shake screen slightly
      this.base.setTint(0xff0000);
      this.time.delayedCall(100, () => this.base.clearTint());
      
      // Audio feedback (Intense)
      this.soundManager.playBaseDamage();

      if (this.baseHp <= 0) {
          this.baseHp = 0;
          this.showGameOver();
      }
  }

  showGameOver() {
      this.physics.pause();
      this.waveActive = false;
      this.isPopupOpen = true;

      // Create a dark overlay
      const overlay = this.add.rectangle(SCREEN_WIDTH/2, TOTAL_HEIGHT/2, SCREEN_WIDTH, TOTAL_HEIGHT, 0x000000, 0.7);
      
      const container = this.add.container(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
      
      const bg = this.add.rectangle(0, 0, 400, 300, 0x444444);
      bg.setStrokeStyle(2, 0xffffff);
      
      const title = this.add.text(0, -50, '游戏结束', { fontSize: '40px', fill: '#ff0000' }).setOrigin(0.5);
      
      const retryBtn = this.add.text(0, 50, '是否重试', { 
          fontSize: '30px', fill: '#00ff00', backgroundColor: '#000', padding: { x: 20, y: 10 } 
      })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
          this.scene.restart();
      });
      
      container.add([bg, title, retryBtn]);
      
      // Ensure UI is on top
      container.setDepth(100);
      overlay.setDepth(99);
  }

  healBase(amount) {
      this.baseHp = Math.min(BASE_HP, this.baseHp + amount);
      this.updateStats();
  }

  endWave() {
      this.waveActive = false;
      this.waveIndex++;
      this.updateStats();

      if (this.waveIndex < WAVES.length) {
          this.showWaveCompletePopup();
      } else {
          this.showVictoryPopup();
      }
  }

  showWaveCompletePopup() {
      this.isPopupOpen = true;
      // Create overlay
      const overlay = this.add.rectangle(SCREEN_WIDTH/2, TOTAL_HEIGHT/2, SCREEN_WIDTH, TOTAL_HEIGHT, 0x000000, 0.7);
      const container = this.add.container(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
      
      const bg = this.add.rectangle(0, 0, 400, 200, 0x444444);
      bg.setStrokeStyle(2, 0x00ff00);
      
      const title = this.add.text(0, -40, `第 ${this.waveIndex} 关完成!`, { fontSize: '30px', fill: '#00ff00' }).setOrigin(0.5);
      
      const nextBtn = this.add.text(0, 40, '开启下一关', { 
          fontSize: '24px', fill: '#ffffff', backgroundColor: '#000', padding: { x: 20, y: 10 } 
      })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
          overlay.destroy();
          container.destroy();
          this.startWave();
          // Delay resetting popup state to prevent click propagation to map
          this.time.delayedCall(50, () => {
              this.isPopupOpen = false;
          });
      });
      
      container.add([bg, title, nextBtn]);
      container.setDepth(100);
      overlay.setDepth(99);
  }

  showVictoryPopup() {
      this.isPopupOpen = true;
      const overlay = this.add.rectangle(SCREEN_WIDTH/2, TOTAL_HEIGHT/2, SCREEN_WIDTH, TOTAL_HEIGHT, 0x000000, 0.8);
      this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, '胜利!', { fontSize: '60px', fill: '#ffff00' }).setOrigin(0.5).setDepth(100);
  }
  
  updateStats() {
      this.goldText.setText(`金币: ${this.gold}`);
      this.hpText.setText(`生命: ${this.baseHp}`);
      this.waveText.setText(`波数: ${this.waveIndex + 1}`);
      
      const counts = {};
      
      // Count pending
      this.enemiesRemainingToSpawn.forEach(type => {
          counts[type] = (counts[type] || 0) + 1;
      });
      
      // Count active
      this.enemies.getChildren().forEach(zombie => {
          if (zombie.active) {
              const type = zombie.zombieType;
              counts[type] = (counts[type] || 0) + 1;
          }
      });
      
      const parts = [];
      const typeMap = { 'normal': '普通', 'small': '小型', 'ram': '冲撞', 'giant': '巨型', 'boss': 'BOSS' };
      
      for (const [type, count] of Object.entries(counts)) {
          if (count > 0) {
              const label = typeMap[type] || type;
              parts.push(`${label}:${count}`);
          }
      }
      
      if (parts.length === 0) {
          this.enemiesText.setText('剩余: 0');
      } else {
          this.enemiesText.setText(`剩余: ${parts.join(' ')}`);
      }
  }

  onProjectileHit(projectile, enemy) {
      projectile.hitTarget();
  }

  checkWallCollision(enemy, wall) {
      if (!wall.stats) return true; // Default collide
      
      // If the item has specific targets (like a Pit), check if enemy is in targets
      if (wall.stats.targets) {
          // If targets array exists, ONLY collide if enemy type is in it
          if (wall.stats.targets.includes(enemy.zombieType)) {
              return true;
          } else {
              // Ignore collision (zombie walks over)
              return false;
          }
      }
      
      return true;
  }

  onZombieHitWall(enemy, wall) {
      if (enemy.active && wall.active) {
          if (typeof enemy.tryAttack === 'function') {
              enemy.tryAttack(wall, this.time.now);
          } else if (typeof wall.tryAttack === 'function') {
               // In case arguments are swapped
               wall.tryAttack(enemy, this.time.now);
          } else {
              console.error('onZombieHitWall: neither object has tryAttack');
              console.log('Enemy:', enemy);
              console.log('Wall:', wall);
              console.log('Enemy Type:', enemy.constructor.name);
          }
      }
  }
  
  onZombieHitTrap(enemy, trap) {
      if (!enemy.active || !trap.active) return;

      if (typeof trap.trigger === 'function') {
          trap.trigger(enemy, this.time.now);
      } else if (typeof enemy.trigger === 'function') {
          // Arguments swapped
          enemy.trigger(trap, this.time.now);
      } else {
          console.log('Trap hit but no trigger function found');
      }
  }
  
  createProjectile(x, y, target, damage) {
      this.projectiles.add(new Projectile(this, x, y, target, damage));
  }
  
  getClosestEnemy(x, y, range) {
      const enemies = this.enemies.getChildren();
      let closest = null;
      let closestDist = range;
      
      enemies.forEach(enemy => {
          if (!enemy.active) return;
          const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
          if (dist < closestDist) {
              closestDist = dist;
              closest = enemy;
          }
      });
      return closest;
  }
}