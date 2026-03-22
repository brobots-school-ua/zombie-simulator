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
  private gameOver = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.wave = 1;
    this.shootCooldown = 0;
    this.waveDelay = false;
    this.gameOver = false;

    this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize);

    // Ground tiles
    const grassTiles = ['ground1', 'ground2', 'ground3'];
    for (let x = 0; x < this.mapSize; x += 64) {
      for (let y = 0; y < this.mapSize; y += 64) {
        this.add.image(x + 32, y + 32, grassTiles[Phaser.Math.Between(0, 2)]).setDepth(0);
      }
    }

    this.walls = this.physics.add.staticGroup();
    this.generateObstacles();

    this.zombies = this.add.group({ runChildUpdate: false });
    this.bullets = this.add.group({ runChildUpdate: false });
    this.pickups = this.add.group();

    // Safe player spawn
    const playerPos = this.getSafePlayerSpawn();
    this.player = new Player(this, playerPos.x, playerPos.y);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize);
    this.cameras.main.setZoom(1.5);

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.zombies, this.walls);
    // Zombies collide with player
    this.physics.add.collider(this.player, this.zombies, (_player, zombie) => {
      if (this.gameOver) return;
      const z = zombie as Zombie;
      if (!z.active) return;

      // Kamikaze explodes on contact!
      if (z.explodeOnContact) {
        this.doAoeDamage(z.x, z.y, 70, 50);
        this.onZombieKilled(z);
        z.destroy();
        return;
      }

      if (z.canAttack()) {
        this.player.takeDamage(z.damage);
      }
    });

    // Bullet hits zombie
    this.physics.add.overlap(this.bullets, this.zombies, (bullet, zombie) => {
      if (this.gameOver) return;
      const b = bullet as Bullet;
      const z = zombie as Zombie;
      if (!b.active || !z.active) return;

      if (b.aoeRadius > 0) {
        this.doAoeDamage(b.x, b.y, b.aoeRadius, b.damage);
        b.destroy();
        return;
      }

      const killed = z.takeDamage(b.damage);
      if (killed) {
        this.onZombieKilled(z);
      }

      if (b.onHitZombie()) {
        b.destroy();
      }
    });

    // Pickups
    this.physics.add.overlap(this.player, this.pickups, (_player, pickup) => {
      const p = pickup as Pickup;
      if (!p.active) return;
      this.player.addAmmoAll();
      p.destroy();
    });

    // Bullets hit walls
    this.physics.add.collider(this.bullets, this.walls, (bullet) => {
      const b = bullet as Bullet;
      if (!b.active) return;
      if (b.aoeRadius > 0) {
        this.doAoeDamage(b.x, b.y, b.aoeRadius, b.damage);
      }
      b.destroy();
    });

    // Ammo spawner
    this.time.addEvent({
      delay: Phaser.Math.Between(10000, 15000),
      loop: true,
      callback: () => {
        if (this.gameOver) return;
        const pos = this.getSafeSpawnPosition();
        this.pickups.add(new Pickup(this, pos.x, pos.y, 'ammo'));
      },
    });

    // Shooting
    this.input.on('pointerdown', () => {
      if (!this.gameOver) this.fireWeapon();
    });

    // Player death — ONCE only
    this.events.once('player-died', () => {
      if (this.gameOver) return;
      this.gameOver = true;
      this.player.setActive(false);
      this.player.setVelocity(0, 0);
      const data = { score: this.player.score, kills: this.player.kills, wave: this.wave };
      leaderboard.saveResult(this.player.score, this.wave);
      audioManager.stopGameMusic(1.5);
      // Use setTimeout to guarantee execution outside physics step
      setTimeout(() => {
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', data);
        this.scene.stop('GameScene');
      }, 150);
    });

    audioManager.resume();
    audioManager.startGameMusic();
    this.scene.launch('UIScene', { gameScene: this });
    this.spawnWave();
  }

  update(_time: number, delta: number) {
    if (this.gameOver || !this.player?.active) return;

    this.player.update();

    this.zombies.getChildren().forEach((z) => {
      (z as Zombie).update(this.player, _time, delta);
    });

    if (this.shootCooldown > 0) this.shootCooldown -= delta;

    // Auto-fire for rifle/minigun
    if (this.input.activePointer.isDown && this.player.activeWeapon.def.auto && !this.gameOver) {
      this.fireWeapon();
    }

    // Wave check
    if (this.zombiesRemaining <= 0 && !this.waveDelay) {
      this.waveDelay = true;
      this.wave++;
      this.time.delayedCall(3000, () => {
        if (!this.gameOver) { this.spawnWave(); this.waveDelay = false; }
      });
    }
  }

  private onZombieKilled(z: Zombie) {
    this.player.kills++;
    this.player.score += z.scoreValue;
    this.zombiesRemaining--;
    shop.addCoins(z.coinValue);
    this.player.sessionCoins += z.coinValue;

    // Kamikaze explodes when killed by bullets
    if (z.explodeOnDeath) {
      const dist = Phaser.Math.Distance.Between(z.x, z.y, this.player.x, this.player.y);
      if (dist < 40) {
        this.player.takeDamage(35);
      }
      // Visual explosion
      const expl = this.add.circle(z.x, z.y, 40, 0xff3300, 0.5).setDepth(9);
      this.tweens.add({ targets: expl, alpha: 0, scale: 1.5, duration: 300, onComplete: () => expl.destroy() });
    }

    // Radioactive leaves toxic puddle on death
    if (z.leavePuddle) {
      this.createToxicPuddle(z.x, z.y);
    }
  }

  private createToxicPuddle(x: number, y: number) {
    const puddle = this.add.image(x, y, 'toxic-puddle').setDepth(1).setAlpha(0.8);
    const puddleRadius = 40;
    const duration = 5000;
    let elapsed = 0;

    // Damage timer
    const damageEvent = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        elapsed += 500;
        if (elapsed >= duration || this.gameOver) {
          damageEvent.destroy();
          puddle.destroy();
          return;
        }
        const dist = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        if (dist < puddleRadius) {
          this.player.takeDamage(5); // 10 HP/sec (every 500ms)
        }
        puddle.setAlpha(0.8 * (1 - elapsed / duration));
      },
    });
  }

  private fireWeapon() {
    if (this.shootCooldown > 0) return;
    const target = this.player.shoot();
    if (!target) return;

    const wDef = this.player.activeWeapon.def;
    const muzzle = this.player.getMuzzlePosition();
    const baseAngle = Phaser.Math.Angle.Between(muzzle.x, muzzle.y, target.x, target.y);
    const cfg = { damage: wDef.damage, speed: wDef.bulletSpeed, maxRange: wDef.maxRange, pierce: wDef.pierce, aoeRadius: wDef.aoeRadius, texture: wDef.bulletTexture };

    if (wDef.pellets > 1) {
      const total = wDef.pelletSpread * (wDef.pellets - 1);
      const start = baseAngle - Phaser.Math.DegToRad(total / 2);
      for (let i = 0; i < wDef.pellets; i++) {
        const a = start + Phaser.Math.DegToRad(wDef.pelletSpread * i);
        this.bullets.add(new Bullet(this, muzzle.x, muzzle.y, muzzle.x + Math.cos(a) * 100, muzzle.y + Math.sin(a) * 100, cfg));
      }
    } else {
      let a = baseAngle;
      if (wDef.spread > 0) a += (Math.random() - 0.5) * Phaser.Math.DegToRad(wDef.spread) * 2;
      this.bullets.add(new Bullet(this, muzzle.x, muzzle.y, muzzle.x + Math.cos(a) * 100, muzzle.y + Math.sin(a) * 100, cfg));
    }
    this.shootCooldown = wDef.fireRate;
  }

  private doAoeDamage(x: number, y: number, radius: number, damage: number) {
    const targets = this.zombies.getChildren().slice();
    for (const obj of targets) {
      const z = obj as Zombie;
      if (!z.active) continue;
      const dist = Phaser.Math.Distance.Between(x, y, z.x, z.y);
      if (dist <= radius) {
        const killed = z.takeDamage(damage);
        if (killed) this.onZombieKilled(z);
      }
    }
    const expl = this.add.circle(x, y, radius, 0xff6600, 0.4).setDepth(9);
    this.tweens.add({ targets: expl, alpha: 0, scale: 1.5, duration: 300, onComplete: () => expl.destroy() });
  }

  private spawnWave() {
    const count = 5 + this.wave * 3;
    this.zombiesRemaining = count;
    audioManager.updateIntensity(this.wave);
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 300, () => {
        if (this.gameOver) return;
        const pos = this.getSafeSpawnPosition();
        const zombie = new Zombie(this, pos.x, pos.y, this.getRandomZombieType());
        zombie.wallsGroup = this.walls;
        this.zombies.add(zombie);
      });
    }
  }

  // Admin spawn: multiple zombies around player
  adminSpawnZombies(type: ZombieType, count: number) {
    const px = this.player.x;
    const py = this.player.y;

    // Calculate positions: first at player, rest in a circle around
    const positions: { x: number; y: number }[] = [];
    positions.push({ x: px, y: py });
    for (let i = 1; i < count; i++) {
      const angle = ((i - 1) / (count - 1)) * Math.PI * 2;
      positions.push({
        x: px + Math.cos(angle) * 80,
        y: py + Math.sin(angle) * 80,
      });
    }

    // Find safe spot for each and spawn with marker
    for (const pos of positions) {
      const safe = this.findSafePosition(pos.x, pos.y);
      this.spawnWithMarker(type, safe.x, safe.y);
    }
  }

  private findSafePosition(x: number, y: number): { x: number; y: number } {
    if (!this.isPositionBlocked(x, y)) return { x, y };
    for (let r = 64; r <= 320; r += 32) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const tx = x + Math.cos(a) * r;
        const ty = y + Math.sin(a) * r;
        if (tx > 80 && tx < this.mapSize - 80 && ty > 80 && ty < this.mapSize - 80 && !this.isPositionBlocked(tx, ty)) {
          return { x: tx, y: ty };
        }
      }
    }
    return { x, y };
  }

  private spawnWithMarker(type: ZombieType, x: number, y: number) {
    const marker = this.add.circle(x, y, 16, 0xff0000, 0.4).setDepth(3);
    const markerBorder = this.add.circle(x, y, 16).setDepth(3);
    markerBorder.setStrokeStyle(2, 0xff0000, 0.8);

    const textures: Record<string, string> = {
      walker: 'zombie-walker', runner: 'zombie-runner', tank: 'zombie-tank',
      radioactive: 'zombie-radioactive', kamikaze: 'zombie-kamikaze',
    };
    const preview = this.add.sprite(x, y - 20, textures[type] || 'zombie-walker').setDepth(4).setAlpha(0.5);

    const timerText = this.add.text(x, y + 20, '5', {
      fontSize: '20px', fontFamily: 'monospace', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(4);

    let countdown = 5;
    this.time.addEvent({
      delay: 1000,
      repeat: 4,
      callback: () => {
        countdown--;
        timerText.setText(countdown.toString());
        this.tweens.add({ targets: marker, alpha: 0.1, duration: 200, yoyo: true });
      },
    });

    this.time.delayedCall(5000, () => {
      marker.destroy();
      markerBorder.destroy();
      preview.destroy();
      timerText.destroy();

      if (this.gameOver) return;
      const zombie = new Zombie(this, x, y, type);
      zombie.wallsGroup = this.walls;
      this.zombies.add(zombie);
      this.zombiesRemaining++;
    });
  }

  private getSafePlayerSpawn(): { x: number; y: number } {
    const cx = this.mapSize / 2, cy = this.mapSize / 2;
    for (let r = 0; r < 300; r += 20) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        if (!this.isPositionBlocked(x, y)) return { x, y };
      }
    }
    return { x: cx, y: cy };
  }

  private getSpawnPosition(): { x: number; y: number } {
    const cam = this.cameras.main;
    const m = 100;
    const side = Phaser.Math.Between(0, 3);
    let x: number, y: number;
    switch (side) {
      case 0: x = Phaser.Math.Between(cam.scrollX - m, cam.scrollX + cam.width + m); y = cam.scrollY - m; break;
      case 1: x = cam.scrollX + cam.width + m; y = Phaser.Math.Between(cam.scrollY - m, cam.scrollY + cam.height + m); break;
      case 2: x = Phaser.Math.Between(cam.scrollX - m, cam.scrollX + cam.width + m); y = cam.scrollY + cam.height + m; break;
      default: x = cam.scrollX - m; y = Phaser.Math.Between(cam.scrollY - m, cam.scrollY + cam.height + m);
    }
    return { x: Phaser.Math.Clamp(x, 50, this.mapSize - 50), y: Phaser.Math.Clamp(y, 50, this.mapSize - 50) };
  }

  private getSafeSpawnPosition(): { x: number; y: number } {
    for (let i = 0; i < 20; i++) {
      const pos = this.getSpawnPosition();
      if (!this.isPositionBlocked(pos.x, pos.y)) return pos;
    }
    return this.getSpawnPosition();
  }

  private isPositionBlocked(x: number, y: number): boolean {
    const r = new Phaser.Geom.Rectangle(x - 16, y - 16, 32, 32);
    for (const wall of this.walls.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(r, new Phaser.Geom.Rectangle(wall.x - wall.displayWidth / 2, wall.y - wall.displayHeight / 2, wall.displayWidth, wall.displayHeight))) return true;
    }
    return false;
  }

  private getRandomZombieType(): ZombieType {
    const r = Math.random();
    if (this.wave >= 8) {
      // 20% walker, 20% runner, 25% tank, 15% radioactive, 20% kamikaze
      if (r < 0.20) return 'kamikaze';
      if (r < 0.35) return 'radioactive';
      if (r < 0.60) return 'tank';
      if (r < 0.80) return 'runner';
      return 'walker';
    }
    if (this.wave >= 5) {
      // 25% walker, 25% runner, 20% tank, 15% radioactive, 15% kamikaze
      if (r < 0.15) return 'kamikaze';
      if (r < 0.30) return 'radioactive';
      if (r < 0.50) return 'tank';
      if (r < 0.75) return 'runner';
      return 'walker';
    }
    if (this.wave >= 4) {
      // 35% walker, 30% runner, 15% tank, 15% radioactive, 5% kamikaze
      if (r < 0.05) return 'kamikaze';
      if (r < 0.20) return 'radioactive';
      if (r < 0.35) return 'tank';
      if (r < 0.65) return 'runner';
      return 'walker';
    }
    if (this.wave >= 3) {
      // 60% walker, 30% runner, 10% tank
      if (r < 0.10) return 'tank';
      if (r < 0.40) return 'runner';
      return 'walker';
    }
    return 'walker';
  }

  private generateObstacles() {
    for (let i = 0; i < this.mapSize; i += 64) {
      (this.walls.create(i + 32, 32, 'wall') as Phaser.Physics.Arcade.Sprite).setDepth(2).refreshBody();
      (this.walls.create(i + 32, this.mapSize - 32, 'wall') as Phaser.Physics.Arcade.Sprite).setDepth(2).refreshBody();
      (this.walls.create(32, i + 32, 'wall') as Phaser.Physics.Arcade.Sprite).setDepth(2).refreshBody();
      (this.walls.create(this.mapSize - 32, i + 32, 'wall') as Phaser.Physics.Arcade.Sprite).setDepth(2).refreshBody();
    }
    const count = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const bx = Phaser.Math.Between(200, this.mapSize - 200);
      const by = Phaser.Math.Between(200, this.mapSize - 200);
      const cx = this.mapSize / 2, cy = this.mapSize / 2;
      if (Math.abs(bx - cx) < 200 && Math.abs(by - cy) < 200) continue;
      const bw = Phaser.Math.Between(1, 4), bh = Phaser.Math.Between(1, 3);
      for (let wx = 0; wx < bw; wx++) {
        for (let wy = 0; wy < bh; wy++) {
          (this.walls.create(bx + wx * 64, by + wy * 64, 'wall') as Phaser.Physics.Arcade.Sprite).setDepth(2).refreshBody();
        }
      }
    }
  }
}
