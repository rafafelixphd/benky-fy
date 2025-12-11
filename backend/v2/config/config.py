import os


class Config:
    """
    Application configuration loaded from environment variables.
    Designed for production-safe defaults with Postgres + SQLAlchemy.
    """

    # --------------------------------------------------
    # FLASK
    # --------------------------------------------------
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")
    FLASK_ENV = os.environ.get("FLASK_ENV", "production")

    # --------------------------------------------------
    # DATABASE (PostgreSQL)
    # --------------------------------------------------
    DB_HOST = os.environ.get("DB_HOST", "database")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME")
    DB_USER = os.environ.get("DB_USER")
    DB_PASSWORD = os.environ.get("DB_PASSWORD")

    # Guard against missing password in production
    if FLASK_ENV == "production" and not DB_PASSWORD:
        raise RuntimeError("DB_PASSWORD must be set in production.")

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,  # auto-reconnect stale connections
        "pool_recycle": 300,  # recycle connections every 5 minutes
        "pool_size": 10,  # base pool size
        "max_overflow": 20,  # extra connections under load
    }

    # Database URI
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        if DB_PASSWORD
        else f"postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

    # --------------------------------------------------
    # GOOGLE OAUTH
    # --------------------------------------------------
    GOOGLE_OAUTH_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
    GOOGLE_OAUTH_CLIENT_SECRET = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")

    # --------------------------------------------------
    # CORS
    # --------------------------------------------------
    ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
