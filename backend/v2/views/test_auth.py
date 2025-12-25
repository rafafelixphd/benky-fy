from flask import request, session
from flask_restx import Namespace, Resource, fields

from ..config.session import SessionContext
from ..controllers.users import UserController

ns = Namespace("test-auth", description="Test Auth operations")

# Define a model for mocking session data
mock_session_model = ns.model(
    "MockSession",
    {
        "user_id": fields.Integer(required=True, description="Mock User ID", default=999),
        "user_name": fields.String(description="Mock Name", default="Test User"),
        "user_email": fields.String(description="Mock Email", default="test@example.com"),
        "user_picture": fields.String(description="Mock Picture URL", default="https://example.com/avatar.png"),
        "session_hash": fields.String(description="Session Security Hash", default="mock_session_hash"),
        "browser_hash": fields.String(description="Browser Fingerprint Hash", default="mock_browser_hash"),
        "google_token": fields.String(description="Google OAuth Token", default=None),
        "authenticated": fields.Boolean(description="Force Authentication", default=True),
    },
)


class TestController:
    def __init__(self, ctx):
        self.ctx = ctx

    def foo_bar(self):
        return {"message": "foo bar"}, 200


def get_context_and_controller():
    # We need a context for TestController
    ctx = SessionContext(session)
    return ctx


def check_auth():
    # Allow bypassing auth if mock flag is set (for testing)
    if session.get("mock_auth"):
        return True

    ctx = SessionContext(session)
    user_controller = UserController(ctx)
    auth_result, status = user_controller.check_auth()
    if status != 200 or not auth_result.get("authenticated"):
        return False
    return True


@ns.route("/foo/bar")
class PublicFooBar(Resource):
    def get(self):
        # auth_required=False
        ctx = get_context_and_controller()
        controller = TestController(ctx)
        return controller.foo_bar()


@ns.route("/foo/nobar")
class AuthFooBar(Resource):
    def get(self):
        if not check_auth():
            return {"error": "Unauthorized"}, 401

        ctx = get_context_and_controller()

        # Example of accessing the args
        controller = TestController(ctx)
        return controller.foo_bar()

    @ns.expect(mock_session_model)
    def post(self):
        """
        Mock session data and trigger GET.
        Values provided in JSON body will be injected into the session.
        """
        data = request.get_json() or {}

        # Inject into session
        if data:
            session.update(data)
            if data.get("authenticated"):
                session["mock_auth"] = True

        return self.get()


@ns.route("/notimplementedyet")
class NotImplementedYet(Resource):
    def get(self):
        return {"warning": "Not implemented yet"}, 401
