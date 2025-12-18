# controller/user.py
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional

from flask import request, session

from ..config import SessionContext
from ..config.database import db
from ..logger import get_logger
from ..models import User, UserSession

logger = get_logger(namespace="users")


class UserController:
    """User-related operations, bound to a SessionContext."""

    def __init__(self, ctx: SessionContext):
        self.ctx = ctx

    def check_auth(self):
        logger.debug(f"SessionContext.user_id: {self.ctx.user_id}")
        if not self.ctx.user_id:
            return {
                "authenticated": False,
                "user": None,
                "session_keys": self.ctx.session_keys,
                "google_authorized": self.ctx.google_authorized,
            }, 200

        # Validate Session Security
        if not self.ctx.session_hash or not self.ctx.browser_hash:
            logger.warning(f"[USERS] Missing session hashes for user_id={self.ctx.user_id}")
            self.logout_user()  # Invalid session state
            return {"authenticated": False, "error": "Invalid session state"}, 401

        # Check browser hash against current request
        user_agent = request.headers.get("User-Agent", "")
        current_browser_hash = hashlib.sha256(user_agent.encode()).hexdigest()

        if self.ctx.browser_hash != current_browser_hash:
            logger.warning(f"[USERS] Browser hash mismatch for user_id={self.ctx.user_id}")
            self.logout_user()
            return {"authenticated": False, "error": "Session invalid"}, 401

        # Check database session
        user_session = UserSession.query.filter_by(session_hash=self.ctx.session_hash, is_active=True).first()

        if not user_session:
            logger.warning(f"[USERS] Session not found in DB for user_id={self.ctx.user_id}")
            self.logout_user()
            return {"authenticated": False, "error": "Session expired"}, 401

        if user_session.expires_at < datetime.utcnow():
            logger.warning(f"[USERS] Session expired for user_id={self.ctx.user_id}")
            user_session.is_active = False
            db.session.commit()
            self.logout_user()
            return {"authenticated": False, "error": "Session expired"}, 401

        # Session valid, touch expiration? (Optional: Sliding window)
        # user_session.expires_at = datetime.utcnow() + timedelta(minutes=60)
        # db.session.commit()

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

    def get_current_user(self, **kwargs):
        if not self.ctx.user_id:
            logger.warning("[USERS] Unauthenticated request")
            return {"error": "Not authenticated"}, 401

        user = User.query.get(self.ctx.user_id)
        if not user:
            logger.warning(f"[USERS] Session user_id={self.ctx.user_id} not found")
            return {"error": "User not found"}, 404

        logger.info(f"[USERS] Current user retrieved: {user.email}")
        return user.to_dict(), 200

    def get_user_by_id(self, user_id: int, **kwargs):
        logger.info(f"[USERS] Get user by id={user_id}")
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"[USERS] User id={user_id} not found")
            return {"error": "User not found"}, 404

        logger.info(f"[USERS] User retrieved: {user.email} (id={user.id})")
        return user.to_dict(), 200

    def upsert_user(self, google_id: str, email: str, name: str, picture: Optional[str] = None, **kwargs):
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

            # Create User Session
            session_token = secrets.token_urlsafe(32)
            session_hash = hashlib.sha256(session_token.encode()).hexdigest()

            user_agent = request.headers.get("User-Agent", "")
            browser_hash = hashlib.sha256(user_agent.encode()).hexdigest()
            user_hash = hashlib.sha256(f"{user.id}:{user.email}".encode()).hexdigest()  # Simple user binding

            new_session = UserSession(
                user_id=user.id,
                session_hash=session_hash,
                user_hash=user_hash,
                browser_hash=browser_hash,
                expires_at=datetime.utcnow() + timedelta(minutes=60),
            )
            db.session.add(new_session)
            db.session.commit()

            session["user_id"] = user.id
            session["user_email"] = user.email
            session["user_name"] = user.name
            session["user_picture"] = user.picture

            session["session_hash"] = session_hash
            session["browser_hash"] = browser_hash

            logger.info(f"[USERS] Upsert success: {email} (id={user.id}, is_new={is_new})")
            return {"is_new_user": is_new, "user": user.to_dict()}, 200

        except Exception as e:
            db.session.rollback()
            logger.error(f"[USERS] Upsert DB error for {email}: {e}", exc_info=True)
            return {"error": "Database error"}, 500

    def register_user(self, email: str, name: str, password: str, **kwargs):
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

            # Create User Session
            session_token = secrets.token_urlsafe(32)
            session_hash = hashlib.sha256(session_token.encode()).hexdigest()

            user_agent = request.headers.get("User-Agent", "")
            browser_hash = hashlib.sha256(user_agent.encode()).hexdigest()
            user_hash = hashlib.sha256(f"{user.id}:{user.email}".encode()).hexdigest()

            new_session = UserSession(
                user_id=user.id,
                session_hash=session_hash,
                user_hash=user_hash,
                browser_hash=browser_hash,
                expires_at=datetime.utcnow() + timedelta(minutes=60),
            )
            db.session.add(new_session)
            db.session.commit()

            session["user_id"] = user.id
            session["user_email"] = user.email
            session["user_name"] = user.name
            session["user_picture"] = user.picture

            session["session_hash"] = session_hash
            session["browser_hash"] = browser_hash

            logger.info(f"[USERS] Registration success: {email} (id={user.id})")
            return {"user": user.to_dict(), "message": "Registration successful"}, 201

        except Exception as e:
            db.session.rollback()
            logger.error(f"[USERS] Registration DB error for {email}: {e}", exc_info=True)
            return {"error": "Database error"}, 500

    def login_user(self, email: str, password: str, **kwargs):
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

            # Create User Session
            session_token = secrets.token_urlsafe(32)
            session_hash = hashlib.sha256(session_token.encode()).hexdigest()

            user_agent = request.headers.get("User-Agent", "")
            browser_hash = hashlib.sha256(user_agent.encode()).hexdigest()
            user_hash = hashlib.sha256(f"{user.id}:{user.email}".encode()).hexdigest()

            new_session = UserSession(
                user_id=user.id,
                session_hash=session_hash,
                user_hash=user_hash,
                browser_hash=browser_hash,
                expires_at=datetime.utcnow() + timedelta(minutes=60),
            )
            db.session.add(new_session)
            db.session.commit()

            session["session_hash"] = session_hash
            session["browser_hash"] = browser_hash

            logger.info(f"[USERS] Login success: {email}")
            return {"user": user.to_dict(), "message": "Login successful"}, 200

        except Exception as e:
            logger.error(f"[USERS] Login error for {email}: {e}", exc_info=True)
            return {"error": "Authentication error"}, 500

    def logout_user(self, **kwargs):
        logger.info(f"[USERS] Logout request for user_id={self.ctx.user_id}")

        if self.ctx.session_hash:
            user_session = UserSession.query.filter_by(
                session_hash=self.ctx.session_hash,
            ).first()
            if user_session:
                user_session.is_active = False
                db.session.commit()

        session.clear()

        logger.info("[USERS] Logout success")
        return {"message": "Logout successful"}, 200
