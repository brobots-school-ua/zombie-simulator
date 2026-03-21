import Phaser from 'phaser';

// Bullet config passed from weapon
export interface BulletConfig {
  damage: number;
  speed: number;
  maxRange: number;
  pierce: number;
  aoeRadius: number;
  texture?: string;
}

// Bullet entity with configurable stats and particle trail
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  pierce: number;
  aoeRadius: number;
  private startX: number;
  private startY: number;
  private maxDistance: number;
  private pierceCount: number = 0;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private destroyed = false;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    targetX: number, targetY: number,
    config: BulletConfig
  ) {
    super(scene, x, y, config.texture || 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.startX = x;
    this.startY = y;
    this.damage = config.damage;
    this.pierce = config.pierce;
    this.aoeRadius = config.aoeRadius;
    this.maxDistance = config.maxRange;
    this.setDepth(8);

    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    this.setVelocity(
      Math.cos(angle) * config.speed,
      Math.sin(angle) * config.speed
    );
    this.setRotation(angle);

    // Particle trail
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

  // Returns true if bullet should be destroyed after hit
  onHitZombie(): boolean {
    this.pierceCount++;
    return this.pierceCount >= this.pierce;
  }

  // Whether this bullet reached max range (for AoE explosion check)
  reachedMaxRange = false;

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.destroyed) return;
    const dist = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
    if (dist >= this.maxDistance) {
      this.reachedMaxRange = true;
      this.kill();
    }
  }

  kill() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.cleanupTrail();
    super.destroy();
  }

  private cleanupTrail() {
    if (this.trail) {
      this.trail.stop();
      const trailRef = this.trail;
      this.trail = null;
      if (this.scene) {
        this.scene.time.delayedCall(200, () => trailRef.destroy());
      } else {
        trailRef.destroy();
      }
    }
  }

  destroy(fromScene?: boolean) {
    if (this.destroyed) return;
    this.destroyed = true;
    this.cleanupTrail();
    super.destroy(fromScene);
  }
}
