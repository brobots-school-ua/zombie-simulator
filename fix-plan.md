# Plan: PostgreSQL на VPS

## Проблема
`172.17.0.1:5433` — це PostgreSQL в Coder workspace.
VPS — окремий сервер, не має до нього доступу.

## Рішення
Додати PostgreSQL контейнер прямо в `docker-compose.yml` на VPS.

### docker-compose.yml — два сервіси:
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: zombie
      POSTGRES_PASSWORD: zombie2026
      POSTGRES_DB: zombie_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  app:
    build: .
    ports:
      - "4009:80"
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://zombie:zombie2026@db:5432/zombie_db
    restart: unless-stopped

volumes:
  pgdata:
```

### Dockerfile — додати міграцію при старті:
```
CMD: npx prisma migrate deploy && tsx server/index.ts
```

Дані зберігаються в Docker volume `pgdata` — не зникнуть при перезапуску.

---

Підтверджуєш?
