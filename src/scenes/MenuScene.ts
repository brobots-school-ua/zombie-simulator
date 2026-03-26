import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';
import { AdminConsole } from '../systems/AdminConsole';
import { ACCESSORIES, shop } from '../systems/ShopConfig';
import { bestiary } from '../systems/BestiaryManager';
import { ABILITIES, getSelectedAbility, setSelectedAbility } from '../systems/AbilityConfig';

// Atmospheric main menu scene
export class MenuScene extends Phaser.Scene {
  private nicknameInput!: HTMLInputElement;
  private adminConsole!: AdminConsole;
  private shopPanel: HTMLDivElement | null = null;
  private bestiaryPanel: HTMLDivElement | null = null;
  private backpackPanel: HTMLDivElement | null = null;
  private abilitiesPanel: HTMLDivElement | null = null;
  private coinsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    const CX = width / 2;

    this.cameras.main.setBackgroundColor('#050808');
    audioManager.init();
    audioManager.startMenuMusic();

    // Fog (atmospheric)
    for (let i = 0; i < 10; i++) {
      const fog = this.add.image(
        Phaser.Math.Between(-100, width + 100), Phaser.Math.Between(-50, height + 50), 'fog-particle'
      ).setAlpha(Phaser.Math.FloatBetween(0.08, 0.25)).setScale(Phaser.Math.FloatBetween(2, 4.5)).setTint(0x1a3a1a);
      this.tweens.add({ targets: fog, x: fog.x + Phaser.Math.Between(-250, 250), y: fog.y + Phaser.Math.Between(-120, 120), alpha: Phaser.Math.FloatBetween(0.03, 0.18), duration: Phaser.Math.Between(5000, 10000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Red mist (adds danger feel)
    for (let i = 0; i < 3; i++) {
      const mist = this.add.image(
        Phaser.Math.Between(0, width), Phaser.Math.Between(height * 0.4, height), 'fog-particle'
      ).setAlpha(Phaser.Math.FloatBetween(0.03, 0.08)).setScale(Phaser.Math.FloatBetween(2, 4)).setTint(0xff2200);
      this.tweens.add({ targets: mist, x: mist.x + Phaser.Math.Between(-150, 150), alpha: Phaser.Math.FloatBetween(0.02, 0.06), duration: Phaser.Math.Between(6000, 12000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Zombie silhouettes (with shadows, varying sizes)
    for (let i = 0; i < 6; i++) {
      const zy = Phaser.Math.Between(height * 0.25, height * 0.88);
      const zScale = Phaser.Math.FloatBetween(1.0, 3.0);
      const zAlpha = Phaser.Math.FloatBetween(0.08, 0.3);
      // Shadow under zombie
      const zShadow = this.add.image(Phaser.Math.Between(-40, width + 40), zy + 10, 'shadow').setAlpha(zAlpha * 0.5).setScale(zScale * 0.6);
      const z = this.add.image(zShadow.x, zy, 'menu-zombie').setAlpha(zAlpha).setScale(zScale);
      const drift = Phaser.Math.Between(80, 350) * (Math.random() > 0.5 ? 1 : -1);
      const dur = Phaser.Math.Between(5000, 14000);
      this.tweens.add({ targets: z, x: z.x + drift, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: zShadow, x: zShadow.x + drift, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      // Some zombies have glowing eyes
      if (Math.random() > 0.5) {
        const eyeGlow = this.add.circle(z.x - 4 * zScale, zy - 3 * zScale, 2 * zScale, 0xff0000, zAlpha * 0.8).setDepth(1);
        const eyeGlow2 = this.add.circle(z.x + 4 * zScale, zy - 3 * zScale, 2 * zScale, 0xff0000, zAlpha * 0.8).setDepth(1);
        this.tweens.add({ targets: [eyeGlow, eyeGlow2], x: `+=${drift}`, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: [eyeGlow, eyeGlow2], alpha: { from: zAlpha * 0.3, to: zAlpha * 1.0 }, duration: Phaser.Math.Between(500, 1500), yoyo: true, repeat: -1 });
      }
    }

    // Floating dust/ash particles
    for (let i = 0; i < 8; i++) {
      const dust = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'particle-dust')
        .setAlpha(Phaser.Math.FloatBetween(0.1, 0.3)).setScale(Phaser.Math.FloatBetween(0.5, 1.5)).setDepth(2);
      this.tweens.add({
        targets: dust, y: dust.y - Phaser.Math.Between(100, 300), alpha: 0,
        duration: Phaser.Math.Between(5000, 10000), repeat: -1,
        onRepeat: () => {
          dust.setPosition(Phaser.Math.Between(0, width), height + 20);
          dust.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
        },
      });
    }

    // Vignette (simple gradient bars)
    const vig = this.add.graphics();
    vig.fillStyle(0x050000, 0.35);
    vig.fillRect(0, 0, width, 50); vig.fillRect(0, height - 50, width, 50);
    vig.fillRect(0, 0, 50, height); vig.fillRect(width - 50, 0, 50, height);
    vig.fillStyle(0x050000, 0.2);
    vig.fillRect(0, 50, width, 30); vig.fillRect(0, height - 80, width, 30);
    vig.setDepth(3);

    // ============ CENTER — Title + Nickname + START ============

    // Title glow background
    const titleGlow = this.add.graphics().setDepth(9);
    titleGlow.fillStyle(0xff0000, 0.05);
    titleGlow.fillCircle(CX, 110, 180);
    titleGlow.fillStyle(0xff0000, 0.03);
    titleGlow.fillCircle(CX, 110, 250);
    this.tweens.add({ targets: titleGlow, alpha: { from: 1, to: 0.3 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Title (with stronger glow)
    const title = this.add.text(CX, 80, 'ZOMBIE\nSIMULATOR', {
      fontSize: '80px', fontFamily: 'monospace', color: '#ff2222',
      align: 'center', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 4, color: '#880000', blur: 30, fill: true },
    }).setOrigin(0.5).setDepth(10);
    // Flicker effect (like broken neon sign)
    this.tweens.add({ targets: title, alpha: { from: 1, to: 0.2 }, duration: 60, yoyo: true, repeat: -1, repeatDelay: Phaser.Math.Between(2000, 5000), hold: 30 });

    // Blood drip decoration under title
    const drips = this.add.graphics().setDepth(9);
    drips.fillStyle(0xaa0000, 0.4);
    [CX - 100, CX - 40, CX + 20, CX + 80, CX + 130].forEach((dx, i) => {
      const dripH = 8 + (i * 7) % 20;
      drips.fillRect(dx, 165, 3, dripH);
      drips.fillCircle(dx + 1, 165 + dripH, 2);
    });

    // Subtitle (with typewriter-like appearance)
    const sub = this.add.text(CX, 215, 'Survive the horde', {
      fontSize: '22px', fontFamily: 'monospace', color: '#446644', fontStyle: 'italic',
      shadow: { offsetX: 0, offsetY: 0, color: '#224422', blur: 8, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: sub, alpha: 0.8, duration: 2500, delay: 600, ease: 'Power2' });

    // Nickname
    this.add.text(CX, 260, 'Nickname (optional)', {
      fontSize: '13px', fontFamily: 'monospace', color: '#556655',
    }).setOrigin(0.5).setDepth(10);
    this.createNicknameInput(CX, 285);

    // START button — big, center, with background panel
    const startBtnBg = this.add.graphics().setDepth(9);
    startBtnBg.fillStyle(0x0a1a0a, 0.6);
    startBtnBg.fillRoundedRect(CX - 200, 345, 400, 60, 8);
    startBtnBg.lineStyle(2, 0x333333);
    startBtnBg.strokeRoundedRect(CX - 200, 345, 400, 60, 8);

    const startBtn = this.add.text(CX, 375, '[ START GAME ]', {
      fontSize: '48px', fontFamily: 'monospace', color: '#333333',
      shadow: { offsetX: 0, offsetY: 0, color: '#222222', blur: 5, fill: true },
    }).setOrigin(0.5).setDepth(10);

    let ready = false;
    this.time.delayedCall(1200, () => {
      ready = true;
      startBtn.setColor('#44ff44');
      startBtn.setShadow(0, 0, '#00ff00', 20, true);
      startBtnBg.clear();
      startBtnBg.fillStyle(0x0a1a0a, 0.7);
      startBtnBg.fillRoundedRect(CX - 200, 345, 400, 60, 8);
      startBtnBg.lineStyle(2, 0x44ff44, 0.6);
      startBtnBg.strokeRoundedRect(CX - 200, 345, 400, 60, 8);
      startBtn.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: startBtn, scaleX: 1.03, scaleY: 1.03, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      // Glow pulse on the button background
      this.tweens.add({ targets: startBtnBg, alpha: { from: 1, to: 0.7 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    startBtn.on('pointerover', () => {
      if (ready) {
        startBtn.setColor('#aaffaa');
        startBtn.setScale(1.08);
        startBtnBg.clear();
        startBtnBg.fillStyle(0x0a2a0a, 0.8);
        startBtnBg.fillRoundedRect(CX - 210, 340, 420, 70, 8);
        startBtnBg.lineStyle(2, 0x88ff88);
        startBtnBg.strokeRoundedRect(CX - 210, 340, 420, 70, 8);
      }
    });
    startBtn.on('pointerout', () => {
      if (ready) {
        startBtn.setColor('#44ff44');
        startBtn.setScale(1);
        startBtnBg.clear();
        startBtnBg.fillStyle(0x0a1a0a, 0.7);
        startBtnBg.fillRoundedRect(CX - 200, 345, 400, 60, 8);
        startBtnBg.lineStyle(2, 0x44ff44, 0.6);
        startBtnBg.strokeRoundedRect(CX - 200, 345, 400, 60, 8);
      }
    });
    let starting = false;
    startBtn.on('pointerdown', () => {
      if (starting || !ready) return;
      starting = true; startBtn.disableInteractive();
      if (this.nicknameInput) { leaderboard.setNickname(this.nicknameInput.value); this.nicknameInput.remove(); }
      if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
      if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
      audioManager.resume(); audioManager.stopMenuMusic(0.5); audioManager.stopGameMusic(0);
      this.cameras.main.flash(300, 255, 50, 50);
      this.time.delayedCall(300, () => this.scene.start('GameScene'));
    });

    // ============ BOTTOM — Wider buttons with full labels ============
    const btnW = 120;
    const btnH = 50;
    const btnGap = 8;
    const btnY = height - 30;
    const totalBtnsW = btnW * 5 + btnGap * 4;
    const btnStartX = width - totalBtnsW - 20;
    const btnStyle = { fontSize: '11px', fontFamily: 'monospace', align: 'center' as const };

    // Button bar background
    const btnBarBg = this.add.graphics().setDepth(8);
    btnBarBg.fillStyle(0x000000, 0.4);
    btnBarBg.fillRoundedRect(btnStartX - 10, btnY - btnH - 10, totalBtnsW + 20, btnH + 20, 8);

    // Helper to create a menu button
    const makeBtn = (index: number, label: string, color: number, bgColor: number, hoverBg: number, hoverColor: number, onClick: () => void) => {
      const bx = btnStartX + index * (btnW + btnGap);
      const bg = this.add.graphics().setDepth(10);
      bg.fillStyle(bgColor); bg.fillRoundedRect(bx, btnY - btnH, btnW, btnH, 6);
      bg.lineStyle(2, color); bg.strokeRoundedRect(bx, btnY - btnH, btnW, btnH, 6);
      this.add.text(bx + btnW / 2, btnY - btnH / 2, label, {
        ...btnStyle, fontSize: '15px', color: '#' + color.toString(16).padStart(6, '0'),
      }).setOrigin(0.5).setDepth(11);
      const zone = this.add.zone(bx + btnW / 2, btnY - btnH / 2, btnW, btnH)
        .setInteractive({ useHandCursor: true }).setDepth(12);
      zone.on('pointerover', () => { bg.clear(); bg.fillStyle(hoverBg); bg.fillRoundedRect(bx, btnY - btnH, btnW, btnH, 6); bg.lineStyle(2, hoverColor); bg.strokeRoundedRect(bx, btnY - btnH, btnW, btnH, 6); });
      zone.on('pointerout', () => { bg.clear(); bg.fillStyle(bgColor); bg.fillRoundedRect(bx, btnY - btnH, btnW, btnH, 6); bg.lineStyle(2, color); bg.strokeRoundedRect(bx, btnY - btnH, btnW, btnH, 6); });
      zone.on('pointerdown', onClick);
      return { bg, zone };
    };

    makeBtn(0, 'ACCESS.', 0xffcc22, 0x1a1a0a, 0x2a2a1a, 0xffee66, () => this.openShop());
    makeBtn(1, 'VOLUME', 0x44ff44, 0x0a1a0a, 0x1a2a1a, 0x88ff88, () => {});
    makeBtn(2, 'BESTIARY', 0xcc44ff, 0x1a0a1a, 0x2a1a2a, 0xee66ff, () => this.openBestiary());
    makeBtn(3, 'BACKPACK', 0x88aa44, 0x0a1a0a, 0x1a2a1a, 0xaacc66, () => this.openBackpack());
    makeBtn(4, 'ABILITIES', 0xff6644, 0x1a1a0a, 0x2a1a0a, 0xff8866, () => this.openAbilities());

    // Volume slider inside the VOLUME button area
    const volBtnX = btnStartX + 1 * (btnW + btnGap);
    this.createVolumeSlider(volBtnX + btnW / 2, btnY - btnH / 2 + 4, btnW - 24);

    // ============ RIGHT SIDE — Stats with panel ============
    const RX = width - 30;

    // Coins panel
    const statsBg = this.add.graphics().setDepth(8);
    statsBg.fillStyle(0x000000, 0.4);
    statsBg.fillRoundedRect(RX - 160, 230, 170, 50, 8);
    statsBg.lineStyle(1, 0xffcc22, 0.3);
    statsBg.strokeRoundedRect(RX - 160, 230, 170, 50, 8);

    // Coins (with icon)
    this.add.image(RX - 140, 255, 'coin-icon').setDepth(10).setScale(1.5);
    this.coinsText = this.add.text(RX - 122, 246, `${shop.getCoins()}`, {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffcc22',
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 6, fill: true },
    }).setOrigin(0, 0).setDepth(10);

    // ============ BOTTOM CENTER — Controls ============
    const ctrlBg = this.add.graphics().setDepth(8);
    ctrlBg.fillStyle(0x000000, 0.3);
    ctrlBg.fillRoundedRect(CX - 350, height - 30, 700, 22, 4);
    const ctrl = this.add.text(CX, height - 19, 'WASD — move  |  SHIFT — sprint  |  MOUSE — shoot  |  R — reload  |  1-5 — weapon  |  F — ability', {
      fontSize: '11px', fontFamily: 'monospace', color: '#444444',
    }).setOrigin(0.5, 0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: [ctrl, ctrlBg], alpha: 0.7, duration: 1500, delay: 1200 });

    // Version
    this.add.text(width - 10, height - 8, 'v1.2', {
      fontSize: '11px', fontFamily: 'monospace', color: '#222222',
      shadow: { offsetX: 0, offsetY: 0, color: '#111111', blur: 2, fill: true },
    }).setOrigin(1, 1).setDepth(10);

    // Admin console
    this.adminConsole = new AdminConsole(this);

    this.events.on('shutdown', () => {
      if (this.nicknameInput) this.nicknameInput.remove();
      this.closeShop();
      this.closeBestiary();
      this.closeBackpack();
      this.adminConsole.destroy();
    });
  }

  update() {
    if (this.coinsText) this.coinsText.setText(`Coins: ${shop.getCoins()}`);
  }

  private createNicknameInput(centerX: number, centerY: number) {
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    const inputW = 240, inputH = 32;

    this.nicknameInput = document.createElement('input');
    this.nicknameInput.type = 'text';
    this.nicknameInput.maxLength = 16;
    this.nicknameInput.placeholder = 'Enter nickname...';
    this.nicknameInput.value = leaderboard.getNickname();
    this.nicknameInput.style.cssText = `
      position: absolute; left: ${rect.left + (centerX - inputW / 2) * scaleX}px;
      top: ${rect.top + centerY * scaleY}px; width: ${inputW * scaleX}px; height: ${inputH * scaleY}px;
      background: rgba(0,0,0,0.7); border: 1px solid #44ff44; color: #44ff44;
      font-family: monospace; font-size: ${15 * scaleY}px; text-align: center;
      outline: none; border-radius: 4px; z-index: 1000;
    `;
    document.body.appendChild(this.nicknameInput);
  }

  private openShop() {
    if (this.shopPanel) return;
    shop.cleanupStale();

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
      ctx.fillStyle = '#2266cc'; ctx.beginPath(); ctx.arc(40, 44, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4488ff'; ctx.beginPath(); ctx.arc(40, 44, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#66aaff'; ctx.beginPath(); ctx.arc(36, 40, 8, 0, Math.PI * 2); ctx.fill();
      if (accId) {
        const accDef = ACCESSORIES.find(a => a.id === accId);
        if (accDef) {
          const tex = this.textures.get(accDef.texture);
          if (tex) {
            const src = tex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
            ctx.drawImage(src, 40 + accDef.offsetX * 1.5 - src.width, 44 + accDef.offsetY * 1.5 - src.height, src.width * 2, src.height * 2);
          }
        }
      }
    };

    const renderShop = () => {
      if (!this.shopPanel) return;
      const equipped = shop.getEquipped();
      this.shopPanel.innerHTML = `
        <h3 style="margin:0 0 4px 0; color:#ffcc22; font-size:20px;">ACCESSORIES</h3>
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
            buttons = `<button class="shop-btn" data-action="equip" data-id="${acc.id}" style="padding:4px 8px; background:#1a3a1a; border:1px solid #44ff44; color:#44ff44; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px;">Equip</button>
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
      this.shopPanel.querySelectorAll('.shop-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = (btn as HTMLElement).dataset.action;
          const id = (btn as HTMLElement).dataset.id || '';
          if (action === 'buy') { if (!shop.buy(id)) alert('Not enough coins!'); renderShop(); }
          if (action === 'equip') { shop.equip(id); renderShop(); }
          if (action === 'unequip') { shop.unequip(); renderShop(); }
          if (action === 'refund') { shop.refund(id); renderShop(); }
        });
      });
      this.shopPanel.querySelectorAll('.shop-item').forEach(item => {
        item.addEventListener('mouseenter', () => drawPreview((item as HTMLElement).dataset.preview || ''));
        item.addEventListener('mouseleave', () => drawPreview(shop.getEquipped()));
      });
      drawPreview(shop.getEquipped());
      this.shopPanel.querySelector('#shop-reset')?.addEventListener('click', () => { shop.resetShop(); renderShop(); });
      this.shopPanel.querySelector('#shop-close')?.addEventListener('click', () => this.closeShop());
    };

    document.body.appendChild(this.shopPanel);
    this.shopPanel.addEventListener('keydown', (e) => e.stopPropagation());
    renderShop();
  }

  private closeShop() {
    if (this.shopPanel) { this.shopPanel.remove(); this.shopPanel = null; }
  }


  private createVolumeSlider(centerX: number, y: number, sliderW: number) {
    const sliderX = centerX - sliderW / 2;
    const trackGfx = this.add.graphics().setDepth(10);
    trackGfx.fillStyle(0x333333);
    trackGfx.fillRoundedRect(sliderX, y - 2, sliderW, 4, 2);
    const sliderGfx = this.add.graphics().setDepth(11);
    const pctText = this.add.text(centerX, y + 12, `${audioManager.getVolumePercent()}%`, {
      fontSize: '10px', fontFamily: 'monospace', color: '#44ff44',
    }).setOrigin(0.5).setDepth(11);

    const volToX = (vol: number) => sliderX + (vol / 2.0) * sliderW;
    const xToVol = (x: number) => ((x - sliderX) / sliderW) * 2.0;
    const draw = (vol: number) => {
      const kx = volToX(vol); sliderGfx.clear();
      sliderGfx.fillStyle(0x44ff44); sliderGfx.fillRoundedRect(sliderX, y - 2, kx - sliderX, 4, 2);
      sliderGfx.fillStyle(0x88ff88); sliderGfx.fillCircle(kx, y, 6);
      sliderGfx.fillStyle(0x44ff44); sliderGfx.fillCircle(kx, y, 4);
      pctText.setText(`${audioManager.getVolumePercent()}%`);
    };
    draw(audioManager.getVolume());

    const hitZone = this.add.zone(centerX, y, sliderW + 20, 24).setInteractive({ useHandCursor: true }).setDepth(12);
    let dragging = false;
    hitZone.on('pointerdown', (p: Phaser.Input.Pointer) => { dragging = true; const v = xToVol(Phaser.Math.Clamp(p.x, sliderX, sliderX + sliderW)); audioManager.setVolume(v); draw(v); });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (!dragging) return; const v = xToVol(Phaser.Math.Clamp(p.x, sliderX, sliderX + sliderW)); audioManager.setVolume(v); draw(v); });
    this.input.on('pointerup', () => { dragging = false; });
  }

  private openBestiary() {
    if (this.bestiaryPanel) return;

    const ZOMBIES = [
      { type: 'walker', name: 'Walker', hp: 50, damage: 10, speed: 60, special: '' },
      { type: 'runner', name: 'Runner', hp: 35, damage: 8, speed: 140, special: '' },
      { type: 'tank', name: 'Tank', hp: 100, damage: 25, speed: 35, special: '' },
      { type: 'radioactive', name: 'Radioactive', hp: 40, damage: 5, speed: 50, special: 'Aura: 10 dmg/sec, medium range\nDeath: toxic puddle for 5 sec' },
      { type: 'kamikaze', name: 'Kamikaze', hp: 15, damage: 0, speed: 180, special: 'Contact: big explosion, 50 dmg\nDeath: small explosion, 35 dmg' },
      { type: 'boss', name: 'Titan', hp: 500, damage: 30, speed: 45, special: 'Stomp: 15 dmg, large range\nAlways aggro, huge size' },
    ];

    const speedLabel = (s: number) => s <= 50 ? 'Slow' : s <= 100 ? 'Normal' : s <= 150 ? 'Fast' : 'Very Fast';
    const speedColor = (s: number) => s <= 50 ? '#44aaff' : s <= 100 ? '#ffffff' : s <= 150 ? '#ffaa44' : '#ff4444';

    this.bestiaryPanel = document.createElement('div');
    this.bestiaryPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #cc44ff; border-radius: 8px;
      padding: 24px; z-index: 3000; font-family: monospace; color: #cc44ff;
      width: 560px; max-height: 85vh; overflow-y: auto;
    `;

    this.bestiaryPanel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; color:#cc44ff; font-size:20px;">BESTIARY</h3>
        <button id="bestiary-close" style="background:none; border:2px solid #ff4444; color:#ff4444; font-family:monospace; font-size:22px; cursor:pointer; padding:2px 10px; border-radius:4px; line-height:1; transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#ff4444';this.style.color='#000'" onmouseout="this.style.background='none';this.style.color='#ff4444'">✕</button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:12px;">
        ${ZOMBIES.map(z => {
          const unlocked = bestiary.isUnlocked(z.type);
          if (!unlocked) {
            return `<div style="width:160px; padding:12px; border:1px solid #333; border-radius:6px; background:#111; text-align:center;">
              <div style="width:48px; height:48px; margin:0 auto 8px; background:#1a1a1a; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                <span style="font-size:24px; color:#333;">?</span>
              </div>
              <div style="color:#444; font-size:14px;">???</div>
              <div style="color:#333; font-size:10px; margin-top:4px;">Kill to unlock</div>
            </div>`;
          }
          return `<div style="width:160px; padding:12px; border:1px solid #cc44ff; border-radius:6px; background:#1a0a1a;">
            <div style="text-align:center; margin-bottom:8px;">
              <div style="color:#cc44ff; font-size:16px; font-weight:bold;">${z.name}</div>
            </div>
            <div style="font-size:11px; line-height:1.6;">
              <div>HP: <span style="color:#ff4444;">${z.hp}</span></div>
              <div>Damage: <span style="color:#ffaa44;">${z.damage}</span></div>
              <div>Speed: <span style="color:${speedColor(z.speed)};">${speedLabel(z.speed)}</span></div>
              ${z.special ? `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #333; color:#88ff88; white-space:pre-line; font-size:10px;">${z.special}</div>` : '<div style="margin-top:6px; color:#555; font-size:10px;">No special abilities</div>'}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    document.body.appendChild(this.bestiaryPanel);
    this.bestiaryPanel.addEventListener('keydown', (e) => e.stopPropagation());
    this.bestiaryPanel.querySelector('#bestiary-close')!.addEventListener('click', () => this.closeBestiary());
  }

  private closeBestiary() {
    if (this.bestiaryPanel) { this.bestiaryPanel.remove(); this.bestiaryPanel = null; }
  }

  private openBackpack() {
    if (this.backpackPanel) return;

    // Read saved materials from localStorage
    let materials = { wood: 0, metal: 0, screws: 0 };
    try {
      const saved = localStorage.getItem('zombie-sim-materials');
      if (saved) materials = JSON.parse(saved);
    } catch { /* use defaults */ }

    this.backpackPanel = document.createElement('div');
    this.backpackPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #88aa44; border-radius: 8px;
      padding: 20px; z-index: 3000; font-family: monospace; color: #88aa44;
      width: 280px;
    `;

    this.backpackPanel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h3 style="margin:0; color:#88aa44; font-size:20px;">BACKPACK</h3>
        <button id="bp-close" style="background:none; border:2px solid #ff4444; color:#ff4444; font-family:monospace; font-size:22px; cursor:pointer; padding:2px 10px; border-radius:4px; line-height:1; transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#ff4444';this.style.color='#000'" onmouseout="this.style.background='none';this.style.color='#ff4444'">✕</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px; padding:8px; border:1px solid #333; border-radius:4px; background:rgba(139,90,43,0.15);">
          <span style="color:#8b5a2b; font-size:18px;">■</span>
          <span style="color:#ddd; flex:1;">Wood</span>
          <span style="color:#88aa44; font-size:18px; font-weight:bold;">${materials.wood}</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; padding:8px; border:1px solid #333; border-radius:4px; background:rgba(150,150,150,0.1);">
          <span style="color:#999; font-size:18px;">■</span>
          <span style="color:#ddd; flex:1;">Metal</span>
          <span style="color:#88aa44; font-size:18px; font-weight:bold;">${materials.metal}</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; padding:8px; border:1px solid #333; border-radius:4px; background:rgba(100,100,120,0.1);">
          <span style="color:#777; font-size:18px;">⚙</span>
          <span style="color:#ddd; flex:1;">Screws</span>
          <span style="color:#88aa44; font-size:18px; font-weight:bold;">${materials.screws}</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.backpackPanel);
    this.backpackPanel.addEventListener('keydown', (e) => e.stopPropagation());
    this.backpackPanel.querySelector('#bp-close')!.addEventListener('click', () => this.closeBackpack());
  }

  private closeBackpack() {
    if (this.backpackPanel) { this.backpackPanel.remove(); this.backpackPanel = null; }
  }

  private openAbilities() {
    if (this.abilitiesPanel) return;
    const selected = getSelectedAbility();

    this.abilitiesPanel = document.createElement('div');
    this.abilitiesPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #ff6644; border-radius: 8px;
      padding: 24px; z-index: 3000; font-family: monospace; color: #ff6644;
      width: 380px;
    `;

    const renderPanel = () => {
      if (!this.abilitiesPanel) return;
      const currentSelected = getSelectedAbility();
      this.abilitiesPanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0; color:#ff6644; font-size:20px;">ABILITIES</h3>
          <button id="ab-close" style="background:none; border:2px solid #ff4444; color:#ff4444; font-family:monospace; font-size:22px; cursor:pointer; padding:2px 10px; border-radius:4px; line-height:1; transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#ff4444';this.style.color='#000'" onmouseout="this.style.background='none';this.style.color='#ff4444'">✕</button>
        </div>
        <p style="color:#888; font-size:12px; margin:0 0 16px 0;">Choose one ability to use in game (press F)</p>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${ABILITIES.map(a => {
            const isSelected = a.id === currentSelected;
            return `
              <div class="ab-card" data-id="${a.id}" style="
                display:flex; align-items:center; gap:12px; padding:12px;
                border:2px solid ${isSelected ? a.color : '#333'}; border-radius:6px;
                background:${isSelected ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)'};
                cursor:pointer; transition: border-color 0.2s, background 0.2s;
              ">
                <span style="font-size:32px; min-width:40px; text-align:center;">${a.emoji}</span>
                <div style="flex:1;">
                  <div style="color:${a.color}; font-size:16px; font-weight:bold; margin-bottom:4px;">
                    ${a.name} ${isSelected ? '✓' : ''}
                  </div>
                  <div style="color:#999; font-size:11px; line-height:1.3;">${a.description}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Event listeners
      this.abilitiesPanel!.querySelector('#ab-close')!.addEventListener('click', () => this.closeAbilities());
      this.abilitiesPanel!.querySelectorAll('.ab-card').forEach(el => {
        el.addEventListener('click', () => {
          const id = (el as HTMLElement).dataset.id!;
          setSelectedAbility(id);
          renderPanel();
        });
        el.addEventListener('mouseover', () => {
          if ((el as HTMLElement).dataset.id !== getSelectedAbility()) {
            (el as HTMLElement).style.borderColor = '#666';
          }
        });
        el.addEventListener('mouseout', () => {
          const id = (el as HTMLElement).dataset.id!;
          (el as HTMLElement).style.borderColor = id === getSelectedAbility() ? ABILITIES.find(a => a.id === id)!.color : '#333';
        });
      });
    };

    document.body.appendChild(this.abilitiesPanel);
    this.abilitiesPanel.addEventListener('keydown', (e) => e.stopPropagation());
    renderPanel();
  }

  private closeAbilities() {
    if (this.abilitiesPanel) { this.abilitiesPanel.remove(); this.abilitiesPanel = null; }
  }
}
