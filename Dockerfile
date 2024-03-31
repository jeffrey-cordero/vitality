# Use the official PostgreSQL image from Docker Hub
FROM postgres:latest

# Set environment variables
ENV POSTGRES_DB=vitality-venture
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=root

# Create a directory for storing data
RUN mkdir -p /var/lib/postgresql/data

# Expose PostgreSQL port
EXPOSE 5432

# Start PostgreSQL service
CMD ["postgres"]
