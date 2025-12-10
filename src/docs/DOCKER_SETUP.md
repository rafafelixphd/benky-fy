# Docker Compose Setup Guide

## Quick Start

### 1. Create Environment File (if not exists)

Create a `.env` file in the root directory with your configuration:

```bash
# Database Configuration
DB_NAME=benkyfy_db
DB_USER=benkyfy_user
DB_PASSWORD=your-secure-password-here
DB_PORT=5432

# Flask Backend Configuration
FLASK_ENV=production
FLASK_SECRET_KEY=your-random-secret-key-here
BACKEND_PORT=8080

# Frontend Configuration
FRONTEND_PORT=3000
FLASK_API_URL=http://backend:8080
NEXT_PUBLIC_API_URL=http://localhost:8080

# Google OAuth (Required)
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-client-secret

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80,https://benkyfy.site

# Nginx Configuration (optional)
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

### 2. Build and Start All Services

```bash
# Build and start all services in detached mode
docker-compose up -d

# Or build and start with logs visible
docker-compose up --build
```

### 3. Check Service Status

```bash
# View running containers
docker-compose ps

# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Follow logs in real-time
docker-compose logs -f backend
```

### 4. Stop Services

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes database data)
docker-compose down -v
```

## Common Commands

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build backend
```

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Nginx**: http://localhost:80 (if enabled)
- **Database**: localhost:5432 (from host machine)

### Database Access

```bash
# Connect to database from host
psql -h localhost -p 5432 -U benkyfy_user -d benkyfy_db

# Execute SQL in container
docker-compose exec database psql -U benkyfy_user -d benkyfy_db

# Access database shell
docker-compose exec database psql -U benkyfy_user -d benkyfy_db
```

### Run Commands in Containers

```bash
# Execute command in backend container
docker-compose exec backend python -c "print('test')"

# Access shell in container
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Troubleshooting

### View Service Health

```bash
docker-compose ps
```

### Check Service Logs

```bash
# All services
docker-compose logs

# Specific service with timestamps
docker-compose logs -t backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Specific Service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Clean Start (removes everything)

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Service Dependencies

Services start in this order:
1. **database** (waits for health check)
2. **backend** (waits for database)
3. **frontend** (waits for backend)
4. **nginx** (waits for frontend + backend)

## Notes

- Database data persists in Docker volume `postgres_data`
- Init scripts in `database/init-scripts/` run automatically on first start
- To disable nginx, comment out the `nginx:` service section in `docker-compose.yml`
- Environment variables can be set in `.env` file or passed directly to `docker-compose up`
