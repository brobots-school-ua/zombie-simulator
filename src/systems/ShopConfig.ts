// Shop system — accessories for the player
export interface Accessory {
  id: string;
  name: string;
  texture: string;
  price: number;
  offsetX: number;  // position offset on player sprite
  offsetY: number;
  depth: number;    // render depth relative to player (positive = above)
}

export const ACCESSORIES: Accessory[] = [
  { id: 'beret', name: 'Beret', texture: 'acc-beret', price: 15, offsetX: 6, offsetY: -6, depth: 1 },
  { id: 'bandana', name: 'Bandana', texture: 'acc-bandana', price: 8, offsetX: 0, offsetY: -6, depth: 1 },
  { id: 'sunglasses', name: 'Sunglasses', texture: 'acc-sunglasses', price: 12, offsetX: 0, offsetY: -2, depth: 2 },
  { id: 'scar', name: 'Battle Scar', texture: 'acc-scar', price: 5, offsetX: 2, offsetY: 0, depth: 1 },
  { id: 'crown', name: 'Crown', texture: 'acc-crown', price: 50, offsetX: 0, offsetY: -16, depth: 3 },
  { id: 'backpack', name: 'Backpack', texture: 'acc-backpack', price: 30, offsetX: 0, offsetY: 10, depth: -1 },
];

const COINS_KEY = 'zombie-sim-coins';
const OWNED_KEY = 'zombie-sim-accessories';
const EQUIPPED_KEY = 'zombie-sim-equipped';

export class ShopManager {
  getCoins(): number {
    const v = localStorage.getItem(COINS_KEY);
    const n = v ? parseInt(v, 10) : 0;
    return isNaN(n) ? 0 : n;
  }

  setCoins(value: number) {
    localStorage.setItem(COINS_KEY, Math.max(0, Math.floor(value)).toString());
  }

  addCoins(amount: number) {
    this.setCoins(this.getCoins() + amount);
  }

  spendCoins(amount: number): boolean {
    const coins = this.getCoins();
    if (coins < amount) return false;
    this.setCoins(coins - amount);
    return true;
  }

  getOwned(): string[] {
    const data = localStorage.getItem(OWNED_KEY);
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  }

  owns(id: string): boolean {
    return this.getOwned().includes(id);
  }

  buy(id: string): boolean {
    const acc = ACCESSORIES.find(a => a.id === id);
    if (!acc) return false;
    if (this.owns(id)) return false;
    if (!this.spendCoins(acc.price)) return false;

    const owned = this.getOwned();
    owned.push(id);
    localStorage.setItem(OWNED_KEY, JSON.stringify(owned));
    return true;
  }

  getEquipped(): string | null {
    return localStorage.getItem(EQUIPPED_KEY);
  }

  equip(id: string) {
    if (!this.owns(id)) return;
    localStorage.setItem(EQUIPPED_KEY, id);
  }

  unequip() {
    localStorage.removeItem(EQUIPPED_KEY);
  }

  // Remove any owned accessories that no longer exist in config
  // Called once — uses a flag so it doesn't run repeatedly
  cleanupStale() {
    const doneKey = 'zombie-sim-cleanup-v2';
    if (localStorage.getItem(doneKey)) return;
    localStorage.setItem(doneKey, '1');

    const validIds = ACCESSORIES.map(a => a.id);
    const owned = this.getOwned();
    const stale = owned.filter(id => !validIds.includes(id));
    if (stale.length > 0) {
      // Remove stale items (no refund — they were from old versions)
      const clean = owned.filter(id => validIds.includes(id));
      localStorage.setItem(OWNED_KEY, JSON.stringify(clean));
    }
    const eq = this.getEquipped();
    if (eq && !validIds.includes(eq)) this.unequip();
  }

  resetShop() {
    // Refund all owned accessories
    for (const id of this.getOwned()) {
      const acc = ACCESSORIES.find(a => a.id === id);
      if (acc) this.addCoins(acc.price);
    }
    localStorage.setItem(OWNED_KEY, JSON.stringify([]));
    this.unequip();
  }

  refund(id: string): boolean {
    const acc = ACCESSORIES.find(a => a.id === id);
    if (!acc) return false;
    if (!this.owns(id)) return false;

    // Unequip if this is the equipped one
    if (this.getEquipped() === id) this.unequip();

    // Remove from owned
    const owned = this.getOwned().filter(a => a !== id);
    localStorage.setItem(OWNED_KEY, JSON.stringify(owned));

    // Return coins
    this.addCoins(acc.price);
    return true;
  }
}

export const shop = new ShopManager();
