import ast
import json
import os

from groq import Groq

from .....logger import get_logger
from .prompt import get_prompt

logger = get_logger("groq")


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
