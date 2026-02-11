# v2/api.py
from flask import Blueprint
from flask_restx import Api

# Use absolute or specific import to avoid ambiguity
from backend.v2 import __version__

from .auth import ns as auth_ns
from .conversation import ns as conversation_ns
from .dashboard import ns as dashboard_ns
from .lexicon import ns as lexicon_ns
from .test_auth import ns as test_auth_ns
from .word_lists import ns as word_lists_ns
from .words import ns as words_ns

# API blueprint
router = Blueprint("v2_api", __name__)

# RESTX API signature for Benky-Fy V2
api = Api(
    router,
    title="Benky-Fy V2 API",
    version=__version__,
    description="""
# Benky-Fy V2 API

Backend API for the Benky-Fy Japanese learning platform.
Includes endpoints for users, study sessions, health checks, and system features.

Documentation is available under `/v2/<namespace>/docs/`.
    """,
    doc="/docs/",  # final path → /v2/docs/
    prefix="/",  # routes stay clean; /v2 is applied via blueprint registration
)

api.add_namespace(auth_ns)
api.add_namespace(test_auth_ns)
api.add_namespace(words_ns)
api.add_namespace(word_lists_ns)
api.add_namespace(lexicon_ns)
api.add_namespace(conversation_ns)

api.add_namespace(dashboard_ns)
