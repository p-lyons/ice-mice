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
      frequency: -1, // Manual emission
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
          case 1: // Snowbank (wall)
            this.snowbanks.create(x, y, 'snowbank');
            break;
          case 2: // Cheese
            this.cheesePositions.push({ x, y });
            this.cheeses.create(x, y, 'cheese');
            this.totalCheese++;
            break;
          case 3: // Mouse hole
            this.mouseHole = this.physics.add.sprite(x, y, 'mouse-hole');
            this.mouseHole.body.setImmovable(true);
            this.mouseHole.setScale(0.5);
            this.mouseHole.setAlpha(0.3);
            this.mouseHole.body.setSize(12, 12);
            this.mouseHole.body.setOffset(10, 10);
            break;
          case 4: // Mouse start
            this.mouseStartX = x;
            this.mouseStartY = y;
            break;
          case 5: // Polar bear
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

    // Bear collisions with snowbanks
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

    // Screen flash overlay (hidden initially)
    this.flashOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000);
    this.flashOverlay.setAlpha(0);
    this.flashOverlay.setDepth(100);

    // HUD
    this.levelText = this.add.text(16, 4, `Level: ${this.currentLevel + 1}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
    this.cheeseText = this.add.text(150, 4, `Cheese: 0/${this.totalCheese}`, {
      fontSize: '16px',
      color: '#ffdd00'
    });

    // Track for slide sound
    this.lastSlideSound = 0;
  }

  collectCheese(mouse, cheese) {
    // Disable body to prevent double collection
    cheese.body.enable = false;

    // Play cheese sound
    this.sound.play('cheese');

    // Pop animation before destroying
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
    this.cheeseText.setText(`Cheese: ${this.cheeseCollected}/${this.totalCheese}`);

    if (this.cheeseCollected >= this.totalCheese) {
      this.activateHole();
    }
  }

  activateHole() {
    this.holeActive = true;

    // Play hole activate sound
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

    // Play level complete sound
    this.sound.play('level-complete');

    this.tweens.add({
      targets: this.mouse,
      scale: 0,
      duration: 300,
      onComplete: () => {
        this.scene.start('LevelCompleteScene', {
          level: this.currentLevel,
          totalLevels: levels.length
        });
      }
    });
  }

  caughtByBear(mouse, bear) {
    if (this.isResetting) return;
    this.isResetting = true;

    // Play caught sound
    this.sound.play('caught');

    // Flash screen red
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: { from: 0.6, to: 0 },
      duration: 400,
      ease: 'Power2'
    });

    // Brief pause then reset
    this.time.delayedCall(300, () => {
      this.resetLevel();
    });
  }

  resetLevel() {
    // Reset mouse position and velocity
    this.mouse.setPosition(this.mouseStartX, this.mouseStartY);
    this.mouse.body.setVelocity(0, 0);
    this.mouse.setScale(1);

    // Reset bears to starting positions
    this.bears.forEach(bear => bear.reset());

    // Respawn all cheese
    this.cheeses.clear(true, true);
    this.cheesePositions.forEach(pos => {
      this.cheeses.create(pos.x, pos.y, 'cheese');
    });

    // Reset cheese counter
    this.cheeseCollected = 0;
    this.cheeseText.setText(`Cheese: 0/${this.totalCheese}`);

    // Reset mouse hole
    this.holeActive = false;
    this.tweens.killTweensOf(this.mouseHole);
    this.mouseHole.setScale(0.5);
    this.mouseHole.setAlpha(0.3);

    this.isResetting = false;
  }

  update(time) {
    if (!this.isResetting) {
      this.mouse.update();
      this.bears.forEach(bear => bear.update());

      // Ice scratch trail particles when moving fast
      const speed = Math.sqrt(
        this.mouse.body.velocity.x ** 2 +
        this.mouse.body.velocity.y ** 2
      );

      if (speed > 100) {
        // Emit trail particles
        this.trailParticles.emitParticle(1, this.mouse.x, this.mouse.y);

        // Play slide sound occasionally when moving fast
        if (speed > 150 && time - this.lastSlideSound > 400) {
          this.sound.play('slide', { volume: 0.3 });
          this.lastSlideSound = time;
        }
      }
    }
  }
}
