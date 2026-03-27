import Phaser from 'phaser';

// Transition scene — loading screen between locations
// Shows "Moving to new location..." text with the location name
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
      sessionCoins: number;
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

    // "Moving to new location..." text with typewriter effect
    const movingText = this.add.text(width / 2, height / 2 - 40, '', {
      fontSize: '24px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const fullText = 'Moving to new location...';
    let charIndex = 0;
    this.time.addEvent({
      delay: 50,
      repeat: fullText.length - 1,
      callback: () => {
        charIndex++;
        movingText.setText(fullText.substring(0, charIndex));
      },
    });

    // Location name appears after typing finishes
    this.time.delayedCall(fullText.length * 50 + 300, () => {
      const nameText = this.add.text(width / 2, height / 2 + 20, data.locationName, {
        fontSize: '48px',
        color: '#cc4444',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0);

      // Fade in location name
      this.tweens.add({
        targets: nameText,
        alpha: 1,
        duration: 500,
        ease: 'Power2',
      });

      // Wave info
      const waveText = this.add.text(width / 2, height / 2 + 70, `Wave ${data.wave}`, {
        fontSize: '18px',
        color: '#666666',
        fontFamily: 'monospace',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: waveText,
        alpha: 1,
        duration: 500,
        delay: 200,
        ease: 'Power2',
      });
    });

    // Loading dots animation
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

    // After 3 seconds, start the game scene with new location
    this.time.delayedCall(3000, () => {
      let transitioned = false;
      const startGame = () => {
        if (transitioned) return;
        transitioned = true;
        // Stop GameScene if it's still running before restarting it
        if (this.scene.isActive('GameScene')) {
          this.scene.stop('GameScene');
        }
        this.scene.start('GameScene', {
          wave: data.wave,
          playerState: data.playerState,
        });
      };

      // Fade out
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', startGame);
      // Fallback if camera fade event doesn't fire
      this.time.delayedCall(800, startGame);
    });
  }
}
