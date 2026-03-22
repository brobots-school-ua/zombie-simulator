import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';
import { AdminConsole } from '../systems/AdminConsole';
import { ACCESSORIES, shop } from '../systems/ShopConfig';
import { bestiary } from '../systems/BestiaryManager';

// Atmospheric main menu scene
export class MenuScene extends Phaser.Scene {
  private nicknameInput!: HTMLInputElement;
  private adminConsole!: AdminConsole;
  private shopPanel: HTMLDivElement | null = null;
  private bestiaryPanel: HTMLDivElement | null = null;
  private coinsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    const CX = width / 2;

    this.cameras.main.setBackgroundColor('#0a0a0a');
    audioManager.init();
    audioManager.startMenuMusic();

    // Fog
    for (let i = 0; i < 12; i++) {
      const fog = this.add.image(
        Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'fog-particle'
      ).setAlpha(Phaser.Math.FloatBetween(0.1, 0.3)).setScale(Phaser.Math.FloatBetween(1.5, 3));
      this.tweens.add({ targets: fog, x: fog.x + Phaser.Math.Between(-200, 200), y: fog.y + Phaser.Math.Between(-100, 100), alpha: Phaser.Math.FloatBetween(0.05, 0.2), duration: Phaser.Math.Between(4000, 8000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Zombie silhouettes
    for (let i = 0; i < 6; i++) {
      const z = this.add.image(Phaser.Math.Between(-40, width + 40), Phaser.Math.Between(height * 0.3, height * 0.85), 'menu-zombie').setAlpha(Phaser.Math.FloatBetween(0.15, 0.35)).setScale(Phaser.Math.FloatBetween(1.2, 2.5));
      this.tweens.add({ targets: z, x: z.x + Phaser.Math.Between(100, 300) * (Math.random() > 0.5 ? 1 : -1), duration: Phaser.Math.Between(6000, 12000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Vignette
    const vig = this.add.graphics();
    vig.fillStyle(0x110000, 0.4);
    vig.fillRect(0, 0, width, 60); vig.fillRect(0, height - 60, width, 60);
    vig.fillRect(0, 0, 60, height); vig.fillRect(width - 60, 0, 60, height);
    vig.setDepth(1);

    // ============ CENTER — Title + Nickname + START ============

    // Title
    const title = this.add.text(CX, 80, 'ZOMBIE\nSIMULATOR', {
      fontSize: '80px', fontFamily: 'monospace', color: '#ff2222',
      align: 'center', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 25, fill: true },
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: title, alpha: { from: 1, to: 0.3 }, duration: 80, yoyo: true, repeat: -1, repeatDelay: Phaser.Math.Between(1500, 4000), hold: 40 });

    // Subtitle
    const sub = this.add.text(CX, 210, 'Survive the horde', {
      fontSize: '22px', fontFamily: 'monospace', color: '#668866', fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: sub, alpha: 1, duration: 2000, delay: 500 });

    // Nickname
    this.add.text(CX, 260, 'Nickname (optional)', {
      fontSize: '13px', fontFamily: 'monospace', color: '#556655',
    }).setOrigin(0.5).setDepth(10);
    this.createNicknameInput(CX, 285);

    // START button — big, center
    const startBtn = this.add.text(CX, 370, '[ START GAME ]', {
      fontSize: '48px', fontFamily: 'monospace', color: '#555555',
      shadow: { offsetX: 0, offsetY: 0, color: '#333333', blur: 5, fill: true },
    }).setOrigin(0.5).setDepth(10);

    let ready = false;
    this.time.delayedCall(1200, () => {
      ready = true;
      startBtn.setColor('#44ff44');
      startBtn.setShadow(0, 0, '#00ff00', 15, true);
      startBtn.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: startBtn, scaleX: 1.03, scaleY: 1.03, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    startBtn.on('pointerover', () => { if (ready) { startBtn.setColor('#88ff88'); startBtn.setScale(1.1); } });
    startBtn.on('pointerout', () => { if (ready) { startBtn.setColor('#44ff44'); startBtn.setScale(1); } });
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

    // ============ LEFT SIDE — Square buttons ============
    const btnSize = 80;
    const btnY = height - 60;
    const btnStyle = { fontSize: '11px', fontFamily: 'monospace', align: 'center' as const };

    // SHOP button (square)
    const shopBg = this.add.graphics().setDepth(10);
    shopBg.fillStyle(0x1a1a0a); shopBg.fillRoundedRect(20, btnY - btnSize, btnSize, btnSize, 6);
    shopBg.lineStyle(2, 0xffcc22); shopBg.strokeRoundedRect(20, btnY - btnSize, btnSize, btnSize, 6);
    const shopBtn = this.add.text(20 + btnSize / 2, btnY - btnSize / 2, 'SHOP', {
      ...btnStyle, fontSize: '16px', color: '#ffcc22',
    }).setOrigin(0.5).setDepth(11);
    const shopZone = this.add.zone(20 + btnSize / 2, btnY - btnSize / 2, btnSize, btnSize)
      .setInteractive({ useHandCursor: true }).setDepth(12);
    shopZone.on('pointerover', () => { shopBg.clear(); shopBg.fillStyle(0x2a2a1a); shopBg.fillRoundedRect(20, btnY - btnSize, btnSize, btnSize, 6); shopBg.lineStyle(2, 0xffee66); shopBg.strokeRoundedRect(20, btnY - btnSize, btnSize, btnSize, 6); });
    shopZone.on('pointerout', () => { shopBg.clear(); shopBg.fillStyle(0x1a1a0a); shopBg.fillRoundedRect(20, btnY - btnSize, btnSize, btnSize, 6); shopBg.lineStyle(2, 0xffcc22); shopBg.strokeRoundedRect(20, btnY - btnSize, btnSize, btnSize, 6); });
    shopZone.on('pointerdown', () => this.openShop());

    // VOLUME button (square)
    const volBg = this.add.graphics().setDepth(10);
    volBg.fillStyle(0x0a1a0a); volBg.fillRoundedRect(20 + btnSize + 10, btnY - btnSize, btnSize, btnSize, 6);
    volBg.lineStyle(2, 0x44ff44); volBg.strokeRoundedRect(20 + btnSize + 10, btnY - btnSize, btnSize, btnSize, 6);
    const volX = 20 + btnSize + 10;
    this.add.text(volX + btnSize / 2, btnY - btnSize / 2 - 10, 'VOL', {
      ...btnStyle, fontSize: '14px', color: '#44ff44',
    }).setOrigin(0.5).setDepth(11);
    this.createVolumeSlider(volX + btnSize / 2, btnY - btnSize / 2 + 12, btnSize - 16);

    // BESTIARY button (square)
    const bestBg = this.add.graphics().setDepth(10);
    const bestX = 20 + (btnSize + 10) * 2;
    bestBg.fillStyle(0x1a0a1a); bestBg.fillRoundedRect(bestX, btnY - btnSize, btnSize, btnSize, 6);
    bestBg.lineStyle(2, 0xcc44ff); bestBg.strokeRoundedRect(bestX, btnY - btnSize, btnSize, btnSize, 6);
    this.add.text(bestX + btnSize / 2, btnY - btnSize / 2, 'BEST\nIARY', {
      ...btnStyle, fontSize: '13px', color: '#cc44ff', align: 'center',
    }).setOrigin(0.5).setDepth(11);
    const bestZone = this.add.zone(bestX + btnSize / 2, btnY - btnSize / 2, btnSize, btnSize)
      .setInteractive({ useHandCursor: true }).setDepth(12);
    bestZone.on('pointerover', () => { bestBg.clear(); bestBg.fillStyle(0x2a1a2a); bestBg.fillRoundedRect(bestX, btnY - btnSize, btnSize, btnSize, 6); bestBg.lineStyle(2, 0xee66ff); bestBg.strokeRoundedRect(bestX, btnY - btnSize, btnSize, btnSize, 6); });
    bestZone.on('pointerout', () => { bestBg.clear(); bestBg.fillStyle(0x1a0a1a); bestBg.fillRoundedRect(bestX, btnY - btnSize, btnSize, btnSize, 6); bestBg.lineStyle(2, 0xcc44ff); bestBg.strokeRoundedRect(bestX, btnY - btnSize, btnSize, btnSize, 6); });
    bestZone.on('pointerdown', () => this.openBestiary());

    // ============ RIGHT SIDE — Stats ============
    const RX = width - 30;

    // Coins
    this.coinsText = this.add.text(RX, 230, `Coins: ${shop.getCoins()}`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffcc22',
    }).setOrigin(1, 0).setDepth(10);

    // Personal best
    const best = leaderboard.getPersonalBest();
    if (best > 0) {
      this.add.text(RX, 258, `Your best: ${best}`, {
        fontSize: '15px', fontFamily: 'monospace', color: '#ffaa00',
      }).setOrigin(1, 0).setDepth(10);
    }

    // Leaderboard
    this.createMenuLeaderboard(RX, 295);

    // ============ BOTTOM CENTER — Controls ============
    const ctrl = this.add.text(CX, height - 20, 'WASD — move  |  MOUSE — aim & shoot  |  R — reload  |  1-5 — switch weapon', {
      fontSize: '12px', fontFamily: 'monospace', color: '#444444',
    }).setOrigin(0.5, 1).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: ctrl, alpha: 0.7, duration: 1500, delay: 1000 });

    // Version
    this.add.text(width - 10, height - 8, 'v1.1', {
      fontSize: '11px', fontFamily: 'monospace', color: '#222222',
    }).setOrigin(1, 1).setDepth(10);

    // Admin console
    this.adminConsole = new AdminConsole(this);

    this.events.on('shutdown', () => {
      if (this.nicknameInput) this.nicknameInput.remove();
      this.closeShop();
      this.closeBestiary();
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

  private createMenuLeaderboard(rightX: number, startY: number) {
    const top5 = leaderboard.getTop(5);
    if (top5.length === 0) {
      this.add.text(rightX, startY, 'No scores yet', {
        fontSize: '14px', fontFamily: 'monospace', color: '#555544',
      }).setOrigin(1, 0).setDepth(10);
      return;
    }
    this.add.text(rightX, startY, 'LEADERBOARD', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffaa00', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(10);
    top5.forEach((entry, i) => {
      this.add.text(rightX, startY + 24 + i * 20, `${i + 1}. ${entry.name} — ${entry.score}`, {
        fontSize: '14px', fontFamily: 'monospace', color: '#aa8844',
      }).setOrigin(1, 0).setDepth(10);
    });
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

    const volToX = (vol: number) => sliderX + ((vol - 0.25) / 1.75) * sliderW;
    const xToVol = (x: number) => 0.25 + ((x - sliderX) / sliderW) * 1.75;
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
}
