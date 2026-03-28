import Phaser from 'phaser';

// Transition scene — black screen between locations
// Stays active until GameScene tells it to fade out
export class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TransitionScene' });
  }

  create(data: {
    locationName: string;
    wave: number;
    playerState: {
      hp: number;
      maxHp: number;
      score: number;
      kills: number;
      sessionKills: number;
      weapons: any[];
      activeWeaponIndex: number;
      bandages: number;
      medkits: number;
      wood: number;
      metal: number;
      screws: number;
    };
  }) {
    const { width, height } = this.cameras.main;

    // Black background
    this.cameras.main.setBackgroundColor('#000000');

    // Main text
    this.add.text(width / 2, height / 2 - 50, 'Перехід на нову локацію', {
      fontSize: '22px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Location name
    this.add.text(width / 2, height / 2 + 10, data.locationName, {
      fontSize: '48px',
      color: '#cc4444',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Wave info
    this.add.text(width / 2, height / 2 + 60, `Wave ${data.wave}`, {
      fontSize: '18px',
      color: '#666666',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Loading dots
    const dotsText = this.add.text(width / 2, height - 60, '.', {
      fontSize: '32px',
      color: '#444444',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    let dots = 0;
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        dots = (dots + 1) % 4;
        dotsText.setText('.'.repeat(dots || 1));
      },
    });

    // After 2 seconds, stop old GameScene and start new one
    // TransitionScene stays visible until GameScene calls fadeOut on it
    this.time.delayedCall(2000, () => {
      if (this.scene.isActive('GameScene')) {
        this.scene.stop('GameScene');
      }
      // Small delay to let GameScene fully clean up
      this.time.delayedCall(100, () => {
        this.scene.start('GameScene', {
          wave: data.wave,
          playerState: data.playerState,
        });
      });
    });
  }
}
