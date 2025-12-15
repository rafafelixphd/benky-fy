# views/users.py
from flask import Blueprint

from ..controllers import UserController
from .handler import make_handler

router = Blueprint("users", __name__)

router.add_url_rule(
    "/auth/check",
    endpoint="check_auth",
    view_func=make_handler(UserController.check_auth, UserController, auth_required=False),
    methods=["GET"],
)

router.add_url_rule(
    "/users/<int:user_id>",
    endpoint="get_user_by_id",
    view_func=make_handler(UserController.get_user_by_id, UserController),
    methods=["GET"],
)

router.add_url_rule(
    "/users/me",
    endpoint="get_current_user",
    view_func=make_handler(UserController.get_current_user, UserController, False),
    methods=["GET"],
)

router.add_url_rule(
    "/auth/google",
    endpoint="upsert_user",
    view_func=make_handler(UserController.upsert_user, UserController, auth_required=False),
    methods=["POST"],
)

router.add_url_rule(
    "/auth/register",
    endpoint="register_user",
    view_func=make_handler(UserController.register_user, UserController, auth_required=False),
    methods=["POST"],
)

router.add_url_rule(
    "/auth/login",
    endpoint="login_user",
    view_func=make_handler(UserController.login_user, UserController, auth_required=False),
    methods=["POST"],
)

router.add_url_rule(
    "/auth/logout",
    endpoint="logout_user",
    view_func=make_handler(UserController.logout_user, UserController),
    methods=["POST"],
)
