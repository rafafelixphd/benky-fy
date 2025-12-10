# PostgreSQL 17 Database for Benky-Fy
FROM postgres:17-alpine

# Copy initialization scripts
COPY database/init-scripts/ /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432

# Use default PostgreSQL entrypoint
# This will automatically run scripts in /docker-entrypoint-initdb.d/ on first start
