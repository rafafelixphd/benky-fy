# config/session_context.py
import json


class SessionContext:
    def __init__(self, session):
        self.user_id = session.get("user_id")
        self.user_name = session.get("user_name")
        self.user_email = session.get("user_email")
        self.user_picture = session.get("user_picture")
        self.google_authorized = bool(session.get("google_token"))

        # Session security hashes
        self.session_hash = session.get("session_hash")
        self.browser_hash = session.get("browser_hash")

        self.session_keys = list(session.keys())

        self._session = session

    def get(self, key, default=None):
        return self._session.get(key, default)

    def todict(self):
        return {
            "user_id": self.user_id,
            "user_name": self.user_name,
            "user_email": self.user_email,
            "user_picture": self.user_picture,
            "google_authorized": self.google_authorized,
            "session_hash": self.session_hash,
            "browser_hash": self.browser_hash,
            "session_keys": self.session_keys,
        }

    def __repr__(self):
        return json.dumps(self.todict(), indent=2)
