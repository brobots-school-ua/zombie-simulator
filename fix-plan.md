# План: Фікс переходу між локаціями (фінальний)

## Підхід
Замість перезапуску GameScene — залишаємо одну сцену і робимо метод `changeLocation()` який:
1. Показує чорний overlay з текстом
2. Знищує все (тайли, стіни, декорації, зомбі, кулі, пікапи)
3. Будує нову карту
4. Переміщує гравця в центр
5. Знімає overlay і спавнить зомбі

TransitionScene більше не потрібна — все відбувається всередині GameScene.

## Зміни

### GameScene.ts — новий метод `changeLocation(wave, playerState?)`
```
changeLocation(targetWave):
  1. Зберегти стан гравця (hp, зброя, ресурси)
  2. Показати чорний overlay + текст "Перехід на нову локацію"
  3. Зупинити UIScene
  4. Знищити: ground tiles, walls, decorations, zombies, bullets, pickups, shadows
  5. Оновити this.location і this.wave
  6. Побудувати нову карту (ground tiles, walls, decorations)
  7. Перемістити гравця в центр нової карти
  8. Перезапустити камеру bounds
  9. Запустити UIScene
  10. Fade out overlay → spawnWave()
```

### Що треба для очищення
- Ground tiles: зараз створюються як `this.add.image()` — вони не в групі. Треба зберігати їх в масив щоб потім знищити.
- Walls: `this.walls.clear(true, true)` — очищає StaticGroup
- Decorations/trees: зберігаються в `this.trees[]` — destroy all
- Zombies: `this.zombies.clear(true, true)`
- Bullets: `this.bullets.clear(true, true)`
- Pickups: `this.pickups.clear(true, true)`
- Zombie shadows: destroy all з Map
- Damage numbers: destroy all

### Що НЕ треба перестворювати
- Player (тільки переміщуємо)
- Physics colliders (вже налаштовані — walls група та ж сама)
- Input handlers (вже підключені)
- Pickup spawner timers (вже працюють)

### GameScene.ts — зміни в create()
- Зберігати ground tiles в масив `this.groundTiles: Phaser.GameObjects.Image[]`

### Де викликати changeLocation()
- В update() wave check замість scene.start('TransitionScene')
- В adminSetWave() замість scene.start('TransitionScene')

### TransitionScene.ts
- Видалити або залишити порожньою (більше не використовується)

## Результат
Жодних scene.start/stop/launch — все всередині однієї сцени. Зависання неможливе бо браузер вже відрендерив чорний overlay перед початком перебудови.
