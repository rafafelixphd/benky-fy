# views/users.py
from flask import request, session
from flask_restx import Namespace, Resource

from ..config.session import SessionContext
from ..controllers import UserController
from ..logger import get_logger

logger = get_logger(namespace="views")

ns = Namespace("users", description="User operations")


# Helper to replicate make_handler logic slightly more idiomatically for Resources
def get_context_and_controller():
    ctx = SessionContext(session)
    controller = UserController(ctx)
    return ctx, controller


def check_auth(controller):
    auth_result, status = controller.check_auth()
    if status != 200 or not auth_result.get("authenticated"):
        return False
    return True


@ns.route("/auth/check")
class AuthCheck(Resource):
    def get(self):
        ctx, controller = get_context_and_controller()
        # auth_required=False in original
        payload, status = controller.check_auth()
        return payload, status


@ns.route("/users/<int:user_id>")
class UserById(Resource):
    def get(self, user_id):
        ctx, controller = get_context_and_controller()
        if not check_auth(controller):
            return {"error": "Unauthorized"}, 401

        payload, status = controller.get_user_by_id(user_id)
        return payload, status


@ns.route("/users/me")
class CurrentUser(Resource):
    def get(self):
        ctx, controller = get_context_and_controller()
        # auth_required=False in original for this specific route?
        # Original: make_handler(UserController.get_current_user, UserController, False)
        # So yes, False.

        payload, status = controller.get_current_user()
        return payload, status


@ns.route("/auth/upsert-user")
class UpsertUser(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        # auth_required=False

        body = request.get_json() or {}
        payload, status = controller.upsert_user(**body)
        return payload, status


@ns.route("/auth/register")
class RegisterUser(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        # auth_required=False

        body = request.get_json() or {}
        payload, status = controller.register_user(**body)
        return payload, status


@ns.route("/auth/login")
class LoginUser(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        # auth_required=False

        body = request.get_json() or {}
        payload, status = controller.login_user(**body)
        return payload, status


@ns.route("/auth/logout")
class LogoutUser(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        if not check_auth(controller):
            return {"error": "Unauthorized"}, 401

        payload, status = controller.logout_user()
        return payload, status
