# v2/views/gemini.py
from flask import request
from flask_restx import Resource, fields

from ...controllers.api.models import GeminiVocabularyAnnotation, GroqVocabularyAnnotation
from ...logger import get_logger
from .route import ns

logger = get_logger("lexicon/discover")

annotation_model = ns.model(
    "AnnotationRequest",
    {
        "word": fields.String(required=True, description="Button text to annotate"),
        "model": fields.String(description="Gemini model to use", default="gemini-2.5-flash"),
    },
)

logger.info("DiscoverWord initialized")
groq_annotator = GroqVocabularyAnnotation()
gemini_annotator = GeminiVocabularyAnnotation()


@ns.route("/discover")
class DiscoverWord(Resource):
    @ns.doc("discover_word")
    @ns.expect(annotation_model)
    def post(self):
        """
        Discover a Japanese word using Gemini.
        """
        data = request.json
        word = data.get("word")
        model = data.get("model")
        api_caller = data.get("api_caller", "groq")

        if not word:
            return {"error": "Word is required"}, 400

        try:
            if api_caller == "groq":
                vocab_annotator = groq_annotator
            else:
                vocab_annotator = gemini_annotator
            result = vocab_annotator(word, model)

            # Post-process to add structure if needed by frontend
            # The frontend expects "segments" which combines the splits
            if "reading" in result:
                r = result["reading"]
                kanji_splits = r.get("kanji_split", [])
                kana_splits = r.get("kana_split", [])
                types = r.get("kanji_split_type", [])

                # Zip into segments if lengths match
                # If lengths don't match, we rely on the frontend or just send empty segments
                segments = []
                if len(kanji_splits) == len(kana_splits) == len(types):
                    for k, ka, t in zip(kanji_splits, kana_splits, types):
                        segments.append({"kanji": k, "kana": ka, "type": t})
                result["segments"] = segments

            return result, 200
        except Exception as e:
            import traceback

            logger.error(f"Error calling {api_caller}: {traceback.format_exc()}")
            return {"error": str(e)}, 500
