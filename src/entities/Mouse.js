import Phaser from 'phaser';

export default class Mouse extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'mouse');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics properties for slippery ice movement
    this.setDrag(54);
    this.setMaxVelocity(250);
    this.setBounce(0.4);
    this.setCollideWorldBounds(true);

    this.acceleration = 350;

    // Set up keyboard controls
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  update() {
    const accel = this.acceleration;

    // Reset acceleration
    this.setAcceleration(0);

    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.setAccelerationX(-accel);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.setAccelerationX(accel);
    }

    // Vertical movement
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.setAccelerationY(-accel);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.setAccelerationY(accel);
    }
  }
}
