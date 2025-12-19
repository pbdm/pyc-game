import { Entity } from './Entity';
import { TURRET_STATS } from '../config/constants';

export class Turret extends Entity {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'turret_base');
    this.turretType = type;
    this.stats = TURRET_STATS[type];
    this.setTint(this.stats.color);
    
    this.lastFired = 0;
    this.range = this.stats.range;
    
    // Enable Physics (Static)
    this.scene.physics.add.existing(this, true);
    
    // Add HP (default 200 if not in stats)
    this.hp = this.stats.hp || 200;
  }

  update(time, delta) {
    if (this.scene.isGamePaused) return;

    // rate is attacks per second (e.g. 1 for basic). 
    // Interval = 1000 / rate.
    if (time > this.lastFired + (1000 / this.stats.rate)) { 
       this.tryShoot(time);
    }
  }

  tryShoot(time) {
    // Find target
    // We need access to the zombie group from the scene
    const enemy = this.scene.getClosestEnemy(this.x, this.y, this.range);
    if (enemy) {
      this.shoot(enemy);
      this.lastFired = time;
    }
  }

  shoot(target) {
    console.log(`Turret firing at ${target.x.toFixed(0)}, ${target.y.toFixed(0)}`);
    // Create projectile
    this.scene.createProjectile(this.x, this.y, target, this.stats.damage);
    this.scene.soundManager.playShoot();
    
    // Rotate turret to face target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.rotation = angle;
  }

  takeDamage(amount) {
      this.hp -= amount;
      this.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => this.setTint(this.stats.color));
      
      this.scene.showFloatingText(this.x, this.y - 20, `-${amount}`, '#ffaa00');

      if (this.hp <= 0) {
          this.die();
      }
  }

  die() {
      this.scene.createExplosion(this.x, this.y, this.stats.color, 15);
      this.destroy();
  }
}
