import Phaser from 'phaser';
import { ZOMBIE_STATS, SPEED_MULTIPLIER, GRID_SIZE } from '../config/constants';

export class Zombie extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'zombie_walk1');
    this.scene = scene;
    this.zombieType = type;
    this.stats = ZOMBIE_STATS[type];
    
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    
    this.hp = this.stats.hp;
    this.speed = this.stats.speed * SPEED_MULTIPLIER; // Adjust speed to pixels/sec
    this.setTint(this.stats.color);
    
    // Scale based on type
    if (type === 'giant') this.setScale(1.5);
    else if (type === 'boss') this.setScale(2.0);
    else if (type === 'small') this.setScale(0.8);
    
    this.body.setVelocityX(this.speed); // Move right towards base
    
    this.play('zombie_walk');
    // Adjust animation speed based on movement speed
    // Base speed is ~100.
    this.anims.timeScale = this.speed / 100;

    this.hpBar = this.scene.add.graphics();
    
    // Ensure HP bar is destroyed when zombie is destroyed
    this.on('destroy', () => {
        if (this.hpBar) {
            this.hpBar.destroy();
        }
    });

    this.updateHpBar();

    this.lastAttackTime = 0;
    this.attackRate = 1000; // Attack once per second
  }
  
  tryAttack(target, time) {
      if (time > this.lastAttackTime + this.attackRate) {
          target.takeDamage(this.stats.damage, this); // Pass self as attacker
          this.lastAttackTime = time;
          this.playAttackAnimation(target);
      }
  }

  playAttackAnimation(target) {
      // 1. Lunge/Bump effect (using scale to avoid physics conflicts)
      this.scene.tweens.add({
          targets: this,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          ease: 'Sine.easeInOut'
      });

      // 2. Flash color
      const originalTint = this.stats.color;
      this.setTint(0xffffff); // Flash white
      this.scene.time.delayedCall(100, () => {
          this.setTint(originalTint);
      });
  }

  update(time, delta) {
    this.updateHpBar();
    
    // Force velocity every frame to ensure it moves
    if (this.body) {
        this.body.setVelocityX(this.speed);
    }
    
    if (this.x < 0) {
      // Reached end (although Base is at right? Wait.)
      // "Base in on the far right" -> "基地在最右边"
      // Zombies spawn? Usually opposite side. So Left.
      // If Base is at Right, Zombies move Left -> Right.
      // "基地在最右边" means Base x = MAX_WIDTH.
      // So Zombies should spawn at x = 0 and move RIGHT.
      // Let me re-read "基地在最右边". Yes, Base is at the rightmost side.
      // So Zombies spawn on Left and move Right (VelocityX +speed).
    }
  }
  
  // Correction: Base is at right. Zombies spawn left.
  setMoveDirection() {
      this.body.setVelocityX(this.speed);
  }

  takeDamage(amount) {
    this.hp -= amount;
    
    // Show damage number
    this.scene.showFloatingText(this.x, this.y - 20, `-${amount}`, '#ff0000');
    
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.scene.createExplosion(this.x, this.y, this.stats.color, 20);
    this.scene.soundManager.playExplosion();
    this.scene.events.emit('zombieKilled', this.stats.reward);
    this.destroy();
  }

  updateHpBar() {
    this.hpBar.clear();
    this.hpBar.fillStyle(0xff0000);
    const width = (this.hp / this.stats.hp) * GRID_SIZE;
    this.hpBar.fillRect(this.x - GRID_SIZE/2, this.y - GRID_SIZE/2 - 5, width, 4);
  }
}
