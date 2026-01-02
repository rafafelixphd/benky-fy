import ast
import json
import os

from groq import Groq

from ....logger import get_logger

logger = get_logger("groq")


def get_prompt(word: str) -> str:
    return f"""
    # Prompt: Japanese Vocabulary JSON Annotation

    ## System
    You are a Japanese vocabulary annotation engine. Your task is to
    convert a given word by the user into a structured JSON object.
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


class GroqVocabularyAnnotation:
    def __init__(self, *args, **kwargs) -> None:
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    def annotate(self, word: str, model: str = "openai/gpt-oss-20b", *args, **kwargs) -> str:
        model = "openai/gpt-oss-20b" if model is None else model
        response = None
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": get_prompt(word),
                    },
                    {
                        "role": "user",
                        "content": word,
                    },
                ],
                model=model,
            )
            response = json.loads(ast.literal_eval(chat_completion.choices[0].message.content))
            return response

        except Exception as e:
            logger.error(f"{get_prompt(word)}")
            logger.error(f"Error annotating word {word}: {e}")
            if response is not None:
                logger.error(f"{response=}")

        return {}

    def __call__(self, *args, **kwargs):
        return self.annotate(*args, **kwargs)
