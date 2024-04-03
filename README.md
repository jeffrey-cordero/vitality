## Vitality Venture



## Development
The local development process is simplified using docker containers for each service.
``` bash
docker-compose up
or
docker-compose up -d 
```

To stop development, run the following:
```bash
docker-compose down
```
The application can be accessed [here](http://localhost:3000/) once the server is up and running. Any local changes should be reflected relatively quickly.



## Connecting to the database 
All relevant credentials are stored in `docker-compose.yaml`
``` bash
psql -h localhost -p 5432 -U postgres -d vitality-venture
```

If the above is causing local port conflicts, you can change the `docker-compose.yaml` file to change the following host port:
``` yaml
ports:
      - "desired port:5432"
```
