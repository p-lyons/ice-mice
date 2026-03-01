import Phaser from 'phaser';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelCompleteScene');
  }

  init(data) {
    this.completedLevel = data.level;
    this.totalLevels = data.totalLevels;
    this.totalResets = data.totalResets || 0;
    this.startTime = data.startTime;
  }

  create() {
    const { width, height } = this.scale;
    const nextLevel = this.completedLevel + 1;
    const hasMoreLevels = nextLevel < this.totalLevels;

    // Ice background (faded)
    for (let x = 0; x < width; x += 48) {
      for (let y = 0; y < height; y += 48) {
        this.add.image(x + 24, y + 24, 'ice-tile').setAlpha(0.3);
      }
    }

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

    if (hasMoreLevels) {
      this.showLevelComplete(nextLevel);
    } else {
      this.showGameComplete();
    }
  }

  showLevelComplete(nextLevel) {
    const { width, height } = this.scale;

    // Title
    const title = this.add.text(width / 2, height / 2 - 60, 'Level Complete!', {
      fontSize: '52px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Bounce animation on title
    this.tweens.add({
      targets: title,
      scale: { from: 0, to: 1 },
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Level cleared text
    this.add.text(width / 2, height / 2, `Level ${this.completedLevel + 1} cleared!`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Cheese icon
    this.add.image(width / 2 - 30, height / 2 + 40, 'cheese').setScale(1.2);

    // Countdown text
    this.countdownText = this.add.text(width / 2, height / 2 + 100, 'Next level in 2...', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Auto-advance timer
    let countdown = 2;
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        if (countdown > 0) {
          this.countdownText.setText(`Next level in ${countdown}...`);
        } else {
          this.goToNextLevel(nextLevel);
        }
      },
      repeat: 1
    });

    // Skip on any key or click
    this.input.keyboard.once('keydown', () => {
      this.countdownTimer.remove();
      this.goToNextLevel(nextLevel);
    });

    this.input.once('pointerdown', () => {
      this.countdownTimer.remove();
      this.goToNextLevel(nextLevel);
    });

    // Press any key hint
    this.add.text(width / 2, height / 2 + 140, '(Press any key to continue)', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);
  }

  goToNextLevel(nextLevel) {
    this.scene.start('GameScene', { level: nextLevel, continuing: true });
  }

  showGameComplete() {
    const { width, height } = this.scale;

    // Calculate total time
    const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const timeString = minutes > 0
      ? `${minutes}m ${seconds}s`
      : `${seconds} seconds`;

    // Big "You Win!" title
    const title = this.add.text(width / 2, height / 2 - 100, 'You Win!', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ffdd00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Bounce animation
    this.tweens.add({
      targets: title,
      scale: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Pulsing glow effect
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.7 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // All levels completed text
    this.add.text(width / 2, height / 2 - 30, 'All 5 levels completed!', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Stats
    this.add.text(width / 2, height / 2 + 20, `Time: ${timeString}`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#aaddff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 55, `Bear catches: ${this.totalResets}`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffaaaa'
    }).setOrigin(0.5);

    // Rating based on resets
    let rating = '';
    if (this.totalResets === 0) {
      rating = 'Perfect! No bears caught you!';
    } else if (this.totalResets <= 3) {
      rating = 'Great job!';
    } else if (this.totalResets <= 10) {
      rating = 'Well done!';
    } else {
      rating = 'You made it!';
    }

    this.add.text(width / 2, height / 2 + 95, rating, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#88ff88',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Play Again button
    const playAgainButton = this.add.text(width / 2, height / 2 + 160, 'Play Again', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 25, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgainButton.on('pointerover', () => {
      playAgainButton.setStyle({ color: '#ffff00' });
      playAgainButton.setScale(1.05);
    });

    playAgainButton.on('pointerout', () => {
      playAgainButton.setStyle({ color: '#00ff00' });
      playAgainButton.setScale(1);
    });

    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene', { level: 0 });
    });

    // Decorative elements
    this.add.image(150, 150, 'cheese').setScale(1.5).setAngle(-20);
    this.add.image(650, 450, 'cheese').setScale(1.5).setAngle(15);
    this.add.image(100, 400, 'mouse').setScale(2);
  }
}
