from ....logger import get_logger
from ....models import Word, WordListEntry
from .flashcards import FlashCardsDeck

logger = get_logger(namespace="favourite-deck")


class FavouriteDeck(FlashCardsDeck):
    def __init__(self, settings, user_id):
        super().__init__(settings)
        self.user_id = user_id
        self.list_id = settings.get("listId")
        if not self.list_id:
            logger.warning("FavouriteDeck initialized without listId")

    def _build_base_query(self):
        """
        Override to query only words from the specific word list.
        Ignores other filters like JLPT or tags.
        """
        if not self.list_id:
            # Fallback or empty query if no list specified
            return Word.query.filter(False)

        query = Word.query.join(WordListEntry).filter(
            WordListEntry.word_list_id == self.list_id,
            WordListEntry.word_list.has(user_id=self.user_id),
        )

        return query
