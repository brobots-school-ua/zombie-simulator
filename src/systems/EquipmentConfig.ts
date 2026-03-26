// Equipment system — helmet and belt slots

export interface EquipmentItem {
  id: string;
  name: string;
  slot: 'helmet' | 'belt';
  tier: number;
  price: number;
  description: string;
  // Stats
  hpBonus?: number;         // flat HP added
  speedMultiplier?: number;  // e.g. 1.1 = +10%, 1.5 = +50%
}

export const EQUIPMENT: EquipmentItem[] = [
  // Helmets — add flat HP
  { id: 'helmet-1', name: 'Light Helmet', slot: 'helmet', tier: 1, price: 30, description: '+25 HP', hpBonus: 25 },
  { id: 'helmet-2', name: 'Military Helmet', slot: 'helmet', tier: 2, price: 80, description: '+50 HP', hpBonus: 50 },
  { id: 'helmet-3', name: 'Heavy Helmet', slot: 'helmet', tier: 3, price: 150, description: '+75 HP', hpBonus: 75 },
  // Belts — multiply current speed
  { id: 'belt-1', name: 'Utility Belt', slot: 'belt', tier: 1, price: 25, description: '+10% Speed', speedMultiplier: 1.1 },
  { id: 'belt-2', name: 'Tactical Belt', slot: 'belt', tier: 2, price: 70, description: '+25% Speed', speedMultiplier: 1.25 },
  { id: 'belt-3', name: 'Speed Harness', slot: 'belt', tier: 3, price: 140, description: '+50% Speed', speedMultiplier: 1.5 },
];

const EQUIPPED_KEY = 'zombie-sim-equipment';
const OWNED_KEY = 'zombie-sim-equipment-owned';

export class EquipmentManager {
  getOwned(): string[] {
    try {
      const v = localStorage.getItem(OWNED_KEY);
      return v ? JSON.parse(v) : [];
    } catch { return []; }
  }

  owns(id: string): boolean {
    return this.getOwned().includes(id);
  }

  getEquipped(): { helmet: string | null; belt: string | null } {
    try {
      const v = localStorage.getItem(EQUIPPED_KEY);
      return v ? JSON.parse(v) : { helmet: null, belt: null };
    } catch { return { helmet: null, belt: null }; }
  }

  buy(id: string, coins: number): boolean {
    const item = EQUIPMENT.find(e => e.id === id);
    if (!item || this.owns(id) || coins < item.price) return false;
    const owned = this.getOwned();
    owned.push(id);
    localStorage.setItem(OWNED_KEY, JSON.stringify(owned));
    return true;
  }

  equip(id: string) {
    const item = EQUIPMENT.find(e => e.id === id);
    if (!item || !this.owns(id)) return;
    const equipped = this.getEquipped();
    equipped[item.slot] = id;
    localStorage.setItem(EQUIPPED_KEY, JSON.stringify(equipped));
  }

  unequip(slot: 'helmet' | 'belt') {
    const equipped = this.getEquipped();
    equipped[slot] = null;
    localStorage.setItem(EQUIPPED_KEY, JSON.stringify(equipped));
  }

  // Get total HP bonus from equipped items
  getHpBonus(): number {
    const equipped = this.getEquipped();
    if (!equipped.helmet) return 0;
    const item = EQUIPMENT.find(e => e.id === equipped.helmet);
    return item?.hpBonus || 0;
  }

  // Get speed multiplier from equipped belt
  getSpeedMultiplier(): number {
    const equipped = this.getEquipped();
    if (!equipped.belt) return 1;
    const item = EQUIPMENT.find(e => e.id === equipped.belt);
    return item?.speedMultiplier || 1;
  }
}

export const equipment = new EquipmentManager();
