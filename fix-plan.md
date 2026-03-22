# Fix Plan — Round 26: Boss hitbox + preview + zombie overlap push

## Bug 1: Boss preview — показує текстуру walker замість boss
**Fix:** Додати `boss: 'zombie-boss'` в словник `textures` в `spawnWithMarker()`.
**Файл:** `src/scenes/GameScene.ts`

## Bug 2: Boss hitbox невірний
**Fix:** Збільшити hitbox боса під scale 2x.
**Файл:** `src/entities/Zombie.ts`

## Bug 3: Зомбі заходять один в одного
**НЕ collider** — бо тоді вони не зможуть ходити поруч і будуть відштовхуватися постійно.

**Підхід:** М'яке виштовхування в `GameScene.update()`:
- Кожен кадр перевіряємо пари зомбі
- Якщо відстань між центрами < мінімальна (наприклад 20px — це означає вони глибоко один в одному)
- Плавно відштовхуємо обох в протилежні сторони (невелика сила)
- Це дозволяє зомбі тертися один об одного (на дистанції 20-30px), але не стояти в одній точці

**Файл:** `src/scenes/GameScene.ts` → в `update()` додати цикл separation

```
for кожну пару зомбі:
  dist = відстань між центрами
  if dist < 20:
    angle = кут від одного до іншого
    push = (20 - dist) * 2  // чим глибше — тим сильніше
    zombie1 рухається від zombie2
    zombie2 рухається від zombie1
```

## Файли для зміни:
- `src/scenes/GameScene.ts` — фікси 1, 3
- `src/entities/Zombie.ts` — фікс 2
