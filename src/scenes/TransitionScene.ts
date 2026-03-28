import Phaser from 'phaser';

// Transition scene — black screen between locations
// Overlay scene: runs on top, GameScene builds underneath, then this fades out
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

    // Use native setTimeout to guarantee execution even if scene lifecycle is tricky
    setTimeout(() => {
      // Stop old GameScene completely
      if (this.scene.isActive('GameScene')) {
        this.scene.stop('GameScene');
      }

      // Another timeout to let cleanup finish
      setTimeout(() => {
        // Launch GameScene (not start — we keep TransitionScene alive as overlay)
        this.scene.launch('GameScene', {
          wave: data.wave,
          playerState: data.playerState,
        });
        // Put TransitionScene on top so it stays visible
        this.scene.bringToTop('TransitionScene');
      }, 200);
    }, 2000);
  }
}
