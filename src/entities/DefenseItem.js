import { Entity } from './Entity';
import { DEFENSE_ITEM_STATS, DEFENSE_TOOL_STATS } from '../config/constants';

export class DefenseItem extends Entity {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'wall_base');
    this.itemType = type;
    this.stats = DEFENSE_ITEM_STATS[type] || DEFENSE_TOOL_STATS[type];
    
    if (!this.stats) {
        console.error(`DefenseItem type '${type}' not found in stats!`);
    }

    this.hp = this.stats.hp;
    this.setTint(this.stats.color);
  }
  
  takeDamage(amount, attacker) {
      // Reduction logic
      const damageStr = Math.max(0, amount - (this.stats.reduction || 0));
      this.hp -= damageStr;
      
      // Visual feedback
      this.scene.showFloatingText(this.x, this.y - 20, `-${damageStr}`, '#aaaaaa');
      this.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => this.setTint(this.stats.color));
      
      // Reflect damage (Thorns)
      if (attacker && this.stats.damage > 0) {
          attacker.takeDamage(this.stats.damage);
          // Visual for thorns?
          this.scene.createExplosion(attacker.x, attacker.y, 0x0000ff, 5); // Blue sparks
      }

      if (this.hp <= 0) {
          this.scene.createExplosion(this.x, this.y, this.stats.color, 10);
          this.destroy();
      }
  }
}
