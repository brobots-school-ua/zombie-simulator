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
import { getLocationForWave, shouldChangeLocation, LocationDef } from '../systems/LocationConfig';
import { profile } from '../systems/ProfileManager';
import { Pathfinder } from '../systems/Pathfinder';

// === Building system types ===
interface DoorData {
  sprite: Phaser.Physics.Arcade.Sprite;
  isOpen: boolean;
  broken: boolean;  // true = зламана зомбі, не можна відновити
  breakMs: number;  // zombie contact time in ms
}

interface BuildingInfo {
  interiorBounds: Phaser.Geom.Rectangle;
  roof: Phaser.GameObjects.Graphics;
  doors: DoorData[];
}

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
  abilityCharge: number = 0;
  private xpOrbs: Phaser.GameObjects.Group | null = null;
  private playerShadow!: Phaser.GameObjects.Image;
  private zombieShadows: Map<Zombie, Phaser.GameObjects.Image> = new Map();
  private trees: Phaser.GameObjects.Image[] = [];
  private groundTiles: Phaser.GameObjects.Image[] = [];
  private decorations: Phaser.GameObjects.Image[] = [];
  private activeDmgNumbers: Phaser.GameObjects.Text[] = [];
  private location!: LocationDef;
  private incomingPlayerState: any = null;
  private alleySpawnPoints: { x: number; y: number }[] = [];
  private changingLocation = false;

  // Buildings + doors
  private buildings: BuildingInfo[] = [];
  private doorsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private interactHint!: Phaser.GameObjects.Text;

  // Trader NPC
  private trader?: Phaser.GameObjects.Sprite;
  private traderShopDiv?: HTMLDivElement;
  private traderShopOpen = false;

  // Pathfinding
  private pathfinder!: Pathfinder;
  private pathQueue: Zombie[] = [];  // zombies waiting for path recalc
  private pathBatchTimer = 0;        // ms between batch processings

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data?: { wave?: number; playerState?: any }) {
    this.wave = data?.wave ?? 1;
    this.incomingPlayerState = data?.playerState ?? null;
    this.location = getLocationForWave(this.wave);

    // Reset ALL state
    this.shootCooldown = 0;
    this.waveDelay = false;
    this.gameOver = false;
    this.alleySpawnPoints = [];
    this.zombieShadows = new Map();
    this.trees = [];
    this.groundTiles = [];
    this.decorations = [];
    this.activeDmgNumbers = [];
    this.nukeMarkers = [];
    this.wallGridSet = new Set();
    this.nukeMode = false;
    this.abilityActive = false;
    this.abilityCharge = 0;
    this.changingLocation = false;

    this.mapSize = this.location.mapSize;
    this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize);

    // === BUILD MAP ===
    this.buildMap();

    this.walls = this.physics.add.staticGroup();
    this.doorsGroup = this.physics.add.staticGroup();
    this.buildings = [];
    this.traderShopOpen = false;
    this.trader = undefined;

    this.generateMap();

    // === GROUPS (must be before placeFieldHouses which spawns pickups) ===
    this.zombies = this.add.group({ runChildUpdate: false });
    this.bullets = this.add.group({ runChildUpdate: false });
    this.pickups = this.add.group();
    this.xpOrbs = this.add.group();

    if (this.location.id === 'field') this.placeFieldHouses();
    // Decorations placed AFTER buildings so we can skip positions inside them
    this.placeDecorations();

    // === PLAYER at fixed center ===
    const cx = this.mapSize / 2;
    const cy = this.mapSize / 2;
    this.player = new Player(this, cx, cy);

    // Load saved materials from profile into player at game start
    const savedMat = profile.getMaterials();
    console.log('[LOAD] profile materials at game start:', JSON.stringify(savedMat));
    this.player.wood = savedMat.wood;
    this.player.metal = savedMat.metal;
    this.player.screws = savedMat.screws;

    // Restore from EXIT TO MENU backup if it has higher values (safety net)
    const exitBackupRaw = localStorage.getItem('zombie-exit-materials');
    if (exitBackupRaw && !this.incomingPlayerState) {
      try {
        const b = JSON.parse(exitBackupRaw) as { wood: number; metal: number; screws: number };
        if ((b.wood || 0) > this.player.wood) this.player.wood = b.wood;
        if ((b.metal || 0) > this.player.metal) this.player.metal = b.metal;
        if ((b.screws || 0) > this.player.screws) this.player.screws = b.screws;
        console.log('[LOAD] backup materials applied:', JSON.stringify(b));
        profile.setMaterials({ wood: this.player.wood, metal: this.player.metal, screws: this.player.screws });
      } catch { /* ignore parse errors */ }
      localStorage.removeItem('zombie-exit-materials');
    }

    if (this.incomingPlayerState) {
      const s = this.incomingPlayerState;
      this.player.hp = s.hp;
      this.player.maxHp = s.maxHp;
      this.player.score = s.score;
      this.player.kills = s.kills;
      this.player.sessionKills = s.sessionKills;
      this.player.bandages = s.bandages;
      this.player.medkits = s.medkits;
      this.player.wood = s.wood;
      this.player.metal = s.metal;
      this.player.screws = s.screws;
      if (s.weapons) {
        this.player.weapons = s.weapons;
        this.player.activeWeaponIndex = s.activeWeaponIndex ?? 0;
      }
      this.incomingPlayerState = null;
    }

    this.playerShadow = this.add.image(this.player.x, this.player.y, 'shadow').setDepth(0.5).setAlpha(0.3).setScale(0.8);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize);
    this.cameras.main.setZoom(1.5);

    // E key (event-based, more reliable than JustDown across parallel scenes)
    this.input.keyboard!.on('keydown-E', () => this.handleEKey());
    this.interactHint = this.add.text(0, 0, '[E]', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffff66',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(200).setScrollFactor(1).setVisible(false).setOrigin(0.5, 1);

    // === PHYSICS ===
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.zombies, this.walls);
    this.physics.add.collider(this.player, this.doorsGroup);
    this.physics.add.collider(this.zombies, this.doorsGroup);
    // Bullets stop at closed doors
    this.physics.add.collider(this.bullets, this.doorsGroup, (bullet) => {
      const b = bullet as Bullet;
      if (!b.active) return;
      if (b.aoeRadius > 0) this.doAoeDamage(b.x, b.y, b.aoeRadius, b.damage);
      b.destroy();
    });

    this.physics.add.collider(this.player, this.zombies, (_player, zombie) => {
      if (this.gameOver) return;
      const z = zombie as Zombie;
      if (!z.active) return;
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
      // Skip if bullet already hit this zombie (prevents multi-hit on same target)
      const zId = (z as any).__bulletId ?? ((z as any).__bulletId = Math.random());
      if (b.hasHitTarget(zId)) { b.destroy(); return; }
      const killed = z.takeDamage(b.damage);
      this.spawnBloodParticles(z.x, z.y, 2);
      this.showDamageNumber(z.x, z.y - 16, b.damage);
      if (killed) this.onZombieKilled(z);
      if (b.onHitZombie(zId)) b.destroy();
    });

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

    this.physics.add.collider(this.bullets, this.walls, (bullet) => {
      const b = bullet as Bullet;
      if (!b.active) return;
      if (b.aoeRadius > 0) {
        this.doAoeDamage(b.x, b.y, b.aoeRadius, b.damage);
      }
      b.destroy();
    });

    // === SPAWNERS ===
    this.time.addEvent({
      delay: Phaser.Math.Between(10000, 15000), loop: true,
      callback: () => {
        if (this.gameOver || !this.canSpawnPickup('ammo')) return;
        const pos = this.getSafeSpawnPosition();
        this.pickups.add(new Pickup(this, pos.x, pos.y, 'ammo'));
      },
    });
    this.time.addEvent({
      delay: 20000, loop: true,
      callback: () => {
        if (this.gameOver || !this.canSpawnPickup('bandage')) return;
        const pos = this.getSafeSpawnPosition();
        this.pickups.add(new Pickup(this, pos.x, pos.y, 'bandage'));
      },
    });
    this.time.addEvent({
      delay: 45000, loop: true,
      callback: () => {
        if (this.gameOver || !this.canSpawnPickup('medkit')) return;
        const pos = this.getSafeSpawnPosition();
        this.pickups.add(new Pickup(this, pos.x, pos.y, 'medkit'));
      },
    });

    // === INPUT ===
    this.abilityId = getSelectedAbility();
    this.nukeMode = false;
    this.abilityActive = false;
    const fKey = this.input.keyboard!.addKey('F');
    fKey.on('down', () => {
      if (!this.gameOver && !this.abilityActive && this.abilityCharge >= 100) this.activateAbility();
    });

    this.input.on('pointerdown', () => {
      if (this.nukeMode) { this.launchNuke(); return; }
      if (!this.gameOver) this.fireWeapon();
    });

    // === PLAYER DEATH ===
    this.events.once('player-died', () => {
      if (this.gameOver) return;
      this.gameOver = true;
      this.player.setActive(false);
      this.player.setVelocity(0, 0);
      this.physics.pause();
      const deathData = { score: this.player.score, kills: this.player.kills, wave: this.wave };
      leaderboard.saveResult(this.player.score, this.wave);
      profile.setMaterials({ wood: this.player.wood, metal: this.player.metal, screws: this.player.screws });
      audioManager.stopGameMusic(1.5);
      this.time.delayedCall(500, () => {
        this.scene.stop('UIScene');
        this.scene.launch('GameOverScene', deathData);
      });
    });

    // === START GAME ===
    audioManager.resume();
    audioManager.startGameMusic();
    this.scene.launch('UIScene', { gameScene: this });
    this.spawnWave();
  }

  // Clean up resources when scene stops (location transition or game over)
  shutdown() {
    // Destroy zombie shadows
    for (const shadow of this.zombieShadows.values()) {
      shadow.destroy();
    }
    this.zombieShadows.clear();

    // Destroy trees
    for (const tree of this.trees) {
      tree.destroy();
    }
    this.trees = [];

    // Destroy damage numbers
    for (const txt of this.activeDmgNumbers) {
      txt.destroy();
    }
    this.activeDmgNumbers = [];

    // Destroy nuke markers
    for (const m of this.nukeMarkers) {
      m.destroy();
    }
    this.nukeMarkers = [];

    // Clear grid lookup
    this.wallGridSet.clear();
    this.alleySpawnPoints = [];

    // Destroy player shadow
    if (this.playerShadow) {
      this.playerShadow.destroy();
    }

    // Destroy XP orbs
    if (this.xpOrbs) {
      this.xpOrbs.clear(true, true);
    }
  }

  // Build ground tiles and store references for cleanup
  private buildMap() {
    const tiles = this.location.groundTiles;
    for (let x = 0; x < this.mapSize; x += 64) {
      for (let y = 0; y < this.mapSize; y += 64) {
        const img = this.add.image(x + 32, y + 32, tiles[Phaser.Math.Between(0, tiles.length - 1)]).setDepth(0);
        this.groundTiles.push(img);
      }
    }
  }

  // Change location without restarting the scene
  changeLocation(targetWave: number) {
    if (this.changingLocation) return;
    this.changingLocation = true;

    // Reset nuke mode
    if (this.nukeMode) this.exitNukeMode();

    // UIScene stays running — it reads from this.gameScene which is the same object

    // Pause player movement
    this.player.setVelocity(0, 0);

    // Black overlay
    const overlay = this.add.rectangle(0, 0, 4000, 4000, 0x000000)
      .setOrigin(0).setDepth(9999).setScrollFactor(0);

    const newLocation = getLocationForWave(targetWave);

    // Transition text (on top of overlay)
    const { width, height } = this.cameras.main;
    const transText = this.add.text(width / 2, height / 2 - 50, 'Перехід на нову локацію', {
      fontSize: '22px', color: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);
    const locText = this.add.text(width / 2, height / 2 + 10, newLocation.displayName, {
      fontSize: '48px', color: '#cc4444', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);
    const waveText = this.add.text(width / 2, height / 2 + 60, `Wave ${targetWave}`, {
      fontSize: '18px', color: '#666666', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);

    // Wait 2 seconds with overlay visible, then rebuild
    this.time.delayedCall(2000, () => {
      // === CLEANUP old map ===
      // Ground tiles
      for (const t of this.groundTiles) t.destroy();
      this.groundTiles = [];

      // Walls
      this.walls.clear(true, true);
      this.wallGridSet.clear();
      this.alleySpawnPoints = [];

      // Decorations & trees
      for (const d of this.decorations) d.destroy();
      this.decorations = [];
      for (const t of this.trees) t.destroy();
      this.trees = [];

      // Buildings + doors cleanup
      for (const b of this.buildings) {
        b.roof.destroy();
        for (const door of b.doors) door.sprite.destroy();
      }
      this.buildings = [];
      this.doorsGroup.clear(true, true);
      this.removeTrader();

      // Zombies & shadows
      const allZombies = this.zombies.getChildren().slice();
      for (const obj of allZombies) (obj as Zombie).destroy();
      for (const shadow of this.zombieShadows.values()) shadow.destroy();
      this.zombieShadows.clear();
      this.zombiesRemaining = 0;

      // Bullets, pickups & XP orbs
      this.bullets.clear(true, true);
      this.pickups.clear(true, true);
      if (this.xpOrbs) this.xpOrbs.clear(true, true);

      // Damage numbers & nuke markers
      for (const txt of this.activeDmgNumbers) txt.destroy();
      this.activeDmgNumbers = [];
      for (const m of this.nukeMarkers) m.destroy();
      this.nukeMarkers = [];

      // === BUILD new map ===
      this.wave = targetWave;
      this.location = newLocation;
      this.mapSize = this.location.mapSize;
      this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize);

      this.buildMap();
      this.generateMap();
      if (this.location.id === 'field') this.placeFieldHouses();
      this.placeDecorations();

      // Move player to center
      const cx = this.mapSize / 2;
      const cy = this.mapSize / 2;
      this.player.setPosition(cx, cy);
      this.player.setVelocity(0, 0);
      this.playerShadow.setPosition(cx, cy);

      // Reset camera
      this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
      this.cameras.main.setZoom(1.5);

      // Reset state
      this.waveDelay = false;
      this.changingLocation = false;

      // Restart music
      audioManager.stopGameMusic(0);
      audioManager.startGameMusic();

      // Remove transition text
      transText.destroy();
      locText.destroy();
      waveText.destroy();

      // Fade out overlay then spawn wave
      this.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          overlay.destroy();
          this.spawnWave();
        },
      });
    });
  }

  update(_time: number, delta: number) {
    if (this.changingLocation || this.gameOver || !this.player?.active) return;

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

    // Trees become semi-transparent when player or trader is nearby
    for (const tree of this.trees) {
      const distPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, tree.x, tree.y);
      const distTrader = this.trader ? Phaser.Math.Distance.Between(this.trader.x, this.trader.y, tree.x, tree.y) : Infinity;
      tree.setAlpha(distPlayer < 60 || distTrader < 60 ? 0.25 : 0.85);
    }

    // A* path updates — staggered so not all zombies recalc same frame
    this.pathBatchTimer -= delta;
    if (this.pathBatchTimer <= 0 && this.pathfinder) {
      this.pathBatchTimer = 80; // process a batch every 80ms
      const allZ = this.zombies.getChildren() as Zombie[];
      // Collect zombies that need a path
      const needPath = allZ.filter(z => z.active && z.aggroed && z.needsPath);
      // Also periodically refresh paths for aggroed zombies via their pathTimer
      for (const z of needPath.slice(0, 5)) { // max 5 per batch
        const target = z.doorTarget ?? { x: this.player.x, y: this.player.y };
        const path = this.pathfinder.findPath(z.x, z.y, target.x, target.y);
        z.setPath(path);
      }
    }

    // Zombie flocking — nudge aggroed zombies toward nearby group centroid
    const allZombiesF = this.zombies.getChildren() as Zombie[];
    const FLOCK_RADIUS = 140;
    const FLOCK_STRENGTH = 18; // pixels/sec pull toward centroid
    for (const z of allZombiesF) {
      if (!z.active || !z.aggroed) continue;
      // Find nearby aggroed neighbors
      let cx = 0, cy = 0, count = 0;
      for (const n of allZombiesF) {
        if (n === z || !n.active || !n.aggroed) continue;
        const d = Phaser.Math.Distance.Between(z.x, z.y, n.x, n.y);
        if (d < FLOCK_RADIUS) { cx += n.x; cy += n.y; count++; }
      }
      if (count >= 2) { // only flock when 2+ neighbors
        cx /= count; cy /= count;
        const angle = Phaser.Math.Angle.Between(z.x, z.y, cx, cy);
        z.x += Math.cos(angle) * FLOCK_STRENGTH * (delta / 1000);
        z.y += Math.sin(angle) * FLOCK_STRENGTH * (delta / 1000);
      }
    }

    // Buildings + doors update
    this.updateBuildings(delta);
    this.checkInteractions();

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

    // XP orb attraction and collection
    if (this.xpOrbs) {
      const attractRadius = 120;
      const collectRadius = 18;
      const orbSpeed = 250;
      this.xpOrbs.getChildren().forEach((obj) => {
        const orb = obj as Phaser.GameObjects.Image;
        if (!orb.active) return;
        const dist = Phaser.Math.Distance.Between(orb.x, orb.y, this.player.x, this.player.y);
        if (dist < collectRadius) {
          // Collect orb
          const orbValue = orb.getData('value') || 2;
          orb.destroy();
          if (this.abilityCharge < 100) {
            this.abilityCharge = Math.min(100, this.abilityCharge + orbValue);
          }
        } else if (dist < attractRadius) {
          // Stop float tween so it doesn't override Y position
          this.tweens.killTweensOf(orb);
          // Attract toward player (faster when closer)
          const angle = Phaser.Math.Angle.Between(orb.x, orb.y, this.player.x, this.player.y);
          const speed = orbSpeed * (1 - dist / attractRadius) + 60;
          orb.x += Math.cos(angle) * speed * (delta / 1000);
          orb.y += Math.sin(angle) * speed * (delta / 1000);
        }
      });
    }

    // Wave check
    if (this.zombiesRemaining <= 0 && !this.waveDelay) {
      this.waveDelay = true;
      const nextWave = this.wave + 1;

      // Check if we need to change location
      if (shouldChangeLocation(this.wave, nextWave)) {
        this.time.delayedCall(2000, () => {
          if (this.gameOver) return;
          this.changeLocation(nextWave);
        });
      } else {
        this.wave = nextWave;
        this.startWaveBreak();
      }
    }
  }

  private onZombieKilled(z: Zombie) {
    this.player.kills++;
    this.player.score += z.scoreValue;
    this.zombiesRemaining--;
    bestiary.unlock(z.zombieType);
    shop.addKills(z.killValue);
    this.player.sessionKills += z.killValue;

    // Clean up zombie shadow
    const deadShadow = this.zombieShadows.get(z);
    if (deadShadow) { deadShadow.destroy(); this.zombieShadows.delete(z); }

    // Blood splatter on ground
    this.spawnBloodParticles(z.x, z.y, 4);
    const splat = this.add.image(z.x, z.y, 'blood-splat').setDepth(0.8).setAlpha(0.6).setScale(Phaser.Math.FloatBetween(0.6, 1.2));
    splat.setAngle(Phaser.Math.Between(0, 360));
    // Fade blood splat over time
    this.tweens.add({ targets: splat, alpha: 0, duration: 15000, delay: 5000, onComplete: () => splat.destroy() });

    // Spawn XP orb for ability charge
    if (this.xpOrbs && this.abilityCharge < 100) {
      const isBoss = z.zombieType === 'boss';
      const orbValue = isBoss ? 50 : 2;
      const orbScale = isBoss ? 2.5 : 1.2;
      const ox = z.x + Phaser.Math.Between(-10, 10);
      const oy = z.y + Phaser.Math.Between(-10, 10);
      const orb = this.add.image(ox, oy, 'xp-orb').setDepth(5).setScale(orbScale);
      orb.setData('value', orbValue);
      // Float animation
      this.tweens.add({
        targets: orb, y: orb.y - 8, alpha: { from: 0.6, to: 1 },
        duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.xpOrbs.add(orb);
      // Auto-destroy after 15 sec if not collected
      this.time.delayedCall(60000, () => { if (orb.active) orb.destroy(); });
    }

    // Roll material drops independently
    if (z.zombieType === 'boss') {
      // Boss drops fixed amounts
      const bossDrops: { type: PickupType; count: number }[] = [
        { type: 'wood', count: 20 },
        { type: 'metal', count: 15 },
        { type: 'screws', count: 10 },
      ];
      for (const drop of bossDrops) {
        for (let i = 0; i < drop.count; i++) {
          const ox = Phaser.Math.Between(-40, 40);
          const oy = Phaser.Math.Between(-40, 40);
          this.pickups.add(new Pickup(this, z.x + ox, z.y + oy, drop.type));
        }
      }
    } else {
      const materialTypes: { type: PickupType; chance: number }[] = [
        { type: 'wood', chance: z.drops.wood },
        { type: 'metal', chance: z.drops.metal },
        { type: 'screws', chance: z.drops.screws },
      ];
      let dropOffset = 0;
      for (const mat of materialTypes) {
        if (Math.random() * 100 < mat.chance && this.canSpawnPickup(mat.type)) {
          const ox = (dropOffset - 1) * 16;
          this.pickups.add(new Pickup(this, z.x + ox, z.y + 10, mat.type));
          dropOffset++;
        }
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

  private startWaveBreak() {
    const breakTime = 20;
    // Emit event so UIScene renders the countdown (UIScene renders on top of GameScene)
    this.events.emit('wave-break-start', { wave: this.wave, seconds: breakTime });

    // Spawn trader nearby
    this.spawnTrader();

    this.time.delayedCall(breakTime * 1000, () => {
      this.events.emit('wave-break-end');
      this.removeTrader();
      if (!this.gameOver) {
        this.spawnWave();
        this.waveDelay = false;
      }
    });
  }

  private spawnWave() {
    // Reset camera if nuke mode was active
    if (this.nukeMode) this.exitNukeMode();
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
    // Kill all zombies without giving score/kills
    const allZombies = this.zombies.getChildren().slice();
    for (const obj of allZombies) {
      const z = obj as Zombie;
      if (z.active) z.destroy();
    }
    this.zombiesRemaining = 0;
    this.waveDelay = false;

    // If target wave needs a different location — change location in-place
    const newLocation = getLocationForWave(targetWave);
    if (newLocation.id !== this.location.id) {
      this.changeLocation(targetWave);
      return;
    }

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
    // In city mode, 70% chance to spawn in alleys
    if (this.location.spawnMode === 'alleys' && this.alleySpawnPoints.length > 0 && Math.random() < 0.7) {
      const point = this.alleySpawnPoints[Phaser.Math.Between(0, this.alleySpawnPoints.length - 1)];
      // Small offset but always verify it's not in a wall
      const ox = Phaser.Math.Between(-16, 16);
      const oy = Phaser.Math.Between(-16, 16);
      if (!this.isPositionBlocked(point.x + ox, point.y + oy)) {
        return { x: point.x + ox, y: point.y + oy };
      }
      return { x: point.x, y: point.y };
    }
    // Try up to 50 times to find a position not inside a wall or building
    for (let i = 0; i < 50; i++) {
      const pos = this.getSpawnPosition();
      if (!this.isPositionBlocked(pos.x, pos.y) && !this.isInsideBuilding(pos.x, pos.y)) return pos;
    }
    // Fallback: use a random alley point if available
    if (this.alleySpawnPoints.length > 0) {
      const p = this.alleySpawnPoints[Phaser.Math.Between(0, this.alleySpawnPoints.length - 1)];
      return { x: p.x, y: p.y };
    }
    return this.getSpawnPosition();
  }

  // Max pickups of each type allowed on map at once
  private static readonly PICKUP_LIMITS: Partial<Record<PickupType, number>> = {
    ammo: 5, bandage: 3, medkit: 2, wood: 8, metal: 8, screws: 8,
  };

  private countPickupsOfType(type: PickupType): number {
    let count = 0;
    for (const obj of this.pickups.getChildren()) {
      const p = obj as Pickup;
      if (p.active && p.pickupType === type) count++;
    }
    return count;
  }

  private canSpawnPickup(type: PickupType): boolean {
    const limit = GameScene.PICKUP_LIMITS[type];
    if (limit === undefined) return true;
    return this.countPickupsOfType(type) < limit;
  }

  // Set of occupied grid cells (64px grid) for fast collision lookup
  private wallGridSet: Set<string> = new Set();

  private buildWallGrid() {
    this.wallGridSet.clear();
    for (const wall of this.walls.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      // Mark the grid cell this wall occupies
      const gx = Math.floor(wall.x / 64);
      const gy = Math.floor(wall.y / 64);
      this.wallGridSet.add(`${gx},${gy}`);
    }
  }

  private isPositionBlocked(x: number, y: number): boolean {
    // Fast O(1) grid-based check instead of O(n) wall iteration
    const gx = Math.floor(x / 64);
    const gy = Math.floor(y / 64);
    return this.wallGridSet.has(`${gx},${gy}`);
  }

  private isInsideBuilding(x: number, y: number): boolean {
    return this.buildings.some(b => b.interiorBounds.contains(x, y));
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
    this.abilityCharge = 0;
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

    // Zoom out to show entire map, centered
    const cam = this.cameras.main;
    cam.stopFollow();
    // Remove bounds so camera can freely center on the map
    cam.removeBounds();
    const targetZoom = Math.min(cam.width / this.mapSize, cam.height / this.mapSize);
    const mapCenter = this.mapSize / 2;

    this.tweens.add({
      targets: cam, zoom: targetZoom,
      duration: 800, ease: 'Quad.easeOut',
      onUpdate: () => {
        cam.centerOn(mapCenter, mapCenter);
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

    // Clean markers and return camera immediately
    this.clearNukeMarkers();
    this.nukeMode = false;
    this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.tweens.add({
      targets: this.cameras.main, zoom: 1.5, duration: 600, ease: 'Quad.easeOut',
    });

    // Show target crosshair on the map
    const cross = this.add.graphics().setDepth(20);
    cross.lineStyle(2, 0xff0000, 0.8);
    cross.strokeCircle(tx, ty, 20);
    cross.lineBetween(tx - 30, ty, tx + 30, ty);
    cross.lineBetween(tx, ty - 30, tx, ty + 30);

    // Rocket approaching (from top)
    const rocket = this.add.image(tx, -200, 'ability-nuke').setDepth(20).setScale(3).setAngle(90);

    // Rocket flies to target over 3 seconds (faster since player is already back)
    this.tweens.add({
      targets: rocket, x: tx, y: ty, duration: 3000, ease: 'Quad.easeIn',
    });

    this.time.delayedCall(3000, () => {
      rocket.destroy();
      cross.destroy();

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
      const allZombies = this.zombies.getChildren().slice();
      for (const obj of allZombies) {
        const z = obj as Zombie;
        if (!z.active) continue;
        const dist = Phaser.Math.Distance.Between(tx, ty, z.x, z.y);
        if (dist <= nukeRadius) {
          const killed = z.takeDamage(500);
          if (killed) this.onZombieKilled(z);
        }
      }

      // Radiation patches
      const patchCount = Phaser.Math.Between(25, 35);
      for (let i = 0; i < patchCount; i++) {
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

      this.abilityActive = false;
    });
  }

  private exitNukeMode() {
    this.nukeMode = false;
    this.clearNukeMarkers();
    this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize);
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

    // Push away any existing damage numbers that are close
    const pushRadius = 22;
    for (const old of this.activeDmgNumbers) {
      if (!old.active) continue;
      const dist = Phaser.Math.Distance.Between(x, y, old.x, old.y);
      if (dist < pushRadius) {
        const angle = dist > 0
          ? Phaser.Math.Angle.Between(x, y, old.x, old.y)
          : Phaser.Math.FloatBetween(0, Math.PI * 2);
        const pushDist = 20 + Phaser.Math.Between(0, 10);
        this.tweens.killTweensOf(old);
        this.tweens.add({
          targets: old,
          x: old.x + Math.cos(angle) * pushDist,
          y: old.y + Math.sin(angle) * pushDist - 8,
          alpha: 0,
          scale: 0.7,
          duration: 900,
          ease: 'Power1',
          onComplete: () => old.destroy(),
        });
      }
    }

    // Scatter new number slightly from center
    const offsetX = Phaser.Math.Between(-14, 14);
    const offsetY = Phaser.Math.Between(-10, 10);

    const txt = this.add.text(x + offsetX, y + offsetY, `-${damage}`, {
      fontSize: size, fontFamily: 'monospace', color: color, fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true },
    }).setOrigin(0.5).setDepth(11);

    this.activeDmgNumbers.push(txt);

    this.tweens.add({
      targets: txt,
      y: txt.y - 25,
      alpha: 0,
      duration: 1400,
      ease: 'Power1',
      onComplete: () => {
        const idx = this.activeDmgNumbers.indexOf(txt);
        if (idx >= 0) this.activeDmgNumbers.splice(idx, 1);
        txt.destroy();
      },
    });
  }

  private addZombieShadow(zombie: Zombie) {
    const scale = zombie.zombieType === 'boss' || zombie.zombieType === 'tank' ? 1.0 : 0.7;
    const shadow = this.add.image(zombie.x, zombie.y, 'shadow').setDepth(0.5).setAlpha(0.25).setScale(scale);
    this.zombieShadows.set(zombie, shadow);
  }

  private placeDecorations() {
    this.trees = [];
    this.decorations = [];
    const cx = this.mapSize / 2, cy = this.mapSize / 2;
    const decos = this.location.decorations;

    for (const deco of decos) {
      for (let i = 0; i < deco.count; i++) {
        const x = Phaser.Math.Between(150, this.mapSize - 150);
        const y = Phaser.Math.Between(150, this.mapSize - 150);
        if (Math.abs(x - cx) < 200 && Math.abs(y - cy) < 200) continue;
        if (this.isPositionBlocked(x, y)) continue;
        // Skip positions inside buildings
        if (this.buildings.some(b => b.interiorBounds.contains(x, y))) continue;

        if (deco.isTree) {
          const tree = this.add.image(x, y, deco.key)
            .setDepth(deco.depth)
            .setScale(Phaser.Math.FloatBetween(deco.scale * 0.8, deco.scale * 1.4))
            .setAlpha(0.85);
          this.trees.push(tree);
        } else {
          const img = this.add.image(x, y, deco.key)
            .setDepth(deco.depth)
            .setScale(Phaser.Math.FloatBetween(deco.scale * 0.8, deco.scale * 1.2))
            .setAngle(Phaser.Math.Between(0, 360))
            .setAlpha(Phaser.Math.FloatBetween(0.6, 0.9));
          this.decorations.push(img);
        }
      }
    }
  }

  // Generate map from static tilemap
  private generateMap() {
    const tex = this.location.wallTexture;
    const map = this.location.tileMap;
    this.alleySpawnPoints = [];

    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const cell = map[row][col];
        const x = col * 64 + 32;
        const y = row * 64 + 32;

        if (cell === 1) {
          // Wall tile
          (this.walls.create(x, y, tex) as Phaser.Physics.Arcade.Sprite).setDepth(2);
        } else if (cell === 2) {
          // Zombie spawn point (alley)
          this.alleySpawnPoints.push({ x, y });
        }
      }
    }

    // Refresh all wall bodies at once (much faster than per-wall)
    this.walls.refresh();

    // Build grid lookup for fast isPositionBlocked() checks
    this.buildWallGrid();

    // Initialize (or reinitialize) A* pathfinder with current wall grid
    this.pathfinder = new Pathfinder(this.wallGridSet, this.mapSize);
  }

  // === BUILDINGS WITH DOORS ===

  private placeFieldHouses() {
    // 3 houses on the field at clear positions
    const houses = [
      { bx: 320, by: 320 },    // top-left area
      { bx: 1472, by: 320 },   // top-right area
      { bx: 320, by: 1472 },   // bottom-left area
    ];
    for (const h of houses) {
      const building = this.createHouse(h.bx, h.by, 5, 4);
      this.buildings.push(building);
    }
    // Refresh door bodies
    this.doorsGroup.refresh();
  }

  private createHouse(bx: number, by: number, tilesW: number, tilesH: number): BuildingInfo {
    const pw = tilesW * 64;
    const ph = tilesH * 64;
    const doorTile = Math.floor(tilesW / 2); // middle tile of south wall
    const doors: DoorData[] = [];

    // North wall (full)
    for (let tx = 0; tx < tilesW; tx++) {
      const wx = bx + tx * 64 + 32;
      const wy = by + 32;
      (this.walls.create(wx, wy, 'house-wall') as Phaser.Physics.Arcade.Sprite).setDepth(15);
    }
    // South wall with door gap
    for (let tx = 0; tx < tilesW; tx++) {
      const wx = bx + tx * 64 + 32;
      const wy = by + (tilesH - 1) * 64 + 32;
      if (tx === doorTile) {
        const ds = this.doorsGroup.create(wx, wy, 'door-closed') as Phaser.Physics.Arcade.Sprite;
        ds.setDepth(16);
        doors.push({ sprite: ds, isOpen: false, broken: false, breakMs: 0 });
      } else {
        (this.walls.create(wx, wy, 'house-wall') as Phaser.Physics.Arcade.Sprite).setDepth(15);
      }
    }
    // West wall (skip corners — already created above)
    for (let ty = 1; ty < tilesH - 1; ty++) {
      const wx = bx + 32;
      const wy = by + ty * 64 + 32;
      (this.walls.create(wx, wy, 'house-wall') as Phaser.Physics.Arcade.Sprite).setDepth(15);
    }
    // East wall (skip corners)
    for (let ty = 1; ty < tilesH - 1; ty++) {
      const wx = bx + (tilesW - 1) * 64 + 32;
      const wy = by + ty * 64 + 32;
      (this.walls.create(wx, wy, 'house-wall') as Phaser.Physics.Arcade.Sprite).setDepth(15);
    }
    this.walls.refresh();

    // House floor tiles inside
    for (let ty = 1; ty < tilesH - 1; ty++) {
      for (let tx = 1; tx < tilesW - 1; tx++) {
        this.add.image(bx + tx * 64 + 32, by + ty * 64 + 32, 'house-floor').setDepth(1.5);
      }
    }

    // Roof overlay (hides interior when player is outside)
    const roof = this.add.graphics();
    roof.fillStyle(0x3a2010, 0.9);
    roof.fillRect(bx + 1, by + 1, pw - 2, ph - 2);
    // Roof planks decoration
    roof.lineStyle(3, 0x2a1408, 0.4);
    for (let ry = by + 16; ry < by + ph; ry += 32) {
      roof.lineBetween(bx + 2, ry, bx + pw - 2, ry);
    }
    roof.setDepth(26);

    // Spawn loot inside (random pickup)
    const lootX = bx + pw / 2 + Phaser.Math.Between(-40, 40);
    const lootY = by + ph / 2;
    const lootTypes: PickupType[] = ['bandage', 'medkit', 'wood', 'metal', 'screws', 'ammo'];
    const lootType = lootTypes[Phaser.Math.Between(0, lootTypes.length - 1)];
    const pickup = new Pickup(this, lootX, lootY, lootType);
    this.pickups.add(pickup);

    return {
      interiorBounds: new Phaser.Geom.Rectangle(bx + 64, by + 64, pw - 128, ph - 128),
      roof,
      doors,
    };
  }

  private updateBuildings(delta: number) {
    const px = this.player.x;
    const py = this.player.y;
    const allZombies = this.zombies.getChildren() as Zombie[];

    // Find which building (if any) the player is inside
    let playerBuilding: BuildingInfo | null = null;
    for (const b of this.buildings) {
      if (b.interiorBounds.contains(px, py)) { playerBuilding = b; break; }
    }

    // Update zombie door targets
    for (const z of allZombies) {
      if (!z.active) continue;
      if (playerBuilding) {
        // Player is inside — send zombie to the nearest closed door
        const closedDoor = playerBuilding.doors.find(d => !d.isOpen);
        z.doorTarget = closedDoor ? { x: closedDoor.sprite.x, y: closedDoor.sprite.y } : null;
      } else {
        z.doorTarget = null;
      }
    }

    for (const b of this.buildings) {
      // Roof: transparent when player is inside
      const inside = b.interiorBounds.contains(px, py);
      b.roof.setAlpha(inside ? 0.08 : 0.9);

      // Zombie door breaking
      for (const door of b.doors) {
        if (door.isOpen) { door.breakMs = 0; continue; }

        // Check if any zombie is touching the door
        let zombieNearby = false;
        for (const z of allZombies) {
          if (!z.active) continue;
          const dist = Phaser.Math.Distance.Between(z.x, z.y, door.sprite.x, door.sprite.y);
          if (dist < 50) { zombieNearby = true; break; }
        }

        if (zombieNearby) {
          door.breakMs += delta;
          if (door.breakMs >= 5000) {
            // Door broken by zombies — mark as broken (can't be restored)
            door.broken = true;
            door.sprite.setTexture('door-open');
            door.sprite.setAlpha(0.5);
            this.openDoor(door);
            this.cameras.main.shake(200, 0.008);
          }
        } else {
          door.breakMs = Math.max(0, door.breakMs - delta * 0.5);
        }
      }
    }
  }

  private openDoor(door: DoorData) {
    door.isOpen = true;
    door.sprite.setTexture('door-open');
    door.sprite.setAlpha(0.35);
    // Remove from group so physics is fully disabled
    this.doorsGroup.remove(door.sprite, false, false);
  }

  private closeDoor(door: DoorData) {
    door.isOpen = false;
    door.breakMs = 0;
    door.sprite.setTexture('door-closed');
    door.sprite.setAlpha(1);
    // Re-add to group to restore physics
    this.doorsGroup.add(door.sprite, true);
    this.doorsGroup.refresh();
  }

  private checkInteractions() {
    // Only show/hide the hint each frame (no key polling)
    this.updateInteractHint();
  }

  private handleEKey() {
    if (this.gameOver || !this.player?.active) return;

    // Close trader shop if open
    if (this.traderShopOpen) {
      this.traderShopDiv?.remove();
      this.traderShopDiv = undefined;
      this.traderShopOpen = false;
      return;
    }

    // Check doors
    for (const b of this.buildings) {
      for (const door of b.doors) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.sprite.x, door.sprite.y);
        if (dist < 100 && !door.broken) {
          if (door.isOpen) this.closeDoor(door);
          else this.openDoor(door);
          return;
        }
      }
    }

    // Check trader
    if (this.trader && !this.traderShopOpen) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.trader.x, this.trader.y);
      if (dist < 100) {
        this.openTraderShop();
      }
    }
  }

  private updateInteractHint() {
    const px = this.player.x;
    const py = this.player.y;
    let nearTarget: { x: number; y: number; label: string } | null = null;

    // Check doors
    for (const b of this.buildings) {
      for (const door of b.doors) {
        const dist = Phaser.Math.Distance.Between(px, py, door.sprite.x, door.sprite.y);
        if (dist < 80 && !door.broken) {
          nearTarget = { x: door.sprite.x, y: door.sprite.y - 40, label: door.isOpen ? '[E] закрити' : '[E] відчинити' };
          break;
        }
      }
      if (nearTarget) break;
    }

    // Check trader
    if (!nearTarget && this.trader) {
      const dist = Phaser.Math.Distance.Between(px, py, this.trader.x, this.trader.y);
      if (dist < 90) {
        nearTarget = { x: this.trader.x, y: this.trader.y - 50, label: '[E] торговець' };
      }
    }

    if (nearTarget) {
      this.interactHint.setPosition(nearTarget.x, nearTarget.y);
      this.interactHint.setText(nearTarget.label);
      this.interactHint.setVisible(true);
    } else {
      this.interactHint.setVisible(false);
    }
  }

  // === NPC TRADER ===

  spawnTrader() {
    if (this.trader) return;
    // Find a safe position near player that's not in a wall or building
    let tx = this.player.x + 150;
    let ty = this.player.y;
    const offsets = [[150,0],[-150,0],[0,150],[0,-150],[150,150],[-150,150],[150,-150],[-150,-150],[200,0],[-200,0]];
    for (const [ox, oy] of offsets) {
      const cx = this.player.x + ox;
      const cy = this.player.y + oy;
      if (!this.isPositionBlocked(cx, cy) && !this.isInsideBuilding(cx, cy)) {
        tx = cx; ty = cy; break;
      }
    }
    this.trader = this.add.sprite(tx, ty, 'trader').setDepth(5).setScale(1.2);
    // Gentle float animation
    this.tweens.add({
      targets: this.trader,
      y: ty - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Label above trader
    this.add.text(tx, ty - 50, '🛒 Торговець', {
      fontSize: '12px', fontFamily: 'monospace', color: '#ffcc44',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(200).setName('trader-label');
  }

  removeTrader() {
    if (this.traderShopDiv) {
      this.traderShopDiv.remove();
      this.traderShopDiv = undefined;
    }
    this.traderShopOpen = false;
    if (this.trader) {
      this.children.getByName('trader-label')?.destroy();
      this.trader.destroy();
      this.trader = undefined;
    }
  }

  private openTraderShop() {
    if (this.traderShopOpen) return;
    this.traderShopOpen = true;

    const div = document.createElement('div');
    div.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:#0a1a0a; border:2px solid #44aa44; border-radius:10px;
      padding:20px; min-width:300px; font-family:monospace; color:#ccffcc;
      z-index:9999; box-shadow:0 0 30px #00440088;
    `;
    div.innerHTML = `
      <div style="text-align:center; font-size:18px; color:#ffcc44; margin-bottom:16px; font-weight:bold;">🛒 Торговець</div>
      <div style="text-align:center; margin-bottom:12px; color:#aaffaa;">Кіли: <span id="trader-kills" style="color:#ffcc44;font-weight:bold">${shop.getKills()}</span></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;background:#0d2a0d;padding:8px;border-radius:4px;border:1px solid #226622;"><span>🔸 Магазин патронів</span><button class="trader-buy" data-item="ammo" data-cost="5">Купити (5 💀)</button></div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:#0d2a0d;padding:8px;border-radius:4px;border:1px solid #226622;"><span>🩹 Бинт</span><button class="trader-buy" data-item="bandage" data-cost="4">Купити (4 💀)</button></div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:#0d2a0d;padding:8px;border-radius:4px;border:1px solid #226622;"><span>💊 Аптечка</span><button class="trader-buy" data-item="medkit" data-cost="10">Купити (10 💀)</button></div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:#0d2a0d;padding:8px;border-radius:4px;border:1px solid #226622;"><span>🪵 Дошка (2 шт)</span><button class="trader-buy" data-item="wood2" data-cost="3">Купити (3 💀)</button></div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:#0d2a0d;padding:8px;border-radius:4px;border:1px solid #226622;"><span>🔩 Метал (2 шт)</span><button class="trader-buy" data-item="metal2" data-cost="3">Купити (3 💀)</button></div>
      </div>
      <div style="text-align:center;margin-top:16px;">
        <button id="trader-close" style="padding:8px 20px;background:#3a0a0a;border:1px solid #ff4444;color:#ff4444;font-family:monospace;cursor:pointer;border-radius:4px;">Закрити [E]</button>
      </div>
    `;
    document.body.appendChild(div);
    this.traderShopDiv = div;

    // Style all buy buttons and apply disabled state
    const refreshButtons = () => {
      div.querySelectorAll<HTMLButtonElement>('.trader-buy').forEach(btn => {
        const item = btn.dataset.item!;
        const cost = parseInt(btn.dataset.cost!);
        const maxed = this.isTraderItemMaxed(item);
        const cantAfford = shop.getKills() < cost;
        const disabled = maxed || cantAfford;
        btn.disabled = disabled;
        btn.style.cssText = `padding:4px 10px;font-family:monospace;cursor:${disabled ? 'not-allowed' : 'pointer'};border-radius:3px;
          background:${disabled ? '#111' : '#1a3a1a'};
          border:1px solid ${disabled ? '#444' : '#44ff44'};
          color:${disabled ? '#555' : '#44ff44'};`;
        if (maxed) btn.textContent = 'Максимум';
        else btn.textContent = `Купити (${cost} 💀)`;
      });
    };

    refreshButtons();

    div.querySelectorAll<HTMLButtonElement>('.trader-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.dataset.item!;
        const cost = parseInt(btn.dataset.cost!);
        if (shop.getKills() < cost || this.isTraderItemMaxed(item)) return;
        shop.addKills(-cost);
        const killsEl = div.querySelector('#trader-kills');
        if (killsEl) killsEl.textContent = `${shop.getKills()}`;
        this.applyTraderPurchase(item);
        btn.textContent = '✓ Куплено!';
        setTimeout(() => refreshButtons(), 600);
      });
    });

    div.querySelector('#trader-close')?.addEventListener('click', () => {
      div.remove();
      this.traderShopDiv = undefined;
      this.traderShopOpen = false;
    });
  }

  private isTraderItemMaxed(item: string): boolean {
    switch (item) {
      case 'ammo':
        // Maxed if ALL weapons are at max reserve
        return this.player.weapons.every(w => w.reserveAmmo >= w.def.maxReserve);
      case 'bandage':
        return this.player.bandages >= this.player.maxBandages;
      case 'medkit':
        return this.player.medkits >= this.player.maxMedkits;
      default:
        return false;
    }
  }

  private applyTraderPurchase(item: string) {
    switch (item) {
      case 'ammo': {
        // Add ammo to current weapon, capped at maxReserve
        const w = this.player.weapons[this.player.activeWeaponIndex];
        w.reserveAmmo = Math.min(w.reserveAmmo + 30, w.def.maxReserve);
        break;
      }
      case 'bandage':
        this.player.bandages = Math.min(this.player.bandages + 1, this.player.maxBandages);
        break;
      case 'medkit':
        this.player.medkits = Math.min(this.player.medkits + 1, this.player.maxMedkits);
        break;
      case 'wood2':
        this.player.wood += 2;
        break;
      case 'metal2':
        this.player.metal += 2;
        break;
    }
  }
}
