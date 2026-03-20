import Phaser from 'phaser';

export type PickupType = 'health' | 'ammo';

// Pickup item on the ground
export class Pickup extends Phaser.Physics.Arcade.Sprite {
  pickupType: PickupType;
  value: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PickupType) {
    const texture = type === 'health' ? 'health-pack' : 'ammo-pack';
    super(scene, x, y, texture);

    this.pickupType = type;
    this.value = type === 'health' ? 25 : 6;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(3);

    // Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
