# Fix Plan — Round 23: Aggro range

## Зміна: Збільшити радіус деагро з 1.5x до 2x
**Файл:** `src/entities/Zombie.ts` рядок 154
**Було:** `dist > this.detectionRange * 1.5`
**Стане:** `dist > this.detectionRange * 2`

Результат:
- Walker: агро 300px, деагро 600px
- Runner: агро 400px, деагро 800px
- Tank: агро 250px, деагро 500px
