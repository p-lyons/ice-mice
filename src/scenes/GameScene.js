import Phaser from 'phaser';
import Mouse from '../entities/Mouse.js';
import PolarBear from '../entities/PolarBear.js';
import Walrus from '../entities/Walrus.js';
import Penguin from '../entities/Penguin.js';
import Fox from '../entities/Fox.js';
import Otter from '../entities/Otter.js';
import levels from '../levels.js';
import { getGhost, saveGhostIfBest, getSelectedHat } from '../progress.js';

const TILE_SIZE = 48;
const GRID_OFFSET_X = 16;
const GRID_OFFSET_Y = 24;

const TILE_TRIGGER_DIST = 20; // distance from tile center that counts as "on it"
const SLUSH_HALF_EXTENT = 24; // slush works across the whole tile
const STREAK_COOLDOWN = 800; // ms before the same streak can fling the same mouse
const CO_OP_SPAWN_GAP = 16; // px between the two mice at the start position

const BLOCK_SPEED = 170; // pushed ice blocks slide at constant speed
const BLOCK_PUSH_MIN_SPEED = 50; // how fast a mouse must be moving to shove a block
const WIND_FORCE = 150; // extra acceleration while standing in a wind lane
const BURROW_COOLDOWN = 900; // ms before a mouse can burrow again (stops ping-pong)
const SPIN_DURATION = 650; // ms of helpless whirling on a spinner
const SPIN_COOLDOWN = 1400; // ms before the same spinner grabs the same mouse again
const FISH_DELIVER_DIST = 42; // how close to a penguin counts as a delivery
const GHOST_SAMPLE_MS = 100; // ghost path sample interval
const BURROW_PAIR_TINTS = [0xffb066, 0xc499ff, 0x7fe8b0, 0xff9bc2]; // pair colors

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.currentLevel = data.level || 0;
    // 'adventure' (normal) or 'chase' (2P cheese race). Custom levels come
    // from the level painter / shared links and bypass the levels array.
    this.gameMode = data.mode === 'chase' ? 'chase' : 'adventure';
    this.customLevel = data.customLevel || null;
    this.fromEditor = !!data.fromEditor;
    if (data.players) {
      this.registry.set('playerCount', data.players);
    }
    // Track total resets across all levels (persisted in registry)
    if (data.level === 0 && !data.continuing) {
      this.registry.set('totalResets', 0);
      this.registry.set('startTime', Date.now());
    }
  }

  create() {
    const level = this.customLevel || levels[this.currentLevel];
    const levelData = level.grid;
    this.levelName = level.name || '';
    this.playerCount = this.registry.get('playerCount') || 1;
    this.chaseMode = this.gameMode === 'chase';
    if (this.chaseMode) this.playerCount = 2;

    // Track collectibles
    this.cheeseCollected = 0;
    this.totalCheese = 0;
    this.goldenCollected = false;
    this.holeActive = false;
    this.isResetting = false;

    // Store positions for respawn
    this.cheesePositions = [];
    this.goldenPosition = null;

    // Store cracking ice data for tracking and reset
    this.crackingIceTiles = [];

    // Store melting ice data
    this.meltingIceTiles = [];
    this.meltingTimersStarted = false;

    // New tile mechanics
    this.slushTiles = [];
    this.streakTiles = [];
    this.windTiles = [];
    this.spinnerTiles = [];
    this.burrowTiles = [];
    this.blockStarts = [];
    this.fishSpots = [];

    // Create groups
    this.snowbanks = this.physics.add.staticGroup();
    this.cheeses = this.physics.add.group();
    this.waterHoles = this.physics.add.staticGroup();
    this.iceBlocks = this.physics.add.group();
    this.bears = [];
    this.walruses = [];
    this.penguins = [];
    this.foxes = [];
    this.otters = [];
    this.goldenCheese = null;

    // Tile the ice background first
    for (let x = 0; x < 800; x += TILE_SIZE) {
      for (let y = GRID_OFFSET_Y; y < 600; y += TILE_SIZE) {
        this.add.image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 'ice-tile');
      }
    }

    // Fish silhouettes cruising under the ice. Added right after the ice so
    // they render beneath everything else (pure atmosphere; also quietly
    // explains why falling in the water is bad)
    this.createUnderIceFish();

    // Create particle emitter for ice scratch trails
    this.trailParticles = this.add.particles(0, 0, 'ice-tile', {
      scale: { start: 0.05, end: 0 },
      alpha: { start: 0.4, end: 0 },
      speed: { min: 10, max: 30 },
      lifespan: 300,
      frequency: -1,
      tint: 0xffffff
    });

    // Create particle emitter for ice shard explosion
    this.shardParticles = this.add.particles(0, 0, 'cracked-ice', {
      scale: { start: 0.15, end: 0 },
      alpha: { start: 1, end: 0 },
      speed: { min: 80, max: 150 },
      lifespan: 500,
      frequency: -1,
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 }
    });

    // Star sparkles: cheese combos, golden cheese, dizzy stars in the caught gag
    this.starParticles = this.add.particles(0, 0, 'star', {
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0.3 },
      speed: { min: 40, max: 110 },
      lifespan: 600,
      frequency: -1,
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 }
    });
    this.starParticles.setDepth(40);

    // Parse level and place objects
    this.mouseStartX = 400;
    this.mouseStartY = 300;
    let bearIndex = 0;
    let penguinIndex = 0;
    let foxIndex = 0;

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
          case 6:
            // Cracking ice tile
            const crackingTile = this.add.image(x, y, 'cracking-ice');
            this.crackingIceTiles.push({
              sprite: crackingTile,
              x: x,
              y: y,
              state: 0, // 0 = cracking, 1 = cracked, 2 = water
              micePresent: [],
              waterHole: null
            });
            break;
          case 7:
            // Melting ice tile - stagger timers so they melt one by one
            const meltingTile = this.add.image(x, y, 'melting-ice');
            const meltIndex = this.meltingIceTiles.length;
            this.meltingIceTiles.push({
              sprite: meltingTile,
              x: x,
              y: y,
              timeRemaining: 15000 + (meltIndex * 3000), // 15s, 18s, 21s, etc.
              state: 0, // 0 = normal, 1 = warning, 2 = melted
              waterHole: null,
              shimmerTween: null
            });
            break;
          case 8:
            // Golden cheese - optional bonus, earns a star
            this.goldenPosition = { x, y };
            this.goldenCheese = this.physics.add.sprite(x, y, 'golden-cheese');
            this.goldenCheese.body.setImmovable(true);
            this.goldenCheese.setDepth(3);
            this.startGoldenPulse();
            break;
          case 9:
            this.walruses.push(new Walrus(this, x, y));
            break;
          case 10:
          case 11:
          case 12:
          case 13: {
            // Speed streaks: 10=right, 11=left, 12=up, 13=down
            const dirs = {
              10: { dx: 1, dy: 0, angle: 0 },
              11: { dx: -1, dy: 0, angle: 180 },
              12: { dx: 0, dy: -1, angle: -90 },
              13: { dx: 0, dy: 1, angle: 90 }
            };
            const dir = dirs[tile];
            const streakSprite = this.add.image(x, y, 'speed-streak');
            streakSprite.setAngle(dir.angle);
            // Gentle pulse so the streak reads as active
            this.tweens.add({
              targets: streakSprite,
              alpha: { from: 1, to: 0.7 },
              duration: 500,
              yoyo: true,
              repeat: -1
            });
            this.streakTiles.push({ x, y, dx: dir.dx, dy: dir.dy, lastBoost: [] });
            break;
          }
          case 14:
            this.add.image(x, y, 'slush');
            this.slushTiles.push({ x, y });
            break;
          case 15:
            if (level.penguins && level.penguins[penguinIndex]) {
              const waypoints = level.penguins[penguinIndex];
              this.penguins.push(new Penguin(this, x, y, waypoints));
              penguinIndex++;
            }
            break;
          case 16:
            // Pushable ice block (created after parsing, see setupIceBlocks)
            this.blockStarts.push({ x, y });
            break;
          case 17: {
            // Burrow tunnel - paired up in reading order after parsing
            const burrowSprite = this.add.image(x, y, 'burrow');
            burrowSprite.setDepth(2);
            this.burrowTiles.push({ x, y, sprite: burrowSprite, partner: null, lastWarp: [] });
            break;
          }
          case 18: {
            // Spinner - whirls the mouse and flings it out
            const spinnerSprite = this.add.image(x, y, 'spinner');
            spinnerSprite.setDepth(1);
            this.tweens.add({
              targets: spinnerSprite,
              angle: 360,
              duration: 3000,
              repeat: -1
            });
            this.spinnerTiles.push({ x, y, lastSpin: [] });
            break;
          }
          case 19:
          case 20:
          case 21:
          case 22: {
            // Wind lanes: 19=right, 20=left, 21=up, 22=down
            const winds = {
              19: { dx: 1, dy: 0, angle: 0 },
              20: { dx: -1, dy: 0, angle: 180 },
              21: { dx: 0, dy: -1, angle: -90 },
              22: { dx: 0, dy: 1, angle: 90 }
            };
            const wind = winds[tile];
            const windSprite = this.add.image(x, y, 'wind-tile');
            windSprite.setAngle(wind.angle);
            this.windTiles.push({ x, y, dx: wind.dx, dy: wind.dy });
            // Drifting flecks that show the push direction
            this.add.particles(0, 0, 'snowflake', {
              x: { min: x - 22, max: x + 22 },
              y: { min: y - 22, max: y + 22 },
              lifespan: 700,
              speedX: { min: wind.dx * 50, max: wind.dx * 90 },
              speedY: { min: wind.dy * 50, max: wind.dy * 90 },
              scale: { start: 0.5, end: 0.1 },
              alpha: { start: 0.7, end: 0 },
              frequency: 260
            });
            break;
          }
          case 23:
            if (level.foxes && level.foxes[foxIndex]) {
              const target = level.foxes[foxIndex];
              this.foxes.push(new Fox(this, x, y, target.x, target.y));
              foxIndex++;
            }
            break;
          case 24:
            this.otters.push(new Otter(this, x, y));
            break;
          case 25: {
            // Frozen fish: carry it to a penguin for a thank-you party
            const fishSprite = this.physics.add.sprite(x, y, 'fish');
            fishSprite.body.setImmovable(true);
            fishSprite.setDepth(3);
            this.tweens.add({
              targets: fishSprite,
              angle: { from: -10, to: 10 },
              y: y - 3,
              duration: 800,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
            this.fishSpots.push({ x, y, sprite: fishSprite, delivered: false });
            break;
          }
        }
      }
    }

    // Pair up burrows in reading order (1st+2nd, 3rd+4th, ...) and tint each pair
    for (let i = 0; i + 1 < this.burrowTiles.length; i += 2) {
      const a = this.burrowTiles[i];
      const b = this.burrowTiles[i + 1];
      a.partner = b;
      b.partner = a;
      const tint = BURROW_PAIR_TINTS[(i / 2) % BURROW_PAIR_TINTS.length];
      a.sprite.setTint(tint);
      b.sprite.setTint(tint);
    }

    this.setupIceBlocks();

    // Create mice: solo gets one mouse on all keys; co-op splits arrows/WASD
    this.mice = [];
    if (this.playerCount === 2) {
      const p1 = new Mouse(this, this.mouseStartX - CO_OP_SPAWN_GAP, this.mouseStartY, 'mouse', 'arrows');
      const p2 = new Mouse(this, this.mouseStartX + CO_OP_SPAWN_GAP, this.mouseStartY, 'mouse2', 'wasd');
      this.mice.push(p1, p2);
    } else {
      this.mice.push(new Mouse(this, this.mouseStartX, this.mouseStartY, 'mouse', 'both'));
    }
    this.mice.forEach((mouse, i) => {
      mouse.spawnX = mouse.x;
      mouse.spawnY = mouse.y;
      mouse.playerIndex = i;
      mouse.chaseScore = 0;
      mouse.setDepth(6);
    });

    // P1 wears the chosen hat (earned with golden-cheese stars)
    const selectedHat = getSelectedHat();
    if (selectedHat) {
      this.mice[0].setHat(selectedHat);
    }

    // Set up collisions
    this.mice.forEach(mouse => {
      this.physics.add.collider(mouse, this.snowbanks);
      this.physics.add.overlap(mouse, this.cheeses, this.collectCheese, null, this);
      if (this.goldenCheese) {
        this.physics.add.overlap(mouse, this.goldenCheese, this.collectGolden, null, this);
      }
      this.physics.add.overlap(mouse, this.mouseHole, this.enterHole, null, this);
      this.physics.add.overlap(mouse, this.waterHoles, this.fallInWater, null, this);
      this.physics.add.collider(mouse, this.iceBlocks, this.pushBlock, null, this);
      this.bears.forEach(bear => {
        this.physics.add.overlap(mouse, bear, this.caughtByBear, null, this);
      });
      // Foxes only catch mid-pounce / on the prowl; asleep they're furniture
      this.foxes.forEach(fox => {
        this.physics.add.overlap(mouse, fox, this.caughtByBear,
          () => fox.isDangerous(), this);
      });
      this.otters.forEach(otter => {
        this.physics.add.overlap(mouse, otter, (m, o) => o.rescue(m), null, this);
      });
      this.walruses.forEach(walrus => {
        this.physics.add.collider(mouse, walrus, this.bounceOffWalrus, null, this);
      });
      this.penguins.forEach(penguin => {
        this.physics.add.collider(mouse, penguin);
      });
      this.fishSpots.forEach(spot => {
        this.physics.add.overlap(mouse, spot.sprite, () => this.pickUpFish(mouse, spot), null, this);
      });
    });

    // In co-op the mice bounce off each other (comedy is mandatory)
    if (this.mice.length === 2) {
      this.physics.add.collider(this.mice[0], this.mice[1]);
    }

    this.bears.forEach(bear => {
      this.physics.add.collider(bear, this.snowbanks);
    });

    // Screen flash overlay
    this.flashOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000);
    this.flashOverlay.setAlpha(0);
    this.flashOverlay.setDepth(100);

    // HUD Background
    this.add.rectangle(400, 12, 800, 24, 0x000000, 0.5).setDepth(95);

    // HUD - Level
    this.add.text(16, 4, this.customLevel ? 'Custom' : `Level ${this.currentLevel + 1}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setDepth(96);

    // HUD - Cheese icon and counter
    this.add.image(140, 12, 'cheese').setScale(0.8).setDepth(96);
    this.cheeseText = this.add.text(155, 4, `${this.cheeseCollected}/${this.totalCheese}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffdd00',
      fontStyle: 'bold'
    }).setDepth(96);

    // HUD - Golden cheese star (dim until earned)
    if (this.goldenPosition) {
      this.hudStar = this.add.image(215, 12, 'star').setScale(0.9).setAlpha(0.25).setDepth(96);
    }

    if (this.chaseMode) {
      // Cheese Chase scoreboard: P1 vs P2
      this.add.image(320, 12, 'mouse').setScale(0.8).setDepth(96);
      this.chaseText1 = this.add.text(335, 4, '0', {
        fontSize: '16px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
      }).setDepth(96);
      this.add.image(420, 12, 'mouse2').setScale(0.8).setDepth(96);
      this.chaseText2 = this.add.text(435, 4, '0', {
        fontSize: '16px', fontFamily: 'Arial', color: '#e8b888', fontStyle: 'bold'
      }).setDepth(96);
    }

    // Ghost race: solo adventure only. Race the translucent mouse of your
    // best run; beat it and the ghost learns your new line.
    this.ghostEnabled = this.playerCount === 1 && !this.chaseMode && !this.customLevel;
    this.runElapsed = 0;
    this.recordedPath = [];
    this.lastSampleTime = 0;
    this.ghostSprite = null;
    this.ghostData = null;
    if (this.ghostEnabled) {
      this.timerText = this.add.text(300, 4, '0.0s', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#a0d8ff',
        fontStyle: 'bold'
      }).setDepth(96);

      this.ghostData = getGhost(this.currentLevel);
      if (this.ghostData && this.ghostData.path.length >= 4) {
        this.ghostSprite = this.add.image(
          this.ghostData.path[0], this.ghostData.path[1], 'mouse'
        );
        this.ghostSprite.setAlpha(0.35).setTint(0x88ddff).setDepth(5);
        this.timerText.setText(`0.0s  (best ${(this.ghostData.time / 1000).toFixed(1)}s)`);
      }
    }

    // HUD - Level name on the right
    if (this.levelName) {
      this.add.text(784, 4, this.levelName, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#c0e8ff',
        fontStyle: 'italic'
      }).setOrigin(1, 0).setDepth(96);
    }

    // Aurora borealis on the late levels - the endgame should feel special
    if (!this.customLevel && this.currentLevel >= 7) {
      this.aurora = this.add.tileSprite(400, 80, 800, 80, 'aurora');
      this.aurora.setAlpha(0.4).setDepth(89);
      this.tweens.add({
        targets: this.aurora,
        tilePositionX: 320,
        duration: 24000,
        repeat: -1
      });
      this.tweens.add({
        targets: this.aurora,
        alpha: { from: 0.4, to: 0.55 },
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Ambient snowfall over everything (but under the HUD)
    this.snowParticles = this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: 800 },
      y: -8,
      lifespan: 14000,
      speedY: { min: 15, max: 45 },
      speedX: { min: -12, max: 12 },
      scale: { min: 0.4, max: 1 },
      alpha: { min: 0.4, max: 0.9 },
      frequency: 200
    });
    this.snowParticles.setDepth(90);

    // Track for slide sound
    this.lastSlideSound = 0;

    // Start background music (faint, looping)
    if (!this.sound.get('music')) {
      this.bgMusic = this.sound.add('music', { loop: true, volume: 0.09 });
      this.bgMusic.play();
    }

    // Testing from the painter: ESC hops straight back to the editor
    if (this.fromEditor) {
      this.add.text(784, 580, 'ESC: back to painter', {
        fontSize: '13px', fontFamily: 'Arial', color: '#88b8d8'
      }).setOrigin(1, 0.5).setDepth(96);
      this.input.keyboard.on('keydown-ESC', () => {
        this.scene.start('EditorScene', { level: this.customLevel });
      });
    }

    // Start countdown
    this.countdownActive = true;
    this.startCountdown();
  }

  startGoldenPulse() {
    // Enticing sparkle-pulse
    this.tweens.add({
      targets: this.goldenCheese,
      scale: { from: 1, to: 1.25 },
      angle: { from: -8, to: 8 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  startCountdown() {
    const { width, height } = this.scale;

    // Level name banner above the countdown
    let nameText = null;
    if (this.levelName) {
      nameText = this.add.text(width / 2, height / 2 - 90, this.levelName, {
        fontSize: '40px',
        fontFamily: 'Arial',
        color: '#c0e8ff',
        fontStyle: 'bold italic',
        stroke: '#204060',
        strokeThickness: 5
      }).setOrigin(0.5).setDepth(200);
      this.tweens.add({
        targets: nameText,
        scale: { from: 0, to: 1 },
        duration: 300,
        ease: 'Back.easeOut'
      });
    }

    // Create countdown text (starts hidden)
    this.countdownText = this.add.text(width / 2, height / 2, '', {
      fontSize: '96px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(200);

    // Freeze everyone during countdown
    this.setActorsEnabled(false);

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
            const targets = nameText ? [this.countdownText, nameText] : [this.countdownText];
            this.tweens.add({
              targets: targets,
              alpha: 0,
              scale: 2,
              duration: 200,
              onComplete: () => {
                this.countdownText.destroy();
                if (nameText) nameText.destroy();
                this.countdownActive = false;
                this.setActorsEnabled(true);
                // Start melting ice timers
                this.meltingTimersStarted = true;
                this.lastMeltingUpdate = this.time.now;
              }
            });
          });
        }
      }
    };

    // Small delay before starting countdown
    this.time.delayedCall(300, showNext);
  }

  setActorsEnabled(enabled) {
    this.mice.forEach(mouse => {
      if (!mouse.gagActive) mouse.body.enable = enabled;
    });
    this.bears.forEach(bear => bear.body.enable = enabled);
    this.penguins.forEach(penguin => penguin.body.enable = enabled);
    this.foxes.forEach(fox => fox.body.enable = enabled);
  }

  collectCheese(mouse, cheese) {
    if (!cheese.body.enable) return;
    cheese.body.enable = false;

    // Combo: cheeses grabbed in one clean slide get an escalating chime
    mouse.comboCount++;
    const combo = mouse.comboCount;
    this.sound.play('cheese', { rate: 1 + (combo - 1) * 0.12 });

    if (combo >= 2) {
      this.sound.play('wheee', { volume: 0.5, rate: 1 + (combo - 2) * 0.1 });
      this.starParticles.emitParticle(6, mouse.x, mouse.y);
      const label = combo === 2 ? 'Wheee!' : `Combo x${combo}!`;
      this.showFloatingText(mouse.x, mouse.y - 24, label, '#ffdd00');
    }

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

    if (this.chaseMode) {
      // Chase: every cheese is a point; the round ends when the pond is bare
      mouse.chaseScore++;
      this.updateChaseHud();
      if (this.cheeseCollected >= this.totalCheese) {
        this.endChase();
      }
    } else if (this.cheeseCollected >= this.totalCheese) {
      this.activateHole();
    }
  }

  collectGolden(mouse, golden) {
    if (this.goldenCollected || !golden.body.enable) return;
    this.goldenCollected = true;
    golden.body.enable = false;

    this.sound.play('golden', { volume: 0.7 });
    this.starParticles.emitParticle(12, golden.x, golden.y);
    this.showFloatingText(golden.x, golden.y - 24, 'Golden Cheese!', '#ffd700');

    // In a chase the golden cheese is a 3-point prize
    if (this.chaseMode) {
      mouse.chaseScore += 3;
      this.updateChaseHud();
    }

    if (this.hudStar) {
      this.hudStar.setAlpha(1);
      this.tweens.add({
        targets: this.hudStar,
        scale: { from: 1.8, to: 0.9 },
        angle: { from: 180, to: 0 },
        duration: 400,
        ease: 'Back.easeOut'
      });
    }

    this.tweens.killTweensOf(golden);
    this.tweens.add({
      targets: golden,
      scale: 2,
      alpha: 0,
      duration: 250,
      ease: 'Back.easeIn',
      onComplete: () => {
        golden.setVisible(false);
      }
    });
  }

  showFloatingText(x, y, str, color) {
    const text = this.add.text(x, y, str, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: color,
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      scale: 1.3,
      duration: 900,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  bounceOffWalrus(mouse, walrus) {
    if (mouse.gagActive) return;

    // Ping the mouse away from the walrus belly, pinball style
    const dx = mouse.x - walrus.x;
    const dy = mouse.y - walrus.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    mouse.applyBoost(dx / len, dy / len);

    this.sound.play('boing', { volume: 0.5 });
    this.sound.play('squeak', { volume: 0.3 });
    walrus.bonk();
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

    // Ghost race: a finished run becomes the new ghost if it's the best yet
    let runTime = null;
    let newBest = false;
    if (this.ghostEnabled) {
      this.runFinished = true;
      runTime = this.runElapsed;
      if (this.recordedPath.length >= 4) {
        newBest = saveGhostIfBest(this.currentLevel, runTime, this.recordedPath);
      }
    }

    this.tweens.add({
      targets: mouse,
      scale: 0,
      duration: 300,
      onComplete: () => {
        this.scene.start('LevelCompleteScene', {
          level: this.currentLevel,
          totalLevels: levels.length,
          totalResets: this.registry.get('totalResets'),
          startTime: this.registry.get('startTime'),
          goldenCollected: this.goldenCollected,
          runTime: runTime,
          newBest: newBest,
          customLevel: this.customLevel,
          fromEditor: this.fromEditor
        });
      }
    });
  }

  caughtByBear(mouse, bear) {
    if (this.isResetting || mouse.gagActive) return;

    // Increment total resets
    const resets = this.registry.get('totalResets') || 0;
    this.registry.set('totalResets', resets + 1);

    this.sound.play('caught');

    // Bear does a happy little "gotcha" pop
    this.tweens.add({
      targets: bear,
      scale: { from: 1.2, to: 1 },
      duration: 300,
      ease: 'Bounce.easeOut'
    });

    this.tweens.add({
      targets: this.flashOverlay,
      alpha: { from: 0.4, to: 0 },
      duration: 400,
      ease: 'Power2'
    });

    // The caught gag: dizzy spin, then a comedic boing back to the start.
    // Solo: the whole level resets. Co-op: only the caught mouse respawns.
    const soloReset = this.mice.length === 1;
    if (soloReset) this.isResetting = true;

    // A spin or boost mustn't fight the gag for control of the mouse
    this.tweens.killTweensOf(mouse);
    mouse.spinActive = false;
    this.dropFish(mouse);

    mouse.gagActive = true;
    mouse.body.enable = false;
    mouse.body.setVelocity(0, 0);

    // Dizzy stars over the mouse
    this.starParticles.emitParticle(5, mouse.x, mouse.y - 10);

    this.tweens.add({
      targets: mouse,
      angle: 720,
      scale: 0.8,
      duration: 550,
      ease: 'Power1',
      onComplete: () => {
        this.sound.play('boing', { volume: 0.6 });
        this.tweens.add({
          targets: mouse,
          x: mouse.spawnX,
          y: mouse.spawnY,
          angle: mouse.angle + 360,
          scale: 1,
          duration: 450,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            if (soloReset) {
              this.resetLevel();
            } else {
              mouse.setPosition(mouse.spawnX, mouse.spawnY);
              mouse.resetState();
              if (!this.countdownActive) mouse.body.enable = true;
            }
          }
        });
      }
    });
  }

  resetLevel() {
    this.mice.forEach(mouse => {
      this.tweens.killTweensOf(mouse);
      this.dropFish(mouse);
      mouse.setPosition(mouse.spawnX, mouse.spawnY);
      mouse.resetState();
      if (!this.countdownActive) mouse.body.enable = true;
    });

    this.bears.forEach(bear => bear.reset());
    this.penguins.forEach(penguin => penguin.reset());
    this.foxes.forEach(fox => fox.reset());

    // Ice blocks return to their starting tiles (plugged holes reopen below)
    this.setupIceBlocks();

    // Frozen fish return to their spots, ready to deliver again
    this.fishSpots.forEach(spot => {
      spot.delivered = false;
      spot.carriedBy = null;
      spot.sprite.setVisible(true);
      spot.sprite.body.enable = true;
    });

    // Burrow and spinner cooldowns clear
    this.burrowTiles.forEach(tile => { tile.lastWarp = []; });
    this.spinnerTiles.forEach(tile => { tile.lastSpin = []; });

    // The ghost race starts over - the star and the ghost want a clean run
    this.restartGhostRun();

    this.cheeses.clear(true, true);
    this.cheesePositions.forEach(pos => {
      this.cheeses.create(pos.x, pos.y, 'cheese');
    });

    this.cheeseCollected = 0;
    this.cheeseText.setText(`${this.cheeseCollected}/${this.totalCheese}`);

    // Golden cheese comes back too (the star must be earned in one clean run)
    if (this.goldenCheese) {
      this.goldenCollected = false;
      if (this.hudStar) this.hudStar.setAlpha(0.25);
      this.tweens.killTweensOf(this.goldenCheese);
      this.goldenCheese.setVisible(true);
      this.goldenCheese.setAlpha(1);
      this.goldenCheese.setScale(1);
      this.goldenCheese.body.enable = true;
      this.startGoldenPulse();
    }

    this.holeActive = false;
    this.tweens.killTweensOf(this.mouseHole);
    this.mouseHole.setScale(0.5);
    this.mouseHole.setAlpha(0.3);

    // Reset cracking ice tiles
    this.crackingIceTiles.forEach(tile => {
      tile.sprite.setTexture('cracking-ice');
      tile.sprite.setVisible(true);
      tile.sprite.setAlpha(1);
      tile.state = 0;
      tile.micePresent = [];
      if (tile.waterHole) {
        tile.waterHole.destroy();
        tile.waterHole = null;
      }
    });

    // Reset melting ice tiles (freeze them again)
    this.meltingIceTiles.forEach((tile, index) => {
      if (tile.shimmerTween) {
        tile.shimmerTween.stop();
        tile.shimmerTween = null;
      }
      tile.sprite.setTexture('melting-ice');
      tile.sprite.setVisible(true);
      tile.sprite.setAlpha(1);
      // Stagger timers: 15s, 18s, 21s, etc.
      tile.timeRemaining = 15000 + (index * 3000);
      tile.state = 0;
      if (tile.waterHole) {
        tile.waterHole.destroy();
        tile.waterHole = null;
      }
    });
    this.meltingTimersStarted = !this.countdownActive;
    this.lastMeltingUpdate = this.time.now;

    this.isResetting = false;
  }

  update(time, delta) {
    // Melting ice timers keep running even during resets
    this.updateMeltingIce(time);

    if (!this.isResetting && !this.countdownActive) {
      this.mice.forEach(mouse => mouse.update());
      this.bears.forEach(bear => bear.update(this.mice));
      this.penguins.forEach(penguin => penguin.update());
      this.foxes.forEach(fox => fox.update(this.mice, delta));

      this.mice.forEach(mouse => {
        if (mouse.gagActive) return;

        const speed = Math.sqrt(
          mouse.body.velocity.x ** 2 +
          mouse.body.velocity.y ** 2
        );

        if (speed > 100) {
          this.trailParticles.emitParticle(1, mouse.x, mouse.y);

          if (speed > 150 && time - this.lastSlideSound > 400) {
            this.sound.play('slide', { volume: 0.3 });
            this.lastSlideSound = time;
          }
        }
      });

      this.checkCrackingIce();
      this.checkSlush();
      this.checkStreaks(time);
      this.checkWind();
      this.checkSpinners(time);
      this.checkBurrows(time);
      this.checkFishDelivery();
      this.updateGhostRace(delta);
    }
  }

  // --- Pushable ice blocks ---

  setupIceBlocks() {
    this.iceBlocks.clear(true, true);
    this.blockStarts.forEach(pos => {
      const block = this.iceBlocks.create(pos.x, pos.y, 'ice-block');
      block.body.setImmovable(true);
      block.body.setSize(42, 42);
      block.setDepth(4);
      block.isMoving = false;
      block.isPlugged = false;
    });

    // Group-level colliders only need registering once
    if (!this.blockCollidersReady) {
      this.blockCollidersReady = true;
      this.physics.add.collider(this.iceBlocks, this.snowbanks,
        block => this.stopBlock(block));
      this.physics.add.collider(this.iceBlocks, this.iceBlocks, (a, b) => {
        this.stopBlock(a);
        this.stopBlock(b);
      });
      this.walruses.forEach(walrus => {
        this.physics.add.collider(this.iceBlocks, walrus,
          block => this.stopBlock(block));
      });
      // A block sliding over open water plugs the hole and refreezes the path
      this.physics.add.overlap(this.iceBlocks, this.waterHoles,
        (block, hole) => this.plugHole(block, hole));
    }
  }

  pushBlock(mouse, block) {
    if (block.isMoving || block.isPlugged || mouse.gagActive) return;
    if (mouse.prevSpeed < BLOCK_PUSH_MIN_SPEED) return;

    // Shove along the dominant axis of approach - blocks slide in cardinals
    const dx = block.x - mouse.x;
    const dy = block.y - mouse.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      block.body.setVelocity(Math.sign(dx) * BLOCK_SPEED, 0);
    } else {
      block.body.setVelocity(0, Math.sign(dy) * BLOCK_SPEED);
    }
    block.isMoving = true;
    this.sound.play('slide', { volume: 0.5 });
    this.trailParticles.emitParticle(3, block.x, block.y);
  }

  stopBlock(block) {
    if (!block.isMoving || block.isPlugged) return;
    block.isMoving = false;
    block.body.setVelocity(0, 0);

    // Snap to the tile grid so the puzzle stays tidy
    const col = Math.round((block.x - GRID_OFFSET_X - TILE_SIZE / 2) / TILE_SIZE);
    const row = Math.round((block.y - GRID_OFFSET_Y - TILE_SIZE / 2) / TILE_SIZE);
    block.setPosition(
      GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2,
      GRID_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2
    );

    this.sound.play('crack', { volume: 0.25 });
    this.tweens.add({
      targets: block,
      scaleX: { from: 1.08, to: 1 },
      scaleY: { from: 0.92, to: 1 },
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  plugHole(block, hole) {
    if (block.isPlugged) return;
    // Require a solid overlap so the block visually sits in the hole
    const dx = block.x - hole.x;
    const dy = block.y - hole.y;
    if (dx * dx + dy * dy > 24 * 24) return;

    block.isPlugged = true;
    block.isMoving = false;
    block.body.enable = false;

    // Clear the hole from whichever ice tile record owns it
    [...this.crackingIceTiles, ...this.meltingIceTiles].forEach(tile => {
      if (tile.waterHole === hole) {
        tile.waterHole = null;
        tile.state = 3; // plugged - stays safe until a full level reset
      }
    });
    hole.destroy();

    this.sound.play('plug', { volume: 0.7 });
    this.shardParticles.emitParticle(6, hole.x, hole.y);

    // The block settles into the water and freezes flat
    this.tweens.add({
      targets: block,
      x: hole.x,
      y: hole.y,
      scale: { from: 1.1, to: 1 },
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        block.setDepth(1);
        block.setAlpha(0.9);
        this.showFloatingText(hole.x, hole.y - 20, 'Plugged!', '#88ddff');
      }
    });
  }

  // --- Burrow tunnels ---

  checkBurrows(time) {
    this.burrowTiles.forEach(tile => {
      if (!tile.partner) return;

      this.mice.forEach(mouse => {
        if (mouse.gagActive || mouse.spinActive) return;

        const dx = mouse.x - tile.x;
        const dy = mouse.y - tile.y;
        if (dx * dx + dy * dy > TILE_TRIGGER_DIST * TILE_TRIGGER_DIST) return;

        const last = tile.lastWarp[mouse.playerIndex] || 0;
        if (time - last < BURROW_COOLDOWN) return;

        // Cooldown both ends so the mouse doesn't ping-pong forever
        tile.lastWarp[mouse.playerIndex] = time;
        tile.partner.lastWarp[mouse.playerIndex] = time;

        this.sound.play('warp', { volume: 0.5 });
        this.starParticles.emitParticle(4, tile.x, tile.y);

        // Pop through the tunnel with velocity intact
        mouse.setPosition(tile.partner.x, tile.partner.y);
        this.starParticles.emitParticle(4, tile.partner.x, tile.partner.y);
        this.tweens.add({
          targets: mouse,
          scale: { from: 0.3, to: 1 },
          duration: 200,
          ease: 'Back.easeOut'
        });
      });
    });
  }

  // --- Wind lanes ---

  checkWind() {
    this.mice.forEach(mouse => {
      mouse.windX = 0;
      mouse.windY = 0;
      if (mouse.gagActive) return;
      this.windTiles.forEach(tile => {
        if (
          Math.abs(mouse.x - tile.x) < SLUSH_HALF_EXTENT &&
          Math.abs(mouse.y - tile.y) < SLUSH_HALF_EXTENT
        ) {
          mouse.windX += tile.dx * WIND_FORCE;
          mouse.windY += tile.dy * WIND_FORCE;
        }
      });
    });
  }

  // --- Spinners ---

  checkSpinners(time) {
    this.spinnerTiles.forEach(tile => {
      this.mice.forEach(mouse => {
        if (mouse.gagActive || mouse.spinActive) return;

        const dx = mouse.x - tile.x;
        const dy = mouse.y - tile.y;
        if (dx * dx + dy * dy > TILE_TRIGGER_DIST * TILE_TRIGGER_DIST) return;

        const last = tile.lastSpin[mouse.playerIndex] || 0;
        if (time - last < SPIN_COOLDOWN) return;
        tile.lastSpin[mouse.playerIndex] = time;

        this.startSpin(mouse, tile);
      });
    });
  }

  startSpin(mouse, tile) {
    mouse.spinActive = true;
    mouse.setAcceleration(0);
    mouse.body.setVelocity(0, 0);
    this.sound.play('spin', { volume: 0.5 });

    // Suck the mouse to the center...
    this.tweens.add({
      targets: mouse,
      x: tile.x,
      y: tile.y,
      duration: 100
    });

    // ...whirl it up to speed, then fling it wherever it happens to face.
    // The exit direction depends on the entry angle, so every ride differs.
    this.tweens.add({
      targets: mouse,
      rotation: mouse.rotation + Math.PI * 4,
      duration: SPIN_DURATION,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        if (mouse.gagActive) {
          // A gag interrupted the spin; let the gag own the mouse
          mouse.spinActive = false;
          return;
        }
        mouse.spinActive = false;
        // Sprite art faces +y of travel: travel angle = rotation + 90deg
        const facing = mouse.rotation + Math.PI / 2;
        mouse.applyBoost(Math.cos(facing), Math.sin(facing));
        this.sound.play('wheee', { volume: 0.5, rate: 1.15 });
        this.trailParticles.emitParticle(6, mouse.x, mouse.y);
      }
    });
  }

  // --- Frozen fish delivery ---

  pickUpFish(mouse, spot) {
    if (spot.delivered || spot.carriedBy || mouse.carriedFish || mouse.gagActive) return;

    spot.carriedBy = mouse;
    spot.sprite.setVisible(false);
    spot.sprite.body.enable = false;

    mouse.carriedFish = this.add.image(mouse.x, mouse.y, 'fish').setDepth(7);
    mouse.fishSpot = spot;

    this.sound.play('squeak', { volume: 0.3 });
    this.showFloatingText(mouse.x, mouse.y - 24, 'Fish!', '#9fd4e8');
  }

  dropFish(mouse) {
    if (!mouse.carriedFish) return;
    const spot = mouse.fishSpot;

    mouse.carriedFish.destroy();
    mouse.carriedFish = null;
    mouse.fishSpot = null;

    // The fish skitters back to where it was frozen
    if (spot && !spot.delivered) {
      spot.carriedBy = null;
      spot.sprite.setVisible(true);
      spot.sprite.body.enable = true;
    }
  }

  checkFishDelivery() {
    if (this.penguins.length === 0) return;

    this.mice.forEach(mouse => {
      if (!mouse.carriedFish || mouse.gagActive) return;

      this.penguins.forEach(penguin => {
        if (!mouse.carriedFish) return;
        const dx = mouse.x - penguin.x;
        const dy = mouse.y - penguin.y;
        if (dx * dx + dy * dy > FISH_DELIVER_DIST * FISH_DELIVER_DIST) return;

        // Delivered! The penguin is thrilled.
        const spot = mouse.fishSpot;
        if (spot) spot.delivered = true;
        mouse.carriedFish.destroy();
        mouse.carriedFish = null;
        mouse.fishSpot = null;

        this.sound.play('chime', { volume: 0.7 });
        this.starParticles.emitParticle(10, penguin.x, penguin.y);
        this.showFloatingText(penguin.x, penguin.y - 28, 'Yum! Thanks!', '#66ddff');

        // Happy dance (scale only - the penguin's update owns rotation)
        this.tweens.add({
          targets: penguin,
          scale: { from: 1.35, to: 1 },
          duration: 500,
          ease: 'Bounce.easeOut'
        });
      });
    });
  }

  // --- Ghost race (solo adventure only) ---

  updateGhostRace(delta) {
    if (!this.ghostEnabled || this.runFinished) return;

    this.runElapsed += delta;

    const best = this.ghostData ? `  (best ${(this.ghostData.time / 1000).toFixed(1)}s)` : '';
    this.timerText.setText(`${(this.runElapsed / 1000).toFixed(1)}s${best}`);

    // Record this run's line
    while (this.runElapsed - this.lastSampleTime >= GHOST_SAMPLE_MS) {
      this.lastSampleTime += GHOST_SAMPLE_MS;
      this.recordedPath.push(this.mice[0].x, this.mice[0].y);
    }

    // Replay the best run's line
    if (this.ghostSprite) {
      const path = this.ghostData.path;
      const i = Math.floor(this.runElapsed / GHOST_SAMPLE_MS) * 2;
      if (i + 3 < path.length) {
        const frac = (this.runElapsed % GHOST_SAMPLE_MS) / GHOST_SAMPLE_MS;
        const x = path[i] + (path[i + 2] - path[i]) * frac;
        const y = path[i + 1] + (path[i + 3] - path[i + 1]) * frac;
        const dx = path[i + 2] - path[i];
        const dy = path[i + 3] - path[i + 1];
        if (dx * dx + dy * dy > 4) {
          this.ghostSprite.setRotation(Math.atan2(dy, dx) - Math.PI / 2);
        }
        this.ghostSprite.setPosition(x, y);
      } else if (path.length >= 2) {
        // Ghost finished - park it at its hole and fade
        this.ghostSprite.setPosition(path[path.length - 2], path[path.length - 1]);
        this.ghostSprite.setAlpha(0.15);
      }
    }
  }

  restartGhostRun() {
    if (!this.ghostEnabled) return;
    this.runElapsed = 0;
    this.lastSampleTime = 0;
    this.recordedPath = [];
    this.runFinished = false;
    if (this.ghostSprite) {
      this.ghostSprite.setAlpha(0.35);
      this.ghostSprite.setPosition(this.ghostData.path[0], this.ghostData.path[1]);
    }
  }

  // --- Cheese Chase ---

  updateChaseHud() {
    this.chaseText1.setText(String(this.mice[0].chaseScore));
    this.chaseText2.setText(String(this.mice[1].chaseScore));
  }

  endChase() {
    this.physics.pause();
    this.sound.play('level-complete');
    this.time.delayedCall(600, () => {
      this.scene.start('LevelCompleteScene', {
        mode: 'chase',
        level: this.currentLevel,
        totalLevels: levels.length,
        p1Score: this.mice[0].chaseScore,
        p2Score: this.mice[1].chaseScore
      });
    });
  }

  // --- Ambient under-ice fish ---

  createUnderIceFish() {
    for (let i = 0; i < 4; i++) {
      const y = 80 + Math.random() * 440;
      const fromLeft = i % 2 === 0;
      const fish = this.add.image(fromLeft ? -30 : 830, y, 'fish-shadow');
      fish.setAlpha(0.16);
      fish.setFlipX(!fromLeft);
      this.swimFish(fish, fromLeft);
    }
  }

  swimFish(fish, goingRight) {
    const duration = 14000 + Math.random() * 12000;
    fish.y = 80 + Math.random() * 440;
    this.tweens.add({
      targets: fish,
      x: goingRight ? 830 : -30,
      duration,
      delay: Math.random() * 6000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Turn around and cruise back the other way
        fish.setFlipX(goingRight);
        this.swimFish(fish, !goingRight);
      }
    });
    // Gentle vertical wandering
    this.tweens.add({
      targets: fish,
      y: fish.y + (Math.random() * 60 - 30),
      duration: duration / 3,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut'
    });
  }

  checkSlush() {
    this.mice.forEach(mouse => {
      if (mouse.gagActive) return;
      mouse.onSlush = this.slushTiles.some(tile =>
        Math.abs(mouse.x - tile.x) < SLUSH_HALF_EXTENT &&
        Math.abs(mouse.y - tile.y) < SLUSH_HALF_EXTENT
      );
    });
  }

  checkStreaks(time) {
    this.streakTiles.forEach(tile => {
      this.mice.forEach(mouse => {
        if (mouse.gagActive) return;

        const dx = mouse.x - tile.x;
        const dy = mouse.y - tile.y;
        if (dx * dx + dy * dy > TILE_TRIGGER_DIST * TILE_TRIGGER_DIST) return;

        const last = tile.lastBoost[mouse.playerIndex] || 0;
        if (time - last < STREAK_COOLDOWN) return;
        tile.lastBoost[mouse.playerIndex] = time;

        mouse.applyBoost(tile.dx, tile.dy);
        this.sound.play('boost', { volume: 0.5 });
        this.trailParticles.emitParticle(6, mouse.x, mouse.y);
      });
    });
  }

  updateMeltingIce(time) {
    if (!this.meltingTimersStarted) return;

    const deltaTime = time - this.lastMeltingUpdate;
    this.lastMeltingUpdate = time;

    this.meltingIceTiles.forEach(tile => {
      if (tile.state >= 2) return; // Already melted

      tile.timeRemaining -= deltaTime;

      // Warning state at 5 seconds
      if (tile.state === 0 && tile.timeRemaining <= 5000) {
        tile.state = 1;
        tile.sprite.setTexture('melting-ice-warning');

        // Add shimmer effect
        tile.shimmerTween = this.tweens.add({
          targets: tile.sprite,
          alpha: { from: 1, to: 0.7 },
          duration: 300,
          yoyo: true,
          repeat: -1
        });
      }

      // Melt at 0 seconds
      if (tile.timeRemaining <= 0) {
        this.meltTile(tile);
      }
    });
  }

  meltTile(tile) {
    // Stop shimmer
    if (tile.shimmerTween) {
      tile.shimmerTween.stop();
    }

    // Play splash sound
    this.sound.play('splash', { volume: 0.6 });

    // Emit particles
    this.shardParticles.emitParticle(6, tile.x, tile.y);

    // Hide melting ice sprite
    tile.sprite.setVisible(false);

    // Create water hole
    const waterHole = this.waterHoles.create(tile.x, tile.y, 'water-hole');
    waterHole.body.setSize(36, 36);
    waterHole.refreshBody();
    tile.waterHole = waterHole;
    tile.state = 2;

    // Splash animation
    this.tweens.add({
      targets: waterHole,
      scale: { from: 0.5, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  checkCrackingIce() {
    this.crackingIceTiles.forEach(tile => {
      if (tile.state >= 2) {
        // Water: once the mouse that broke it slides away, it turns deadly
        if (tile.waterHole && tile.waterHole.safeFor) {
          const creator = tile.waterHole.safeFor;
          const dx = creator.x - tile.x;
          const dy = creator.y - tile.y;
          if (dx * dx + dy * dy > TILE_TRIGGER_DIST * TILE_TRIGGER_DIST) {
            tile.waterHole.safeFor = null;
          }
        }
        return;
      }

      this.mice.forEach(mouse => {
        if (mouse.gagActive) return;

        const dx = mouse.x - tile.x;
        const dy = mouse.y - tile.y;
        const isOnTile = dx * dx + dy * dy < TILE_TRIGGER_DIST * TILE_TRIGGER_DIST;
        const wasOnTile = tile.micePresent.includes(mouse);

        if (isOnTile && !wasOnTile) {
          tile.micePresent.push(mouse);
          if (tile.state === 0) {
            this.crackTile(tile);
          } else if (tile.state === 1) {
            this.shatterTile(tile, mouse);
          }
        } else if (!isOnTile && wasOnTile) {
          tile.micePresent = tile.micePresent.filter(m => m !== mouse);
        }
      });
    });
  }

  crackTile(tile) {
    this.sound.play('crack');

    // Set state immediately to prevent race conditions
    tile.state = 1;

    // Flash the tile and change sprite
    this.tweens.add({
      targets: tile.sprite,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        tile.sprite.setTexture('cracked-ice');
      }
    });
  }

  shatterTile(tile, mouse) {
    this.sound.play('splash');

    // Emit ice shard particles
    this.shardParticles.emitParticle(8, tile.x, tile.y);

    // Hide cracked ice sprite
    tile.sprite.setVisible(false);

    // Create water hole - safe for the mouse that broke it until they slide away
    const waterHole = this.waterHoles.create(tile.x, tile.y, 'water-hole');
    waterHole.body.setSize(36, 36); // Slightly smaller hitbox
    waterHole.refreshBody();
    waterHole.safeFor = mouse;
    tile.waterHole = waterHole;
    tile.state = 2;

    // Splash animation on water hole
    this.tweens.add({
      targets: waterHole,
      scale: { from: 0.5, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  fallInWater(mouse, waterHole) {
    if (this.isResetting || mouse.gagActive) return;
    // If this water hole was just created by this mouse, they survive
    if (waterHole.safeFor === mouse) return;

    // Increment total resets
    const resets = this.registry.get('totalResets') || 0;
    this.registry.set('totalResets', resets + 1);

    this.sound.play('splash');

    // Blue flash for water
    this.flashOverlay.setFillStyle(0x0066aa);
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: { from: 0.4, to: 0 },
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.flashOverlay.setFillStyle(0xff0000); // Reset to red for bears
      }
    });

    const soloReset = this.mice.length === 1;
    if (soloReset) this.isResetting = true;

    this.tweens.killTweensOf(mouse);
    mouse.spinActive = false;
    this.dropFish(mouse);

    // Splash gag: swirl down the hole, then pop back at the start
    mouse.gagActive = true;
    mouse.body.enable = false;
    mouse.body.setVelocity(0, 0);

    this.tweens.add({
      targets: mouse,
      x: waterHole.x,
      y: waterHole.y,
      angle: 540,
      scale: 0,
      duration: 500,
      ease: 'Sine.easeIn',
      onComplete: () => {
        if (soloReset) {
          this.resetLevel();
        } else {
          this.sound.play('boing', { volume: 0.4 });
          mouse.setPosition(mouse.spawnX, mouse.spawnY);
          mouse.resetState();
          if (!this.countdownActive) mouse.body.enable = true;
        }
      }
    });
  }
}
