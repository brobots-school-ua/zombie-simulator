import Phaser from 'phaser';

// Bullet entity with limited range
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage: number = 15;
  private startX: number;
  private startY: number;
  private maxDistance: number = 500;

  constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.startX = x;
    this.startY = y;
    this.setDepth(8);

    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const speed = 500;
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.setRotation(angle);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    // Destroy when max distance reached
    const dist = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
    if (dist >= this.maxDistance) {
      this.destroy();
    }
  }
}
