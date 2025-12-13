import Phaser from 'phaser';
import { COLORS, GRID_SIZE } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // No external assets to load for now
  }

  create() {
    this.createTextures();
    this.scene.start('GameScene');
  }

  createTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // 1. Grid Cell Texture (Light)
    graphics.fillStyle(COLORS.GRID_LIGHT);
    graphics.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
    graphics.generateTexture('grid_light', GRID_SIZE, GRID_SIZE);
    graphics.clear();

    // 2. Grid Cell Texture (Dark)
    graphics.fillStyle(COLORS.GRID_DARK);
    graphics.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
    graphics.generateTexture('grid_dark', GRID_SIZE, GRID_SIZE);
    graphics.clear();

    // 3. Base Texture
    graphics.fillStyle(COLORS.BASE);
    graphics.fillRect(0, 0, GRID_SIZE, GRID_SIZE * 3); // Base spans 3 rows maybe? Or just 1 tile?
    // Let's make base 1x1 for now, or maybe a distinct shape.
    // The description says "Base is on the far right".
    // Let's just make a blue square with a "B" or something.
    graphics.fillStyle(COLORS.BASE);
    graphics.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeRect(0, 0, GRID_SIZE, GRID_SIZE);
    graphics.generateTexture('base', GRID_SIZE, GRID_SIZE);
    graphics.clear();

    // 4. Turret Textures (Generic for now, colored by type)
    // We will generate them dynamically or just use a white circle that we tint.
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(GRID_SIZE / 2, GRID_SIZE / 2, GRID_SIZE / 2 - 4);
    graphics.lineStyle(2, 0x000000);
    graphics.strokeCircle(GRID_SIZE / 2, GRID_SIZE / 2, GRID_SIZE / 2 - 4);
    // Add a cannon barrel
    graphics.fillStyle(0x000000);
    graphics.fillRect(GRID_SIZE / 2, GRID_SIZE / 2 - 4, GRID_SIZE / 2, 8);
    graphics.generateTexture('turret_base', GRID_SIZE, GRID_SIZE);
    graphics.clear();

    // 5. Zombie Textures (Walk Cycle)
    const drawZombie = (legOffset) => {
        graphics.fillStyle(0xffffff);
        // Head
        graphics.fillCircle(GRID_SIZE/2, 10, 7);
        // Body
        graphics.fillRect(GRID_SIZE/2 - 6, 15, 12, 15);
        // Arms (reaching forward/right)
        graphics.fillRect(GRID_SIZE/2, 18, 14, 4);
        
        // Legs (animated)
        // Left Leg
        graphics.fillRect(GRID_SIZE/2 - 6, 30 + legOffset, 5, 8);
        // Right Leg
        graphics.fillRect(GRID_SIZE/2 + 1, 30 - legOffset, 5, 8);
        
        graphics.generateTexture(legOffset > 0 ? 'zombie_walk1' : 'zombie_walk2', GRID_SIZE, GRID_SIZE);
        graphics.clear();
    };

    drawZombie(3);  // Frame 1
    drawZombie(-3); // Frame 2

    // 6. Projectile
    graphics.fillStyle(0xffff00);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('projectile', 8, 8);
    graphics.clear();

    // 7. Wall/Defense
    graphics.fillStyle(0xffffff);
    graphics.fillRect(2, 2, GRID_SIZE - 4, GRID_SIZE - 4);
    graphics.lineStyle(2, 0x000000);
    graphics.strokeRect(2, 2, GRID_SIZE - 4, GRID_SIZE - 4);
    graphics.generateTexture('wall_base', GRID_SIZE, GRID_SIZE);
    graphics.clear();
    
    // 8. Trap
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(GRID_SIZE/2, GRID_SIZE/2, GRID_SIZE/2 - 2);
    graphics.generateTexture('trap_base', GRID_SIZE, GRID_SIZE);
    graphics.clear();

    // 9. Particle (Soft Glow)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.clear();

    // Create Animations
    this.anims.create({
        key: 'zombie_walk',
        frames: [
            { key: 'zombie_walk1' },
            { key: 'zombie_walk2' }
        ],
        frameRate: 5,
        repeat: -1,
        yoyo: true
    });
  }
}
