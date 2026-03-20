import Phaser from 'phaser';

// Player entity — the survivor
export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number = 100;
  maxHp: number = 100;
  speed: number = 200;
  magazineAmmo: number = 30;    // bullets in current magazine
  maxMagazine: number = 30;     // magazine capacity
  reserveAmmo: number = 30;     // spare bullets
  maxReserve: number = 60;      // max spare bullets
  isReloading: boolean = false;
  score: number = 0;
  kills: number = 0;

  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    R: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);

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

    // Setup keyboard controls
    this.keys = {
      W: scene.input.keyboard!.addKey('W'),
      A: scene.input.keyboard!.addKey('A'),
      S: scene.input.keyboard!.addKey('S'),
      D: scene.input.keyboard!.addKey('D'),
      R: scene.input.keyboard!.addKey('R'),
    };
  }

  update() {
    // Movement
    let vx = 0;
    let vy = 0;

    if (this.keys.W.isDown) vy = -1;
    if (this.keys.S.isDown) vy = 1;
    if (this.keys.A.isDown) vx = -1;
    if (this.keys.D.isDown) vx = 1;

    // Normalize diagonal movement
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) {
      vx = (vx / len) * this.speed;
      vy = (vy / len) * this.speed;
    }

    this.setVelocity(vx, vy);

    // Rotate player toward mouse
    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
    this.setRotation(angle);

    // Reload
    if (this.keys.R.isDown && !this.isReloading && this.magazineAmmo < this.maxMagazine && this.reserveAmmo > 0) {
      this.reload();
    }
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    // Flash red
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
    this.scene.time.delayedCall(1500, () => {
      // Move bullets from reserve to magazine
      const needed = this.maxMagazine - this.magazineAmmo;
      const toLoad = Math.min(needed, this.reserveAmmo);
      this.magazineAmmo += toLoad;
      this.reserveAmmo -= toLoad;
      this.isReloading = false;
    });
  }

  addAmmo(amount: number) {
    this.reserveAmmo = Math.min(this.reserveAmmo + amount, this.maxReserve);
  }

  shoot(): Phaser.Math.Vector2 | null {
    if (this.magazineAmmo <= 0 || this.isReloading) return null;
    this.magazineAmmo--;

    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    return new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);
  }
}
