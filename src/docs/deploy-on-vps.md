# Deployment Guide

This document outlines the deployment workflow for Benkyfy, utilizing a multi-stage process (Staging -> Production) to ensure stability.

## Prerequisites

Ensure your shell environment is set up with the necessary aliases and functions defined in `.localrc`.

```bash
source .localrc
```

This script provides the following shortcuts:
- `docker-dev`: Runs `docker compose -f docker-compose-local.yml`
- `docker-staging`: Runs `docker compose -f docker-compose-staging.yml`
- `docker-prod`: Runs `docker compose -f docker-compose.yml`
- `tag_benky_images`: Helper function to retag Docker images (e.g., staging -> latest).

---

## Deployment Workflow

### 1. Deploy to Staging

The staging environment uses `docker-compose-staging.yml` and tags images with `:staging`.

1.  **Pull latest changes:**
    ```bash
    git pull origin main
    ```

2.  **Build and deploy to staging:**
    ```bash
    # Rebuilds images and restarts containers in detached mode
    docker-staging up -d --build
    ```

3.  **Verify Staging:**
    Test the application functionality on the staging environment to ensure the new changes are stable.

### 2. Promote to Production

Once staging is verified, promote the stable images to production. This involves retagging the `:staging` images to `:latest` (or a specific version) and restarting the production services.

1.  **Tag images for Production:**
    Use the `tag_benky_images` function. By default, it tags `staging` -> `latest`.
    ```bash
    tag_benky_images
    ```
    *Output should show images like `benkyfy-backend`, `benkyfy-frontend`, etc., being tagged.*

2.  **Deploy to Production:**
    ```bash
    docker-prod up -d
    ```
    *Note: Since the images were already built and tagged in the previous step, this will simply recreate the containers with the new `:latest` images.*

---

## Versioning & Rollbacks

It is recommended to also tag images with a version number before promoting to latest. This allows for easy rollbacks.

### Creating a Version Checkpoint
Before (or after) promoting to latest, save the staging build as a numbered version (e.g., `v1.0`).

```bash
# Tags staging -> v1.0
tag_benky_images staging v1.0
```

### Rolling Back
If a critical issue is found in production (`latest`), you can revert to a previous stable version (e.g., `v1.0`).

1.  **Retag the stable version to latest:**
    ```bash
    # Tags v1.0 -> latest
    tag_benky_images v1.0 latest
    ```

2.  **Redeploy Production:**
    ```bash
    docker-prod up -d
    ```

---

## Environment Configuration

The application uses different environment settings based on the location:

-   **Local:** Loads from `~/.env/variables/.benkyfy` (sets `FLASK_ENV=development`).
-   **Server:** Loads from `/env/.env` (sets `FLASK_ENV=production`).

The `.localrc` script automatically detects the environment and loads the appropriate variables.


