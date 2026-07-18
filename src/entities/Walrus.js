import Phaser from 'phaser';

const BODY_RADIUS = 26;
const WAKE_DURATION = 900; // ms the walrus stays startled after a bonk

export default class Walrus extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'walrus');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    this.body.setCircle(BODY_RADIUS, 32 - BODY_RADIUS, 32 - BODY_RADIUS);
    this.setDepth(5);

    this.shadow = scene.add.ellipse(x, y + 18, 52, 16, 0x000000, 0.2);
    this.shadow.setDepth(4);

    // Floating "Zzz" while asleep
    this.zzzText = scene.add.text(x + 24, y - 24, 'Zzz', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#6688aa',
      fontStyle: 'bold italic'
    }).setOrigin(0.5).setDepth(50);

    this.zzzTween = scene.tweens.add({
      targets: this.zzzText,
      y: y - 34,
      alpha: { from: 1, to: 0.2 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.wakeTimer = null;
  }

  // Called when a mouse pings off the belly
  bonk() {
    this.setTexture('walrus-awake');
    this.zzzText.setVisible(false);

    // Startled jiggle
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1.08, to: 1 },
      scaleY: { from: 0.92, to: 1 },
      duration: 200,
      ease: 'Bounce.easeOut'
    });

    if (this.wakeTimer) this.wakeTimer.remove();
    this.wakeTimer = this.scene.time.delayedCall(WAKE_DURATION, () => {
      this.setTexture('walrus');
      this.zzzText.setVisible(true);
      this.wakeTimer = null;
    });
  }
}
