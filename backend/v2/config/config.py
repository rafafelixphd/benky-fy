import os

class Config:
    """Application configuration from environment variables."""
    
    # Flask
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY')
    ENV = os.environ.get('FLASK_ENV', 'production')
    
    # Database
    DB_HOST = os.environ.get('DB_HOST', 'database')
    DB_PORT = os.environ.get('DB_PORT', '5432')
    DB_NAME = os.environ.get('DB_NAME', 'benkyfy_db')
    DB_USER = os.environ.get('DB_USER', 'benkyfy_user')
    DB_PASSWORD = os.environ.get('DB_PASSWORD')
    
    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_size': 10,
        'max_overflow': 20,
    }
    
    # Google OAuth
    GOOGLE_OAUTH_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID')
    GOOGLE_OAUTH_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET')
    
    # CORS
    ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000')
