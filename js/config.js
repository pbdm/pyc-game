export const BASE_CONFIG = {
  canvasWidth: 960,
  canvasHeight: 600,
  baseHp: 10000,
  initialGold: 100,
  grid: 40, // 24x15 cells
  baseRect: { x: 860, y: 240, w: 80, h: 120 },
};

export const TOWERS = {
  basic:   { key: 'basic',   name: '基础塔', range: 25,  rpm: 6,   damage: 20,  price: 50 },
  sniper:  { key: 'sniper',  name: '狙击塔', range: 50,  rpm: 4,   damage: 40,  price: 100 },
  cannon:  { key: 'cannon',  name: '炮塔',   range: 75,  rpm: 10,  damage: 40,  price: 150 },
  laser:   { key: 'laser',   name: '激光塔', range: 400, rpm: 20,  damage: 60,  price: 300 },
  bomb:    { key: 'bomb',    name: '轰炸塔', range: 100, rpm: 20,  damage: 80,  price: 500 },
  nuke:    { key: 'nuke',    name: '原子塔', range: 200, rpm: 60,  damage: 200, price: 1000 },
  guard:   { key: 'guard',   name: '防守塔', range: 70,  rpm: 9,   damage: 100, price: 200 },
  quad:    { key: 'quad',    name: '四头塔', range: 200, rpm: 80,  damage: 100, price: 2000 },
  oct:     { key: 'oct',     name: '八头塔', range: 400, rpm: 160, damage: 200, price: 8000 },
};

export const TRAPS = {
  spike:      { key: 'spike', name: '地刺',    range: 5,   damage: 15, price: 30,  charges: Infinity, cooldown: 0.1, lifeSteal: 0 },
  mine:       { key: 'mine',  name: '地雷',    range: 10,  damage: 30, price: 60,  charges: 1,        cooldown: 0,   lifeSteal: 0 },
  subcannon:  { key: 'subcannon', name: '地下炮台', range: 40, damage: 20, price: 120, charges: Infinity, cooldown: 2, lifeSteal: 0 },
  leech:      { key: 'leech', name: '吸血台',  range: 1,   damage: 20, price: 140, charges: Infinity, cooldown: 3, lifeSteal: 20 },
  mouseGun:   { key: 'mouseGun', name: '鼠标炮', range: 100, damage: 60, price: 300, charges: Infinity, cooldown: 6, lifeSteal: 10 },
};

export const DEFENSES = {
  ironWall:  { key: 'ironWall',  name: '铁墙',   range: 0,  hp: 200, price: 50,  reduce: 10, damage: 0 },
  woodWall:  { key: 'woodWall',  name: '木墙',   range: 0,  hp: 100, price: 25,  reduce: 1,  damage: 0 },
  adamant:   { key: 'adamant',   name: '金刚墙', range: 0,  hp: 400, price: 100, reduce: 20, damage: 0 },
  shield:    { key: 'shield',    name: '防护罩', range: 20, hp: 50,  price: 15,  reduce: 2,  damage: 20 },
  guardWall: { key: 'guardWall', name: '防守墙', range: 20, hp: 100, price: 70,  reduce: 15, damage: 10 },
};

export const PITS = {
  smallPit: { key: 'smallPit', name: '小坑', hp: 100, reduce: 2.5, price: 20,  block: ['small'] },
  bigPit:   { key: 'bigPit',   name: '大坑', hp: 300, reduce: 7.5, price: 60,  block: ['small','normal'] },
  firePit:  { key: 'firePit',  name: '火坑', hp: 700, reduce: 17.5, price: 125, block: ['small','normal','charger'] },
};

export const ENEMIES = {
  normal: { key: 'normal', name: '普通僵尸', damage: 10, speed: 10, hp: 100, trapReduce: 0,  gold: 50 },
  small:  { key: 'small',  name: '小型僵尸', damage: 5,  speed: 15, hp: 50,  trapReduce: 0,  gold: 25 },
  charger:{ key: 'charger',name: '冲撞僵尸', damage: 20, speed: 40, hp: 200, trapReduce: 10, gold: 100 },
  giant:  { key: 'giant',  name: '巨型僵尸', damage: 100,speed: 5,  hp: 5000,trapReduce: 64, gold: 500 },
  boss:   { key: 'boss',   name: 'BOSS僵尸',damage: 200,speed: 2.5,hp: 10000,trapReduce: 128,gold: 1000 },
};

export const WAVES = [
  // 1..21, using the table from design doc
  { normal:0, small:2, charger:0, giant:0, boss:0 },
  { normal:1, small:3, charger:0, giant:0, boss:0 },
  { normal:5, small:7, charger:0, giant:0, boss:0 },
  { normal:7, small:6, charger:0, giant:0, boss:0 },
  { normal:7, small:7, charger:0, giant:0, boss:0 },
  { normal:13,small:5, charger:0, giant:0, boss:0 },
  { normal:15,small:5, charger:0, giant:0, boss:0 },
  { normal:17,small:6, charger:0, giant:0, boss:0 },
  { normal:20,small:8, charger:0, giant:0, boss:0 },
  { normal:40,small:10,charger:0, giant:0, boss:0 },
  { normal:60,small:20,charger:0, giant:0, boss:0 },
  { normal:80,small:30,charger:1, giant:0, boss:0 },
  { normal:100,small:40,charger:3, giant:0, boss:0 },
  { normal:110,small:60,charger:4, giant:0, boss:0 },
  { normal:120,small:40,charger:6, giant:0, boss:0 },
  { normal:130,small:20,charger:8, giant:1, boss:0 },
  { normal:140,small:25,charger:10,giant:1, boss:0 },
  { normal:160,small:50,charger:20,giant:2, boss:0 },
  { normal:170,small:60,charger:40,giant:3, boss:0 },
  { normal:190,small:65,charger:60,giant:4, boss:1 },
  { normal:200,small:70,charger:120,giant:8,boss:2 },
];

export const UNLOCKS = {
  1:  { towers:['sniper'] },
  2:  { defenses:['woodWall'] },
  3:  { towers:['cannon'], defenses:['guard'] },
  4:  { traps:['spike'] },
  5:  { traps:['mine'] },
  6:  { defenses:['shield','ironWall','adamant'], towers:['laser'] },
  7:  { towers:['bomb'], traps:['subcannon','leech'] },
  9:  { towers:['nuke'] },
  11: { towers:['quad'] },
  13: { pits:['smallPit','bigPit'] },
  16: { towers:['oct'] },
  17: { pits:['firePit'] },
  20: { traps:['mouseGun'] },
};


