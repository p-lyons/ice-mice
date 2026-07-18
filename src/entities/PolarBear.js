import Phaser from 'phaser';

const PATROL_SPEED = 100; // pixels per second
const ALERT_DISTANCE = 150; // how close a mouse gets before the "!" pops
const ALERT_DURATION = 900; // ms the "!" stays up
const ALERT_COOLDOWN = 3000; // ms before the bear can be startled again
const SLIP_CHANCE = 0.25; // chance of a comedy stumble when turning a corner
const SLIP_COOLDOWN = 5000; // ms between stumbles so it stays an occasional gag

export default class PolarBear extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, waypoints) {
    super(scene, x, y, 'polar-bear');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    this.setDepth(5);

    // Soft shadow so the bear feels grounded (drawn under the bear)
    this.shadow = scene.add.ellipse(x, y + 14, 34, 12, 0x000000, 0.2);
    this.shadow.setDepth(4);

    // "!" alert shown when a mouse slides too close (visual drama only --
    // patrol behavior never changes, so kids can still learn the pattern)
    this.alertText = scene.add.text(x, y - 32, '!', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ff3333',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(50).setVisible(false);
    this.lastAlertTime = -ALERT_COOLDOWN;
    this.lastSlipTime = -SLIP_COOLDOWN;

    // Patrol properties
    this.waypoints = waypoints;
    this.currentWaypoint = 0;
    this.speed = PATROL_SPEED;

    // Store starting position for reset
    this.startX = x;
    this.startY = y;
  }

  update(mice = []) {
    this.shadow.setPosition(this.x, this.y + 14);
    this.alertText.setPosition(this.x, this.y - 32);
    this.checkAlert(mice);

    if (!this.waypoints || this.waypoints.length === 0) return;

    const target = this.waypoints[this.currentWaypoint];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If close enough to waypoint, move to next one
    if (distance < 5) {
      this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
      this.maybeSlip();
      return;
    }

    // Move toward current waypoint
    const angle = Math.atan2(dy, dx);
    this.body.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  checkAlert(mice) {
    const now = this.scene.time.now;
    if (now - this.lastAlertTime < ALERT_COOLDOWN) return;

    const spotted = mice.some(mouse => {
      if (mouse.gagActive) return false;
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      return dx * dx + dy * dy < ALERT_DISTANCE * ALERT_DISTANCE;
    });

    if (spotted) {
      this.lastAlertTime = now;
      this.alertText.setVisible(true);
      this.alertText.setScale(0);
      this.scene.tweens.add({
        targets: this.alertText,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
      this.scene.time.delayedCall(ALERT_DURATION, () => {
        this.alertText.setVisible(false);
      });
    }
  }

  // Occasional stumble wobble when turning a corner. Purely cosmetic:
  // position and patrol timing are untouched, so the pattern stays learnable.
  maybeSlip() {
    const now = this.scene.time.now;
    if (now - this.lastSlipTime < SLIP_COOLDOWN) return;
    if (Math.random() > SLIP_CHANCE) return;
    this.lastSlipTime = now;

    this.scene.tweens.add({
      targets: this,
      angle: { from: -14, to: 14 },
      duration: 70,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.setAngle(0)
    });
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1.12, to: 1 },
      scaleY: { from: 0.88, to: 1 },
      duration: 220,
      ease: 'Bounce.easeOut'
    });
  }

  reset() {
    this.setPosition(this.startX, this.startY);
    this.currentWaypoint = 0;
    this.body.setVelocity(0, 0);
    this.setAngle(0);
  }
}
