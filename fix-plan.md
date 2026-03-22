# Fix Plan — Round 24: Базука фіксований дамаг

## Зміна: Базука — 50 дамагу по всьому радіусу без зменшення
**Файл 1:** `src/systems/WeaponConfig.ts` — damage 40→50
**Файл 2:** `src/scenes/GameScene.ts` → `doAoeDamage()` — прибрати формулу зменшення дамагу від відстані

**Було (GameScene doAoeDamage):**
```
damage * (1 - (dist / radius) * 0.5)  // на краю = 50% дамагу
```

**Стане:**
```
damage  // повний дамаг по всьому радіусу
```
