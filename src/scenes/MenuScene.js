import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, height / 2 - 50, 'Ice Mice', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.text(width / 2, height / 2 + 50, 'Play', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => {
      playButton.setStyle({ color: '#ffff00' });
    });

    playButton.on('pointerout', () => {
      playButton.setStyle({ color: '#00ff00' });
    });

    playButton.on('pointerdown', () => {
      console.log('Play clicked');
      this.scene.start('GameScene');
    });
  }
}
