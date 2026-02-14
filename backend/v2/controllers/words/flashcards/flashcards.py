import random

from sqlalchemy.sql.expression import func

from ....logger import get_logger
from ....models import Word

logger = get_logger(namespace="flashcards")


class FlashCardsDeck:
    def __init__(self, settings):
        self.settings = settings
        self.max_cards = self.settings.get("maxCards", 50)

    def _build_base_query(self):
        query = Word.query
        level = self.settings.get("level", {})

        # Filter by JLPT
        if level and level.get("jlpt"):
            logger.debug(f"Filtering by JLPT: {level['jlpt']}")
            query = query.filter(Word.level["jlpt"].astext == level["jlpt"].lower())

        # Filter by Custom Level
        if level and level.get("custom"):
            logger.debug(f"Filtering by Custom Level: {level['custom']}")
            query = query.filter(Word.level["custom"].astext == str(level["custom"]))

        # Filter by Category (Tags)
        # Frontend sends 'tag', backend previously looked for 'categories'.
        # User confirmed 'tag' usage in previous turns implies mapping.
        # Logic: if 'tag' in settings, use it to filter Word.category
        tags = self.settings.get("tag") or self.settings.get("categories")
        if tags:
            logger.debug(f"Filtering by Tags: {tags}")
            query = query.filter(Word.category.overlap(tags))

        # Filter by Part of Speech
        pos = self.settings.get("partOfSpeech")
        if pos:
            logger.info(f"Filtering by Part of Speech: {pos}")
            query = query.filter(Word.part_of_speech.overlap(pos))

        return query

    def draw_next(self, session_store):
        """
        Draws the next word ID from the user's session queue.
        If queue is None (initialized), refills it.
        If queue is empty list, returns None (session exhausted).
        """
        queue = session_store.get("word_queue")

        if queue is None:
            logger.info("Queue uninitialized, fetching new batch...")
            query = self._build_base_query()

            words = query.with_entities(Word.id).order_by(func.random()).limit(self.max_cards).all()

            queue = [w.id for w in words] if words else []

            session_store["word_queue"] = queue
            logger.info(f"Initialized queue with {len(queue)} words")

        if not queue:
            return None

        next_id = queue.pop(0)
        session_store["word_queue"] = queue  # Save state

        word = Word.query.get(next_id)
        return word

    def draw_random(self):
        """
        Efficiently fetches a single random word matching filters.
        Used for the /random endpoint.
        """
        query = self._build_base_query()

        count = query.count()
        if count == 0:
            return None

        random_offset = random.randint(0, count - 1)
        word = query.offset(random_offset).first()
        return word
