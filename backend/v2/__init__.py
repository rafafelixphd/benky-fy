from flask import Flask


def init_v2_app(app: Flask):
    """Initialize V2 application components."""

    # Setup logger
    from .logger import setup_logger

    logger = setup_logger("benkyfy")

    # Load and validate configuration
    from .config import Config, validate_config

    app.config.from_object(Config)
    validate_config()
    logger.info("[INIT] Configuration loaded and validated")

    # Initialize database
    from .database import init_database

    init_database(app)

    # Import V2 blueprints
    from .utils.json_utils import compress_json
    from .views import health_bp, users_bp

    # Register V2 blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(users_bp)
    logger.info("[INIT] V2 API blueprints registered")

    # Apply compression decorator to all V2 JSON responses
    for endpoint in app.view_functions:
        if endpoint.startswith("v2_"):
            app.view_functions[endpoint] = compress_json(app.view_functions[endpoint])
