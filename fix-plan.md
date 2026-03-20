# Fix Plan

## Bug 1: Pickups spawn from zombies → ammo should spawn randomly on map
**Problem:** Pickups (health + ammo) drop when zombie dies.
**Fix:** Remove drop logic from zombie death. Remove health pickups entirely. Only ammo spawns on random map positions every 10-15 seconds.
**Files:** `src/scenes/GameScene.ts`

## Bug 2: Remove health pickups, add HP regeneration
**Problem:** Health pickups are not needed.
**Fix:** Remove health pickup logic. Add passive HP regen to player: +1 HP every second (only player, not zombies).
**Files:** `src/entities/Player.ts`, `src/scenes/GameScene.ts`

## Bug 3: Player can walk through map edges — no border walls
**Problem:** World bounds not enforced visually.
**Fix:** Enable `setCollideWorldBounds(true)` on player and zombies. Add visible wall sprites around the entire map border.
**Files:** `src/entities/Player.ts`, `src/scenes/GameScene.ts`

## Bug 4: Bullets fly through walls
**Problem:** No collision between bullets and walls.
**Fix:** Add `physics.add.overlap(bullets, walls)` that destroys bullet on contact.
**Files:** `src/scenes/GameScene.ts`
