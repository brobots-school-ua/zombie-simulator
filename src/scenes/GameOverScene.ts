import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';

// Game Over scene — shows final stats and restart option
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; kills: number; wave: number }) {
    this.data.set('score', data.score);
    this.data.set('kills', data.kills);
    this.data.set('wave', data.wave);
  }

  create() {
    const { width, height } = this.scale;
    const score = this.data.get('score') as number;
    const kills = this.data.get('kills') as number;
    const wave = this.data.get('wave') as number;

    // Save result to leaderboard
    leaderboard.saveResult(score, wave);

    // Dark overlay with red tint
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0000, 0.85);

    // Scanlines for atmosphere
    const scanlines = this.add.graphics().setAlpha(0.05);
    for (let y = 0; y < height; y += 3) {
      scanlines.fillStyle(0x000000);
      scanlines.fillRect(0, y, width, 1);
    }

    // Blood drips from top
    const blood = this.add.graphics().setDepth(1);
    for (let i = 0; i < 15; i++) {
      const bx = Phaser.Math.Between(20, width - 20);
      const bh = Phaser.Math.Between(20, 120);
      blood.fillStyle(0x880000, Phaser.Math.FloatBetween(0.15, 0.35));
      blood.fillRect(bx, 0, Phaser.Math.Between(2, 5), bh);
      blood.fillCircle(bx + 1, bh, Phaser.Math.Between(2, 4));
    }

    // Game Over title (with glow and animation)
    const titleGlow = this.add.graphics();
    titleGlow.fillStyle(0xff0000, 0.06);
    titleGlow.fillCircle(width / 2, height / 4, 160);
    this.tweens.add({ targets: titleGlow, alpha: { from: 1, to: 0.3 }, duration: 1500, yoyo: true, repeat: -1 });

    const goTitle = this.add.text(width / 2, height / 4 - 10, 'GAME OVER', {
      fontSize: '60px',
      fontFamily: 'monospace',
      color: '#ff2222',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 4, color: '#880000', blur: 25, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(2);
    this.tweens.add({ targets: goTitle, alpha: 1, y: height / 4 - 10, duration: 800, ease: 'Power2' });
    // Flicker
    this.tweens.add({ targets: goTitle, alpha: { from: 1, to: 0.3 }, duration: 80, yoyo: true, repeat: -1, repeatDelay: 3000, hold: 40, delay: 1000 });

    // Stats with panel background
    const statsPanelBg = this.add.graphics().setDepth(1);
    statsPanelBg.fillStyle(0x0a0a0a, 0.6);
    statsPanelBg.fillRoundedRect(width / 2 - 140, height / 2 - 65, 280, 120, 8);
    statsPanelBg.lineStyle(1, 0x444444, 0.4);
    statsPanelBg.strokeRoundedRect(width / 2 - 140, height / 2 - 65, 280, 120, 8);

    const stats = [
      `Score: ${score}`,
      `Kills: ${kills}`,
      `Wave: ${wave}`,
    ].join('\n');

    const statsText = this.add.text(width / 2, height / 2 - 20, stats, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(2);

    // Personal best
    const best = leaderboard.getPersonalBest();
    const isNewBest = score >= best;
    const bestText = this.add.text(width / 2, height / 2 + 42, isNewBest ? `NEW BEST: ${best}!` : `Personal best: ${best}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: isNewBest ? '#ffff00' : '#888888',
      shadow: isNewBest ? { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 10, fill: true } : undefined,
    }).setOrigin(0.5).setDepth(2);
    if (isNewBest) {
      this.tweens.add({ targets: bestText, scaleX: 1.1, scaleY: 1.1, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Nickname info
    const nick = leaderboard.getNickname();
    if (nick) {
      this.add.text(width / 2, height / 2 + 62, `Playing as: ${nick}`, {
        fontSize: '13px', fontFamily: 'monospace', color: '#668866',
      }).setOrigin(0.5).setDepth(2);
    } else {
      this.add.text(width / 2, height / 2 + 62, 'Set a nickname in menu to join the leaderboard!', {
        fontSize: '12px', fontFamily: 'monospace', color: '#666644',
      }).setOrigin(0.5).setDepth(2);
    }

    // Restart button (with panel)
    const restartBg = this.add.graphics().setDepth(1);
    restartBg.fillStyle(0x0a1a0a, 0.6);
    restartBg.fillRoundedRect(width / 2 - 140, height / 2 + 85, 280, 45, 6);
    restartBg.lineStyle(2, 0x44ff44, 0.5);
    restartBg.strokeRoundedRect(width / 2 - 140, height / 2 + 85, 280, 45, 6);

    const restartBtn = this.add.text(width / 2, height / 2 + 107, '[ PLAY AGAIN ]', {
      fontSize: '28px', fontFamily: 'monospace', color: '#44ff44',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff00', blur: 8, fill: true },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(2);

    restartBtn.on('pointerover', () => {
      restartBtn.setColor('#aaffaa');
      restartBg.clear();
      restartBg.fillStyle(0x0a2a0a, 0.8);
      restartBg.fillRoundedRect(width / 2 - 145, height / 2 + 82, 290, 50, 6);
      restartBg.lineStyle(2, 0x88ff88);
      restartBg.strokeRoundedRect(width / 2 - 145, height / 2 + 82, 290, 50, 6);
    });
    restartBtn.on('pointerout', () => {
      restartBtn.setColor('#44ff44');
      restartBg.clear();
      restartBg.fillStyle(0x0a1a0a, 0.6);
      restartBg.fillRoundedRect(width / 2 - 140, height / 2 + 85, 280, 45, 6);
      restartBg.lineStyle(2, 0x44ff44, 0.5);
      restartBg.strokeRoundedRect(width / 2 - 140, height / 2 + 85, 280, 45, 6);
    });
    restartBtn.on('pointerdown', () => { window.location.reload(); });

    // Menu button
    const menuBtn = this.add.text(width / 2, height / 2 + 150, '[ MAIN MENU ]', {
      fontSize: '20px', fontFamily: 'monospace', color: '#888888',
      shadow: { offsetX: 0, offsetY: 0, color: '#444444', blur: 4, fill: true },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(2);

    menuBtn.on('pointerover', () => menuBtn.setColor('#cccccc'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', () => { window.location.reload(); });

    // Leaderboard on the right side
    this.drawLeaderboard(width, height);
  }

  private drawLeaderboard(screenW: number, screenH: number) {
    const top5 = leaderboard.getTop(5);
    if (top5.length === 0) return;

    const x = screenW - 40;
    const y = screenH / 4;

    this.add.text(x, y, 'LEADERBOARD', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffaa00',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    top5.forEach((entry, i) => {
      const currentScore = this.data.get('score') as number;
      const isCurrentRun = entry.score === currentScore && entry.name === leaderboard.getNickname();
      this.add.text(x, y + 24 + i * 20, `${i + 1}. ${entry.name} — ${entry.score} (W${entry.wave})`, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: isCurrentRun ? '#ffff44' : '#ccaa66',
      }).setOrigin(1, 0);
    });
  }
}
