# Fix Plan — Round 3

## 1. Зменшити кількість куль з пікапу
**Problem:** Гравець отримує забагато куль за раз (15 в запас).
**Fix:** Зменшити `value` для ammo pickup з 15 до 5-7 куль.
**Files:** `src/entities/Pickup.ts`

## 2. Zombie spawn rates — більше танків і раннерів
**Problem:** Танки майже не з'являються, раннерів мало.
**Fix:** Змінити ймовірності:
- Wave 1-2: 100% walkers (як зараз)
- Wave 3+: 60% walker, 30% runner, 10% tank
- Wave 5+: 40% walker, 35% runner, 25% tank
- Wave 8+: 30% walker, 35% runner, 35% tank
**Files:** `src/scenes/GameScene.ts`

## 3. HP bar для зомбі
**Problem:** Гравець не бачить скільки HP залишилось у зомбі.
**Fix:** Додати маленький HP bar над кожним зомбі (зелений/жовтий/червоний залежно від %). Малювати через `Graphics` об'єкт прив'язаний до зомбі.
**Files:** `src/entities/Zombie.ts`

## 4. Красивіші текстури — трава
**Problem:** Трава — просто зелений квадрат.
**Fix:** Генерувати текстуру трави з варіаціями кольору, крапками різних відтінків зеленого, маленькими травинками. Додати 2-3 варіанти тайлів для різноманітності.
**Files:** `src/scenes/BootScene.ts`, `src/scenes/GameScene.ts`

## 5. Красивіші текстури — каміння замість стін
**Problem:** Стіни — сірі квадрати без деталей.
**Fix:** Замінити текстуру `wall` на каміння: сірі/коричневі відтінки з нерівностями, тріщинами, тінями. Зробити вигляд натурального каменю.
**Files:** `src/scenes/BootScene.ts`

---

# Fix Plan — Round 4

## 6. Повноекранна гра
**Status:** ✅ Done

## 7. Ремодель гравця — куля замість куба
**Status:** ✅ Done

## 8. Зброя обертається окремо від тіла
**Status:** ✅ Done

## 9. Кулі вилітають з дула зброї
**Status:** ✅ Done

---

# Fix Plan — Round 5

## 10-16. Камера, мінімапа, меню, текстури
**Status:** ✅ All Done

---

# Fix Plan — Round 6: Music + Texture Polish

## 17. Процедурна музика (Web Audio API)

**Problem:** В грі немає музики — ні в меню, ні під час гри.
**Solution:** Створити `src/systems/AudioManager.ts` — клас що генерує музику з коду (без аудіо файлів).

### Menu Music (dark ambient):
- Низькочастотні дрони (oscillators 50-80 Hz) з повільною LFO модуляцією
- Періодичні дисонуючі тони (eerie stings) — високі ноти що з'являються і зникають
- Фільтрований шум для атмосфери вітру
- Reverb для глибини
- Плавний fade-in при старті сцени

### Game Music (action loop):
- Синтезований kick drum (4/4 beat) + hi-hat pattern
- Напружена басова лінія (мінорна тональність)
- Інтенсивність зростає з номером хвилі (tempo/filter)
- Безшовний цикл

### Інтеграція:
- MenuScene → запуск menu music, зупинка при переході до гри
- GameScene → запуск game music, передача номера хвилі для інтенсивності
- GameOverScene → fade out музики
- Обробка browser autoplay policy (AudioContext resume на перший клік)

---

## 18. Покращення текстури зброї (28x12 → 32x14)

**Problem:** Зброя виглядає як простий сірий прямокутник з коричневою рукояткою.
**Fix:**
- Силует гвинтівки: приклад → ресивер → ствол
- Металевий градієнт (темна сталь з highlight полосками)
- Мушка / приціл зверху
- Дульний гальмо (muzzle brake)
- Текстура дерева на рукоятці

---

## 19. Покращення текстур трави (64x64, 3 варіанти)

**Problem:** Трава виглядає одноманітно — прямокутні плями і прості травинки.
**Fix:**
- Багатша палітра: природні відтінки зеленого, коричневого, жовтого
- Нерівні плями землі/бруду (не прямокутники, а кілька перекриваючихся кіл)
- Маленькі квіточки (жовті, білі, фіолетові точки) — по 2-3 на тайл
- Різноманітніші травинки (різна довжина, напрямок, колір)
- Тіньові плями для глибини
- Камінчики з highlight (не просто квадрат, а з блік-точкою)

---

## 20. Покращення текстур стін (64x64)

**Problem:** Стіни — простий brick pattern, не виглядає апокаліптично.
**Fix:**
- Вивітрена, постапокаліптична поверхня
- Тріщини — branching lines (основна тріщина + відгалуження)
- Зелений мох в кутах та між цеглинами
- Темні плями крові/іржі
- Нерівна товщина швів (mortar lines)
- 3D ілюзія: світлий верх / темний низ кожної цеглини
- Загально темніша, брудніша палітра

---

## Files to Create/Modify

| File | Action |
|---|---|
| `src/systems/AudioManager.ts` | **CREATE** — процедурна музика |
| `src/scenes/BootScene.ts` | **MODIFY** — покращені текстури зброї, трави, стін |
| `src/scenes/MenuScene.ts` | **MODIFY** — запуск menu music |
| `src/scenes/GameScene.ts` | **MODIFY** — запуск game music + wave intensity |
| `src/scenes/GameOverScene.ts` | **MODIFY** — fade out музики |

