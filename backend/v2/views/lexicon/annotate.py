import spacy
from flask import request
from flask_restx import Resource, fields

from ...controllers.words.search import WordQuery
from .route import ns

# Load spaCy model
try:
    nlp = spacy.load("ja_core_news_sm")
except OSError:
    # Fallback or error if model not found (should catch during build)
    print("Warning: ja_core_news_sm model not found. Downloading...")
    from spacy.cli import download

    download("ja_core_news_sm")
    nlp = spacy.load("ja_core_news_sm")

# Models
vocab_model = ns.model(
    "Vocab",
    {
        "known": fields.Boolean,
        "word_id": fields.Integer,
        "candidates": fields.List(
            fields.Raw
        ),  # Determine schema if we want strict typing, but Raw is safer for mixed JSONB
    },
)

token_model = ns.model(
    "Token",
    {
        "token_id": fields.Integer,
        "surface": fields.String,
        "start": fields.Integer,
        "end": fields.Integer,
        "pos": fields.String,
        "lemma": fields.String,
        "label": fields.String,
        "morph": fields.Raw,
        "dep": fields.String,
        "lexeme_id": fields.Integer,
        "vocab": fields.Nested(vocab_model),
    },
)

lexeme_model = ns.model(
    "Lexeme",
    {
        "lexeme_id": fields.Integer,
        "surface": fields.String,
        "start": fields.Integer,
        "end": fields.Integer,
        "pos": fields.String,
        "lemma": fields.String,
        "token_ids": fields.List(fields.Integer),
        "vocab": fields.Nested(vocab_model),
    },
)

annotate_response = ns.model(
    "AnnotateResponse",
    {
        "text": fields.String,
        "tokens": fields.List(fields.Nested(token_model)),
        "lexemes": fields.List(fields.Nested(lexeme_model)),
    },
)

POS_MAPPING = {
    "NOUN": "NOUN",
    "VERB": "VERB",
    "ADJ": "ADJ",
    "ADV": "ADV",
    "PRON": "PRONOUN",
    "ADP": "PARTICLE",
    "AUX": "AUX",
    "CONJ": "CONJ",
    "CCONJ": "CONJ",
    "SCONJ": "AUX_PART",  # Approximate based on example (te-form)
    "DET": "DET",
    "NUM": "NUM",
    "PART": "PARTICLE",
    "INTJ": "INTJ",
    "SYM": "SYM",
    "PUNCT": "PUNCT",
    "X": "OTHER",
}


@ns.route("/annotate")
class Annotate(Resource):
    @ns.expect(ns.model("AnnotateInput", {"text": fields.String(required=True), "options": fields.Raw}))
    @ns.marshal_with(annotate_response)
    def post(self):
        data = request.json
        text = data.get("text", "")
        # options = data.get("options", {})

        doc = nlp(text)

        token_list = []

        for i, t in enumerate(doc):
            label = POS_MAPPING.get(t.pos_, t.pos_)

            candidates = WordQuery().filter_by_text(t.lemma_).execute(limit=5)
            if not candidates and t.text != t.lemma_:
                candidates = WordQuery().filter_by_text(t.text).execute(limit=5)

            vocab_data = {"known": False, "word_id": None, "candidate_ids": [], "candidate_scores": []}

            if candidates:
                best_match = None
                for c in candidates:
                    if c.surface == t.lemma_ or c.reading.get("kana") == t.lemma_ or c.reading.get("kanji") == t.lemma_:
                        best_match = c
                        break

                if not best_match:
                    best_match = candidates[0]

                vocab_data["known"] = True
                vocab_data["word_id"] = best_match.id
                vocab_data["known"] = True
                vocab_data["word_id"] = best_match.id
                vocab_data["candidates"] = [c.to_dict() for c in candidates]

            token_obj = {
                "token_id": i,
                "surface": t.text,
                "start": t.idx,
                "end": t.idx + len(t.text),
                "pos": t.pos_,
                "lemma": t.lemma_,
                "label": label,
                "morph": str(t.morph),  # serialize morph
                "dep": t.dep_,
                "vocab": vocab_data,
            }
            token_list.append(token_obj)
        lexeme_map = []  # list of [token_indices]

        i = 0
        while i < len(token_list):
            current_tokens = [i]

            # Check next tokens for merging
            j = i + 1
            while j < len(token_list):
                next_t = token_list[j]
                prev_t = token_list[j - 1]

                # Rule: Merge if next is SCONJ or AUX and previous is VERB/ADJ/AUX
                if next_t["pos"] in ["SCONJ", "AUX"] and prev_t["pos"] in ["VERB", "ADJ", "AUX"]:
                    current_tokens.append(j)
                    j += 1
                else:
                    break

            lexeme_map.append(current_tokens)
            i = j

        # Construct response
        final_tokens = []
        final_lexemes = []

        for lex_idx, t_indices in enumerate(lexeme_map):
            # Create Lexeme
            first_t = token_list[t_indices[0]]
            last_t = token_list[t_indices[-1]]

            # Combine surface
            surface = "".join([token_list[ti]["surface"] for ti in t_indices])

            # Vocab comes from the HEAD (usually the first one in this left-to-right merge logic for verbs)
            # "Tabe"(Head) + "te". Head is "Tabe".
            head_token = first_t  # roughly
            vocab = head_token["vocab"]

            lexeme_obj = {
                "lexeme_id": lex_idx,
                "surface": surface,
                "start": first_t["start"],
                "end": last_t["end"],
                "pos": POS_MAPPING.get(first_t["pos"], first_t["pos"]),  # Use head POS? "Tabete" -> VERB
                "lemma": first_t["lemma"],
                "token_ids": t_indices,
                "vocab": vocab,
            }
            final_lexemes.append(lexeme_obj)

            for ti in t_indices:
                t = token_list[ti]
                t["lexeme_id"] = lex_idx
                final_tokens.append(t)

        return {"text": text, "tokens": final_tokens, "lexemes": final_lexemes}
