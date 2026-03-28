// Equipment system — helmet and belt slots
import { profile } from './ProfileManager';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: 'helmet' | 'belt';
  tier: number;
  price: number;
  description: string;
  hpBonus?: number;
  speedMultiplier?: number;
}

export const EQUIPMENT: EquipmentItem[] = [
  { id: 'helmet-1', name: 'Light Helmet', slot: 'helmet', tier: 1, price: 30, description: '+25 HP', hpBonus: 25 },
  { id: 'helmet-2', name: 'Military Helmet', slot: 'helmet', tier: 2, price: 80, description: '+50 HP', hpBonus: 50 },
  { id: 'helmet-3', name: 'Heavy Helmet', slot: 'helmet', tier: 3, price: 150, description: '+75 HP', hpBonus: 75 },
  { id: 'belt-1', name: 'Utility Belt', slot: 'belt', tier: 1, price: 25, description: '+10% Speed', speedMultiplier: 1.1 },
  { id: 'belt-2', name: 'Tactical Belt', slot: 'belt', tier: 2, price: 70, description: '+25% Speed', speedMultiplier: 1.25 },
  { id: 'belt-3', name: 'Speed Harness', slot: 'belt', tier: 3, price: 140, description: '+50% Speed', speedMultiplier: 1.5 },
];

export class EquipmentManager {
  getOwned(): string[] { return profile.getEquipment(); }
  owns(id: string): boolean { return profile.ownsEquipment(id); }

  getEquipped(): { helmet: string | null; belt: string | null } {
    return profile.getEquippedEquipment();
  }

  buy(id: string, kills: number): boolean {
    const item = EQUIPMENT.find(e => e.id === id);
    if (!item || this.owns(id) || kills < item.price) return false;
    profile.addEquipment(id);
    return true;
  }

  equip(id: string) {
    const item = EQUIPMENT.find(e => e.id === id);
    if (!item || !this.owns(id)) return;
    profile.equipEquipment(item.slot, id);
  }

  unequip(slot: 'helmet' | 'belt') {
    profile.unequipEquipment(slot);
  }

  getHpBonus(): number {
    const equipped = this.getEquipped();
    if (!equipped.helmet) return 0;
    const item = EQUIPMENT.find(e => e.id === equipped.helmet);
    return item?.hpBonus || 0;
  }

  getSpeedMultiplier(): number {
    const equipped = this.getEquipped();
    if (!equipped.belt) return 1;
    const item = EQUIPMENT.find(e => e.id === equipped.belt);
    return item?.speedMultiplier || 1;
  }
}

export const equipment = new EquipmentManager();
