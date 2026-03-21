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

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Game Over title
    this.add.text(width / 2, height / 4 - 10, 'GAME OVER', {
      fontSize: '56px',
      fontFamily: 'monospace',
      color: '#ff3333',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      `Score: ${score}`,
      `Kills: ${kills}`,
      `Wave: ${wave}`,
    ].join('\n');

    this.add.text(width / 2, height / 2 - 30, stats, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    // Personal best
    const best = leaderboard.getPersonalBest();
    const isNewBest = score >= best;
    this.add.text(width / 2, height / 2 + 35, isNewBest ? `NEW BEST: ${best}!` : `Personal best: ${best}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: isNewBest ? '#ffff00' : '#888888',
    }).setOrigin(0.5);

    // Nickname info
    const nick = leaderboard.getNickname();
    if (nick) {
      this.add.text(width / 2, height / 2 + 55, `Playing as: ${nick}`, {
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#668866',
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, height / 2 + 55, 'Set a nickname in menu to join the leaderboard!', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#666644',
      }).setOrigin(0.5);
    }

    // Restart button
    const restartBtn = this.add.text(width / 2, height / 2 + 100, '[ PLAY AGAIN ]', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerover', () => restartBtn.setColor('#88ff88'));
    restartBtn.on('pointerout', () => restartBtn.setColor('#44ff44'));
    restartBtn.on('pointerdown', () => {
      window.location.reload();
    });

    // Menu button
    const menuBtn = this.add.text(width / 2, height / 2 + 145, '[ MAIN MENU ]', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#aaaaaa'));
    menuBtn.on('pointerdown', () => {
      window.location.reload();
    });

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
