// Bestiary — tracks which zombie types the player has killed
const STORAGE_KEY = 'zombie-sim-bestiary';

class BestiaryManager {
  private unlocked: Set<string>;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.unlocked = saved ? new Set(JSON.parse(saved)) : new Set();
  }

  unlock(type: string) {
    if (this.unlocked.has(type)) return;
    this.unlocked.add(type);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.unlocked]));
  }

  isUnlocked(type: string): boolean {
    return this.unlocked.has(type);
  }

  getUnlocked(): string[] {
    return [...this.unlocked];
  }
}

export const bestiary = new BestiaryManager();
