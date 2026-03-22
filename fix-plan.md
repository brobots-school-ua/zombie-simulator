# Fix Plan — Round 21: Bug Fixes

## Bug 1: Камікадзе не вибухають при смерті від куль
**Причина:** В `GameScene.onZombieKilled()` (рядок 189) перевірка `z.explodeOnDeath && z.active`. Але `Zombie.takeDamage()` викликає `this.destroy()` при hp <= 0, що ставить `active = false`. Тому коли `onZombieKilled` перевіряє `z.active` — вона вже `false` і вибух ніколи не відбувається.
**Fix:** Зберегти дані для вибуху (позиція, тип) ПЕРЕД тим як перевіряти `z.active`. Перевіряти `z.explodeOnDeath` окремо від `z.active`.
**Файл:** `src/scenes/GameScene.ts` → `onZombieKilled()`

## Bug 2: Радіоактивні зомбі — аура не працює
**Причина:** Код аури правильний, але радіус 60px — дуже маленький (зомбі мусить бути практично впритул). Плюс **немає візуального ефекту**, тому гравець не бачить ауру навіть якщо вона дамажить.
**Fix:**
- Збільшити радіус аури з 60 до 100px
- Зменшити інтервал дамагу з 1000ms до 500ms (5 dmg кожні 0.5сек = 10 dmg/сек)
- Додати зелене світіння навколо radioactive зомбі (візуальний індикатор)
**Файл:** `src/entities/Zombie.ts` → `update()`

## Bug 3: Гра зависає при смерті гравця
**Причина:** `player-died` емітиться з `takeDamage()`, який викликається з physics collider callback. Перехід між сценами (`scene.stop/start`) всередині physics callback може зламати Phaser.
**Fix:** Обгорнути перехід у `this.time.delayedCall(100, ...)` щоб він відбувся після завершення physics step.
**Файл:** `src/scenes/GameScene.ts` → `player-died` handler

## Bug 4: Wishlist — додати пункт "меню в грі"
**Файл:** `wishlist/TODO.md`

## Файли для зміни:
- `src/scenes/GameScene.ts` — фікси 1, 3
- `src/entities/Zombie.ts` — фікс 2
- `wishlist/TODO.md` — пункт 4
