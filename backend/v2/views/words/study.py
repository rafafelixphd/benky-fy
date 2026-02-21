import uuid

from flask import request
from flask import session as flask_session
from flask_restx import Resource

from ...controllers.progress import ProgressController
from ...controllers.words.flashcards import AnkiDeck, FavouriteDeck, FlashCardsDeck
from ...logger import get_logger
from . import ns
from .schemas import word_model
from .utils import check_auth, get_user_controller

logger = get_logger(namespace="words")
progress_controller = ProgressController()


@ns.route("/settings")
class WordSettings(Resource):
    @ns.doc("init_session")
    def post(self):
        session_settings = request.json
        session_id = str(uuid.uuid4())

        logger.info(f"Session settings: {session_settings}")

        flask_session["flashcard_settings"] = session_settings
        flask_session["session_id"] = session_id
        flask_session.pop("word_queue", None)

        # Store user_id in session if authenticated (optional, but good for context)
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if user:
            flask_session["user_id"] = user["id"]

        logger.debug(f"Updated session settings: {session_settings}, Session ID: {session_id}")
        return {"message": "Session initialized", "settings": session_settings, "session_id": session_id}, 200


@ns.route("/next")
class NextWord(Resource):
    @ns.doc("get_next_word")
    @ns.marshal_with(word_model)
    def get(self):
        settings = flask_session.get("flashcard_settings", {})

        logger.info(f"{settings=}")
        # Ensure user_id is available for deck logic
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        user_id = user["id"] if user else None

        # Update session with current user_id if not present
        if user_id:
            flask_session["user_id"] = user_id

        if settings.get("mode") == "anki":
            logger.info("Dealing with AnkiDeck")
            deck = AnkiDeck(settings, user_id=user_id)
        elif settings.get("mode") == "custom-list":
            logger.info("Dealing with FavouriteDeck")
            deck = FavouriteDeck(settings, user_id=user_id)
        elif settings.get("mode") == "random":
            logger.info("Dealing with RandomDeck")
            deck = FlashCardsDeck(settings)
        else:
            logger.info("Dealing with FlashCardsDeck")
            deck = FlashCardsDeck(settings)

        word = deck.draw_next(flask_session)
        if not word:
            ns.abort(404, "No words found matching criteria")
        return word.to_dict()


@ns.route("/feedback")
class WordFeedback(Resource):
    @ns.doc("register_feedback")
    def post(self):
        """
        Register feedback for a word.
        Expected payload: { "word_id": 123, "result": "correct", ... }
        """
        data = request.json

        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)

        if not user:
            return {"error": "Unauthorized"}, 401

        user_id = user["id"]

        session_id = flask_session.get("session_id")
        if not session_id:
            return {"error": "No active session"}, 400

        word_id = data.get("word_id")
        if not word_id:
            return {"error": "Missing word_id"}, 400

        try:
            progress_controller.register_feedback(user_id, word_id, session_id, data)
            return {"success": True}, 200
        except Exception as e:
            logger.error(f"Error in feedback: {e}")
            return {"success": False, "error": str(e)}, 500


@ns.route("/session/stats")
class SessionStats(Resource):
    @ns.doc("get_session_stats")
    def get(self):
        """
        Get stats for the current session (or latest active if none in context).
        """
        session_id = flask_session.get("session_id")

        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)

        if not user:
            return {"error": "Unauthorized"}, 401

        user_id = user["id"]

        try:
            # Controller handles session_id lookup if None
            stats = progress_controller.get_session_stats(user_id, session_id)
            return {"success": True, "data": stats}, 200
        except Exception as e:
            logger.error(f"Error fetching stats: {e}")
            return {"success": False, "error": str(e)}, 500
