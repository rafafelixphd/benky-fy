from flask import Flask

def init_v2_app(app: Flask):
    """Initialize V2 application components."""
    
    # Import V2 RESTX blueprints
    from .health.routes import bp as health_bp
    from .auth.routes import bp as auth_bp
    from .common.json_utils import compress_json
    
    # Register V2 blueprints without URL prefix (Flask-RESTX handles this internally)
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    
    # Apply compression decorator to all V2 JSON responses
    for endpoint in app.view_functions:
        if endpoint.startswith('v2_'):
            app.view_functions[endpoint] = compress_json(app.view_functions[endpoint])