## Порядок реалізації

1. `AudioManager.ts` — створити систему музики
2. `BootScene.ts` — покращити текстури зброї, трави, стін
3. `MenuScene.ts` — інтегрувати menu music
4. `GameScene.ts` — інтегрувати game music
5. `GameOverScene.ts` — fade out музики
6. Тест всього разом

---

# Fix Plan — Round 7: Weapon fix, Ammo display, Volume slider

## 21. Зброя "дригається" при ходьбі

**Problem:** Weapon sprite оновлює позицію в `Player.update()`, але через різницю в таймінгу між physics update та render, зброя може візуально "відставати" на 1 кадр від гравця.
**Fix:** Оновлювати позицію зброї в `preUpdate()` замість `update()`, щоб вона завжди синхронізувалась з позицією гравця до рендеру. Також прив'язати позицію зброї безпосередньо до sprite position через scene `postupdate` event.
**Files:** `src/entities/Player.ts`

## 22. Формат відображення патронів

**Problem:** Зараз показує `Ammo: 30/30 | Reserve: 30` — незрозуміло, обидва числа "30/30" не змінюються, а змінюється тільки Reserve.
**Fix:** Змінити формат на `Ammo: 30 / 30` де перше число = кулі в магазині, друге = кулі в запасі. Без слова "Reserve".
**Files:** `src/scenes/UIScene.ts`

## 23. Повзунок гучності в меню та грі

**Problem:** Немає можливості регулювати гучність музики.
**Fix:** Додати повзунок (slider) з шкалою від 25% до 200%:
- **В меню (MenuScene)**: повзунок в нижній частині екрану, перед контролами
- **В грі (UIScene)**: маленька іконка/кнопка гучності, при натисканні відкриває повзунок
- **Повзунок**: трек (сіра лінія) + рухомий кноб (зелений кружок) + відсоток тексту
- **AudioManager**: додати метод `setVolume(value: number)` що змінює `masterGain.gain.value`
- Зберігати значення в `localStorage` щоб зберігалось між сесіями
**Files:** `src/systems/AudioManager.ts`, `src/scenes/MenuScene.ts`, `src/scenes/UIScene.ts`

## Files to modify

| File | Action |
|---|---|
| `src/entities/Player.ts` | **MODIFY** — weapon position sync fix |
| `src/scenes/UIScene.ts` | **MODIFY** — ammo format + volume slider in-game |
| `src/scenes/MenuScene.ts` | **MODIFY** — volume slider in menu |
| `src/systems/AudioManager.ts` | **MODIFY** — add setVolume + localStorage |

## Порядок

1. Player.ts — фікс зброї
2. UIScene.ts — формат патронів
3. AudioManager.ts — метод setVolume + localStorage
4. MenuScene.ts — повзунок гучності
5. UIScene.ts — повзунок гучності в грі

---

# Fix Plan — Round 8: Empty mag hint + Minimap fix

## 24. Підказка "Empty magazine" при 0 кулях

**Problem:** Коли в магазині 0 куль, гравець не бачить що потрібно перезарядитись.
**Fix:** Біля тексту патронів (`ammoText`) показувати підказку `"Empty mag! Press R to reload"` коли `magazineAmmo === 0` і гравець не перезаряджається. Текст жовтого кольору, зникає коли гравець починає перезарядку або набирає кулі.
**Files:** `src/scenes/UIScene.ts`

## 25. Фікс мінімапи — неправильний прямокутник камери

**Problem:** Camera view rectangle на мінімапі показує неточну область. Використовується `cam.scrollX/scrollY` і ручний поділ на zoom, що дає похибку.
**Fix:** Замінити ручні розрахунки на `cam.worldView` — це вбудований Rectangle в Phaser що дає точні world-space координати видимої області (x, y, width, height), вже з урахуванням zoom.
**Files:** `src/scenes/UIScene.ts`

## 26. Система лідерборду з нікнеймами

**Problem:** Немає збереження результатів і мотивації грати знову.
**Fix:** Система лідерборду на localStorage:

### Введення імені (MenuScene):
- Текстове поле для нікнейму під кнопкою START
- Placeholder: "Enter nickname..."
- Можна залишити порожнім — тоді гра без запису в лідерборд
- Нікнейм зберігається в localStorage щоб не вводити щоразу

### Лідерборд у грі (UIScene):
- Маленький блок у верхньому правому куті (під Wave)
- Показує TOP 5 гравців (нікнейм + score)
- Поточний гравець підсвічується якщо потрапляє в топ

### Лідерборд в меню (MenuScene):
- Блок праворуч від кнопок
- TOP 5 гравців з іменами та результатами
- Окремо: "Your best: XXX" — найкращий власний результат (записується навіть без нікнейму)

### Збереження результату (GameOverScene):
- При смерті — зберегти результат в localStorage
- Якщо є нікнейм → записати в загальний лідерборд
- Завжди → оновити персональний рекорд якщо score вищий

### Структура даних (localStorage):
- `zombie-sim-nickname`: string — поточний нікнейм
- `zombie-sim-personal-best`: number — найкращий власний score
- `zombie-sim-leaderboard`: JSON масив `[{name, score, wave, date}]` — топ записи

**Files:** `src/scenes/MenuScene.ts`, `src/scenes/UIScene.ts`, `src/scenes/GameOverScene.ts`, `src/scenes/GameScene.ts`
