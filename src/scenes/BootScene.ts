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
    // Short stock
    g.fillStyle(0x5a3820);
    g.fillRect(0, 3, 7, 8);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 4, 5, 6);
    g.lineStyle(1, 0x4a2e18, 0.3);
    g.lineBetween(2, 5, 5, 5);
    // Receiver
    g.fillStyle(0x3a3a3e);
    g.fillRect(6, 2, 9, 10);
    g.fillStyle(0x4a4a50);
    g.fillRect(7, 3, 7, 8);
    // Trigger
    g.fillStyle(0x2a2a2e);
    g.fillRect(9, 11, 4, 2);
    // Double barrel (top + bottom)
    g.fillStyle(0x333338);
    g.fillRect(14, 2, 14, 4);
    g.fillRect(14, 8, 14, 4);
    g.fillStyle(0x4a4a52);
    g.fillRect(14, 2, 14, 1);
    g.fillRect(14, 8, 14, 1);
    // Gap between barrels
    g.fillStyle(0x2a2a2e);
    g.fillRect(14, 6, 14, 2);
    // Pump grip (wood)
    g.fillStyle(0x6b4528);
    g.fillRect(17, 6, 6, 2);
    g.fillStyle(0x7a5232);
    g.fillRect(18, 6, 4, 1);
    // Muzzle holes
    g.fillStyle(0x1a1a1e);
    g.fillCircle(28, 4, 1.5);
    g.fillCircle(28, 10, 1.5);
    g.generateTexture('weapon-shotgun', 30, 14);
    g.clear();

    // === WEAPON 3: SNIPER (long, scoped) — now slot 3 ===
    // Adjustable stock
    g.fillStyle(0x3a3a3e);
    g.fillRect(0, 5, 6, 6);
    g.fillStyle(0x4a4a50);
    g.fillRect(1, 6, 4, 4);
    g.fillStyle(0x333338);
    g.fillRect(0, 8, 2, 4);
    // Receiver
    g.fillStyle(0x3a3a3e);
    g.fillRect(5, 4, 12, 8);
    g.fillStyle(0x4a4a52);
    g.fillRect(6, 5, 10, 6);
    // Trigger
    g.fillStyle(0x2a2a2e);
    g.fillRect(10, 11, 3, 2);
    // Long heavy barrel
    g.fillStyle(0x3a3a40);
    g.fillRect(16, 6, 22, 4);
    g.fillStyle(0x4a4a52);
    g.fillRect(16, 6, 22, 1);
    g.fillStyle(0x2a2a30);
    g.fillRect(16, 9, 22, 1);
    // Muzzle brake
    g.fillStyle(0x2a2a30);
    g.fillRect(36, 5, 4, 6);
    g.lineStyle(1, 0x555560);
    g.lineBetween(37, 5, 37, 11);
    g.lineBetween(39, 5, 39, 11);
    // Scope (big, detailed)
    g.fillStyle(0x2a2a30);
    g.fillRect(10, 0, 16, 4);
    g.fillStyle(0x3a3a42);
    g.fillRect(11, 1, 14, 2);
    // Scope lenses
    g.fillCircle(10, 2, 2.5);
    g.fillCircle(26, 2, 2.5);
    g.fillStyle(0x4488cc, 0.5);
    g.fillCircle(10, 2, 1.5);
    g.fillStyle(0x6699dd, 0.3);
    g.fillCircle(26, 2, 1.5);
    // Scope mount
    g.fillStyle(0x333338);
    g.fillRect(14, 3, 2, 2);
    g.fillRect(22, 3, 2, 2);
    // Bipod hint
    g.fillStyle(0x444448);
    g.fillRect(20, 10, 1, 3);
    g.fillRect(24, 10, 1, 3);
    g.generateTexture('weapon-sniper', 40, 14);
    g.clear();

    // === WEAPON 4: MINIGUN (multi-barrel rotary) ===
    // Rear housing / motor
    g.fillStyle(0x3a3a3e);
    g.fillRect(0, 3, 8, 10);
    g.fillStyle(0x4a4a50);
    g.fillRect(1, 4, 6, 8);
    // Handle/grip
    g.fillStyle(0x5a3820);
    g.fillRect(2, 12, 5, 4);
    g.fillStyle(0x6b4528);
    g.fillRect(3, 12, 3, 3);
    // Main body
    g.fillStyle(0x3a3a3e);
    g.fillRect(7, 2, 10, 12);
    g.fillStyle(0x4a4a52);
    g.fillRect(8, 3, 8, 10);
    // Ammo belt feed
    g.fillStyle(0x8B7355);
    g.fillRect(10, 13, 6, 3);
    g.fillStyle(0xffcc00);
    g.fillRect(11, 14, 1, 2);
    g.fillRect(13, 14, 1, 2);
    g.fillRect(15, 14, 1, 2);
    // Multi-barrel cluster (6 barrels)
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
    // Barrel separators
    g.lineStyle(1, 0x2a2a2e);
    g.lineBetween(16, 5, 32, 5);
    g.lineBetween(16, 9, 32, 9);
    // Barrel clamp rings
    g.fillStyle(0x555560);
    g.fillRect(20, 1, 2, 14);
    g.fillRect(26, 1, 2, 14);
    // Muzzle ends
    g.fillStyle(0x1a1a1e);
    g.fillRect(31, 2, 2, 3);
    g.fillRect(31, 6, 2, 3);
    g.fillRect(31, 10, 2, 3);
    // Flash hider
    g.fillStyle(0x2a2a30);
    g.fillRect(32, 1, 2, 14);
    g.generateTexture('weapon-minigun', 34, 16);
    g.clear();

    // === WEAPON 5: LAUNCHER (RPG-style) ===
    // Grip + trigger assembly
    g.fillStyle(0x5a3820);
    g.fillRect(0, 5, 6, 7);
    g.fillStyle(0x6b4528);
    g.fillRect(1, 6, 4, 5);
    g.fillStyle(0x3a3a3e);
    g.fillRect(5, 4, 6, 8);
    g.fillStyle(0x4a4a50);
    g.fillRect(6, 5, 4, 6);
    // Trigger
    g.fillStyle(0x2a2a2e);
    g.fillRect(7, 11, 3, 2);
    // Main tube (thick)
    g.fillStyle(0x3a4a3a);
    g.fillRect(10, 2, 18, 10);
    g.fillStyle(0x4a5a4a);
    g.fillRect(11, 3, 16, 8);
    // Top highlight
    g.fillStyle(0x5a6a5a, 0.4);
    g.fillRect(11, 3, 16, 2);
    // Bottom shadow
    g.fillStyle(0x2a3a2a, 0.4);
    g.fillRect(11, 9, 16, 2);
    // Reinforcement rings
    g.lineStyle(1, 0x2a3a2a);
    g.lineBetween(15, 2, 15, 12);
    g.lineBetween(22, 2, 22, 12);
    // Muzzle (wide open)
    g.fillStyle(0x222228);
    g.fillRect(27, 1, 4, 12);
    g.fillStyle(0x333338);
    g.fillRect(28, 2, 3, 10);
    // Rear sight
    g.fillStyle(0x555560);
    g.fillRect(12, 1, 2, 2);
    // Front sight
    g.fillStyle(0x555560);
    g.fillRect(25, 1, 2, 2);
    g.generateTexture('weapon-grenade', 32, 14);
    g.clear();

    // === ACCESSORY TEXTURES (bigger, more visible) ===

    // Beret (military green, flat cap shape, 16x10)
    // Flat top shape
    g.fillStyle(0x2d4a1e);
    g.fillCircle(8, 7, 7);
    g.fillStyle(0x3a5a28);
    g.fillCircle(8, 6, 6);
    // Brim edge
    g.fillStyle(0x1e3a14);
    g.fillRect(1, 8, 14, 2);
    // Badge
    g.fillStyle(0xddaa00);
    g.fillCircle(8, 5, 2);
    g.fillStyle(0xffcc22);
    g.fillCircle(8, 5, 1);
    g.generateTexture('acc-beret', 16, 10);
    g.clear();

    // Bandana (bright red, 28x10)
    g.fillStyle(0xee2222);
    g.fillRect(0, 1, 24, 6);
    g.fillStyle(0xcc1111);
    g.fillRect(0, 1, 24, 2);
    // Knot tails hanging right
    g.fillStyle(0xdd2222);
    g.fillRect(22, 0, 6, 4);
    g.fillRect(24, 4, 5, 4);
    g.fillStyle(0xbb1818);
    g.fillRect(26, 6, 3, 3);
    // Highlight
    g.fillStyle(0xff6644, 0.4);
    g.fillRect(4, 2, 8, 1);
    g.generateTexture('acc-bandana', 30, 10);
    g.clear();

    // Sunglasses (dark, 24x10)
    g.fillStyle(0x111111);
    g.fillCircle(6, 5, 5);
    g.fillCircle(18, 5, 5);
    g.fillStyle(0x1a1a44);
    g.fillCircle(6, 5, 4);
    g.fillCircle(18, 5, 4);
    // Glare
    g.fillStyle(0x4466aa, 0.3);
    g.fillCircle(5, 4, 2);
    g.fillCircle(17, 4, 2);
    // Bridge
    g.lineStyle(2, 0x222222);
    g.lineBetween(11, 5, 13, 5);
    // Arms
    g.lineStyle(2, 0x222222);
    g.lineBetween(0, 5, 1, 5);
    g.lineBetween(23, 5, 24, 5);
    g.generateTexture('acc-sunglasses', 24, 10);
    g.clear();

    // Scar (bright red slash, 20x20)
    g.lineStyle(3, 0xff3333, 0.9);
    g.lineBetween(2, 2, 18, 18);
    g.lineStyle(2, 0xff5555, 0.6);
    g.lineBetween(4, 0, 20, 16);
    g.lineStyle(1, 0xcc2222, 0.7);
    g.lineBetween(0, 6, 14, 20);
    // Blood drops
    g.fillStyle(0xaa0000, 0.5);
    g.fillCircle(16, 16, 2);
    g.fillCircle(6, 4, 1.5);
    g.generateTexture('acc-scar', 20, 20);
    g.clear();

    // Crown (gold, prominent, 24x20)
    g.fillStyle(0xffcc00);
    g.fillRect(2, 10, 20, 10);
    g.fillStyle(0xffdd33);
    g.fillRect(3, 11, 18, 8);
    // Crown points (3 spikes)
    g.fillStyle(0xffcc00);
    g.fillRect(2, 4, 4, 8);
    g.fillRect(10, 0, 4, 12);
    g.fillRect(18, 4, 4, 8);
    g.fillStyle(0xffdd33);
    g.fillRect(3, 5, 2, 6);
    g.fillRect(11, 1, 2, 10);
    g.fillRect(19, 5, 2, 6);
    // Gems (big, colorful)
    g.fillStyle(0xff1111);
    g.fillCircle(6, 14, 2.5);
    g.fillStyle(0x1144ff);
    g.fillCircle(12, 14, 2.5);
    g.fillStyle(0x11ff44);
    g.fillCircle(18, 14, 2.5);
    // Outline
    g.lineStyle(1, 0xcc9900);
    g.strokeRect(2, 10, 20, 10);
    g.generateTexture('acc-crown', 24, 20);
    g.clear();

    // Backpack (olive green military, 16x12)
    // Main body
    g.fillStyle(0x4a5a2a);
    g.fillRect(2, 2, 12, 8);
    g.fillStyle(0x5a6a35);
    g.fillRect(3, 3, 10, 6);
    // Top flap
    g.fillStyle(0x3a4a20);
    g.fillRect(2, 1, 12, 3);
    // Straps going up (toward player)
    g.fillStyle(0x4a5a2a);
    g.fillRect(4, 0, 2, 2);
    g.fillRect(10, 0, 2, 2);
    // Buckle
    g.fillStyle(0x888866);
    g.fillRect(6, 4, 4, 2);
    // Side pockets
    g.fillStyle(0x3a4a20);
    g.fillRect(0, 3, 3, 5);
    g.fillRect(13, 3, 3, 5);
    // Bottom
    g.fillStyle(0x2a3a18);
    g.fillRect(2, 9, 12, 2);
    g.generateTexture('acc-backpack', 16, 12);
    g.clear();

    // Coin icon (for HUD)
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

    // === ZOMBIE RADIOACTIVE — glowing green, toxic ===
    g.fillStyle(0x33ff33, 0.15);
    g.fillCircle(18, 18, 18);
    g.fillStyle(0x22cc22, 0.2);
    g.fillCircle(18, 18, 15);
    g.fillStyle(0x2a6a1a);
    g.fillCircle(18, 18, 12);
    g.fillStyle(0x33882a);
    g.fillCircle(18, 18, 10);
    g.fillStyle(0x44ff44, 0.6);
    g.fillCircle(12, 22, 3);
    g.fillCircle(24, 14, 2.5);
    g.fillCircle(20, 24, 2);
    g.fillStyle(0xccff00, 0.5);
    g.fillCircle(18, 16, 3);
    g.fillStyle(0x88ff88);
    g.fillCircle(14, 14, 3);
    g.fillCircle(22, 14, 3);
    g.fillStyle(0x44ff44);
    g.fillCircle(14, 14, 1.5);
    g.fillCircle(22, 14, 1.5);
    g.generateTexture('zombie-radioactive', 36, 36);
    g.clear();

    // Radioactive arms
    g.fillStyle(0x33882a);
    g.fillRect(0, 4, 8, 4);
    g.fillRect(0, 16, 8, 4);
    g.fillStyle(0x44ff44, 0.4);
    g.fillCircle(7, 6, 2);
    g.fillCircle(7, 18, 2);
    g.generateTexture('zombie-radioactive-arms', 10, 24);
    g.clear();

    // Toxic puddle
    g.fillStyle(0x33ff33, 0.3);
    g.fillCircle(20, 20, 20);
    g.fillStyle(0x22cc22, 0.2);
    g.fillCircle(20, 20, 14);
    g.fillStyle(0x44ff44, 0.15);
    g.fillCircle(15, 15, 8);
    g.generateTexture('toxic-puddle', 40, 40);
    g.clear();

    // === ZOMBIE KAMIKAZE — red, explosive ===
    g.fillStyle(0x882222);
    g.fillCircle(14, 14, 12);
    g.fillStyle(0xaa3333);
    g.fillCircle(14, 14, 10);
    g.fillStyle(0x554444);
    g.fillRect(8, 10, 12, 8);
    g.fillStyle(0xcc4444, 0.5);
    g.fillRect(9, 11, 10, 6);
    g.fillStyle(0xff0000);
    g.fillCircle(14, 13, 2);
    g.fillStyle(0xffff00);
    g.fillCircle(14, 13, 1);
    g.fillStyle(0xff6600);
    g.fillCircle(10, 10, 2.5);
    g.fillCircle(18, 10, 2.5);
    g.fillStyle(0xff0000);
    g.fillCircle(10, 10, 1);
    g.fillCircle(18, 10, 1);
    g.generateTexture('zombie-kamikaze', 28, 28);
    g.clear();

    // Kamikaze arms
    g.fillStyle(0xaa3333);
    g.fillRect(0, 3, 8, 3);
    g.fillRect(0, 14, 8, 3);
    g.generateTexture('zombie-kamikaze-arms', 10, 20);
    g.clear();

    // === ZOMBIE BOSS (Titan) — large, dark purple ===
    g.fillStyle(0x2a0a2a);
    g.fillCircle(20, 20, 19);
    g.fillStyle(0x441444);
    g.fillCircle(20, 20, 17);
    // Armor cracks
    g.fillStyle(0x551855);
    g.fillCircle(20, 20, 12);
    g.lineStyle(2, 0x220822);
    g.strokeCircle(20, 20, 12);
    // Scars
    g.lineStyle(2, 0x110411);
    g.lineBetween(8, 10, 18, 16);
    g.lineBetween(22, 26, 32, 34);
    // Blood
    g.fillStyle(0x880000);
    g.fillCircle(12, 28, 4);
    g.fillCircle(28, 14, 3);
    // Glowing red eyes
    g.fillStyle(0xff0000);
    g.fillRect(12, 10, 6, 5);
    g.fillRect(22, 10, 6, 5);
    g.fillStyle(0xff4444);
    g.fillRect(14, 11, 3, 3);
    g.fillRect(24, 11, 3, 3);
    // Crown-like spikes
    g.fillStyle(0x8800aa);
    g.fillTriangle(10, 4, 13, 0, 16, 4);
    g.fillTriangle(17, 3, 20, -1, 23, 3);
    g.fillTriangle(24, 4, 27, 0, 30, 4);
    g.generateTexture('zombie-boss', 40, 40);
    g.clear();

    // Boss arms (thick, dark)
    g.fillStyle(0x441444);
    g.fillRect(0, 3, 12, 7);
    g.fillRect(0, 20, 12, 7);
    g.fillStyle(0x2a0a2a);
    g.fillRect(10, 2, 5, 9);
    g.fillRect(10, 19, 5, 9);
    // Purple glow on fists
    g.fillStyle(0x8800aa, 0.5);
    g.fillCircle(12, 6, 3);
    g.fillCircle(12, 23, 3);
    g.generateTexture('zombie-boss-arms', 16, 30);
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

    // Bandage pickup (white roll with green cross)
    g.fillStyle(0xeeeeee);
    g.fillRoundedRect(4, 6, 16, 12, 3);
    g.fillStyle(0x44cc44);
    g.fillRect(9, 4, 6, 3);
    g.fillRect(9, 17, 6, 3);
    g.fillRect(6, 8, 12, 2);
    g.fillRect(11, 6, 2, 12);
    g.generateTexture('bandage-pickup', 24, 24);
    g.clear();

    // Medkit pickup (white box with red cross)
    g.fillStyle(0xffffff);
    g.fillRoundedRect(2, 4, 20, 16, 2);
    g.lineStyle(1, 0xcc0000);
    g.strokeRoundedRect(2, 4, 20, 16, 2);
    g.fillStyle(0xff2222);
    g.fillRect(6, 9, 12, 6);
    g.fillRect(9, 6, 6, 12);
    g.generateTexture('medkit-pickup', 24, 24);
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
