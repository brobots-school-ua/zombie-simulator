import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';
import { AdminConsole } from '../systems/AdminConsole';
import { ACCESSORIES, shop } from '../systems/ShopConfig';

// Atmospheric main menu scene — two-column layout
export class MenuScene extends Phaser.Scene {
  private nicknameInput!: HTMLInputElement;
  private adminConsole!: AdminConsole;
  private shopPanel: HTMLDivElement | null = null;
  private coinsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    const LEFT_X = width * 0.28;  // ~360 on 1280
    const RIGHT_X = width * 0.75; // ~960 on 1280

    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Start menu music
    audioManager.init();
    audioManager.startMenuMusic();

    // Fog particles
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
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Zombie silhouettes
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
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Vignette
    const vignette = this.add.graphics();
    vignette.fillStyle(0x110000, 0.4);
    vignette.fillRect(0, 0, width, 60);
    vignette.fillRect(0, height - 60, width, 60);
    vignette.fillRect(0, 0, 60, height);
    vignette.fillRect(width - 60, 0, 60, height);
    vignette.setDepth(1);

    // ============ TITLE (top center, big) ============
    const title = this.add.text(width / 2, 90, 'ZOMBIE\nSIMULATOR', {
      fontSize: '80px',
      fontFamily: 'monospace',
      color: '#ff2222',
      align: 'center',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 25, fill: true },
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.3 },
      duration: 80, yoyo: true, repeat: -1,
      repeatDelay: Phaser.Math.Between(1500, 4000), hold: 40,
    });

    // Subtitle
    const subtitle = this.add.text(LEFT_X, 230, 'Survive the horde', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#668866',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 2000, delay: 500 });

    // ============ LEFT COLUMN — Buttons ============

    // Nickname label + input
    this.add.text(LEFT_X, 275, 'Nickname (optional)', {
      fontSize: '13px', fontFamily: 'monospace', color: '#556655',
    }).setOrigin(0.5).setDepth(10);

    this.createNicknameInput(LEFT_X, 300);

    // START button (big!) — starts disabled, enables after cooldown
    const startBtn = this.add.text(LEFT_X, 400, '[ START GAME ]', {
      fontSize: '42px',
      fontFamily: 'monospace',
      color: '#555555',
      shadow: { offsetX: 0, offsetY: 0, color: '#333333', blur: 5, fill: true },
    }).setOrigin(0.5).setDepth(10);

    // Cooldown before button becomes active (prevents crash after ESC)
    let ready = false;
    this.time.delayedCall(1200, () => {
      ready = true;
      startBtn.setColor('#44ff44');
      startBtn.setShadow(0, 0, '#00ff00', 15, true);
      startBtn.setInteractive({ useHandCursor: true });

      this.tweens.add({
        targets: startBtn,
        scaleX: 1.03, scaleY: 1.03,
        duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });

    startBtn.on('pointerover', () => { if (ready) { startBtn.setColor('#88ff88'); startBtn.setScale(1.1); } });
    startBtn.on('pointerout', () => { if (ready) { startBtn.setColor('#44ff44'); startBtn.setScale(1); } });
    let starting = false;
    startBtn.on('pointerdown', () => {
      if (starting || !ready) return;
      starting = true;
      startBtn.disableInteractive();
      if (this.nicknameInput) {
        leaderboard.setNickname(this.nicknameInput.value);
        this.nicknameInput.remove();
      }
      // Make sure old game/ui scenes are fully stopped
      if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
      if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
      audioManager.resume();
      audioManager.stopMenuMusic(0.5);
      audioManager.stopGameMusic(0);
      this.cameras.main.flash(300, 255, 50, 50);
      this.time.delayedCall(300, () => this.scene.start('GameScene'));
    });

    // SHOP button
    const shopBtn = this.add.text(LEFT_X, 490, '[ SHOP ]', {
      fontSize: '30px',
      fontFamily: 'monospace',
      color: '#ffcc22',
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 10, fill: true },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

    shopBtn.on('pointerover', () => { shopBtn.setColor('#ffee66'); shopBtn.setScale(1.08); });
    shopBtn.on('pointerout', () => { shopBtn.setColor('#ffcc22'); shopBtn.setScale(1); });
    shopBtn.on('pointerdown', () => this.openShop());

    // Volume slider
    this.createVolumeSlider(LEFT_X, 580);

    // ============ RIGHT COLUMN — Stats ============

    // Coins (updated when shop closes)
    this.coinsText = this.add.text(RIGHT_X, 230, `Coins: ${shop.getCoins()}`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffcc22',
    }).setOrigin(0.5).setDepth(10);

    // Personal best
    const best = leaderboard.getPersonalBest();
    if (best > 0) {
      this.add.text(RIGHT_X, 265, `Your best: ${best}`, {
        fontSize: '16px', fontFamily: 'monospace', color: '#ffaa00',
      }).setOrigin(0.5).setDepth(10);
    }

    // Leaderboard
    this.createMenuLeaderboard(RIGHT_X, 310);

    // ============ BOTTOM — Controls ============
    const controls = this.add.text(width / 2, height - 50,
      'WASD — move  |  MOUSE — aim & shoot  |  R — reload  |  1-5 — switch weapon', {
      fontSize: '13px', fontFamily: 'monospace', color: '#445544',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: controls, alpha: 0.8, duration: 1500, delay: 1000 });

    // Version
    this.add.text(width - 10, height - 20, 'v1.0', {
      fontSize: '12px', fontFamily: 'monospace', color: '#333333',
    }).setOrigin(1, 1).setDepth(10);

    // Admin console
    this.adminConsole = new AdminConsole(this);

    // Cleanup
    this.events.on('shutdown', () => {
      if (this.nicknameInput) this.nicknameInput.remove();
      this.closeShop();
      this.adminConsole.destroy();
    });
  }

  update() {
    // Keep coins display always up to date
    if (this.coinsText) {
      this.coinsText.setText(`Coins: ${shop.getCoins()}`);
    }
  }

  private createNicknameInput(centerX: number, centerY: number) {
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    const inputW = 240;
    const inputH = 32;
    const inputX = rect.left + (centerX - inputW / 2) * scaleX;
    const inputY = rect.top + centerY * scaleY;

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
      font-size: ${15 * scaleY}px;
      text-align: center;
      outline: none;
      border-radius: 4px;
      z-index: 1000;
    `;
    document.body.appendChild(this.nicknameInput);
  }

  private openShop() {
    if (this.shopPanel) return;
    shop.cleanupStale(); // remove old accessories from renamed items

    this.shopPanel = document.createElement('div');
    this.shopPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #ffcc22; border-radius: 8px;
      padding: 20px; z-index: 3000; font-family: monospace; color: #ffcc22;
      width: 500px; max-height: 85vh; overflow-y: auto;
    `;

    const drawPreview = (accId: string | null) => {
      const canvas = this.shopPanel?.querySelector('#preview-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 80, 80);

      // Draw player (blue circle)
      ctx.fillStyle = '#2266cc';
      ctx.beginPath(); ctx.arc(40, 44, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4488ff';
      ctx.beginPath(); ctx.arc(40, 44, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#66aaff';
      ctx.beginPath(); ctx.arc(36, 40, 8, 0, Math.PI * 2); ctx.fill();

      // Draw accessory if selected
      if (accId) {
        const accDef = ACCESSORIES.find(a => a.id === accId);
        if (accDef) {
          // Get texture from Phaser and draw it
          const tex = this.textures.get(accDef.texture);
          if (tex) {
            const src = tex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
            const ax = 40 + accDef.offsetX * 1.5 - src.width;
            const ay = 44 + accDef.offsetY * 1.5 - src.height;
            ctx.drawImage(src, ax, ay, src.width * 2, src.height * 2);
          }
        }
      }
    };

    const renderShop = () => {
      if (!this.shopPanel) return;
      const equipped = shop.getEquipped();
      this.shopPanel.innerHTML = `
        <h3 style="margin:0 0 4px 0; color:#ffcc22; font-size:20px;">SHOP</h3>
        <div style="display:flex; gap:16px; margin-bottom:12px;">
          <div style="flex-shrink:0; display:flex; flex-direction:column; align-items:center;">
            <canvas id="preview-canvas" width="80" height="80" style="border:1px solid #333; border-radius:6px; background:#111;"></canvas>
            <span style="color:#556655; font-size:10px; margin-top:4px;">Hover to preview</span>
          </div>
          <div>
            <p style="color:#ffdd44; margin:0 0 6px 0;">Coins: ${shop.getCoins()}</p>
            <p style="color:#888; margin:0; font-size:11px;">${equipped ? 'Wearing: ' + ACCESSORIES.find(a => a.id === equipped)?.name : 'No accessory equipped'}</p>
          </div>
        </div>
        <div id="shop-items">
        ${ACCESSORIES.map(acc => {
          const owned = shop.owns(acc.id);
          const isEquipped = equipped === acc.id;
          const canBuy = shop.getCoins() >= acc.price;

          let buttons = '';
          if (isEquipped) {
            buttons = `<button class="shop-btn" data-action="unequip" style="padding:4px 8px; background:#333; border:1px solid #44ff44; color:#44ff44; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px;">Equipped</button>`;
          } else if (owned) {
            buttons = `
              <button class="shop-btn" data-action="equip" data-id="${acc.id}" style="padding:4px 8px; background:#1a3a1a; border:1px solid #44ff44; color:#44ff44; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px;">Equip</button>
              <button class="shop-btn" data-action="refund" data-id="${acc.id}" style="padding:4px 8px; background:#3a1a1a; border:1px solid #ff6644; color:#ff6644; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px; margin-left:4px;">Refund</button>`;
          } else {
            buttons = `<button class="shop-btn" data-action="buy" data-id="${acc.id}" style="padding:4px 8px; background:${canBuy ? '#3a3a1a' : '#222'}; border:1px solid ${canBuy ? '#ffcc22' : '#555'}; color:${canBuy ? '#ffcc22' : '#555'}; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px;" ${canBuy ? '' : 'disabled'}>Buy</button>`;
          }

          return `<div class="shop-item" data-preview="${acc.id}" style="display:flex; justify-content:space-between; align-items:center; padding:8px; margin:3px 0; border:1px solid ${isEquipped ? '#44ff44' : '#333'}; border-radius:4px; background:${isEquipped ? 'rgba(68,255,68,0.1)' : 'rgba(0,0,0,0.3)'}; cursor:pointer;">
            <span style="color:#ddd;">${acc.name} <span style="color:#888;">(${acc.price})</span></span>
            <div>${buttons}</div>
          </div>`;
        }).join('')}
        </div>
        <div style="display:flex; gap:8px; margin-top:12px;">
          <button id="shop-reset" style="flex:1; padding:8px; background:#3a1a1a; border:1px solid #ff4444; color:#ff4444; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px;">Reset All (refund)</button>
          <button id="shop-close" style="flex:2; padding:8px; background:#222; border:1px solid #666; color:#aaa; font-family:monospace; cursor:pointer; border-radius:3px;">Close</button>
        </div>
      `;

      // Button events
      this.shopPanel.querySelectorAll('.shop-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = (btn as HTMLElement).dataset.action;
          const id = (btn as HTMLElement).dataset.id || '';
          if (action === 'buy') {
            if (!shop.buy(id)) { alert('Not enough coins!'); }
            renderShop();
          }
          if (action === 'equip') { shop.equip(id); renderShop(); }
          if (action === 'unequip') { shop.unequip(); renderShop(); }
          if (action === 'refund') { shop.refund(id); renderShop(); }
        });
      });

      // Hover preview on canvas
      this.shopPanel.querySelectorAll('.shop-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          const id = (item as HTMLElement).dataset.preview || '';
          drawPreview(id);
        });
        item.addEventListener('mouseleave', () => {
          drawPreview(shop.getEquipped());
        });
      });

      // Draw initial preview
      drawPreview(shop.getEquipped());

      this.shopPanel.querySelector('#shop-reset')?.addEventListener('click', () => {
        shop.resetShop();
        renderShop();
      });

      this.shopPanel.querySelector('#shop-close')?.addEventListener('click', () => {
        this.closeShop();
      });
    };

    document.body.appendChild(this.shopPanel);
    this.shopPanel.addEventListener('keydown', (e) => e.stopPropagation());
    renderShop();
  }

  private closeShop() {
    if (this.shopPanel) {
      this.shopPanel.remove();
      this.shopPanel = null;
    }
    // Update coins display in menu
    if (this.coinsText) {
      this.coinsText.setText(`Coins: ${shop.getCoins()}`);
    }
  }

  private createMenuLeaderboard(centerX: number, startY: number) {
    const top5 = leaderboard.getTop(5);
    if (top5.length === 0) {
      this.add.text(centerX, startY, 'No scores yet', {
        fontSize: '14px', fontFamily: 'monospace', color: '#555544',
      }).setOrigin(0.5).setDepth(10);
      return;
    }

    this.add.text(centerX, startY, 'LEADERBOARD', {
      fontSize: '18px', fontFamily: 'monospace', color: '#ffaa00', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);

    top5.forEach((entry, i) => {
      this.add.text(centerX, startY + 28 + i * 22, `${i + 1}. ${entry.name} — ${entry.score}`, {
        fontSize: '15px', fontFamily: 'monospace', color: '#aa8844',
      }).setOrigin(0.5).setDepth(10);
    });
  }

  private createVolumeSlider(centerX: number, y: number) {
    const sliderW = 200;
    const sliderX = centerX - sliderW / 2;

    this.add.text(centerX, y - 22, 'Volume', {
      fontSize: '14px', fontFamily: 'monospace', color: '#668866',
    }).setOrigin(0.5).setDepth(10);

    const trackGraphics = this.add.graphics().setDepth(10);
    trackGraphics.fillStyle(0x333333);
    trackGraphics.fillRoundedRect(sliderX, y - 3, sliderW, 6, 3);

    const sliderGfx = this.add.graphics().setDepth(11);
    const pctText = this.add.text(centerX + sliderW / 2 + 15, y, `${audioManager.getVolumePercent()}%`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#44ff44',
    }).setOrigin(0, 0.5).setDepth(10);

    const volToX = (vol: number) => sliderX + ((vol - 0.25) / 1.75) * sliderW;
    const xToVol = (x: number) => 0.25 + ((x - sliderX) / sliderW) * 1.75;

    const drawSlider = (vol: number) => {
      const knobX = volToX(vol);
      sliderGfx.clear();
      sliderGfx.fillStyle(0x44ff44);
      sliderGfx.fillRoundedRect(sliderX, y - 3, knobX - sliderX, 6, 3);
      sliderGfx.fillStyle(0x88ff88);
      sliderGfx.fillCircle(knobX, y, 8);
      sliderGfx.fillStyle(0x44ff44);
      sliderGfx.fillCircle(knobX, y, 6);
      pctText.setText(`${audioManager.getVolumePercent()}%`);
    };

    drawSlider(audioManager.getVolume());

    const hitZone = this.add.zone(centerX, y, sliderW + 30, 30)
      .setInteractive({ useHandCursor: true }).setDepth(12);

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
    this.input.on('pointerup', () => { dragging = false; });
  }
}
