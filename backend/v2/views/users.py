from flask import Blueprint, request
from flask_restx import Api, Resource, fields

from ..controllers import UserController
from ..logger import get_logger

logger = get_logger(__name__)

bp = Blueprint("v2_users_api", __name__)
api = Api(
    bp,
    title="Benky-Fy V2 Users API",
    version="2.0",
    description="""
# Benky-Fy V2 Users API

## Overview
User management, authentication, and retrieval endpoints.

## Endpoints
- `GET /v2/users/auth` - Check authentication status
- `GET /v2/users/me` - Get current authenticated user
- `GET /v2/users/<id>` - Get user by ID
- `POST /v2/users` - Create or update user (OAuth)

## Authentication
Session-based authentication using Flask sessions.
          """,
    doc="/v2/users/docs/",
    prefix="/v2",
)

user_model = api.model(
    "User",
    {
        "id": fields.Integer(description="User ID"),
        "google_id": fields.String(description="Google user ID"),
        "email": fields.String(description="User email"),
        "name": fields.String(description="User display name"),
        "picture": fields.String(description="Profile picture URL"),
        "created_at": fields.String(description="Account creation timestamp"),
        "updated_at": fields.String(description="Last update timestamp"),
    },
)

auth_response_model = api.model(
    "AuthResponse",
    {
        "authenticated": fields.Boolean(description="Authentication status"),
        "user": fields.Raw(description="User information if authenticated"),
        "session_keys": fields.List(fields.String, description="Session keys"),
        "google_authorized": fields.Boolean(description="Google OAuth status"),
    },
)

upsert_user_request_model = api.model(
    "UpsertUserRequest",
    {
        "google_id": fields.String(required=True, description="Google user ID"),
        "email": fields.String(required=True, description="User email"),
        "name": fields.String(required=True, description="User display name"),
        "picture": fields.String(description="Profile picture URL"),
    },
)

upsert_user_response_model = api.model(
    "UpsertUserResponse",
    {
        "is_new_user": fields.Boolean(description="True if user was just created"),
        "user": fields.Nested(user_model, description="User object"),
    },
)


@api.route("/users/auth")
class CheckAuthResource(Resource):
    @api.doc(
        "check_auth",
        description="Check authentication status",
        responses={200: "Success - Returns authentication status"},
    )
    @api.marshal_with(auth_response_model)
    def get(self):
        """Check authentication status."""
        data, status, error = UserController.check_auth()
        return data


@api.route("/users/me")
class CurrentUserResource(Resource):
    @api.doc(
        "get_current_user",
        description="Get currently authenticated user",
        responses={200: "Success - Returns current user", 401: "Not authenticated"},
    )
    @api.marshal_with(user_model)
    def get(self):
        """Get current authenticated user from session."""
        data, status, error = UserController.get_current_user()
        if error:
            api.abort(status, error)
        return data


@api.route("/users/<int:user_id>")
class UserByIdResource(Resource):
    @api.doc(
        "get_user_by_id", description="Get user by ID", responses={200: "Success - Returns user", 404: "User not found"}
    )
    @api.marshal_with(user_model)
    def get(self, user_id):
        """Get user by ID."""
        data, status, error = UserController.get_user_by_id(user_id)
        if error:
            api.abort(status, error)
        return data


@api.route("/users")
class UpsertUserResource(Resource):
    @api.doc(
        "upsert_user",
        description="Create or update user from OAuth",
        responses={
            200: "Success - Returns user object",
            400: "Bad Request - Missing required fields",
            500: "Internal Server Error",
        },
    )
    @api.expect(upsert_user_request_model)
    @api.marshal_with(upsert_user_response_model)
    def post(self):
        """Create or update user from OAuth."""
        data = request.get_json()

        if not all(k in data for k in ["google_id", "email", "name"]):
            logger.warning(f"[USERS] Missing required fields in request: {data.keys()}")
            api.abort(400, "Missing required fields: google_id, email, name")

        result, status, error = UserController.upsert_user(
            google_id=data["google_id"], email=data["email"], name=data["name"], picture=data.get("picture")
        )

        if error:
            api.abort(status, error)
        return result
