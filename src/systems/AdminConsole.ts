import { leaderboard } from './LeaderboardManager';
import { shop } from './ShopConfig';

const ADMIN_PASSWORD = 'nikitaadmin';

// Admin console — works in any scene via HTML overlay
// Press ` (backtick/tilde) or F2 to open command input
export class AdminConsole {
  private scene: Phaser.Scene;
  private cmdInput: HTMLInputElement | null = null;
  private panel: HTMLDivElement | null = null;
  private keyHandler: (e: KeyboardEvent) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Use global DOM listener — more reliable than Phaser for special keys
    this.keyHandler = (e: KeyboardEvent) => {
      // Skip if typing in an input
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === '`' || e.key === '~' || e.key === 'F2') {
        e.preventDefault();
        if (this.panel) return;
        if (this.cmdInput) {
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

    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();

    this.cmdInput = document.createElement('input');
    this.cmdInput.type = 'text';
    this.cmdInput.placeholder = 'Enter command...';
    this.cmdInput.style.cssText = `
      position: fixed;
      left: ${rect.left + 10}px;
      bottom: 10px;
      width: ${Math.min(rect.width - 20, 400)}px;
      height: 30px;
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid #44ff44;
      color: #44ff44;
      font-family: monospace;
      font-size: 14px;
      padding: 0 10px;
      outline: none;
      z-index: 2000;
      border-radius: 4px;
    `;

    this.cmdInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const cmd = this.cmdInput?.value.trim() || '';
        this.closeCmdInput();
        if (cmd === ADMIN_PASSWORD) {
          this.openAdminPanel();
        }
      }
      if (e.key === 'Escape' || e.key === '`') {
        this.closeCmdInput();
      }
    });

    document.body.appendChild(this.cmdInput);
    // Small delay to prevent the ` character from appearing in input
    setTimeout(() => this.cmdInput?.focus(), 50);
  }

  private closeCmdInput() {
    if (this.cmdInput) {
      this.cmdInput.remove();
      this.cmdInput = null;
    }
  }

  private openAdminPanel() {
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #44ff44;
      border-radius: 8px;
      padding: 24px;
      z-index: 3000;
      font-family: monospace;
      color: #44ff44;
      min-width: 320px;
    `;

    this.panel.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #ffaa00; font-size: 18px;">ADMIN PANEL</h3>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; color: #888;">Nickname:</label>
        <input id="admin-name" type="text" maxlength="16" style="
          width: 100%; box-sizing: border-box; padding: 6px 8px;
          background: #111; border: 1px solid #44ff44; color: #44ff44;
          font-family: monospace; font-size: 14px; outline: none;
        ">
      </div>

      <div style="margin-bottom: 12px; display: flex; gap: 10px;">
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; color: #888;">Score:</label>
          <input id="admin-score" type="number" value="100" style="
            width: 100%; box-sizing: border-box; padding: 6px 8px;
            background: #111; border: 1px solid #44ff44; color: #44ff44;
            font-family: monospace; font-size: 14px; outline: none;
          ">
        </div>
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; color: #888;">Wave:</label>
          <input id="admin-wave" type="number" value="5" style="
            width: 100%; box-sizing: border-box; padding: 6px 8px;
            background: #111; border: 1px solid #44ff44; color: #44ff44;
            font-family: monospace; font-size: 14px; outline: none;
          ">
        </div>
      </div>

      <div id="admin-msg" style="color: #ffff00; font-size: 12px; margin-bottom: 12px; min-height: 16px;"></div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button id="admin-add" style="
          flex: 1; padding: 8px; background: #1a3a1a; border: 1px solid #44ff44;
          color: #44ff44; font-family: monospace; font-size: 13px; cursor: pointer;
        ">Add to leaderboard</button>
        <button id="admin-clear" style="
          flex: 1; padding: 8px; background: #3a1a1a; border: 1px solid #ff4444;
          color: #ff4444; font-family: monospace; font-size: 13px; cursor: pointer;
        ">Clear leaderboard</button>
      </div>

      <hr style="border-color: #333; margin: 14px 0;">

      <div style="margin-bottom: 12px; display: flex; gap: 10px; align-items: end;">
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; color: #888;">Give coins:</label>
          <input id="admin-coins" type="number" value="100" style="
            width: 100%; box-sizing: border-box; padding: 6px 8px;
            background: #111; border: 1px solid #ffcc22; color: #ffcc22;
            font-family: monospace; font-size: 14px; outline: none;
          ">
        </div>
        <button id="admin-give-coins" style="
          padding: 8px 12px; background: #3a3a1a; border: 1px solid #ffcc22;
          color: #ffcc22; font-family: monospace; font-size: 13px; cursor: pointer;
        ">Give</button>
      </div>

      <button id="admin-max-ammo" style="
        width: 100%; padding: 8px; background: #1a2a3a; border: 1px solid #4488ff;
        color: #4488ff; font-family: monospace; font-size: 13px; cursor: pointer;
      ">Max ammo (all weapons)</button>

      <button id="admin-close" style="
        width: 100%; margin-top: 12px; padding: 8px; background: #222;
        border: 1px solid #666; color: #aaa; font-family: monospace;
        font-size: 13px; cursor: pointer;
      ">Close</button>
    `;

    document.body.appendChild(this.panel);

    // Stop key events from reaching the game
    this.panel.addEventListener('keydown', (e) => e.stopPropagation());

    const msg = this.panel.querySelector('#admin-msg') as HTMLDivElement;
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
      msg.textContent = `Added: ${name} — ${score} pts (wave ${wave})`;
      msg.style.color = '#44ff44';
    });

    this.panel.querySelector('#admin-clear')!.addEventListener('click', () => {
      leaderboard.clearLeaderboard();
      msg.textContent = 'Leaderboard cleared!';
      msg.style.color = '#ff4444';
    });

    this.panel.querySelector('#admin-give-coins')!.addEventListener('click', () => {
      const coinsInput = this.panel!.querySelector('#admin-coins') as HTMLInputElement;
      const amount = parseInt(coinsInput.value, 10);
      if (isNaN(amount) || amount <= 0) { msg.textContent = 'Invalid amount!'; msg.style.color = '#ff4444'; return; }
      shop.addCoins(amount);
      msg.textContent = `+${amount} coins! Total: ${shop.getCoins()}`;
      msg.style.color = '#ffcc22';
    });

    this.panel.querySelector('#admin-max-ammo')!.addEventListener('click', () => {
      // Find the active GameScene player
      const gameScene = this.scene.scene.get('GameScene') as any;
      if (gameScene?.player) {
        for (const w of gameScene.player.weapons) {
          w.magazineAmmo = w.def.magazineSize;
          w.reserveAmmo = w.def.maxReserve;
        }
        msg.textContent = 'All weapons maxed out!';
        msg.style.color = '#4488ff';
      } else {
        msg.textContent = 'Start a game first!';
        msg.style.color = '#ff4444';
      }
    });

    this.panel.querySelector('#admin-close')!.addEventListener('click', () => {
      this.closeAdminPanel();
    });
  }

  private closeAdminPanel() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.keyHandler);
    this.closeCmdInput();
    this.closeAdminPanel();
  }
}
