# PostgreSQL 17 Database for Benky-Fy
FROM postgres:17-alpine

# Set environment variables for database initialization
ENV POSTGRES_DB=benkyfy_db
ENV POSTGRES_USER=benkyfy_user
ENV POSTGRES_PASSWORD=changeme

# Copy initialization scripts
COPY init-scripts/ /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432

# Use default PostgreSQL entrypoint
# This will automatically run scripts in /docker-entrypoint-initdb.d/ on first start
