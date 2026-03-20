import Phaser from 'phaser';

// Main menu scene
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, height / 3, 'ZOMBIE\nSIMULATOR', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#ff4444',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 + 20, 'Survive the horde', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Start button
    const startBtn = this.add.text(width / 2, height / 2 + 100, '[ START GAME ]', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setColor('#88ff88'));
    startBtn.on('pointerout', () => startBtn.setColor('#44ff44'));
    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Controls info
    this.add.text(width / 2, height - 80, 'WASD — move | MOUSE — aim & shoot', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 55, 'R — reload | E — pick up items', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);
  }
}
