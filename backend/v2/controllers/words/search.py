from sqlalchemy import or_

from ...models import UserOwnWord, Word


class WordQuery:
    def __init__(self, user_id: int = None):
        self.query_global = Word.query
        self.query_user = UserOwnWord.query.filter_by(user_id=user_id) if user_id else None
        self.user_id = user_id

        # We need to track filters to apply to both queries
        self.filters = {}

    def filter_by_text(self, q: str):
        if q:
            search_term = f"%{q}%"
            # Global
            self.query_global = self.query_global.filter(
                or_(
                    Word.surface.ilike(search_term),
                    Word.reading["kana"].astext.ilike(search_term),
                    Word.reading["kanji"].astext.ilike(search_term),
                    Word.reading["english"].astext.ilike(search_term),
                )
            )
            # User
            if self.query_user:
                self.query_user = self.query_user.filter(
                    or_(
                        UserOwnWord.surface.ilike(search_term),
                        UserOwnWord.reading["kana"].astext.ilike(search_term),
                        UserOwnWord.reading["kanji"].astext.ilike(search_term),
                        UserOwnWord.reading["english"].astext.ilike(search_term),
                    )
                )
        return self

    def filter_by_jlpt(self, level: str):
        if level:
            l1 = level.lower()
            self.query_global = self.query_global.filter(Word.level["jlpt"].astext == l1)
            if self.query_user:
                self.query_user = self.query_user.filter(UserOwnWord.level["jlpt"].astext == l1)
        return self

    def filter_by_custom_level(self, level: int):
        if level is not None:
            l1 = str(level)
            self.query_global = self.query_global.filter(Word.level["custom"].astext == l1)
            if self.query_user:
                self.query_user = self.query_user.filter(UserOwnWord.level["custom"].astext == l1)
        return self

    def filter_by_pos(self, pos_list: list):
        if pos_list:
            normalized_pos = [p.lower() for p in pos_list]
            self.query_global = self.query_global.filter(Word.part_of_speech.overlap(normalized_pos))
            if self.query_user:
                self.query_user = self.query_user.filter(UserOwnWord.part_of_speech.overlap(normalized_pos))
        return self

    def filter_by_tags(self, tags_list: list):
        if tags_list:
            self.query_global = self.query_global.filter(Word.category.overlap(tags_list))
            if self.query_user:
                self.query_user = self.query_user.filter(UserOwnWord.category.overlap(tags_list))
        return self

    def filter_by_id_range(self, start_id: int = None, end_id: int = None):
        # ID filtering is tricky with separate tables.
        # Assuming ID range checks are mostly for pagination or specific global ID checks.
        # We apply to global only for now, as user IDs will be different sequence.
        # If the frontend requests a specific range, it's usually scrolling through global list.
        if start_id is not None:
            self.query_global = self.query_global.filter(Word.id >= start_id)
        if end_id is not None:
            self.query_global = self.query_global.filter(Word.id <= end_id)
        return self

    def apply_filters(self, filters: dict):
        if filters.get("q"):
            self.filter_by_text(filters["q"])
        if filters.get("jlpt"):
            self.filter_by_jlpt(filters["jlpt"])
        if filters.get("custom_level") is not None:
            self.filter_by_custom_level(filters["custom_level"])
        if filters.get("part_of_speech"):
            self.filter_by_pos(filters["part_of_speech"])
        if filters.get("tags"):
            self.filter_by_tags(filters["tags"])
        if filters.get("start_id") is not None or filters.get("end_id") is not None:
            self.filter_by_id_range(filters.get("start_id"), filters.get("end_id"))
        return self

    def execute(self, limit: int = 100):
        # Fetch both results
        global_words = self.query_global.order_by(Word.id.asc()).limit(limit).all()
        user_words = []
        if self.query_user:
            user_words = self.query_user.order_by(UserOwnWord.id.asc()).limit(limit).all()

        # Merge Logic:
        # Create a map of original_word_id -> UserOwnWord
        overrides = {w.original_word_id: w for w in user_words if w.original_word_id}

        # New words (no original_word_id)
        new_words = [w for w in user_words if not w.original_word_id]

        final_list = []

        # Iterate global words, check for overrides
        for gw in global_words:
            if gw.id in overrides:
                final_list.append(overrides[gw.id])
            else:
                final_list.append(gw)

        # Determine how to mix new words.
        # For now, append them at the top or merge.
        # A simple approach is extend. Sorting might be messy without a unified sort key.
        # Let's just prepend new user words for visibility
        result = new_words + final_list

        # Re-apply limit
        return result[:limit]
