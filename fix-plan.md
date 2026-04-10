# Plan: Prisma + PostgreSQL

## Що зараз
- `server/index.ts` використовує raw `pg` і створює таблицю вручну через `CREATE TABLE IF NOT EXISTS`
- Немає міграцій, немає типізації, немає нормальної схеми

## Що робимо

### 1. Встановити Prisma v6
```bash
npm install prisma@6 @prisma/client@6
```

### 2. Ініціалізувати Prisma
```bash
npx prisma init --datasource-provider postgresql
```

### 3. Схема (`prisma/schema.prisma`)
```prisma
model Profile {
  name      String   @id
  data      Json
  updatedAt DateTime @updatedAt
}
```

### 4. Запустити міграцію
```bash
npx prisma migrate dev --name init
```

### 5. Замінити raw `pg` на Prisma Client в `server/index.ts`
- `pool.query(...)` → `prisma.profile.findUnique(...)` / `prisma.profile.upsert(...)`

### 6. Оновити Dockerfile
- Додати `npx prisma generate` при білді
- Додати `npx prisma migrate deploy` перед стартом сервера

---

Підтверджуєш?
