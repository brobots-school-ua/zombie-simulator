import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';
import { AdminConsole } from '../systems/AdminConsole';
import { ACCESSORIES, shop } from '../systems/ShopConfig';

// Atmospheric main menu scene
export class MenuScene extends Phaser.Scene {
  private nicknameInput!: HTMLInputElement;
  private adminConsole!: AdminConsole;
  private shopPanel: HTMLDivElement | null = null;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Start menu music (will init AudioContext on first user click)
    audioManager.init();
    audioManager.startMenuMusic();

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

    // Nickname input (HTML element over canvas)
    this.createNicknameInput(width, height);

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
      // Save nickname
      if (this.nicknameInput) {
        leaderboard.setNickname(this.nicknameInput.value);
        this.nicknameInput.remove();
      }
      // Resume audio context (browser autoplay policy)
      audioManager.resume();
      // Stop menu music, start game
      audioManager.stopMenuMusic(0.5);
      // Flash screen before starting
      this.cameras.main.flash(300, 255, 50, 50);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene');
      });
    });

    // Coins display
    this.add.text(20, 20, `Coins: ${shop.getCoins()}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffcc22',
    }).setDepth(10);

    // Shop button
    const shopBtn = this.add.text(width / 2, height / 2 + 115, '[ SHOP ]', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#ffcc22',
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 8, fill: true },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

    shopBtn.on('pointerover', () => shopBtn.setColor('#ffee66'));
    shopBtn.on('pointerout', () => shopBtn.setColor('#ffcc22'));
    shopBtn.on('pointerdown', () => this.openShop());

    // Volume slider
    this.createVolumeSlider(width, height);

    // Leaderboard + personal best
    this.createMenuLeaderboard(width, height);

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
    this.add.text(width - 10, height - 20, 'v0.7', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#333333',
    }).setOrigin(1, 1).setDepth(10);

    // Admin console (~ key)
    this.adminConsole = new AdminConsole(this);

    // Cleanup HTML elements when scene shuts down
    this.events.on('shutdown', () => {
      if (this.nicknameInput) this.nicknameInput.remove();
      if (this.shopPanel) { this.shopPanel.remove(); this.shopPanel = null; }
      this.adminConsole.destroy();
    });
  }

  private createNicknameInput(screenW: number, screenH: number) {
    // Get canvas position for proper alignment
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();

    // Scale factors in case canvas is scaled
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    const inputW = 200;
    const inputH = 28;
    const inputX = rect.left + (screenW / 2 - inputW / 2) * scaleX;
    const inputY = rect.top + (screenH / 2 + 30) * scaleY;

    this.nicknameInput = document.createElement('input');
    this.nicknameInput.type = 'text';
    this.nicknameInput.maxLength = 16;
    this.nicknameInput.placeholder = 'Enter nickname...';
    this.nicknameInput.value = leaderboard.getNickname();
    this.nicknameInput.style.cssText = `
      position: absolute;
      left: ${inputX}px;
      top: ${inputY}px;
      width: ${inputW * scaleX}px;
      height: ${inputH * scaleY}px;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid #44ff44;
      color: #44ff44;
      font-family: monospace;
      font-size: ${14 * scaleY}px;
      text-align: center;
      outline: none;
      border-radius: 4px;
      z-index: 1000;
    `;

    document.body.appendChild(this.nicknameInput);

    // Label above input
    this.add.text(screenW / 2, screenH / 2 + 18, 'Nickname (optional)', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#556655',
    }).setOrigin(0.5).setDepth(10);
  }

  private openShop() {
    if (this.shopPanel) return;

    this.shopPanel = document.createElement('div');
    this.shopPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #ffcc22; border-radius: 8px;
      padding: 24px; z-index: 3000; font-family: monospace; color: #ffcc22;
      min-width: 360px; max-height: 80vh; overflow-y: auto;
    `;

    const renderShop = () => {
      if (!this.shopPanel) return;
      const equipped = shop.getEquipped();
      this.shopPanel.innerHTML = `
        <h3 style="margin:0 0 8px 0; color:#ffcc22; font-size:20px;">SHOP</h3>
        <p style="color:#ffdd44; margin:0 0 16px 0;">Coins: ${shop.getCoins()}</p>
        ${ACCESSORIES.map(acc => {
          const owned = shop.owns(acc.id);
          const isEquipped = equipped === acc.id;
          const canBuy = shop.getCoins() >= acc.price;
          return `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px; margin:4px 0; border:1px solid ${isEquipped ? '#44ff44' : '#333'}; border-radius:4px; background:${isEquipped ? 'rgba(68,255,68,0.1)' : 'rgba(0,0,0,0.3)'}">
            <span style="color:#ddd;">${acc.name} <span style="color:#888;">(${acc.price} coins)</span></span>
            ${isEquipped ? '<button class="shop-btn" data-action="unequip" style="padding:4px 10px; background:#333; border:1px solid #44ff44; color:#44ff44; font-family:monospace; cursor:pointer; border-radius:3px;">Equipped</button>'
            : owned ? `<button class="shop-btn" data-action="equip" data-id="${acc.id}" style="padding:4px 10px; background:#1a3a1a; border:1px solid #44ff44; color:#44ff44; font-family:monospace; cursor:pointer; border-radius:3px;">Equip</button>`
            : `<button class="shop-btn" data-action="buy" data-id="${acc.id}" style="padding:4px 10px; background:${canBuy ? '#3a3a1a' : '#222'}; border:1px solid ${canBuy ? '#ffcc22' : '#555'}; color:${canBuy ? '#ffcc22' : '#555'}; font-family:monospace; cursor:pointer; border-radius:3px;" ${canBuy ? '' : 'disabled'}>Buy</button>`
            }
          </div>`;
        }).join('')}
        <button id="shop-close" style="width:100%; margin-top:16px; padding:8px; background:#222; border:1px solid #666; color:#aaa; font-family:monospace; cursor:pointer; border-radius:3px;">Close</button>
      `;

      // Bind events
      this.shopPanel.querySelectorAll('.shop-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = (btn as HTMLElement).dataset.action;
          const id = (btn as HTMLElement).dataset.id || '';
          if (action === 'buy') { shop.buy(id); renderShop(); }
          if (action === 'equip') { shop.equip(id); renderShop(); }
          if (action === 'unequip') { shop.unequip(); renderShop(); }
        });
      });
      this.shopPanel.querySelector('#shop-close')?.addEventListener('click', () => {
        this.shopPanel?.remove();
        this.shopPanel = null;
      });
    };

    document.body.appendChild(this.shopPanel);
    this.shopPanel.addEventListener('keydown', (e) => e.stopPropagation());
    renderShop();
  }

  private createMenuLeaderboard(screenW: number, screenH: number) {
    const top5 = leaderboard.getTop(5);
    const best = leaderboard.getPersonalBest();
    const x = screenW - 40;
    const y = screenH / 3 - 10;

    // Personal best
    if (best > 0) {
      this.add.text(x, y - 30, `Your best: ${best}`, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#ffaa00',
      }).setOrigin(1, 0).setDepth(10);
    }

    if (top5.length === 0) return;

    // Leaderboard title
    this.add.text(x, y, 'LEADERBOARD', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffaa00',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(10);

    // Entries
    top5.forEach((entry, i) => {
      this.add.text(x, y + 22 + i * 18, `${i + 1}. ${entry.name} — ${entry.score}`, {
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#aa8844',
      }).setOrigin(1, 0).setDepth(10);
    });
  }

  private createVolumeSlider(screenW: number, screenH: number) {
    const sliderY = screenH / 2 + 145;
    const sliderX = screenW / 2 - 100;
    const sliderW = 200;

    // Label
    this.add.text(screenW / 2, sliderY - 20, 'Volume', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#668866',
    }).setOrigin(0.5).setDepth(10);

    // Track background
    const trackGraphics = this.add.graphics().setDepth(10);
    trackGraphics.fillStyle(0x333333);
    trackGraphics.fillRoundedRect(sliderX, sliderY - 3, sliderW, 6, 3);

    // Filled portion + knob
    const sliderGfx = this.add.graphics().setDepth(11);

    // Percentage text
    const pctText = this.add.text(screenW / 2 + 115, sliderY, `${audioManager.getVolumePercent()}%`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0, 0.5).setDepth(10);

    const volToX = (vol: number) => sliderX + ((vol - 0.25) / 1.75) * sliderW;
    const xToVol = (x: number) => 0.25 + ((x - sliderX) / sliderW) * 1.75;

    const drawSlider = (vol: number) => {
      const knobX = volToX(vol);
      sliderGfx.clear();
      sliderGfx.fillStyle(0x44ff44);
      sliderGfx.fillRoundedRect(sliderX, sliderY - 3, knobX - sliderX, 6, 3);
      sliderGfx.fillStyle(0x88ff88);
      sliderGfx.fillCircle(knobX, sliderY, 8);
      sliderGfx.fillStyle(0x44ff44);
      sliderGfx.fillCircle(knobX, sliderY, 6);
      pctText.setText(`${audioManager.getVolumePercent()}%`);
    };

    drawSlider(audioManager.getVolume());

    const hitZone = this.add.zone(screenW / 2, sliderY, sliderW + 30, 30)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    let dragging = false;

    hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      dragging = true;
      const vol = xToVol(Phaser.Math.Clamp(pointer.x, sliderX, sliderX + sliderW));
      audioManager.setVolume(vol);
      drawSlider(vol);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!dragging) return;
      const vol = xToVol(Phaser.Math.Clamp(pointer.x, sliderX, sliderX + sliderW));
      audioManager.setVolume(vol);
      drawSlider(vol);
    });

    this.input.on('pointerup', () => {
      dragging = false;
    });
  }
}
