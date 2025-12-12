# controller/user.py
from datetime import datetime
from typing import Optional

from flask import session

from ..config import SessionContext
from ..config.database import db
from ..logger import get_logger
from ..models import User

logger = get_logger(__name__)


class UserController:
    """User-related operations, bound to a SessionContext."""

    def __init__(self, ctx: SessionContext):
        self.ctx = ctx

    def check_auth(self):
        logger.info(f"[USERS] Auth check for user_id={self.ctx.user_id}")
        if not self.ctx.user_id:
            return {
                "authenticated": False,
                "user": None,
                "session_keys": self.ctx.session_keys,
                "google_authorized": self.ctx.google_authorized,
            }, 200

        return {
            "authenticated": True,
            "user": {
                "id": self.ctx.user_id,
                "name": self.ctx.user_name or "",
                "email": self.ctx.user_email or "",
                "picture": self.ctx.user_picture,
            },
            "session_keys": self.ctx.session_keys,
            "google_authorized": self.ctx.google_authorized,
        }, 200

    def get_current_user(self):
        if not self.ctx.user_id:
            logger.warning("[USERS] Unauthenticated request")
            return {"error": "Not authenticated"}, 401

        user = User.query.get(self.ctx.user_id)
        if not user:
            logger.warning(f"[USERS] Session user_id={self.ctx.user_id} not found")
            return {"error": "User not found"}, 404

        logger.info(f"[USERS] Current user retrieved: {user.email}")
        return user.to_dict(), 200

    def get_user_by_id(self, user_id: int):
        logger.info(f"[USERS] Get user by id={user_id}")
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"[USERS] User id={user_id} not found")
            return {"error": "User not found"}, 404

        logger.info(f"[USERS] User retrieved: {user.email} (id={user.id})")
        return user.to_dict(), 200

    def upsert_user(self, google_id: str, email: str, name: str, picture: Optional[str] = None):
        logger.info(f"[USERS] Upsert request: {email} (google_id={google_id})")

        try:
            user = User.query.filter_by(google_id=google_id).first()
            is_new = False

            if user:
                user.email = email
                user.name = name
                user.picture = picture
                user.updated_at = datetime.utcnow()
            else:
                user = User(
                    google_id=google_id,
                    email=email,
                    name=name,
                    picture=picture,
                    auth_provider="google",
                )
                db.session.add(user)
                is_new = True

            db.session.commit()

            session["user_id"] = user.id
            session["user_email"] = user.email
            session["user_name"] = user.name
            session["user_picture"] = user.picture

            logger.info(f"[USERS] Upsert success: {email} (id={user.id}, is_new={is_new})")
            return {"is_new_user": is_new, "user": user.to_dict()}, 200

        except Exception as e:
            db.session.rollback()
            logger.error(f"[USERS] Upsert DB error for {email}: {e}", exc_info=True)
            return {"error": "Database error"}, 500

    def register_user(self, email: str, name: str, password: str):
        logger.info(f"[USERS] Register request: {email}")

        if len(password) < 8:
            return {"error": "Password must be at least 8 characters"}, 400

        try:
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                logger.warning(f"[USERS] Registration failed: {email} already exists")
                return {"error": "Email already registered"}, 409

            user = User(email=email, name=name, auth_provider="email")
            user.set_password(password)

            db.session.add(user)
            db.session.commit()

            session["user_id"] = user.id
            session["user_email"] = user.email
            session["user_name"] = user.name
            session["user_picture"] = user.picture

            logger.info(f"[USERS] Registration success: {email} (id={user.id})")
            return {"user": user.to_dict(), "message": "Registration successful"}, 201

        except Exception as e:
            db.session.rollback()
            logger.error(f"[USERS] Registration DB error for {email}: {e}", exc_info=True)
            return {"error": "Database error"}, 500

    def login_user(self, email: str, password: str):
        logger.info(f"[USERS] Login request: {email}")

        try:
            user = User.query.filter_by(email=email).first()
            if not user:
                logger.warning(f"[USERS] Login failed: {email} not found")
                return {"error": "Invalid email or password"}, 401

            if not user.verify_password(password):
                logger.warning(f"[USERS] Login failed: wrong password for {email}")
                return {"error": "Invalid email or password"}, 401

            session["user_id"] = user.id
            session["user_email"] = user.email
            session["user_name"] = user.name
            session["user_picture"] = user.picture

            logger.info(f"[USERS] Login success: {email}")
            return {"user": user.to_dict(), "message": "Login successful"}, 200

        except Exception as e:
            logger.error(f"[USERS] Login error for {email}: {e}", exc_info=True)
            return {"error": "Authentication error"}, 500

    def logout_user(self):
        logger.info(f"[USERS] Logout request for user_id={self.ctx.user_id}")

        session.clear()

        logger.info("[USERS] Logout success")
        return {"message": "Logout successful"}, 200
