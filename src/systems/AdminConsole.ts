import { leaderboard } from './LeaderboardManager';
import { shop } from './ShopConfig';
import { ZombieType } from '../entities/Zombie';

const ADMIN_PASSWORD = 'nikitaadmin';
const ZOMBIE_TYPES: { type: ZombieType; name: string; texture: string; color: string }[] = [
  { type: 'walker', name: 'Walker', texture: 'zombie-walker', color: '#556b2f' },
  { type: 'runner', name: 'Runner', texture: 'zombie-runner', color: '#7a8b3f' },
  { type: 'tank', name: 'Tank', texture: 'zombie-tank', color: '#3a4a1f' },
  { type: 'radioactive', name: 'Radioactive', texture: 'zombie-radioactive', color: '#33ff33' },
  { type: 'kamikaze', name: 'Kamikaze', texture: 'zombie-kamikaze', color: '#ff3333' },
  { type: 'boss', name: 'Boss', texture: 'zombie-boss', color: '#8800aa' },
];

export class AdminConsole {
  private scene: Phaser.Scene;
  private cmdInput: HTMLInputElement | null = null;
  private panel: HTMLDivElement | null = null;
  private pickerOverlay: HTMLDivElement | null = null;
  private keyHandler: (e: KeyboardEvent) => void;
  private selectedZombieType: ZombieType = 'walker';
  isOpen: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.keyHandler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === '`' || e.key === '~' || e.key === 'F2') {
        e.preventDefault();
        if (this.pickerOverlay) return;
        if (this.panel) {
          this.closeAdminPanel();
        } else if (this.cmdInput) {
          this.closeCmdInput();
        } else {
          this.openCmdInput();
        }
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  private openCmdInput() {
    if (this.cmdInput) return;
    const rect = this.scene.game.canvas.getBoundingClientRect();

    this.cmdInput = document.createElement('input');
    this.cmdInput.type = 'text';
    this.cmdInput.placeholder = 'Enter command...';
    this.cmdInput.style.cssText = `
      position: fixed; left: ${rect.left + 10}px; bottom: 10px;
      width: ${Math.min(rect.width - 20, 400)}px; height: 30px;
      background: rgba(0,0,0,0.9); border: 1px solid #44ff44; color: #44ff44;
      font-family: monospace; font-size: 14px; padding: 0 10px;
      outline: none; z-index: 2000; border-radius: 4px;
    `;
    this.cmdInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const cmd = this.cmdInput?.value.trim() || '';
        this.closeCmdInput();
        if (cmd === ADMIN_PASSWORD) this.openAdminPanel();
      }
      if (e.key === 'Escape' || e.key === '`') this.closeCmdInput();
    });
    document.body.appendChild(this.cmdInput);
    setTimeout(() => this.cmdInput?.focus(), 50);
  }

  private closeCmdInput() {
    if (this.cmdInput) { this.cmdInput.remove(); this.cmdInput = null; }
  }

  private openAdminPanel() {
    if (this.panel) return;
    this.isOpen = true;

    const inputStyle = `width:100%; box-sizing:border-box; padding:6px 8px; background:#111; border:1px solid #44ff44; color:#44ff44; font-family:monospace; font-size:14px; outline:none;`;
    const btnStyle = (bg: string, border: string, color: string) =>
      `padding:8px; background:${bg}; border:1px solid ${border}; color:${color}; font-family:monospace; font-size:13px; cursor:pointer; border-radius:3px;`;

    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); border: 2px solid #44ff44; border-radius: 8px;
      padding: 24px; z-index: 3000; font-family: monospace; color: #44ff44;
      min-width: 380px; max-height: 90vh; overflow-y: auto;
    `;

    const sel = ZOMBIE_TYPES.find(z => z.type === this.selectedZombieType)!;

    this.panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; color:#ffaa00; font-size:18px;">ADMIN PANEL</h3>
        <button id="admin-close" style="background:none; border:2px solid #ff4444; color:#ff4444; font-family:monospace; font-size:22px; cursor:pointer; padding:2px 10px; border-radius:4px; line-height:1; transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#ff4444';this.style.color='#000'" onmouseout="this.style.background='none';this.style.color='#ff4444'">✕</button>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:4px; color:#888;">Nickname:</label>
        <input id="admin-name" type="text" maxlength="16" style="${inputStyle}">
      </div>
      <div style="margin-bottom:12px; display:flex; gap:10px;">
        <div style="flex:1;">
          <label style="display:block; margin-bottom:4px; color:#888;">Score:</label>
          <input id="admin-score" type="number" value="100" style="${inputStyle}">
        </div>
        <div style="flex:1;">
          <label style="display:block; margin-bottom:4px; color:#888;">Wave:</label>
          <input id="admin-wave" type="number" value="5" style="${inputStyle}">
        </div>
      </div>

      <div id="admin-msg" style="color:#ffff00; font-size:12px; margin-bottom:12px; min-height:16px;"></div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        <button id="admin-add" style="${btnStyle('#1a3a1a', '#44ff44', '#44ff44')}; flex:1;">Add to leaderboard</button>
        <button id="admin-clear" style="${btnStyle('#3a1a1a', '#ff4444', '#ff4444')}; flex:1;">Clear leaderboard</button>
      </div>

      <hr style="border-color:#333; margin:12px 0;">

      <div style="display:flex; gap:10px; align-items:end; margin-bottom:8px;">
        <div style="flex:1;">
          <label style="display:block; margin-bottom:4px; color:#888;">Give coins:</label>
          <input id="admin-coins" type="number" value="100" style="${inputStyle.replace('#44ff44', '#ffcc22')}">
        </div>
        <button id="admin-give-coins" style="${btnStyle('#3a3a1a', '#ffcc22', '#ffcc22')}">Give</button>
      </div>
      <button id="admin-max-ammo" style="${btnStyle('#1a2a3a', '#4488ff', '#4488ff')}; width:100%; margin-bottom:8px;">Max ammo (all weapons)</button>

      <hr style="border-color:#333; margin:12px 0;">

      <div style="display:flex; gap:10px; align-items:end; margin-bottom:8px;">
        <div style="flex:1;">
          <label style="display:block; margin-bottom:4px; color:#888;">Set Wave:</label>
          <input id="admin-wave-num" type="number" value="5" min="1" max="100" style="${inputStyle.replace('#44ff44', '#cc44ff')}">
        </div>
        <button id="admin-set-wave" style="${btnStyle('#2a1a3a', '#cc44ff', '#cc44ff')}">Set</button>
      </div>

      <hr style="border-color:#333; margin:12px 0;">

      <label style="display:block; margin-bottom:8px; color:#888;">Utilities:</label>
      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <button id="admin-give-bandages" style="${btnStyle('#1a3a2a', '#44cc44', '#44cc44')}; flex:1;">Give Bandages (max)</button>
        <button id="admin-give-medkits" style="${btnStyle('#3a1a1a', '#ff4444', '#ff4444')}; flex:1;">Give Medkits (max)</button>
      </div>

      <hr style="border-color:#333; margin:12px 0;">

      <label style="display:block; margin-bottom:8px; color:#888;">Materials:</label>
      <div style="display:flex; gap:10px; align-items:end; margin-bottom:8px;">
        <div style="flex:1;">
          <label style="display:block; margin-bottom:4px; color:#888;">Type:</label>
          <select id="admin-mat-type" style="width:100%; box-sizing:border-box; padding:6px 8px; background:#111; border:1px solid #bb8844; color:#bb8844; font-family:monospace; font-size:14px; outline:none;">
            <option value="wood">🪵 Wood</option>
            <option value="metal">🔩 Metal</option>
            <option value="screws">⚙️ Screws</option>
          </select>
        </div>
        <div style="flex:1;">
          <label style="display:block; margin-bottom:4px; color:#888;">Amount:</label>
          <input id="admin-mat-amount" type="number" value="10" min="1" max="999" style="${inputStyle.replace('#44ff44', '#bb8844')}">
        </div>
        <button id="admin-give-mat" style="${btnStyle('#2a2a1a', '#bb8844', '#bb8844')}">Give</button>
      </div>

      <hr style="border-color:#333; margin:12px 0;">

      <label style="display:block; margin-bottom:8px; color:#888;">Spawn Zombie:</label>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
        <div id="admin-zombie-preview" style="width:50px; height:50px; border:2px solid ${sel.color}; border-radius:6px; background:#111; cursor:pointer; display:flex; align-items:center; justify-content:center;">
          <span style="font-size:10px; color:${sel.color}; text-align:center;">${sel.name}</span>
        </div>
        <div style="flex:1;">
          <label style="display:block; margin-bottom:4px; color:#888;">Count:</label>
          <input id="admin-spawn-count" type="number" value="1" min="1" max="20" style="${inputStyle.replace('#44ff44', '#ff8844')}">
        </div>
        <button id="admin-spawn" style="${btnStyle('#3a2a1a', '#ff8844', '#ff8844')}">Spawn</button>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.panel.addEventListener('keydown', (e) => e.stopPropagation());

    const msg = this.panel.querySelector('#admin-msg') as HTMLDivElement;

    // Close button (X)
    this.panel.querySelector('#admin-close')!.addEventListener('click', () => this.closeAdminPanel());

    // Leaderboard
    const nameInput = this.panel.querySelector('#admin-name') as HTMLInputElement;
    const scoreInput = this.panel.querySelector('#admin-score') as HTMLInputElement;
    const waveInput = this.panel.querySelector('#admin-wave') as HTMLInputElement;
    this.panel.querySelector('#admin-add')!.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const score = parseInt(scoreInput.value, 10);
      const wave = parseInt(waveInput.value, 10);
      if (!name) { msg.textContent = 'Enter a nickname!'; msg.style.color = '#ff4444'; return; }
      if (isNaN(score) || score < 0) { msg.textContent = 'Invalid score!'; msg.style.color = '#ff4444'; return; }
      if (isNaN(wave) || wave < 1) { msg.textContent = 'Invalid wave!'; msg.style.color = '#ff4444'; return; }
      leaderboard.adminAdd(name, score, wave);
      msg.textContent = `Added: ${name} — ${score} pts (wave ${wave})`; msg.style.color = '#44ff44';
    });
    this.panel.querySelector('#admin-clear')!.addEventListener('click', () => {
      leaderboard.clearLeaderboard(); msg.textContent = 'Leaderboard cleared!'; msg.style.color = '#ff4444';
    });

    // Coins
    this.panel.querySelector('#admin-give-coins')!.addEventListener('click', () => {
      const amount = parseInt((this.panel!.querySelector('#admin-coins') as HTMLInputElement).value, 10);
      if (isNaN(amount) || amount <= 0) { msg.textContent = 'Invalid amount!'; msg.style.color = '#ff4444'; return; }
      shop.addCoins(amount); msg.textContent = `+${amount} coins! Total: ${shop.getCoins()}`; msg.style.color = '#ffcc22';
    });

    // Max ammo
    this.panel.querySelector('#admin-max-ammo')!.addEventListener('click', () => {
      const gs = this.scene.scene.get('GameScene') as any;
      if (gs?.player) {
        for (const w of gs.player.weapons) { w.magazineAmmo = w.def.magazineSize; w.reserveAmmo = w.def.maxReserve; }
        msg.textContent = 'All weapons maxed out!'; msg.style.color = '#4488ff';
      } else { msg.textContent = 'Start a game first!'; msg.style.color = '#ff4444'; }
    });

    // Set Wave
    this.panel.querySelector('#admin-set-wave')!.addEventListener('click', () => {
      const gs = this.scene.scene.get('GameScene') as any;
      if (!gs?.player) { msg.textContent = 'Start a game first!'; msg.style.color = '#ff4444'; return; }
      const waveNum = parseInt((this.panel!.querySelector('#admin-wave-num') as HTMLInputElement).value, 10);
      if (isNaN(waveNum) || waveNum < 1) { msg.textContent = 'Invalid wave!'; msg.style.color = '#ff4444'; return; }
      gs.adminSetWave(waveNum);
      msg.textContent = `Jumped to wave ${waveNum}!`; msg.style.color = '#cc44ff';
    });

    // Utilities
    this.panel.querySelector('#admin-give-bandages')!.addEventListener('click', () => {
      const gs = this.scene.scene.get('GameScene') as any;
      if (!gs?.player) { msg.textContent = 'Start a game first!'; msg.style.color = '#ff4444'; return; }
      gs.player.bandages = gs.player.maxBandages;
      msg.textContent = `Bandages maxed! (${gs.player.bandages})`; msg.style.color = '#44cc44';
    });
    this.panel.querySelector('#admin-give-medkits')!.addEventListener('click', () => {
      const gs = this.scene.scene.get('GameScene') as any;
      if (!gs?.player) { msg.textContent = 'Start a game first!'; msg.style.color = '#ff4444'; return; }
      gs.player.medkits = gs.player.maxMedkits;
      msg.textContent = `Medkits maxed! (${gs.player.medkits})`; msg.style.color = '#ff4444';
    });

    // Materials
    this.panel.querySelector('#admin-give-mat')!.addEventListener('click', () => {
      const gs = this.scene.scene.get('GameScene') as any;
      if (!gs?.player) { msg.textContent = 'Start a game first!'; msg.style.color = '#ff4444'; return; }
      const matType = (this.panel!.querySelector('#admin-mat-type') as HTMLSelectElement).value;
      const amount = parseInt((this.panel!.querySelector('#admin-mat-amount') as HTMLInputElement).value, 10);
      if (isNaN(amount) || amount <= 0) { msg.textContent = 'Invalid amount!'; msg.style.color = '#ff4444'; return; }
      if (matType === 'wood') gs.player.wood += amount;
      else if (matType === 'metal') gs.player.metal += amount;
      else if (matType === 'screws') gs.player.screws += amount;
      const names: Record<string, string> = { wood: 'Wood', metal: 'Metal', screws: 'Screws' };
      msg.textContent = `+${amount} ${names[matType]}! (total: ${gs.player[matType]})`; msg.style.color = '#bb8844';
    });

    // Zombie type picker
    this.panel.querySelector('#admin-zombie-preview')!.addEventListener('click', () => this.openZombiePicker());

    // Spawn button
    this.panel.querySelector('#admin-spawn')!.addEventListener('click', () => {
      const gs = this.scene.scene.get('GameScene') as any;
      if (!gs?.player) { msg.textContent = 'Start a game first!'; msg.style.color = '#ff4444'; return; }
      const count = parseInt((this.panel!.querySelector('#admin-spawn-count') as HTMLInputElement).value, 10) || 1;
      const clamped = Math.min(count, 20);
      gs.adminSpawnZombies(this.selectedZombieType, clamped);
      msg.textContent = `Spawning ${clamped}x ${this.selectedZombieType} in 5 sec...`;
      msg.style.color = '#ff8844';
    });
  }

  private openZombiePicker() {
    if (this.pickerOverlay) return;

    this.pickerOverlay = document.createElement('div');
    this.pickerOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.9); z-index: 4000;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: monospace;
    `;

    this.pickerOverlay.innerHTML = `
      <h2 style="color: #ffaa00; margin-bottom: 24px;">Choose Zombie Type</h2>
      <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
        ${ZOMBIE_TYPES.map(z => `
          <div class="zpick" data-type="${z.type}" style="
            width: 100px; height: 100px; border: 3px solid ${z.color};
            border-radius: 8px; background: #111; cursor: pointer;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            transition: transform 0.1s;
          ">
            <span style="font-size: 28px; margin-bottom: 6px;">${
              z.type === 'walker' ? '🧟' :
              z.type === 'runner' ? '🏃' :
              z.type === 'tank' ? '🛡️' :
              z.type === 'radioactive' ? '☢️' :
              '💣'
            }</span>
            <span style="color: ${z.color}; font-size: 12px;">${z.name}</span>
          </div>
        `).join('')}
      </div>
      <button id="zpick-cancel" style="margin-top: 24px; padding: 10px 30px; background: #222; border: 1px solid #666; color: #aaa; font-family: monospace; font-size: 14px; cursor: pointer; border-radius: 4px;">Cancel</button>
    `;

    document.body.appendChild(this.pickerOverlay);

    this.pickerOverlay.querySelectorAll('.zpick').forEach(el => {
      el.addEventListener('mouseenter', () => (el as HTMLElement).style.transform = 'scale(1.1)');
      el.addEventListener('mouseleave', () => (el as HTMLElement).style.transform = 'scale(1)');
      el.addEventListener('click', () => {
        this.selectedZombieType = (el as HTMLElement).dataset.type as ZombieType;
        this.closeZombiePicker();
        this.updateZombiePreview();
      });
    });

    this.pickerOverlay.querySelector('#zpick-cancel')!.addEventListener('click', () => this.closeZombiePicker());
  }

  private updateZombiePreview() {
    if (!this.panel) return;
    const sel = ZOMBIE_TYPES.find(z => z.type === this.selectedZombieType)!;
    const previewDiv = this.panel.querySelector('#admin-zombie-preview') as HTMLDivElement;
    if (previewDiv) {
      previewDiv.style.borderColor = sel.color;
      previewDiv.innerHTML = `<span style="font-size:10px; color:${sel.color}; text-align:center;">${sel.name}</span>`;
    }
  }

  private closeZombiePicker() {
    if (this.pickerOverlay) { this.pickerOverlay.remove(); this.pickerOverlay = null; }
  }

  private closeAdminPanel() {
    if (this.panel) { this.panel.remove(); this.panel = null; }
    this.isOpen = false;
  }

  destroy() {
    document.removeEventListener('keydown', this.keyHandler);
    this.closeCmdInput();
    this.closeAdminPanel();
    this.closeZombiePicker();
  }
}
