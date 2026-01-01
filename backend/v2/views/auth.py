# views/users.py
from flask import request, session
from flask_restx import Namespace, Resource

from ..config.session import SessionContext
from ..controllers import UserController
from ..logger import get_logger

logger = get_logger(namespace="views")

ns = Namespace("auth", description="Auth operations")


# Helper to replicate make_handler logic slightly more idiomatically for Resources
def get_context_and_controller():
    logger.debug(f"Headers: {request.headers}")
    logger.debug(f"Cookies: {request.cookies}")
    logger.debug(f"Session: {session}")
    ctx = SessionContext(session)
    controller = UserController(ctx)
    return ctx, controller


def check_auth(controller):
    auth_result, status = controller.check_auth()
    if status != 200 or not auth_result.get("authenticated"):
        return False
    return True


@ns.route("/check")
class AuthCheck(Resource):
    def get(self):
        ctx, controller = get_context_and_controller()
        payload, status = controller.check_auth()
        return payload, status


@ns.route("/register")
class RegisterUser(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        # auth_required=False

        body = request.get_json() or {}
        payload, status = controller.register_user(**body)
        return payload, status


@ns.route("/login")
class LoginUser(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        # auth_required=False

        body = request.get_json() or {}
        payload, status = controller.login_user(**body)
        return payload, status


@ns.route("/logout")
class LogoutUser(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        if not check_auth(controller):
            return {"error": "Unauthorized"}, 401

        payload, status = controller.logout_user()
        return payload, status


@ns.route("/upsert-user")
class UpsertUser(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        # auth_required=False

        body = request.get_json() or {}
        payload, status = controller.upsert_user(**body)
        return payload, status


@ns.route("/update")
class UpdateProfile(Resource):
    def post(self):
        ctx, controller = get_context_and_controller()
        # This requires auth in controller, but good to be explicit if using decorators later

        body = request.get_json() or {}
        payload, status = controller.update_profile(**body)
        return payload, status
