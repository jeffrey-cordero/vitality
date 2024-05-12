# Vitality

Your all-in-one modern fitness tracker for progress and performance to fuel your fitness goals. A current work in progress. Feel free to use any of the related code for your own projects!

## Development

Docker is the cornerstone of the current development process. Services currently used to mimic to production environment include containers for NextJS, PostgreSQL, and Nginx all detailed in `docker-compose.yaml` file from root of project.

To start the development processes.

``` bash
docker compose up 
```

To pause development processes.

```bash

docker compose stop
```

To restart completely by clearing all associated containers, networks, and volumes.

```bash
docker compose down -v --remove-orphans 
```

The application can be accessed [http://localhost:3000/](http://localhost:3000/), which represents output from the app container. For a production-like environment, you can visit [http://localhost/](http://localhost/), which represents output from the Nginx container to mimic the Nginx Server on the production machine, crucial for optimized content delivery. The Nginx service can be commented it out in `docker-compose.yaml` to save resources.

### Logs

View logs for all services in realtime.

```bash
docker compose logs -f
```

View most recent logs for all services.

```bash
docker compose logs 
```

View most recent logs for specific services, which could also be realtime with the `-f` clause.

```bash
docker logs <container-name> 
```

## Database

There are 2 ways to currently access the database for viewing current state or making adjustments to manually records.

Through the docker container.

``` bash
docker exec -it vitality_postgres psql -U postgres -d vitality
```

Through the Prisma ORM service.

``` bash
docker exec -it vitality_app npx prisma studio
```

### Database migrations

Currently all database changes are made via `init.sql`. In the future, we will use Prisma ORM to efficiently make migrations needed while preserving sensitive user information through the following:

- Add the proposed changes to the model located at `prisma/schema.prisma`
- Run the following command to apply the changes

``` bash
docker exec -it vitality_app npx prisma migrate dev --name <migration-name>
```

## Testing

### Jest

Run all unit tests.

```bash
npm run test  
```

### Cypress

Run end-to-end tests.

```bash
npx cypress open
```

## Linting

View current potential linting errors / warnings based on `.eslintrc.json` specifications.

```bash
npx next lint --fix
```
