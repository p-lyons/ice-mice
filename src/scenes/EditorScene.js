import Phaser from 'phaser';
import { encodeLevel } from '../levelCodec.js';

// The Level Painter: click tiles onto the 16x12 grid, test-play instantly,
// and share finished ponds as a copy-paste link. Bear/penguin patrol paths
// and fox pounce targets are derived automatically so kids never have to
// think about waypoints.

const COLS = 16;
const ROWS = 12;
const CELL = 40; // editor display size (game tiles are 48)
const GRID_X = 80; // top-left of the paint area
const GRID_Y = 34;

// Game-space placement, matching levels.js (48px tiles, 16/24 offset)
function gameGridToPixel(col, row) {
  return { x: 16 + col * 48 + 24, y: 24 + row * 48 + 24 };
}

// Palette entries: what you can paint. Angles rotate directional tiles.
const PALETTE = [
  { code: 0, texture: 'ice-tile', label: 'Eraser (ice)' },
  { code: 1, texture: 'snowbank', label: 'Snowbank wall' },
  { code: 2, texture: 'cheese', label: 'Cheese' },
  { code: 8, texture: 'golden-cheese', label: 'Golden cheese' },
  { code: 4, texture: 'mouse', label: 'Mouse start (need 1)' },
  { code: 3, texture: 'mouse-hole', label: 'Exit hole (need 1)' },
  { code: 5, texture: 'polar-bear', label: 'Bear (patrols on its own)' },
  { code: 23, texture: 'fox', label: 'Fox (picks its own pounce spot)' },
  { code: 6, texture: 'cracking-ice', label: 'Cracking ice' },
  { code: 7, texture: 'melting-ice', label: 'Melting ice' },
  { code: 9, texture: 'walrus', label: 'Walrus bumper' },
  { code: 15, texture: 'penguin', label: 'Penguin friend' },
  { code: 24, texture: 'otter', label: 'Otter pool' },
  { code: 25, texture: 'fish', label: 'Frozen fish (penguin snack)' },
  { code: 16, texture: 'ice-block', label: 'Pushable ice block' },
  { code: 17, texture: 'burrow', label: 'Burrow (paint them in pairs!)' },
  { code: 18, texture: 'spinner', label: 'Spinner' },
  { code: 14, texture: 'slush', label: 'Slush (brakes)' },
  { code: 10, texture: 'speed-streak', label: 'Speed streak right', angle: 0 },
  { code: 11, texture: 'speed-streak', label: 'Speed streak left', angle: 180 },
  { code: 12, texture: 'speed-streak', label: 'Speed streak up', angle: -90 },
  { code: 13, texture: 'speed-streak', label: 'Speed streak down', angle: 90 },
  { code: 19, texture: 'wind-tile', label: 'Wind right', angle: 0 },
  { code: 20, texture: 'wind-tile', label: 'Wind left', angle: 180 },
  { code: 21, texture: 'wind-tile', label: 'Wind up', angle: -90 },
  { code: 22, texture: 'wind-tile', label: 'Wind down', angle: 90 }
];

// Solid tiles that patrols and pounces can't pass through
const BLOCKERS = new Set([1, 9, 16]);

export default class EditorScene extends Phaser.Scene {
  constructor() {
    super('EditorScene');
  }

  init(data) {
    if (data && data.level && data.level.grid) {
      this.grid = data.level.grid.map(row => [...row]);
      this.levelName = data.level.name || 'My Pond';
    } else {
      this.grid = this.blankGrid();
      this.levelName = 'My Pond';
    }
  }

