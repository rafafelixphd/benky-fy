import traceback

from flask import session
from flask_restx import Namespace, Resource

from ..controllers.progress import ProgressController
from ..logger import get_logger

logger = get_logger(namespace="dashboard")
ns = Namespace("dashboard", description="Dashboard statistics")
progress_controller = ProgressController()


@ns.route("/stats")
class DashboardStats(Resource):
    @ns.doc("get_dashboard_stats")
    def get(self):
        """
        Get aggregated dashboard statistics for the user.
        """
        user_id = session.get("user_id")
        if not user_id:
            return {"success": False, "error": "Unauthorized"}, 401

        try:
            stats = progress_controller.get_dashboard_stats(user_id)
            return {"success": True, "data": stats}, 200
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {e}")
            traceback.print_exc()
            return {"success": False, "error": str(e)}, 500
