from flask import request
from flask_restx import Resource

from ...controllers.words.manager import WordManager
from ...logger import get_logger
from . import ns
from .schemas import word_input_model, word_model
from .utils import check_auth, get_user_controller

logger = get_logger(namespace="words")


@ns.route("/<int:id>")
@ns.response(404, "Word not found")
@ns.param("id", "The word identifier")
class WordResource(Resource):
    @ns.doc("get_word")
    @ns.marshal_with(word_model)
    def get(self, id):
        """Fetch a word given its identifier. Prioritizes UserOwnWord shadow copies."""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        user_id = user["id"] if user else None

        manager = WordManager(user_id=user_id)
        word = manager.get_word(id)

        if not word:
            ns.abort(404, "Word not found")

        return word.to_dict()

    @ns.doc("update_word")
    @ns.expect(word_input_model)
    @ns.marshal_with(word_model)
    def put(self, id):
        """Update a word. If Global, creates a User shadow copy."""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            ns.abort(401, "Unauthorized")
        user_id = user["id"]

        data = request.json
        manager = WordManager(user_id=user_id)

        try:
            updated_word = manager.update_word(id, data)
            if not updated_word:
                ns.abort(404, "Word not found")
            return updated_word.to_dict()
        except Exception as e:
            logger.error(f"Error updating word: {e}")
            ns.abort(500, str(e))


@ns.route("/edit")
class CreateWord(Resource):
    @ns.doc("create_word")
    @ns.expect(word_input_model)
    @ns.marshal_with(word_model)
    def post(self):
        """Create a new word (UserOwnWord)."""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            ns.abort(401, "Unauthorized")
        user_id = user["id"]

        data = request.json
        if "reading" not in data:
            ns.abort(400, "Reading data is required")

        manager = WordManager(user_id=user_id)
        try:
            new_word = manager.create_word(data)
            return new_word.to_dict(), 201
        except Exception as e:
            logger.error(f"Error creating word: {e}")
            ns.abort(500, str(e))
