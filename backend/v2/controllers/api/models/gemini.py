import ast
import json
import os

from google import genai

from ....logger import get_logger

logger = get_logger("google/gemini")


def get_prompt(word: str) -> str:
    return f"""
    # Prompt: Japanese Vocabulary JSON Annotation

    ## System
    You are a Japanese vocabulary annotation engine. Your task is to convert a given
    word by the user into a structured JSON object.
    Accuracy is critical. **Do not guess** readings, meanings, or levels.

    ## Rules
    - Output **valid JSON only**
    - Do **not** add, remove, or rename fields
    - If information is uncertain, use:
    - `unknown` for strings
    - `[]` for arrays
    - Character splits must preserve **original order**
    - English meanings must be **simple dictionary glosses**
    - JLPT level must be one of: n1, n2, n3, n4, n5, unknown
    - Do not include explanations, markdown, or comments

    ## Task
    Given the word `{word}`, complete the JSON specification below.

    ### JSON Schema:
    surface: string # Constraint: use kanji preferibly if available
    reading:
        kanji: string
        kanji_split: string[]
        kanji_split_type: string[]
        kana: string
        kana_split: string[] # split by reading the kanji split
        english: string[]
    level:
        jlpt: str,
    part_of_speech: string[]
    category: string[]

    ## Output constraints (strict):
    - Return ONLY the JSON object (no markdown, no backticks, no code fences)
    - The first character MUST be '{' and the last character MUST be '}'
    - Do not include any text before or after the JSON
    """


class GeminiVocabularyAnnotation:
    def __init__(self, *args, **kwargs) -> None:
        self.client = genai.Client(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))

    def annotate(self, word: str, model: str = "gemini-2.5-flash") -> str:
        model = "gemini-2.5-flash" if model is None else model

        response = None
        try:
            response = self.client.models.generate_content(
                model=model,
                contents=get_prompt(word),
                config=genai.types.GenerateContentConfig(
                    thinking_config=genai.types.ThinkingConfig(thinking_budget=0)  # Disables thinking
                ),
            )
            return json.loads(ast.literal_eval(response.text))

        except Exception as e:
            logger.error(f"{get_prompt(word)}")
            logger.error(f"Error annotating word {word}: {e}")
            if response is not None:
                logger.error(f"{response=}")

        return {}

    def __call__(self, *args, **kwargs):
        return self.annotate(*args, **kwargs)
