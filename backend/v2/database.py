from flask import Flask
from .models import db
from .logger import get_logger

logger = get_logger(__name__)

def init_database(app: Flask):
    """Initialize database with Flask app."""
    db.init_app(app)
    logger.info("[DB] Database initialized")
    
    with app.app_context():
        db.create_all()
        logger.info("[DB] Database tables created")
