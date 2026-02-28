import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('mouse', 'assets/mouse.png');
    this.load.image('polar-bear', 'assets/polar-bear.png');
    this.load.image('cheese', 'assets/cheese.png');
    this.load.image('ice-tile', 'assets/ice-tile.png');
    this.load.image('mouse-hole', 'assets/mouse-hole.png');
    this.load.image('snowbank', 'assets/snowbank.png');

    // Sound effects
    this.load.audio('caught', 'assets/caught.wav');
    this.load.audio('cheese', 'assets/cheese.wav');
    this.load.audio('slide', 'assets/slide.wav');
    this.load.audio('level-complete', 'assets/level-complete.wav');
    this.load.audio('hole-activate', 'assets/hole-activate.wav');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
