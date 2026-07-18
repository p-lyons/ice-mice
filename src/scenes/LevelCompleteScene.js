import Phaser from 'phaser';
import { recordLevelResult } from '../progress.js';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelCompleteScene');
  }

  init(data) {
    this.completedLevel = data.level;
    this.totalLevels = data.totalLevels;
    this.totalResets = data.totalResets || 0;
    this.startTime = data.startTime;
    this.goldenCollected = !!data.goldenCollected;
    this.mode = data.mode || 'adventure';
    this.p1Score = data.p1Score || 0;
    this.p2Score = data.p2Score || 0;
    this.runTime = data.runTime || null;
    this.newBest = !!data.newBest;
    this.customLevel = data.customLevel || null;
    this.fromEditor = !!data.fromEditor;
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

    if (this.mode === 'chase') {
      this.showChaseResults();
      return;
    }

    if (this.customLevel) {
      this.showCustomComplete();
      return;
    }

    // Save progress (beaten + golden star) for the level select screen
    recordLevelResult(this.completedLevel, this.goldenCollected);

    if (hasMoreLevels) {
      this.showLevelComplete(nextLevel);
    } else {
      this.showGameComplete();
    }
  }

  // Cheese Chase results: winner, scores, rematch
  showChaseResults() {
    const { width, height } = this.scale;
    const p1 = this.p1Score;
    const p2 = this.p2Score;
    const tie = p1 === p2;
    const winnerTexture = p1 >= p2 ? 'mouse' : 'mouse2';

    const title = this.add.text(width / 2, height / 2 - 130,
      tie ? "It's a tie!" : (p1 > p2 ? 'Player 1 wins!' : 'Player 2 wins!'), {
        fontSize: '52px',
        fontFamily: 'Arial',
        color: '#ffdd00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: { from: 0, to: 1 },
      duration: 400,
      ease: 'Back.easeOut'
    });

    // The champion mouse (or both, for a tie) does a victory wiggle
    if (tie) {
      this.spinMouse(width / 2 - 40, height / 2 - 40, 'mouse');
      this.spinMouse(width / 2 + 40, height / 2 - 40, 'mouse2');
    } else {
      this.spinMouse(width / 2, height / 2 - 40, winnerTexture);
    }

    // Scoreboard
    this.add.image(width / 2 - 90, height / 2 + 40, 'mouse').setScale(1.3);
    this.add.text(width / 2 - 60, height / 2 + 40, String(p1), {
      fontSize: '36px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.image(width / 2, height / 2 + 40, 'cheese').setScale(1.4);
    this.add.text(width / 2 + 60, height / 2 + 40, String(p2), {
      fontSize: '36px', fontFamily: 'Arial', color: '#e8b888', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.image(width / 2 + 90, height / 2 + 40, 'mouse2').setScale(1.3);

    // Buttons: rematch, next pond, menu
    this.chaseButton(width / 2 - 170, height / 2 + 130, 'Rematch', () => {
      this.scene.start('GameScene', {
        level: this.completedLevel, players: 2, mode: 'chase', continuing: true
      });
    });
    this.chaseButton(width / 2, height / 2 + 130, 'Next Pond', () => {
      this.scene.start('GameScene', {
        level: (this.completedLevel + 1) % this.totalLevels,
        players: 2, mode: 'chase', continuing: true
      });
    });
    this.chaseButton(width / 2 + 170, height / 2 + 130, 'Menu', () => {
      this.scene.start('MenuScene');
    });
  }

  spinMouse(x, y, texture) {
    const champ = this.add.image(x, y, texture).setScale(2.2);
    this.tweens.add({
      targets: champ,
      angle: { from: -15, to: 15 },
      duration: 250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  chaseButton(x, y, label, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ color: '#ffff00' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#00ff00' }));
    btn.on('pointerdown', callback);
    return btn;
  }

  // A painted level was beaten - no saved progress, offer replay/painter
  showCustomComplete() {
    const { width, height } = this.scale;

    const title = this.add.text(width / 2, height / 2 - 90, 'You made it!', {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: { from: 0, to: 1 },
      duration: 400,
      ease: 'Back.easeOut'
    });

    this.add.text(width / 2, height / 2 - 35,
      `"${(this.customLevel.name || 'Mystery Pond').slice(0, 28)}" cleared!`, {
        fontSize: '24px', fontFamily: 'Arial', color: '#c0e8ff', fontStyle: 'italic'
      }).setOrigin(0.5);

    this.chaseButton(width / 2 - 150, height / 2 + 60, 'Play Again', () => {
      this.scene.start('GameScene', {
        customLevel: this.customLevel, players: 1, fromEditor: this.fromEditor, continuing: true
      });
    });
    if (this.fromEditor) {
      this.chaseButton(width / 2, height / 2 + 60, 'Painter', () => {
        this.scene.start('EditorScene', { level: this.customLevel });
      });
    }
    this.chaseButton(width / 2 + 150, height / 2 + 60, 'Menu', () => {
      this.scene.start('MenuScene');
    });
  }

  showLevelComplete(nextLevel) {
    const { width, height } = this.scale;

    // Title
    const title = this.add.text(width / 2, height / 2 - 70, 'Level Complete!', {
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
    this.add.text(width / 2, height / 2 - 10, `Level ${this.completedLevel + 1} cleared!`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Ghost race time (solo runs)
    if (this.runTime !== null) {
      const timeStr = `${(this.runTime / 1000).toFixed(1)}s`;
      const timeText = this.add.text(width / 2, height / 2 + 165,
        this.newBest ? `${timeStr} - New best! Your ghost learned this run.` : `Time: ${timeStr}`, {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: this.newBest ? '#66ddff' : '#88aacc',
          fontStyle: this.newBest ? 'bold' : 'normal'
        }).setOrigin(0.5);
      if (this.newBest) {
        this.tweens.add({
          targets: timeText,
          scale: { from: 1.15, to: 1 },
          duration: 350,
          ease: 'Back.easeOut'
        });
      }
    }

    // Cheese icon
    this.add.image(width / 2 - 30, height / 2 + 30, 'cheese').setScale(1.2);

    // Golden cheese star callout
    if (this.goldenCollected) {
      const star = this.add.image(width / 2 + 30, height / 2 + 30, 'star').setScale(1.4);
      this.tweens.add({
        targets: star,
        angle: { from: -15, to: 15 },
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.add.text(width / 2, height / 2 + 62, 'You found the golden cheese!', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffd700',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Countdown text
    const countdownY = this.goldenCollected ? height / 2 + 105 : height / 2 + 90;
    this.countdownText = this.add.text(width / 2, countdownY, 'Next level in 2...', {
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
    this.add.text(width / 2, countdownY + 35, '(Press any key to continue)', {
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

    // Cheese-wedge confetti raining down
    this.add.particles(0, 0, 'cheese', {
      x: { min: 0, max: width },
      y: -20,
      lifespan: 6000,
      speedY: { min: 60, max: 140 },
      speedX: { min: -30, max: 30 },
      rotate: { min: 0, max: 360 },
      scale: { min: 0.6, max: 1.2 },
      frequency: 120
    });

    // Star confetti too - this is the big ending
    this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: -20,
      lifespan: 6000,
      speedY: { min: 50, max: 120 },
      speedX: { min: -30, max: 30 },
      rotate: { min: 0, max: 360 },
      scale: { min: 0.5, max: 1 },
      frequency: 200
    });

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
    this.add.text(width / 2, height / 2 - 30, `All ${this.totalLevels} levels completed!`, {
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

    this.add.text(width / 2, height / 2 + 55, `Times caught: ${this.totalResets}`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffaaaa'
    }).setOrigin(0.5);

    // Rating based on resets
    let rating = '';
    if (this.totalResets === 0) {
      rating = 'Perfect! Nothing caught you!';
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
      this.scene.start('MenuScene');
    });

    // The mouse family pours out to celebrate
    this.createMouseParade();

    // The bears wave goodbye (no hard feelings)
    this.createWavingBear(120, 160);
    this.createWavingBear(680, 160);

    // Penguin and walrus join the party
    const penguin = this.add.image(150, 450, 'penguin').setScale(1.8);
    this.tweens.add({
      targets: penguin,
      angle: { from: -15, to: 15 },
      duration: 300,
      yoyo: true,
      repeat: -1
    });
    this.add.image(660, 460, 'walrus').setScale(1.2);
  }

  createMouseParade() {
    const { width, height } = this.scale;

    // A parade of mice (gray and brown) sliding across the bottom forever
    for (let i = 0; i < 6; i++) {
      const texture = i % 2 === 0 ? 'mouse' : 'mouse2';
      const mouse = this.add.image(-40 - i * 70, height - 40, texture).setScale(1.5);

      this.tweens.add({
        targets: mouse,
        x: width + 60,
        duration: 4000,
        delay: i * 300,
        repeat: -1,
        repeatDelay: 800,
        ease: 'Linear'
      });

      this.tweens.add({
        targets: mouse,
        angle: { from: -12, to: 12 },
        duration: 180,
        yoyo: true,
        repeat: -1
      });
    }
  }

  createWavingBear(x, y) {
    const bear = this.add.image(x, y, 'polar-bear').setScale(1.5);
    this.tweens.add({
      targets: bear,
      angle: { from: -8, to: 8 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
