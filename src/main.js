import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { TOTAL_HEIGHT, SCREEN_WIDTH } from './config/constants';

const config = {
  type: Phaser.AUTO,
  width: SCREEN_WIDTH,
  height: TOTAL_HEIGHT,
  parent: 'app',
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, GameScene],
};

new Phaser.Game(config);
