import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Zombie, ZombieType } from '../entities/Zombie';
import { Bullet } from '../entities/Bullet';
import { Pickup } from '../entities/Pickup';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';
import { shop } from '../systems/ShopConfig';

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

    // Draw ground tiles with random grass variants
    const grassTiles = ['ground1', 'ground2', 'ground3'];
    for (let x = 0; x < this.mapSize; x += 64) {
      for (let y = 0; y < this.mapSize; y += 64) {
        const tile = grassTiles[Phaser.Math.Between(0, 2)];
        this.add.image(x + 32, y + 32, tile).setDepth(0);
      }
    }

    // Create walls / obstacles
    this.walls = this.physics.add.staticGroup();
    this.generateObstacles();

    // Create groups
    this.zombies = this.add.group({ runChildUpdate: false });
    this.bullets = this.add.group({ runChildUpdate: false });
    this.pickups = this.add.group();

    // Create player at center — find safe position
    const playerPos = this.getSafePlayerSpawn();
    this.player = new Player(this, playerPos.x, playerPos.y);

    // Camera follows player with zoom
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize);
    this.cameras.main.setZoom(1.5);

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

      // AoE explosion (grenade launcher)
      if (b.aoeRadius > 0) {
        this.doAoeDamage(b.x, b.y, b.aoeRadius, b.damage);
        b.destroy();
        return;
      }

      const killed = z.takeDamage(b.damage);

      if (killed) {
        this.player.kills++;
        this.player.score += z.scoreValue;
        this.zombiesRemaining--;
        shop.addCoins(z.coinValue);
        this.player.sessionCoins += z.coinValue;
        leaderboard.saveResult(this.player.score, this.wave);
      }

      // Pierce: bullet continues or dies
      if (b.onHitZombie()) {
        b.destroy();
      }
    });

    // Player picks up ammo — gives 1/5 mag to ALL weapons
    this.physics.add.overlap(this.player, this.pickups, (_player, pickup) => {
      const p = pickup as Pickup;
      this.player.addAmmoAll();
      p.destroy();
    });

    // Bullets collide with walls (rockets explode)
    this.physics.add.collider(this.bullets, this.walls, (bullet) => {
      const b = bullet as Bullet;
      if (b.aoeRadius > 0) {
        this.doAoeDamage(b.x, b.y, b.aoeRadius, b.damage);
      }
      b.destroy();
    });

    // Rocket explodes on max range
    this.events.on('bullet-explode', (b: Bullet) => {
      if (b.aoeRadius > 0) {
        this.doAoeDamage(b.x, b.y, b.aoeRadius, b.damage);
      }
    });

    // Spawn ammo pickups every 10-15 seconds at safe positions
    this.time.addEvent({
      delay: Phaser.Math.Between(10000, 15000),
      loop: true,
      callback: () => {
        const pos = this.getSafeSpawnPosition();
        const pickup = new Pickup(this, pos.x, pos.y, 'ammo');
        this.pickups.add(pickup);
      },
    });

    // Shooting (single shot on click)
    this.input.on('pointerdown', () => {
      this.fireWeapon();
    });

    // Player death
    this.events.on('player-died', () => {
      audioManager.stopGameMusic(1.5);
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', {
        score: this.player.score,
        kills: this.player.kills,
        wave: this.wave,
      });
    });

    // Start game music
    audioManager.resume();
    audioManager.startGameMusic();

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

    // Auto-fire: hold mouse for rifle/minigun
    if (this.input.activePointer.isDown && this.player.activeWeapon.def.auto) {
      this.fireWeapon();
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

  private fireWeapon() {
    if (this.shootCooldown > 0) return;

    const target = this.player.shoot();
    if (!target) return;

    const wDef = this.player.activeWeapon.def;
    const muzzle = this.player.getMuzzlePosition();
    const baseAngle = Phaser.Math.Angle.Between(muzzle.x, muzzle.y, target.x, target.y);

    const bulletConfig = {
      damage: wDef.damage,
      speed: wDef.bulletSpeed,
      maxRange: wDef.maxRange,
      pierce: wDef.pierce,
      aoeRadius: wDef.aoeRadius,
      texture: wDef.bulletTexture,
    };

    if (wDef.pellets > 1) {
      // Shotgun: multiple pellets in a fan
      const totalSpread = wDef.pelletSpread * (wDef.pellets - 1);
      const startAngle = baseAngle - Phaser.Math.DegToRad(totalSpread / 2);
      for (let i = 0; i < wDef.pellets; i++) {
        const angle = startAngle + Phaser.Math.DegToRad(wDef.pelletSpread * i);
        const tx = muzzle.x + Math.cos(angle) * 100;
        const ty = muzzle.y + Math.sin(angle) * 100;
        const b = new Bullet(this, muzzle.x, muzzle.y, tx, ty, bulletConfig);
        this.bullets.add(b);
      }
    } else {
      // Single bullet with optional spread
      let finalAngle = baseAngle;
      if (wDef.spread > 0) {
        const spreadRad = Phaser.Math.DegToRad(wDef.spread);
        finalAngle += (Math.random() - 0.5) * spreadRad * 2;
      }
      const tx = muzzle.x + Math.cos(finalAngle) * 100;
      const ty = muzzle.y + Math.sin(finalAngle) * 100;
      const b = new Bullet(this, muzzle.x, muzzle.y, tx, ty, bulletConfig);
      this.bullets.add(b);
    }

    this.shootCooldown = wDef.fireRate;
  }

  private doAoeDamage(x: number, y: number, radius: number, damage: number) {
    // Damage all zombies in radius
    this.zombies.getChildren().forEach((obj) => {
      const z = obj as Zombie;
      if (!z.active) return;
      const dist = Phaser.Math.Distance.Between(x, y, z.x, z.y);
      if (dist <= radius) {
        // Damage falls off with distance
        const falloff = 1 - (dist / radius) * 0.5;
        const killed = z.takeDamage(Math.round(damage * falloff));
        if (killed) {
          this.player.kills++;
          this.player.score += z.scoreValue;
          this.zombiesRemaining--;
          shop.addCoins(z.coinValue);
          this.player.sessionCoins += z.coinValue;
          leaderboard.saveResult(this.player.score, this.wave);
        }
      }
    });

    // Visual explosion effect
    const explosion = this.add.circle(x, y, radius, 0xff6600, 0.4);
    explosion.setDepth(9);
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => explosion.destroy(),
    });
  }

  private spawnWave() {
    const count = 5 + this.wave * 3;
    this.zombiesRemaining = count;

    // Increase music intensity with wave
    audioManager.updateIntensity(this.wave);

    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 300, () => {
        const pos = this.getSafeSpawnPosition();
        const type = this.getRandomZombieType();
        const zombie = new Zombie(this, pos.x, pos.y, type);
        zombie.wallsGroup = this.walls;
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

  private getSafeSpawnPosition(): { x: number; y: number } {
    // Try up to 20 times to find a position not inside a wall
    for (let attempt = 0; attempt < 20; attempt++) {
      const pos = this.getSpawnPosition();
      if (!this.isPositionBlocked(pos.x, pos.y)) {
        return pos;
      }
    }
    return this.getSpawnPosition();
  }

  private isPositionBlocked(x: number, y: number): boolean {
    const testRect = new Phaser.Geom.Rectangle(x - 16, y - 16, 32, 32);
    const walls = this.walls.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const wall of walls) {
      const wallRect = new Phaser.Geom.Rectangle(
        wall.x - wall.displayWidth / 2,
        wall.y - wall.displayHeight / 2,
        wall.displayWidth,
        wall.displayHeight
      );
      if (Phaser.Geom.Intersects.RectangleToRectangle(testRect, wallRect)) {
        return true;
      }
    }
    return false;
  }

  private getRandomZombieType(): ZombieType {
    const r = Math.random();
    if (this.wave >= 8) {
      // 30% walker, 35% runner, 35% tank
      if (r < 0.35) return 'tank';
      if (r < 0.70) return 'runner';
      return 'walker';
    } else if (this.wave >= 5) {
      // 40% walker, 35% runner, 25% tank
      if (r < 0.25) return 'tank';
      if (r < 0.60) return 'runner';
      return 'walker';
    } else if (this.wave >= 3) {
      // 60% walker, 30% runner, 10% tank
      if (r < 0.10) return 'tank';
      if (r < 0.40) return 'runner';
      return 'walker';
    }
    return 'walker';
  }

  private getSafePlayerSpawn(): { x: number; y: number } {
    const cx = this.mapSize / 2;
    const cy = this.mapSize / 2;
    // Try center first, then spiral outward
    for (let r = 0; r < 300; r += 20) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (!this.isPositionBlocked(x, y)) {
          return { x, y };
        }
      }
    }
    return { x: cx, y: cy };
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

      // Skip if too close to center (player spawn safe zone)
      const cx = this.mapSize / 2;
      const cy = this.mapSize / 2;
      if (Math.abs(bx - cx) < 200 && Math.abs(by - cy) < 200) continue;

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
