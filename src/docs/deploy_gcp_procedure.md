# GCP Deployment Procedure

## 1. Authentication
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

## 2. Build Docker Images
```bash
docker buildx build --platform linux/amd64 ...
```
```bash
# Backend
docker buildx build --platform linux/amd64 -f Dockerfile.backend -t gcr.io/PROJECT_ID/benky-fy-backend:latest .

# Frontend
cd frontend-nextjs
docker buildx build --platform linux/amd64 -f Dockerfile.frontend -t gcr.io/PROJECT_ID/benky-fy-frontend:latest .
cd ..
```

## 3. Push to Container Registry
```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Push images
docker push gcr.io/PROJECT_ID/benky-fy-backend:latest
docker push gcr.io/PROJECT_ID/benky-fy-frontend:latest
```

## 4. Deploy Services

### 4.1 Backend Service
```bash
gcloud run deploy benky-fy-backend \
    --image gcr.io/PROJECT_ID/benky-fy-backend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080
```

### 4.2 Frontend Service
```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe benky-fy-backend --region us-central1 --format 'value(status.url)')

# Deploy frontend
gcloud run deploy benky-fy-frontend \
    --image gcr.io/PROJECT_ID/benky-fy-frontend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 3000 \
    --set-env-vars NEXT_PUBLIC_API_URL=$BACKEND_URL
```

## 5. Access URLs
- Backend: `https://benky-fy-backend-HASH-uc.a.run.app`
- Frontend: `https://benky-fy-frontend-HASH-uc.a.run.app`