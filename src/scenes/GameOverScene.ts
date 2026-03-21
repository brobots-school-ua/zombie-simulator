import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';

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

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Game Over title
    this.add.text(width / 2, height / 4, 'GAME OVER', {
      fontSize: '56px',
      fontFamily: 'monospace',
      color: '#ff3333',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      `Score: ${this.data.get('score')}`,
      `Kills: ${this.data.get('kills')}`,
      `Wave: ${this.data.get('wave')}`,
    ].join('\n');

    this.add.text(width / 2, height / 2, stats, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    // Restart button
    const restartBtn = this.add.text(width / 2, height / 2 + 120, '[ PLAY AGAIN ]', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerover', () => restartBtn.setColor('#88ff88'));
    restartBtn.on('pointerout', () => restartBtn.setColor('#44ff44'));
    restartBtn.on('pointerdown', () => {
      audioManager.stopGameMusic(0);
      this.scene.start('GameScene');
    });

    // Menu button
    const menuBtn = this.add.text(width / 2, height / 2 + 170, '[ MAIN MENU ]', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#aaaaaa'));
    menuBtn.on('pointerdown', () => {
      audioManager.stopGameMusic(0);
      this.scene.start('MenuScene');
    });
  }
}
