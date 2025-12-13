import { Entity } from './Entity';
import { DEFENSE_ITEM_STATS } from '../config/constants';

export class DefenseItem extends Entity {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'wall_base');
    this.itemType = type;
    this.stats = DEFENSE_ITEM_STATS[type];
    this.hp = this.stats.hp;
    this.setTint(this.stats.color);
    
    // Enable physics to stop zombies
    this.scene.physics.add.existing(this, true); // Static body
  }
  
  takeDamage(amount) {
      // Reduction logic handled by attacker or here?
      // "减伤效果（每次攻击减少x点伤害）"
      const actualDamage = Math.max(0, amount - this.stats.reduction);
      this.hp -= actualDamage;
      if (this.hp <= 0) {
          this.destroy();
      }
  }
}
