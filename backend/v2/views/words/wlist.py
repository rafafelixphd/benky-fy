from flask import request
from flask_restx import Resource

from ...controllers.words.search import WordQuery
from ...logger import get_logger
from . import ns
from .schemas import word_model
from .utils import check_auth, get_user_controller

logger = get_logger(namespace="words")


@ns.route("/list")
class WordListResource(Resource):
    @ns.doc("list_words")
    @ns.marshal_list_with(word_model)
    @ns.param("start_id", "Start ID (inclusive)")
    @ns.param("end_id", "End ID (inclusive)")
    @ns.param("q", "Search query")
    @ns.param("jlpt", "JLPT Level (e.g. N5)")
    @ns.param("custom_level", "Custom Level (integer)")
    @ns.param("part_of_speech", "Part of Speech (comma separated)")
    @ns.param("tags", "Tags/Categories (comma separated)")
    @ns.param("limit", "Max number of results (default 100)")
    def get(self):
        """List words within a specific ID range or matching a query."""

        start_id = request.args.get("start_id", type=int)
        end_id = request.args.get("end_id", type=int)
        q = request.args.get("q", type=str)
        limit = request.args.get("limit", type=int, default=100)

        # Filters
        jlpt = request.args.get("jlpt", type=str)
        custom_level = request.args.get("custom_level", type=int)

        # Handle list params
        part_of_speech = request.args.getlist("part_of_speech")
        if not part_of_speech and request.args.get("part_of_speech"):
            part_of_speech = request.args.get("part_of_speech").split(",")

        tags = request.args.getlist("tags")
        if not tags and request.args.get("tags"):
            tags = request.args.get("tags").split(",")

        filters = {
            "q": q,
            "jlpt": jlpt,
            "custom_level": custom_level,
            "part_of_speech": part_of_speech,
            "tags": tags,
            "start_id": start_id,
            "end_id": end_id,
        }

        # Get current user for UserOwnWord lookup
        ctx, user_controller = get_user_controller()
        user = check_auth(user_controller)
        user_id = user["id"] if user else None

        query_builder = WordQuery(user_id=user_id)
        query_builder.apply_filters(filters)

        if any(filters.values()):
            logger.info(f"[WORDS] Searching with filters: {filters} User: {user_id}")

        words = query_builder.execute(limit=limit)
        return [word.to_dict() for word in words]
