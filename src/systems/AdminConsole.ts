import { leaderboard } from './LeaderboardManager';

const ADMIN_PASSWORD = 'nikitaadmin';

// Admin console — works in any scene via HTML overlay
export class AdminConsole {
  private scene: Phaser.Scene;
  private cmdInput: HTMLInputElement | null = null;
  private panel: HTMLDivElement | null = null;
  private active = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Listen for ~ key to toggle command input
    const tildeKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);
    tildeKey.on('down', () => {
      if (this.panel) return; // admin panel open, ignore
      if (this.cmdInput) {
        this.closeCmdInput();
      } else {
        this.openCmdInput();
      }
    });
  }

  private openCmdInput() {
    if (this.cmdInput) return;

    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();

    this.cmdInput = document.createElement('input');
    this.cmdInput.type = 'text';
    this.cmdInput.placeholder = 'Enter command...';
    this.cmdInput.style.cssText = `
      position: absolute;
      left: ${rect.left + 10}px;
      bottom: 10px;
      width: ${rect.width - 20}px;
      height: 30px;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid #44ff44;
      color: #44ff44;
      font-family: monospace;
      font-size: 14px;
      padding: 0 10px;
      outline: none;
      z-index: 2000;
    `;

    this.cmdInput.addEventListener('keydown', (e) => {
      e.stopPropagation(); // prevent game from receiving keys
      if (e.key === 'Enter') {
        const cmd = this.cmdInput?.value.trim() || '';
        this.handleCommand(cmd);
      }
      if (e.key === 'Escape') {
        this.closeCmdInput();
      }
    });

    document.body.appendChild(this.cmdInput);
    this.cmdInput.focus();
  }

  private closeCmdInput() {
    if (this.cmdInput) {
      this.cmdInput.remove();
      this.cmdInput = null;
    }
  }

  private handleCommand(cmd: string) {
    this.closeCmdInput();
    if (cmd === ADMIN_PASSWORD) {
      this.openAdminPanel();
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
      if (!name) { msg.textContent = 'Enter a nickname!'; return; }
      if (isNaN(score) || score < 0) { msg.textContent = 'Invalid score!'; return; }
      if (isNaN(wave) || wave < 1) { msg.textContent = 'Invalid wave!'; return; }
      leaderboard.adminAdd(name, score, wave);
      msg.textContent = `Added: ${name} — ${score} pts (wave ${wave})`;
      msg.style.color = '#44ff44';
    });

    this.panel.querySelector('#admin-clear')!.addEventListener('click', () => {
      leaderboard.clearLeaderboard();
      msg.textContent = 'Leaderboard cleared!';
      msg.style.color = '#ff4444';
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

  // Call when scene shuts down
  destroy() {
    this.closeCmdInput();
    this.closeAdminPanel();
  }
}
