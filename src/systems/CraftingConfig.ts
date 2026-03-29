// Crafting recipes for weapons
// Pistol is free (starter weapon), all others require materials + kills

export interface CraftRecipe {
  weaponId: string;
  name: string;
  wood: number;
  metal: number;
  screws: number;
  kills: number;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  { weaponId: 'rifle', name: 'Rifle', wood: 5, metal: 3, screws: 2, kills: 20 },
  { weaponId: 'shotgun', name: 'Shotgun', wood: 10, metal: 5, screws: 3, kills: 40 },
  { weaponId: 'sniper', name: 'Sniper', wood: 5, metal: 15, screws: 8, kills: 100 },
  { weaponId: 'grenade', name: 'Rocket Launcher', wood: 15, metal: 20, screws: 15, kills: 200 },
  { weaponId: 'minigun', name: 'Minigun', wood: 20, metal: 35, screws: 25, kills: 400 },
];
