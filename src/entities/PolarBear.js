import Phaser from 'phaser';

export default class PolarBear extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, waypoints) {
    super(scene, x, y, 'polar-bear');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);

    // Patrol properties
    this.waypoints = waypoints;
    this.currentWaypoint = 0;
    this.speed = 100; // pixels per second

    // Store starting position for reset
    this.startX = x;
    this.startY = y;
  }

  update() {
    if (!this.waypoints || this.waypoints.length === 0) return;

    const target = this.waypoints[this.currentWaypoint];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If close enough to waypoint, move to next one
    if (distance < 5) {
      this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
      return;
    }

    // Move toward current waypoint
    const angle = Math.atan2(dy, dx);
    this.body.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  reset() {
    this.setPosition(this.startX, this.startY);
    this.currentWaypoint = 0;
    this.body.setVelocity(0, 0);
  }
}
