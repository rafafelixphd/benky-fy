from datetime import datetime

from ...config.database import db
from ...logger import get_logger
from ...models.user_word_map import UserWordMap

logger = get_logger(namespace="progress")


class ProgressController:
    def register_feedback(self, user_id, word_id, session_id, feedback_data):
        """
        Updates the UserWordMap for a specific word with the provided feedback.
        feedback_data structure expected:
        {
            "result": "correct" | "incorrect" | "gave_up",
            "display_mode": "kanji" | "kana" | "english" ...,
            "input_modes": ["kana", "romaji", ...]
        }
        """
        logger.info(f"{user_id=}")
        logger.info(f"{word_id=}")
        logger.info(f"{session_id=}")
        logger.info(f"{feedback_data=}")
        try:
            # Find or create map
            word_map = UserWordMap.query.filter_by(user_id=user_id, word_id=word_id).first()

            if not word_map:
                word_map = UserWordMap(
                    user_id=user_id,
                    word_id=word_id,
                    stats={"total": 0, "display": {}, "requested_input": {}, "requested_stats": {}},
                )
                db.session.add(word_map)

            # Ensure stats structure exists
            stats = word_map.stats or {}
            stats.setdefault("total", 0)
            stats.setdefault("display", {})
            stats.setdefault("requested_input", {})
            stats.setdefault("requested_stats", {})

            # Update total
            stats["total"] += 1

            # Map keys: english -> en
            def map_key(k):
                return "en" if k == "english" else k

            # Update display mode counts
            disp_mode = feedback_data.get("display_mode")
            if disp_mode:
                key = map_key(disp_mode)
                stats["display"][key] = stats["display"].get(key, 0) + 1

            # Update input mode counts and correctness stats
            # Expected format: results={'english': 'correct', 'kana': 'incorrect'}
            results_map = feedback_data.get("results", {})

            for mode, result_status in results_map.items():
                key = map_key(mode)
                # Track usage
                stats["requested_input"][key] = stats["requested_input"].get(key, 0) + 1

                # Track correctness per mode (if correct)
                if result_status == "correct":
                    stats["requested_stats"][key] = stats["requested_stats"].get(key, 0) + 1

            # Note: 'results' and 'last_result' are NOT in the spec, so we do not store them.
            # We rely on 'latest_session_id' to identify participation in the current session.

            # Force update of JSONB field
            word_map.stats = dict(stats)
            word_map.latest_session_id = session_id
            word_map.updated_at = datetime.utcnow()

            logger.info(f"Updated word_map: {word_map}")
            db.session.commit()
            return word_map

        except Exception as e:
            logger.error(f"Failed to register feedback: {e}")
            db.session.rollback()
            raise e

    def get_latest_session_id(self, user_id):
        """
        Retrieves the latest session ID for the user based on updated_at.
        """
        latest_interaction = (
            UserWordMap.query.filter_by(user_id=user_id).order_by(UserWordMap.updated_at.desc()).first()
        )
        return latest_interaction.latest_session_id if latest_interaction else None

    def get_session_stats(self, user_id, session_id=None):
        """
        Retrieves aggregated stats for the session.
        If session_id is None, defaults to the latest session for the user.
        """
        if not session_id:
            session_id = self.get_latest_session_id(user_id)

        if not session_id:
            return {"total_cards": 0, "correct": 0, "incorrect": 0, "half": 0, "gave_up": 0}

        words_reviewed = UserWordMap.query.filter_by(user_id=user_id, latest_session_id=session_id).all()

        total_cards = len(words_reviewed)

        # Heuristic classification
        correct = 0
        incorrect = 0
        half = 0
        gave_up = 0

        for w in words_reviewed:
            stats = w.stats or {}

            # Extract aggregate counts
            # Note: These are cumulative stats!
            # Ideally we would want session-specifics, but we only have cumulative per strict schema.
            # We classify the *current status* of the word.
            req_input = stats.get("requested_input", {})
            req_stats = stats.get("requested_stats", {})  # Correct answers

            total_attempts = sum(req_input.values())
            total_correct = sum(req_stats.values())

            if total_attempts == 0:
                # Should not happen if reviewed, but treat as gave_up/unknown
                gave_up += 1
                continue

            accuracy = total_correct / total_attempts

            if accuracy == 1.0:
                correct += 1
            elif accuracy >= 0.5:
                half += 1
            elif accuracy > 0:
                incorrect += 1
            else:
                # accuracy == 0
                gave_up += 1

        return {
            "total_cards": total_cards,
            "correct": correct,
            "incorrect": incorrect,
            "half": half,
            "gave_up": gave_up,
        }
