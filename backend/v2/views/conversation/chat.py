from flask import request
from flask_restx import Resource, fields

from ...controllers.api.models import GroqConversationalAgent
from ...logger import get_logger
from .route import ns

logger = get_logger("conversation/chat")

chat_model = ns.model(
    "ChatRequest",
    {
        "user_input": fields.String(required=True, description="User input text"),
        "model": fields.String(description="Model to use", default="llama3-70b-8192"),
    },
)

agent = GroqConversationalAgent()


@ns.route("/chat")
class Chat(Resource):
    @ns.doc("chat_with_agent")
    @ns.expect(chat_model)
    def post(self):
        """
        Chat with the conversational agent.
        """
        data = request.json
        user_input = data.get("user_input")
        model = data.get("model")

        if not user_input:
            return {"error": "User input is required"}, 400

        try:
            result = agent(user_input, model)
            return result, 200
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return {"error": str(e)}, 500
