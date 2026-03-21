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

    // === WEAPON 1: RIFLE ===
    g.fillStyle(0x5a3820);
    g.fillRect(0, 4, 10, 7);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 5, 8, 5);
    g.lineStyle(1, 0x4a2e18, 0.5);
    g.lineBetween(2, 6, 8, 6);
    g.fillStyle(0x3a3a3e);
    g.fillRect(9, 3, 12, 8);
    g.fillStyle(0x4a4a50);
    g.fillRect(10, 4, 10, 6);
    g.fillStyle(0x3a3a40);
    g.fillRect(20, 5, 10, 4);
    g.fillStyle(0x4a4a52);
    g.fillRect(20, 5, 10, 2);
    g.fillStyle(0x2a2a30);
    g.fillRect(28, 4, 4, 6);
    g.fillStyle(0x222228);
    g.fillRect(30, 5, 2, 4);
    g.fillStyle(0x555560);
    g.fillRect(26, 3, 2, 2);
    g.generateTexture('weapon-rifle', 32, 14);
    g.generateTexture('weapon', 32, 14); // backward compat
    g.clear();

    // === WEAPON 2: SHOTGUN (short, wide barrel) ===
    g.fillStyle(0x5a3820);
    g.fillRect(0, 3, 8, 8);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 4, 6, 6);
    g.fillStyle(0x3a3a3e);
    g.fillRect(7, 3, 8, 8);
    g.fillStyle(0x4a4a50);
    g.fillRect(8, 4, 6, 6);
    // Double barrel
    g.fillStyle(0x3a3a40);
    g.fillRect(14, 3, 12, 4);
    g.fillRect(14, 7, 12, 4);
    g.fillStyle(0x4a4a52);
    g.fillRect(14, 3, 12, 1);
    g.fillRect(14, 7, 12, 1);
    // Muzzle
    g.fillStyle(0x222228);
    g.fillRect(25, 3, 2, 4);
    g.fillRect(25, 7, 2, 4);
    // Separator
    g.fillStyle(0x555560);
    g.fillRect(14, 6, 12, 1);
    g.generateTexture('weapon-shotgun', 28, 14);
    g.clear();

    // === WEAPON 3: SMG (compact, short) ===
    g.fillStyle(0x3a3a3e);
    g.fillRect(0, 4, 6, 6);
    g.fillStyle(0x4a4a50);
    g.fillRect(1, 5, 4, 4);
    // Body
    g.fillStyle(0x3a3a3e);
    g.fillRect(5, 3, 10, 8);
    g.fillStyle(0x4a4a50);
    g.fillRect(6, 4, 8, 6);
    // Magazine sticking down
    g.fillStyle(0x333338);
    g.fillRect(8, 10, 4, 4);
    // Barrel (short)
    g.fillStyle(0x3a3a40);
    g.fillRect(14, 5, 8, 4);
    g.fillStyle(0x4a4a52);
    g.fillRect(14, 5, 8, 1);
    g.fillStyle(0x222228);
    g.fillRect(21, 5, 2, 4);
    g.generateTexture('weapon-smg', 24, 14);
    g.clear();

    // === WEAPON 4: SNIPER (long barrel, scope) ===
    g.fillStyle(0x5a3820);
    g.fillRect(0, 5, 8, 6);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 6, 6, 4);
    g.fillStyle(0x3a3a3e);
    g.fillRect(7, 4, 10, 7);
    g.fillStyle(0x4a4a50);
    g.fillRect(8, 5, 8, 5);
    // Long barrel
    g.fillStyle(0x3a3a40);
    g.fillRect(16, 6, 20, 3);
    g.fillStyle(0x4a4a52);
    g.fillRect(16, 6, 20, 1);
    g.fillStyle(0x222228);
    g.fillRect(35, 6, 2, 3);
    // Scope
    g.fillStyle(0x2a2a30);
    g.fillRect(12, 1, 10, 3);
    g.fillStyle(0x3a3a42);
    g.fillCircle(12, 2, 2);
    g.fillCircle(22, 2, 2);
    g.fillStyle(0x4488cc, 0.4);
    g.fillCircle(12, 2, 1);
    g.generateTexture('weapon-sniper', 38, 14);
    g.clear();

    // === WEAPON 5: GRENADE LAUNCHER (thick barrel) ===
    g.fillStyle(0x5a3820);
    g.fillRect(0, 4, 7, 7);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 5, 5, 5);
    g.fillStyle(0x3a3a3e);
    g.fillRect(6, 3, 8, 9);
    g.fillStyle(0x4a4a50);
    g.fillRect(7, 4, 6, 7);
    // Thick barrel
    g.fillStyle(0x3a3a40);
    g.fillRect(13, 3, 14, 9);
    g.fillStyle(0x4a4a52);
    g.fillRect(13, 3, 14, 2);
    g.fillStyle(0x2a2a30);
    g.fillRect(13, 11, 14, 1);
    // Muzzle (wide opening)
    g.fillStyle(0x222228);
    g.fillRect(26, 3, 3, 9);
    g.fillStyle(0x333338);
    g.fillRect(27, 4, 2, 7);
    // Barrel ring
    g.lineStyle(1, 0x555560);
    g.lineBetween(20, 3, 20, 12);
    g.generateTexture('weapon-grenade', 30, 14);
    g.clear();

    // === PROJECTILE TEXTURES ===

    // Rifle bullet — orange/yellow tracer
    g.fillStyle(0xffaa00, 0.3);
    g.fillEllipse(10, 4, 18, 6);
    g.fillStyle(0xffcc44, 0.8);
    g.fillEllipse(12, 4, 12, 4);
    g.fillStyle(0xffffff);
    g.fillEllipse(14, 4, 6, 2);
    g.generateTexture('bullet-rifle', 20, 8);
    g.generateTexture('bullet', 20, 8); // backward compat
    g.clear();

    // Shotgun pellet — small hot red ball
    g.fillStyle(0xff4400, 0.4);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0xff6633, 0.8);
    g.fillCircle(4, 4, 3);
    g.fillStyle(0xffcc88);
    g.fillCircle(3, 3, 1.5);
    g.generateTexture('bullet-shotgun', 8, 8);
    g.clear();

    // SMG bullet — small green tracer
    g.fillStyle(0x44ff44, 0.3);
    g.fillEllipse(7, 3, 14, 5);
    g.fillStyle(0x88ff88, 0.7);
    g.fillEllipse(8, 3, 10, 3);
    g.fillStyle(0xccffcc);
    g.fillEllipse(9, 3, 4, 2);
    g.generateTexture('bullet-smg', 14, 6);
    g.clear();

    // Sniper bullet — long blue/white piercing round
    g.fillStyle(0x4488ff, 0.3);
    g.fillEllipse(12, 3, 24, 5);
    g.fillStyle(0x66aaff, 0.7);
    g.fillEllipse(14, 3, 18, 3);
    g.fillStyle(0xccddff);
    g.fillEllipse(16, 3, 8, 2);
    g.fillStyle(0xffffff);
    g.fillEllipse(18, 3, 4, 1);
    g.generateTexture('bullet-sniper', 24, 6);
    g.clear();

    // Rocket — chunky dark body with red warhead and flame tail
    g.fillStyle(0x444444);
    g.fillRect(2, 2, 10, 6);
    g.fillStyle(0x555555);
    g.fillRect(3, 3, 8, 4);
    // Warhead (red tip)
    g.fillStyle(0xcc2222);
    g.fillRect(11, 2, 4, 6);
    g.fillStyle(0xff4444);
    g.fillRect(12, 3, 3, 4);
    // Fins at back
    g.fillStyle(0x333333);
    g.fillRect(0, 1, 3, 2);
    g.fillRect(0, 7, 3, 2);
    // Flame exhaust
    g.fillStyle(0xff8800, 0.6);
    g.fillCircle(1, 5, 2);
    g.fillStyle(0xffcc00, 0.4);
    g.fillCircle(0, 5, 1.5);
    g.generateTexture('bullet-rocket', 16, 10);
    g.clear();

    // === ZOMBIE WALKER — body only (no arms, no rotation) ===
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
    // Eyes (always face "up" = forward)
    g.fillStyle(0xff0000);
    g.fillCircle(11, 10, 3);
    g.fillCircle(21, 10, 3);
    g.fillStyle(0x330000);
    g.fillCircle(11, 10, 1);
    g.fillCircle(21, 10, 1);
    g.generateTexture('zombie-walker', 32, 32);
    g.clear();

    // Walker arms (reaching forward)
    g.fillStyle(0x556b2f);
    g.fillRect(0, 4, 8, 4);   // left arm
    g.fillRect(0, 16, 8, 4);  // right arm
    g.fillStyle(0x4a5e28);
    g.fillRect(6, 3, 3, 6);   // left hand
    g.fillRect(6, 15, 3, 6);  // right hand
    g.generateTexture('zombie-walker-arms', 10, 24);
    g.clear();

    // === ZOMBIE RUNNER — body only ===
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
    g.fillCircle(11, 10, 3);
    g.fillCircle(21, 10, 3);
    g.fillStyle(0xffff00);
    g.fillCircle(11, 10, 1);
    g.fillCircle(21, 10, 1);
    g.generateTexture('zombie-runner', 32, 32);
    g.clear();

    // Runner arms (clawing forward, thinner)
    g.fillStyle(0x7a8b3f);
    g.fillRect(0, 3, 10, 3);   // left arm
    g.fillRect(0, 16, 10, 3);  // right arm
    // Claws
    g.fillStyle(0x5a6b2f);
    g.fillRect(8, 2, 3, 2);
    g.fillRect(8, 5, 3, 2);
    g.fillRect(8, 15, 3, 2);
    g.fillRect(8, 18, 3, 2);
    g.generateTexture('zombie-runner-arms', 12, 22);
    g.clear();

    // === ZOMBIE TANK — body only (massive) ===
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
    g.fillRect(12, 10, 6, 5);
    g.fillRect(22, 10, 6, 5);
    g.fillStyle(0xcc0000);
    g.fillRect(14, 11, 3, 3);
    g.fillRect(24, 11, 3, 3);
    g.generateTexture('zombie-tank', 40, 40);
    g.clear();

    // Tank arms (thick, heavy)
    g.fillStyle(0x3a4a1f);
    g.fillRect(0, 3, 10, 6);   // left arm
    g.fillRect(0, 19, 10, 6);  // right arm
    g.fillStyle(0x2e3d16);
    g.fillRect(8, 2, 4, 8);    // left fist
    g.fillRect(8, 18, 4, 8);   // right fist
    // Armor on arms
    g.fillStyle(0x4a5a2f, 0.6);
    g.fillRect(2, 4, 6, 4);
    g.fillRect(2, 20, 6, 4);
    g.generateTexture('zombie-tank-arms', 14, 28);
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

    // Grass tiles — rich natural variants
    this.generateGrassTile(g, 'ground1', 0x3a7a3a, 0);
    this.generateGrassTile(g, 'ground2', 0x3d8040, 1);
    this.generateGrassTile(g, 'ground3', 0x357535, 2);

    // Stone wall texture — weathered apocalyptic bricks
    // Base mortar color (dark grout)
    g.fillStyle(0x3a3832);
    g.fillRect(0, 0, 64, 64);

    // Brick rows with offset pattern — each brick has 3D shading
    const brickRows = [
      { y: 1, h: 14, offX: 0 },
      { y: 18, h: 14, offX: 16 },
      { y: 35, h: 14, offX: 0 },
      { y: 52, h: 11, offX: 16 },
    ];

    brickRows.forEach(row => {
      for (let bx = -16 + row.offX; bx < 64; bx += 33) {
        const x = Math.max(bx, 0);
        const w = Math.min(bx + 30, 64) - x;
        if (w <= 0) continue;

        // Brick body — varied color
        const shade = ((bx * 7 + row.y * 13) % 20) - 10;
        const r = Math.min(255, Math.max(0, 0x5e + shade));
        const gc = Math.min(255, Math.max(0, 0x56 + shade));
        const b = Math.min(255, Math.max(0, 0x4a + shade));
        g.fillStyle((r << 16) | (gc << 8) | b);
        g.fillRect(x, row.y, w, row.h);

        // Top highlight (3D effect)
        g.fillStyle(0x7a7268, 0.5);
        g.fillRect(x, row.y, w, 2);

        // Bottom shadow
        g.fillStyle(0x2a2822, 0.5);
        g.fillRect(x, row.y + row.h - 2, w, 2);

        // Left highlight
        g.fillStyle(0x6e6860, 0.3);
        g.fillRect(x, row.y, 1, row.h);

        // Right shadow
        g.fillStyle(0x2e2c26, 0.3);
        g.fillRect(x + w - 1, row.y, 1, row.h);
      }
    });

    // Mortar line details (varied thickness)
    g.lineStyle(2, 0x33312c);
    g.lineBetween(0, 16, 64, 16);
    g.lineBetween(0, 33, 64, 33);
    g.lineBetween(0, 50, 64, 50);
    g.lineStyle(1, 0x2e2c28);
    g.lineBetween(30, 0, 30, 16);
    g.lineBetween(14, 17, 14, 33);
    g.lineBetween(46, 17, 46, 33);
    g.lineBetween(30, 34, 30, 50);
    g.lineBetween(14, 51, 14, 64);
    g.lineBetween(46, 51, 46, 64);

    // Cracks (branching lines)
    g.lineStyle(1, 0x222020);
    g.lineBetween(12, 4, 18, 10);
    g.lineBetween(18, 10, 22, 9);
    g.lineBetween(18, 10, 16, 15);
    g.lineBetween(42, 38, 50, 44);
    g.lineBetween(50, 44, 52, 42);
    g.lineBetween(50, 44, 48, 49);

    // Moss patches (green in corners and crevices)
    g.fillStyle(0x3a5a2a, 0.6);
    g.fillCircle(3, 3, 4);
    g.fillCircle(60, 61, 5);
    g.fillStyle(0x4a6a35, 0.4);
    g.fillCircle(32, 33, 3);
    g.fillCircle(14, 50, 3);
    g.fillStyle(0x2d4a1e, 0.5);
    g.fillCircle(48, 16, 3);

    // Blood/rust stains
    g.fillStyle(0x5a1a1a, 0.3);
    g.fillCircle(40, 8, 4);
    g.fillCircle(42, 10, 3);
    g.fillStyle(0x6a3a1a, 0.25);
    g.fillCircle(10, 42, 5);
    g.fillCircle(55, 26, 3);

    // Weathering — dark spots
    g.fillStyle(0x2a2826, 0.2);
    g.fillCircle(22, 24, 4);
    g.fillCircle(50, 6, 3);

    // Border outline
    g.lineStyle(1, 0x2a2826);
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

  private generateGrassTile(g: Phaser.GameObjects.Graphics, key: string, baseColor: number, variant: number) {
    // Base fill
    g.fillStyle(baseColor);
    g.fillRect(0, 0, 64, 64);

    // Organic color variation — overlapping circles instead of rectangles
    const darkShade = baseColor - 0x0c0c08;
    const lightShade = baseColor + 0x0e0e06;
    const warmShade = baseColor + 0x0a0400;

    // Dark patches (shadow areas)
    g.fillStyle(darkShade, 0.6);
    g.fillCircle(12, 14, 8);
    g.fillCircle(44, 44, 10);
    g.fillCircle(52, 10, 6);
    g.fillCircle(8, 52, 7);

    // Light patches (sun-lit areas)
    g.fillStyle(lightShade, 0.5);
    g.fillCircle(28, 32, 10);
    g.fillCircle(48, 24, 7);
    g.fillCircle(16, 44, 6);

    // Warm earth undertone
    g.fillStyle(warmShade, 0.3);
    g.fillCircle(36, 12, 8);
    g.fillCircle(20, 56, 7);

    // Dirt/mud patches — irregular shapes (overlapping circles)
    if (variant === 0) {
      g.fillStyle(0x5a4e32, 0.5);
      g.fillCircle(40, 50, 6);
      g.fillCircle(44, 52, 5);
      g.fillCircle(38, 54, 4);
    } else if (variant === 1) {
      g.fillStyle(0x564a30, 0.45);
      g.fillCircle(14, 20, 5);
      g.fillCircle(18, 22, 4);
      g.fillCircle(12, 24, 3);
    } else {
      g.fillStyle(0x52462e, 0.5);
      g.fillCircle(50, 14, 7);
      g.fillCircle(54, 18, 5);
    }

    // Grass blades — varied length, direction, color
    const bladeColors = [0x4a9a4a, 0x3a8a3a, 0x5aaa50, 0x2d7a2d, 0x48a045, 0x358535, 0x5ab858];
    for (let i = 0; i < 35; i++) {
      const bx = (i * 17 + 7 + variant * 11) % 60 + 2;
      const by = (i * 23 + 11 + variant * 7) % 56 + 4;
      const len = 4 + (i % 5);
      const sway = (i % 5) - 2;
      g.lineStyle(1, bladeColors[i % bladeColors.length], 0.7 + (i % 3) * 0.1);
      g.lineBetween(bx, by, bx + sway, by - len);
      // Some blades are thicker (tufts)
      if (i % 7 === 0) {
        g.lineBetween(bx - 1, by, bx + sway - 1, by - len + 1);
      }
    }

    // Small wildflowers
    if (variant === 0) {
      // Yellow flowers
      g.fillStyle(0xe8d840);
      g.fillCircle(18, 36, 1.5);
      g.fillCircle(50, 28, 1.5);
      g.fillStyle(0xf0e050);
      g.fillCircle(18, 36, 0.8);
    } else if (variant === 1) {
      // White flowers
      g.fillStyle(0xddeedd);
      g.fillCircle(36, 18, 1.5);
      g.fillCircle(8, 40, 1.5);
      g.fillStyle(0xffffe8);
      g.fillCircle(36, 18, 0.8);
    } else {
      // Purple/violet flowers
      g.fillStyle(0x8844aa);
      g.fillCircle(24, 46, 1.5);
      g.fillCircle(52, 34, 1.5);
      g.fillStyle(0xaa66cc);
      g.fillCircle(24, 46, 0.8);
    }

    // Pebbles with highlights
    const pebblePositions = [
      { x: 15, y: 10 }, { x: 45, y: 50 },
      { x: 30, y: 5 }, { x: 55, y: 35 },
    ];
    pebblePositions.forEach((p, i) => {
      // Stone body
      g.fillStyle(0x6a6a5a, 0.6);
      g.fillCircle(p.x, p.y, 1.5 + (i % 2) * 0.5);
      // Highlight dot
      g.fillStyle(0x8a8a7a, 0.5);
      g.fillCircle(p.x - 0.5, p.y - 0.5, 0.8);
    });

    // Shadow patches for depth
    g.fillStyle(0x1a3a1a, 0.12);
    g.fillCircle(24, 22, 9);
    g.fillCircle(42, 38, 7);

    g.generateTexture(key, 64, 64);
    g.clear();
  }
}
