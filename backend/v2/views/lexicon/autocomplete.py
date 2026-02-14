# v2/views/lexicon/autocomplete.py
from flask import request
from flask_restx import Resource, fields

from ...controllers.api.models.words import GroqWordGenerator
from ...logger import get_logger
from .route import ns

logger = get_logger("lexicon/autocomplete")

autocomplete_model = ns.model(
    "AutocompleteRequest",
    {
        "word": fields.String(required=True, description="Word to autocomplete"),
        "model": fields.String(description="Groq model to use", default="llama3-70b-8192"),
    },
)

groq_generator = GroqWordGenerator()


@ns.route("/autocomplete")
class AutocompleteWord(Resource):
    @ns.doc("autocomplete_word")
    @ns.expect(autocomplete_model)
    def post(self):
        """
        Autocomplete a Japanese word using Groq, returning structure and examples.
        """
        data = request.json
        word = data.get("word")
        model = data.get("model")

        if not word:
            return {"error": "Word is required"}, 400

        try:
            result = groq_generator(word, model)

            if not result:
                return {"error": "Failed to generate data"}, 500

            return result, 200

        except Exception as e:
            logger.error(f"Error in autocomplete: {e}")
            return {"error": str(e)}, 500
