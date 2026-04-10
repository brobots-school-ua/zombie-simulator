# Fix Plan

## 1. Дерево всередині дому (швидкий фікс)

**Проблема:** `placeDecorations()` перевіряє `interiorBounds` — але це тільки внутрішня зона дому (без стін). Дерево може з'явитись на плитці стіни.

**Рішення:** Додати `footprint: Phaser.Geom.Rectangle` в `BuildingInfo` — повна зона дому зі стінами. Перевіряти `footprint` при розміщенні декорацій.

---

## 2. Крос-пристройове збереження

**Проблема:** `localStorage` зберігає дані тільки в браузері на одному пристрої.

**Рішення:** Простий Express бекенд, який зберігає профілі в PostgreSQL.

### Що змінюється:

**Новий файл: `server/index.ts`**
- Express сервер на порту 3001
- `GET /api/profile/:name` — завантажити профіль
- `POST /api/profile/:name` — зберегти профіль

**`src/systems/ProfileManager.ts`**
- `load()` і `save()` роблять fetch до API
- Fallback на localStorage якщо сервер недоступний

**`package.json`**
- Скрипти: `server`, `dev:all` (запускає vite + express разом)

**Нові пакети:** `express`, `pg`, `@types/express`, `@types/pg`, `tsx`, `concurrently`

### Таблиця в БД:
```sql
CREATE TABLE profiles (
  name TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

Підтверджуєш?
