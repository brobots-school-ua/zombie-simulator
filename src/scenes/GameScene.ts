import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Zombie, ZombieType } from '../entities/Zombie';
import { Bullet } from '../entities/Bullet';
import { Pickup } from '../entities/Pickup';

// Main game scene — where all gameplay happens
export class GameScene extends Phaser.Scene {
  player!: Player;
  zombies!: Phaser.GameObjects.Group;
  bullets!: Phaser.GameObjects.Group;
  pickups!: Phaser.GameObjects.Group;
  walls!: Phaser.Physics.Arcade.StaticGroup;

  wave: number = 1;
  zombiesRemaining: number = 0;
  private waveDelay: boolean = false;
  private shootCooldown: number = 0;
  private mapSize = 2000;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Reset state
    this.wave = 1;
    this.shootCooldown = 0;
    this.waveDelay = false;

    // World bounds
    this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize);

    // Draw ground tiles
    for (let x = 0; x < this.mapSize; x += 64) {
      for (let y = 0; y < this.mapSize; y += 64) {
        this.add.image(x + 32, y + 32, 'ground').setDepth(0);
      }
    }

    // Create walls / obstacles
    this.walls = this.physics.add.staticGroup();
    this.generateObstacles();

    // Create groups
    this.zombies = this.add.group({ runChildUpdate: false });
    this.bullets = this.add.group({ runChildUpdate: false });
    this.pickups = this.add.group();

    // Create player at center
    this.player = new Player(this, this.mapSize / 2, this.mapSize / 2);

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize);

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.zombies, this.walls);

    // Zombie hits player
    this.physics.add.overlap(this.player, this.zombies, (_player, zombie) => {
      const z = zombie as Zombie;
      if (z.canAttack()) {
        this.player.takeDamage(z.damage);
        this.events.emit('player-hit');
      }
    });

    // Bullet hits zombie
    this.physics.add.overlap(this.bullets, this.zombies, (bullet, zombie) => {
      const b = bullet as Bullet;
      const z = zombie as Zombie;
      const killed = z.takeDamage(b.damage);
      b.destroy();

      if (killed) {
        this.player.kills++;
        this.player.score += z.scoreValue;
        this.zombiesRemaining--;
      }
    });

    // Player picks up ammo
    this.physics.add.overlap(this.player, this.pickups, (_player, pickup) => {
      const p = pickup as Pickup;
      this.player.ammo = Math.min(this.player.ammo + p.value, this.player.maxAmmo);
      p.destroy();
    });

    // Bullets collide with walls
    this.physics.add.collider(this.bullets, this.walls, (bullet) => {
      bullet.destroy();
    });

    // Spawn ammo pickups every 10-15 seconds
    this.time.addEvent({
      delay: Phaser.Math.Between(10000, 15000),
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(100, this.mapSize - 100);
        const y = Phaser.Math.Between(100, this.mapSize - 100);
        const pickup = new Pickup(this, x, y, 'ammo');
        this.pickups.add(pickup);
      },
    });

    // Shooting
    this.input.on('pointerdown', () => {
      if (this.shootCooldown <= 0) {
        const target = this.player.shoot();
        if (target) {
          const bullet = new Bullet(this, this.player.x, this.player.y, target.x, target.y);
          this.bullets.add(bullet);
          this.shootCooldown = 150; // fire rate in ms
        }
      }
    });

    // Player death
    this.events.on('player-died', () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', {
        score: this.player.score,
        kills: this.player.kills,
        wave: this.wave,
      });
    });

    // Launch UI overlay
    this.scene.launch('UIScene', { gameScene: this });

    // Start first wave
    this.spawnWave();
  }

  update(time: number, delta: number) {
    this.player.update();

    // Update zombies
    this.zombies.getChildren().forEach((z) => {
      (z as Zombie).update(this.player, time, delta);
    });

    // Shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    // Check if wave is cleared
    if (this.zombiesRemaining <= 0 && !this.waveDelay) {
      this.waveDelay = true;
      this.wave++;

      // Brief pause between waves
      this.time.delayedCall(3000, () => {
        this.spawnWave();
        this.waveDelay = false;
      });
    }
  }

  private spawnWave() {
    const count = 5 + this.wave * 3;
    this.zombiesRemaining = count;

    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 300, () => {
        const pos = this.getSpawnPosition();
        const type = this.getRandomZombieType();
        const zombie = new Zombie(this, pos.x, pos.y, type);
        this.zombies.add(zombie);
      });
    }
  }

  private getSpawnPosition(): { x: number; y: number } {
    // Spawn outside camera view but within map
    const cam = this.cameras.main;
    const margin = 100;
    const side = Phaser.Math.Between(0, 3);

    let x: number, y: number;

    switch (side) {
      case 0: // top
        x = Phaser.Math.Between(cam.scrollX - margin, cam.scrollX + cam.width + margin);
        y = cam.scrollY - margin;
        break;
      case 1: // right
        x = cam.scrollX + cam.width + margin;
        y = Phaser.Math.Between(cam.scrollY - margin, cam.scrollY + cam.height + margin);
        break;
      case 2: // bottom
        x = Phaser.Math.Between(cam.scrollX - margin, cam.scrollX + cam.width + margin);
        y = cam.scrollY + cam.height + margin;
        break;
      default: // left
        x = cam.scrollX - margin;
        y = Phaser.Math.Between(cam.scrollY - margin, cam.scrollY + cam.height + margin);
    }

    // Clamp to map bounds
    x = Phaser.Math.Clamp(x, 50, this.mapSize - 50);
    y = Phaser.Math.Clamp(y, 50, this.mapSize - 50);

    return { x, y };
  }

  private getRandomZombieType(): ZombieType {
    const r = Math.random();
    // More variety in later waves
    if (this.wave >= 5 && r < 0.15) return 'tank';
    if (this.wave >= 3 && r < 0.35) return 'runner';
    return 'walker';
  }

  private generateObstacles() {
    // Border walls around the entire map
    for (let i = 0; i < this.mapSize; i += 64) {
      // Top edge
      const wTop = this.walls.create(i + 32, 32, 'wall') as Phaser.Physics.Arcade.Sprite;
      wTop.setDepth(2).refreshBody();
      // Bottom edge
      const wBot = this.walls.create(i + 32, this.mapSize - 32, 'wall') as Phaser.Physics.Arcade.Sprite;
      wBot.setDepth(2).refreshBody();
      // Left edge
      const wLeft = this.walls.create(32, i + 32, 'wall') as Phaser.Physics.Arcade.Sprite;
      wLeft.setDepth(2).refreshBody();
      // Right edge
      const wRight = this.walls.create(this.mapSize - 32, i + 32, 'wall') as Phaser.Physics.Arcade.Sprite;
      wRight.setDepth(2).refreshBody();
    }

    // Scatter walls and buildings around the map
    const buildingCount = 15 + Math.floor(Math.random() * 10);

    for (let i = 0; i < buildingCount; i++) {
      const bx = Phaser.Math.Between(200, this.mapSize - 200);
      const by = Phaser.Math.Between(200, this.mapSize - 200);
      const bw = Phaser.Math.Between(1, 4);
      const bh = Phaser.Math.Between(1, 3);

      // Skip if too close to center (player spawn)
      const cx = this.mapSize / 2;
      const cy = this.mapSize / 2;
      if (Math.abs(bx - cx) < 150 && Math.abs(by - cy) < 150) continue;

      for (let wx = 0; wx < bw; wx++) {
        for (let wy = 0; wy < bh; wy++) {
          const wall = this.walls.create(bx + wx * 64, by + wy * 64, 'wall') as Phaser.Physics.Arcade.Sprite;
          wall.setDepth(2);
          wall.refreshBody();
        }
      }
    }
  }
}
