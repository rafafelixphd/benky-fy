from flask_restx import Namespace, Resource

from ..controllers.words.progress import ProgressController
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
        # TODO: Get actual user ID from auth/session
        user_id = 1

        try:
            stats = progress_controller.get_dashboard_stats(user_id)
            return {"success": True, "data": stats}, 200
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {e}")
            return {"success": False, "error": str(e)}, 500
