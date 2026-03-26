import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Zombie, ZombieType } from '../entities/Zombie';
import { Bullet } from '../entities/Bullet';
import { Pickup, PickupType } from '../entities/Pickup';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';
import { shop } from '../systems/ShopConfig';
import { bestiary } from '../systems/BestiaryManager';
import { getSelectedAbility, ABILITIES } from '../systems/AbilityConfig';

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
  private abilityId: string = 'big-bomb';
  private nukeMode = false;
  private nukeMarkers: Phaser.GameObjects.GameObject[] = [];
  private abilityActive = false;
  private playerShadow!: Phaser.GameObjects.Image;
  private zombieShadows: Map<Zombie, Phaser.GameObjects.Image> = new Map();
  private trees: Phaser.GameObjects.Image[] = [];

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
    const grassTiles = ['ground1', 'ground2', 'ground3', 'ground4', 'ground5'];
    for (let x = 0; x < this.mapSize; x += 64) {
      for (let y = 0; y < this.mapSize; y += 64) {
        this.add.image(x + 32, y + 32, grassTiles[Phaser.Math.Between(0, 4)]).setDepth(0);
      }
    }

    this.walls = this.physics.add.staticGroup();
    this.generateObstacles();

    // Scatter decorations AFTER walls are generated
    this.placeDecorations();

    this.zombies = this.add.group({ runChildUpdate: false });
    this.bullets = this.add.group({ runChildUpdate: false });
    this.pickups = this.add.group();

    // Safe player spawn
    const playerPos = this.getSafePlayerSpawn();
    this.player = new Player(this, playerPos.x, playerPos.y);

    // Shadow under player (updated in main update loop)
    this.playerShadow = this.add.image(this.player.x, this.player.y, 'shadow').setDepth(0.5).setAlpha(0.3).setScale(0.8);

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

      // Blood particles on hit
      this.spawnBloodParticles(z.x, z.y, 2);

      // Floating damage number
      this.showDamageNumber(z.x, z.y - 16, b.damage);

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
      if (p.pickupType === 'bandage') {
        this.player.addBandage();
      } else if (p.pickupType === 'medkit') {
        this.player.addMedkit();
      } else if (p.pickupType === 'wood') {
        this.player.wood++;
      } else if (p.pickupType === 'metal') {
        this.player.metal++;
      } else if (p.pickupType === 'screws') {
        this.player.screws++;
      } else {
        this.player.addAmmoAll();
      }
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

    // Bandage spawner — every 20 seconds
    this.time.addEvent({
      delay: 20000,
      loop: true,
      callback: () => {
        if (this.gameOver) return;
        const pos = this.getSafeSpawnPosition();
        this.pickups.add(new Pickup(this, pos.x, pos.y, 'bandage'));
      },
    });

    // Medkit spawner — every 45 seconds
    this.time.addEvent({
      delay: 45000,
      loop: true,
      callback: () => {
        if (this.gameOver) return;
        const pos = this.getSafeSpawnPosition();
        this.pickups.add(new Pickup(this, pos.x, pos.y, 'medkit'));
      },
    });

    // Ability
    this.abilityId = getSelectedAbility();
    this.nukeMode = false;
    this.abilityActive = false;
    const fKey = this.input.keyboard!.addKey('F');
    fKey.on('down', () => {
      if (!this.gameOver && !this.abilityActive) this.activateAbility();
    });

    // Shooting
    this.input.on('pointerdown', () => {
      if (this.nukeMode) {
        this.launchNuke();
        return;
      }
      if (!this.gameOver) this.fireWeapon();
    });

    // Player death — ONCE only
    this.events.once('player-died', () => {
      if (this.gameOver) return;
      this.gameOver = true;
      this.player.setActive(false);
      this.player.setVelocity(0, 0);
      this.physics.pause(); // stop all physics immediately
      const data = { score: this.player.score, kills: this.player.kills, wave: this.wave };
      leaderboard.saveResult(this.player.score, this.wave);
      // Save materials to localStorage
      localStorage.setItem('zombie-sim-materials', JSON.stringify({
        wood: this.player.wood, metal: this.player.metal, screws: this.player.screws,
      }));
      audioManager.stopGameMusic(1.5);
      // Wait for next frame then transition
      this.time.delayedCall(500, () => {
        this.scene.stop('UIScene');
        this.scene.launch('GameOverScene', data);
      });
    });

    audioManager.resume();
    audioManager.startGameMusic();
    this.scene.launch('UIScene', { gameScene: this });
    this.spawnWave();
  }

  update(_time: number, delta: number) {
    if (this.gameOver || !this.player?.active) return;

    this.player.update();

    // Update player shadow
    if (this.playerShadow) {
      this.playerShadow.setPosition(this.player.x, this.player.y + 4);
    }

    this.zombies.getChildren().forEach((z) => {
      const zombie = z as Zombie;
      zombie.update(this.player, _time, delta);
      // Update zombie shadow position
      const shadow = this.zombieShadows.get(zombie);
      if (shadow) {
        if (zombie.active) {
          shadow.setPosition(zombie.x, zombie.y + 4);
        } else {
          shadow.destroy();
          this.zombieShadows.delete(zombie);
        }
      }
    });

    if (this.shootCooldown > 0) this.shootCooldown -= delta;

    // Trees become semi-transparent when player is nearby
    for (const tree of this.trees) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, tree.x, tree.y);
      tree.setAlpha(dist < 60 ? 0.25 : 0.85);
    }

    // Auto-fire for rifle/minigun
    if (this.input.activePointer.isDown && this.player.activeWeapon.def.auto && !this.gameOver) {
      this.fireWeapon();
    }

    // Soft separation — push zombies apart only when deeply overlapping
    const allZombies = this.zombies.getChildren() as Zombie[];
    for (let i = 0; i < allZombies.length; i++) {
      const a = allZombies[i];
      if (!a.active) continue;
      for (let j = i + 1; j < allZombies.length; j++) {
        const b = allZombies[j];
        if (!b.active) continue;
        const dist = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
        if (dist < 20 && dist > 0) {
          const angle = Phaser.Math.Angle.Between(a.x, a.y, b.x, b.y);
          const push = (20 - dist) * 2;
          a.x -= Math.cos(angle) * push * 0.5;
          a.y -= Math.sin(angle) * push * 0.5;
          b.x += Math.cos(angle) * push * 0.5;
          b.y += Math.sin(angle) * push * 0.5;
        }
      }
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
    bestiary.unlock(z.zombieType);
    shop.addCoins(z.coinValue);
    this.player.sessionCoins += z.coinValue;

    // Clean up zombie shadow
    const deadShadow = this.zombieShadows.get(z);
    if (deadShadow) { deadShadow.destroy(); this.zombieShadows.delete(z); }

    // Blood splatter on ground
    this.spawnBloodParticles(z.x, z.y, 4);
    const splat = this.add.image(z.x, z.y, 'blood-splat').setDepth(0.8).setAlpha(0.6).setScale(Phaser.Math.FloatBetween(0.6, 1.2));
    splat.setAngle(Phaser.Math.Between(0, 360));
    // Fade blood splat over time
    this.tweens.add({ targets: splat, alpha: 0, duration: 15000, delay: 5000, onComplete: () => splat.destroy() });

    // Roll material drops independently
    const materialTypes: { type: PickupType; chance: number }[] = [
      { type: 'wood', chance: z.drops.wood },
      { type: 'metal', chance: z.drops.metal },
      { type: 'screws', chance: z.drops.screws },
    ];
    let dropOffset = 0;
    for (const mat of materialTypes) {
      if (Math.random() * 100 < mat.chance) {
        // Spread drops slightly so they don't stack on top of each other
        const ox = (dropOffset - 1) * 16;
        this.pickups.add(new Pickup(this, z.x + ox, z.y + 10, mat.type));
        dropOffset++;
      }
    }

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
    if (this.abilityActive) return;
    const ui = this.scene.get('UIScene') as any;
    if (ui?.adminConsole?.isOpen) return;
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
    const hasBoss = this.wave % 5 === 0; // boss every 5 waves
    this.zombiesRemaining = count + (hasBoss ? 1 : 0);
    audioManager.updateIntensity(this.wave);
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 300, () => {
        if (this.gameOver) return;
        const pos = this.getSafeSpawnPosition();
        const zombie = new Zombie(this, pos.x, pos.y, this.getRandomZombieType());
        zombie.wallsGroup = this.walls;
        this.zombies.add(zombie);
        this.addZombieShadow(zombie);
      });
    }
    // Spawn boss
    if (hasBoss) {
      this.time.delayedCall(count * 300 + 500, () => {
        if (this.gameOver) return;
        const pos = this.getSafeSpawnPosition();
        const zombie = new Zombie(this, pos.x, pos.y, 'boss');
        zombie.wallsGroup = this.walls;
        this.zombies.add(zombie);
        this.addZombieShadow(zombie);
      });
    }
  }

  // Admin: skip to specific wave
  adminSetWave(targetWave: number) {
    // Kill all zombies without giving score/coins
    const allZombies = this.zombies.getChildren().slice();
    for (const obj of allZombies) {
      const z = obj as Zombie;
      if (z.active) z.destroy();
    }
    this.zombiesRemaining = 0;
    this.waveDelay = false;
    this.wave = targetWave;
    this.spawnWave();
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
      radioactive: 'zombie-radioactive', kamikaze: 'zombie-kamikaze', boss: 'zombie-boss',
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
      this.addZombieShadow(zombie);
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

  // ========== ABILITIES ==========

  private activateAbility() {
    if (this.abilityId === 'big-bomb') this.useBigBomb();
    else if (this.abilityId === 'mini-nuke') this.enterNukeMode();
    else if (this.abilityId === 'cryo-capsule') this.useCryoCapsule();
  }

  // --- BIG BOMB ---
  private useBigBomb() {
    this.abilityActive = true;
    const bx = this.player.x;
    const by = this.player.y;

    // Bomb sprite
    const bomb = this.add.image(bx, by, 'ability-bomb').setDepth(12).setScale(1.5);
    const timerText = this.add.text(bx, by - 30, '3', {
      fontSize: '28px', fontFamily: 'monospace', color: '#ff6600', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(12);

    // Pulsing animation
    this.tweens.add({ targets: bomb, scaleX: 1.7, scaleY: 1.7, duration: 300, yoyo: true, repeat: -1 });

    let countdown = 3;
    this.time.addEvent({
      delay: 1000, repeat: 2,
      callback: () => {
        countdown--;
        timerText.setText(countdown > 0 ? countdown.toString() : '💥');
      },
    });

    this.time.delayedCall(3000, () => {
      bomb.destroy();
      timerText.destroy();

      // Explosion visual
      this.cameras.main.shake(500, 0.02);
      this.cameras.main.flash(300, 255, 100, 0);
      const expl = this.add.circle(bx, by, 400, 0xff6600, 0.5).setDepth(9);
      this.tweens.add({
        targets: expl, alpha: 0, scale: 1.5, duration: 600,
        onComplete: () => expl.destroy(),
      });

      // 300 damage in radius 400
      const targets = this.zombies.getChildren().slice();
      for (const obj of targets) {
        const z = obj as Zombie;
        if (!z.active) continue;
        const dist = Phaser.Math.Distance.Between(bx, by, z.x, z.y);
        if (dist <= 400) {
          const killed = z.takeDamage(300);
          if (killed) this.onZombieKilled(z);
        }
      }
      this.abilityActive = false;
    });
  }

  // --- MINI NUKE ---
  private enterNukeMode() {
    this.abilityActive = true;
    this.nukeMode = true;

    // Zoom out to show entire map
    const cam = this.cameras.main;
    cam.stopFollow();
    const targetZoom = Math.min(cam.width / this.mapSize, cam.height / this.mapSize);

    this.tweens.add({
      targets: cam, zoom: targetZoom, scrollX: 0, scrollY: 0,
      duration: 800, ease: 'Quad.easeOut',
      onComplete: () => {
        cam.setScroll(0, 0);
      },
    });

    // Mark all zombies with neon markers
    const typeColors: Record<string, number> = {
      walker: 0x556b2f, runner: 0x7a8b3f, tank: 0x3a4a1f,
      radioactive: 0x33ff33, kamikaze: 0xff3333, boss: 0x8800aa,
    };

    this.nukeMarkers = [];
    this.zombies.getChildren().forEach((obj) => {
      const z = obj as Zombie;
      if (!z.active) return;
      const color = typeColors[z.zombieType] || 0xffffff;
      const marker = this.add.circle(z.x, z.y, 12, color, 0.6).setDepth(20);
      const glow = this.add.circle(z.x, z.y, 18, color, 0.2).setDepth(19);
      this.tweens.add({ targets: glow, alpha: 0.05, duration: 600, yoyo: true, repeat: -1 });
      const label = this.add.text(z.x, z.y - 20, z.zombieType.toUpperCase(), {
        fontSize: '10px', fontFamily: 'monospace', color: '#ffffff',
        shadow: { offsetX: 0, offsetY: 0, color: '#000000', blur: 4, fill: true },
      }).setOrigin(0.5).setDepth(20);
      this.nukeMarkers.push(marker, glow, label);
    });

    // Hint
    const hint = this.add.text(cam.width / 2, cam.height - 40, 'CLICK TO LAUNCH NUKE  |  ESC to cancel', {
      fontSize: '18px', fontFamily: 'monospace', color: '#ff4444',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    this.nukeMarkers.push(hint);

    // ESC to cancel
    const escKey = this.input.keyboard!.addKey('ESC');
    const escHandler = () => {
      if (this.nukeMode) {
        this.exitNukeMode();
      }
    };
    escKey.once('down', escHandler);
  }

  private launchNuke() {
    if (!this.nukeMode) return;
    const worldPoint = this.cameras.main.getWorldPoint(
      this.input.activePointer.x, this.input.activePointer.y
    );
    const tx = Phaser.Math.Clamp(worldPoint.x, 50, this.mapSize - 50);
    const ty = Phaser.Math.Clamp(worldPoint.y, 50, this.mapSize - 50);

    // Clean markers
    this.clearNukeMarkers();
    this.nukeMode = false;

    // Show target crosshair
    const cross = this.add.graphics().setDepth(20);
    cross.lineStyle(2, 0xff0000, 0.8);
    cross.strokeCircle(tx, ty, 20);
    cross.lineBetween(tx - 30, ty, tx + 30, ty);
    cross.lineBetween(tx, ty - 30, tx, ty + 30);

    // Rocket approaching (from top)
    const rocket = this.add.image(tx, -100, 'ability-nuke').setDepth(20).setScale(2).setAngle(90);
    const countdownText = this.add.text(tx, ty - 40, '5', {
      fontSize: '32px', fontFamily: 'monospace', color: '#ff4444', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(20);

    let countdown = 5;
    this.time.addEvent({
      delay: 1000, repeat: 4,
      callback: () => {
        countdown--;
        countdownText.setText(countdown > 0 ? countdown.toString() : '☢️');
      },
    });

    // Rocket flies to target over 5 seconds
    this.tweens.add({
      targets: rocket, x: tx, y: ty, duration: 5000, ease: 'Quad.easeIn',
    });

    this.time.delayedCall(5000, () => {
      rocket.destroy();
      cross.destroy();
      countdownText.destroy();

      // NUKE EXPLOSION
      const nukeRadius = 1000;
      this.cameras.main.shake(1000, 0.04);
      this.cameras.main.flash(600, 255, 255, 200);

      // Visual: expanding fireball
      const fireball = this.add.circle(tx, ty, 50, 0xffcc00, 0.8).setDepth(15);
      this.tweens.add({
        targets: fireball, radius: nukeRadius, alpha: 0, duration: 1000,
        onUpdate: () => { fireball.setRadius((fireball as any).radius || 50); },
        onComplete: () => fireball.destroy(),
      });
      const ring = this.add.circle(tx, ty, 10, 0xff3300, 0.4).setDepth(15);
      this.tweens.add({
        targets: ring, radius: nukeRadius * 1.2, alpha: 0, duration: 800,
        onUpdate: () => { ring.setRadius((ring as any).radius || 10); },
        onComplete: () => ring.destroy(),
      });

      // 500 damage in radius
      const targets = this.zombies.getChildren().slice();
      for (const obj of targets) {
        const z = obj as Zombie;
        if (!z.active) continue;
        const dist = Phaser.Math.Distance.Between(tx, ty, z.x, z.y);
        if (dist <= nukeRadius) {
          const killed = z.takeDamage(500);
          if (killed) this.onZombieKilled(z);
        }
      }

      // Radiation patches — cover most of explosion zone
      const patchCount = Phaser.Math.Between(25, 35);
      for (let i = 0; i < patchCount; i++) {
        // Spread evenly across the blast zone
        const angle = Math.random() * Math.PI * 2;
        const dist2 = Math.random() * nukeRadius * 0.85;
        const px = tx + Math.cos(angle) * dist2;
        const py = ty + Math.sin(angle) * dist2;
        const patch = this.add.image(px, py, 'nuke-radiation').setDepth(1).setAlpha(0.5).setScale(Phaser.Math.FloatBetween(4, 8));
        const patchRadius = 80;
        let elapsed = 0;
        const dmgEvent = this.time.addEvent({
          delay: 500, loop: true,
          callback: () => {
            elapsed += 500;
            if (elapsed >= 8000 || this.gameOver) {
              dmgEvent.destroy(); patch.destroy(); return;
            }
            // Damage zombies in patch
            this.zombies.getChildren().forEach((obj) => {
              const z = obj as Zombie;
              if (!z.active) return;
              if (Phaser.Math.Distance.Between(px, py, z.x, z.y) < patchRadius) {
                const killed = z.takeDamage(10);
                if (killed) this.onZombieKilled(z);
              }
            });
            patch.setAlpha(0.6 * (1 - elapsed / 8000));
          },
        });
      }

      // Return camera to player
      this.time.delayedCall(800, () => {
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.tweens.add({
          targets: this.cameras.main, zoom: 1.5, duration: 600, ease: 'Quad.easeOut',
        });
        this.abilityActive = false;
      });
    });
  }

  private exitNukeMode() {
    this.nukeMode = false;
    this.clearNukeMarkers();
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.tweens.add({
      targets: this.cameras.main, zoom: 1.5, duration: 600, ease: 'Quad.easeOut',
    });
    this.abilityActive = false;
  }

  private clearNukeMarkers() {
    for (const m of this.nukeMarkers) m.destroy();
    this.nukeMarkers = [];
  }

  // --- CRYO CAPSULE ---
  private useCryoCapsule() {
    this.abilityActive = true;

    // Blue flash
    this.cameras.main.flash(400, 50, 150, 255);

    // Freeze overlay
    const cam = this.cameras.main;
    const overlay = this.add.rectangle(this.mapSize / 2, this.mapSize / 2, this.mapSize, this.mapSize, 0x44ccff, 0.15).setDepth(8);

    // Ice particles
    for (let i = 0; i < 30; i++) {
      const px = Phaser.Math.Between(0, this.mapSize);
      const py = Phaser.Math.Between(0, this.mapSize);
      const ice = this.add.image(px, py, 'ability-cryo').setDepth(9).setAlpha(0.4).setScale(Phaser.Math.FloatBetween(0.3, 0.8));
      this.tweens.add({
        targets: ice, alpha: 0, y: py - 30, duration: 2000,
        onComplete: () => ice.destroy(),
      });
    }

    // Freeze all zombies + 50 damage
    const targets = this.zombies.getChildren().slice();
    for (const obj of targets) {
      const z = obj as Zombie;
      if (!z.active) continue;
      const killed = z.takeDamage(50);
      if (killed) {
        this.onZombieKilled(z);
      } else {
        z.freeze(5000);
      }
    }

    // Remove overlay after freeze ends
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: overlay, alpha: 0, duration: 500,
        onComplete: () => overlay.destroy(),
      });
      this.abilityActive = false;
    });
  }

  // === VISUAL EFFECTS HELPERS ===

  private spawnBloodParticles(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const p = this.add.image(x, y, 'particle-blood').setDepth(10).setScale(Phaser.Math.FloatBetween(0.5, 1.2));
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.FloatBetween(8, 24);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(200, 500),
        onComplete: () => p.destroy(),
      });
    }
  }

  private showDamageNumber(x: number, y: number, damage: number) {
    const color = damage >= 50 ? '#ff4444' : damage >= 20 ? '#ffaa00' : '#ffffff';
    const size = damage >= 50 ? '18px' : damage >= 20 ? '14px' : '12px';
    const txt = this.add.text(x, y, `-${damage}`, {
      fontSize: size, fontFamily: 'monospace', color: color, fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true },
    }).setOrigin(0.5).setDepth(11);
    this.tweens.add({
      targets: txt,
      y: y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  private addZombieShadow(zombie: Zombie) {
    const scale = zombie.zombieType === 'boss' || zombie.zombieType === 'tank' ? 1.0 : 0.7;
    const shadow = this.add.image(zombie.x, zombie.y, 'shadow').setDepth(0.5).setAlpha(0.25).setScale(scale);
    this.zombieShadows.set(zombie, shadow);
  }

  private placeDecorations() {
    this.trees = [];
    const cx = this.mapSize / 2, cy = this.mapSize / 2;

    // Trees — larger, tracked for transparency effect
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(150, this.mapSize - 150);
      const y = Phaser.Math.Between(150, this.mapSize - 150);
      if (Math.abs(x - cx) < 200 && Math.abs(y - cy) < 200) continue;
      if (this.isPositionBlocked(x, y)) continue;
      const tree = this.add.image(x, y, 'deco-dead-tree')
        .setDepth(12)  // above player so it overlaps
        .setScale(Phaser.Math.FloatBetween(2.0, 3.5))
        .setAlpha(0.85);
      this.trees.push(tree);
    }

    // Other decorations
    const decoTypes = [
      { key: 'deco-bush', count: 12, scale: 0.8, depth: 0.9 },
      { key: 'deco-rock', count: 10, scale: 0.7, depth: 0.9 },
      { key: 'deco-barrel', count: 5, scale: 0.8, depth: 1.5 },
      { key: 'deco-crate', count: 4, scale: 0.8, depth: 1.5 },
    ];
    for (const deco of decoTypes) {
      for (let i = 0; i < deco.count; i++) {
        const x = Phaser.Math.Between(120, this.mapSize - 120);
        const y = Phaser.Math.Between(120, this.mapSize - 120);
        if (Math.abs(x - cx) < 150 && Math.abs(y - cy) < 150) continue;
        if (this.isPositionBlocked(x, y)) continue;
        this.add.image(x, y, deco.key)
          .setDepth(deco.depth)
          .setScale(Phaser.Math.FloatBetween(deco.scale * 0.8, deco.scale * 1.2))
          .setAngle(Phaser.Math.Between(0, 360))
          .setAlpha(Phaser.Math.FloatBetween(0.6, 0.9));
      }
    }
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
