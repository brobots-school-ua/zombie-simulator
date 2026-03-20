import Phaser from 'phaser';

// Boot scene — generates all game graphics (no external assets needed)
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const g = this.add.graphics();

    // Player sprite (blue square with eyes)
    g.fillStyle(0x4488ff);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xffffff);
    g.fillRect(8, 8, 6, 6);
    g.fillRect(18, 8, 6, 6);
    g.fillStyle(0x000000);
    g.fillRect(10, 10, 3, 3);
    g.fillRect(20, 10, 3, 3);
    g.generateTexture('player', 32, 32);
    g.clear();

    // Zombie walker (dark green with red eyes)
    g.fillStyle(0x556b2f);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xff0000);
    g.fillRect(8, 8, 6, 6);
    g.fillRect(18, 8, 6, 6);
    g.fillStyle(0x330000);
    g.fillRect(10, 10, 3, 3);
    g.fillRect(20, 10, 3, 3);
    g.generateTexture('zombie-walker', 32, 32);
    g.clear();

    // Runner zombie (lighter green)
    g.fillStyle(0x7a8b3f);
    g.fillRect(2, 2, 28, 28);
    g.fillStyle(0xff4444);
    g.fillRect(8, 8, 6, 6);
    g.fillRect(18, 8, 6, 6);
    g.generateTexture('zombie-runner', 32, 32);
    g.clear();

    // Tank zombie (big, dark)
    g.fillStyle(0x3a4a1f);
    g.fillRect(0, 0, 40, 40);
    g.fillStyle(0xff0000);
    g.fillRect(10, 8, 8, 8);
    g.fillRect(22, 8, 8, 8);
    g.generateTexture('zombie-tank', 40, 40);
    g.clear();

    // Bullet
    g.fillStyle(0xffff00);
    g.fillCircle(4, 4, 4);
    g.generateTexture('bullet', 8, 8);
    g.clear();

    // Health pickup (red cross)
    g.fillStyle(0xff3333);
    g.fillRect(0, 8, 24, 8);
    g.fillRect(8, 0, 8, 24);
    g.generateTexture('health-pack', 24, 24);
    g.clear();

    // Ammo pickup
    g.fillStyle(0xffaa00);
    g.fillRect(4, 0, 16, 24);
    g.fillStyle(0xcc8800);
    g.fillRect(6, 2, 12, 8);
    g.generateTexture('ammo-pack', 24, 24);
    g.clear();

    // Ground tile
    g.fillStyle(0x3a7a3a);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x2d6b2d);
    g.fillRect(10, 10, 4, 4);
    g.fillRect(40, 30, 4, 4);
    g.fillRect(25, 50, 4, 4);
    g.generateTexture('ground', 64, 64);
    g.clear();

    // Wall / obstacle
    g.fillStyle(0x666666);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x555555);
    g.fillRect(0, 0, 32, 32);
    g.fillRect(32, 32, 32, 32);
    g.generateTexture('wall', 64, 64);
    g.clear();

    // Crosshair
    g.lineStyle(2, 0xff0000);
    g.strokeCircle(12, 12, 10);
    g.lineBetween(12, 0, 12, 24);
    g.lineBetween(0, 12, 24, 12);
    g.generateTexture('crosshair', 24, 24);

    g.destroy();

    this.scene.start('MenuScene');
  }
}
