# Plan: Пістолет + Крафт зброї (Wishlist #25)

## Що робимо

Додаємо **Pistol** — нову стартову зброю. Гравець починає тільки з пістолетом.
Решту 5 зброй треба скрафтити з матеріалів + кілів.
Скрафтована зброя зберігається в профілі назавжди.

### Пістолет — характеристики
- Damage: 8
- Fire rate: 300ms
- Magazine: 12
- Reserve: 24
- Range: 350
- Semi-auto (не автоматичний)
- Слот: 1

### Рецепти крафту

| Зброя | Wood | Metal | Screws | Kills |
|-------|------|-------|--------|-------|
| Pistol | — | — | — | стартова |
| Rifle | 5 | 3 | 2 | 20 |
| Shotgun | 10 | 5 | 3 | 40 |
| Sniper | 5 | 15 | 8 | 100 |
| Rocket Launcher | 15 | 20 | 15 | 200 |
| Minigun | 20 | 35 | 25 | 400 |

## Зміни по файлах

### `src/systems/WeaponConfig.ts`
- Додати Pistol: damage 8, fireRate 300, magazine 12, reserve 24, range 350, semi-auto
- Слоти зсуваються: Pistol=1, Rifle=2, Shotgun=3, Sniper=4, Minigun=5, Rocket=6

### Новий файл: `src/systems/CraftingConfig.ts`
- Масив рецептів: для кожної зброї — потрібні матеріали (wood, metal, screws) + kills
- Pistol не входить (завжди відкрита)

### `src/systems/ProfileManager.ts`
- Додати поле `unlockedWeapons: string[]` в профіль (за замовчуванням `['pistol']`)
- Методи `unlockWeapon(weaponId)` і `isWeaponUnlocked(weaponId)`
- При крафті — списати матеріали і кіли, додати зброю в `unlockedWeapons`

### `src/entities/Player.ts`
- При ініціалізації зброї — перевіряти чи зброя розблокована в профілі
- Заблоковані зброї не додавати в масив доступних
- Слоти 1-5: показувати тільки відкриті зброї

### `src/scenes/MenuScene.ts`
- Нова вкладка "Workshop" (Майстерня) в головному меню
- Список зброї з іконками та рецептами
- Показує поточні ресурси гравця
- Кнопка "Craft" — активна якщо вистачає ресурсів
- Після крафту — анімація/повідомлення "Weapon unlocked!"

### `src/scenes/UIScene.ts`
- Слоти зброї: заблоковані показують замочок або затемнені
- При натисканні клавіші заблокованої зброї — нічого не відбувається

## Порядок роботи
1. WeaponConfig — додати Pistol + текстуру
2. CraftingConfig — рецепти
3. ProfileManager — поле unlockedWeapons + методи
4. Player — фільтрація зброї по розблокованих
5. MenuScene — UI майстерні
6. UIScene — замочки на слотах
7. Тест
