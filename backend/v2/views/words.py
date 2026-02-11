# views/words.py
from flask import request
from flask import session as flask_session
from flask_restx import Namespace, Resource, fields

from ..config.database import db
from ..controllers.progress import ProgressController
from ..controllers.words.anki import AnkiDeck
from ..controllers.words.favourite import FavouriteDeck
from ..controllers.words.flashcards import FlashCardsDeck
from ..controllers.words.search import WordQuery
from ..logger import get_logger
from ..models import Word

logger = get_logger(namespace="words")
ns = Namespace("words", description="Words operations")
progress_controller = ProgressController()

reading_model = ns.model(
    "Reading",
    {
        "kanji": fields.String(description="Kanji forms"),
        "kanji_split": fields.List(fields.String, description="Kanji splits"),
        "kana": fields.String(description="Kana forms"),
        "kana_split": fields.List(fields.String, description="Kana splits"),
        "kanji_split_type": fields.List(fields.String, description="Kanji split types"),
        "english": fields.List(fields.String, description="English meanings"),
    },
)

level_model = ns.model(
    "Level",
    {
        "jlpt": fields.String(description="JLPT Level (e.g., N5)"),
        # "wanikani": fields.Integer(description="Wanikani Level"),
        "custom": fields.Integer(description="Custom Level tag"),
    },
)

word_model = ns.model(
    "Word",
    {
        "id": fields.Integer(description="Word ID"),
        "surface": fields.String(description="Surface form"),
        "reading": fields.Nested(reading_model),
        "level": fields.Nested(level_model),
        "part_of_speech": fields.List(fields.String),
        "category": fields.List(fields.String),
        "created_at": fields.String,
        "updated_at": fields.String,
    },
)

# Input Model (Optional, but good for docs)
word_input_model = ns.model(
    "WordInput",
    {
        "reading": fields.Nested(reading_model, required=True),
        "level": fields.Nested(level_model),
        "part_of_speech": fields.List(fields.String),
        "category": fields.List(fields.String),
    },
)

# TODO: /search # replicate @ns.param("q", "Search query")


@ns.route("/list")
class WordListResource(Resource):
    @ns.doc("list_words")
    @ns.marshal_list_with(word_model)
    @ns.param("start_id", "Start ID (inclusive)")
    @ns.param("end_id", "End ID (inclusive)")
    @ns.param("q", "Search query")
    @ns.param("jlpt", "JLPT Level (e.g. N5)")
    @ns.param("custom_level", "Custom Level (integer)")
    @ns.param("part_of_speech", "Part of Speech (comma separated)")
    @ns.param("tags", "Tags/Categories (comma separated)")
    @ns.param("limit", "Max number of results (default 100)")
    def get(self):
        """List words within a specific ID range or matching a query."""

        start_id = request.args.get("start_id", type=int)
        end_id = request.args.get("end_id", type=int)
        q = request.args.get("q", type=str)
        limit = request.args.get("limit", type=int, default=100)

        # Filters
        jlpt = request.args.get("jlpt", type=str)
        custom_level = request.args.get("custom_level", type=int)

        # Handle list params
        part_of_speech = request.args.getlist("part_of_speech")
        if not part_of_speech and request.args.get("part_of_speech"):
            part_of_speech = request.args.get("part_of_speech").split(",")

        tags = request.args.getlist("tags")
        if not tags and request.args.get("tags"):
            tags = request.args.get("tags").split(",")

        filters = {
            "q": q,
            "jlpt": jlpt,
            "custom_level": custom_level,
            "part_of_speech": part_of_speech,
            "tags": tags,
            "start_id": start_id,
            "end_id": end_id,
        }

        query_builder = WordQuery()
        query_builder.apply_filters(filters)

        if any(filters.values()):
            logger.info(f"[WORDS] Searching with filters: {filters}")

        words = query_builder.execute(limit=limit)
        return [word.to_dict() for word in words]


@ns.route("/<int:id>")
@ns.response(404, "Word not found")
@ns.param("id", "The word identifier")
class WordResource(Resource):
    @ns.doc("get_word")
    @ns.marshal_with(word_model)
    def get(self, id):
        """Fetch a word given its identifier."""
        word = Word.query.get_or_404(id)
        return word.to_dict()
        # return "rafa"

    @ns.doc("update_word")
    @ns.expect(word_input_model)
    @ns.marshal_with(word_model)
    def put(self, id):
        """Update a word given its identifier."""
        word = Word.query.get_or_404(id)
        data = request.json

        if "surface" in data:
            word.surface = data["surface"]
        if "reading" in data:
            word.reading = data["reading"]
        if "level" in data:
            word.level = data["level"]
        if "part_of_speech" in data:
            word.part_of_speech = data["part_of_speech"]
        if "category" in data:
            word.category = data["category"]

        db.session.commit()
        return word.to_dict()


@ns.route("/edit")
class CreateWord(Resource):
    @ns.doc("create_word")
    @ns.expect(word_input_model)
    @ns.marshal_with(word_model)
    def post(self):
        """Create a new word."""
        data = request.json

        # Basic validation for required fields beyond what expect provides
        if "reading" not in data:
            ns.abort(400, "Reading data is required")

        new_word = Word(
            surface=data.get("surface", ""),
            reading=data.get("reading", {}),
            level=data.get("level", {}),
            part_of_speech=data.get("part_of_speech", []),
            category=data.get("category", []),
        )

        db.session.add(new_word)
        db.session.commit()

        return new_word.to_dict(), 201


@ns.route("/settings")
class WordSettings(Resource):
    @ns.doc("init_session")
    def post(self):
        import uuid

        session_settings = request.json
        session_id = str(uuid.uuid4())

        flask_session["flashcard_settings"] = session_settings
        flask_session["session_id"] = session_id
        flask_session.pop("word_queue", None)

        logger.debug(f"Updated session settings: {session_settings}, Session ID: {session_id}")
        return {"message": "Session initialized", "settings": session_settings, "session_id": session_id}, 200


@ns.route("/next")
class NextWord(Resource):
    @ns.doc("get_next_word")
    @ns.marshal_with(word_model)
    def get(self):
        settings = flask_session.get("flashcard_settings", {})

        if settings.get("mode") == "anki" or settings.get("learningRatio") is not None:
            user_id = flask_session.get("user_id")
            deck = AnkiDeck(settings, user_id=user_id)
        elif settings.get("mode") == "custom-list":
            user_id = flask_session.get("user_id")
            deck = FavouriteDeck(settings, user_id=user_id)
        else:
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
        # TODO: Get actual user ID from authcontext. Defaulting to 1 for MVP/Demo based on single user context.
        user_id = 1

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
        user_id = 8  # Same placeholder

        try:
            # Controller handles session_id lookup if None
            stats = progress_controller.get_session_stats(user_id, session_id)
            return {"success": True, "data": stats}, 200
        except Exception as e:
            logger.error(f"Error fetching stats: {e}")
            return {"success": False, "error": str(e)}, 500
