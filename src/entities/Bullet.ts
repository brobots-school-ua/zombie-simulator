import Phaser from 'phaser';

// Bullet entity with limited range and particle trail
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage: number = 15;
  private startX: number;
  private startY: number;
  private maxDistance: number = 500;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

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

    // Particle trail behind bullet
    this.trail = scene.add.particles(0, 0, 'bullet-trail', {
      speed: { min: 5, max: 20 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 150,
      frequency: 10,
      follow: this,
      blendMode: 'ADD',
    });
    this.trail.setDepth(7);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    const dist = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
    if (dist >= this.maxDistance) {
      this.destroyBullet();
    }
  }

  destroyBullet() {
    if (this.trail) {
      this.trail.stop();
      this.scene?.time.delayedCall(200, () => {
        this.trail?.destroy();
      });
    }
    this.destroy();
  }

  destroy(fromScene?: boolean) {
    if (this.trail) {
      this.trail.stop();
      // Let remaining particles fade out
      const trailRef = this.trail;
      this.trail = null;
      this.scene?.time.delayedCall(200, () => {
        trailRef.destroy();
      });
    }
    super.destroy(fromScene);
  }
}
