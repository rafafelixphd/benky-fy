# views/words.py
import random

from flask import request
from flask_restx import Namespace, Resource, fields

from ..config.database import db
from ..logger import get_logger
from ..models import Word

logger = get_logger(namespace="words")


ns = Namespace("words", description="Words operations")

# Output Model
reading_model = ns.model(
    "Reading",
    {
        "kanji": fields.List(fields.String, description="Kanji forms"),
        "furigana": fields.List(
            fields.Raw, description="Furigana readings (String or False)"
        ),  # Raw to support mixed types
        "kana": fields.List(fields.String, description="Kana readings"),
        "romaji": fields.List(fields.String, description="Romaji readings"),
        "katakana": fields.List(fields.String, description="Katakana readings"),
        "english": fields.List(fields.String, description="English meanings"),
    },
)

level_model = ns.model(
    "Level",
    {
        "jlpt": fields.String(description="JLPT Level (e.g., N5)"),
        "wanikani": fields.Integer(description="Wanikani Level"),
        "custom": fields.String(description="Custom Level tag"),
    },
)

word_model = ns.model(
    "Word",
    {
        "id": fields.Integer(description="Word ID"),
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


@ns.route("/")
class WordList(Resource):
    @ns.doc("list_words")
    @ns.marshal_list_with(word_model)
    def get(self):
        """List all words with optional filtering."""
        query = Word.query

        # Filter by JLPT Level (nested JSONB)
        jlpt = request.args.get("jlpt")
        if jlpt:
            query = query.filter(Word.level["jlpt"].astext == jlpt)

        # Filter by Part of Speech (Array overlap)
        pos = request.args.get("part_of_speech")
        if pos:
            query = query.filter(Word.part_of_speech.contains([pos]))

        # Filter by Category (Array overlap)
        category = request.args.get("category")
        if category:
            query = query.filter(Word.category.contains([category]))

        return [w.to_dict() for w in query.all()]

    @ns.doc("create_word")
    @ns.expect(word_input_model)
    @ns.marshal_with(word_model, code=201)
    @ns.response(409, "Word already exists")
    def post(self):
        """Create a new word."""
        data = request.json

        # 1. Check ID conflict if provided
        if "id" in data:
            if Word.query.get(data["id"]):
                ns.abort(409, f"Word with ID {data['id']} already exists.")

        # 2. Duplicate Detection
        # Check: Same Kanji AND overlapping English
        reading = data.get("reading", {})
        input_kanji = reading.get("kanji", [])
        input_english = set(x.lower() for x in reading.get("english", []))

        if input_kanji and input_english:
            # Find potential matches by Kanji (Postgres @> operator)
            # This checks if an existing word's kanji list contains ALL input kanji
            # (Or strict equality if lists are identical, simplified approach here)
            candidates = Word.query.filter(Word.reading.contains({"kanji": input_kanji})).all()

            for candidate in candidates:
                candidate_english = set(x.lower() for x in candidate.reading.get("english", []))
                if not input_english.isdisjoint(candidate_english):
                    # Overlap found
                    ns.abort(409, f"Duplicate word detected (ID {candidate.id}): Matches Kanji and English meaning.")

        word = Word(
            id=data.get("id"),  # Optional
            reading=data.get("reading", {}),
            level=data.get("level", {}),
            part_of_speech=data.get("part_of_speech", []),
            category=data.get("category", []),
        )

        db.session.add(word)
        db.session.commit()
        return word.to_dict(), 201


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

    @ns.doc("update_word")
    @ns.expect(word_input_model)
    @ns.marshal_with(word_model)
    def put(self, id):
        """Update a word given its identifier."""
        word = Word.query.get_or_404(id)
        data = request.json

        if "reading" in data:
            word.reading = data["reading"]
            # Important: flag modified for JSONB to track changes if updating nested dict in-place
            # But full assignment usually triggers it.
            # flag_modified(word, "reading")

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
        """Initialize a flashcard session with settings."""
        data = request.json
        # user_id = 1  # TODO: getting from auth context if available, otherwise defaulting for demo

        # Create or update active session
        # session = FlashcardSession.query.filter_by(user_id=user_id, is_active=True).first()
        # if not session:
        # session = FlashcardSession(user_id=user_id, settings=data)
        # db.session.add(session)
        # else:
        # session.settings = data
        # session.created_at = datetime.utcnow() # Reset time?

        logger.info(f"{data=}")
        # db.session.commit()
        return {"message": "Session initialized"}, 200


@ns.route("/random")
class RandomWord(Resource):
    @ns.doc("get_random_word")
    @ns.marshal_with(word_model)
    def get(self):
        """Fetch a random word based on active session settings."""
        # from sqlalchemy.sql.expression import func

        # from ..models import FlashcardSession
        # user_id = 1  # TODO: use auth
        # Get active session settings
        # session = FlashcardSession.query.filter_by(user_id=user_id, is_active=True).first()

        # query = Word.query

        # if session and session.settings:
        # settings = session.settings

        # Filter by JLPT
        # if "jlpt" in settings and settings["jlpt"]:
        # Handle "N5" vs "n5" normalization if needed, or exact match
        # query = query.filter(Word.level["jlpt"].astext == settings["jlpt"])

        # Filter by Category
        # if "categories" in settings and settings["categories"]:
        # settings["categories"] expected to be a list ["Animals", "Food"]
        # Postgres && operator for array overlap: array['a', 'b'] && column_array
        # SQLAlchemy: Column.overlap(list)
        # query = query.filter(Word.category.overlap(settings["categories"]))
        # else:
        # query = Word.query
        word = Word.query.get_or_404(random.randint(1, Word.query.count()))
        return word.to_dict()
