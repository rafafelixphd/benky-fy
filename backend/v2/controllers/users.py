from datetime import datetime

from flask import session

from ..logger import get_logger
from ..models import User, db, get_current_user, get_user_by_id

logger = get_logger(__name__)


class UserController:
    """Controller for user-related operations."""

    @staticmethod
    def check_auth():
        """Check authentication status."""
        user_id = session.get("user_id")
        google_token = session.get("google_token")

        if user_id:
            return (
                {
                    "authenticated": True,
                    "user": {
                        "id": user_id,
                        "name": session.get("user_name", ""),
                        "email": session.get("user_email", ""),
                        "picture": session.get("user_picture"),
                    },
                    "session_keys": list(session.keys()),
                    "google_authorized": bool(google_token),
                },
                200,
                None,
            )
        else:
            return {"authenticated": False, "user": None, "session_keys": [], "google_authorized": False}, 200, None

    @staticmethod
    def get_current_user():
        """Get current authenticated user."""
        user = get_current_user()
        if not user:
            logger.warning("[USERS] Unauthenticated request")
            return None, 401, "Not authenticated"

        logger.info(f"[USERS] Current user retrieved: {user.email}")
        return user.to_dict(), 200, None

    @staticmethod
    def get_user_by_id(user_id: int):
        """Get user by ID."""
        user = get_user_by_id(user_id)
        if not user:
            logger.warning(f"[USERS] User id={user_id} not found")
            return None, 404, "User not found"

        logger.info(f"[USERS] User retrieved: {user.email} (id={user.id})")
        return user.to_dict(), 200, None

    @staticmethod
    def upsert_user(google_id: str, email: str, name: str, picture: str = None):
        """Create or update user from OAuth."""
        logger.info(f"[USERS] Upsert request for user: {email} (google_id: {google_id})")

        try:
            user = User.query.filter_by(google_id=google_id).first()

            if user:
                logger.info(f"[USERS] Updating existing user: {email} (db_id: {user.id})")
                user.email = email
                user.name = name
                user.picture = picture
                user.updated_at = datetime.utcnow()
                is_new_user = False
            else:
                logger.info(f"[USERS] Creating new user: {email}")
                user = User(google_id=google_id, email=email, name=name, picture=picture)
                db.session.add(user)
                is_new_user = True

            db.session.commit()
            logger.info(f"[USERS] User upsert successful: {email} (db_id: {user.id}, is_new_user: {is_new_user})")

            return {"is_new_user": is_new_user, "user": user.to_dict()}, 200, None

        except Exception as e:
            db.session.rollback()
            logger.error(f"[USERS] Database error during upsert for {email}: {str(e)}")
            return None, 500, f"Database error: {str(e)}"
