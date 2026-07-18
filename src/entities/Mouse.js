import Phaser from 'phaser';

const ACCELERATION = 350;
const DRAG = 54;
const SLUSH_DRAG = 600;
const MAX_VELOCITY = 250;
const BOUNCE = 0.4;
const BOOST_MAX_VELOCITY = 420;
const BOOST_DURATION = 600; // ms of raised max velocity after a speed streak
const TURN_SPEED = 0.25; // radians per frame toward travel direction
const BONK_MIN_SPEED = 120; // must be moving this fast for a squash + squeak
const BONK_COOLDOWN = 300; // ms between bonk reactions

export default class Mouse extends Phaser.Physics.Arcade.Sprite {
  // controls: 'both' (solo), 'arrows' (P1), or 'wasd' (P2)
  constructor(scene, x, y, texture = 'mouse', controls = 'both') {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics properties for slippery ice movement
    this.setDrag(DRAG);
    this.setMaxVelocity(MAX_VELOCITY);
    this.setBounce(BOUNCE);
    this.setCollideWorldBounds(true);

    this.acceleration = ACCELERATION;

    const kb = scene.input.keyboard;
    this.keySets = [];
    if (controls === 'both' || controls === 'arrows') {
      this.keySets.push(kb.createCursorKeys());
    }
    if (controls === 'both' || controls === 'wasd') {
      this.keySets.push(kb.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      }));
    }

    // State for juice + mechanics
    this.comboCount = 0; // cheeses grabbed in one clean slide
    this.onSlush = false;
    this.gagActive = false; // true while the caught-by-bear gag plays
    this.spinActive = false; // true while a spinner tile is whirling us
    this.windX = 0; // extra acceleration from wind tiles (set by GameScene)
    this.windY = 0;
    this.flailPhase = 0;
    this.lastBonkTime = 0;
    this.prevSpeed = 0;
    this.boostTimer = null;
    this.hat = null; // cosmetic accessory sprite, synced in preUpdate
    this.carriedFish = null; // frozen-fish sprite while ferrying it to a penguin
  }

  // Runs every frame (even during gags) so accessories always stick to the mouse
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.hat) {
      // Hat sits just behind the eyes, between the ears (art faces +y)
      const offset = this.hatOffset || 0;
      this.hat.setPosition(
        this.x + Math.sin(this.rotation) * -offset,
        this.y + Math.cos(this.rotation) * offset
      );
      this.hat.setRotation(this.rotation);
      this.hat.setScale(this.scaleX);
      this.hat.setAlpha(this.alpha);
      this.hat.setVisible(this.visible);
    }

    if (this.carriedFish) {
      // Fish is carried out front, in the mouse's mouth
      this.carriedFish.setPosition(
        this.x - Math.sin(this.rotation) * 12,
        this.y + Math.cos(this.rotation) * 12
      );
      this.carriedFish.setRotation(this.rotation + Math.PI / 2);
      this.carriedFish.setScale(this.scaleX);
    }
  }

  setHat(textureKey) {
    if (this.hat) {
      this.hat.destroy();
      this.hat = null;
    }
    if (!textureKey) return;
    this.hat = this.scene.add.image(this.x, this.y, textureKey);
    this.hat.setDepth(7);
    // Scarf wraps the neck (toward the nose); rigid hats sit back between the ears
    this.hatOffset = textureKey === 'hat-scarf' ? 4 : -3;
  }

  update() {
    if (this.gagActive || this.spinActive) return;

    const accel = this.acceleration;

    const left = this.keySets.some(k => k.left.isDown);
    const right = this.keySets.some(k => k.right.isDown);
    const up = this.keySets.some(k => k.up.isDown);
    const down = this.keySets.some(k => k.down.isDown);

    // Steering plus whatever the wind is doing
    let ax = this.windX;
    let ay = this.windY;
    if (left) ax -= accel;
    else if (right) ax += accel;
    if (up) ay -= accel;
    else if (down) ay += accel;
    this.setAcceleration(ax, ay);

    // Slush patches let you actually stop (contrast makes ice feel slipperier)
    this.setDrag(this.onSlush ? SLUSH_DRAG : DRAG);

    const vx = this.body.velocity.x;
    const vy = this.body.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);

    // Face the direction of travel (sprite art points "down", hence -90deg)
    if (speed > 30) {
      let target = Math.atan2(vy, vx) - Math.PI / 2;

      // Flail slightly when sliding fast with no input ("no brakes!")
      if (speed > 180 && !left && !right && !up && !down) {
        this.flailPhase += 0.35;
        target += Math.sin(this.flailPhase) * 0.18;
      }

      this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, target, TURN_SPEED);
    }

    // Wall bonk: was moving fast, now blocked -> squash + squeak, combo over
    const b = this.body.blocked;
    const bonked = (b.left || b.right || b.up || b.down) && this.prevSpeed > BONK_MIN_SPEED;
    const now = this.scene.time.now;
    if (bonked && now - this.lastBonkTime > BONK_COOLDOWN) {
      this.lastBonkTime = now;
      this.playBonk();
    }
    if (bonked || speed < 40) {
      this.comboCount = 0;
    }

    this.prevSpeed = speed;
  }

  playBonk() {
    this.scene.sound.play('squeak', { volume: 0.4 });
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1.3, to: 1 },
      scaleY: { from: 0.7, to: 1 },
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  // Speed streak: fling past normal max velocity, then decay back
  applyBoost(dirX, dirY) {
    this.setMaxVelocity(BOOST_MAX_VELOCITY);
    this.body.setVelocity(dirX * BOOST_MAX_VELOCITY * 0.95, dirY * BOOST_MAX_VELOCITY * 0.95);

    if (this.boostTimer) this.boostTimer.remove();
    this.boostTimer = this.scene.time.delayedCall(BOOST_DURATION, () => {
      this.setMaxVelocity(MAX_VELOCITY);
      this.boostTimer = null;
    });
  }

  resetState() {
    this.body.setVelocity(0, 0);
    this.setScale(1);
    this.setRotation(0);
    this.setAlpha(1);
    this.comboCount = 0;
    this.onSlush = false;
    this.gagActive = false;
    this.spinActive = false;
    this.windX = 0;
    this.windY = 0;
    if (this.boostTimer) {
      this.boostTimer.remove();
      this.boostTimer = null;
    }
    this.setMaxVelocity(MAX_VELOCITY);
  }
}
