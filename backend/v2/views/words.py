# views/words.py
from flask import request
from flask import session as flask_session
from flask_restx import Namespace, Resource, fields

from ..config.database import db
from ..controllers.words.flashcards import FlashCardsDeck
from ..logger import get_logger
from ..models import Word

logger = get_logger(namespace="words")
ns = Namespace("words", description="Words operations")

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


@ns.route("/settings")
class WordSettings(Resource):
    @ns.doc("init_session")
    def post(self):
        session_settings = request.json
        flask_session["flashcard_settings"] = session_settings
        flask_session.pop("word_queue", None)
        logger.debug(f"Updated session settings: {session_settings}")
        return {"message": "Session initialized", "settings": session_settings}, 200


@ns.route("/next")
class NextWord(Resource):
    @ns.doc("get_next_word")
    @ns.marshal_with(word_model)
    def get(self):
        settings = flask_session.get("flashcard_settings", {})
        deck = FlashCardsDeck(settings)
        word = deck.draw_next(flask_session)
        if not word:
            ns.abort(404, "No words found matching criteria")
        return word.to_dict()
