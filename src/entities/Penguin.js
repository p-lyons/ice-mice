import Phaser from 'phaser';

const SLIDE_SPEED = 70; // slower than bears, purely friendly
const WADDLE_WOBBLE = 0.12; // radians of belly-slide wobble

export default class Penguin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, waypoints) {
    super(scene, x, y, 'penguin');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Immovable so it nudges mice without being knocked off its path
    this.body.setImmovable(true);
    this.body.setSize(22, 16);
    this.setDepth(5);

    this.shadow = scene.add.ellipse(x, y + 8, 24, 8, 0x000000, 0.15);
    this.shadow.setDepth(4);

    this.waypoints = waypoints;
    this.currentWaypoint = 0;
    this.wobblePhase = Math.random() * Math.PI * 2;

    this.startX = x;
    this.startY = y;
  }

  update() {
    this.shadow.setPosition(this.x, this.y + 8);

    if (!this.waypoints || this.waypoints.length === 0) return;

    const target = this.waypoints[this.currentWaypoint];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
      return;
    }

    const angle = Math.atan2(dy, dx);
    this.body.setVelocity(
      Math.cos(angle) * SLIDE_SPEED,
      Math.sin(angle) * SLIDE_SPEED
    );

    // Face travel direction (sprite art points right) with a belly-slide wobble
    this.wobblePhase += 0.15;
    this.rotation = angle + Math.sin(this.wobblePhase) * WADDLE_WOBBLE;
  }

  reset() {
    this.setPosition(this.startX, this.startY);
    this.currentWaypoint = 0;
    this.body.setVelocity(0, 0);
  }
}
