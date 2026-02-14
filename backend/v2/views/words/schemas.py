from flask_restx import fields

from . import ns

# We need the namespace to define models.
# Ideally, we define models on the namespace instance.
# But we can also define them using `fields` and later register?
# Actually, Flask-RestX models are tied to a namespace or api instance.
# To avoid circular imports, let's inject the namespace or create a helper.
# Or better: Define the namespace in `__init__.py` or `endpoints.py` and import it here?
# Let's define the namespace in `__init__.py` and import it here to register models.


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

word_input_model = ns.model(
    "WordInput",
    {
        "reading": fields.Nested(reading_model, required=True),
        "level": fields.Nested(level_model),
        "part_of_speech": fields.List(fields.String),
        "category": fields.List(fields.String),
    },
)
