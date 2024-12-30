# Vitality

Your all-in-one modern fitness tracker for progress and performance to fuel your fitness goals. Feel free to use any of the related code for your own projects! The application can be accessed [http://localhost/](http://localhost/) after setting up development environment. Note that this project is a work in progress.

## User Guide

## Development

**Install Dependencies:**

```bash
npm install
```

**Create Project Build:**

```bash
npm run build
```

**Start Development:**

```bash
docker compose up
```

**Pause Development:**

```bash
docker compose stop
```

**Restart Development (Clear Containers, Networks, Volumes):**

```bash
docker compose down -v --remove-orphans
```

### Logs

**View Real-time Logs for All Containers:**

```bash
docker compose logs -f
```

**View Recent Logs for All Containers:**

```bash
docker compose logs
```

**View Recent Logs for Specific Container:**

```bash
docker logs <container-name>
```

## Database

**Access Database via Docker Container:**

```bash
docker exec -it vitality_postgres psql -U postgres -d vitality
```

**Access Database via Prisma ORM:**

```bash
docker exec -it vitality_app npx prisma studio
```

**Make Schema Changes (Development):**

- Edit `tests/init.sql`
- Apply changes to Prisma ORM:

```bash
docker exec -it vitality_app npx prisma db pull
```

**Apply Migrations with Prisma ORM:**

- Modify the model in `prisma/schema.prisma`
- Apply migrations with:

```bash
docker exec -it vitality_app npx prisma migrate dev --name <migration-name>
```

## Testing

**Run Unit Tests:**

```bash
npm run tests
```

## Linting

**Fix Linting Errors:**

```bash
npm run lint
```
