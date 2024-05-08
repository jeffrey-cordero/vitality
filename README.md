# Vitality

Your all-in-one modern fitness tracker for progress and performance to fuel your fitness goals.

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

The application can be accessed [http://localhost:3000/](http://localhost:3000/), which represents output from the NextJS container. For a production-like environment, you can visit [http://localhost/](http://localhost/), which represents output from the Nginx container to mimic the Nginx Server on the production machine, crucial for optimized content delivery. The Nginx service can be commented it out in `docker-compose.yaml` to save resources.

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

The PostgreSQL database is called `vitality` and can be accessed through the local 5432 port. For any conflicts, you can change the port attached to your local machine in the `docker-compose.yaml` file.

``` yaml
services:
      postgres:   
            ...
            ports:
                  - "[X]:5432"
            ...
```

There are 2 ways to currently access the database for viewing current state or making adjustments to records.

Through the docker container.

``` bash
docker exec -it vitality_postgres psql -U postgres -d vitality
```

Through the Prisma ORM.

``` bash
npx prisma studio
```

### Database migrations

- Add the proposed changes to the model located at `prisma/schema.prisma`
- Run the following command to apply the changes

``` bash
docker exec -it vitality_app npx prisma migrate dev --name <migration-name>
```

## Testing

### Jest

Run all unit tests.

```bash
npx jest  
```

### Cypress

```bash
npx cypress open
```


## Linting

```bash
npx next lint OR npx next lint --fix
```