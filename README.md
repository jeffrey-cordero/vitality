## Vitality Venture

## starting dev
``` bash 
npx prisma generate 
```

## Development
The local development process is simplified using docker containers for dependencies like the database.
``` bash
docker-compose up -d 
npm run dev
```

To stop containers, run the following:
```bash

docker-compose down
```

To reset local environment, including all database data, run the following:
```bash
docker-compose down -v --remove-orphans

docker-compose up -d 
npm run dev
```

The application can be accessed [here](http://localhost:3000/) once the server is up and running. Any local changes should be reflected relatively quickly.



## Connecting to the database 
All relevant credentials are stored in `docker-compose.yaml`
``` bash
psql -h localhost -p 5432 -U postgres -d vitality-venture
or
docker exec -it vv_postgres_container psql -U postgres -d vitality-venture
```

To exit:
```bash
\q 

If the above is causing local port conflicts, you can change the `docker-compose.yaml` file to change the following host port:
``` yaml
ports:
      - "desired port:5432"
```


