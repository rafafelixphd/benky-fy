from flask import Blueprint

from .handler import make_handler

router = Blueprint("test_auth", __name__, url_prefix="/test-auth")


class TestController:
    def __init__(self, ctx):
        self.ctx = ctx

    def foo_bar(self):
        return {"message": "foo bar"}, 200


router = Blueprint("test_auth", __name__)

router.add_url_rule(
    "/foo/bar",
    endpoint="public_foo_bar",
    view_func=make_handler(TestController.foo_bar, TestController, auth_required=False),
    methods=["GET"],
)

router.add_url_rule(
    "/foo/nobar",
    endpoint="auth_foo_bar",
    view_func=make_handler(TestController.foo_bar, TestController, auth_required=True),
    methods=["GET"],
)
