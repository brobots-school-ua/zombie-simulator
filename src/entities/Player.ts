import Phaser from 'phaser';
import { WEAPONS, WeaponDef } from '../systems/WeaponConfig';
import { ACCESSORIES, shop } from '../systems/ShopConfig';
import { equipment } from '../systems/EquipmentConfig';

// Per-weapon ammo state
export interface WeaponState {
  def: WeaponDef;
  magazineAmmo: number;
  reserveAmmo: number;
}

// Player entity — the survivor with multiple weapons
export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number = 100;
  maxHp: number = 100;
  speed: number = 150;
  private sprintMultiplier: number = 2;
  isSprinting: boolean = false;
  isReloading: boolean = false;
  score: number = 0;
  kills: number = 0;
  sessionKills: number = 0;
  weapon: Phaser.GameObjects.Sprite;
  private accessorySprite: Phaser.GameObjects.Sprite | null = null;

  // Weapon system
  weapons: WeaponState[] = [];
  activeWeaponIndex: number = 0;

  // Utilities
  bandages: number = 1;
  maxBandages: number = 5;
  medkits: number = 0;
  maxMedkits: number = 3;

  // Crafting materials
  wood: number = 0;
  metal: number = 0;
  screws: number = 0;

  // Expose current weapon ammo for UI compatibility
  get magazineAmmo() { return this.weapons[this.activeWeaponIndex].magazineAmmo; }
  get reserveAmmo() { return this.weapons[this.activeWeaponIndex].reserveAmmo; }
  get maxMagazine() { return this.weapons[this.activeWeaponIndex].def.magazineSize; }
  get maxReserve() { return this.weapons[this.activeWeaponIndex].def.maxReserve; }
  get activeWeapon() { return this.weapons[this.activeWeaponIndex]; }

  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    R: Phaser.Input.Keyboard.Key;
    Q: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
  };
  private weaponKeys: Phaser.Input.Keyboard.Key[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Circular hitbox
    this.body!.setCircle(13, 3, 3);

    // Apply equipment bonuses
    const hpBonus = equipment.getHpBonus();
    this.maxHp += hpBonus;
    this.hp = this.maxHp;
    this.setCollideWorldBounds(true);
    this.setDepth(10);

    // Initialize all weapons with starting ammo
    for (const def of WEAPONS) {
      this.weapons.push({
        def,
        magazineAmmo: def.magazineSize,
        reserveAmmo: def.startReserve,
      });
    }

    // Weapon sprite — rotates independently toward mouse
    this.weapon = scene.add.sprite(x, y, this.activeWeapon.def.texture);
    this.weapon.setOrigin(0.15, 0.5);
    this.weapon.setDepth(11);

    // Equipped accessory
    const equippedId = shop.getEquipped();
    if (equippedId) {
      const accDef = ACCESSORIES.find(a => a.id === equippedId);
      if (accDef) {
        this.accessorySprite = scene.add.sprite(x, y, accDef.texture);
        this.accessorySprite.setDepth(10 + accDef.depth);
      }
    }

    // Sync weapon + accessory position after physics update
    scene.events.on('postupdate', () => {
      if (this.active && this.weapon) {
        const pointer = scene.input.activePointer;
        const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
        this.weapon.setPosition(this.x, this.y);
        this.weapon.setRotation(angle);

        // Accessory follows player
        if (this.accessorySprite) {
          const accDef = ACCESSORIES.find(a => a.id === shop.getEquipped());
          if (accDef) {
            this.accessorySprite.setPosition(this.x + accDef.offsetX, this.y + accDef.offsetY);
          }
        }
      }
    });

    // Mouse wheel to switch weapons
    scene.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gos: any[], _dx: number, dy: number) => {
      if (dy > 0) {
        this.switchWeapon((this.activeWeaponIndex + 1) % this.weapons.length);
      } else if (dy < 0) {
        this.switchWeapon((this.activeWeaponIndex - 1 + this.weapons.length) % this.weapons.length);
      }
    });

    // HP regeneration: +1 HP every second
    scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.active && this.hp > 0 && this.hp < this.maxHp) {
          this.hp = Math.min(this.hp + 1, this.maxHp);
        }
      },
    });

    // Movement keys
    this.keys = {
      W: scene.input.keyboard!.addKey('W'),
      A: scene.input.keyboard!.addKey('A'),
      S: scene.input.keyboard!.addKey('S'),
      D: scene.input.keyboard!.addKey('D'),
      R: scene.input.keyboard!.addKey('R'),
      Q: scene.input.keyboard!.addKey('Q'),
      E: scene.input.keyboard!.addKey('E'),
      SHIFT: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
    };

    // Weapon switch keys (1-5)
    for (const def of WEAPONS) {
      const key = scene.input.keyboard!.addKey(def.key);
      this.weaponKeys.push(key);
    }
  }

  update() {
    // Movement
    let vx = 0;
    let vy = 0;
    if (this.keys.W.isDown) vy = -1;
    if (this.keys.S.isDown) vy = 1;
    if (this.keys.A.isDown) vx = -1;
    if (this.keys.D.isDown) vx = 1;

    // Sprint on Shift, belt speed multiplier applies to both walk and sprint
    this.isSprinting = this.keys.SHIFT.isDown && (vx !== 0 || vy !== 0);
    const beltMult = equipment.getSpeedMultiplier();
    const currentSpeed = (this.isSprinting ? this.speed * this.sprintMultiplier : this.speed) * beltMult;

    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) {
      vx = (vx / len) * currentSpeed;
      vy = (vy / len) * currentSpeed;
    }
    this.setVelocity(vx, vy);

    // Weapon switching (1-5)
    for (let i = 0; i < this.weaponKeys.length; i++) {
      if (Phaser.Input.Keyboard.JustDown(this.weaponKeys[i])) {
        this.switchWeapon(i);
      }
    }

    // Reload
    if (this.keys.R.isDown && !this.isReloading) {
      const w = this.activeWeapon;
      if (w.magazineAmmo < w.def.magazineSize && w.reserveAmmo > 0) {
        this.reload();
      }
    }

    // Use utilities
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.useBandage();
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.useMedkit();
  }

  switchWeapon(index: number) {
    if (index === this.activeWeaponIndex) return;
    if (index < 0 || index >= this.weapons.length) return;

    // Cancel current reload
    this.isReloading = false;
    this.activeWeaponIndex = index;

    // Update weapon sprite texture
    this.weapon.setTexture(this.activeWeapon.def.texture);
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => this.clearTint());
    if (this.hp <= 0) {
      this.hp = 0;
      this.scene.events.emit('player-died');
    }
  }

  heal(amount: number) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  reload() {
    this.isReloading = true;
    const w = this.activeWeapon;
    // Immediately take bullets from reserve
    const needed = w.def.magazineSize - w.magazineAmmo;
    const toLoad = Math.min(needed, w.reserveAmmo);
    w.reserveAmmo -= toLoad;
    // After reload time — bullets appear in magazine
    this.scene.time.delayedCall(w.def.reloadTime, () => {
      if (!this.isReloading) return;
      w.magazineAmmo += toLoad;
      this.isReloading = false;
    });
  }

  // Utility methods
  addBandage() { this.bandages = Math.min(this.bandages + 1, this.maxBandages); }
  addMedkit() { this.medkits = Math.min(this.medkits + 1, this.maxMedkits); }

  useBandage() {
    if (this.bandages > 0 && this.hp < this.maxHp) {
      this.bandages--;
      this.heal(25);
      this.setTint(0x44ff44);
      this.scene.time.delayedCall(200, () => this.clearTint());
    }
  }

  useMedkit() {
    if (this.medkits > 0 && this.hp < this.maxHp) {
      this.medkits--;
      this.heal(75);
      this.setTint(0x44ff44);
      this.scene.time.delayedCall(200, () => this.clearTint());
    }
  }

  // Ammo pickup gives 1/5 of magazine to ALL weapons, launcher always gets fixed amount
  addAmmoAll() {
    for (const w of this.weapons) {
      const amount = w.def.ammoPickupFixed > 0
        ? w.def.ammoPickupFixed
        : Math.max(1, Math.floor(w.def.magazineSize / 5));
      w.reserveAmmo = Math.min(w.reserveAmmo + amount, w.def.maxReserve);
    }
  }

  // Returns target point if can shoot, null if can't
  shoot(): Phaser.Math.Vector2 | null {
    const w = this.activeWeapon;
    if (w.magazineAmmo <= 0 || this.isReloading) return null;
    w.magazineAmmo--;

    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    return new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);
  }

  getMuzzlePosition(): { x: number; y: number } {
    const angle = this.weapon.rotation;
    const weaponLength = 24;
    return {
      x: this.x + Math.cos(angle) * weaponLength,
      y: this.y + Math.sin(angle) * weaponLength,
    };
  }

  destroy(fromScene?: boolean) {
    // Remove event listeners to prevent leaks on scene restart
    this.scene.events.off('postupdate');
    this.scene.input.off('wheel');
    if (this.weapon) this.weapon.destroy();
    if (this.accessorySprite) this.accessorySprite.destroy();
    super.destroy(fromScene);
  }
}
