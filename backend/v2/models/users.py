from flask import session

from ..logger import get_logger
from ..models import User

logger = get_logger(__name__)


def get_current_user():
    """Get currently authenticated user from session."""
    user_id = session.get("user_id")
    if not user_id:
        logger.info("[USERS] No user in session")
        return None

    user = User.query.get(user_id)
    if user:
        logger.info(f"[USERS] Loaded current user {user.email} (id={user.id})")
    else:
        logger.warning(f"[USERS] Session user_id={user_id} not found in database")

    return user


def get_user_by_id(user_id: int):
    """Get user by ID."""
    user = User.query.get(user_id)
    if user:
        logger.info(f"[USERS] Loaded user {user.email} (id={user.id})")
    else:
        logger.warning(f"[USERS] User id={user_id} not found")

    return user


def get_user_by_email(email: str):
    """Get user by email."""
    user = User.query.filter_by(email=email).first()
    if user:
        logger.info(f"[USERS] Loaded user {user.email} (id={user.id})")
    else:
        logger.warning(f"[USERS] User email={email} not found")

    return user


def get_user_by_google_id(google_id: str):
    """Get user by Google ID."""
    user = User.query.filter_by(google_id=google_id).first()
    if user:
        logger.info(f"[USERS] Loaded user {user.email} (id={user.id})")
    else:
        logger.warning(f"[USERS] User google_id={google_id} not found")

    return user
