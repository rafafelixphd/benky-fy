import os

from flask import Flask
from flask_cors import CORS


def create_app():
    """Application factory."""
    from backend.v2.logger import setup_logger

    logger = setup_logger("benkyfy")

    app = Flask(__name__)

    allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, origins=allowed_origins, supports_credentials=True)
    logger.info(f"[INIT] CORS enabled for origins: {allowed_origins}")

    from backend.v2 import init_v2_app

    init_v2_app(app)

    logger.info("[INIT] Application created successfully")
    return app


if __name__ == "__main__":
    from backend.v2.logger import get_logger

    logger = get_logger(__name__)

    app = create_app()
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"[START] Starting server on port {port}")
    app.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"[START] Starting on port {port}")
    app.run(host="0.0.0.0", port=port)
