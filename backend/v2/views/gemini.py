# v2/views/gemini.py
from flask import request
from flask_restx import Namespace, Resource, fields

from ..controllers.api.gemini.vocabulary import VocabularyAnnotation
from ..logger import get_logger

logger = get_logger("views/gemini")

ns = Namespace("gemini", description="Gemini AI operations")

annotation_model = ns.model(
    "AnnotationRequest",
    {
        "word": fields.String(required=True, description="Button text to annotate"),
        "model": fields.String(description="Gemini model to use", default="gemini-2.5-flash"),
    },
)

# Instantiate the controller once
vocab_annotator = VocabularyAnnotation()


@ns.route("/annotate")
class AnnotateWord(Resource):
    @ns.doc("annotate_word")
    @ns.expect(annotation_model)
    def post(self):
        """
        Annotate a Japanese word using Gemini.
        """
        data = request.json
        word = data.get("word")
        model = data.get("model", "gemini-2.5-flash")

        if not word:
            return {"error": "Word is required"}, 400

        try:
            result = vocab_annotator.annotate(word, model=model)

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
            logger.error(f"Error calling Gemini: {e}")
            return {"error": str(e)}, 500
