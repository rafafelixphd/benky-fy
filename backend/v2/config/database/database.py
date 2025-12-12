from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from ...logger import get_logger

logger = get_logger()
db = SQLAlchemy()


def init_database(app: Flask, create_tables: bool = False):
    """
    Initialize SQLAlchemy for the given Flask application.

    Args:
        app (Flask): The Flask application instance.
        create_tables (bool): If True, run db.create_all().
                              Leave False in production.
    """
    db.init_app(app)
    logger.info("[DB] SQLAlchemy initialized")

    if create_tables:
        with app.app_context():
            db.create_all()
            logger.info("[DB] Database tables created")

    else:
        logger.info("[DB] Table creation skipped (create_tables=False)")

    return db
