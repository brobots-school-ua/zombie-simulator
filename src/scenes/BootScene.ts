import Phaser from 'phaser';

// Boot scene — generates all game graphics (no external assets needed)
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const g = this.add.graphics();

    // === PLAYER (top-down with shoulders) ===
    // Body
    g.fillStyle(0x2266cc);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x4488ff);
    g.fillCircle(16, 16, 12);
    // Shoulders / arms
    g.fillStyle(0x3377dd);
    g.fillCircle(8, 10, 5);
    g.fillCircle(24, 10, 5);
    // Highlight (3D)
    g.fillStyle(0x66aaff);
    g.fillCircle(13, 12, 5);
    g.fillStyle(0x99ccff);
    g.fillCircle(11, 10, 2);
    g.generateTexture('player', 32, 32);
    g.clear();

    // === WEAPON (gun pointing right) ===
    // Main barrel
    g.fillStyle(0x4a4a4a);
    g.fillRect(0, 3, 28, 6);
    // Grip
    g.fillStyle(0x5a3a2a);
    g.fillRect(0, 2, 8, 8);
    // Muzzle
    g.fillStyle(0x3a3a3a);
    g.fillRect(22, 2, 6, 8);
    // Muzzle flash hole
    g.fillStyle(0x222222);
    g.fillRect(26, 4, 2, 4);
    // Metal highlight
    g.fillStyle(0x6a6a6a);
    g.fillRect(8, 3, 14, 2);
    g.generateTexture('weapon', 28, 12);
    g.clear();

    // === ZOMBIE WALKER (rotten, bloody, arm reaching) ===
    // Body
    g.fillStyle(0x4a6025);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x556b2f);
    g.fillCircle(16, 16, 12);
    // Rot patches
    g.fillStyle(0x3d4f20);
    g.fillCircle(10, 20, 5);
    g.fillCircle(22, 14, 4);
    // Blood spots
    g.fillStyle(0x8b0000);
    g.fillCircle(20, 22, 3);
    g.fillCircle(8, 12, 2);
    g.fillCircle(24, 8, 2);
    // Eyes
    g.fillStyle(0xff0000);
    g.fillCircle(11, 12, 3);
    g.fillCircle(21, 12, 3);
    g.fillStyle(0x330000);
    g.fillCircle(11, 12, 1);
    g.fillCircle(21, 12, 1);
    // Reaching arm
    g.fillStyle(0x556b2f);
    g.fillRect(26, 10, 6, 4);
    g.fillStyle(0x4a5e28);
    g.fillRect(30, 9, 2, 6);
    g.generateTexture('zombie-walker', 32, 32);
    g.clear();

    // === ZOMBIE RUNNER (lean, fast, scratched) ===
    // Lean body
    g.fillStyle(0x6a7b35);
    g.fillCircle(16, 16, 12);
    g.fillStyle(0x7a8b3f);
    g.fillCircle(16, 16, 10);
    // Scratches
    g.lineStyle(1, 0x4a5b25);
    g.lineBetween(6, 8, 14, 16);
    g.lineBetween(18, 6, 26, 14);
    g.lineBetween(8, 20, 16, 28);
    // Blood
    g.fillStyle(0xaa2222);
    g.fillCircle(22, 20, 2);
    g.fillCircle(10, 24, 2);
    // Wild eyes
    g.fillStyle(0xff4444);
    g.fillCircle(11, 12, 3);
    g.fillCircle(21, 12, 3);
    g.fillStyle(0xffff00);
    g.fillCircle(11, 12, 1);
    g.fillCircle(21, 12, 1);
    // Both arms reaching
    g.fillStyle(0x7a8b3f);
    g.fillRect(26, 8, 5, 3);
    g.fillRect(26, 14, 5, 3);
    g.generateTexture('zombie-runner', 32, 32);
    g.clear();

    // === ZOMBIE TANK (massive, armored, scarred) ===
    // Big body
    g.fillStyle(0x2e3d16);
    g.fillCircle(20, 20, 19);
    g.fillStyle(0x3a4a1f);
    g.fillCircle(20, 20, 17);
    // Armor plating
    g.fillStyle(0x4a5a2f);
    g.fillCircle(20, 20, 12);
    g.lineStyle(2, 0x2a3510);
    g.strokeCircle(20, 20, 12);
    // Scars
    g.lineStyle(2, 0x1a2508);
    g.lineBetween(8, 10, 18, 16);
    g.lineBetween(22, 26, 32, 34);
    g.lineBetween(10, 28, 18, 34);
    // Blood
    g.fillStyle(0x660000);
    g.fillCircle(12, 28, 3);
    g.fillCircle(28, 14, 3);
    g.fillCircle(14, 14, 2);
    // Angry eyes
    g.fillStyle(0xff0000);
    g.fillRect(12, 12, 6, 5);
    g.fillRect(22, 12, 6, 5);
    g.fillStyle(0xcc0000);
    g.fillRect(14, 13, 3, 3);
    g.fillRect(24, 13, 3, 3);
    g.generateTexture('zombie-tank', 40, 40);
    g.clear();

    // === BULLET (tracer style — elongated capsule with glow) ===
    // Outer glow
    g.fillStyle(0xffff00, 0.3);
    g.fillEllipse(10, 4, 18, 6);
    // Core
    g.fillStyle(0xffdd44, 0.8);
    g.fillEllipse(12, 4, 12, 4);
    // Bright center
    g.fillStyle(0xffffff);
    g.fillEllipse(14, 4, 6, 2);
    g.generateTexture('bullet', 20, 8);
    g.clear();

    // Bullet trail particle
    g.fillStyle(0xffaa00, 0.6);
    g.fillCircle(3, 3, 3);
    g.generateTexture('bullet-trail', 6, 6);
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

    // Grass tiles
    this.generateGrassTile(g, 'ground1', 0x3a7a3a);
    this.generateGrassTile(g, 'ground2', 0x3d8040);
    this.generateGrassTile(g, 'ground3', 0x357535);

    // Stone wall texture
    g.fillStyle(0x7a7a72);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x6e6e66);
    g.fillRect(2, 2, 28, 14);
    g.fillRect(34, 2, 28, 14);
    g.fillRect(18, 20, 28, 14);
    g.fillRect(2, 20, 12, 14);
    g.fillRect(50, 20, 12, 14);
    g.fillRect(2, 38, 28, 14);
    g.fillRect(34, 38, 28, 14);
    g.fillRect(18, 54, 28, 8);
    g.fillStyle(0x8a8a82);
    g.fillRect(4, 4, 12, 4);
    g.fillRect(36, 4, 12, 4);
    g.fillRect(20, 22, 12, 4);
    g.fillRect(4, 40, 12, 4);
    g.fillRect(36, 40, 12, 4);
    g.lineStyle(2, 0x4a4a44);
    g.lineBetween(0, 17, 64, 17);
    g.lineBetween(0, 36, 64, 36);
    g.lineBetween(0, 53, 64, 53);
    g.lineBetween(32, 0, 32, 17);
    g.lineBetween(16, 17, 16, 36);
    g.lineBetween(48, 17, 48, 36);
    g.lineBetween(32, 36, 32, 53);
    g.lineStyle(1, 0x555550);
    g.lineBetween(10, 6, 14, 12);
    g.lineBetween(44, 24, 40, 30);
    g.lineBetween(8, 42, 14, 48);
    g.lineBetween(52, 8, 56, 14);
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

    // Menu zombie silhouette (for background decoration)
    g.fillStyle(0x1a2a0a, 0.4);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0x1a2a0a, 0.3);
    g.fillRect(32, 12, 8, 4);
    g.fillRect(32, 20, 8, 4);
    g.fillStyle(0x440000, 0.5);
    g.fillCircle(14, 16, 3);
    g.fillCircle(26, 16, 3);
    g.generateTexture('menu-zombie', 40, 40);
    g.clear();

    // Fog particle for menu
    g.fillStyle(0x335533, 0.15);
    g.fillCircle(32, 32, 32);
    g.fillStyle(0x224422, 0.1);
    g.fillCircle(32, 32, 24);
    g.generateTexture('fog-particle', 64, 64);

    g.destroy();

    this.scene.start('MenuScene');
  }

  private generateGrassTile(g: Phaser.GameObjects.Graphics, key: string, baseColor: number) {
    g.fillStyle(baseColor);
    g.fillRect(0, 0, 64, 64);

    g.fillStyle(baseColor - 0x0a0a0a);
    g.fillRect(8, 12, 10, 8);
    g.fillRect(38, 40, 12, 10);
    g.fillRect(50, 8, 8, 6);

    g.fillStyle(baseColor + 0x101008);
    g.fillRect(20, 30, 14, 10);
    g.fillRect(4, 48, 10, 8);
    g.fillRect(44, 22, 8, 8);

    // Random grass blades
    const bladeColors = [0x4a9a4a, 0x3a8a3a, 0x5aaa50, 0x2d7a2d];
    for (let i = 0; i < 25; i++) {
      const bx = (i * 17 + 7) % 60 + 2;
      const by = (i * 23 + 11) % 56 + 4;
      g.lineStyle(1, bladeColors[i % bladeColors.length]);
      g.lineBetween(bx, by, bx + (i % 3 - 1), by - 5 - (i % 4));
    }

    // Small pebbles
    g.fillStyle(0x5a6a3a);
    g.fillRect(15, 10, 2, 2);
    g.fillRect(45, 50, 2, 2);
    g.fillRect(30, 5, 2, 2);
    g.fillRect(55, 35, 2, 2);

    if (key === 'ground2') {
      g.fillStyle(0xdddd44);
      g.fillRect(12, 28, 2, 2);
      g.fillRect(48, 16, 2, 2);
    }
    if (key === 'ground3') {
      g.fillStyle(0x4a3a2a);
      g.fillRect(20, 40, 6, 4);
      g.fillRect(42, 12, 4, 4);
    }

    g.generateTexture(key, 64, 64);
    g.clear();
  }
}
