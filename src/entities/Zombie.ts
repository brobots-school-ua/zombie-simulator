import Phaser from 'phaser';
import { Player } from './Player';

// Zombie types configuration
export type ZombieType = 'walker' | 'runner' | 'tank' | 'radioactive' | 'kamikaze';

const ZOMBIE_CONFIG: Record<ZombieType, {
  texture: string;
  armsTexture: string;
  hp: number;
  speed: number;
  damage: number;
  score: number;
  coins: number;
  detectionRange: number;
}> = {
  walker: {
    texture: 'zombie-walker',
    armsTexture: 'zombie-walker-arms',
    hp: 50,
    speed: 60,
    damage: 10,
    score: 10,
    coins: 1,
    detectionRange: 300,
  },
  runner: {
    texture: 'zombie-runner',
    armsTexture: 'zombie-runner-arms',
    hp: 35,
    speed: 140,
    damage: 8,
    score: 20,
    coins: 2,
    detectionRange: 400,
  },
  tank: {
    texture: 'zombie-tank',
    armsTexture: 'zombie-tank-arms',
    hp: 100,
    speed: 35,
    damage: 25,
    score: 50,
    coins: 3,
    detectionRange: 250,
  },
  radioactive: {
    texture: 'zombie-radioactive',
    armsTexture: 'zombie-radioactive-arms',
    hp: 40,
    speed: 50,
    damage: 5,
    score: 30,
    coins: 2,
    detectionRange: 300,
  },
  kamikaze: {
    texture: 'zombie-kamikaze',
    armsTexture: 'zombie-kamikaze-arms',
    hp: 15,
    speed: 180,
    damage: 0, // explosion handles damage
    score: 25,
    coins: 2,
    detectionRange: 9999, // sees across entire map
  },
};

// Zombie entity with AI
export class Zombie extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  zombieType: ZombieType;
  speed: number;
  damage: number;
  scoreValue: number;
  coinValue: number;
  detectionRange: number;
  private attackCooldown: number = 0;
  private wanderAngle: number = Math.random() * Math.PI * 2;
  private wanderTimer: number = 0;
  private aggroed: boolean = false;
  private stuckTimer: number = 0;
  private slideDir: number = 1;
  private lastX: number = 0;
  private lastY: number = 0;
  private hpBar: Phaser.GameObjects.Graphics;
  private arms: Phaser.GameObjects.Sprite;
  private auraDamageTimer: number = 0;
  private blinkTimer: number = 0;

  // Flag for kamikaze — exploded on contact (GameScene checks this)
  explodeOnContact = false;
  // Flag for radioactive — leave puddle on death (GameScene checks this)
  leavePuddle = false;
  // Kamikaze explodes when killed by bullets too
  explodeOnDeath = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ZombieType = 'walker') {
    const config = ZOMBIE_CONFIG[type];
    super(scene, x, y, config.texture);

    this.zombieType = type;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.scoreValue = config.score;
    this.coinValue = config.coins;
    this.detectionRange = config.detectionRange;

    if (type === 'kamikaze') {
      this.explodeOnContact = true;
      this.explodeOnDeath = true;
      this.aggroed = true; // always aggro
    }
    if (type === 'radioactive') {
      this.leavePuddle = true;
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);

    this.arms = scene.add.sprite(x, y, config.armsTexture);
    this.arms.setOrigin(0, 0.5);
    this.arms.setDepth(4);

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(6);
  }

  wallsGroup: Phaser.Physics.Arcade.StaticGroup | null = null;

  update(player: Player, time: number, delta: number) {
    if (!this.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    // Kamikaze is always aggro
    if (this.zombieType === 'kamikaze') {
      this.aggroed = true;
    } else {
      const canSeePlayer = dist < this.detectionRange && this.hasLineOfSight(player);
      if (canSeePlayer) this.aggroed = true;
      else if (dist > this.detectionRange) this.aggroed = false;
    }

    let moveAngle: number;

    if (this.aggroed) {
      moveAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

      // Wall avoidance
      const moved = Math.abs(this.x - this.lastX) + Math.abs(this.y - this.lastY);
      if (moved < 0.5 && dist > 40) {
        this.stuckTimer += delta;
        if (this.stuckTimer > 200) {
          moveAngle += (Math.PI / 2) * this.slideDir;
          if (this.stuckTimer > 800) { this.slideDir *= -1; this.stuckTimer = 200; }
        }
      } else {
        this.stuckTimer = 0;
      }
      this.lastX = this.x;
      this.lastY = this.y;

      this.setVelocity(Math.cos(moveAngle) * this.speed, Math.sin(moveAngle) * this.speed);
    } else {
      this.wanderTimer -= delta;
      if (this.wanderTimer <= 0) {
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderTimer = 2000 + Math.random() * 3000;
      }
      moveAngle = this.wanderAngle;
      this.setVelocity(Math.cos(moveAngle) * this.speed * 0.3, Math.sin(moveAngle) * this.speed * 0.3);
    }

    this.arms.setPosition(this.x, this.y);
    this.arms.setRotation(moveAngle);

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    // Radioactive aura — 5 HP/sec to player if close
    if (this.zombieType === 'radioactive' && dist < 60) {
      this.auraDamageTimer += delta;
      if (this.auraDamageTimer >= 1000) {
        this.auraDamageTimer = 0;
        player.takeDamage(5);
      }
    }

    // Kamikaze blink effect
    if (this.zombieType === 'kamikaze') {
      this.blinkTimer += delta;
      if (this.blinkTimer > 300) {
        this.blinkTimer = 0;
        this.setTint(this.tintTopLeft === 0xff0000 ? 0xffffff : 0xff0000);
      }
    }

    // HP bar
    this.hpBar.clear();
    const barWidth = 30;
    const barHeight = 4;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.displayHeight / 2 - 8;
    const hpPercent = this.hp / this.maxHp;
    this.hpBar.fillStyle(0x000000, 0.6);
    this.hpBar.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    const color = hpPercent > 0.5 ? 0x44ff44 : hpPercent > 0.25 ? 0xffaa00 : 0xff3333;
    this.hpBar.fillStyle(color);
    this.hpBar.fillRect(barX, barY, barWidth * hpPercent, barHeight);
  }

  canAttack(): boolean {
    if (this.attackCooldown <= 0) {
      this.attackCooldown = 1000;
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
        wall.x - wall.displayWidth / 2, wall.y - wall.displayHeight / 2,
        wall.displayWidth, wall.displayHeight
      );
      if (Phaser.Geom.Intersects.LineToRectangle(line, wallRect)) return false;
    }
    return true;
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    if (this.scene) {
      this.setTint(0xff0000);
      this.scene.time.delayedCall(80, () => {
        if (this.active) this.clearTint();
      });
    }
    if (this.hp <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  destroy(fromScene?: boolean) {
    if (this.hpBar) this.hpBar.destroy();
    if (this.arms) this.arms.destroy();
    super.destroy(fromScene);
  }
}
