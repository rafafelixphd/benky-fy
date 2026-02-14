import math
import random
from datetime import datetime

from sqlalchemy.sql.expression import func

from ....config.database import db
from ....logger import get_logger
from ....models import Word
from ....models.user_word_map import UserWordMap
from .flashcards import FlashCardsDeck

logger = get_logger(namespace="anki_deck")


class AnkiDeck(FlashCardsDeck):
    LEARNING_RATIO = 0.2
    # Heuristic parameters
    ALPHA = 0.5
    BETA = 0.5
    LAMBDA = 0.1

    def __init__(self, settings, user_id):
        super().__init__(settings)
        self.user_id = user_id

    def _calculate_score(self, word_map):
        """
        Calculates the priority score for a review word.
        Score = alpha * (1 - Accuracy) + beta * (1 - e^(-lambda * DaysSinceLastReview))
        """
        stats = word_map.stats or {}
        req_stats = stats.get("requested_stats", {})
        req_input = stats.get("requested_input", {})

        total_correct = sum(req_stats.values())
        total_attempts = sum(req_input.values())

        accuracy = 0.0
        if total_attempts > 0:
            accuracy = total_correct / total_attempts

        # Time component
        days_since = 0
        if word_map.updated_at:
            delta = datetime.utcnow() - word_map.updated_at
            days_since = delta.days + (delta.seconds / 86400.0)

        # Formula
        # Score = 0.5 * (1 - accuracy) + 0.5 * (1 - exp(-0.1 * days))
        time_component = 1.0 - math.exp(-self.LAMBDA * days_since)
        score = (self.ALPHA * (1.0 - accuracy)) + (self.BETA * time_component)

        return score

    def _get_seen_words(self, limit):
        """
        Fetches 'seen' words from UserWordMap (for this user),
        sorted by the custom heuristic score.
        """
        logger.info(f"[seen words]{self.user_id}")
        user_maps = UserWordMap.query.filter_by(user_id=self.user_id).all()

        if not user_maps:
            logger.error("No words found")
            return []

        # Calculate scores in memory
        scored_maps = []
        for wm in user_maps:
            score = self._calculate_score(wm)
            scored_maps.append((score, wm.word_id))

        # Sort descending by score
        scored_maps.sort(key=lambda x: x[0], reverse=True)

        # Let's rebuild the query to include filters
        query = (
            db.session.query(UserWordMap)
            .join(Word, UserWordMap.word_id == Word.id)
            .filter(UserWordMap.user_id == self.user_id)
        )

        # Apply standard filters from base class (need to adapt _build_base_query logic)
        # Accessing settings transparently
        level = self.settings.get("level", {})
        if level and level.get("jlpt"):
            logger.debug("[seen words] Filtering by JLPT")
            query = query.filter(Word.level["jlpt"].astext == level["jlpt"].lower())

        if level and level.get("custom"):
            logger.debug("[seen words] Filtering by Custom Level")
            query = query.filter(Word.level["custom"].astext == str(level["custom"]))

        pos = self.settings.get("partOfSpeech", [])
        if pos:
            logger.debug("[seen words] Filtering by Part of Speech")
            query = query.filter(Word.part_of_speech.overlap(pos))

        tags = self.settings.get("tag") or self.settings.get("categories")
        if tags:
            logger.debug("[seen words] Filtering by Tags")
            query = query.filter(Word.category.overlap(tags))

        words_in_scope = query.all()
        # Now score these
        scored_scope = []
        for wm in words_in_scope:
            score = self._calculate_score(wm)
            scored_scope.append((score, wm.word_id))

        scored_scope.sort(key=lambda x: x[0], reverse=True)
        return [x[1] for x in scored_scope[:limit]]

    def _get_new_words(self, limit):
        """
        Fetches 'new' words (not in UserWordMap for this user),
        applying standard filters.
        """
        # Start with base query from parent
        query = self._build_base_query()

        # Exclude words already seen by this user
        seen_subquery = db.session.query(UserWordMap.word_id).filter(UserWordMap.user_id == self.user_id)
        query = query.filter(Word.id.notin_(seen_subquery))

        # Randomize
        words = query.order_by(func.random()).limit(limit).all()

        logger.debug(f"[new words] {words}")

        return [w.id for w in words]

    def draw_next(self, session_store):
        queue = session_store.get("word_queue")

        if queue is None:
            logger.debug("Anki Queue uninitialized, building new batch...")

            # 1. Determine counts
            total_cards = self.max_cards
            n_new = int(total_cards * self.LEARNING_RATIO)
            n_seen = total_cards - n_new

            # 2. Fetch Seen
            seen_ids = self._get_seen_words(n_seen)

            logger.debug(f"{seen_ids=}")
            found_seen_count = len(seen_ids)

            # 3. Adjust New count if we didn't find enough Seen
            if found_seen_count < n_seen:
                n_new += n_seen - found_seen_count

            # 4. Fetch New
            new_ids = self._get_new_words(n_new)
            logger.debug(f"{new_ids=}")
            # 5. Combine and Shuffle
            queue = seen_ids + new_ids
            random.shuffle(queue)

            session_store["word_queue"] = queue
            logger.info(
                f"Initialized Anki queue with {len(queue)} words " f"(Seen: {len(seen_ids)}, New: {len(new_ids)})"
            )

        if not queue:
            return None

        logger.info(f"{queue=}")

        next_id = queue.pop(0)
        session_store["word_queue"] = queue
        return Word.query.get(next_id)
