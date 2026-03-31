# Plan: Меню в грі + меню налаштувань (Wishlist #15)

## Що робимо

ESC тепер скрізь відкриває меню. Прибираємо кнопку VOLUME з головного меню — вона заважає.

## 1. Головне меню (MenuScene) — ESC відкриває меню налаштувань
- **Прибрати кнопку VOLUME** з нижньої панелі кнопок
- **ESC** відкриває overlay з налаштуванням звуку (слайдер гучності)
- Хрестик ✕ або повторний ESC — закриває

## 2. Ігрове меню (UIScene) — ESC відкриває pause menu
Коли гравець натискає ESC під час гри:
- Гра на **паузі**
- Overlay меню:
  - **✕** у правому верхньому куті
  - **Кіли** за сесію (прибираємо з HUD)
  - **Матеріали** wood/metal/screws (прибираємо з HUD)
  - **Слайдер гучності**
  - **Кнопка "BACK TO GAME"**
- Повернення: меню закривається → **3... 2... 1... GO!** → гра продовжується

## Зміни по файлах

### `src/scenes/MenuScene.ts`
- Прибрати кнопку VOLUME зі списку кнопок
- Прибрати код створення volume слайдера в меню
- Додати ESC handler → відкриває settings overlay (слайдер звуку + хрестик)

### `src/scenes/UIScene.ts`
- ESC handler: замість виходу → відкриває pause menu
- Створити pause menu overlay (кіли, матеріали, звук, Back to Game, хрестик)
- Прибрати з HUD: Score/Kills текст та панель матеріалів
- Countdown 3-2-1-GO при поверненні в гру
- Пауза: gameScene.scene.pause() / resume()

### `src/scenes/GameScene.ts`
- Мінімальні зміни для коректної паузи/resume

## Порядок роботи
1. MenuScene — прибрати VOLUME кнопку, додати ESC → settings overlay
2. UIScene — прибрати кіли та матеріали з HUD
3. UIScene — створити pause menu overlay
4. UIScene — ESC handler + пауза/resume
5. UIScene — countdown 3-2-1-GO
6. Тест
