import Phaser from 'phaser';
import levels from '../levels.js';
import { loadProgress, HATS, starCount, getSelectedHat, setSelectedHat } from '../progress.js';
import { levelFromUrl } from '../levelCodec.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Players chosen for the next game (level select uses this too).
    // selectedMode cycles 1 -> 2 -> 'chase' on the level-select toggle.
    this.selectedPlayers = this.registry.get('playerCount') || 1;
    this.selectedMode = this.selectedPlayers;
    this.sharedLevelPrompt = null;

    // Ice background - full opacity for icy look
    for (let x = 0; x < width; x += 48) {
      for (let y = 0; y < height; y += 48) {
        this.add.image(x + 24, y + 24, 'ice-tile');
      }
    }

    // Frosty overlay for depth
    this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.15);

    // Gentle snowfall on the menu too
    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: width },
      y: -8,
      lifespan: 14000,
      speedY: { min: 15, max: 45 },
      speedX: { min: -12, max: 12 },
      scale: { min: 0.4, max: 1 },
      alpha: { min: 0.4, max: 0.9 },
      frequency: 180
    });

    // Title with icy shadow
    this.add.text(width / 2 + 3, height / 2 - 147, 'Ice Mice', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#4080a0',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.5);

    const title = this.add.text(width / 2, height / 2 - 150, 'Ice Mice', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add icy shimmer to title
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.85 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(width / 2, height / 2 - 90, 'A slippery adventure!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#c0e8ff',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Main menu container
    this.mainMenu = this.add.container(0, 0);
    this.levelSelect = this.add.container(0, 0);
    this.levelSelect.setVisible(false);

    // --- Main Menu ---

    // 1 Player button
    const onePlayerButton = this.createButton(width / 2, height / 2 - 30, '1 Player', () => {
      this.startGame(0, 1);
    });
    this.mainMenu.add(onePlayerButton);

    // 2 Players button (arrows vs WASD on one keyboard)
    const twoPlayerButton = this.createButton(width / 2, height / 2 + 25, '2 Players', () => {
      this.startGame(0, 2);
    });
    this.mainMenu.add(twoPlayerButton);

    // Cheese Chase: 2P race for the most cheese
    const chaseButton = this.createButton(width / 2, height / 2 + 80, 'Cheese Chase', () => {
      this.startGame(0, 2, 'chase');
    });
    this.mainMenu.add(chaseButton);

    const coopHint = this.add.text(width / 2, height / 2 + 112, 'P1: arrow keys    P2: WASD', {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#88b8d8'
    }).setOrigin(0.5);
    this.mainMenu.add(coopHint);

    // Select Level and Level Painter side by side
    const selectButton = this.createButton(width / 2 - 110, height / 2 + 150, 'Select Level', () => {
      this.showLevelSelect();
    });
    selectButton.list[1].setFontSize(22);
    this.mainMenu.add(selectButton);

    const painterButton = this.createButton(width / 2 + 110, height / 2 + 150, 'Level Painter', () => {
      this.scene.start('EditorScene');
    });
    painterButton.list[1].setFontSize(22);
    this.mainMenu.add(painterButton);

    // Hat rack: cosmetics earned with golden-cheese stars
    this.createHatRack(width / 2, height / 2 + 205);

    // "Press any key" text with pulsing animation
    const pressKeyText = this.add.text(width / 2, height / 2 + 248, 'Press any key for 1 Player', {
      fontSize: '15px',
      fontFamily: 'Arial',
      color: '#a0d0ff'
    }).setOrigin(0.5);
    this.mainMenu.add(pressKeyText);

    this.tweens.add({
      targets: pressKeyText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Allow any key to start game (only when main menu visible)
    this.input.keyboard.on('keydown', () => {
      if (this.mainMenu.visible && !this.sharedLevelPrompt) {
        this.startGame(0, 1);
      }
    });

    // A friend's painted level arrived via the URL? Offer to play it.
    const sharedLevel = levelFromUrl();
    if (sharedLevel) {
      this.showSharedLevelPrompt(sharedLevel);
    }

    // --- Level Select ---

    // Back button
    const backButton = this.createButton(width / 2, height / 2 + 272, 'Back', () => {
      this.showMainMenu();
    });
    backButton.list[0].setSize(200, 40);
    backButton.list[1].setFontSize(22);
    this.levelSelect.add(backButton);

    // Level select title
    const selectTitle = this.add.text(width / 2, height / 2 - 110, 'Select Level', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.levelSelect.add(selectTitle);

    // Mode toggle for level select: 1 Player -> 2 Players -> Cheese Chase
    this.modeToggle = this.createButton(width / 2, height / 2 - 65, this.modeLabel(), () => {
      if (this.selectedMode === 1) this.selectedMode = 2;
      else if (this.selectedMode === 2) this.selectedMode = 'chase';
      else this.selectedMode = 1;
      if (this.selectedMode !== 'chase') this.selectedPlayers = this.selectedMode;
      this.modeToggleLabel.setText(this.modeLabel());
    });
    // createButton returns a container: [bg, label]
    this.modeToggleLabel = this.modeToggle.list[1];
    this.modeToggle.list[0].setSize(220, 40);
    this.modeToggleLabel.setFontSize(20);
    this.levelSelect.add(this.modeToggle);

    // Level buttons grid (5 rows of 5) with beaten checkmarks + golden stars
    const progress = loadProgress();
    const totalLevels = levels.length;
    const buttonsPerRow = 5;
    const colSpacing = 75;
    const rowSpacing = 56;
    const startX = width / 2 - (buttonsPerRow - 1) * colSpacing / 2;
    const startY = height / 2 - 15;

    for (let i = 0; i < totalLevels; i++) {
      const row = Math.floor(i / buttonsPerRow);
      const col = i % buttonsPerRow;
      const x = startX + col * colSpacing;
      const y = startY + row * rowSpacing;

      const levelBtn = this.createLevelButton(x, y, i + 1, !!progress.beaten[i], !!progress.stars[i], () => {
        if (this.selectedMode === 'chase') {
          this.startGame(i, 2, 'chase');
        } else {
          this.startGame(i, this.selectedPlayers);
        }
      });
      this.levelSelect.add(levelBtn);
    }

    // Sliding mouse animation (along the very bottom, under the hat rack)
    this.slidingMouse = this.add.image(-50, height - 25, 'mouse');
    this.slidingMouse.setScale(1.5);
    this.createSlideAnimation();

    // Decorative cheese pieces
    this.add.image(120, 100, 'cheese').setScale(1.2).setAngle(-15);
    this.add.image(680, 520, 'cheese').setScale(1.2).setAngle(20);
    this.add.image(700, 120, 'cheese').setScale(0.8).setAngle(10);
    this.add.image(100, 450, 'cheese').setScale(0.9).setAngle(-10);

    // Decorative snowbanks
    this.add.image(60, 550, 'snowbank').setScale(0.7).setAlpha(0.8);
    this.add.image(740, 60, 'snowbank').setScale(0.5).setAlpha(0.8);
    this.add.image(750, 550, 'snowbank').setScale(0.6).setAlpha(0.8);

    // Decorative sleeping walrus + penguin, a preview of friends to come
    this.add.image(720, 320, 'walrus').setScale(0.9);
    this.add.image(80, 250, 'penguin').setScale(1.3).setAngle(-20);
  }

  modeLabel() {
    if (this.selectedMode === 'chase') return 'Mode: Cheese Chase';
    return this.selectedMode === 1 ? 'Mode: 1 Player' : 'Mode: 2 Players';
  }

  createButton(x, y, text, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 200, 50, 0x2080b0, 0.9);
    bg.setStrokeStyle(2, 0x60c0e0);

    const label = this.add.text(0, 0, text, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(200, 50);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setFillStyle(0x40a0d0, 1);
      container.setScale(1.05);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x2080b0, 0.9);
      container.setScale(1);
    });

    container.on('pointerdown', callback);

    return container;
  }

  createLevelButton(x, y, levelNum, beaten, starred, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 48, 48, beaten ? 0x28a060 : 0x2080b0, 0.9);
    bg.setStrokeStyle(2, beaten ? 0x70e0a0 : 0x60c0e0);

    const label = this.add.text(0, 0, String(levelNum), {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, label]);

    // Golden cheese star badge
    if (starred) {
      const star = this.add.image(17, -17, 'star').setScale(0.8);
      container.add(star);
    }

    container.setSize(48, 48);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setFillStyle(beaten ? 0x38c078 : 0x40a0d0, 1);
      container.setScale(1.1);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(beaten ? 0x28a060 : 0x2080b0, 0.9);
      container.setScale(1);
    });

    container.on('pointerdown', callback);

    return container;
  }

  showLevelSelect() {
    this.mainMenu.setVisible(false);
    this.levelSelect.setVisible(true);
  }

  showMainMenu() {
    this.levelSelect.setVisible(false);
    this.mainMenu.setVisible(true);
  }

  startGame(level, players, mode) {
    this.registry.set('playerCount', players);
    this.scene.start('GameScene', { level: level, players: players, mode: mode });
  }

  // Hat rack: pick a hat for Player 1's mouse. Hats unlock at star milestones.
  createHatRack(cx, cy) {
    const stars = starCount();
    const rack = this.add.container(0, 0);
    this.mainMenu.add(rack);

    rack.add(this.add.text(cx - 185, cy, 'Hats:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#c0e8ff',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    rack.add(this.add.image(cx + 168, cy - 1, 'star').setScale(0.8));
    rack.add(this.add.text(cx + 180, cy, `${stars}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5));

    const slots = [{ key: null, name: 'None', stars: 0 }, ...HATS];
    this.hatHighlights = [];
    const spacing = 52;
    const startX = cx - 135;

    slots.forEach((slot, i) => {
      const x = startX + i * spacing;
      const unlocked = stars >= slot.stars;
      const selected = getSelectedHat() === slot.key;

      const bg = this.add.rectangle(x, cy, 42, 42, 0x1a5a80, unlocked ? 0.85 : 0.35);
      bg.setStrokeStyle(2, selected ? 0xffd700 : 0x60c0e0);
      rack.add(bg);
      this.hatHighlights.push({ bg, key: slot.key });

      if (slot.key) {
        const icon = this.add.image(x, cy, slot.key).setScale(1.4);
        if (!unlocked) icon.setAlpha(0.35).setTint(0x334455);
        rack.add(icon);
      } else {
        rack.add(this.add.text(x, cy, '∅', {
          fontSize: '18px', fontFamily: 'Arial', color: '#88b8d8'
        }).setOrigin(0.5));
      }

      if (!unlocked) {
        rack.add(this.add.text(x, cy + 15, `★${slot.stars}`, {
          fontSize: '11px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5));
      }

      bg.setInteractive({ useHandCursor: unlocked });
      bg.on('pointerdown', () => {
        if (!unlocked) return;
        setSelectedHat(slot.key);
        this.hatHighlights.forEach(h => {
          h.bg.setStrokeStyle(2, h.key === slot.key ? 0xffd700 : 0x60c0e0);
        });
      });
    });
  }

  // A painted level arrived in the URL - offer to play it
  showSharedLevelPrompt(sharedLevel) {
    const { width, height } = this.scale;
    const prompt = this.add.container(0, 0).setDepth(200);
    this.sharedLevelPrompt = prompt;

    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    dim.setInteractive(); // swallow clicks behind the dialog
    prompt.add(dim);

    const panel = this.add.rectangle(width / 2, height / 2, 420, 220, 0x123a55, 0.97);
    panel.setStrokeStyle(3, 0x60c0e0);
    prompt.add(panel);

    prompt.add(this.add.text(width / 2, height / 2 - 70, 'A painted level arrived!', {
      fontSize: '26px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5));

    prompt.add(this.add.text(width / 2, height / 2 - 35,
      `"${(sharedLevel.name || 'Mystery Pond').slice(0, 28)}"`, {
        fontSize: '20px', fontFamily: 'Arial', color: '#c0e8ff', fontStyle: 'italic'
      }).setOrigin(0.5));

    const playBtn = this.createButton(width / 2, height / 2 + 15, 'Play It!', () => {
      this.registry.set('playerCount', 1);
      this.scene.start('GameScene', { customLevel: sharedLevel, players: 1 });
    });
    prompt.add(playBtn);

    const dismissBtn = this.createButton(width / 2, height / 2 + 72, 'Maybe Later', () => {
      // Clear the hash so the prompt doesn't reappear every visit
      window.history.replaceState(null, '', window.location.pathname);
      prompt.destroy();
      this.sharedLevelPrompt = null;
    });
    dismissBtn.list[0].setSize(200, 40);
    dismissBtn.list[1].setFontSize(20);
    prompt.add(dismissBtn);
  }

  createSlideAnimation() {
    const { width, height } = this.scale;

    this.tweens.add({
      targets: this.slidingMouse,
      x: width + 50,
      duration: 3000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.slidingMouse.x = -50;
        this.slidingMouse.y = height - 35 + Math.random() * 20;
        this.createSlideAnimation();
      }
    });

    this.tweens.add({
      targets: this.slidingMouse,
      angle: { from: -10, to: 10 },
      duration: 200,
      yoyo: true,
      repeat: 14
    });
  }
}
