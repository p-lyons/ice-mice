import Phaser from 'phaser';

const TOSS_SPEED = 280; // how hard the otter throws a rescued mouse
const BOB_AMOUNT = 3; // px of idle bobbing in the water

// A friendly otter living in a permanent water hole. Falling into ITS pool
// is not a fail: the otter catches the mouse and tosses it back onto the
// ice, dizzy but alive. It never hurts anyone.
export default class Otter extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'otter');

    // Pool of open water beneath the otter
    this.pool = scene.add.image(x, y, 'water-hole');
    this.pool.setDepth(1);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    // Generous circle so the otter catches mice before the pool "drowns" them
    this.body.setCircle(22, -5, -5);
    this.setDepth(5);

    this.homeX = x;
    this.homeY = y;

    // Idle bob, like treading water
    scene.tweens.add({
      targets: this,
      y: y - BOB_AMOUNT,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Slow content wiggle
    scene.tweens.add({
      targets: this,
      angle: { from: -6, to: 6 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // Catch a sliding mouse and toss it back where it came from
  rescue(mouse) {
    if (mouse.gagActive) return;

    const scene = this.scene;

    // Toss direction: reverse of how the mouse came in (fallback: toward its spawn)
    let dirX = -mouse.body.velocity.x;
    let dirY = -mouse.body.velocity.y;
    let len = Math.sqrt(dirX * dirX + dirY * dirY);
    if (len < 20) {
      dirX = mouse.spawnX - this.homeX;
      dirY = mouse.spawnY - this.homeY;
      len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    }
    dirX /= len;
    dirY /= len;

    mouse.gagActive = true;
    mouse.body.enable = false;
    mouse.body.setVelocity(0, 0);

    scene.sound.play('splash', { volume: 0.4 });

    // Otter pops up excitedly
    scene.tweens.add({
      targets: this,
      scale: { from: 1.3, to: 1 },
      duration: 300,
      ease: 'Bounce.easeOut'
    });

    // Mouse swirls into the pool...
    scene.tweens.add({
      targets: mouse,
      x: this.homeX,
      y: this.homeY,
      angle: mouse.angle + 360,
      scale: 0.6,
      duration: 280,
      ease: 'Sine.easeIn',
      onComplete: () => {
        scene.sound.play('boing', { volume: 0.5 });
        scene.sound.play('wheee', { volume: 0.4 });
        scene.showFloatingText(this.homeX, this.homeY - 30, 'Saved!', '#66ddff');

        // ...and gets tossed back out onto the ice
        scene.tweens.add({
          targets: mouse,
          x: this.homeX + dirX * 70,
          y: this.homeY + dirY * 70,
          angle: mouse.angle + 360,
          scale: 1,
          duration: 260,
          ease: 'Sine.easeOut',
          onComplete: () => {
            mouse.gagActive = false;
            mouse.body.enable = true;
            mouse.body.setVelocity(dirX * TOSS_SPEED, dirY * TOSS_SPEED);
          }
        });
      }
    });
  }
}
