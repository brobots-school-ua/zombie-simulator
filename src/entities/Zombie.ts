import Phaser from 'phaser';
import { Player } from './Player';

// Zombie types configuration
export type ZombieType = 'walker' | 'runner' | 'tank' | 'radioactive' | 'kamikaze' | 'boss';

// Drop chances per material (percent, rolled independently)
export interface MaterialDropChance {
  wood: number;
  metal: number;
  screws: number;
}

const ZOMBIE_CONFIG: Record<ZombieType, {
  texture: string;
  armsTexture: string;
  hp: number;
  speed: number;
  damage: number;
  score: number;
  coins: number;
  detectionRange: number;
  drops: MaterialDropChance;
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
    drops: { wood: 20, metal: 15, screws: 5 },
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
    drops: { wood: 20, metal: 20, screws: 7 },
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
    drops: { wood: 17, metal: 17, screws: 10 },
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
    drops: { wood: 22, metal: 22, screws: 12 },
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
    drops: { wood: 25, metal: 25, screws: 15 },
  },
  boss: {
    texture: 'zombie-boss',
    armsTexture: 'zombie-boss-arms',
    hp: 500,
    speed: 45,
    damage: 30,
    score: 200,
    coins: 10,
    detectionRange: 9999,
    drops: { wood: 100, metal: 100, screws: 100 },
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
  drops: MaterialDropChance;
  private attackCooldown: number = 0;
  private wanderAngle: number = Math.random() * Math.PI * 2;
  private wanderTimer: number = 0;
  private aggroed: boolean = false;
  private stuckTimer: number = 0;
  private slideDir: number = Math.random() < 0.5 ? 1 : -1;
  private lastX: number = 0;
  private lastY: number = 0;
  private avoidAngle: number = 0;
  private avoidTimer: number = 0;
  private hpBar: Phaser.GameObjects.Graphics;
  private arms: Phaser.GameObjects.Sprite;
  private auraDamageTimer: number = 0;
  private blinkTimer: number = 0;
  private stompTimer: number = 0;
  private stompCharging: boolean = false;
  private auraGfx: Phaser.GameObjects.Graphics | null = null;

  // Flag for kamikaze — exploded on contact (GameScene checks this)
  explodeOnContact = false;
  // Flag for radioactive — leave puddle on death (GameScene checks this)
  leavePuddle = false;
  // Kamikaze explodes when killed by bullets too
  explodeOnDeath = false;
  // Frozen state
  frozen = false;

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
    this.drops = config.drops;

    if (type === 'kamikaze') {
      this.explodeOnContact = true;
      this.explodeOnDeath = true;
      this.aggroed = true; // always aggro
    }
    if (type === 'radioactive') {
      this.leavePuddle = true;
    }
    if (type === 'boss') {
      this.aggroed = true; // always aggro
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);

    if (type === 'boss') {
      this.setScale(2);
      (this.body as Phaser.Physics.Arcade.Body).setSize(36, 36).setOffset(2, 2);
    }

    this.arms = scene.add.sprite(x, y, config.armsTexture);
    this.arms.setOrigin(0, 0.5);
    this.arms.setDepth(4);
    if (type === 'boss') this.arms.setScale(2);

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(6);

    if (type === 'radioactive') {
      this.auraGfx = scene.add.graphics();
      this.auraGfx.setDepth(3);
    }
  }

  wallsGroup: Phaser.Physics.Arcade.StaticGroup | null = null;

  freeze(duration: number) {
    this.frozen = true;
    this.setTint(0x44ccff);
    this.setVelocity(0, 0);
    this.scene.time.delayedCall(duration, () => {
      if (this.active) {
        this.frozen = false;
        this.clearTint();
      }
    });
  }

  update(player: Player, time: number, delta: number) {
    if (!this.active) return;
    if (this.frozen) {
      this.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    // Kamikaze is always aggro
    if (this.zombieType === 'kamikaze') {
      this.aggroed = true;
    } else {
      const canSeePlayer = dist < this.detectionRange && this.hasLineOfSight(player);
      if (canSeePlayer) this.aggroed = true;
      else if (dist > this.detectionRange * 2) this.aggroed = false;
    }

    let moveAngle: number;

    if (this.aggroed) {
      moveAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

      // Wall avoidance
      const moved = Math.abs(this.x - this.lastX) + Math.abs(this.y - this.lastY);
      this.lastX = this.x;
      this.lastY = this.y;

      if (this.avoidTimer > 0) {
        // Currently avoiding a wall — check if path to player is clear now
        const toPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const checkX = this.x + Math.cos(toPlayer) * 60;
        const checkY = this.y + Math.sin(toPlayer) * 60;
        if (!this.isDirectionBlocked(checkX, checkY)) {
          // Wall ended — go straight to player
          this.avoidTimer = 0;
          this.stuckTimer = 0;
        } else {
          // Still wall ahead — keep sliding along it
          moveAngle = this.avoidAngle;
        }
      } else if (moved < 0.5 && dist > 40) {
        this.stuckTimer += delta;
        if (this.stuckTimer > 150) {
          // Find which side the wall is and slide perpendicular to it
          const toPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
          // Try perpendicular directions (±90° from player direction)
          const leftAngle = toPlayer + Math.PI / 2;
          const rightAngle = toPlayer - Math.PI / 2;

          const leftX = this.x + Math.cos(leftAngle) * 60;
          const leftY = this.y + Math.sin(leftAngle) * 60;
          const rightX = this.x + Math.cos(rightAngle) * 60;
          const rightY = this.y + Math.sin(rightAngle) * 60;

          const leftFree = !this.isDirectionBlocked(leftX, leftY);
          const rightFree = !this.isDirectionBlocked(rightX, rightY);

          if (leftFree && rightFree) {
            // Both sides free — use preferred slide direction
            this.avoidAngle = this.slideDir > 0 ? leftAngle : rightAngle;
          } else if (leftFree) {
            this.avoidAngle = leftAngle;
          } else if (rightFree) {
            this.avoidAngle = rightAngle;
          } else {
            // Both sides blocked — try diagonal or flip
            this.avoidAngle = toPlayer + Math.PI * 0.75 * this.slideDir;
            this.slideDir *= -1;
          }

          this.avoidTimer = 1;  // stays active until wall ends
          moveAngle = this.avoidAngle;
          this.stuckTimer = 0;
        }
      } else {
        this.stuckTimer = 0;
      }

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

    // Radioactive aura — visual + 10 HP/sec to player if close
    if (this.zombieType === 'radioactive' && this.auraGfx) {
      this.auraGfx.clear();
      this.auraGfx.fillStyle(0x33ff33, 0.03);
      this.auraGfx.fillCircle(this.x, this.y, 100);
      this.auraGfx.lineStyle(1, 0x33ff33, 0.1);
      this.auraGfx.strokeCircle(this.x, this.y, 100);

      if (dist < 100) {
        this.auraDamageTimer += delta;
        if (this.auraDamageTimer >= 500) {
          this.auraDamageTimer = 0;
          player.takeDamage(5);
        }
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

    // Boss stomp — only when player in range, 1 sec charge animation
    if (this.zombieType === 'boss') {
      if (!this.stompCharging) {
        this.stompTimer += delta;
        if (this.stompTimer >= 3000 && dist < 120) {
          // Start charging — stop and animate
          this.stompCharging = true;
          this.stompTimer = 0;
          this.setVelocity(0, 0);
          this.setTint(0x8800aa);
          this.scene.tweens.add({
            targets: this, scaleY: 1.5, duration: 500, yoyo: true, ease: 'Quad.easeIn',
            onComplete: () => {
              if (!this.active) return;
              this.stompCharging = false;
              this.clearTint();
              this.setScale(2);
              // Stomp hit
              const stompDist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
              if (stompDist < 120) {
                player.takeDamage(15);
              }
              // Visual shockwave
              const ring = this.scene.add.circle(this.x, this.y, 10, 0x8800aa, 0.3).setDepth(3);
              this.scene.tweens.add({
                targets: ring, radius: 120, alpha: 0, duration: 400,
                onUpdate: () => { ring.setRadius(ring.radius); },
                onComplete: () => ring.destroy(),
              });
            },
          });
        }
      } else {
        // While charging — stay still
        this.setVelocity(0, 0);
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

  private isDirectionBlocked(tx: number, ty: number): boolean {
    if (!this.wallsGroup) return false;
    const testRect = new Phaser.Geom.Rectangle(tx - 14, ty - 14, 28, 28);
    for (const wall of this.wallsGroup.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      const wallRect = new Phaser.Geom.Rectangle(
        wall.x - wall.displayWidth / 2, wall.y - wall.displayHeight / 2,
        wall.displayWidth, wall.displayHeight
      );
      if (Phaser.Geom.Intersects.RectangleToRectangle(testRect, wallRect)) return true;
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
    if (this.auraGfx) this.auraGfx.destroy();
    super.destroy(fromScene);
  }
}
