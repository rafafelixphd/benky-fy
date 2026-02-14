import json
import os

from groq import Groq

from .....logger import get_logger
from .prompt import get_autocomplete_prompt

logger = get_logger("groq_word_generator")


class GroqWordGenerator:
    def __init__(self, *args, **kwargs) -> None:
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    def generate(self, word: str, model: str = "openai/gpt-oss-20b", *args, **kwargs) -> dict:
        # Default to a capable model if none or invalid provided,
        # though explicit model passing is preferred.
        model = "openai/gpt-oss-20b" if not model else model
        response = None

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": get_autocomplete_prompt(word),
                    },
                    {
                        "role": "user",
                        "content": f"Analyze: {word}",
                    },
                ],
                model=model,
                response_format={"type": "json_object"},
                temperature=0.3,  # Lower temperature for more deterministic/factual output
            )

            content = chat_completion.choices[0].message.content
            try:
                response = json.loads(content)
            except json.JSONDecodeError:
                # Fallback clean up if model includes markdown despite instructions
                cleaned_content = content.replace("```json", "").replace("```", "").strip()
                response = json.loads(cleaned_content)

            return response

        except Exception as e:
            logger.error(f"Error generating data for word {word}: {e}")
            if response:
                logger.error(f"Raw response: {response}")
            return {}

    def __call__(self, *args, **kwargs):
        return self.generate(*args, **kwargs)
