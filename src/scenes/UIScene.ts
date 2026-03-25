import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { Zombie } from '../entities/Zombie';
import { Pickup } from '../entities/Pickup';
import { audioManager } from '../systems/AudioManager';
import { leaderboard } from '../systems/LeaderboardManager';
import { AdminConsole } from '../systems/AdminConsole';
import { shop } from '../systems/ShopConfig';
import { getSelectedAbility, ABILITIES } from '../systems/AbilityConfig';

// UI overlay scene — HUD with health, ammo, score, wave info, minimap
export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private emptyMagText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private reloadText!: Phaser.GameObjects.Text;
  private minimap!: Phaser.GameObjects.Graphics;
  private lbBg!: Phaser.GameObjects.Graphics;
  private lbTitle!: Phaser.GameObjects.Text;
  private lbEntries: Phaser.GameObjects.Text[] = [];
  private volumeOpen = false;
  private weaponBarGfx!: Phaser.GameObjects.Graphics;
  private weaponBarTexts: Phaser.GameObjects.Text[] = [];
  private utilityBarGfx!: Phaser.GameObjects.Graphics;
  private bandageIcon!: Phaser.GameObjects.Sprite;
  private bandageText!: Phaser.GameObjects.Text;
  private medkitIcon!: Phaser.GameObjects.Sprite;
  private medkitText!: Phaser.GameObjects.Text;
  private escPending = false;
  private escText!: Phaser.GameObjects.Text;
  adminConsole!: AdminConsole;
  private exiting = false;
  private materialsGfx!: Phaser.GameObjects.Graphics;
  private woodIcon!: Phaser.GameObjects.Sprite;
  private woodText!: Phaser.GameObjects.Text;
  private metalIcon!: Phaser.GameObjects.Sprite;
  private metalText!: Phaser.GameObjects.Text;
  private screwsIcon!: Phaser.GameObjects.Sprite;
  private screwsText!: Phaser.GameObjects.Text;
  private backpackPanel: HTMLDivElement | null = null;
  private abilityIcon!: Phaser.GameObjects.Text;
  private abilityHint!: Phaser.GameObjects.Text;

  private minimapSize = 160;
  private minimapMargin = 15;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameScene: GameScene }) {
    this.gameScene = data.gameScene;
  }

  create() {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
    };

    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(20, 15, '', style).setDepth(100);
    this.ammoText = this.add.text(20, 50, '', style).setDepth(100);
    this.emptyMagText = this.add.text(20, 70, 'Empty mag! Press R to reload', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffff00',
    }).setDepth(100).setVisible(false);
    this.scoreText = this.add.text(20, 90, '', style).setDepth(100);

    this.reloadText = this.add.text(0, 0, 'RELOADING...', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffff00',
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.waveText = this.add.text(0, 15, '', {
      ...style,
      fontSize: '22px',
      color: '#ff6666',
    }).setOrigin(1, 0).setDepth(100);

    this.minimap = this.add.graphics();
    this.minimap.setDepth(100);

    // Weapon bar at bottom
    this.weaponBarGfx = this.add.graphics().setDepth(100);
    this.createWeaponBar();

    // Utility icons above weapon bar
    this.utilityBarGfx = this.add.graphics().setDepth(100);
    this.createUtilityBar();

    // Materials bar (left side, below score)
    this.materialsGfx = this.add.graphics().setDepth(100);
    this.createMaterialsBar();

    // In-game leaderboard (top right, below wave)
    this.createLeaderboardDisplay();

    // ESC to exit — simple reload approach (no scene juggling)
    this.escText = this.add.text(0, 0, 'Press ESC again to exit to menu', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffff00',
      backgroundColor: '#000000aa',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(200).setVisible(false);

    const escKey = this.input.keyboard!.addKey('ESC');
    escKey.on('down', () => {
      if (this.exiting) return;
      if (this.escPending) {
        this.exiting = true;
        // Save score + materials before exit
        const gs = this.gameScene;
        if (gs?.player) {
          leaderboard.saveResult(gs.player.score, gs.wave);
        }
        this.saveMaterials();
        audioManager.stopGameMusic(0);
        audioManager.stopMenuMusic(0);
        // Reload page — guaranteed clean state
        window.location.reload();
      } else {
        this.escPending = true;
        this.escText.setVisible(true);
        this.time.delayedCall(2000, () => {
          this.escPending = false;
          if (this.escText) this.escText.setVisible(false);
        });
      }
    });

    // TAB — open/close backpack
    const tabKey = this.input.keyboard!.addKey('TAB');
    tabKey.on('down', (event: KeyboardEvent) => {
      event.preventDefault();
      if (this.backpackPanel) this.closeBackpack();
      else this.openBackpack();
    });

    // Backpack hint text (bottom left, above controls area)
    this.add.text(20, this.scale.height - 20, 'TAB — backpack', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#555555',
    }).setOrigin(0, 1).setDepth(100);

    // Ability icon + hint (above minimap)
    const abilityDef = ABILITIES.find(a => a.id === getSelectedAbility()) || ABILITIES[0];
    const abCX = this.scale.width - 15 - this.minimapSize / 2; // centered above minimap
    const abY = this.scale.height - 15 - this.minimapSize - 70; // above minimap with gap

    // Background for ability icon (100x100)
    const abilityBg = this.add.graphics().setDepth(99).setScrollFactor(0);
    abilityBg.fillStyle(0x000000, 0.6);
    abilityBg.fillRoundedRect(abCX - 50, abY - 50, 100, 100, 8);
    abilityBg.lineStyle(3, Phaser.Display.Color.HexStringToColor(abilityDef.color).color);
    abilityBg.strokeRoundedRect(abCX - 50, abY - 50, 100, 100, 8);

    this.abilityIcon = this.add.text(abCX, abY - 8, abilityDef.emoji, {
      fontSize: '48px',
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

    this.abilityHint = this.add.text(abCX, abY + 32, '[F] ' + abilityDef.name, {
      fontSize: '12px', fontFamily: 'monospace', color: abilityDef.color, align: 'center',
      shadow: { offsetX: 0, offsetY: 0, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

    // Admin console (~ key)
    this.adminConsole = new AdminConsole(this);

    // Volume control in-game
    this.createVolumeControl();
  }

  private createWeaponBar() {
    const { width, height } = this.scale;
    const slotW = 90;
    const slotH = 36;
    const gap = 4;
    const totalW = 5 * slotW + 4 * gap;
    const startX = (width - totalW) / 2;
    const y = height - slotH - 8;

    for (let i = 0; i < 5; i++) {
      const x = startX + i * (slotW + gap);
      const txt = this.add.text(x + slotW / 2, y + slotH / 2, '', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
        align: 'center',
      }).setOrigin(0.5).setDepth(101);
      this.weaponBarTexts.push(txt);
    }
  }

  private createUtilityBar() {
    const { width, height } = this.scale;
    const slotH = 36;
    const utilY = height - slotH - 8 - 56; // above weapon bar

    const utilStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#ffffff',
    };

    // Bandage icon + text (left of center)
    const centerX = width / 2;
    this.bandageIcon = this.add.sprite(centerX - 100, utilY, 'bandage-pickup').setDepth(101).setScale(2.4);
    this.bandageText = this.add.text(centerX - 72, utilY - 12, '', utilStyle).setDepth(101);

    // Medkit icon + text (right of center)
    this.medkitIcon = this.add.sprite(centerX + 30, utilY, 'medkit-pickup').setDepth(101).setScale(2.4);
    this.medkitText = this.add.text(centerX + 58, utilY - 12, '', utilStyle).setDepth(101);
  }

  private updateUtilityBar() {
    if (!this.gameScene?.player) return;
    const p = this.gameScene.player;
    const { width, height } = this.scale;
    const slotH = 36;
    const utilY = height - slotH - 8 - 56;
    const centerX = width / 2;

    // Background
    this.utilityBarGfx.clear();
    this.utilityBarGfx.fillStyle(0x000000, 0.5);
    this.utilityBarGfx.fillRoundedRect(centerX - 140, utilY - 22, 280, 44, 6);

    // Update positions + text
    this.bandageIcon.setPosition(centerX - 100, utilY);
    this.bandageText.setPosition(centerX - 72, utilY - 12);
    this.bandageText.setText(`${p.bandages} [Q]`);
    this.bandageText.setColor(p.bandages > 0 ? '#44ff44' : '#666666');

    this.medkitIcon.setPosition(centerX + 30, utilY);
    this.medkitText.setPosition(centerX + 58, utilY - 12);
    this.medkitText.setText(`${p.medkits} [E]`);
    this.medkitText.setColor(p.medkits > 0 ? '#ff4444' : '#666666');
  }

  private createMaterialsBar() {
    const matStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#dddddd',
    };

    const startX = 24;
    const startY = 115;

    this.woodIcon = this.add.sprite(startX, startY, 'material-wood').setDepth(101).setScale(1.2);
    this.woodText = this.add.text(startX + 16, startY - 7, '0', matStyle).setDepth(101);

    this.metalIcon = this.add.sprite(startX + 70, startY, 'material-metal').setDepth(101).setScale(1.2);
    this.metalText = this.add.text(startX + 86, startY - 7, '0', matStyle).setDepth(101);

    this.screwsIcon = this.add.sprite(startX + 140, startY, 'material-screws').setDepth(101).setScale(1.2);
    this.screwsText = this.add.text(startX + 156, startY - 7, '0', matStyle).setDepth(101);
  }

  private updateMaterialsBar() {
    if (!this.gameScene?.player) return;
    const p = this.gameScene.player;

    this.materialsGfx.clear();
    this.materialsGfx.fillStyle(0x000000, 0.4);
    this.materialsGfx.fillRoundedRect(14, 105, 190, 22, 4);

    this.woodText.setText(`${p.wood}`);
    this.metalText.setText(`${p.metal}`);
    this.screwsText.setText(`${p.screws}`);
  }

  private updateWeaponBar() {
    if (!this.gameScene?.player) return;
    const p = this.gameScene.player;
    const { width, height } = this.scale;
    const slotW = 90;
    const slotH = 36;
    const gap = 4;
    const totalW = 5 * slotW + 4 * gap;
    const startX = (width - totalW) / 2;
    const y = height - slotH - 8;

    this.weaponBarGfx.clear();

    for (let i = 0; i < p.weapons.length; i++) {
      const w = p.weapons[i];
      const x = startX + i * (slotW + gap);
      const isActive = i === p.activeWeaponIndex;

      // Slot background
      this.weaponBarGfx.fillStyle(0x000000, isActive ? 0.7 : 0.4);
      this.weaponBarGfx.fillRoundedRect(x, y, slotW, slotH, 4);

      // Border
      this.weaponBarGfx.lineStyle(isActive ? 2 : 1, isActive ? 0x44ff44 : 0x444444);
      this.weaponBarGfx.strokeRoundedRect(x, y, slotW, slotH, 4);

      // Text
      const txt = this.weaponBarTexts[i];
      txt.setText(`${i + 1} ${w.def.name}\n${w.magazineAmmo}/${w.reserveAmmo}`);
      txt.setColor(isActive ? '#44ff44' : '#888888');
      txt.setPosition(x + slotW / 2, y + slotH / 2);
    }
  }

  private createLeaderboardDisplay() {
    const { width } = this.scale;
    const startX = width - 15;
    const startY = 42;

    // Background (redrawn in updateLeaderboard)
    this.lbBg = this.add.graphics().setDepth(99);

    // Title
    this.lbTitle = this.add.text(startX, startY, 'LEADERBOARD', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffcc33',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(100);

    // Create 5 text slots
    for (let i = 0; i < 5; i++) {
      const txt = this.add.text(startX, startY + 18 + i * 16, '', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ddaa44',
      }).setOrigin(1, 0).setDepth(100);
      this.lbEntries.push(txt);
    }
  }

  private updateLeaderboard() {
    const { width } = this.scale;
    const startX = width - 15;
    const startY = 42;
    const top5 = leaderboard.getTop(5);
    const currentNick = leaderboard.getNickname();
    const currentScore = this.gameScene?.player?.score || 0;

    // Redraw background
    this.lbBg.clear();
    const count = Math.max(top5.length, 1);
    const bgH = 22 + count * 16;
    this.lbBg.fillStyle(0x000000, 0.5);
    this.lbBg.fillRoundedRect(startX - 145, startY - 4, 150, bgH, 4);

    // Update entries
    for (let i = 0; i < 5; i++) {
      if (i < top5.length) {
        const e = top5[i];
        this.lbEntries[i].setText(`${i + 1}. ${e.name}: ${e.score}`);
        // Highlight current player
        const isMe = currentNick && e.name === currentNick;
        this.lbEntries[i].setColor(isMe ? '#44ff44' : '#ddaa44');
        this.lbEntries[i].setVisible(true);
      } else {
        this.lbEntries[i].setVisible(false);
      }
    }

    this.lbTitle.setVisible(top5.length > 0);
  }

  private createVolumeControl() {
    const { width } = this.scale;
    const btnX = width - 40;
    const btnY = 55;

    // Volume icon button
    const volBtn = this.add.text(btnX, btnY, '♪', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(101);

    // Slider container (hidden by default)
    const sliderX = width - 195;
    const sliderY = btnY;
    const sliderW = 130;

    const sliderBg = this.add.graphics().setDepth(101).setVisible(false);
    const sliderGfx = this.add.graphics().setDepth(102).setVisible(false);
    const pctText = this.add.text(sliderX - 40, sliderY, `${audioManager.getVolumePercent()}%`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0, 0.5).setDepth(102).setVisible(false);

    // Draw static track background
    const drawBg = () => {
      sliderBg.clear();
      sliderBg.fillStyle(0x000000, 0.6);
      sliderBg.fillRoundedRect(sliderX - 50, sliderY - 14, sliderW + 60, 28, 5);
      sliderBg.fillStyle(0x333333);
      sliderBg.fillRoundedRect(sliderX, sliderY - 2, sliderW, 4, 2);
    };

    const volToX = (vol: number) => sliderX + ((vol - 0.25) / 1.75) * sliderW;
    const xToVol = (x: number) => 0.25 + ((x - sliderX) / sliderW) * 1.75;

    const drawSlider = (vol: number) => {
      const knobX = volToX(vol);
      sliderGfx.clear();
      sliderGfx.fillStyle(0x44ff44);
      sliderGfx.fillRoundedRect(sliderX, sliderY - 2, knobX - sliderX, 4, 2);
      sliderGfx.fillStyle(0x88ff88);
      sliderGfx.fillCircle(knobX, sliderY, 6);
      sliderGfx.fillStyle(0x44ff44);
      sliderGfx.fillCircle(knobX, sliderY, 4);
      pctText.setText(`${audioManager.getVolumePercent()}%`);
    };

    drawBg();
    drawSlider(audioManager.getVolume());

    // Hit zone for slider drag
    const hitZone = this.add.zone(sliderX + sliderW / 2, sliderY, sliderW + 20, 28)
      .setInteractive({ useHandCursor: true })
      .setDepth(103).setVisible(false);

    // Toggle slider visibility
    volBtn.on('pointerdown', () => {
      this.volumeOpen = !this.volumeOpen;
      sliderBg.setVisible(this.volumeOpen);
      sliderGfx.setVisible(this.volumeOpen);
      pctText.setVisible(this.volumeOpen);
      hitZone.setVisible(this.volumeOpen);
      if (this.volumeOpen) {
        // Redraw with current value
        drawSlider(audioManager.getVolume());
      }
    });

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

  update() {
    if (this.exiting) return;
    try {
      if (!this.gameScene?.player?.active) return;
    } catch { return; }
    const p = this.gameScene.player;
    const { width, height } = this.scale;

    // Draw HP bar
    this.hpBar.clear();
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(18, 36, 204, 12);
    const hpPercent = p.hp / p.maxHp;
    const barColor = hpPercent > 0.5 ? 0x44ff44 : hpPercent > 0.25 ? 0xffaa00 : 0xff3333;
    this.hpBar.fillStyle(barColor);
    this.hpBar.fillRect(20, 38, 200 * hpPercent, 8);
    this.hpBar.setDepth(99);

    this.hpText.setText(`HP: ${p.hp}/${p.maxHp}`);
    this.ammoText.setText(`Ammo: ${p.magazineAmmo} / ${p.reserveAmmo}`);

    // Empty magazine hint
    this.emptyMagText.setVisible(p.magazineAmmo === 0 && !p.isReloading);

    this.scoreText.setText(`Score: ${p.score} | Kills: ${p.kills} | Coins: ${shop.getCoins()} (+${p.sessionCoins})`);

    this.waveText.setPosition(width - 20, 15);
    this.waveText.setText(`Wave ${this.gameScene.wave}`);

    this.reloadText.setPosition(width / 2, height / 2);
    this.reloadText.setVisible(p.isReloading);

    // ESC confirmation position
    this.escText.setPosition(width / 2, height / 2 - 40);

    try {
      this.updateWeaponBar();
      this.updateUtilityBar();
      this.updateMaterialsBar();
      this.updateLeaderboard();
      this.drawMinimap(width, height);
    } catch { /* scene shutting down */ }
  }

  private drawMinimap(screenW: number, screenH: number) {
    const mm = this.minimap;
    mm.clear();
    if (!this.gameScene?.walls || !this.gameScene?.player?.active) return;

    const size = this.minimapSize;
    const margin = this.minimapMargin;
    const mapSize = 2000;
    const mmX = screenW - size - margin;
    const mmY = screenH - size - margin;
    const scale = size / mapSize;

    // Background with border
    mm.fillStyle(0x000000, 0.6);
    mm.fillRect(mmX - 2, mmY - 2, size + 4, size + 4);
    mm.fillStyle(0x1a2a1a, 0.8);
    mm.fillRect(mmX, mmY, size, size);

    // Walls (grey dots)
    const walls = this.gameScene.walls.getChildren() as Phaser.Physics.Arcade.Sprite[];
    mm.fillStyle(0x666666, 0.7);
    for (const wall of walls) {
      const wx = mmX + wall.x * scale;
      const wy = mmY + wall.y * scale;
      mm.fillRect(wx, wy, Math.max(2, 64 * scale), Math.max(2, 64 * scale));
    }

    // Pickups (yellow dots)
    mm.fillStyle(0xffaa00);
    this.gameScene.pickups.getChildren().forEach((obj) => {
      const pickup = obj as Pickup;
      if (pickup.active) {
        mm.fillRect(mmX + pickup.x * scale - 1, mmY + pickup.y * scale - 1, 3, 3);
      }
    });

    // Zombies (red dots)
    mm.fillStyle(0xff3333);
    this.gameScene.zombies.getChildren().forEach((obj) => {
      const z = obj as Zombie;
      if (z.active) {
        mm.fillCircle(mmX + z.x * scale, mmY + z.y * scale, 2);
      }
    });

    // Player (green dot, bigger)
    const p = this.gameScene.player;
    mm.fillStyle(0x44ff44);
    mm.fillCircle(mmX + p.x * scale, mmY + p.y * scale, 3);

    // Camera view rectangle (using worldView for accurate coordinates)
    const cam = this.gameScene.cameras.main;
    const wv = cam.worldView;
    const camX = mmX + wv.x * scale;
    const camY = mmY + wv.y * scale;
    const camW = wv.width * scale;
    const camH = wv.height * scale;
    mm.lineStyle(1, 0xffffff, 0.4);
    mm.strokeRect(camX, camY, camW, camH);

    // Border
    mm.lineStyle(1, 0x44ff44, 0.5);
    mm.strokeRect(mmX, mmY, size, size);
  }

  private saveMaterials() {
    if (!this.gameScene?.player) return;
    const p = this.gameScene.player;
    localStorage.setItem('zombie-sim-materials', JSON.stringify({
      wood: p.wood, metal: p.metal, screws: p.screws,
    }));
  }

  private openBackpack() {
    if (this.backpackPanel) return;
    const p = this.gameScene?.player;
    if (!p) return;

    this.backpackPanel = document.createElement('div');
    this.backpackPanel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.92); border: 2px solid #88aa44; border-radius: 8px;
      padding: 20px; z-index: 3000; font-family: monospace; color: #88aa44;
      width: 280px;
    `;

    const render = () => {
      if (!this.backpackPanel || !this.gameScene?.player) return;
      const pl = this.gameScene.player;
      this.backpackPanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="margin:0; color:#88aa44; font-size:20px;">BACKPACK</h3>
          <button id="bp-close" style="background:none; border:2px solid #ff4444; color:#ff4444; font-family:monospace; font-size:22px; cursor:pointer; padding:2px 10px; border-radius:4px; line-height:1; transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#ff4444';this.style.color='#000'" onmouseout="this.style.background='none';this.style.color='#ff4444'">✕</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px; padding:8px; border:1px solid #333; border-radius:4px; background:rgba(139,90,43,0.15);">
            <span style="color:#8b5a2b; font-size:18px;">■</span>
            <span style="color:#ddd; flex:1;">Wood</span>
            <span style="color:#88aa44; font-size:18px; font-weight:bold;">${pl.wood}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; padding:8px; border:1px solid #333; border-radius:4px; background:rgba(150,150,150,0.1);">
            <span style="color:#999; font-size:18px;">■</span>
            <span style="color:#ddd; flex:1;">Metal</span>
            <span style="color:#88aa44; font-size:18px; font-weight:bold;">${pl.metal}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; padding:8px; border:1px solid #333; border-radius:4px; background:rgba(100,100,120,0.1);">
            <span style="color:#777; font-size:18px;">⚙</span>
            <span style="color:#ddd; flex:1;">Screws</span>
            <span style="color:#88aa44; font-size:18px; font-weight:bold;">${pl.screws}</span>
          </div>
        </div>
      `;
      this.backpackPanel.querySelector('#bp-close')?.addEventListener('click', () => this.closeBackpack());
    };

    document.body.appendChild(this.backpackPanel);
    this.backpackPanel.addEventListener('keydown', (e) => e.stopPropagation());
    render();

    // Live update every 500ms
    const interval = setInterval(() => {
      if (!this.backpackPanel) { clearInterval(interval); return; }
      render();
    }, 500);
    (this.backpackPanel as any)._interval = interval;
  }

  private closeBackpack() {
    if (this.backpackPanel) {
      clearInterval((this.backpackPanel as any)._interval);
      this.backpackPanel.remove();
      this.backpackPanel = null;
    }
  }

  shutdown() {
    this.saveMaterials();
    this.closeBackpack();
    this.adminConsole.destroy();
  }
}
