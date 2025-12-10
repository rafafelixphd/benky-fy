import time
from datetime import datetime

from flask import Blueprint
from flask_restx import Api, Resource

from ..logger import get_logger

logger = get_logger(__name__)

# Create API blueprint
bp = Blueprint("v2_health_api", __name__)
api = Api(
    bp,
    title="Benky-Fy V2 Health Check API",
    version="2.0",
    description="""
# Benky-Fy V2 Health Check API

## Overview
Health check and system status endpoint for monitoring API health and performance.

## Endpoints
- `GET /v2/health` - Returns health status, version, and response time metrics

## Response Format
JSON with health status, API version, and performance metrics.
          """,
    doc="/v2/health/docs/",
    prefix="/v2",
)

# API version - should match your backend version
API_VERSION = "2.0.0"


@api.route("/health")
class HealthCheck(Resource):
    def get(self):
        """
        Health check endpoint that returns API status and metrics.

        Returns:
            - status: 'healthy' or 'degraded'
            - version: API version
            - timestamp: Current server timestamp
            - uptime: Server uptime in seconds (if available)
            - response_time_ms: Time taken to process this request
        """
        start_time = time.time()

        try:
            # Check basic health
            health_status = {
                "status": "healthy",
                "version": API_VERSION,
                "timestamp": datetime.utcnow().isoformat(),
                "service": "benky-fy-api-v2",
            }

            # Calculate response time
            response_time_ms = (time.time() - start_time) * 1000
            health_status["response_time_ms"] = round(response_time_ms, 2)

            logger.info(f"[HEALTH] Health check passed - {response_time_ms:.2f}ms")
            return health_status, 200

        except Exception as e:
            logger.error(f"[HEALTH] Health check failed: {str(e)}")
            return {
                "status": "degraded",
                "version": API_VERSION,
                "timestamp": datetime.utcnow().isoformat(),
                "service": "benky-fy-api-v2",
                "error": str(e),
                "response_time_ms": round((time.time() - start_time) * 1000, 2),
            }, 503
