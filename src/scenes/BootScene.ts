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
    // Darker border
    g.lineStyle(2, 0x2266cc);
    g.strokeRect(1, 1, 30, 30);
    // Eyes
    g.fillStyle(0xffffff);
    g.fillRect(8, 8, 6, 6);
    g.fillRect(18, 8, 6, 6);
    g.fillStyle(0x000000);
    g.fillRect(10, 10, 3, 3);
    g.fillRect(20, 10, 3, 3);
    g.generateTexture('player', 32, 32);
    g.clear();

    // Zombie walker (rotten green with red eyes)
    g.fillStyle(0x556b2f);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x4a5e28);
    g.fillRect(4, 4, 12, 12);
    g.fillRect(16, 18, 10, 8);
    g.lineStyle(1, 0x3d4f20);
    g.strokeRect(0, 0, 32, 32);
    g.fillStyle(0xff0000);
    g.fillRect(8, 8, 6, 6);
    g.fillRect(18, 8, 6, 6);
    g.fillStyle(0x330000);
    g.fillRect(10, 10, 3, 3);
    g.fillRect(20, 10, 3, 3);
    g.generateTexture('zombie-walker', 32, 32);
    g.clear();

    // Runner zombie (lean, lighter, with scratches)
    g.fillStyle(0x7a8b3f);
    g.fillRect(2, 2, 28, 28);
    g.fillStyle(0x8a9b4f);
    g.fillRect(6, 4, 8, 6);
    g.fillRect(18, 16, 8, 8);
    g.lineStyle(1, 0x5a6b2f);
    g.lineBetween(4, 20, 12, 26);
    g.lineBetween(20, 4, 26, 10);
    g.fillStyle(0xff4444);
    g.fillRect(8, 8, 6, 6);
    g.fillRect(18, 8, 6, 6);
    g.generateTexture('zombie-runner', 32, 32);
    g.clear();

    // Tank zombie (big, dark, armored look)
    g.fillStyle(0x3a4a1f);
    g.fillRect(0, 0, 40, 40);
    g.fillStyle(0x2e3d16);
    g.fillRect(4, 4, 32, 32);
    g.fillStyle(0x4a5a2f);
    g.fillRect(8, 14, 24, 16);
    // Scars
    g.lineStyle(2, 0x2a3510);
    g.lineBetween(6, 6, 16, 12);
    g.lineBetween(24, 28, 34, 34);
    g.lineStyle(1, 0x556830);
    g.strokeRect(2, 2, 36, 36);
    // Eyes
    g.fillStyle(0xff0000);
    g.fillRect(10, 8, 8, 8);
    g.fillRect(22, 8, 8, 8);
    g.fillStyle(0x660000);
    g.fillRect(12, 10, 4, 4);
    g.fillRect(24, 10, 4, 4);
    g.generateTexture('zombie-tank', 40, 40);
    g.clear();

    // Bullet
    g.fillStyle(0xffff00);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0xffcc00);
    g.fillCircle(4, 4, 2);
    g.generateTexture('bullet', 8, 8);
    g.clear();

    // Health pickup (red cross)
    g.fillStyle(0xff3333);
    g.fillRect(0, 8, 24, 8);
    g.fillRect(8, 0, 8, 24);
    g.generateTexture('health-pack', 24, 24);
    g.clear();

    // Ammo pickup (box with bullets)
    g.fillStyle(0x8B7355);
    g.fillRect(2, 4, 20, 16);
    g.lineStyle(1, 0x6B5335);
    g.strokeRect(2, 4, 20, 16);
    g.fillStyle(0xffcc00);
    g.fillRect(5, 7, 4, 10);
    g.fillRect(10, 7, 4, 10);
    g.fillRect(15, 7, 4, 10);
    g.fillStyle(0xcc8800);
    g.fillRect(5, 7, 4, 3);
    g.fillRect(10, 7, 4, 3);
    g.fillRect(15, 7, 4, 3);
    g.generateTexture('ammo-pack', 24, 24);
    g.clear();

    // Ground tile 1 — grass with blades and color variation
    this.generateGrassTile(g, 'ground1', 0x3a7a3a);
    this.generateGrassTile(g, 'ground2', 0x3d8040);
    this.generateGrassTile(g, 'ground3', 0x357535);

    // Stone wall texture — rocky with cracks and shading
    // Base stone color
    g.fillStyle(0x7a7a72);
    g.fillRect(0, 0, 64, 64);
    // Stone blocks pattern
    g.fillStyle(0x6e6e66);
    g.fillRect(2, 2, 28, 14);
    g.fillRect(34, 2, 28, 14);
    g.fillRect(18, 20, 28, 14);
    g.fillRect(2, 20, 12, 14);
    g.fillRect(50, 20, 12, 14);
    g.fillRect(2, 38, 28, 14);
    g.fillRect(34, 38, 28, 14);
    g.fillRect(18, 54, 28, 8);
    // Lighter highlights on stones
    g.fillStyle(0x8a8a82);
    g.fillRect(4, 4, 12, 4);
    g.fillRect(36, 4, 12, 4);
    g.fillRect(20, 22, 12, 4);
    g.fillRect(4, 40, 12, 4);
    g.fillRect(36, 40, 12, 4);
    // Dark mortar lines between stones
    g.lineStyle(2, 0x4a4a44);
    g.lineBetween(0, 17, 64, 17);
    g.lineBetween(0, 36, 64, 36);
    g.lineBetween(0, 53, 64, 53);
    g.lineBetween(32, 0, 32, 17);
    g.lineBetween(16, 17, 16, 36);
    g.lineBetween(48, 17, 48, 36);
    g.lineBetween(32, 36, 32, 53);
    // Cracks
    g.lineStyle(1, 0x555550);
    g.lineBetween(10, 6, 14, 12);
    g.lineBetween(44, 24, 40, 30);
    g.lineBetween(8, 42, 14, 48);
    g.lineBetween(52, 8, 56, 14);
    // Dark border
    g.lineStyle(1, 0x3a3a35);
    g.strokeRect(0, 0, 64, 64);
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

  private generateGrassTile(g: Phaser.GameObjects.Graphics, key: string, baseColor: number) {
    // Base fill
    g.fillStyle(baseColor);
    g.fillRect(0, 0, 64, 64);

    // Darker patches (dirt/shadow)
    g.fillStyle(baseColor - 0x0a0a0a);
    g.fillRect(8, 12, 10, 8);
    g.fillRect(38, 40, 12, 10);
    g.fillRect(50, 8, 8, 6);

    // Lighter patches (sunlit grass)
    g.fillStyle(baseColor + 0x101008);
    g.fillRect(20, 30, 14, 10);
    g.fillRect(4, 48, 10, 8);
    g.fillRect(44, 22, 8, 8);

    // Grass blades (thin lines in various greens)
    const bladeColors = [0x4a9a4a, 0x3a8a3a, 0x5aaa50, 0x2d7a2d];
    for (let i = 0; i < 20; i++) {
      const bx = (i * 17 + 7) % 60 + 2;
      const by = (i * 23 + 11) % 56 + 4;
      g.lineStyle(1, bladeColors[i % bladeColors.length]);
      g.lineBetween(bx, by, bx + (i % 3 - 1), by - 4 - (i % 3));
    }

    // Small dots (pebbles, flowers)
    g.fillStyle(0x5a6a3a);
    g.fillRect(15, 10, 2, 2);
    g.fillRect(45, 50, 2, 2);
    g.fillRect(30, 5, 2, 2);
    g.fillRect(55, 35, 2, 2);

    // Tiny yellow flowers on some tiles
    if (key === 'ground2') {
      g.fillStyle(0xdddd44);
      g.fillRect(12, 28, 2, 2);
      g.fillRect(48, 16, 2, 2);
    }

    g.generateTexture(key, 64, 64);
    g.clear();
  }
}
