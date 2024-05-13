FROM postgres

ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_DB=vitality_test

COPY init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432

HEALTHCHECK --interval=60s --timeout=5s --retries=5 CMD pg_isready -U postgres -d vitality_test

RUN mkdir -p /var/log/postgresql && chown -R postgres:postgres /var/log/postgresql

USER postgres

CMD ["postgres"]
