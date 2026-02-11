from sqlalchemy import or_

from ...models import Word


class WordQuery:
    def __init__(self):
        self.query = Word.query

    def filter_by_text(self, q: str):
        if q:
            # Case-insensitive search across multiple fields
            search_term = f"%{q}%"
            self.query = self.query.filter(
                or_(
                    Word.surface.ilike(search_term),
                    Word.reading["kana"].astext.ilike(search_term),
                    Word.reading["kanji"].astext.ilike(search_term),
                    Word.reading["english"].astext.ilike(search_term),
                )
            )
        return self

    def filter_by_jlpt(self, level: str):
        if level:
            self.query = self.query.filter(Word.level["jlpt"].astext == level.lower())
        return self

    def filter_by_custom_level(self, level: int):
        if level is not None:
            self.query = self.query.filter(Word.level["custom"].astext == str(level))
        return self

    def filter_by_pos(self, pos_list: list):
        if pos_list:
            # Ensure items are lowercased for comparison
            normalized_pos = [p.lower() for p in pos_list]
            self.query = self.query.filter(Word.part_of_speech.overlap(normalized_pos))
        return self

    def filter_by_tags(self, tags_list: list):
        if tags_list:
            self.query = self.query.filter(Word.category.overlap(tags_list))
        return self

    def filter_by_id_range(self, start_id: int = None, end_id: int = None):
        if start_id is not None:
            self.query = self.query.filter(Word.id >= start_id)
        if end_id is not None:
            self.query = self.query.filter(Word.id <= end_id)
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
        return self.query.order_by(Word.id.asc()).limit(limit).all()
