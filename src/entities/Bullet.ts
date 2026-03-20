import Phaser from 'phaser';

// Bullet entity
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage: number = 15;
  private lifespan: number = 1500;

  constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(8);

    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const speed = 500;
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.setRotation(angle);

    // Auto-destroy after lifespan
    scene.time.delayedCall(this.lifespan, () => {
      if (this.active) this.destroy();
    });
  }
}
