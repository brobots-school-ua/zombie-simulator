// Ability definitions for the player
export interface AbilityDef {
  id: string;
  name: string;
  description: string;
  color: string;      // Neon color for UI
  emoji: string;
}

export const ABILITIES: AbilityDef[] = [
  {
    id: 'big-bomb',
    name: 'Big Bomb',
    description: 'Drops a bomb that explodes after 3 sec, dealing 300 damage in a huge radius around you',
    color: '#ff6600',
    emoji: '💣',
  },
  {
    id: 'mini-nuke',
    name: 'Mini Nuke',
    description: 'Zoom out, mark all zombies, click to launch a nuke — massive explosion + radiation',
    color: '#00ff66',
    emoji: '☢️',
  },
  {
    id: 'cryo-capsule',
    name: 'Cryo Capsule',
    description: 'Freezes all zombies for 5 sec and deals 50 damage to each',
    color: '#44ccff',
    emoji: '❄️',
  },
];

const STORAGE_KEY = 'zombie-sim-ability';

// Get/set selected ability
export function getSelectedAbility(): string {
  return localStorage.getItem(STORAGE_KEY) || 'big-bomb';
}

export function setSelectedAbility(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
}
