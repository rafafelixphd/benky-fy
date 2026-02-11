import ast
import json
import os

from google import genai

from .....logger import get_logger
from .prompt import get_prompt

logger = get_logger("google/gemini")


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
