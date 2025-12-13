import Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, target, damage) {
    super(scene, x, y, 'projectile');
    this.scene = scene;
    this.damage = damage;
    this.target = target;
    this.speed = 400; // Projectile speed
    
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  update(time, delta) {
    if (!this.target || !this.target.active) {
      this.destroy();
      return;
    }

    this.scene.physics.moveToObject(this, this.target, this.speed);
    
    // Simple distance check for hit
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    if (distance < 10) {
      this.hitTarget();
    }
  }

  hitTarget() {
    this.scene.createExplosion(this.x, this.y, 0xffff00, 5);
    if (this.target && this.target.active) {
      this.target.takeDamage(this.damage);
    }
    this.destroy();
  }
}
