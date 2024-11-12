# Vitality

Your all-in-one modern fitness tracker for progress and performance to fuel your fitness goals. Feel free to use any of the related code for your own projects! The application can be accessed [http://localhost:3000/](http://localhost:3000/) after setting up development environment. Note that this project is a work in progress.

## Development

To start development processes

``` bash
docker compose up 
```

To pause development processes

```bash

docker compose stop
```

To restart restart development by clearing all associated application containers, networks, and volumes

```bash
docker compose down -v --remove-orphans 
```

### Logs

View logs for all service containers in realtime

```bash
docker compose logs -f
```

View most recent logs for all service containers

```bash
docker compose logs 
```

View most recent logs for specific service containers

```bash
docker logs <container-name> 
```

## Database

Access database through the docker container

``` bash
docker exec -it vitality_postgres psql -U postgres -d vitality
```

Access database  through the Prisma ORM

``` bash
docker exec -it vitality_app npx prisma studio
```

Make changes to the default database schema in a development environment through the following steps

- Make changes in the starter file `tests/init.sql`
- Run the following command to apply the changes

```bash
docker exec -it vitality_app npx prisma db pull
docker exec -it vitality_app npx prisma db push
```

Use Prisma ORM to efficiently make migrations while preserving sensitive user information through the following steps

- Add the proposed changes to the model located at `prisma/schema.prisma`
- Run the following command to apply the changes

``` bash
docker exec -it vitality_app npx prisma migrate dev --name <migration-name>
```

## Testing

### Jest

Run unit tests

```bash
npm run tests
```

## Linting

View current potential linting errors / warnings based on `.eslintrc.json` specifications

```bash
npx eslint . --fix
```
