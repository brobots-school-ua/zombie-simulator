# Fix Plan — Round 27: Bestiary text + Boss stomp rework

## Зміна 1: Бестіарій — прибрати пікселі, писати словами
**Файл:** `src/scenes/MenuScene.ts` → `openBestiary()`

Замінити:
- "Aura: 10 dmg/sec (100px)" → "Aura: 10 dmg/sec, medium range"
- "Death: toxic puddle (5 sec)" → "Death: toxic puddle for 5 sec"
- "Contact: explosion 50 dmg (70px)" → "Contact: big explosion, 50 dmg"
- "Death: explosion 35 dmg (40px)" → "Death: small explosion, 35 dmg"
- "Stomp: 15 AoE dmg / 3 sec (120px)" → "Stomp: 15 dmg, large range"
- "Always aggro, 2x size" → "Always aggro, huge size"

## Зміна 2: Boss stomp — тільки коли гравець в радіусі + анімація підготовки
**Файл:** `src/entities/Zombie.ts` → boss блок в `update()`

Зараз: бос штампує кожні 3 сек незалежно від дистанції.

Нова логіка:
1. Таймер стомпу тікає завжди (кожні 3 сек)
2. Коли таймер готовий І гравець в радіусі 120px:
   - Бос зупиняється (velocity = 0)
   - Починається анімація підготовки 1 сек: бос піднімає "ногу" — спрайт стискається по Y (scaleY 2→1.5) і тінтується фіолетовим
   - Через 1 сек — stomp! Удар, шкода, шоквейв
   - Бос повертається до нормального стану (scaleY 2) і продовжує рухатися

## Зміна 3: Weapon balance
**Файл:** `src/systems/WeaponConfig.ts`

- **Minigun:** damage 6→12, fireRate 50→33ms (30 пострілів/сек, було 20)
  - DPS: 120 → 360
- **Rocket Launcher:** name "Launcher"→"Rocket Launcher", damage 50→100, aoeRadius 80→96 (1.2x)

Всі назви вже з великої букви (Rifle, Shotgun, Sniper, Minigun).

**Файли для зміни:**
- `src/scenes/MenuScene.ts`
- `src/entities/Zombie.ts`
- `src/systems/WeaponConfig.ts`
