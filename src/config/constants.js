export const GRID_SIZE = 40; // Pixels per grid cell
export const GRID_COLS = 30;
export const GRID_ROWS = 12;

export const SCREEN_WIDTH = GRID_COLS * GRID_SIZE;
export const SCREEN_HEIGHT = GRID_ROWS * GRID_SIZE; // Map height
// Extra space for UI
export const UI_HEIGHT = 150; 
export const TOTAL_HEIGHT = SCREEN_HEIGHT + UI_HEIGHT;

export const COLORS = {
  GRID_LIGHT: 0xaacc33, // Yellow-ish Green
  GRID_DARK: 0x88aa22,  // Darker Green
  UI_BACKGROUND: 0x333333,
  BASE: 0x0000ff,       // Blue base
};

export const TURRET_STATS = {
  'basic': { name: '基础塔', range: 100, rate: 60/60, damage: 50, cost: 50, color: 0xaaaaaa },
  'sniper': { name: '狙击塔', range: 100, rate: 40/60, damage: 100, cost: 100, color: 0x555555 },
  'cannon': { name: '炮塔', range: 150, rate: 100/60, damage: 100, cost: 150, color: 0x000000 },
  'laser': { name: '激光塔', range: 800, rate: 3200/60, damage: 10, cost: 300, color: 0xff0000 },
  'bomber': { name: '轰炸塔', range: 200, rate: 200/60, damage: 200, cost: 500, color: 0x00ff00 },
  'atomic': { name: '原子塔', range: 400, rate: 600/60, damage: 500, cost: 1000, color: 0x00ffff },
  'defense': { name: '防守塔', range: 140, rate: 90/60, damage: 250, cost: 200, color: 0xffff00 },
  'quad': { name: '四头塔', range: 400, rate: 800/60, damage: 250, cost: 2000, color: 0xff00ff },
  'octa': { name: '八头塔', range: 800, rate: 1600/60, damage: 500, cost: 8000, color: 0xffffff },
};
// Note: rate in table is attacks per MINUTE. So rate/60 is attacks per SECOND.
// Actually, it's better to store cooldown in ms.
// Cooldown = 60000 / rate
// But the table says "每分钟攻击次数".
// For 'basic': 60/min -> 1 attack/sec -> 1000ms cooldown.

export const TRAP_STATS = {
  'spikes': { name: '地刺', range: 5, damage: 15, cost: 30, uses: Infinity, cooldown: 100, lifeSteal: 0, color: 0x654321 },
  'mine': { name: '地雷', range: 10, damage: 30, cost: 60, uses: 1, cooldown: 0, lifeSteal: 0, color: 0x333333 },
  'underground': { name: '地下炮台', range: 40, damage: 20, cost: 120, uses: Infinity, cooldown: 2000, lifeSteal: 0, color: 0x553311 },
  'lifesteal': { name: '吸血台', range: 1, damage: 20, cost: 140, uses: Infinity, cooldown: 3000, lifeSteal: 20, color: 0x990000 },
  'mouse': { name: '鼠标炮', range: 100, damage: 60, cost: 300, uses: Infinity, cooldown: 6000, lifeSteal: 10, color: 0x000099 },
};

export const DEFENSE_ITEM_STATS = {
  'iron_wall': { name: '铁墙', hp: 200, cost: 50, reduction: 10, damage: 0, color: 0x888888 },
  'wood_wall': { name: '木墙', hp: 100, cost: 25, reduction: 1, damage: 0, color: 0x966F33 },
  'diamond_wall': { name: '金刚墙', hp: 400, cost: 100, reduction: 20, damage: 0, color: 0x00cccc },
  'shield': { name: '防护罩', hp: 50, cost: 15, reduction: 2, damage: 20, color: 0xaaaaff, range: 20 },
  'defense_wall': { name: '防守墙', hp: 100, cost: 70, reduction: 15, damage: 10, color: 0xaa8800, range: 20 },
};

export const DEFENSE_TOOL_STATS = {
  'small_pit': { name: '小坑', targets: ['small'], hp: 200, reduction: 2.5, cost: 20, color: 0x442200 },
  'big_pit': { name: '大坑', targets: ['small', 'normal'], hp: 600, reduction: 7.5, cost: 60, color: 0x331100 },
  'fire_pit': { name: '火坑', targets: ['small', 'normal', 'ram'], hp: 1400, reduction: 17.5, cost: 125, color: 0xff4400 },
};

export const ZOMBIE_STATS = {
  'normal': { name: '普通僵尸', damage: 50, speed: 10, hp: 500, resist: 0, reward: 50, color: 0x00aa00 }, 
  'small': { name: '小型僵尸', damage: 25, speed: 15, hp: 250, resist: 0, reward: 25, color: 0x55aa55 },
  'ram': { name: '冲撞僵尸', damage: 100, speed: 40, hp: 1000, resist: 10, reward: 100, color: 0x995500 },
  'giant': { name: '巨型僵尸', damage: 500, speed: 5, hp: 5000, resist: 64, reward: 500, color: 0x444444 },
  'boss': { name: 'BOSS僵尸', damage: 1000, speed: 2.5, hp: 50000, resist: 128, reward: 1000, color: 0x000000 },
};

export const SPEED_MULTIPLIER = 10; // Speed 10 * 10 = 100px/s.

export const BASE_HP = 1000;
export const INITIAL_GOLD = 650;

export const VERSION = '1.0.1';
export const PUBLISH_TIME = '2025-12-18';
