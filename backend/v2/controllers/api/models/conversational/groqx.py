import json
import os

from groq import Groq

from .....logger import get_logger
from .prompt import get_prompt

logger = get_logger("groq_conversational")


class GroqConversationalAgent:
    def __init__(self, *args, **kwargs) -> None:
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    def chat(self, user_input: str, model: str = "openai/gpt-oss-20b", *args, **kwargs) -> dict:
        model = "openai/gpt-oss-20b" if model is None else model
        response = None

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": get_prompt(user_input),
                    },
                    {
                        "role": "user",
                        "content": user_input,
                    },
                ],
                model=model,
                response_format={"type": "json_object"},
            )
            content = chat_completion.choices[0].message.content
            try:
                response = json.loads(content)
            except json.JSONDecodeError:
                cleaned_content = content.strip().removeprefix("```json").removesuffix("```").strip()
                response = json.loads(cleaned_content)

            return response

        except Exception as e:
            logger.error(f"Error in conversation with input {user_input}: {e}")
            if response is not None:
                logger.error(f"{response=}")
            # Return a fallback structure to avoid frontend crashes
            return {
                "user_input": {"english": "", "japanese": ""},
                "agent_response": {"english": "Sorry, I encountered an error.", "japanese": "申し訳ありません、エラーが発生しました。"},
            }

    def __call__(self, *args, **kwargs):
        return self.chat(*args, **kwargs)


if __name__ == "__main__":
    agent = GroqConversationalAgent()
    print(agent("Hello, how are you?"))
