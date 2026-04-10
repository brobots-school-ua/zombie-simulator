import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';
import { AdminConsole } from '../systems/AdminConsole';
import { ACCESSORIES, shop } from '../systems/ShopConfig';
import { bestiary } from '../systems/BestiaryManager';
import { ABILITIES, getSelectedAbility, setSelectedAbility } from '../systems/AbilityConfig';
import { EQUIPMENT, equipment } from '../systems/EquipmentConfig';
import { profile } from '../systems/ProfileManager';
import { CRAFT_RECIPES } from '../systems/CraftingConfig';

// Atmospheric main menu scene
export class MenuScene extends Phaser.Scene {
  private nicknameInput!: HTMLInputElement;
  private adminConsole!: AdminConsole;
  private shopPanel: HTMLDivElement | null = null;
  private bestiaryPanel: HTMLDivElement | null = null;
  private backpackPanel: HTMLDivElement | null = null;
  private abilitiesPanel: HTMLDivElement | null = null;
  private equipmentPanel: HTMLDivElement | null = null;
  private workshopPanel: HTMLDivElement | null = null;
  private killsText!: Phaser.GameObjects.Text;
  private settingsOpen = false;
  private settingsObjects: Phaser.GameObjects.GameObject[] = [];

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
      if (this.shopPanel || this.bestiaryPanel || this.backpackPanel || this.abilitiesPanel || this.equipmentPanel || this.workshopPanel) return;
      starting = true; startBtn.disableInteractive();
      if (this.nicknameInput) {
        const name = this.nicknameInput.value.trim();
        if (name) { profile.setNickname(name); leaderboard.setNickname(name); }
        this.nicknameInput.remove();
      }
      if (this.saveNickBtn) { this.saveNickBtn.remove(); this.saveNickBtn = null; }
      if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
      if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
      audioManager.resume(); audioManager.stopMenuMusic(0.5); audioManager.stopGameMusic(0);
      this.cameras.main.flash(300, 255, 50, 50);
      this.time.delayedCall(300, () => this.scene.start('GameScene'));
    });

    // ============ BOTTOM — Wider buttons with full labels ============
    const btnW = 105;
    const btnH = 50;
    const btnGap = 6;
    const btnY = height - 30;
    const btnCount = 6;
    const totalBtnsW = btnW * btnCount + btnGap * (btnCount - 1);
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

    makeBtn(0, 'WORKSHOP', 0xff8844, 0x1a1a0a, 0x2a1a0a, 0xffaa66, () => this.openWorkshop());
    makeBtn(1, 'ACCESS.', 0xffcc22, 0x1a1a0a, 0x2a2a1a, 0xffee66, () => this.openShop());
    makeBtn(2, 'BESTIARY', 0xcc44ff, 0x1a0a1a, 0x2a1a2a, 0xee66ff, () => this.openBestiary());
    makeBtn(3, 'STASH', 0x88aa44, 0x0a1a0a, 0x1a2a1a, 0xaacc66, () => this.openBackpack());
    makeBtn(4, 'ABILITIES', 0xff6644, 0x1a1a0a, 0x2a1a0a, 0xff8866, () => this.openAbilities());
    makeBtn(5, 'EQUIP', 0x44bbff, 0x0a1a2a, 0x1a2a3a, 0x66ddff, () => this.openEquipment());

    // ESC hint near bottom buttons
    this.add.text(btnStartX - 15, btnY - btnH / 2, '[ESC] Settings', {
      fontSize: '11px', fontFamily: 'monospace', color: '#555555',
    }).setOrigin(1, 0.5).setDepth(10);

    // ESC key — open settings overlay
    this.createSettingsOverlay();
    const escKey = this.input.keyboard!.addKey('ESC');
    escKey.on('down', () => this.toggleSettingsOverlay());

    // ============ RIGHT SIDE — Stats with panel ============
    const RX = width - 30;

    // Coins panel
    const statsBg = this.add.graphics().setDepth(8);
    statsBg.fillStyle(0x000000, 0.4);
    statsBg.fillRoundedRect(RX - 160, 230, 170, 50, 8);
    statsBg.lineStyle(1, 0xffcc22, 0.3);
    statsBg.strokeRoundedRect(RX - 160, 230, 170, 50, 8);

    // Coins (with icon)
    this.add.image(RX - 140, 255, 'skull-icon').setDepth(10).setScale(1.5);
    this.killsText = this.add.text(RX - 122, 246, `${shop.getKills()}`, {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffcc22',
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 6, fill: true },
    }).setOrigin(0, 0).setDepth(10);

    // ============ BOTTOM CENTER — Controls ============
    const ctrlBg = this.add.graphics().setDepth(8);
    ctrlBg.fillStyle(0x000000, 0.3);
    ctrlBg.fillRoundedRect(CX - 350, height - 30, 700, 22, 4);
    const ctrl = this.add.text(CX, height - 19, 'WASD — move  |  SHIFT — sprint  |  MOUSE — shoot  |  R — reload  |  1-6 — weapon  |  F — ability', {
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
      this.closeEquipment();
      this.closeWorkshop();
      this.adminConsole.destroy();
    });
  }

  update() {
    if (this.killsText) this.killsText.setText(`Kills: ${shop.getKills()}`);
  }

  private saveNickBtn: HTMLButtonElement | null = null;

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
    this.nicknameInput.value = profile.getNickname();
    this.nicknameInput.style.cssText = `
      position: absolute; left: ${rect.left + (centerX - inputW / 2) * scaleX}px;
      top: ${rect.top + centerY * scaleY}px; width: ${inputW * scaleX}px; height: ${inputH * scaleY}px;
      background: rgba(0,0,0,0.7); border: 1px solid #44ff44; color: #44ff44;
      font-family: monospace; font-size: ${15 * scaleY}px; text-align: center;
      outline: none; border-radius: 4px; z-index: 1000;
    `;
    document.body.appendChild(this.nicknameInput);

    // Save button under nickname
    this.saveNickBtn = document.createElement('button');
    const btnW = 100, btnH = 26;
    this.saveNickBtn.textContent = profile.hasProfile() ? '\u2713 Saved' : 'Save';
    this.saveNickBtn.style.cssText = `
      position: absolute; left: ${rect.left + (centerX - btnW / 2) * scaleX}px;
      top: ${rect.top + (centerY + inputH + 6) * scaleY}px; width: ${btnW * scaleX}px; height: ${btnH * scaleY}px;
      background: ${profile.hasProfile() ? '#1a3a1a' : '#0a1a0a'}; border: 1px solid #44ff44; color: #44ff44;
      font-family: monospace; font-size: ${12 * scaleY}px; cursor: pointer;
      border-radius: 4px; z-index: 1000;
    `;
    this.saveNickBtn.addEventListener('click', () => {
      const name = this.nicknameInput?.value.trim() || '';
      if (!name) return;
      profile.setNickname(name);
      leaderboard.setNickname(name);
      if (this.saveNickBtn) {
        this.saveNickBtn.textContent = '\u2713 Saved';
        this.saveNickBtn.style.background = '#1a3a1a';
      }
      // Update kills display
      if (this.killsText) this.killsText.setText(`${shop.getKills()}`);
    });
    document.body.appendChild(this.saveNickBtn);
  }

  private openShop() {
    if (this.shopPanel) return;
    // Accessories are managed by ProfileManager now

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
            <p style="color:#ffdd44; margin:0 0 6px 0;">Kills: ${shop.getKills()}</p>
            <p style="color:#888; margin:0; font-size:11px;">${equipped ? 'Wearing: ' + ACCESSORIES.find(a => a.id === equipped)?.name : 'No accessory equipped'}</p>
          </div>
        </div>
        <div id="shop-items">
        ${ACCESSORIES.map(acc => {
          const owned = shop.owns(acc.id);
          const isEquipped = equipped === acc.id;
          const canBuy = shop.getKills() >= acc.price;
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
          if (action === 'buy') { if (!shop.buy(id)) alert('Not enough Kills!'); renderShop(); }
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


  private createSettingsOverlay() {
    // Settings overlay is created once but hidden
    const { width, height } = this.scale;
    const panelW = 320;
    const panelH = 180;
    const px = (width - panelW) / 2;
    const py = (height - panelH) / 2;

    // Dim background
    const dimBg = this.add.graphics().setDepth(500).setVisible(false);
    dimBg.fillStyle(0x000000, 0.6);
    dimBg.fillRect(0, 0, width, height);
    const dimZone = this.add.zone(width / 2, height / 2, width, height)
      .setInteractive().setDepth(500).setVisible(false);
    dimZone.on('pointerdown', () => this.toggleSettingsOverlay());

    // Panel background
    const panelBg = this.add.graphics().setDepth(501).setVisible(false);
    panelBg.fillStyle(0x111811, 0.95);
    panelBg.fillRoundedRect(px, py, panelW, panelH, 12);
    panelBg.lineStyle(2, 0x44ff44, 0.5);
    panelBg.strokeRoundedRect(px, py, panelW, panelH, 12);

    // Title
    const title = this.add.text(width / 2, py + 25, 'SETTINGS', {
      fontSize: '22px', fontFamily: 'monospace', color: '#44ff44', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(502).setVisible(false);

    // Close button (X)
    const closeBtn = this.add.text(px + panelW - 20, py + 12, '✕', {
      fontSize: '20px', fontFamily: 'monospace', color: '#ff4444',
    }).setOrigin(0.5).setDepth(502).setVisible(false).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleSettingsOverlay());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff8888'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff4444'));

    // Volume label
    const volLabel = this.add.text(px + 30, py + 65, 'Volume', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setDepth(502).setVisible(false);

    // Volume slider
    const sliderW = 160;
    const sliderX = px + 110;
    const sliderY = py + 75;
    const trackGfx = this.add.graphics().setDepth(502).setVisible(false);
    trackGfx.fillStyle(0x333333);
    trackGfx.fillRoundedRect(sliderX, sliderY - 2, sliderW, 4, 2);

    const sliderGfx = this.add.graphics().setDepth(503).setVisible(false);
    const pctText = this.add.text(sliderX + sliderW + 15, sliderY, `${audioManager.getVolumePercent()}%`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#44ff44',
    }).setOrigin(0, 0.5).setDepth(502).setVisible(false);

    const volToX = (vol: number) => sliderX + (vol / 2.0) * sliderW;
    const xToVol = (x: number) => ((x - sliderX) / sliderW) * 2.0;
    const draw = (vol: number) => {
      const kx = volToX(vol); sliderGfx.clear();
      sliderGfx.fillStyle(0x44ff44); sliderGfx.fillRoundedRect(sliderX, sliderY - 2, kx - sliderX, 4, 2);
      sliderGfx.fillStyle(0x88ff88); sliderGfx.fillCircle(kx, sliderY, 7);
      sliderGfx.fillStyle(0x44ff44); sliderGfx.fillCircle(kx, sliderY, 5);
      pctText.setText(`${audioManager.getVolumePercent()}%`);
    };
    draw(audioManager.getVolume());

    const hitZone = this.add.zone(sliderX + sliderW / 2, sliderY, sliderW + 20, 28)
      .setInteractive({ useHandCursor: true }).setDepth(504).setVisible(false);
    let dragging = false;
    hitZone.on('pointerdown', (p: Phaser.Input.Pointer) => { dragging = true; const v = xToVol(Phaser.Math.Clamp(p.x, sliderX, sliderX + sliderW)); audioManager.setVolume(v); draw(v); });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (!dragging) return; const v = xToVol(Phaser.Math.Clamp(p.x, sliderX, sliderX + sliderW)); audioManager.setVolume(v); draw(v); });
    this.input.on('pointerup', () => { dragging = false; });

    // ESC hint
    const escHint = this.add.text(width / 2, py + panelH - 25, 'Press ESC to close', {
      fontSize: '11px', fontFamily: 'monospace', color: '#555555',
    }).setOrigin(0.5).setDepth(502).setVisible(false);

    this.settingsObjects = [dimBg, dimZone, panelBg, title, closeBtn, volLabel, trackGfx, sliderGfx, pctText, hitZone, escHint];
  }

  private toggleSettingsOverlay() {
    // Don't open if a panel is active
    if (!this.settingsOpen && (this.shopPanel || this.bestiaryPanel || this.backpackPanel || this.abilitiesPanel || this.equipmentPanel || this.workshopPanel)) return;
    this.settingsOpen = !this.settingsOpen;
    for (const obj of this.settingsObjects) {
      (obj as any).setVisible(this.settingsOpen);
    }
    // Hide/show HTML elements so they don't overlap
    if (this.nicknameInput) this.nicknameInput.style.display = this.settingsOpen ? 'none' : '';
    if (this.saveNickBtn) this.saveNickBtn.style.display = this.settingsOpen ? 'none' : '';
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

    this.backpackPanel = document.createElement('div');
    this.backpackPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #ffcc22; border-radius: 8px;
      padding: 20px; z-index: 3000; font-family: monospace; color: #ffcc22;
      width: 480px;
    `;

    const btnOn = `padding:4px 12px; background:#1a2a1a; border:1px solid #44ff44; color:#44ff44; font-family:monospace; font-size:16px; cursor:pointer; border-radius:3px;`;
    const btnOff = `padding:4px 12px; background:#111; border:1px solid #333; color:#333; font-family:monospace; font-size:16px; border-radius:3px; cursor:default;`;

    const render = () => {
      if (!this.backpackPanel) return;
      const m = profile.getMaterials();
      const s = profile.getStash();

      const row = (label: string, color: string, icon: string, key: string, invCount: number, stashCount: number) => `
        <div style="display:flex; align-items:center; padding:5px 0;">
          <span style="color:${color}; font-size:14px; width:16px; text-align:center;">${icon}</span>
          <span style="color:#ddd; width:65px; font-size:12px;">${label}</span>
          <span style="color:#88aa44; width:30px; text-align:right; font-weight:bold; font-size:15px;">${invCount}</span>
          <div style="flex:1; display:flex; justify-content:center; gap:8px;">
            <button class="stash-to-stash" data-key="${key}" style="${invCount > 0 ? btnOn : btnOff}" ${invCount <= 0 ? 'disabled' : ''}>&#8594;</button>
            <button class="stash-to-inv" data-key="${key}" style="${stashCount > 0 ? btnOn : btnOff}" ${stashCount <= 0 ? 'disabled' : ''}>&#8592;</button>
          </div>
          <span style="color:#ffcc22; width:30px; font-weight:bold; font-size:15px;">${stashCount}</span>
          <span style="color:#ddd; width:65px; text-align:right; font-size:12px;">${label}</span>
          <span style="color:${color}; font-size:14px; width:16px; text-align:center;">${icon}</span>
        </div>`;

      this.backpackPanel!.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <button id="bp-close" style="background:none; border:2px solid #ff4444; color:#ff4444; font-family:monospace; font-size:22px; cursor:pointer; padding:2px 10px; border-radius:4px; line-height:1;">&#10005;</button>
        </div>
        <div style="display:flex; margin-bottom:6px;">
          <span style="color:#88aa44; font-size:13px; font-weight:bold;">INVENTORY</span>
          <span style="flex:1; display:flex; justify-content:center; align-items:center; gap:4px;">
            <span style="color:#aaa; font-size:11px;">кількість:</span>
            <input id="stash-amount" type="number" min="1" value="1" style="width:52px; background:#111; border:1px solid #555; color:#fff; font-family:monospace; font-size:13px; text-align:center; padding:2px 4px; border-radius:3px;">
          </span>
          <span style="color:#ffcc22; font-size:13px; font-weight:bold;">STASH</span>
        </div>
        <div style="border:1px solid #333; border-radius:6px; padding:8px; background:rgba(0,0,0,0.3); display:flex; flex-direction:column; gap:4px;">
          ${row('Bandages', '#44ff44', '+', 'bandages', 0, s.bandages)}
          ${row('Medkits', '#ff4444', '+', 'medkits', 0, s.medkits)}
          ${row('Wood', '#8b5a2b', '\u25a0', 'wood', m.wood, s.wood)}
          ${row('Metal', '#999', '\u25a0', 'metal', m.metal, s.metal)}
          ${row('Screws', '#777', '\u2699', 'screws', m.screws, s.screws)}
        </div>
        <p style="color:#555; font-size:10px; margin:8px 0 0 0; text-align:center;">Stash is safe between games</p>
      `;

      this.backpackPanel!.querySelector('#bp-close')!.addEventListener('click', () => this.closeBackpack());

      const getAmount = () => {
        const inp = this.backpackPanel!.querySelector('#stash-amount') as HTMLInputElement;
        return Math.max(1, parseInt(inp?.value || '1', 10) || 1);
      };

      // Move from inventory to stash
      this.backpackPanel!.querySelectorAll('.stash-to-stash').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = (btn as HTMLElement).dataset.key!;
          const n = getAmount();
          const mat = profile.getMaterials();
          const st = profile.getStash();
          if (key === 'wood')    { const t = Math.min(n, mat.wood);    mat.wood    -= t; st.wood    += t; }
          else if (key === 'metal')   { const t = Math.min(n, mat.metal);   mat.metal   -= t; st.metal   += t; }
          else if (key === 'screws')  { const t = Math.min(n, mat.screws);  mat.screws  -= t; st.screws  += t; }
          else if (key === 'bandages') { st.bandages += n; }
          else if (key === 'medkits')  { st.medkits  += n; }
          else return;
          profile.setMaterials(mat);
          profile.setStash(st);
          render();
        });
      });

      // Move from stash to inventory
      this.backpackPanel!.querySelectorAll('.stash-to-inv').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = (btn as HTMLElement).dataset.key!;
          const n = getAmount();
          const mat = profile.getMaterials();
          const st = profile.getStash();
          if (key === 'wood')    { const t = Math.min(n, st.wood);    st.wood    -= t; mat.wood    += t; }
          else if (key === 'metal')   { const t = Math.min(n, st.metal);   st.metal   -= t; mat.metal   += t; }
          else if (key === 'screws')  { const t = Math.min(n, st.screws);  st.screws  -= t; mat.screws  += t; }
          else if (key === 'bandages') { const t = Math.min(n, st.bandages); st.bandages -= t; }
          else if (key === 'medkits')  { const t = Math.min(n, st.medkits);  st.medkits  -= t; }
          else return;
          profile.setMaterials(mat);
          profile.setStash(st);
          render();
        });
      });
    };

    document.body.appendChild(this.backpackPanel);
    this.backpackPanel.addEventListener('keydown', (e) => e.stopPropagation());
    render();
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

  private openEquipment() {
    if (this.equipmentPanel) return;

    this.equipmentPanel = document.createElement('div');
    this.equipmentPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #44bbff; border-radius: 8px;
      padding: 24px; z-index: 3000; font-family: monospace; color: #44bbff;
      width: 440px; max-height: 85vh; overflow-y: auto;
    `;

    const renderPanel = () => {
      if (!this.equipmentPanel) return;
      const kills = shop.getKills();
      const equipped = equipment.getEquipped();
      const baseHp = 100;
      const baseSpeed = 150;
      const hpBonus = equipment.getHpBonus();
      const speedMult = equipment.getSpeedMultiplier();

      const renderSlot = (slot: 'helmet' | 'belt', title: string, emoji: string) => {
        const items = EQUIPMENT.filter(e => e.slot === slot);
        const equippedId = equipped[slot];
        return `
          <div style="margin-bottom:16px;">
            <div style="color:#44bbff; font-size:16px; font-weight:bold; margin-bottom:8px;">${emoji} ${title}</div>
            ${items.map(item => {
              const owned = equipment.owns(item.id);
              const isEquipped = equippedId === item.id;
              const canBuy = kills >= item.price;
              let btn = '';
              if (isEquipped) {
                btn = `<button class="eq-btn" data-action="unequip" data-slot="${slot}" style="padding:4px 10px; background:#333; border:1px solid #44bbff; color:#44bbff; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px;">Equipped ✓</button>`;
              } else if (owned) {
                btn = `<button class="eq-btn" data-action="equip" data-id="${item.id}" style="padding:4px 10px; background:#1a2a3a; border:1px solid #44bbff; color:#44bbff; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px;">Equip</button>`;
              } else {
                btn = `<button class="eq-btn" data-action="buy" data-id="${item.id}" style="padding:4px 10px; background:${canBuy ? '#2a2a1a' : '#222'}; border:1px solid ${canBuy ? '#ffcc22' : '#555'}; color:${canBuy ? '#ffcc22' : '#555'}; font-family:monospace; cursor:pointer; border-radius:3px; font-size:11px;" ${canBuy ? '' : 'disabled'}>${item.price} Kills</button>`;
              }
              return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; margin:3px 0; border:1px solid ${isEquipped ? '#44bbff' : '#333'}; border-radius:4px; background:${isEquipped ? 'rgba(68,187,255,0.1)' : 'rgba(0,0,0,0.3)'};">
                  <div>
                    <span style="color:#ddd;">${item.name}</span>
                    <span style="color:#888; font-size:11px; margin-left:6px;">${item.description}</span>
                  </div>
                  ${btn}
                </div>`;
            }).join('')}
          </div>`;
      };

      this.equipmentPanel!.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; color:#44bbff; font-size:20px;">EQUIPMENT</h3>
          <button id="eq-close" style="background:none; border:2px solid #ff4444; color:#ff4444; font-family:monospace; font-size:22px; cursor:pointer; padding:2px 10px; border-radius:4px; line-height:1; transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#ff4444';this.style.color='#000'" onmouseout="this.style.background='none';this.style.color='#ff4444'">✕</button>
        </div>

        <div style="display:flex; gap:16px; margin-bottom:16px; padding:10px; border:1px solid #333; border-radius:6px; background:rgba(68,187,255,0.05);">
          <div style="flex:1; text-align:center;">
            <div style="color:#888; font-size:11px;">HP</div>
            <div style="color:#ff4444; font-size:20px; font-weight:bold;">${baseHp + hpBonus}</div>
            ${hpBonus > 0 ? `<div style="color:#44ff44; font-size:10px;">+${hpBonus}</div>` : ''}
          </div>
          <div style="flex:1; text-align:center;">
            <div style="color:#888; font-size:11px;">Walk Speed</div>
            <div style="color:#44bbff; font-size:20px; font-weight:bold;">${Math.round(baseSpeed * speedMult)}</div>
            ${speedMult > 1 ? `<div style="color:#44ff44; font-size:10px;">×${speedMult}</div>` : ''}
          </div>
          <div style="flex:1; text-align:center;">
            <div style="color:#888; font-size:11px;">Sprint Speed</div>
            <div style="color:#ffaa44; font-size:20px; font-weight:bold;">${Math.round(baseSpeed * 2 * speedMult)}</div>
            ${speedMult > 1 ? `<div style="color:#44ff44; font-size:10px;">×${speedMult}</div>` : ''}
          </div>
        </div>

        <p style="color:#ffcc22; margin:0 0 12px 0; font-size:13px;">Kills: ${kills}</p>

        ${renderSlot('helmet', 'Helmet', '🪖')}
        ${renderSlot('belt', 'Belt', '🔗')}
      `;

      // Event listeners
      this.equipmentPanel!.querySelector('#eq-close')!.addEventListener('click', () => this.closeEquipment());
      this.equipmentPanel!.querySelectorAll('.eq-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const el = btn as HTMLElement;
          const action = el.dataset.action;
          const id = el.dataset.id || '';
          const slot = el.dataset.slot as 'helmet' | 'belt';
          if (action === 'buy') {
            if (equipment.buy(id, shop.getKills())) {
              shop.addKills(-EQUIPMENT.find(i => i.id === id)!.price);
            }
            renderPanel();
          }
          if (action === 'equip') { equipment.equip(id); renderPanel(); }
          if (action === 'unequip') { equipment.unequip(slot); renderPanel(); }
        });
      });
    };

    document.body.appendChild(this.equipmentPanel);
    this.equipmentPanel.addEventListener('keydown', (e) => e.stopPropagation());
    renderPanel();
  }

  private closeEquipment() {
    if (this.equipmentPanel) { this.equipmentPanel.remove(); this.equipmentPanel = null; }
  }

  private openWorkshop() {
    if (this.workshopPanel) return;

    this.workshopPanel = document.createElement('div');
    this.workshopPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #ff8844; border-radius: 8px;
      padding: 24px; z-index: 3000; font-family: monospace; color: #ff8844;
      width: 500px; max-height: 85vh; overflow-y: auto;
    `;

    const renderPanel = () => {
      if (!this.workshopPanel) return;
      const kills = shop.getKills();
      const mat = profile.getMaterials();

      this.workshopPanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; color:#ff8844; font-size:20px;">WORKSHOP</h3>
          <button id="ws-close" style="background:none; border:2px solid #ff4444; color:#ff4444; font-family:monospace; font-size:22px; cursor:pointer; padding:2px 10px; border-radius:4px; line-height:1; transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#ff4444';this.style.color='#000'" onmouseout="this.style.background='none';this.style.color='#ff4444'">&#10005;</button>
        </div>

        <div style="display:flex; gap:16px; margin-bottom:16px; padding:10px; border:1px solid #333; border-radius:6px; background:rgba(255,136,68,0.05);">
          <div style="flex:1; text-align:center;">
            <div style="color:#888; font-size:11px;">Kills</div>
            <div style="color:#ffcc22; font-size:18px; font-weight:bold;">${kills}</div>
          </div>
          <div style="flex:1; text-align:center;">
            <div style="color:#888; font-size:11px;">Wood</div>
            <div style="color:#8b5a2b; font-size:18px; font-weight:bold;">${mat.wood}</div>
          </div>
          <div style="flex:1; text-align:center;">
            <div style="color:#888; font-size:11px;">Metal</div>
            <div style="color:#999; font-size:18px; font-weight:bold;">${mat.metal}</div>
          </div>
          <div style="flex:1; text-align:center;">
            <div style="color:#888; font-size:11px;">Screws</div>
            <div style="color:#777; font-size:18px; font-weight:bold;">${mat.screws}</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${CRAFT_RECIPES.map(r => {
            const unlocked = profile.isWeaponUnlocked(r.weaponId);
            const canCraft = !unlocked && kills >= r.kills && mat.wood >= r.wood && mat.metal >= r.metal && mat.screws >= r.screws;
            const costColor = (have: number, need: number) => have >= need ? '#44ff44' : '#ff4444';

            if (unlocked) {
              return `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid #44ff44; border-radius:4px; background:rgba(68,255,68,0.05);">
                <span style="color:#44ff44; font-size:14px;">${r.name}</span>
                <span style="color:#44ff44; font-size:12px;">CRAFTED &#10003;</span>
              </div>`;
            }

            return `<div style="padding:10px; border:1px solid #555; border-radius:4px; background:rgba(0,0,0,0.3);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:#ddd; font-size:14px; font-weight:bold;">${r.name}</span>
                <button class="craft-btn" data-id="${r.weaponId}" style="padding:5px 14px; background:${canCraft ? '#2a1a0a' : '#222'}; border:1px solid ${canCraft ? '#ff8844' : '#555'}; color:${canCraft ? '#ff8844' : '#555'}; font-family:monospace; cursor:${canCraft ? 'pointer' : 'default'}; border-radius:3px; font-size:12px; font-weight:bold;" ${canCraft ? '' : 'disabled'}>CRAFT</button>
              </div>
              <div style="display:flex; gap:12px; font-size:11px;">
                <span style="color:${costColor(kills, r.kills)};">${r.kills} Kills</span>
                <span style="color:${costColor(mat.wood, r.wood)};">${r.wood} Wood</span>
                <span style="color:${costColor(mat.metal, r.metal)};">${r.metal} Metal</span>
                <span style="color:${costColor(mat.screws, r.screws)};">${r.screws} Screws</span>
              </div>
            </div>`;
          }).join('')}
        </div>
      `;

      // Event listeners
      this.workshopPanel!.querySelector('#ws-close')!.addEventListener('click', () => this.closeWorkshop());
      this.workshopPanel!.querySelectorAll('.craft-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const weaponId = (btn as HTMLElement).dataset.id!;
          const recipe = CRAFT_RECIPES.find(r => r.weaponId === weaponId);
          if (!recipe) return;

          const currentKills = shop.getKills();
          const currentMat = profile.getMaterials();
          if (currentKills < recipe.kills || currentMat.wood < recipe.wood || currentMat.metal < recipe.metal || currentMat.screws < recipe.screws) return;

          // Deduct resources
          shop.addKills(-recipe.kills);
          currentMat.wood -= recipe.wood;
          currentMat.metal -= recipe.metal;
          currentMat.screws -= recipe.screws;
          profile.setMaterials(currentMat);

          // Unlock weapon
          profile.unlockWeapon(weaponId);

          // Update kills display
          if (this.killsText) this.killsText.setText(`Kills: ${shop.getKills()}`);

          renderPanel();
        });
      });
    };

    document.body.appendChild(this.workshopPanel);
    this.workshopPanel.addEventListener('keydown', (e) => e.stopPropagation());
    renderPanel();
  }

  private closeWorkshop() {
    if (this.workshopPanel) { this.workshopPanel.remove(); this.workshopPanel = null; }
  }
}
