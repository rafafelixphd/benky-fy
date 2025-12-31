# app.py
import os

from flask import Flask

from v2.config import Config, init_database, init_seed_database
from v2.logger import get_logger
from v2.routes import init_routes


def setup_cors(app):
    from flask_cors import CORS

    # Config.ALLOWED_ORIGINS comes in as a CSV string → split to list
    origins = app.config["ALLOWED_ORIGINS"].split(",")

    CORS(app, origins=origins, supports_credentials=True)

    app.logger.info(f"[CORS] Enabled for origins: {origins}")


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.add_url_rule("/", "index", lambda: "{'benkyfy': 'ok'}")
    with app.app_context():
        setup_cors(app)

        init_routes(app)
        db = init_database(app, create_tables=True)
        init_seed_database(app, db)
    return app


if __name__ == "__main__":
    logger = get_logger()

    logger.info("Starting Benky-fy Backend (app2.py)...")
    app = create_app()

    logger.info("Setting up run ...")

    app.run(port=8080, debug=True)
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
