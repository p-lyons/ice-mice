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
    this.load.image('cracking-ice', 'assets/cracking-ice.png');
    this.load.image('cracked-ice', 'assets/cracked-ice.png');
    this.load.image('water-hole', 'assets/water-hole.png');
    this.load.image('melting-ice', 'assets/melting-ice.png');
    this.load.image('melting-ice-warning', 'assets/melting-ice-warning.png');
    this.load.image('mouse2', 'assets/mouse2.png');
    this.load.image('golden-cheese', 'assets/golden-cheese.png');
    this.load.image('walrus', 'assets/walrus.png');
    this.load.image('walrus-awake', 'assets/walrus-awake.png');
    this.load.image('penguin', 'assets/penguin.png');
    this.load.image('speed-streak', 'assets/speed-streak.png');
    this.load.image('slush', 'assets/slush.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('snowflake', 'assets/snowflake.png');
    this.load.image('ice-block', 'assets/ice-block.png');
    this.load.image('burrow', 'assets/burrow.png');
    this.load.image('wind-tile', 'assets/wind-tile.png');
    this.load.image('spinner', 'assets/spinner.png');
    this.load.image('fox', 'assets/fox.png');
    this.load.image('fox-sleep', 'assets/fox-sleep.png');
    this.load.image('paw-target', 'assets/paw-target.png');
    this.load.image('otter', 'assets/otter.png');
    this.load.image('fish', 'assets/fish.png');
    this.load.image('fish-shadow', 'assets/fish-shadow.png');
    this.load.image('hat-scarf', 'assets/hat-scarf.png');
    this.load.image('hat-top', 'assets/hat-top.png');
    this.load.image('hat-viking', 'assets/hat-viking.png');
    this.load.image('hat-crown', 'assets/hat-crown.png');
    this.load.image('aurora', 'assets/aurora.png');

    // Sound effects
    this.load.audio('caught', 'assets/caught.wav');
    this.load.audio('cheese', 'assets/cheese.wav');
    this.load.audio('slide', 'assets/slide.wav');
    this.load.audio('level-complete', 'assets/level-complete.wav');
    this.load.audio('hole-activate', 'assets/hole-activate.wav');
    this.load.audio('countdown', 'assets/countdown.wav');
    this.load.audio('go', 'assets/go.wav');
    this.load.audio('music', 'assets/music.wav');
    this.load.audio('crack', 'assets/crack.wav');
    this.load.audio('splash', 'assets/splash.wav');
    this.load.audio('squeak', 'assets/squeak.wav');
    this.load.audio('boing', 'assets/boing.wav');
    this.load.audio('golden', 'assets/golden.wav');
    this.load.audio('boost', 'assets/boost.wav');
    this.load.audio('wheee', 'assets/wheee.wav');
    this.load.audio('warp', 'assets/warp.wav');
    this.load.audio('yip', 'assets/yip.wav');
    this.load.audio('plug', 'assets/plug.wav');
    this.load.audio('chime', 'assets/chime.wav');
    this.load.audio('spin', 'assets/spin.wav');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
