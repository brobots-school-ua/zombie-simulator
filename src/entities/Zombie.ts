import Phaser from 'phaser';
import { Player } from './Player';

// Zombie types configuration
export type ZombieType = 'walker' | 'runner' | 'tank';

const ZOMBIE_CONFIG: Record<ZombieType, {
  texture: string;
  hp: number;
  speed: number;
  damage: number;
  score: number;
  detectionRange: number;
}> = {
  walker: {
    texture: 'zombie-walker',
    hp: 30,
    speed: 60,
    damage: 10,
    score: 10,
    detectionRange: 300,
  },
  runner: {
    texture: 'zombie-runner',
    hp: 20,
    speed: 140,
    damage: 8,
    score: 20,
    detectionRange: 400,
  },
  tank: {
    texture: 'zombie-tank',
    hp: 100,
    speed: 35,
    damage: 25,
    score: 50,
    detectionRange: 250,
  },
};

// Zombie entity with simple AI
export class Zombie extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  zombieType: ZombieType;
  speed: number;
  damage: number;
  scoreValue: number;
  detectionRange: number;
  private attackCooldown: number = 0;
  private wanderAngle: number = Math.random() * Math.PI * 2;
  private wanderTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ZombieType = 'walker') {
    const config = ZOMBIE_CONFIG[type];
    super(scene, x, y, config.texture);

    this.zombieType = type;
    this.hp = config.hp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.scoreValue = config.score;
    this.detectionRange = config.detectionRange;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);
  }

  // Reference to walls group, set by GameScene
  wallsGroup: Phaser.Physics.Arcade.StaticGroup | null = null;

  update(player: Player, time: number, delta: number) {
    if (!this.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const canSeePlayer = dist < this.detectionRange && this.hasLineOfSight(player);

    if (canSeePlayer) {
      // Chase player
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
      this.setRotation(angle);
    } else {
      // Wander randomly
      this.wanderTimer -= delta;
      if (this.wanderTimer <= 0) {
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderTimer = 2000 + Math.random() * 3000;
      }
      const wanderSpeed = this.speed * 0.3;
      this.setVelocity(
        Math.cos(this.wanderAngle) * wanderSpeed,
        Math.sin(this.wanderAngle) * wanderSpeed
      );
      this.setRotation(this.wanderAngle);
    }

    // Cooldown for attacks
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
  }

  canAttack(): boolean {
    if (this.attackCooldown <= 0) {
      this.attackCooldown = 1000; // 1 second cooldown
      return true;
    }
    return false;
  }

  private hasLineOfSight(player: Player): boolean {
    if (!this.wallsGroup) return true;

    const walls = this.wallsGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    const line = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);

    for (const wall of walls) {
      const wallRect = new Phaser.Geom.Rectangle(
        wall.x - wall.displayWidth / 2,
        wall.y - wall.displayHeight / 2,
        wall.displayWidth,
        wall.displayHeight
      );
      if (Phaser.Geom.Intersects.LineToRectangle(line, wallRect)) {
        return false;
      }
    }
    return true;
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.destroy();
      return true; // zombie died
    }
    return false;
  }
}
