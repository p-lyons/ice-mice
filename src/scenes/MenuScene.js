import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Ice background
    for (let x = 0; x < width; x += 48) {
      for (let y = 0; y < height; y += 48) {
        this.add.image(x + 24, y + 24, 'ice-tile').setAlpha(0.5);
      }
    }

    // Title with shadow
    this.add.text(width / 2 + 3, height / 2 - 77, 'Ice Mice', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.3);

    this.add.text(width / 2, height / 2 - 80, 'Ice Mice', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 - 20, 'A slippery adventure!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaddff',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.text(width / 2, height / 2 + 60, 'Play', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 30, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => {
      playButton.setStyle({ color: '#ffff00' });
      playButton.setScale(1.05);
    });

    playButton.on('pointerout', () => {
      playButton.setStyle({ color: '#00ff00' });
      playButton.setScale(1);
    });

    playButton.on('pointerdown', () => {
      this.startGame();
    });

    // "Press any key" text with pulsing animation
    const pressKeyText = this.add.text(width / 2, height / 2 + 120, 'Press any key to play', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#88aaff'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pressKeyText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Allow any key to start game
    this.input.keyboard.once('keydown', () => {
      this.startGame();
    });

    // Sliding mouse animation
    this.slidingMouse = this.add.image(-50, height / 2 + 150, 'mouse');
    this.slidingMouse.setScale(1.5);

    // Create looping slide animation
    this.createSlideAnimation();

    // Decorative cheese pieces
    this.add.image(150, 120, 'cheese').setScale(1.2).setAngle(-15);
    this.add.image(650, 480, 'cheese').setScale(1.2).setAngle(20);
    this.add.image(700, 150, 'cheese').setScale(0.8).setAngle(10);

    // Decorative snowbanks
    this.add.image(80, 500, 'snowbank').setScale(0.8).setAlpha(0.7);
    this.add.image(720, 80, 'snowbank').setScale(0.6).setAlpha(0.7);
  }

  startGame() {
    this.scene.start('GameScene', { level: 0 });
  }

  createSlideAnimation() {
    const { width, height } = this.scale;

    // Mouse slides across screen
    this.tweens.add({
      targets: this.slidingMouse,
      x: width + 50,
      duration: 3000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Reset position and slide again
        this.slidingMouse.x = -50;
        this.slidingMouse.y = height / 2 + 120 + Math.random() * 60;
        this.createSlideAnimation();
      }
    });

    // Slight wobble as it slides
    this.tweens.add({
      targets: this.slidingMouse,
      angle: { from: -10, to: 10 },
      duration: 200,
      yoyo: true,
      repeat: 14
    });
  }
}
