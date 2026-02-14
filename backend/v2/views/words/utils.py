from flask import session as flask_session

from ...config.session import SessionContext
from ...controllers.users import UserController


def get_user_controller():
    ctx = SessionContext(flask_session)
    return ctx, UserController(ctx)


def check_auth(user_controller):
    auth_result, status = user_controller.check_auth()
    if status != 200 or not auth_result.get("authenticated"):
        return None
    return auth_result.get("user")
