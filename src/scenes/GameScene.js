import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    console.log('GameScene started');

    // Asset preview - temporary
    this.add.text(400, 30, 'Asset Preview', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const assets = [
      { key: 'mouse', label: 'Mouse (24x24)' },
      { key: 'polar-bear', label: 'Polar Bear (40x40)' },
      { key: 'cheese', label: 'Cheese (16x16)' },
      { key: 'ice-tile', label: 'Ice Tile (48x48)' },
      { key: 'mouse-hole', label: 'Mouse Hole (32x32)' },
      { key: 'snowbank', label: 'Snowbank (48x48)' }
    ];

    assets.forEach((asset, i) => {
      const x = 200 + (i % 3) * 200;
      const y = 150 + Math.floor(i / 3) * 200;

      this.add.image(x, y, asset.key);
      this.add.text(x, y + 50, asset.label, {
        fontSize: '14px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
    });
  }
}