  blankGrid() {
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        row.push(r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1 ? 1 : 0);
      }
      grid.push(row);
    }
    // Friendly starting point: a mouse, an exit, and one cheese
    grid[1][1] = 4;
    grid[10][14] = 3;
    grid[5][8] = 2;
    return grid;
  }

  create() {
    const { width } = this.scale;
    this.selected = PALETTE[1]; // start with walls, the most-painted tile
    this.cellImages = [];

    this.add.rectangle(400, 300, 800, 600, 0x0d2c40);

    // Title / name bar
    this.nameText = this.add.text(16, 8, `Painting: "${this.levelName}"`, {
      fontSize: '16px', fontFamily: 'Arial', color: '#c0e8ff', fontStyle: 'bold italic'
    });

    this.makeTopButton(width - 330, 'Rename', () => this.rename());
    this.makeTopButton(width - 250, 'Clear', () => this.clearGrid());
    this.makeTopButton(width - 180, 'Test ▶', () => this.testLevel());
    this.makeTopButton(width - 105, 'Share', () => this.shareLevel());
    this.makeTopButton(width - 45, 'Menu', () => this.scene.start('MenuScene'));

    // Paint grid: ice base + overlay per cell
    for (let r = 0; r < ROWS; r++) {
      this.cellImages.push([]);
      for (let c = 0; c < COLS; c++) {
        const { x, y } = this.cellCenter(c, r);
        this.add.image(x, y, 'ice-tile').setDisplaySize(CELL, CELL).setAlpha(0.85);
        this.cellImages[r].push(null);
        this.renderCell(r, c);
      }
    }

    // Grid frame
    this.add.rectangle(
      GRID_X + (COLS * CELL) / 2, GRID_Y + (ROWS * CELL) / 2,
      COLS * CELL + 4, ROWS * CELL + 4
    ).setStrokeStyle(2, 0x60c0e0);

    // Painting input: left paints, right erases, drag works for both
    this.input.mouse.disableContextMenu();
    this.input.on('pointerdown', pointer => this.paintAt(pointer));
    this.input.on('pointermove', pointer => {
      if (pointer.isDown) this.paintAt(pointer);
    });

    // Palette strip along the bottom
    this.paletteHighlights = [];
    PALETTE.forEach((entry, i) => {
      const x = 26 + i * 29;
      const y = 545;
      const bg = this.add.rectangle(x, y, 27, 27, 0x1a5a80, 0.9);
      bg.setStrokeStyle(2, entry === this.selected ? 0xffd700 : 0x3a7a9a);
      const icon = this.add.image(x, y, entry.texture).setDisplaySize(23, 23);
      if (entry.angle) icon.setAngle(entry.angle);
      this.paletteHighlights.push({ bg, entry });

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.selected = entry;
        this.selectedLabel.setText(entry.label);
        this.paletteHighlights.forEach(h => {
          h.bg.setStrokeStyle(2, h.entry === entry ? 0xffd700 : 0x3a7a9a);
        });
      });
    });

    this.selectedLabel = this.add.text(width / 2, 572, this.selected.label, {
      fontSize: '15px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 592, 'Left click: paint    Right click: erase    Bears & foxes find their own paths', {
      fontSize: '12px', fontFamily: 'Arial', color: '#88b8d8'
    }).setOrigin(0.5);
  }

  cellCenter(col, row) {
    return { x: GRID_X + col * CELL + CELL / 2, y: GRID_Y + row * CELL + CELL / 2 };
  }

  makeTopButton(x, label, callback) {
    const btn = this.add.text(x, 8, label, {
      fontSize: '15px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#2080b0',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#40a0d0' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#2080b0' }));
    btn.on('pointerdown', callback);
    return btn;
  }

  paintAt(pointer) {
    const col = Math.floor((pointer.x - GRID_X) / CELL);
    const row = Math.floor((pointer.y - GRID_Y) / CELL);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;

    const code = pointer.rightButtonDown() ? 0 : this.selected.code;

    // Start, exit, and golden cheese are one-per-level - painting a new one moves it
    if (code === 4 || code === 3 || code === 8) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (this.grid[r][c] === code) {
            this.grid[r][c] = 0;
            this.renderCell(r, c);
          }
        }
      }
    }

    if (this.grid[row][col] === code) return;
    this.grid[row][col] = code;
    this.renderCell(row, col);
  }

  renderCell(row, col) {
    const old = this.cellImages[row][col];
    if (old) {
      old.destroy();
      this.cellImages[row][col] = null;
    }
    const code = this.grid[row][col];
    if (code === 0) return;

    const entry = PALETTE.find(p => p.code === code);
    if (!entry) return;

    const { x, y } = this.cellCenter(col, row);
    const icon = this.add.image(x, y, entry.texture);
    // Full tiles fill the cell; small sprites keep their relative size
    const isFullTile = [1, 6, 7, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22].includes(code);
    if (isFullTile) {
      icon.setDisplaySize(CELL, CELL);
    } else {
      icon.setScale(CELL / 48);
    }
    if (entry.angle) icon.setAngle(entry.angle);
    this.cellImages[row][col] = icon;
  }

  clearGrid() {
    this.grid = this.blankGrid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.renderCell(r, c);
      }
    }
  }

  rename() {
    const name = window.prompt('Name your pond:', this.levelName);
    if (name) {
      this.levelName = name.slice(0, 28);
      this.nameText.setText(`Painting: "${this.levelName}"`);
    }
  }

  // --- Building a playable level from the painted grid ---

  // Longest open run through a tile decides the patrol: horizontal if the
  // row run is at least as long, else vertical. Single tiles just stand still.
  derivePatrol(col, row) {
    let left = col;
    while (left - 1 >= 0 && !BLOCKERS.has(this.grid[row][left - 1])) left--;
    let right = col;
    while (right + 1 < COLS && !BLOCKERS.has(this.grid[row][right + 1])) right++;
    let top = row;
    while (top - 1 >= 0 && !BLOCKERS.has(this.grid[top - 1][col])) top--;
    let bottom = row;
    while (bottom + 1 < ROWS && !BLOCKERS.has(this.grid[bottom + 1][col])) bottom++;

    if (right - left >= bottom - top && right - left >= 1) {
      return [gameGridToPixel(left, row), gameGridToPixel(right, row)];
    }
    if (bottom - top >= 1) {
      return [gameGridToPixel(col, top), gameGridToPixel(col, bottom)];
    }
    return [gameGridToPixel(col, row)];
  }

  // Fox pounce target: 3 tiles down the most open direction (clamped shorter
  // if something solid is in the way)
  deriveFoxTarget(col, row) {
    const dirs = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];
    let best = { col, row, dist: 0 };
    dirs.forEach(dir => {
      let c = col;
      let r = row;
      let dist = 0;
      for (let step = 0; step < 3; step++) {
        const nc = c + dir.dx;
        const nr = r + dir.dy;
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) break;
        if (BLOCKERS.has(this.grid[nr][nc])) break;
        c = nc;
        r = nr;
        dist++;
      }
      if (dist > best.dist) best = { col: c, row: r, dist };
    });
    return gameGridToPixel(best.col, best.row);
  }

  buildLevel() {
    const bears = [];
    const penguins = [];
    const foxes = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const code = this.grid[r][c];
        if (code === 5) bears.push(this.derivePatrol(c, r));
        if (code === 15) penguins.push(this.derivePatrol(c, r));
        if (code === 23) foxes.push(this.deriveFoxTarget(c, r));
      }
    }
    return {
      name: this.levelName,
      grid: this.grid.map(row => [...row]),
      bears,
      penguins,
      foxes
    };
  }

  validate() {
    const flat = this.grid.flat();
    if (!flat.includes(4)) return 'Paint a mouse start first!';
    if (!flat.includes(3)) return 'Paint an exit hole first!';
    if (!flat.includes(2)) return 'Add at least one cheese!';
    const burrows = flat.filter(t => t === 17).length;
    if (burrows % 2 !== 0) return 'Burrows need a partner - paint them in pairs!';
    return null;
  }

  showToast(message, color = '#ff8888') {
    const toast = this.add.text(400, 300, message, {
      fontSize: '26px',
      fontFamily: 'Arial',
      color: color,
      fontStyle: 'bold',
      backgroundColor: '#0d2c40ee',
      padding: { x: 18, y: 12 }
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: 270,
      delay: 1300,
      duration: 500,
      onComplete: () => toast.destroy()
    });
  }

  testLevel() {
    const problem = this.validate();
    if (problem) {
      this.showToast(problem);
      return;
    }
    this.registry.set('playerCount', 1);
    this.scene.start('GameScene', {
      customLevel: this.buildLevel(),
      players: 1,
      fromEditor: true
    });
  }

  shareLevel() {
    const problem = this.validate();
    if (problem) {
      this.showToast(problem);
      return;
    }
    const encoded = encodeLevel(this.buildLevel());
    const url = `${window.location.origin}${window.location.pathname}#level=${encoded}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        () => this.showToast('Link copied! Send it to a friend!', '#88ff88'),
        () => window.prompt('Copy this link:', url)
      );
    } else {
      window.prompt('Copy this link:', url);
    }
  }
}
