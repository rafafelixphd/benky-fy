from flask import Response, json
import gzip
from functools import wraps

from ..logger import get_logger

logger = get_logger(__name__)

def compress_json(f):
    """Decorator to compress JSON responses if client accepts gzip."""
    @wraps(f)
    def wrapped(*args, **kwargs):
        # Get response from the original function
        resp = f(*args, **kwargs)
        
        # Only compress if response is JSON
        if isinstance(resp, (dict, list)):
            # Convert to JSON string
            json_str = json.dumps(resp)
            
            # Compress
            gzip_buffer = gzip.compress(json_str.encode('utf-8'))
            
            response = Response(gzip_buffer)
            response.headers['Content-Type'] = 'application/json'
            response.headers['Content-Encoding'] = 'gzip'
            
            logger.debug(f"[COMPRESS] Compressed JSON response: {len(json_str)} -> {len(gzip_buffer)} bytes")
            return response
        return resp
    return wrapped
