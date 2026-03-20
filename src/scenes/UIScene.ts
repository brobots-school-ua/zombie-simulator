import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { Zombie } from '../entities/Zombie';
import { Pickup } from '../entities/Pickup';

// UI overlay scene — HUD with health, ammo, score, wave info, minimap
export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private reloadText!: Phaser.GameObjects.Text;
  private minimap!: Phaser.GameObjects.Graphics;

  private minimapSize = 160;
  private minimapMargin = 15;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameScene: GameScene }) {
    this.gameScene = data.gameScene;
  }

  create() {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
    };

    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(20, 15, '', style).setDepth(100);
    this.ammoText = this.add.text(20, 50, '', style).setDepth(100);
    this.scoreText = this.add.text(20, 80, '', style).setDepth(100);

    this.reloadText = this.add.text(0, 0, 'RELOADING...', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffff00',
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.waveText = this.add.text(0, 15, '', {
      ...style,
      fontSize: '22px',
      color: '#ff6666',
    }).setOrigin(1, 0).setDepth(100);

    this.minimap = this.add.graphics();
    this.minimap.setDepth(100);
  }

  update() {
    if (!this.gameScene?.player) return;
    const p = this.gameScene.player;
    const { width, height } = this.scale;

    // Draw HP bar
    this.hpBar.clear();
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(18, 36, 204, 12);
    const hpPercent = p.hp / p.maxHp;
    const barColor = hpPercent > 0.5 ? 0x44ff44 : hpPercent > 0.25 ? 0xffaa00 : 0xff3333;
    this.hpBar.fillStyle(barColor);
    this.hpBar.fillRect(20, 38, 200 * hpPercent, 8);
    this.hpBar.setDepth(99);

    this.hpText.setText(`HP: ${p.hp}/${p.maxHp}`);
    this.ammoText.setText(`Ammo: ${p.magazineAmmo}/${p.maxMagazine} | Reserve: ${p.reserveAmmo}`);
    this.scoreText.setText(`Score: ${p.score} | Kills: ${p.kills}`);

    this.waveText.setPosition(width - 20, 15);
    this.waveText.setText(`Wave ${this.gameScene.wave}`);

    this.reloadText.setPosition(width / 2, height / 2);
    this.reloadText.setVisible(p.isReloading);

    // Draw minimap
    this.drawMinimap(width, height);
  }

  private drawMinimap(screenW: number, screenH: number) {
    const mm = this.minimap;
    const size = this.minimapSize;
    const margin = this.minimapMargin;
    const mapSize = 2000; // same as GameScene.mapSize

    const mmX = screenW - size - margin;
    const mmY = screenH - size - margin;
    const scale = size / mapSize;

    mm.clear();

    // Background with border
    mm.fillStyle(0x000000, 0.6);
    mm.fillRect(mmX - 2, mmY - 2, size + 4, size + 4);
    mm.fillStyle(0x1a2a1a, 0.8);
    mm.fillRect(mmX, mmY, size, size);

    // Walls (grey dots)
    const walls = this.gameScene.walls.getChildren() as Phaser.Physics.Arcade.Sprite[];
    mm.fillStyle(0x666666, 0.7);
    for (const wall of walls) {
      const wx = mmX + wall.x * scale;
      const wy = mmY + wall.y * scale;
      mm.fillRect(wx, wy, Math.max(2, 64 * scale), Math.max(2, 64 * scale));
    }

    // Pickups (yellow dots)
    mm.fillStyle(0xffaa00);
    this.gameScene.pickups.getChildren().forEach((obj) => {
      const pickup = obj as Pickup;
      if (pickup.active) {
        mm.fillRect(mmX + pickup.x * scale - 1, mmY + pickup.y * scale - 1, 3, 3);
      }
    });

    // Zombies (red dots)
    mm.fillStyle(0xff3333);
    this.gameScene.zombies.getChildren().forEach((obj) => {
      const z = obj as Zombie;
      if (z.active) {
        mm.fillCircle(mmX + z.x * scale, mmY + z.y * scale, 2);
      }
    });

    // Player (green dot, bigger)
    const p = this.gameScene.player;
    mm.fillStyle(0x44ff44);
    mm.fillCircle(mmX + p.x * scale, mmY + p.y * scale, 3);

    // Camera view rectangle
    const cam = this.gameScene.cameras.main;
    const camX = mmX + (cam.scrollX) * scale;
    const camY = mmY + (cam.scrollY) * scale;
    const camW = (cam.width / cam.zoom) * scale;
    const camH = (cam.height / cam.zoom) * scale;
    mm.lineStyle(1, 0xffffff, 0.4);
    mm.strokeRect(camX, camY, camW, camH);

    // Border
    mm.lineStyle(1, 0x44ff44, 0.5);
    mm.strokeRect(mmX, mmY, size, size);
  }
}
