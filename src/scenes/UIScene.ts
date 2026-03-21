import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { Zombie } from '../entities/Zombie';
import { Pickup } from '../entities/Pickup';
import { audioManager } from '../systems/AudioManager';

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
  private volumeOpen = false;

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

    // Volume control in-game
    this.createVolumeControl();
  }

  private createVolumeControl() {
    const { width } = this.scale;
    const btnX = width - 40;
    const btnY = 55;

    // Volume icon button
    const volBtn = this.add.text(btnX, btnY, '♪', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(101);

    // Slider container (hidden by default)
    const sliderX = width - 195;
    const sliderY = btnY;
    const sliderW = 130;

    const sliderBg = this.add.graphics().setDepth(101).setVisible(false);
    const sliderGfx = this.add.graphics().setDepth(102).setVisible(false);
    const pctText = this.add.text(sliderX - 40, sliderY, `${audioManager.getVolumePercent()}%`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0, 0.5).setDepth(102).setVisible(false);

    // Draw static track background
    const drawBg = () => {
      sliderBg.clear();
      sliderBg.fillStyle(0x000000, 0.6);
      sliderBg.fillRoundedRect(sliderX - 50, sliderY - 14, sliderW + 60, 28, 5);
      sliderBg.fillStyle(0x333333);
      sliderBg.fillRoundedRect(sliderX, sliderY - 2, sliderW, 4, 2);
    };

    const volToX = (vol: number) => sliderX + ((vol - 0.25) / 1.75) * sliderW;
    const xToVol = (x: number) => 0.25 + ((x - sliderX) / sliderW) * 1.75;

    const drawSlider = (vol: number) => {
      const knobX = volToX(vol);
      sliderGfx.clear();
      sliderGfx.fillStyle(0x44ff44);
      sliderGfx.fillRoundedRect(sliderX, sliderY - 2, knobX - sliderX, 4, 2);
      sliderGfx.fillStyle(0x88ff88);
      sliderGfx.fillCircle(knobX, sliderY, 6);
      sliderGfx.fillStyle(0x44ff44);
      sliderGfx.fillCircle(knobX, sliderY, 4);
      pctText.setText(`${audioManager.getVolumePercent()}%`);
    };

    drawBg();
    drawSlider(audioManager.getVolume());

    // Hit zone for slider drag
    const hitZone = this.add.zone(sliderX + sliderW / 2, sliderY, sliderW + 20, 28)
      .setInteractive({ useHandCursor: true })
      .setDepth(103).setVisible(false);

    // Toggle slider visibility
    volBtn.on('pointerdown', () => {
      this.volumeOpen = !this.volumeOpen;
      sliderBg.setVisible(this.volumeOpen);
      sliderGfx.setVisible(this.volumeOpen);
      pctText.setVisible(this.volumeOpen);
      hitZone.setVisible(this.volumeOpen);
      if (this.volumeOpen) {
        // Redraw with current value
        drawSlider(audioManager.getVolume());
      }
    });

    let dragging = false;

    hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      dragging = true;
      const vol = xToVol(Phaser.Math.Clamp(pointer.x, sliderX, sliderX + sliderW));
      audioManager.setVolume(vol);
      drawSlider(vol);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!dragging) return;
      const vol = xToVol(Phaser.Math.Clamp(pointer.x, sliderX, sliderX + sliderW));
      audioManager.setVolume(vol);
      drawSlider(vol);
    });

    this.input.on('pointerup', () => {
      dragging = false;
    });
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
    this.ammoText.setText(`Ammo: ${p.magazineAmmo} / ${p.reserveAmmo}`);
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
