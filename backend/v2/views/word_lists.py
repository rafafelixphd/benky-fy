from flask import request, session
from flask_restx import Namespace, Resource, fields

from ..config.session import SessionContext
from ..controllers.users import UserController
from ..controllers.word_lists import WordListController
from ..logger import get_logger

logger = get_logger(namespace="views.word_lists")

ns = Namespace("word-lists", description="Custom Word Lists operations")

# DTOs
word_list_create_model = ns.model(
    "WordListCreate",
    {
        "name": fields.String(required=True, description="Name of the list"),
        "description": fields.String(description="Description of the list"),
    },
)

word_list_update_model = ns.model(
    "WordListUpdate",
    {
        "name": fields.String(description="Name of the list"),
        "description": fields.String(description="Description of the list"),
    },
)

word_add_model = ns.model(
    "WordListAddEntry",
    {
        "word_id": fields.Integer(required=True, description="ID of the word to add"),
    },
)


# Helpers
def get_user_controller():
    ctx = SessionContext(session)
    return ctx, UserController(ctx)


def check_auth(user_controller):
    auth_result, status = user_controller.check_auth()
    if status != 200 or not auth_result.get("authenticated"):
        return None
    return auth_result.get("user")


@ns.route("")
class WordListCollection(Resource):
    @ns.doc("list_word_lists")
    def get(self):
        """Get all word lists for the current user"""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            return {"error": "Unauthorized"}, 401

        lists = WordListController.get_user_lists(user["id"])
        return [_l.to_dict() for _l in lists], 200

    @ns.doc("create_word_list")
    @ns.expect(word_list_create_model)
    def post(self):
        """Create a new word list"""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            return {"error": "Unauthorized"}, 401

        data = request.get_json()
        try:
            new_list = WordListController.create_list(
                user_id=user["id"], name=data["name"], description=data.get("description")
            )
            return new_list.to_dict(), 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            logger.error(f"Error creating list: {e}")
            return {"error": "Internal Server Error"}, 500


@ns.route("/<int:list_id>")
@ns.param("list_id", "The list identifier")
class WordListItem(Resource):
    @ns.doc("get_word_list")
    def get(self, list_id):
        """Get a specific word list details"""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            return {"error": "Unauthorized"}, 401

        word_list = WordListController.get_list_by_id(user["id"], list_id)
        if not word_list:
            return {"error": "List not found"}, 404

        # Also fetch words for this list?
        # For now, just return list metadata + entry count (in to_dict)
        # To get words, maybe a separate endpoint /words or include here?
        # Let's include words here for simplicity if the list isn't huge.
        # But per REST, maybe /words is better.
        # However, usually you want to see the list content.
        # Let's add 'words' to the response manually.

        response = word_list.to_dict()
        words = WordListController.get_list_words(user["id"], list_id)
        response["words"] = [w.to_dict() for w in words]

        return response, 200

    @ns.doc("update_word_list")
    @ns.expect(word_list_update_model)
    def put(self, list_id):
        """Update a word list"""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            return {"error": "Unauthorized"}, 401

        data = request.get_json()
        try:
            updated_list = WordListController.update_list(
                user_id=user["id"], list_id=list_id, name=data.get("name"), description=data.get("description")
            )
            if not updated_list:
                return {"error": "List not found"}, 404
            return updated_list.to_dict(), 200
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            logger.error(f"Error updating list: {e}")
            return {"error": "Internal Server Error"}, 500

    @ns.doc("delete_word_list")
    def delete(self, list_id):
        """Delete a word list"""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            return {"error": "Unauthorized"}, 401

        try:
            success = WordListController.delete_list(user["id"], list_id)
            if not success:
                return {"error": "List not found"}, 404
            return {"message": "List deleted successfully"}, 200
        except Exception as e:
            logger.error(f"Error deleting list: {e}")
            return {"error": "Internal Server Error"}, 500


@ns.route("/<int:list_id>/words")
@ns.param("list_id", "The list identifier")
class WordListEntries(Resource):
    @ns.doc("add_word_to_list")
    @ns.expect(word_add_model)
    def post(self, list_id):
        """Add a word to the list"""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            return {"error": "Unauthorized"}, 401

        data = request.get_json()
        word_id = data.get("word_id")
        if not word_id:
            return {"error": "word_id is required"}, 400

        try:
            entry = WordListController.add_word_to_list(user["id"], list_id, word_id)
            if entry is None:
                # Could be list not found OR already exists (if helper returns None
                # for duplicates? No, helper returns existing).
                # Helper returns None if list not found.
                return {"error": "List not found"}, 404
            return entry.to_dict(), 201
        except ValueError as e:
            return {"error": str(e)}, 404  # Word not found
        except Exception as e:
            logger.error(f"Error adding word to list: {e}")
            return {"error": "Internal Server Error"}, 500


@ns.route("/<int:list_id>/words/<int:word_id>")
@ns.param("list_id", "The list identifier")
@ns.param("word_id", "The word identifier")
class WordListEntryItem(Resource):
    @ns.doc("remove_word_from_list")
    def delete(self, list_id, word_id):
        """Remove a word from the list"""
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        if not user:
            return {"error": "Unauthorized"}, 401

        try:
            success = WordListController.remove_word_from_list(user["id"], list_id, word_id)
            if not success:
                return {"error": "Entry not found"}, 404
            return {"message": "Word removed from list"}, 200
        except Exception as e:
            logger.error(f"Error removing word from list: {e}")
            return {"error": "Internal Server Error"}, 500
