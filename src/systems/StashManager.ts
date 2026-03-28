// Stash system — safe storage between games
// Deposit items from inventory, withdraw to inventory
// Stored in player profile

import { profile } from './ProfileManager';

export type StashItem = 'bandages' | 'medkits' | 'wood' | 'metal' | 'screws';

class StashManager {
  getStash() {
    return profile.getStash();
  }

  getAmount(type: StashItem): number {
    return this.getStash()[type];
  }

  deposit(type: StashItem, amount: number) {
    const stash = this.getStash();
    stash[type] += amount;
    profile.setStash(stash);
  }

  withdraw(type: StashItem, amount: number): number {
    const stash = this.getStash();
    const actual = Math.min(amount, stash[type]);
    stash[type] -= actual;
    profile.setStash(stash);
    return actual;
  }
}

export const stash = new StashManager();
