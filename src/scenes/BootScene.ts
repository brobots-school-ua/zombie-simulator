import Phaser from 'phaser';

// Boot scene — generates all game graphics (no external assets needed)
// V2: Improved visuals with outlines, shadows, more detail
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const g = this.add.graphics();

    // === PLAYER (top-down survivor with outfit details) ===
    // Drop shadow
    g.fillStyle(0x000000, 0.25);
    g.fillCircle(16, 18, 13);
    // Black outline
    g.fillStyle(0x111111);
    g.fillCircle(16, 16, 14);
    // Body (jacket)
    g.fillStyle(0x1a4a8a);
    g.fillCircle(16, 16, 12);
    // Jacket lighter center
    g.fillStyle(0x2266aa);
    g.fillCircle(16, 16, 10);
    // Shoulders
    g.fillStyle(0x1a4a8a);
    g.fillCircle(7, 12, 5);
    g.fillCircle(25, 12, 5);
    // Shoulder pads (armor detail)
    g.fillStyle(0x334455);
    g.fillCircle(7, 12, 3);
    g.fillCircle(25, 12, 3);
    // Head (skin color, top of sprite = forward)
    g.fillStyle(0xd4a574);
    g.fillCircle(16, 10, 5);
    // Hair/cap
    g.fillStyle(0x2d4a1e);
    g.fillCircle(16, 8, 5);
    g.fillStyle(0x2d4a1e);
    g.fillRect(11, 5, 10, 4);
    // Cap brim
    g.fillStyle(0x1e3514);
    g.fillRect(12, 4, 8, 2);
    // Backpack hint (bottom)
    g.fillStyle(0x5a4a2a);
    g.fillRect(12, 22, 8, 5);
    g.fillStyle(0x6b5a35);
    g.fillRect(13, 23, 6, 3);
    // Belt
    g.fillStyle(0x3a2a1a);
    g.fillRect(10, 19, 12, 2);
    g.fillStyle(0xaa8833);
    g.fillRect(15, 19, 2, 2); // buckle
    // 3D highlight on jacket
    g.fillStyle(0x3388cc, 0.4);
    g.fillCircle(13, 14, 4);
    g.generateTexture('player', 32, 32);
    g.clear();

    // === WEAPON 1: RIFLE (detailed AR-style) ===
    // Stock (wood with grain)
    g.fillStyle(0x5a3820);
    g.fillRect(0, 4, 10, 7);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 5, 8, 5);
    g.lineStyle(1, 0x4a2e18, 0.4);
    g.lineBetween(2, 6, 8, 6);
    g.lineBetween(3, 8, 7, 8);
    // Receiver
    g.fillStyle(0x3a3a3e);
    g.fillRect(9, 3, 12, 8);
    g.fillStyle(0x4a4a50);
    g.fillRect(10, 4, 10, 6);
    // Trigger guard + trigger
    g.fillStyle(0x2a2a2e);
    g.fillRect(12, 10, 5, 3);
    g.fillStyle(0x555560);
    g.fillRect(14, 10, 1, 2);
    // Ejection port
    g.fillStyle(0x222228);
    g.fillRect(16, 4, 3, 2);
    // Barrel
    g.fillStyle(0x3a3a40);
    g.fillRect(20, 5, 10, 4);
    g.fillStyle(0x4a4a52);
    g.fillRect(20, 5, 10, 2);
    // Muzzle brake
    g.fillStyle(0x2a2a30);
    g.fillRect(28, 4, 4, 6);
    g.fillStyle(0x222228);
    g.fillRect(30, 5, 2, 4);
    g.lineStyle(1, 0x555560);
    g.lineBetween(29, 4, 29, 10);
    // Iron sights
    g.fillStyle(0x555560);
    g.fillRect(26, 3, 2, 2);
    g.fillRect(14, 2, 3, 2);
    g.fillStyle(0x3a3a3e);
    g.fillRect(15, 2, 1, 2);
    // Barrel highlight
    g.lineStyle(1, 0x6a6a72, 0.3);
    g.lineBetween(20, 5, 28, 5);
    g.generateTexture('weapon-rifle', 32, 14);
    g.generateTexture('weapon', 32, 14);
    g.clear();

    // === WEAPON 2: SHOTGUN (pump-action, detailed) ===
    g.fillStyle(0x5a3820);
    g.fillRect(0, 3, 7, 8);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 4, 5, 6);
    g.lineStyle(1, 0x4a2e18, 0.3);
    g.lineBetween(2, 5, 5, 5);
    g.fillStyle(0x3a3a3e);
    g.fillRect(6, 2, 9, 10);
    g.fillStyle(0x4a4a50);
    g.fillRect(7, 3, 7, 8);
    g.fillStyle(0x2a2a2e);
    g.fillRect(9, 11, 4, 2);
    g.fillStyle(0x333338);
    g.fillRect(14, 2, 14, 4);
    g.fillRect(14, 8, 14, 4);
    g.fillStyle(0x4a4a52);
    g.fillRect(14, 2, 14, 1);
    g.fillRect(14, 8, 14, 1);
    g.fillStyle(0x2a2a2e);
    g.fillRect(14, 6, 14, 2);
    g.fillStyle(0x6b4528);
    g.fillRect(17, 6, 6, 2);
    g.fillStyle(0x7a5232);
    g.fillRect(18, 6, 4, 1);
    g.fillStyle(0x1a1a1e);
    g.fillCircle(28, 4, 1.5);
    g.fillCircle(28, 10, 1.5);
    g.generateTexture('weapon-shotgun', 30, 14);
    g.clear();

    // === WEAPON 3: SNIPER (long, scoped) ===
    g.fillStyle(0x3a3a3e);
    g.fillRect(0, 5, 6, 6);
    g.fillStyle(0x4a4a50);
    g.fillRect(1, 6, 4, 4);
    g.fillStyle(0x333338);
    g.fillRect(0, 8, 2, 4);
    g.fillStyle(0x3a3a3e);
    g.fillRect(5, 4, 12, 8);
    g.fillStyle(0x4a4a52);
    g.fillRect(6, 5, 10, 6);
    g.fillStyle(0x2a2a2e);
    g.fillRect(10, 11, 3, 2);
    g.fillStyle(0x3a3a40);
    g.fillRect(16, 6, 22, 4);
    g.fillStyle(0x4a4a52);
    g.fillRect(16, 6, 22, 1);
    g.fillStyle(0x2a2a30);
    g.fillRect(16, 9, 22, 1);
    g.fillStyle(0x2a2a30);
    g.fillRect(36, 5, 4, 6);
    g.lineStyle(1, 0x555560);
    g.lineBetween(37, 5, 37, 11);
    g.lineBetween(39, 5, 39, 11);
    g.fillStyle(0x2a2a30);
    g.fillRect(10, 0, 16, 4);
    g.fillStyle(0x3a3a42);
    g.fillRect(11, 1, 14, 2);
    g.fillCircle(10, 2, 2.5);
    g.fillCircle(26, 2, 2.5);
    g.fillStyle(0x4488cc, 0.5);
    g.fillCircle(10, 2, 1.5);
    g.fillStyle(0x6699dd, 0.3);
    g.fillCircle(26, 2, 1.5);
    g.fillStyle(0x333338);
    g.fillRect(14, 3, 2, 2);
    g.fillRect(22, 3, 2, 2);
    g.fillStyle(0x444448);
    g.fillRect(20, 10, 1, 3);
    g.fillRect(24, 10, 1, 3);
    g.generateTexture('weapon-sniper', 40, 14);
    g.clear();

    // === WEAPON 4: MINIGUN (multi-barrel rotary) ===
    g.fillStyle(0x3a3a3e);
    g.fillRect(0, 3, 8, 10);
    g.fillStyle(0x4a4a50);
    g.fillRect(1, 4, 6, 8);
    g.fillStyle(0x5a3820);
    g.fillRect(2, 12, 5, 4);
    g.fillStyle(0x6b4528);
    g.fillRect(3, 12, 3, 3);
    g.fillStyle(0x3a3a3e);
    g.fillRect(7, 2, 10, 12);
    g.fillStyle(0x4a4a52);
    g.fillRect(8, 3, 8, 10);
    g.fillStyle(0x8B7355);
    g.fillRect(10, 13, 6, 3);
    g.fillStyle(0xffcc00);
    g.fillRect(11, 14, 1, 2);
    g.fillRect(13, 14, 1, 2);
    g.fillRect(15, 14, 1, 2);
    g.fillStyle(0x333338);
    g.fillRect(16, 1, 16, 14);
    g.fillStyle(0x3a3a40);
    g.fillRect(16, 2, 16, 3);
    g.fillRect(16, 6, 16, 3);
    g.fillRect(16, 10, 16, 3);
    g.fillStyle(0x4a4a52);
    g.fillRect(16, 2, 16, 1);
    g.fillRect(16, 6, 16, 1);
    g.fillRect(16, 10, 16, 1);
    g.lineStyle(1, 0x2a2a2e);
    g.lineBetween(16, 5, 32, 5);
    g.lineBetween(16, 9, 32, 9);
    g.fillStyle(0x555560);
    g.fillRect(20, 1, 2, 14);
    g.fillRect(26, 1, 2, 14);
    g.fillStyle(0x1a1a1e);
    g.fillRect(31, 2, 2, 3);
    g.fillRect(31, 6, 2, 3);
    g.fillRect(31, 10, 2, 3);
    g.fillStyle(0x2a2a30);
    g.fillRect(32, 1, 2, 14);
    g.generateTexture('weapon-minigun', 34, 16);
    g.clear();

    // === WEAPON 5: LAUNCHER (RPG-style) ===
    g.fillStyle(0x5a3820);
    g.fillRect(0, 5, 6, 7);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 6, 4, 5);
    g.fillStyle(0x3a3a3e);
    g.fillRect(5, 4, 6, 8);
    g.fillStyle(0x4a4a50);
    g.fillRect(6, 5, 4, 6);
    g.fillStyle(0x2a2a2e);
    g.fillRect(7, 11, 3, 2);
    g.fillStyle(0x3a4a3a);
    g.fillRect(10, 2, 18, 10);
    g.fillStyle(0x4a5a4a);
    g.fillRect(11, 3, 16, 8);
    g.fillStyle(0x5a6a5a, 0.4);
    g.fillRect(11, 3, 16, 2);
    g.fillStyle(0x2a3a2a, 0.4);
    g.fillRect(11, 9, 16, 2);
    g.lineStyle(1, 0x2a3a2a);
    g.lineBetween(15, 2, 15, 12);
    g.lineBetween(22, 2, 22, 12);
    g.fillStyle(0x222228);
    g.fillRect(27, 1, 4, 12);
    g.fillStyle(0x333338);
    g.fillRect(28, 2, 3, 10);
    g.fillStyle(0x555560);
    g.fillRect(12, 1, 2, 2);
    g.fillRect(25, 1, 2, 2);
    g.generateTexture('weapon-grenade', 32, 14);
    g.clear();

    // === ACCESSORY TEXTURES ===
    // Beret
    g.fillStyle(0x2d4a1e);
    g.fillCircle(8, 7, 7);
    g.fillStyle(0x3a5a28);
    g.fillCircle(8, 6, 6);
    g.fillStyle(0x1e3a14);
    g.fillRect(1, 8, 14, 2);
    g.fillStyle(0xddaa00);
    g.fillCircle(8, 5, 2);
    g.fillStyle(0xffcc22);
    g.fillCircle(8, 5, 1);
    g.generateTexture('acc-beret', 16, 10);
    g.clear();

    // Bandana
    g.fillStyle(0xee2222);
    g.fillRect(0, 1, 24, 6);
    g.fillStyle(0xcc1111);
    g.fillRect(0, 1, 24, 2);
    g.fillStyle(0xdd2222);
    g.fillRect(22, 0, 6, 4);
    g.fillRect(24, 4, 5, 4);
    g.fillStyle(0xbb1818);
    g.fillRect(26, 6, 3, 3);
    g.fillStyle(0xff6644, 0.4);
    g.fillRect(4, 2, 8, 1);
    g.generateTexture('acc-bandana', 30, 10);
    g.clear();

    // Sunglasses
    g.fillStyle(0x111111);
    g.fillCircle(6, 5, 5);
    g.fillCircle(18, 5, 5);
    g.fillStyle(0x1a1a44);
    g.fillCircle(6, 5, 4);
    g.fillCircle(18, 5, 4);
    g.fillStyle(0x4466aa, 0.3);
    g.fillCircle(5, 4, 2);
    g.fillCircle(17, 4, 2);
    g.lineStyle(2, 0x222222);
    g.lineBetween(11, 5, 13, 5);
    g.lineBetween(0, 5, 1, 5);
    g.lineBetween(23, 5, 24, 5);
    g.generateTexture('acc-sunglasses', 24, 10);
    g.clear();

    // Scar
    g.lineStyle(3, 0xff3333, 0.9);
    g.lineBetween(2, 2, 18, 18);
    g.lineStyle(2, 0xff5555, 0.6);
    g.lineBetween(4, 0, 20, 16);
    g.lineStyle(1, 0xcc2222, 0.7);
    g.lineBetween(0, 6, 14, 20);
    g.fillStyle(0xaa0000, 0.5);
    g.fillCircle(16, 16, 2);
    g.fillCircle(6, 4, 1.5);
    g.generateTexture('acc-scar', 20, 20);
    g.clear();

    // Crown
    g.fillStyle(0xffcc00);
    g.fillRect(2, 10, 20, 10);
    g.fillStyle(0xffdd33);
    g.fillRect(3, 11, 18, 8);
    g.fillStyle(0xffcc00);
    g.fillRect(2, 4, 4, 8);
    g.fillRect(10, 0, 4, 12);
    g.fillRect(18, 4, 4, 8);
    g.fillStyle(0xffdd33);
    g.fillRect(3, 5, 2, 6);
    g.fillRect(11, 1, 2, 10);
    g.fillRect(19, 5, 2, 6);
    g.fillStyle(0xff1111);
    g.fillCircle(6, 14, 2.5);
    g.fillStyle(0x1144ff);
    g.fillCircle(12, 14, 2.5);
    g.fillStyle(0x11ff44);
    g.fillCircle(18, 14, 2.5);
    g.lineStyle(1, 0xcc9900);
    g.strokeRect(2, 10, 20, 10);
    g.generateTexture('acc-crown', 24, 20);
    g.clear();

    // Backpack accessory
    g.fillStyle(0x4a5a2a);
    g.fillRect(2, 2, 12, 8);
    g.fillStyle(0x5a6a35);
    g.fillRect(3, 3, 10, 6);
    g.fillStyle(0x3a4a20);
    g.fillRect(2, 1, 12, 3);
    g.fillStyle(0x4a5a2a);
    g.fillRect(4, 0, 2, 2);
    g.fillRect(10, 0, 2, 2);
    g.fillStyle(0x888866);
    g.fillRect(6, 4, 4, 2);
    g.fillStyle(0x3a4a20);
    g.fillRect(0, 3, 3, 5);
    g.fillRect(13, 3, 3, 5);
    g.fillStyle(0x2a3a18);
    g.fillRect(2, 9, 12, 2);
    g.generateTexture('acc-backpack', 16, 12);
    g.clear();

    // Coin icon
    g.fillStyle(0xddaa00);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xffcc22);
    g.fillCircle(6, 6, 5);
    g.fillStyle(0xddaa00);
    g.fillCircle(6, 6, 3);
    g.fillStyle(0xffdd44, 0.5);
    g.fillCircle(5, 5, 2);
    g.generateTexture('coin-icon', 12, 12);
    g.clear();

    // === PROJECTILE TEXTURES ===

    // Rifle bullet
    g.fillStyle(0xffaa00, 0.3);
    g.fillEllipse(10, 4, 18, 6);
    g.fillStyle(0xffcc44, 0.8);
    g.fillEllipse(12, 4, 12, 4);
    g.fillStyle(0xffffff);
    g.fillEllipse(14, 4, 6, 2);
    g.generateTexture('bullet-rifle', 20, 8);
    g.generateTexture('bullet', 20, 8);
    g.clear();

    // Shotgun pellet
    g.fillStyle(0xff4400, 0.4);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0xff6633, 0.8);
    g.fillCircle(4, 4, 3);
    g.fillStyle(0xffcc88);
    g.fillCircle(3, 3, 1.5);
    g.generateTexture('bullet-shotgun', 8, 8);
    g.clear();

    // SMG bullet
    g.fillStyle(0x44ff44, 0.3);
    g.fillEllipse(7, 3, 14, 5);
    g.fillStyle(0x88ff88, 0.7);
    g.fillEllipse(8, 3, 10, 3);
    g.fillStyle(0xccffcc);
    g.fillEllipse(9, 3, 4, 2);
    g.generateTexture('bullet-smg', 14, 6);
    g.clear();

    // Sniper bullet
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

    // Rocket
    g.fillStyle(0x444444);
    g.fillRect(2, 2, 10, 6);
    g.fillStyle(0x555555);
    g.fillRect(3, 3, 8, 4);
    g.fillStyle(0xcc2222);
    g.fillRect(11, 2, 4, 6);
    g.fillStyle(0xff4444);
    g.fillRect(12, 3, 3, 4);
    g.fillStyle(0x333333);
    g.fillRect(0, 1, 3, 2);
    g.fillRect(0, 7, 3, 2);
    g.fillStyle(0xff8800, 0.6);
    g.fillCircle(1, 5, 2);
    g.fillStyle(0xffcc00, 0.4);
    g.fillCircle(0, 5, 1.5);
    g.generateTexture('bullet-rocket', 16, 10);
    g.clear();

    // === ZOMBIE WALKER — improved with outline, shadow, torn details ===
    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(16, 19, 13);
    // Outline
    g.fillStyle(0x1a1a0a);
    g.fillCircle(16, 16, 15);
    // Body base
    g.fillStyle(0x3d5020);
    g.fillCircle(16, 16, 13);
    // Body lighter
    g.fillStyle(0x4a6025);
    g.fillCircle(16, 16, 11);
    // Torn clothing remnants
    g.fillStyle(0x555544, 0.6);
    g.fillRect(8, 18, 6, 5);
    g.fillRect(20, 16, 5, 6);
    g.fillStyle(0x444433, 0.5);
    g.fillRect(9, 19, 4, 3);
    // Rot patches (more varied)
    g.fillStyle(0x2d3d15);
    g.fillCircle(10, 20, 5);
    g.fillCircle(22, 14, 4);
    g.fillCircle(18, 22, 3);
    // Exposed bone/wound
    g.fillStyle(0x8b6a5a, 0.5);
    g.fillCircle(20, 20, 3);
    g.fillStyle(0x660000, 0.6);
    g.fillCircle(20, 20, 2);
    // Blood spots
    g.fillStyle(0x8b0000);
    g.fillCircle(20, 22, 3);
    g.fillCircle(8, 12, 2);
    g.fillCircle(24, 8, 2);
    // Dripping blood
    g.fillStyle(0x660000, 0.7);
    g.fillRect(19, 22, 2, 4);
    g.fillRect(7, 12, 1, 3);
    // Eyes (glowing, sinister)
    g.fillStyle(0xff2200, 0.3);
    g.fillCircle(11, 10, 5);
    g.fillCircle(21, 10, 5);
    g.fillStyle(0xff0000);
    g.fillCircle(11, 10, 3);
    g.fillCircle(21, 10, 3);
    g.fillStyle(0xff6600);
    g.fillCircle(11, 9, 1.5);
    g.fillCircle(21, 9, 1.5);
    g.fillStyle(0xffcc00);
    g.fillCircle(11, 10, 0.8);
    g.fillCircle(21, 10, 0.8);
    g.generateTexture('zombie-walker', 32, 32);
    g.clear();

    // Walker arms (reaching forward, with torn details)
    g.fillStyle(0x4a6025);
    g.fillRect(0, 4, 8, 4);
    g.fillRect(0, 16, 8, 4);
    // Darker outline
    g.fillStyle(0x2d3d15);
    g.fillRect(0, 3, 8, 1);
    g.fillRect(0, 8, 8, 1);
    g.fillRect(0, 15, 8, 1);
    g.fillRect(0, 20, 8, 1);
    // Hands with claws
    g.fillStyle(0x3d5020);
    g.fillRect(6, 3, 4, 6);
    g.fillRect(6, 15, 4, 6);
    // Claw tips
    g.fillStyle(0x2d2d1a);
    g.fillRect(9, 2, 1, 2);
    g.fillRect(9, 7, 1, 2);
    g.fillRect(9, 14, 1, 2);
    g.fillRect(9, 19, 1, 2);
    g.generateTexture('zombie-walker-arms', 10, 24);
    g.clear();

    // === ZOMBIE RUNNER — sleek, aggressive, outlined ===
    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(16, 18, 11);
    // Outline
    g.fillStyle(0x1a1a0a);
    g.fillCircle(16, 16, 13);
    // Body
    g.fillStyle(0x5a6b30);
    g.fillCircle(16, 16, 11);
    g.fillStyle(0x6a7b38);
    g.fillCircle(16, 16, 9);
    // Speed streaks on body
    g.lineStyle(1, 0x8a9b48, 0.4);
    g.lineBetween(6, 14, 10, 20);
    g.lineBetween(22, 14, 26, 20);
    g.lineBetween(14, 20, 18, 26);
    // Scratches (deeper)
    g.lineStyle(1.5, 0x3a4b18);
    g.lineBetween(6, 8, 14, 16);
    g.lineBetween(18, 6, 26, 14);
    g.lineBetween(8, 20, 16, 28);
    // Blood smears
    g.fillStyle(0xaa2222);
    g.fillCircle(22, 20, 2.5);
    g.fillCircle(10, 24, 2);
    g.fillStyle(0x881111, 0.6);
    g.fillRect(21, 20, 2, 4);
    // Wild eyes (brighter, more menacing)
    g.fillStyle(0xff4444, 0.3);
    g.fillCircle(11, 10, 5);
    g.fillCircle(21, 10, 5);
    g.fillStyle(0xff4444);
    g.fillCircle(11, 10, 3);
    g.fillCircle(21, 10, 3);
    g.fillStyle(0xffff00);
    g.fillCircle(11, 10, 1.5);
    g.fillCircle(21, 10, 1.5);
    g.fillStyle(0xffffff);
    g.fillCircle(11, 10, 0.5);
    g.fillCircle(21, 10, 0.5);
    g.generateTexture('zombie-runner', 32, 32);
    g.clear();

    // Runner arms (clawing forward, thinner)
    g.fillStyle(0x6a7b38);
    g.fillRect(0, 3, 10, 3);
    g.fillRect(0, 16, 10, 3);
    // Outline
    g.fillStyle(0x3a4b18);
    g.fillRect(0, 2, 10, 1);
    g.fillRect(0, 6, 10, 1);
    g.fillRect(0, 15, 10, 1);
    g.fillRect(0, 19, 10, 1);
    // Claws (sharper)
    g.fillStyle(0x4a5b28);
    g.fillRect(8, 1, 3, 2);
    g.fillRect(8, 5, 3, 2);
    g.fillRect(8, 14, 3, 2);
    g.fillRect(8, 18, 3, 2);
    // Blood on claws
    g.fillStyle(0x990000, 0.5);
    g.fillRect(9, 1, 2, 1);
    g.fillRect(9, 14, 2, 1);
    g.generateTexture('zombie-runner-arms', 12, 22);
    g.clear();

    // === ZOMBIE TANK — massive, armored, outlined ===
    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillCircle(20, 23, 18);
    // Outline
    g.fillStyle(0x0a0a05);
    g.fillCircle(20, 20, 20);
    // Body
    g.fillStyle(0x2e3d16);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0x3a4a1f);
    g.fillCircle(20, 20, 16);
    // Armor plating (layered)
    g.fillStyle(0x4a5a2f);
    g.fillCircle(20, 20, 12);
    g.lineStyle(2, 0x2a3510);
    g.strokeCircle(20, 20, 12);
    // Second armor ring
    g.lineStyle(1, 0x3a4520, 0.6);
    g.strokeCircle(20, 20, 15);
    // Rivets on armor
    g.fillStyle(0x5a6a3f);
    g.fillCircle(12, 14, 1.5);
    g.fillCircle(28, 14, 1.5);
    g.fillCircle(12, 26, 1.5);
    g.fillCircle(28, 26, 1.5);
    // Scars (deeper)
    g.lineStyle(2, 0x1a2508);
    g.lineBetween(8, 10, 18, 16);
    g.lineBetween(22, 26, 32, 34);
    g.lineBetween(10, 28, 18, 34);
    // Exposed muscle/wound
    g.fillStyle(0x662222, 0.5);
    g.fillCircle(26, 24, 4);
    g.fillStyle(0x551111, 0.4);
    g.fillCircle(26, 24, 2);
    // Blood
    g.fillStyle(0x660000);
    g.fillCircle(12, 28, 3);
    g.fillCircle(28, 14, 3);
    g.fillCircle(14, 14, 2);
    // Blood drip
    g.fillStyle(0x550000, 0.6);
    g.fillRect(11, 28, 2, 4);
    // Angry eyes (bigger, brighter)
    g.fillStyle(0xff0000, 0.3);
    g.fillCircle(14, 12, 6);
    g.fillCircle(26, 12, 6);
    g.fillStyle(0xff0000);
    g.fillRect(12, 10, 6, 5);
    g.fillRect(22, 10, 6, 5);
    g.fillStyle(0xff4400);
    g.fillRect(14, 11, 3, 3);
    g.fillRect(24, 11, 3, 3);
    g.fillStyle(0xffcc00);
    g.fillCircle(15, 12, 1);
    g.fillCircle(25, 12, 1);
    g.generateTexture('zombie-tank', 40, 40);
    g.clear();

    // Tank arms (thick, heavy)
    g.fillStyle(0x3a4a1f);
    g.fillRect(0, 3, 10, 6);
    g.fillRect(0, 19, 10, 6);
    // Outline
    g.fillStyle(0x1a2508);
    g.fillRect(0, 2, 10, 1);
    g.fillRect(0, 9, 10, 1);
    g.fillRect(0, 18, 10, 1);
    g.fillRect(0, 25, 10, 1);
    // Fists
    g.fillStyle(0x2e3d16);
    g.fillRect(8, 2, 4, 8);
    g.fillRect(8, 18, 4, 8);
    // Armor on arms
    g.fillStyle(0x4a5a2f, 0.6);
    g.fillRect(2, 4, 6, 4);
    g.fillRect(2, 20, 6, 4);
    // Spikes on fists
    g.fillStyle(0x555544);
    g.fillRect(11, 1, 2, 2);
    g.fillRect(11, 9, 2, 2);
    g.fillRect(11, 17, 2, 2);
    g.fillRect(11, 25, 2, 2);
    g.generateTexture('zombie-tank-arms', 14, 28);
    g.clear();

    // === ZOMBIE RADIOACTIVE — glowing green, toxic, outlined ===
    // Glow aura (larger)
    g.fillStyle(0x33ff33, 0.1);
    g.fillCircle(18, 18, 18);
    g.fillStyle(0x22cc22, 0.15);
    g.fillCircle(18, 18, 16);
    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillCircle(18, 20, 12);
    // Outline
    g.fillStyle(0x0a1a0a);
    g.fillCircle(18, 18, 13);
    // Body
    g.fillStyle(0x2a6a1a);
    g.fillCircle(18, 18, 12);
    g.fillStyle(0x33882a);
    g.fillCircle(18, 18, 10);
    // Toxic bubbles
    g.fillStyle(0x44ff44, 0.6);
    g.fillCircle(12, 22, 3);
    g.fillCircle(24, 14, 2.5);
    g.fillCircle(20, 24, 2);
    g.fillCircle(14, 14, 1.5);
    // Pulsing glow center
    g.fillStyle(0xccff00, 0.4);
    g.fillCircle(18, 18, 5);
    g.fillStyle(0xeeff44, 0.2);
    g.fillCircle(18, 16, 3);
    // Radiation symbol hint
    g.fillStyle(0xffff00, 0.3);
    g.fillCircle(18, 18, 3);
    g.fillStyle(0x33882a);
    g.fillCircle(18, 18, 1.5);
    // Eyes (glowing bright green)
    g.fillStyle(0x88ff88);
    g.fillCircle(14, 14, 3);
    g.fillCircle(22, 14, 3);
    g.fillStyle(0x44ff44);
    g.fillCircle(14, 14, 1.5);
    g.fillCircle(22, 14, 1.5);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(14, 14, 0.5);
    g.fillCircle(22, 14, 0.5);
    g.generateTexture('zombie-radioactive', 36, 36);
    g.clear();

    // Radioactive arms
    g.fillStyle(0x33882a);
    g.fillRect(0, 4, 8, 4);
    g.fillRect(0, 16, 8, 4);
    g.fillStyle(0x1a4a10);
    g.fillRect(0, 3, 8, 1);
    g.fillRect(0, 8, 8, 1);
    g.fillRect(0, 15, 8, 1);
    g.fillRect(0, 20, 8, 1);
    g.fillStyle(0x44ff44, 0.4);
    g.fillCircle(7, 6, 2);
    g.fillCircle(7, 18, 2);
    g.generateTexture('zombie-radioactive-arms', 10, 24);
    g.clear();

    // Toxic puddle (improved)
    g.fillStyle(0x33ff33, 0.25);
    g.fillCircle(20, 20, 20);
    g.fillStyle(0x22cc22, 0.2);
    g.fillCircle(20, 20, 15);
    g.fillStyle(0x44ff44, 0.15);
    g.fillCircle(15, 15, 8);
    g.fillCircle(25, 22, 6);
    // Bubbles
    g.fillStyle(0x66ff66, 0.3);
    g.fillCircle(14, 18, 2);
    g.fillCircle(24, 16, 1.5);
    g.fillCircle(18, 24, 1);
    g.generateTexture('toxic-puddle', 40, 40);
    g.clear();

    // === ZOMBIE KAMIKAZE — red, explosive, outlined ===
    // Danger glow
    g.fillStyle(0xff0000, 0.08);
    g.fillCircle(14, 14, 14);
    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(14, 16, 11);
    // Outline
    g.fillStyle(0x1a0a0a);
    g.fillCircle(14, 14, 13);
    // Body
    g.fillStyle(0x882222);
    g.fillCircle(14, 14, 12);
    g.fillStyle(0xaa3333);
    g.fillCircle(14, 14, 10);
    // Explosive vest
    g.fillStyle(0x554444);
    g.fillRect(8, 10, 12, 8);
    g.fillStyle(0x665555);
    g.fillRect(9, 11, 10, 6);
    // Dynamite sticks
    g.fillStyle(0xcc4444);
    g.fillRect(9, 12, 2, 5);
    g.fillRect(13, 11, 2, 6);
    g.fillRect(17, 12, 2, 5);
    // Wires
    g.lineStyle(1, 0xffcc00, 0.6);
    g.lineBetween(10, 12, 14, 11);
    g.lineBetween(14, 11, 18, 12);
    // Blinking light
    g.fillStyle(0xff0000);
    g.fillCircle(14, 13, 2);
    g.fillStyle(0xffff00);
    g.fillCircle(14, 13, 1);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(14, 12.5, 0.5);
    // Eyes (crazed)
    g.fillStyle(0xff6600);
    g.fillCircle(10, 10, 2.5);
    g.fillCircle(18, 10, 2.5);
    g.fillStyle(0xff0000);
    g.fillCircle(10, 10, 1.5);
    g.fillCircle(18, 10, 1.5);
    g.fillStyle(0xffff00);
    g.fillCircle(10, 10, 0.5);
    g.fillCircle(18, 10, 0.5);
    g.generateTexture('zombie-kamikaze', 28, 28);
    g.clear();

    // Kamikaze arms
    g.fillStyle(0xaa3333);
    g.fillRect(0, 3, 8, 3);
    g.fillRect(0, 14, 8, 3);
    g.fillStyle(0x661111);
    g.fillRect(0, 2, 8, 1);
    g.fillRect(0, 6, 8, 1);
    g.fillRect(0, 13, 8, 1);
    g.fillRect(0, 17, 8, 1);
    g.generateTexture('zombie-kamikaze-arms', 10, 20);
    g.clear();

    // === ZOMBIE BOSS (Titan) — large, dark purple, aura, outlined ===
    // Menacing aura
    g.fillStyle(0x8800aa, 0.08);
    g.fillCircle(20, 20, 20);
    g.fillStyle(0x6600aa, 0.06);
    g.fillCircle(20, 20, 18);
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(20, 23, 18);
    // Outline
    g.fillStyle(0x0a0008);
    g.fillCircle(20, 20, 20);
    // Body
    g.fillStyle(0x2a0a2a);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0x441444);
    g.fillCircle(20, 20, 16);
    // Armor cracks with glow
    g.fillStyle(0x551855);
    g.fillCircle(20, 20, 12);
    g.lineStyle(2, 0x220822);
    g.strokeCircle(20, 20, 12);
    // Pulsing veins
    g.lineStyle(1, 0x8800aa, 0.4);
    g.lineBetween(8, 14, 14, 20);
    g.lineBetween(26, 14, 32, 20);
    g.lineBetween(16, 28, 24, 34);
    // Scars
    g.lineStyle(2, 0x110411);
    g.lineBetween(8, 10, 18, 16);
    g.lineBetween(22, 26, 32, 34);
    // Blood
    g.fillStyle(0x880000);
    g.fillCircle(12, 28, 4);
    g.fillCircle(28, 14, 3);
    // Glowing red eyes (larger, more menacing)
    g.fillStyle(0xff0000, 0.4);
    g.fillCircle(15, 12, 6);
    g.fillCircle(25, 12, 6);
    g.fillStyle(0xff0000);
    g.fillRect(12, 10, 6, 5);
    g.fillRect(22, 10, 6, 5);
    g.fillStyle(0xff4444);
    g.fillRect(14, 11, 3, 3);
    g.fillRect(24, 11, 3, 3);
    g.fillStyle(0xffcc00);
    g.fillCircle(15, 12, 1);
    g.fillCircle(25, 12, 1);
    // Crown-like spikes (more prominent)
    g.fillStyle(0x8800aa);
    g.fillTriangle(10, 4, 13, -1, 16, 4);
    g.fillTriangle(17, 3, 20, -2, 23, 3);
    g.fillTriangle(24, 4, 27, -1, 30, 4);
    // Spike glow
    g.fillStyle(0xaa44cc, 0.4);
    g.fillTriangle(11, 4, 13, 0, 15, 4);
    g.fillTriangle(18, 3, 20, -1, 22, 3);
    g.fillTriangle(25, 4, 27, 0, 29, 4);
    g.generateTexture('zombie-boss', 40, 40);
    g.clear();

    // Boss arms (thick, dark, with purple glow)
    g.fillStyle(0x441444);
    g.fillRect(0, 3, 12, 7);
    g.fillRect(0, 20, 12, 7);
    // Outline
    g.fillStyle(0x1a0a1a);
    g.fillRect(0, 2, 12, 1);
    g.fillRect(0, 10, 12, 1);
    g.fillRect(0, 19, 12, 1);
    g.fillRect(0, 27, 12, 1);
    // Fists
    g.fillStyle(0x2a0a2a);
    g.fillRect(10, 2, 5, 9);
    g.fillRect(10, 19, 5, 9);
    // Purple glow on fists (stronger)
    g.fillStyle(0x8800aa, 0.5);
    g.fillCircle(12, 6, 4);
    g.fillCircle(12, 23, 4);
    g.fillStyle(0xaa44cc, 0.3);
    g.fillCircle(12, 6, 2);
    g.fillCircle(12, 23, 2);
    g.generateTexture('zombie-boss-arms', 16, 30);
    g.clear();

    // === BULLET (legacy, keep same) ===
    g.fillStyle(0xffff00, 0.3);
    g.fillEllipse(10, 4, 18, 6);
    g.fillStyle(0xffdd44, 0.8);
    g.fillEllipse(12, 4, 12, 4);
    g.fillStyle(0xffffff);
    g.fillEllipse(14, 4, 6, 2);
    g.generateTexture('bullet', 20, 8);
    g.clear();

    // Bullet trail particle
    g.fillStyle(0xffaa00, 0.6);
    g.fillCircle(3, 3, 3);
    g.generateTexture('bullet-trail', 6, 6);
    g.clear();

    // === PICKUPS (with outlines for visibility) ===

    // Health pickup (red cross, outlined)
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x222222);
    g.fillRect(-1, 7, 26, 10);
    g.fillRect(7, -1, 10, 26);
    g.fillStyle(0xff3333);
    g.fillRect(0, 8, 24, 8);
    g.fillRect(8, 0, 8, 24);
    g.fillStyle(0xff6666, 0.4);
    g.fillRect(1, 9, 22, 3);
    g.fillRect(9, 1, 6, 22);
    g.generateTexture('health-pack', 24, 24);
    g.clear();

    // Ammo pickup (box with bullets, outlined)
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x1a1a1a);
    g.fillRect(1, 3, 22, 18);
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

    // Bandage pickup
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0xfafafa);
    g.fillRoundedRect(4, 6, 16, 12, 2);
    g.fillStyle(0xe0e0e0);
    g.fillRect(4, 14, 16, 4);
    g.fillStyle(0xcccccc);
    g.fillRect(8, 6, 1, 12);
    g.fillRect(12, 6, 1, 12);
    g.fillRect(16, 6, 1, 12);
    g.fillStyle(0x44cc44);
    g.fillRect(11, 9, 2, 6);
    g.fillRect(9, 11, 6, 2);
    g.generateTexture('bandage-pickup', 24, 24);
    g.clear();

    // Medkit pickup
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0xffffff);
    g.fillRoundedRect(2, 4, 20, 16, 2);
    g.lineStyle(1, 0xcc0000);
    g.strokeRoundedRect(2, 4, 20, 16, 2);
    g.fillStyle(0xff2222);
    g.fillRect(6, 9, 12, 6);
    g.fillRect(9, 6, 6, 12);
    g.generateTexture('medkit-pickup', 24, 24);
    g.clear();

    // === CRAFTING MATERIALS ===

    // Wood
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x8B5E3C);
    g.fillRoundedRect(3, 6, 18, 12, 3);
    g.fillStyle(0xA0714F);
    g.fillRoundedRect(4, 7, 16, 10, 2);
    g.lineStyle(1, 0x6B4226, 0.5);
    g.lineBetween(6, 8, 6, 16);
    g.lineBetween(10, 8, 10, 16);
    g.lineBetween(14, 8, 14, 16);
    g.lineBetween(18, 8, 18, 16);
    g.lineStyle(1, 0x5a3820, 0.7);
    g.strokeCircle(8, 12, 3);
    g.generateTexture('material-wood', 24, 24);
    g.clear();

    // Metal
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x7a7a7a);
    g.fillRect(4, 5, 16, 14);
    g.fillStyle(0x8a8a8a);
    g.fillRect(5, 6, 14, 12);
    g.fillStyle(0x555555);
    g.fillCircle(7, 8, 2);
    g.fillCircle(17, 8, 2);
    g.fillCircle(7, 16, 2);
    g.fillCircle(17, 16, 2);
    g.fillStyle(0xaaaaaa);
    g.fillRect(8, 7, 8, 2);
    g.lineStyle(1, 0xbbbbbb, 0.4);
    g.lineBetween(6, 10, 18, 10);
    g.generateTexture('material-metal', 24, 24);
    g.clear();

    // Screws
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x999999);
    g.fillRect(10, 3, 4, 4);
    g.fillStyle(0xaaaaaa);
    g.fillRect(11, 3, 2, 3);
    g.fillStyle(0x777777);
    g.fillRect(11, 7, 2, 12);
    g.lineStyle(1, 0x555555, 0.6);
    g.lineBetween(11, 9, 13, 9);
    g.lineBetween(11, 11, 13, 11);
    g.lineBetween(11, 13, 13, 13);
    g.lineBetween(11, 15, 13, 15);
    g.lineBetween(11, 17, 13, 17);
    g.fillStyle(0x666666);
    g.fillTriangle(11, 19, 13, 19, 12, 22);
    g.generateTexture('material-screws', 24, 24);
    g.clear();

    // === GROUND TILES — richer natural variants ===
    this.generateGrassTile(g, 'ground1', 0x3a7a3a, 0);
    this.generateGrassTile(g, 'ground2', 0x3d8040, 1);
    this.generateGrassTile(g, 'ground3', 0x357535, 2);
    this.generateGrassTile(g, 'ground4', 0x3b7d38, 3);
    this.generateGrassTile(g, 'ground5', 0x3e7e42, 4);

    // Stone wall texture — weathered apocalyptic bricks
    g.fillStyle(0x3a3832);
    g.fillRect(0, 0, 64, 64);

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
        const shade = ((bx * 7 + row.y * 13) % 20) - 10;
        const r = Math.min(255, Math.max(0, 0x5e + shade));
        const gc = Math.min(255, Math.max(0, 0x56 + shade));
        const b = Math.min(255, Math.max(0, 0x4a + shade));
        g.fillStyle((r << 16) | (gc << 8) | b);
        g.fillRect(x, row.y, w, row.h);
        g.fillStyle(0x7a7268, 0.5);
        g.fillRect(x, row.y, w, 2);
        g.fillStyle(0x2a2822, 0.5);
        g.fillRect(x, row.y + row.h - 2, w, 2);
        g.fillStyle(0x6e6860, 0.3);
        g.fillRect(x, row.y, 1, row.h);
        g.fillStyle(0x2e2c26, 0.3);
        g.fillRect(x + w - 1, row.y, 1, row.h);
      }
    });

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

    g.lineStyle(1, 0x222020);
    g.lineBetween(12, 4, 18, 10);
    g.lineBetween(18, 10, 22, 9);
    g.lineBetween(18, 10, 16, 15);
    g.lineBetween(42, 38, 50, 44);
    g.lineBetween(50, 44, 52, 42);
    g.lineBetween(50, 44, 48, 49);

    g.fillStyle(0x3a5a2a, 0.6);
    g.fillCircle(3, 3, 4);
    g.fillCircle(60, 61, 5);
    g.fillStyle(0x4a6a35, 0.4);
    g.fillCircle(32, 33, 3);
    g.fillCircle(14, 50, 3);
    g.fillStyle(0x2d4a1e, 0.5);
    g.fillCircle(48, 16, 3);

    g.fillStyle(0x5a1a1a, 0.3);
    g.fillCircle(40, 8, 4);
    g.fillCircle(42, 10, 3);
    g.fillStyle(0x6a3a1a, 0.25);
    g.fillCircle(10, 42, 5);
    g.fillCircle(55, 26, 3);

    g.fillStyle(0x2a2826, 0.2);
    g.fillCircle(22, 24, 4);
    g.fillCircle(50, 6, 3);

    g.lineStyle(1, 0x2a2826);
    g.strokeRect(0, 0, 64, 64);
    g.generateTexture('wall', 64, 64);
    g.clear();

    // === DECORATION TEXTURES ===

    // Dead tree (top-down, dark silhouette)
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(16, 18, 14);
    g.fillStyle(0x3a2a18);
    g.fillCircle(16, 16, 6); // trunk center
    g.fillStyle(0x4a3a22);
    g.fillCircle(16, 16, 4);
    // Branches
    g.lineStyle(3, 0x3a2a18);
    g.lineBetween(16, 16, 4, 6);
    g.lineBetween(16, 16, 28, 4);
    g.lineBetween(16, 16, 6, 26);
    g.lineBetween(16, 16, 28, 24);
    g.lineStyle(2, 0x4a3a22);
    g.lineBetween(4, 6, 0, 2);
    g.lineBetween(4, 6, 2, 10);
    g.lineBetween(28, 4, 30, 0);
    g.lineBetween(28, 4, 32, 8);
    g.lineBetween(6, 26, 2, 30);
    g.lineBetween(28, 24, 32, 28);
    g.generateTexture('deco-dead-tree', 32, 32);
    g.clear();

    // Bush (top-down, green blob)
    g.fillStyle(0x000000, 0.15);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x2a5a1a);
    g.fillCircle(12, 10, 10);
    g.fillStyle(0x337722);
    g.fillCircle(12, 10, 8);
    g.fillStyle(0x448833, 0.6);
    g.fillCircle(8, 7, 5);
    g.fillStyle(0x336622);
    g.fillCircle(16, 12, 5);
    g.fillCircle(6, 13, 4);
    g.generateTexture('deco-bush', 24, 24);
    g.clear();

    // Barrel (top-down)
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x333333);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0x4a4a4a);
    g.fillCircle(12, 12, 8);
    g.lineStyle(2, 0x333333);
    g.strokeCircle(12, 12, 9);
    // Rust
    g.fillStyle(0x6a4a2a, 0.4);
    g.fillCircle(8, 10, 4);
    g.fillCircle(16, 14, 3);
    // Cap
    g.fillStyle(0x555555);
    g.fillCircle(12, 12, 3);
    g.fillStyle(0x3a3a3a);
    g.fillCircle(12, 12, 1.5);
    g.generateTexture('deco-barrel', 24, 24);
    g.clear();

    // Rock (top-down)
    g.fillStyle(0x000000, 0.15);
    g.fillCircle(14, 16, 12);
    g.fillStyle(0x5a5a52);
    g.fillCircle(14, 14, 12);
    g.fillStyle(0x6a6a60);
    g.fillCircle(14, 13, 10);
    g.fillStyle(0x7a7a6e, 0.5);
    g.fillCircle(10, 10, 5);
    g.lineStyle(1, 0x4a4a42, 0.5);
    g.lineBetween(8, 14, 18, 16);
    g.lineBetween(12, 8, 16, 18);
    g.generateTexture('deco-rock', 28, 28);
    g.clear();

    // Crate (top-down)
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x6b4528);
    g.fillRect(2, 2, 20, 20);
    g.fillStyle(0x7a5232);
    g.fillRect(3, 3, 18, 18);
    // Cross planks
    g.fillStyle(0x5a3820);
    g.fillRect(2, 10, 20, 3);
    g.fillRect(10, 2, 3, 20);
    // Nails
    g.fillStyle(0x888888);
    g.fillCircle(4, 4, 1);
    g.fillCircle(20, 4, 1);
    g.fillCircle(4, 20, 1);
    g.fillCircle(20, 20, 1);
    g.generateTexture('deco-crate', 24, 24);
    g.clear();

    // Blood splatter (ground decoration)
    g.fillStyle(0x550000, 0.4);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0x660000, 0.3);
    g.fillCircle(8, 8, 6);
    g.fillCircle(16, 14, 5);
    g.fillStyle(0x770000, 0.2);
    g.fillCircle(14, 6, 4);
    g.fillCircle(6, 16, 3);
    // Splatter drops
    g.fillStyle(0x550000, 0.3);
    g.fillCircle(2, 4, 2);
    g.fillCircle(20, 8, 2);
    g.fillCircle(4, 20, 1.5);
    g.fillCircle(22, 18, 1.5);
    g.generateTexture('blood-splat', 24, 24);
    g.clear();

    // === SHADOW TEXTURE (generic circle for under entities) ===
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(16, 16, 10);
    g.generateTexture('shadow', 32, 32);
    g.clear();

    // === PARTICLE TEXTURES ===

    // Blood particle
    g.fillStyle(0xaa0000);
    g.fillCircle(3, 3, 3);
    g.fillStyle(0x880000, 0.6);
    g.fillCircle(3, 3, 2);
    g.generateTexture('particle-blood', 6, 6);
    g.clear();

    // Dust particle
    g.fillStyle(0x8a7a5a, 0.4);
    g.fillCircle(3, 3, 3);
    g.generateTexture('particle-dust', 6, 6);
    g.clear();

    // Spark particle
    g.fillStyle(0xffcc00, 0.8);
    g.fillCircle(2, 2, 2);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(2, 2, 1);
    g.generateTexture('particle-spark', 4, 4);
    g.clear();

    // Smoke particle
    g.fillStyle(0x444444, 0.3);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0x555555, 0.2);
    g.fillCircle(8, 8, 5);
    g.generateTexture('particle-smoke', 16, 16);
    g.clear();

    // Crosshair (improved)
    g.lineStyle(2, 0xff0000, 0.8);
    g.strokeCircle(12, 12, 10);
    g.lineStyle(1, 0xff0000, 0.4);
    g.strokeCircle(12, 12, 6);
    g.lineStyle(2, 0xff0000);
    g.lineBetween(12, 0, 12, 4);
    g.lineBetween(12, 20, 12, 24);
    g.lineBetween(0, 12, 4, 12);
    g.lineBetween(20, 12, 24, 12);
    // Center dot
    g.fillStyle(0xff0000);
    g.fillCircle(12, 12, 1.5);
    g.generateTexture('crosshair', 24, 24);

    // Menu zombie silhouette
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

    // Fog particle
    g.fillStyle(0x335533, 0.15);
    g.fillCircle(32, 32, 32);
    g.fillStyle(0x224422, 0.1);
    g.fillCircle(32, 32, 24);
    g.generateTexture('fog-particle', 64, 64);
    g.clear();

    // === ABILITY: BIG BOMB ===
    g.fillStyle(0x222222);
    g.fillCircle(16, 18, 14);
    g.fillStyle(0x333333);
    g.fillCircle(16, 16, 13);
    g.fillStyle(0x555555);
    g.fillCircle(12, 12, 5);
    g.fillStyle(0x666666);
    g.fillCircle(10, 10, 2);
    g.lineStyle(2, 0x8b4513);
    g.lineBetween(16, 4, 20, 0);
    g.fillStyle(0xff6600);
    g.fillCircle(20, 0, 3);
    g.fillStyle(0xffaa00);
    g.fillCircle(20, 0, 2);
    g.generateTexture('ability-bomb', 32, 32);
    g.clear();

    // === ABILITY: MINI NUKE ===
    g.fillStyle(0x556655);
    g.fillRect(4, 10, 20, 8);
    g.fillStyle(0x667766);
    g.fillRect(5, 11, 18, 6);
    g.fillStyle(0xcc2222);
    g.fillTriangle(24, 10, 24, 18, 30, 14);
    g.fillStyle(0x445544);
    g.fillTriangle(4, 10, 0, 6, 8, 10);
    g.fillTriangle(4, 18, 0, 22, 8, 18);
    g.fillStyle(0xffcc00);
    g.fillRect(14, 10, 3, 8);
    g.fillStyle(0xffcc00);
    g.fillCircle(16, 14, 2);
    g.generateTexture('ability-nuke', 32, 28);
    g.clear();

    // === ABILITY: CRYO CAPSULE ===
    g.fillStyle(0x44ccff);
    g.fillCircle(16, 16, 12);
    g.fillStyle(0x88ddff);
    g.fillCircle(16, 16, 9);
    g.lineStyle(2, 0xffffff, 0.8);
    g.lineBetween(16, 4, 16, 28);
    g.lineBetween(4, 16, 28, 16);
    g.lineBetween(8, 8, 24, 24);
    g.lineBetween(24, 8, 8, 24);
    g.fillStyle(0xffffff);
    g.fillCircle(16, 16, 3);
    g.generateTexture('ability-cryo', 32, 32);
    g.clear();

    // Nuke radiation patch
    g.fillStyle(0x33ff33, 0.4);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x44ff44, 0.2);
    g.fillCircle(16, 16, 10);
    g.generateTexture('nuke-radiation', 32, 32);
    g.clear();

    // === DAMAGE NUMBER FONT (floating text texture not needed, we use Phaser text) ===

    g.destroy();

    this.scene.start('MenuScene');
  }

  private generateGrassTile(g: Phaser.GameObjects.Graphics, key: string, baseColor: number, variant: number) {
    // Base fill
    g.fillStyle(baseColor);
    g.fillRect(0, 0, 64, 64);

    // Organic color variation
    const darkShade = baseColor - 0x0c0c08;
    const lightShade = baseColor + 0x0e0e06;
    const warmShade = baseColor + 0x0a0400;

    // Dark patches
    g.fillStyle(darkShade, 0.6);
    g.fillCircle(12, 14, 8);
    g.fillCircle(44, 44, 10);
    g.fillCircle(52, 10, 6);
    g.fillCircle(8, 52, 7);

    // Light patches
    g.fillStyle(lightShade, 0.5);
    g.fillCircle(28, 32, 10);
    g.fillCircle(48, 24, 7);
    g.fillCircle(16, 44, 6);

    // Warm earth
    g.fillStyle(warmShade, 0.3);
    g.fillCircle(36, 12, 8);
    g.fillCircle(20, 56, 7);

    // Dirt/mud patches (more variety with 5 variants)
    const dirtPatterns = [
      [{ x: 40, y: 50, r: 6 }, { x: 44, y: 52, r: 5 }, { x: 38, y: 54, r: 4 }],
      [{ x: 14, y: 20, r: 5 }, { x: 18, y: 22, r: 4 }, { x: 12, y: 24, r: 3 }],
      [{ x: 50, y: 14, r: 7 }, { x: 54, y: 18, r: 5 }],
      [{ x: 30, y: 40, r: 5 }, { x: 34, y: 42, r: 4 }, { x: 28, y: 44, r: 3 }],
      [{ x: 8, y: 8, r: 4 }, { x: 12, y: 10, r: 3 }, { x: 56, y: 50, r: 5 }],
    ];
    const dirtColors = [0x5a4e32, 0x564a30, 0x52462e, 0x584c34, 0x544828];
    g.fillStyle(dirtColors[variant % 5], 0.5);
    (dirtPatterns[variant % 5] || []).forEach(p => g.fillCircle(p.x, p.y, p.r));

    // Grass blades
    const bladeColors = [0x4a9a4a, 0x3a8a3a, 0x5aaa50, 0x2d7a2d, 0x48a045, 0x358535, 0x5ab858];
    for (let i = 0; i < 40; i++) {
      const bx = (i * 17 + 7 + variant * 11) % 60 + 2;
      const by = (i * 23 + 11 + variant * 7) % 56 + 4;
      const len = 4 + (i % 6);
      const sway = (i % 5) - 2;
      g.lineStyle(1, bladeColors[i % bladeColors.length], 0.7 + (i % 3) * 0.1);
      g.lineBetween(bx, by, bx + sway, by - len);
      if (i % 6 === 0) {
        g.lineBetween(bx - 1, by, bx + sway - 1, by - len + 1);
        g.lineBetween(bx + 1, by, bx + sway + 1, by - len + 1);
      }
    }

    // Wildflowers (more variety)
    const flowerTypes = [
      { color: 0xe8d840, center: 0xf0e050 },  // yellow
      { color: 0xddeedd, center: 0xffffe8 },  // white
      { color: 0x8844aa, center: 0xaa66cc },  // purple
      { color: 0xff6644, center: 0xffaa88 },  // orange
      { color: 0x4488ff, center: 0x88bbff },  // blue
    ];
    const flower = flowerTypes[variant % 5];
    const fx = (variant * 18 + 14) % 48 + 8;
    const fy = (variant * 22 + 30) % 48 + 8;
    g.fillStyle(flower.color);
    g.fillCircle(fx, fy, 1.5);
    g.fillCircle((fx + 28) % 56 + 4, (fy + 16) % 52 + 6, 1.5);
    g.fillStyle(flower.center);
    g.fillCircle(fx, fy, 0.8);

    // Pebbles
    const pebblePositions = [
      { x: 15, y: 10 }, { x: 45, y: 50 },
      { x: 30, y: 5 }, { x: 55, y: 35 },
    ];
    pebblePositions.forEach((p, i) => {
      g.fillStyle(0x6a6a5a, 0.6);
      g.fillCircle(p.x, p.y, 1.5 + (i % 2) * 0.5);
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
