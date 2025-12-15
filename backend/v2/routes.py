# v2/routes.py
from .logger import get_logger
from .views import api_router, test_auth_router, users_router
from .views.playground import router as playground_router

logger = get_logger()


def init_routes(app):
    logger.info("[routes] Initializing v2 routes...")
    app.register_blueprint(api_router, url_prefix="/v2")
    app.register_blueprint(users_router, url_prefix="/v2")
    app.register_blueprint(test_auth_router, url_prefix="/v2")
    app.register_blueprint(playground_router, url_prefix="/v2")
