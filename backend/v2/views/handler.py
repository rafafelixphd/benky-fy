# views/handler.py
from flask import jsonify, request, session

from ..config.session import SessionContext
from ..controllers.users import UserController
from ..logger import get_logger

logger = get_logger(namespace="views")


def make_handler(method, controller_cls, auth_required=True):
    def handler(*args, **route_params):
        ctx = SessionContext(session)
        logger.info(f"{ctx=}")
        controller = controller_cls(ctx)

        if auth_required:
            user_controller = UserController(ctx)
            auth_result, status = user_controller.check_auth()
            if status != 200 or not auth_result.get("authenticated"):
                return jsonify({"error": "Unauthorized"}), 401

        if request.method in ["POST", "PUT", "PATCH"] and request.is_json:
            body = request.get_json() or {}
            route_params.update(body)

        payload, status = method(controller, *args, **route_params)
        return jsonify(payload), status

    return handler
