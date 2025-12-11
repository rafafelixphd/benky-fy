# views/handler.py
from flask import jsonify, session

from ..config.session import SessionContext  # or wherever SessionContext lives


def make_handler(method, controller_cls):
    """
    method: unbound controller method, e.g. UserController.check_auth
    controller_cls: the controller class, e.g. UserController
    """

    def handler(*args, **route_params):
        ctx = SessionContext(session)
        controller = controller_cls(ctx)  # per-request controller
        payload, status = method(controller, *args, **route_params)
        return jsonify(payload), status

    return handler
