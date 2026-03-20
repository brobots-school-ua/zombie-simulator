import Phaser from 'phaser';
import { GameScene } from './GameScene';

// UI overlay scene — HUD with health, ammo, score, wave info
export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private reloadText!: Phaser.GameObjects.Text;

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

    // Position wave text at top-right
    this.waveText.setPosition(width - 20, 15);
    this.waveText.setText(`Wave ${this.gameScene.wave}`);

    // Center reload text
    this.reloadText.setPosition(width / 2, height / 2);
    this.reloadText.setVisible(p.isReloading);
  }
}
