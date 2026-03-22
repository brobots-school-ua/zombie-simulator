# Fix Plan — Round 25: Admin Wave Skip + Boss Wave 5

## Фіча 1: Адмін — вибір хвилі
**Файли:** `AdminConsole.ts`, `GameScene.ts`

### AdminConsole.ts:
- Додати секцію "Set Wave" між max ammo та spawn zombie
- Input для номера хвилі + кнопка "Set Wave"
- При натисканні викликає `gs.adminSetWave(waveNumber)`

### GameScene.ts — новий метод `adminSetWave(wave)`:
1. Вбити всіх живих зомбі БЕЗ нарахування монет/очків (просто destroy)
2. Поставити `this.wave = wave - 1` (бо spawnWave робить wave++ перед спавном... ні, wave++ в update, а spawnWave просто спавнить)
3. Скасувати поточний waveDelay якщо є
4. Поставити `this.wave = wave`, `this.zombiesRemaining = 0`, `this.waveDelay = false`
5. Викликати `spawnWave()` для нової хвилі

---

## Фіча 2: Бос на хвилі 5
**Файли:** `Zombie.ts`, `GameScene.ts`, `BootScene.ts`

### Дизайн боса — "Titan":
- **Вигляд:** Великий зомбі (2x розмір звичайного), темно-фіолетовий/бордовий, з червоними очима
- **HP:** 500
- **Швидкість:** 45 (повільний але невпинний)
- **Damage:** 30 (удар)
- **Detection range:** 9999 (бачить всю карту, як камікадзе)
- **Score:** 200
- **Coins:** 10
- **Спеціальна здібність:** Кожні 3 секунди робить "stomp" — AoE дамаг 15 в радіусі 120px (земля трясеться)

### Зміни по файлах:

**Zombie.ts:**
- Додати тип `'boss'` в ZombieType
- Додати конфіг боса в ZOMBIE_CONFIG
- В constructor: якщо boss → `setScale(2)`, оновити hitbox
- В update: логіка stomp (таймер 3сек → AoE дамаг + візуальний ефект)

**BootScene.ts:**
- Згенерувати текстуру `zombie-boss` та `zombie-boss-arms` (великий, темний)

**GameScene.ts:**
- В `spawnWave()`: якщо wave === 5, додати 1 боса разом зі звичайними зомбі
- Додати `'boss'` в zombie types для адмін-панелі

**AdminConsole.ts:**
- Додати boss в ZOMBIE_TYPES масив

---

## Фіча 3: Бестіарій (Bestiary)
**Файли:** новий `src/systems/BestiaryManager.ts`, `GameScene.ts`, `MenuScene.ts`

### Ідея:
Кнопка "BESTIARY" в головному меню (поряд з SHOP). Відкриває екран з картками зомбі яких гравець вже вбивав. Невбиті — заблоковані (силует + "???").

### BestiaryManager.ts (localStorage):
- Зберігає убитих типів зомбі: `zombie-sim-bestiary` → `["walker", "runner", ...]`
- `unlock(type)` — додати тип
- `isUnlocked(type)` → boolean

### GameScene.ts:
- В `onZombieKilled()` додати: `bestiary.unlock(z.zombieType)`

### MenuScene.ts:
- Кнопка "BESTIARY" (80x80, як SHOP/VOL) внизу зліва
- При натисканні — overlay з картками

### Картка зомбі (unlocked):
```
[спрайт]  Walker
HP: 50  |  Damage: 10  |  Speed: Slow
Special: —
```

### Картка зомбі (locked):
```
[темний силует]  ???
```

### Speed відображення:
- ≤50 → "Slow"
- 51-100 → "Normal"
- 101-150 → "Fast"
- >150 → "Very Fast"

### Спец характеристики:
- **Walker / Runner / Tank:** — (нічого)
- **Radioactive:** "Aura: 10 dmg/sec (100px)" + "Death: toxic puddle 5 sec"
- **Kamikaze:** "Contact: explosion 50 dmg (70px)" + "Death: explosion 35 dmg (40px)"
- **Boss (Titan):** "Stomp: 15 AoE dmg every 3 sec (120px)"
