// Shop system — accessories for the player
import { profile } from './ProfileManager';

export interface Accessory {
  id: string;
  name: string;
  texture: string;
  price: number;
  offsetX: number;
  offsetY: number;
  depth: number;
}

export const ACCESSORIES: Accessory[] = [
  { id: 'crown', name: 'Crown', texture: 'acc-crown', price: 200, offsetX: 0, offsetY: -16, depth: 3 },
];

export class ShopManager {
  getKills(): number { return profile.getKills(); }
  setKills(value: number) { profile.setKills(value); }
  addKills(amount: number) { profile.addKills(amount); }

  spendKills(amount: number): boolean {
    const kills = this.getKills();
    if (kills < amount) return false;
    this.setKills(kills - amount);
    return true;
  }

  getOwned(): string[] { return profile.getAccessories(); }
  owns(id: string): boolean { return profile.ownsAccessory(id); }

  buy(id: string): boolean {
    const acc = ACCESSORIES.find(a => a.id === id);
    if (!acc) return false;
    if (this.owns(id)) return false;
    if (!this.spendKills(acc.price)) return false;
    profile.addAccessory(id);
    return true;
  }

  getEquipped(): string | null { return profile.getEquippedAccessory(); }
  equip(id: string) { if (this.owns(id)) profile.equipAccessory(id); }
  unequip() { profile.unequipAccessory(); }

  resetShop() {
    for (const id of this.getOwned()) {
      const acc = ACCESSORIES.find(a => a.id === id);
      if (acc) this.addKills(acc.price);
    }
    // Clear all accessories
    for (const id of this.getOwned()) profile.removeAccessory(id);
    this.unequip();
  }

  refund(id: string): boolean {
    const acc = ACCESSORIES.find(a => a.id === id);
    if (!acc) return false;
    if (!this.owns(id)) return false;
    if (this.getEquipped() === id) this.unequip();
    profile.removeAccessory(id);
    this.addKills(acc.price);
    return true;
  }
}

export const shop = new ShopManager();
