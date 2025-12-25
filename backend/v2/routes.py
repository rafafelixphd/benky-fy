# v2/routes.py
from .logger import get_logger
from .views import api_router

logger = get_logger()


def init_routes(app):
    logger.info("[routes] Initializing v2 routes...")
    app.register_blueprint(api_router, url_prefix="/v2")
