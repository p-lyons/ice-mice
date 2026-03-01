import Phaser from 'phaser';
import Mouse from '../entities/Mouse.js';
import PolarBear from '../entities/PolarBear.js';
import levels from '../levels.js';

const TILE_SIZE = 48;
const GRID_OFFSET_X = 16;
const GRID_OFFSET_Y = 24;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.currentLevel = data.level || 0;
    // Track total resets across all levels (persisted in registry)
    if (data.level === 0 && !data.continuing) {
      this.registry.set('totalResets', 0);
      this.registry.set('startTime', Date.now());
    }
  }

  create() {
    const level = levels[this.currentLevel];
    const levelData = level.grid;

    // Track collectibles
    this.cheeseCollected = 0;
    this.totalCheese = 0;
    this.holeActive = false;
    this.isResetting = false;

    // Store cheese positions for respawn
    this.cheesePositions = [];

    // Create groups
    this.snowbanks = this.physics.add.staticGroup();
    this.cheeses = this.physics.add.group();
    this.bears = [];

    // Tile the ice background first
    for (let x = 0; x < 800; x += TILE_SIZE) {
      for (let y = GRID_OFFSET_Y; y < 600; y += TILE_SIZE) {
        this.add.image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 'ice-tile');
      }
    }

    // Create particle emitter for ice scratch trails
    this.trailParticles = this.add.particles(0, 0, 'ice-tile', {
      scale: { start: 0.05, end: 0 },
      alpha: { start: 0.4, end: 0 },
      speed: { min: 10, max: 30 },
      lifespan: 300,
      frequency: -1,
      tint: 0xffffff
    });

    // Parse level and place objects
    this.mouseStartX = 400;
    this.mouseStartY = 300;
    let bearIndex = 0;

    for (let row = 0; row < levelData.length; row++) {
      for (let col = 0; col < levelData[row].length; col++) {
        const tile = levelData[row][col];
        const x = GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
        const y = GRID_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;

        switch (tile) {
          case 1:
            this.snowbanks.create(x, y, 'snowbank');
            break;
          case 2:
            this.cheesePositions.push({ x, y });
            this.cheeses.create(x, y, 'cheese');
            this.totalCheese++;
            break;
          case 3:
            this.mouseHole = this.physics.add.sprite(x, y, 'mouse-hole');
            this.mouseHole.body.setImmovable(true);
            this.mouseHole.setScale(0.5);
            this.mouseHole.setAlpha(0.3);
            this.mouseHole.body.setSize(12, 12);
            this.mouseHole.body.setOffset(10, 10);
            break;
          case 4:
            this.mouseStartX = x;
            this.mouseStartY = y;
            break;
          case 5:
            if (level.bears && level.bears[bearIndex]) {
              const waypoints = level.bears[bearIndex];
              const bear = new PolarBear(this, x, y, waypoints);
              this.bears.push(bear);
              bearIndex++;
            }
            break;
        }
      }
    }

    // Create mouse at start position
    this.mouse = new Mouse(this, this.mouseStartX, this.mouseStartY);

    // Set up collisions
    this.physics.add.collider(this.mouse, this.snowbanks);
    this.bears.forEach(bear => {
      this.physics.add.collider(bear, this.snowbanks);
    });

    // Cheese collection
    this.physics.add.overlap(this.mouse, this.cheeses, this.collectCheese, null, this);

    // Mouse hole overlap
    this.physics.add.overlap(this.mouse, this.mouseHole, this.enterHole, null, this);

    // Bear catches mouse
    this.bears.forEach(bear => {
      this.physics.add.overlap(this.mouse, bear, this.caughtByBear, null, this);
    });

    // Screen flash overlay
    this.flashOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000);
    this.flashOverlay.setAlpha(0);
    this.flashOverlay.setDepth(100);

    // HUD Background
    this.add.rectangle(400, 12, 800, 24, 0x000000, 0.5);

    // HUD - Level
    this.add.text(16, 4, `Level ${this.currentLevel + 1}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // HUD - Cheese icon and counter
    this.add.image(140, 12, 'cheese').setScale(0.8);
    this.cheeseText = this.add.text(155, 4, `${this.cheeseCollected}/${this.totalCheese}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffdd00',
      fontStyle: 'bold'
    });

    // Track for slide sound
    this.lastSlideSound = 0;

    // Start background music (faint, looping)
    if (!this.sound.get('music')) {
      this.bgMusic = this.sound.add('music', { loop: true, volume: 0.15 });
      this.bgMusic.play();
    }

    // Start countdown
    this.countdownActive = true;
    this.startCountdown();
  }

  startCountdown() {
    const { width, height } = this.scale;

    // Create countdown text (starts hidden)
    this.countdownText = this.add.text(width / 2, height / 2, '', {
      fontSize: '96px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(200);

    // Freeze mouse and bears during countdown
    this.mouse.body.enable = false;
    this.bears.forEach(bear => bear.body.enable = false);

    // Countdown sequence: 3, 2, 1, Go!
    const sequence = ['3', '2', '1', 'Go!'];
    let index = 0;

    const showNext = () => {
      if (index < sequence.length) {
        const text = sequence[index];
        this.countdownText.setText(text);

        // Play sound
        if (text === 'Go!') {
          this.sound.play('go');
          this.countdownText.setColor('#00ff00');
        } else {
          this.sound.play('countdown');
        }

        // Scale animation
        this.tweens.add({
          targets: this.countdownText,
          scale: { from: 1.5, to: 1 },
          alpha: { from: 1, to: 0.8 },
          duration: 300,
          ease: 'Power2'
        });

        index++;

        if (index < sequence.length) {
          this.time.delayedCall(700, showNext);
        } else {
          // After "Go!", fade out and start the game
          this.time.delayedCall(400, () => {
            this.tweens.add({
              targets: this.countdownText,
              alpha: 0,
              scale: 2,
              duration: 200,
              onComplete: () => {
                this.countdownText.destroy();
                this.countdownActive = false;
                this.mouse.body.enable = true;
                this.bears.forEach(bear => bear.body.enable = true);
              }
            });
          });
        }
      }
    };

    // Small delay before starting countdown
    this.time.delayedCall(300, showNext);
  }

  collectCheese(mouse, cheese) {
    cheese.body.enable = false;
    this.sound.play('cheese');

    this.tweens.add({
      targets: cheese,
      scale: 1.5,
      alpha: 0,
      duration: 150,
      ease: 'Back.easeIn',
      onComplete: () => {
        cheese.destroy();
      }
    });

    this.cheeseCollected++;
    this.cheeseText.setText(`${this.cheeseCollected}/${this.totalCheese}`);

    if (this.cheeseCollected >= this.totalCheese) {
      this.activateHole();
    }
  }

  activateHole() {
    this.holeActive = true;
    this.sound.play('hole-activate');

    this.tweens.add({
      targets: this.mouseHole,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.mouseHole,
          scale: { from: 1, to: 1.15 },
          alpha: { from: 1, to: 0.8 },
          duration: 400,
          yoyo: true,
          repeat: -1
        });
      }
    });
  }

  enterHole(mouse, hole) {
    if (!this.holeActive) return;

    this.holeActive = false;
    this.physics.pause();
    this.sound.play('level-complete');

    this.tweens.add({
      targets: this.mouse,
      scale: 0,
      duration: 300,
      onComplete: () => {
        this.scene.start('LevelCompleteScene', {
          level: this.currentLevel,
          totalLevels: levels.length,
          totalResets: this.registry.get('totalResets'),
          startTime: this.registry.get('startTime')
        });
      }
    });
  }

  caughtByBear(mouse, bear) {
    if (this.isResetting) return;
    this.isResetting = true;

    // Increment total resets
    const resets = this.registry.get('totalResets') || 0;
    this.registry.set('totalResets', resets + 1);

    this.sound.play('caught');

    this.tweens.add({
      targets: this.flashOverlay,
      alpha: { from: 0.6, to: 0 },
      duration: 400,
      ease: 'Power2'
    });

    this.time.delayedCall(300, () => {
      this.resetLevel();
    });
  }

  resetLevel() {
    this.mouse.setPosition(this.mouseStartX, this.mouseStartY);
    this.mouse.body.setVelocity(0, 0);
    this.mouse.setScale(1);

    this.bears.forEach(bear => bear.reset());

    this.cheeses.clear(true, true);
    this.cheesePositions.forEach(pos => {
      this.cheeses.create(pos.x, pos.y, 'cheese');
    });

    this.cheeseCollected = 0;
    this.cheeseText.setText(`${this.cheeseCollected}/${this.totalCheese}`);

    this.holeActive = false;
    this.tweens.killTweensOf(this.mouseHole);
    this.mouseHole.setScale(0.5);
    this.mouseHole.setAlpha(0.3);

    this.isResetting = false;
  }

  update(time) {
    if (!this.isResetting && !this.countdownActive) {
      this.mouse.update();
      this.bears.forEach(bear => bear.update());

      const speed = Math.sqrt(
        this.mouse.body.velocity.x ** 2 +
        this.mouse.body.velocity.y ** 2
      );

      if (speed > 100) {
        this.trailParticles.emitParticle(1, this.mouse.x, this.mouse.y);

        if (speed > 150 && time - this.lastSlideSound > 400) {
          this.sound.play('slide', { volume: 0.3 });
          this.lastSlideSound = time;
        }
      }
    }
  }
}
