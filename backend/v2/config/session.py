# config/session_context.py


class SessionContext:
    def __init__(self, session):
        self.user_id = session.get("user_id")
        self.user_name = session.get("user_name")
        self.user_email = session.get("user_email")
        self.user_picture = session.get("user_picture")
        self.google_authorized = bool(session.get("google_token"))
        self.session_keys = list(session.keys())

        self._session = session

    def get(self, key, default=None):
        return self._session.get(key, default)
