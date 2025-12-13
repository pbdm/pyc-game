import { Entity } from './Entity';
import { TRAP_STATS } from '../config/constants';

export class Trap extends Entity {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'trap_base');
    this.trapType = type;
    this.stats = TRAP_STATS[type];
    this.setTint(this.stats.color);
    this.uses = this.stats.uses;
    this.lastTriggered = 0;
    
    this.scene.physics.add.existing(this, true);
  }

  update(time, delta) {
      // If manual cooldown based trap (like Underground or Mouse cannon)
      // Check range
      if (this.stats.range > 20 && this.uses > 0) {
          if (time > this.lastTriggered + this.stats.cooldown) {
              const enemy = this.scene.getClosestEnemy(this.x, this.y, this.stats.range);
              if (enemy) {
                  // Visual for attack?
                  this.trigger(enemy, time);
              }
          }
      }
  }

  trigger(zombie, time) {
    console.log(`Trap ${this.trapType} triggered on zombie`);
    if (this.uses <= 0) return;
    if (time < this.lastTriggered + this.stats.cooldown) return;

    zombie.takeDamage(this.stats.damage);
    this.lastTriggered = time;
    
    if (this.stats.lifeSteal > 0) {
        this.scene.healBase(this.stats.lifeSteal);
    }
    
    if (this.stats.uses !== Infinity) {
        this.uses--;
        if (this.uses <= 0) {
            this.destroy();
        }
    }
  }
}