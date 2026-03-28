import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';

// Transition scene — black loading screen between locations
// Flow: GameScene launches this → this shows text → this restarts GameScene
export class TransitionScene extends Phaser.Scene {
  private transitionData!: {
    wave: number;
    playerState: any;
  };

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
    this.transitionData = {
      wave: data.wave,
      playerState: data.playerState,
    };

    const { width, height } = this.cameras.main;
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

    // Step 1: Stop GameScene (native timeout for reliability)
    setTimeout(() => {
      if (this.scene.isActive('GameScene')) {
        this.scene.stop('GameScene');
      }
      if (this.scene.isActive('UIScene')) {
        this.scene.stop('UIScene');
      }
    }, 500);

    // Step 2: After showing text for 2.5 seconds, start GameScene
    // TransitionScene will be stopped by GameScene when it's ready
    setTimeout(() => {
      this.startNewGame();
    }, 2500);
  }

  private startNewGame() {
    // Make sure old scenes are stopped
    if (this.scene.isActive('GameScene')) {
      this.scene.stop('GameScene');
    }
    if (this.scene.isActive('UIScene')) {
      this.scene.stop('UIScene');
    }

    // Use scene.run which handles both stopped and sleeping scenes
    // Pass data to GameScene
    this.scene.start('GameScene', {
      wave: this.transitionData.wave,
      playerState: this.transitionData.playerState,
    });
    // Note: scene.start here stops TransitionScene and starts GameScene
    // GameScene will show its own black overlay during loading
  }
}
