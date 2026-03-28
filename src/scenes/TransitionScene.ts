import Phaser from 'phaser';

// Simple transition: show black screen with text, then start GameScene
export class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TransitionScene' });
  }

  create(data: {
    locationName: string;
    wave: number;
    playerState: any;
  }) {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(width / 2, height / 2 - 50, 'Перехід на нову локацію', {
      fontSize: '22px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, data.locationName, {
      fontSize: '48px',
      color: '#cc4444',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, `Wave ${data.wave}`, {
      fontSize: '18px',
      color: '#666666',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // After 2.5 seconds, switch to GameScene
    this.time.delayedCall(2500, () => {
      this.scene.start('GameScene', {
        wave: data.wave,
        playerState: data.playerState,
      });
    });
  }
}
