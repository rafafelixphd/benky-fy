# config/session_context.py
from flask import session


class SessionContext:
    def __init__(self, session):
        self.user_id = session.get("user_id")
        self.user_name = session.get("user_name")
        self.user_email = session.get("user_email")
        self.user_picture = session.get("user_picture")
        self.google_authorized = bool(session.get("google_token"))
        self.session_keys = list(session.keys())

    def get_feature_flag(self, name: str, default=None):
        return session.get(f"feature_{name}", default)
