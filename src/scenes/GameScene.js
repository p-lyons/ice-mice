import Phaser from 'phaser';
import Mouse from '../entities/Mouse.js';
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
    const levelData = levels[this.currentLevel];

    // Track collectibles
    this.cheeseCollected = 0;
    this.totalCheese = 0;
    this.holeActive = false;

    // Create groups
    this.snowbanks = this.physics.add.staticGroup();
    this.cheeses = this.physics.add.group();

    // Tile the ice background first
    for (let x = 0; x < 800; x += TILE_SIZE) {
      for (let y = GRID_OFFSET_Y; y < 600; y += TILE_SIZE) {
        this.add.image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 'ice-tile');
      }
    }

    // Parse level and place objects
    let mouseStartX = 400;
    let mouseStartY = 300;

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
            this.cheeses.create(x, y, 'cheese');
            this.totalCheese++;
            break;
          case 3: // Mouse hole
            this.mouseHole = this.physics.add.sprite(x, y, 'mouse-hole');
            this.mouseHole.body.setImmovable(true);
            // Start small and faded
            this.mouseHole.setScale(0.5);
            this.mouseHole.setAlpha(0.3);
            // Smaller hitbox - must be right on top to trigger
            this.mouseHole.body.setSize(12, 12);
            this.mouseHole.body.setOffset(10, 10);
            break;
          case 4: // Mouse start
            mouseStartX = x;
            mouseStartY = y;
            break;
          case 5: // Polar bear start (placeholder for now)
            // Bears will be added in a later prompt
            break;
        }
      }
    }

    // Create mouse at start position
    this.mouse = new Mouse(this, mouseStartX, mouseStartY);

    // Set up collisions
    this.physics.add.collider(this.mouse, this.snowbanks);

    // Cheese collection
    this.physics.add.overlap(this.mouse, this.cheeses, this.collectCheese, null, this);

    // Mouse hole overlap (only triggers when active)
    this.physics.add.overlap(this.mouse, this.mouseHole, this.enterHole, null, this);

    // HUD
    this.levelText = this.add.text(16, 4, `Level: ${this.currentLevel + 1}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
    this.cheeseText = this.add.text(150, 4, `Cheese: 0/${this.totalCheese}`, {
      fontSize: '16px',
      color: '#ffdd00'
    });
  }

  collectCheese(mouse, cheese) {
    cheese.destroy();
    this.cheeseCollected++;
    this.cheeseText.setText(`Cheese: ${this.cheeseCollected}/${this.totalCheese}`);

    // Check if all cheese collected
    if (this.cheeseCollected >= this.totalCheese) {
      this.activateHole();
    }
  }

  activateHole() {
    this.holeActive = true;

    // Grow to full size
    this.tweens.add({
      targets: this.mouseHole,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Then start pulsing
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

    // Prevent multiple triggers
    this.holeActive = false;
    this.physics.pause();

    // Quick shrink animation then transition
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

  update() {
    this.mouse.update();
  }
}
