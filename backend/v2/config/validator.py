from .config import Config

def validate_config():
    """Validate that all required configuration is present."""
    required_vars = {
        'SECRET_KEY': Config.SECRET_KEY,
        'DB_PASSWORD': Config.DB_PASSWORD,
    }
    
    missing = [key for key, value in required_vars.items() if not value]
    
    if missing:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Please set these variables in your .env file or environment."
        )
    
    return True
