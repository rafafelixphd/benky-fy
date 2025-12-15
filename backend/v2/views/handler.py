# views/handler.py
from flask import jsonify, request, session

from ..config.session import SessionContext


def make_handler(method, controller_cls):
    def handler(*args, **route_params):
        ctx = SessionContext(session)
        controller = controller_cls(ctx)

        if request.method in ["POST", "PUT", "PATCH"] and request.is_json:
            body = request.get_json() or {}
            route_params.update(body)

        payload, status = method(controller, *args, **route_params)
        return jsonify(payload), status

    return handler
