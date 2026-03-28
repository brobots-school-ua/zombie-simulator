// Location system — defines different map environments
// Each location has its own ground tiles, obstacle generation, and decorations
import { FIELD_MAP } from '../maps/fieldMap';
import { CITY_MAP } from '../maps/cityMap';

export interface LocationDef {
  id: string;
  name: string;
  displayName: string;
  groundTiles: string[];      // texture keys for floor tiles
  wallTexture: string;        // texture key for walls/buildings
  mapSize: number;
  decorations: DecorationDef[];
  tileMap: number[][];         // static 2D map: 0=empty, 1=wall, 2=zombie spawn
  spawnMode: 'random' | 'alleys';       // where zombies spawn
}

export interface DecorationDef {
  key: string;
  count: number;
  scale: number;
  depth: number;
  isTree?: boolean;  // trees get transparency effect
}

// Field location — open grassland with scattered obstacles (waves 1-5)
const FIELD: LocationDef = {
  id: 'field',
  name: 'field',
  displayName: 'THE FIELD',
  groundTiles: ['ground1', 'ground2', 'ground3', 'ground4', 'ground5'],
  wallTexture: 'wall',
  mapSize: 2000,
  decorations: [
    { key: 'deco-dead-tree', count: 12, scale: 2.5, depth: 12, isTree: true },
    { key: 'deco-bush', count: 12, scale: 0.8, depth: 0.9 },
    { key: 'deco-rock', count: 10, scale: 0.7, depth: 0.9 },
    { key: 'deco-barrel', count: 5, scale: 0.8, depth: 1.5 },
    { key: 'deco-crate', count: 4, scale: 0.8, depth: 1.5 },
  ],
  tileMap: FIELD_MAP,
  spawnMode: 'random',
};

// City location — urban environment with buildings and alleys (waves 6-10)
const CITY: LocationDef = {
  id: 'city',
  name: 'city',
  displayName: 'THE CITY',
  groundTiles: ['city-ground1', 'city-ground2', 'city-ground3', 'city-ground4', 'city-ground5'],
  wallTexture: 'city-wall',
  mapSize: 2000,
  decorations: [
    { key: 'deco-dumpster', count: 8, scale: 0.9, depth: 1.5 },
    { key: 'deco-car', count: 5, scale: 1.0, depth: 1.5 },
    { key: 'deco-lamppost', count: 10, scale: 1.0, depth: 12, isTree: true },
    { key: 'deco-barrel', count: 6, scale: 0.8, depth: 1.5 },
    { key: 'deco-crate', count: 6, scale: 0.8, depth: 1.5 },
  ],
  tileMap: CITY_MAP,
  spawnMode: 'alleys',
};

// All locations in order
export const LOCATIONS: LocationDef[] = [FIELD, CITY];

// Get location config for a given wave number
export function getLocationForWave(wave: number): LocationDef {
  if (wave <= 5) return FIELD;
  return CITY;
}

// Check if a wave transition requires a location change
export function shouldChangeLocation(fromWave: number, toWave: number): boolean {
  return getLocationForWave(fromWave).id !== getLocationForWave(toWave).id;
}
