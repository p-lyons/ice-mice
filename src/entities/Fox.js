import Phaser from 'phaser';

const SLEEP_DURATION = 2600; // ms snoozing at the den (harmless)
const TELEGRAPH_DURATION = 1100; // ms of crouch + yip before the pounce
const POUNCE_DURATION = 450; // ms in the air
const SNIFF_DURATION = 900; // ms sniffing around the landing spot
const TROT_SPEED = 110; // return-to-den speed, a touch faster than bears

// The fox is a TIMING hazard where bears are a ROUTING hazard.
// Cycle: sleep at den -> yawn/crouch telegraph -> pounce onto a fixed,
// paw-print-marked tile -> sniff -> trot home -> sleep. The rhythm never
// changes, so kids can learn it like a crosswalk. Only the pounce, sniff,
// and trot are dangerous; a sleeping or stretching fox is safe to pass.
export default class Fox extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, targetX, targetY) {
    super(scene, x, y, 'fox-sleep');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    this.body.setSize(26, 26);
    this.setDepth(5);

    this.denX = x;
    this.denY = y;
    this.targetX = targetX;
    this.targetY = targetY;

    this.shadow = scene.add.ellipse(x, y + 12, 30, 10, 0x000000, 0.2);
    this.shadow.setDepth(4);

    // Permanent paw-print marker so the pounce spot is always readable
    this.targetMarker = scene.add.image(targetX, targetY, 'paw-target');
    this.targetMarker.setDepth(1).setAlpha(0.7);

    // Zzz while sleeping (same language as the walrus)
    this.zzzText = scene.add.text(x + 20, y - 20, 'Zzz', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#c07840',
      fontStyle: 'bold italic'
    }).setOrigin(0.5).setDepth(50);
    this.zzzTween = scene.tweens.add({
      targets: this.zzzText,
      y: y - 30,
      alpha: { from: 1, to: 0.2 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.state = 'sleep';
    this.stateTimer = SLEEP_DURATION;

    // Face the pounce target so the aim is readable even while asleep
    this.rotation = Math.atan2(targetY - y, targetX - x) - Math.PI / 2;
    this.pounceTween = null;
  }

  // Only the airborne/landed/trotting fox can catch a mouse
  isDangerous() {
    return this.state === 'pounce' || this.state === 'sniff' || this.state === 'return';
  }

  update(_mice, delta) {
    this.shadow.setPosition(this.x, this.y + 12);
    this.zzzText.setPosition(this.x + 20, this.y - 20);

    this.stateTimer -= delta;

    switch (this.state) {
      case 'sleep':
        if (this.stateTimer <= 0) this.startTelegraph();
        break;

      case 'telegraph':
        if (this.stateTimer <= 0) this.startPounce();
        break;

      case 'pounce':
        // Movement handled by the tween
        break;

      case 'sniff':
        if (this.stateTimer <= 0) this.startReturn();
        break;

      case 'return': {
        const dx = this.denX - this.x;
        const dy = this.denY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 6) {
          this.startSleep();
        } else {
          const angle = Math.atan2(dy, dx);
          this.body.setVelocity(Math.cos(angle) * TROT_SPEED, Math.sin(angle) * TROT_SPEED);
          this.rotation = angle - Math.PI / 2;
        }
        break;
      }
    }
  }

  startSleep() {
    this.state = 'sleep';
    this.stateTimer = SLEEP_DURATION;
    this.body.setVelocity(0, 0);
    this.setPosition(this.denX, this.denY);
    this.setTexture('fox-sleep');
    this.zzzText.setVisible(true);
    this.rotation = Math.atan2(this.targetY - this.y, this.targetX - this.x) - Math.PI / 2;
  }

  startTelegraph() {
    this.state = 'telegraph';
    this.stateTimer = TELEGRAPH_DURATION;
    this.setTexture('fox');
    this.zzzText.setVisible(false);
    this.scene.sound.play('yip', { volume: 0.5 });

    // Crouch: squash down and wiggle like a cat about to pounce
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 1.15 },
      scaleY: { from: 1, to: 0.85 },
      duration: 140,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut'
    });

    // Paw marker flashes urgently while the pounce is incoming
    this.markerTween = this.scene.tweens.add({
      targets: this.targetMarker,
      alpha: { from: 0.7, to: 1 },
      scale: { from: 1, to: 1.3 },
      duration: 180,
      yoyo: true,
      repeat: -1
    });
  }

  startPounce() {
    this.state = 'pounce';

    if (this.markerTween) {
      this.markerTween.stop();
      this.markerTween = null;
      this.targetMarker.setAlpha(0.7);
      this.targetMarker.setScale(1);
    }

    // Leap: tween the arc (the physics body follows the sprite)
    this.pounceTween = this.scene.tweens.add({
      targets: this,
      x: this.targetX,
      y: this.targetY,
      duration: POUNCE_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.pounceTween = null;
        this.state = 'sniff';
        this.stateTimer = SNIFF_DURATION;
        // Landing thump
        this.scene.tweens.add({
          targets: this,
          scaleX: { from: 1.25, to: 1 },
          scaleY: { from: 0.75, to: 1 },
          duration: 180,
          ease: 'Bounce.easeOut'
        });
      }
    });

    // Hop: scale up mid-flight so the leap reads as airborne
    this.scene.tweens.add({
      targets: this,
      scale: 1.35,
      duration: POUNCE_DURATION / 2,
      yoyo: true,
      ease: 'Sine.easeOut'
    });

    // Shadow shrinks while the fox is in the air
    this.scene.tweens.add({
      targets: this.shadow,
      scaleX: 0.6,
      scaleY: 0.6,
      alpha: 0.1,
      duration: POUNCE_DURATION / 2,
      yoyo: true
    });
  }

  startReturn() {
    this.state = 'return';
  }

  reset() {
    if (this.pounceTween) {
      this.pounceTween.stop();
      this.pounceTween = null;
    }
    if (this.markerTween) {
      this.markerTween.stop();
      this.markerTween = null;
    }
    this.targetMarker.setAlpha(0.7);
    this.targetMarker.setScale(1);
    this.setScale(1);
    this.startSleep();
  }
}
