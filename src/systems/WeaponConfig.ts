// Weapon system configuration
export interface WeaponDef {
  id: string;
  name: string;
  texture: string;
  bulletTexture: string;  // projectile texture key
  damage: number;
  fireRate: number;       // ms between shots
  magazineSize: number;
  startReserve: number;   // initial reserve ammo
  maxReserve: number;
  bulletSpeed: number;
  maxRange: number;
  reloadTime: number;     // ms
  spread: number;         // degrees of random spread (0 = perfect accuracy)
  pellets: number;        // bullets per shot (shotgun = 5)
  pelletSpread: number;   // degrees between pellets (shotgun fan)
  pierce: number;         // how many zombies bullet passes through (1 = normal)
  aoeRadius: number;      // explosion radius (0 = none)
  key: string;            // keyboard key (1-5)
}

export const WEAPONS: WeaponDef[] = [
  {
    id: 'rifle',
    name: 'Rifle',
    texture: 'weapon-rifle',
    bulletTexture: 'bullet-rifle',
    damage: 15,
    fireRate: 150,
    magazineSize: 30,
    startReserve: 60,
    maxReserve: 60,
    bulletSpeed: 500,
    maxRange: 500,
    reloadTime: 1500,
    spread: 0,
    pellets: 1,
    pelletSpread: 0,
    pierce: 1,
    aoeRadius: 0,
    key: 'ONE',
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    texture: 'weapon-shotgun',
    bulletTexture: 'bullet-shotgun',
    damage: 6,
    fireRate: 600,
    magazineSize: 8,
    startReserve: 16,
    maxReserve: 16,
    bulletSpeed: 400,
    maxRange: 250,
    reloadTime: 2000,
    spread: 0,
    pellets: 5,
    pelletSpread: 8,
    pierce: 1,
    aoeRadius: 0,
    key: 'TWO',
  },
  {
    id: 'smg',
    name: 'SMG',
    texture: 'weapon-smg',
    bulletTexture: 'bullet-smg',
    damage: 8,
    fireRate: 50,
    magazineSize: 45,
    startReserve: 90,
    maxReserve: 90,
    bulletSpeed: 450,
    maxRange: 350,
    reloadTime: 1200,
    spread: 5,
    pellets: 1,
    pelletSpread: 0,
    pierce: 1,
    aoeRadius: 0,
    key: 'THREE',
  },
  {
    id: 'sniper',
    name: 'Sniper',
    texture: 'weapon-sniper',
    bulletTexture: 'bullet-sniper',
    damage: 50,
    fireRate: 800,
    magazineSize: 5,
    startReserve: 10,
    maxReserve: 10,
    bulletSpeed: 700,
    maxRange: 800,
    reloadTime: 2500,
    spread: 0,
    pellets: 1,
    pelletSpread: 0,
    pierce: 3,
    aoeRadius: 0,
    key: 'FOUR',
  },
  {
    id: 'grenade',
    name: 'Launcher',
    texture: 'weapon-grenade',
    bulletTexture: 'bullet-rocket',
    damage: 40,
    fireRate: 1200,
    magazineSize: 1,
    startReserve: 10,
    maxReserve: 15,
    bulletSpeed: 300,
    maxRange: 400,
    reloadTime: 3000,
    spread: 0,
    pellets: 1,
    pelletSpread: 0,
    pierce: 1,
    aoeRadius: 80,
    key: 'FIVE',
  },
];
