import Phaser from 'phaser';
import Mouse from '../entities/Mouse.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // Tile the ice background
    for (let x = 0; x < 800; x += 48) {
      for (let y = 0; y < 600; y += 48) {
        this.add.image(x + 24, y + 24, 'ice-tile');
      }
    }

    // Create mouse at center
    this.mouse = new Mouse(this, 400, 300);
  }

  update() {
    this.mouse.update();
  }
}
