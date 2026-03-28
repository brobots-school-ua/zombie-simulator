// Bestiary — tracks which zombie types the player has killed
import { profile } from './ProfileManager';

class BestiaryManager {
  unlock(type: string) {
    profile.unlockBestiary(type);
  }

  isUnlocked(type: string): boolean {
    return profile.isBestiaryUnlocked(type);
  }

  getUnlocked(): string[] {
    return profile.getBestiary();
  }
}

export const bestiary = new BestiaryManager();
