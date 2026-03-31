// Profile system — saves all player data under their nickname
// Each nickname = separate profile in localStorage

export interface ProfileData {
  kills: number;
  bestiary: string[];
  materials: { wood: number; metal: number; screws: number };
  stash: { bandages: number; medkits: number; wood: number; metal: number; screws: number };
  accessories: string[];
  equippedAccessory: string | null;
  equipment: string[];
  equippedEquipment: { helmet: string | null; belt: string | null };
  ability: string;
  unlockedWeapons: string[];
}

const PROFILE_PREFIX = 'zombie-profile-';
const ACTIVE_KEY = 'zombie-active-profile';

function emptyProfile(): ProfileData {
  return {
    kills: 0,
    bestiary: [],
    materials: { wood: 0, metal: 0, screws: 0 },
    stash: { bandages: 0, medkits: 0, wood: 0, metal: 0, screws: 0 },
    accessories: [],
    equippedAccessory: null,
    equipment: [],
    equippedEquipment: { helmet: null, belt: null },
    ability: 'big-bomb',
    unlockedWeapons: ['pistol'],
  };
}

class ProfileManager {
  private nickname: string = '';
  private data: ProfileData = emptyProfile();

  constructor() {
    // Load active profile on startup
    const saved = localStorage.getItem(ACTIVE_KEY);
    if (saved) {
      this.nickname = saved;
      this.load();
    }
    // Migrate old data if no profile exists yet
    this.migrateOldData();
  }

  // Migrate data from old localStorage keys into current profile
  private migrateOldData() {
    const migrated = localStorage.getItem('zombie-profile-migrated');
    if (migrated) return;

    // Only migrate if we have old data
    const oldKills = localStorage.getItem('zombie-sim-coins');
    if (!oldKills && !localStorage.getItem('zombie-sim-bestiary')) return;

    // Read old data
    if (oldKills) this.data.kills = parseInt(oldKills, 10) || 0;

    const oldBestiary = localStorage.getItem('zombie-sim-bestiary');
    if (oldBestiary) {
      try { this.data.bestiary = JSON.parse(oldBestiary); } catch {}
    }

    const oldMaterials = localStorage.getItem('zombie-sim-materials');
    if (oldMaterials) {
      try { this.data.materials = JSON.parse(oldMaterials); } catch {}
    }

    const oldAccessories = localStorage.getItem('zombie-sim-accessories');
    if (oldAccessories) {
      try { this.data.accessories = JSON.parse(oldAccessories); } catch {}
    }

    const oldEquipped = localStorage.getItem('zombie-sim-equipped');
    if (oldEquipped) this.data.equippedAccessory = oldEquipped;

    const oldEqOwned = localStorage.getItem('zombie-sim-equipment-owned');
    if (oldEqOwned) {
      try { this.data.equipment = JSON.parse(oldEqOwned); } catch {}
    }

    const oldEqEquipped = localStorage.getItem('zombie-sim-equipment');
    if (oldEqEquipped) {
      try { this.data.equippedEquipment = JSON.parse(oldEqEquipped); } catch {}
    }

    const oldAbility = localStorage.getItem('zombie-sim-ability');
    if (oldAbility) this.data.ability = oldAbility;

    // Save migrated data and mark as done
    this.save();
    localStorage.setItem('zombie-profile-migrated', '1');
  }

  getNickname(): string {
    return this.nickname;
  }

  // Activate a profile — save current, load new
  setNickname(name: string) {
    if (this.nickname) this.save();
    this.nickname = name.trim();
    localStorage.setItem(ACTIVE_KEY, this.nickname);
    this.load();
  }

  hasProfile(): boolean {
    return this.nickname.length > 0;
  }

  private load() {
    if (!this.nickname) {
      this.data = emptyProfile();
      return;
    }
    const raw = localStorage.getItem(PROFILE_PREFIX + this.nickname);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.data = { ...emptyProfile(), ...parsed };
      } catch {
        this.data = emptyProfile();
      }
    } else {
      this.data = emptyProfile();
    }
  }

  save() {
    if (!this.nickname) return;
    localStorage.setItem(PROFILE_PREFIX + this.nickname, JSON.stringify(this.data));
  }

  // === Kills ===
  getKills(): number { return this.data.kills; }
  setKills(v: number) { this.data.kills = Math.max(0, Math.floor(v)); this.save(); }
  addKills(amount: number) { this.setKills(this.data.kills + amount); }

  // === Bestiary ===
  getBestiary(): string[] { return this.data.bestiary; }
  isBestiaryUnlocked(type: string): boolean { return this.data.bestiary.includes(type); }
  unlockBestiary(type: string) {
    if (!this.data.bestiary.includes(type)) {
      this.data.bestiary.push(type);
      this.save();
    }
  }

  // === Materials ===
  getMaterials() { return this.data.materials; }
  setMaterials(m: { wood: number; metal: number; screws: number }) {
    this.data.materials = m;
    this.save();
  }

  // === Stash ===
  getStash() { return this.data.stash; }
  setStash(s: { bandages: number; medkits: number; wood: number; metal: number; screws: number }) {
    this.data.stash = s;
    this.save();
  }

  // === Accessories ===
  getAccessories(): string[] { return this.data.accessories; }
  ownsAccessory(id: string): boolean { return this.data.accessories.includes(id); }
  addAccessory(id: string) {
    if (!this.data.accessories.includes(id)) {
      this.data.accessories.push(id);
      this.save();
    }
  }
  removeAccessory(id: string) {
    this.data.accessories = this.data.accessories.filter(a => a !== id);
    this.save();
  }
  getEquippedAccessory(): string | null { return this.data.equippedAccessory; }
  equipAccessory(id: string) { this.data.equippedAccessory = id; this.save(); }
  unequipAccessory() { this.data.equippedAccessory = null; this.save(); }

  // === Equipment ===
  getEquipment(): string[] { return this.data.equipment; }
  ownsEquipment(id: string): boolean { return this.data.equipment.includes(id); }
  addEquipment(id: string) {
    if (!this.data.equipment.includes(id)) {
      this.data.equipment.push(id);
      this.save();
    }
  }
  getEquippedEquipment() { return this.data.equippedEquipment; }
  equipEquipment(slot: 'helmet' | 'belt', id: string) {
    this.data.equippedEquipment[slot] = id;
    this.save();
  }
  unequipEquipment(slot: 'helmet' | 'belt') {
    this.data.equippedEquipment[slot] = null;
    this.save();
  }

  // === Weapons ===
  getUnlockedWeapons(): string[] { return this.data.unlockedWeapons; }
  isWeaponUnlocked(id: string): boolean { return this.data.unlockedWeapons.includes(id); }
  unlockWeapon(id: string) {
    if (!this.data.unlockedWeapons.includes(id)) {
      this.data.unlockedWeapons.push(id);
      this.save();
    }
  }
  lockWeapon(id: string) {
    this.data.unlockedWeapons = this.data.unlockedWeapons.filter(w => w !== id);
    // Ensure pistol is always present as fallback
    if (this.data.unlockedWeapons.length === 0) {
      this.data.unlockedWeapons.push('pistol');
    }
    this.save();
  }

  // === Ability ===
  getAbility(): string { return this.data.ability; }
  setAbility(id: string) { this.data.ability = id; this.save(); }
}

export const profile = new ProfileManager();
