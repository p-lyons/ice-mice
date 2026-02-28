import Phaser from 'phaser';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelCompleteScene');
  }

  init(data) {
    this.completedLevel = data.level;
    this.totalLevels = data.totalLevels;
  }

  create() {
    const { width, height } = this.scale;
    const nextLevel = this.completedLevel + 1;
    const hasMoreLevels = nextLevel < this.totalLevels;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, height / 2 - 80, 'Level Complete!', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    // Level info
    this.add.text(width / 2, height / 2 - 20, `Level ${this.completedLevel + 1} cleared`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    if (hasMoreLevels) {
      // Next Level button
      const nextButton = this.add.text(width / 2, height / 2 + 60, 'Next Level', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#00ff00',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      nextButton.on('pointerover', () => nextButton.setStyle({ color: '#ffff00' }));
      nextButton.on('pointerout', () => nextButton.setStyle({ color: '#00ff00' }));
      nextButton.on('pointerdown', () => {
        this.scene.start('GameScene', { level: nextLevel });
      });
    } else {
      // Game complete!
      this.add.text(width / 2, height / 2 + 40, 'You beat all levels!', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffdd00'
      }).setOrigin(0.5);

      // Back to menu button
      const menuButton = this.add.text(width / 2, height / 2 + 100, 'Main Menu', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#00ff00',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      menuButton.on('pointerover', () => menuButton.setStyle({ color: '#ffff00' }));
      menuButton.on('pointerout', () => menuButton.setStyle({ color: '#00ff00' }));
      menuButton.on('pointerdown', () => {
        this.scene.start('MenuScene');
      });
    }
  }
}
