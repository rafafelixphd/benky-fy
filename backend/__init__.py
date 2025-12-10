from flask import Flask, jsonify
from flask_cors import CORS
import os

def create_app() -> Flask:
    """Application factory pattern for Benkyo-Fi."""
    
    app = Flask(__name__)

    # Configure CORS for frontend integration
    allowed_origins = [
        'http://localhost:3000',  # Development
        'http://192.168.0.23:3000',  # Development
        'https://benky-fy-frontend-193852054448.asia-northeast1.run.app',  # Production
        'https://benkyfy.site' # Production
    ]
    
    # Allow additional origins from environment variable
    if os.environ.get('ALLOWED_ORIGINS'):
        additional_origins = os.environ.get('ALLOWED_ORIGINS').split(',')
        allowed_origins.extend(additional_origins)
    
    CORS(app, origins=allowed_origins, supports_credentials=True)

    # Configure app
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "superkey-benky-fy")
    
    # Build database URL from separate variables (avoids password special char issues)
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        # Build from components if DATABASE_URL not provided
        db_user = os.environ.get('DB_USER', '')
        db_password = os.environ.get('DB_PASSWORD', '')
        db_host = os.environ.get('DB_HOST', '127.0.0.1')
        db_port = os.environ.get('DB_PORT', '5432')
        db_name = os.environ.get('DB_NAME', 'benkyfy_db')
        if db_password:
            from urllib.parse import quote_plus
            db_password_encoded = quote_plus(db_password)
            print("#8: ", db_password_encoded)
            db_url = f'postgresql://{db_user}:{db_password_encoded}@{db_host}:{db_port}/{db_name}'
            print("#9: ", db_url)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    from .models import db
    db.init_app(app)

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'benky-fy-backend'}), 200

    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found', 'status': 404}), 404
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request', 'status': 400}), 400
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error', 'status': 500}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({'error': 'An unexpected error occurred', 'status': 500}), 500

    # Initialize V2 application
    from .v2 import init_v2_app
    init_v2_app(app)

    return app