import Phaser from 'phaser';

// Atmospheric main menu scene
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Fog particles drifting across the screen
    for (let i = 0; i < 12; i++) {
      const fog = this.add.image(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        'fog-particle'
      ).setAlpha(Phaser.Math.FloatBetween(0.1, 0.3)).setScale(Phaser.Math.FloatBetween(1.5, 3));

      this.tweens.add({
        targets: fog,
        x: fog.x + Phaser.Math.Between(-200, 200),
        y: fog.y + Phaser.Math.Between(-100, 100),
        alpha: Phaser.Math.FloatBetween(0.05, 0.2),
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Zombie silhouettes wandering in background
    for (let i = 0; i < 6; i++) {
      const zombie = this.add.image(
        Phaser.Math.Between(-40, width + 40),
        Phaser.Math.Between(height * 0.3, height * 0.85),
        'menu-zombie'
      ).setAlpha(Phaser.Math.FloatBetween(0.15, 0.35))
       .setScale(Phaser.Math.FloatBetween(1.2, 2.5));

      this.tweens.add({
        targets: zombie,
        x: zombie.x + Phaser.Math.Between(100, 300) * (Math.random() > 0.5 ? 1 : -1),
        duration: Phaser.Math.Between(6000, 12000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Blood-red vignette overlay
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0);
    vignette.fillRect(0, 0, width, height);
    // Darken edges
    vignette.fillStyle(0x110000, 0.4);
    vignette.fillRect(0, 0, width, 60);
    vignette.fillRect(0, height - 60, width, 60);
    vignette.fillRect(0, 0, 60, height);
    vignette.fillRect(width - 60, 0, 60, height);
    vignette.setDepth(1);

    // Title with flickering neon effect
    const title = this.add.text(width / 2, height / 3 - 20, 'ZOMBIE\nSIMULATOR', {
      fontSize: '72px',
      fontFamily: 'monospace',
      color: '#ff2222',
      align: 'center',
      fontStyle: 'bold',
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ff0000',
        blur: 20,
        fill: true,
      },
    }).setOrigin(0.5).setDepth(10);

    // Flickering effect (like broken neon sign)
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.3 },
      duration: 80,
      yoyo: true,
      repeat: -1,
      repeatDelay: Phaser.Math.Between(1500, 4000),
      hold: 40,
    });

    // Subtitle with fade-in
    const subtitle = this.add.text(width / 2, height / 2 - 10, 'Survive the horde', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#668866',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 2000,
      delay: 500,
    });

    // Start button with hover effects
    const startBtn = this.add.text(width / 2, height / 2 + 80, '[ START GAME ]', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#44ff44',
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#00ff00',
        blur: 10,
        fill: true,
      },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

    // Pulse animation on button
    this.tweens.add({
      targets: startBtn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    startBtn.on('pointerover', () => {
      startBtn.setColor('#88ff88');
      startBtn.setScale(1.15);
    });
    startBtn.on('pointerout', () => {
      startBtn.setColor('#44ff44');
      startBtn.setScale(1);
    });
    startBtn.on('pointerdown', () => {
      // Flash screen before starting
      this.cameras.main.flash(300, 255, 50, 50);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene');
      });
    });

    // Controls info with staggered fade-in
    const controls1 = this.add.text(width / 2, height - 90, 'WASD — move  |  MOUSE — aim & shoot', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#556655',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    const controls2 = this.add.text(width / 2, height - 65, 'R — reload  |  Survive as long as you can', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#556655',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({ targets: controls1, alpha: 0.8, duration: 1500, delay: 1000 });
    this.tweens.add({ targets: controls2, alpha: 0.8, duration: 1500, delay: 1500 });

    // Version
    this.add.text(width - 10, height - 20, 'v0.5', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#333333',
    }).setOrigin(1, 1).setDepth(10);
  }
}
