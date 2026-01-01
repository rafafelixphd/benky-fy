from sqlalchemy import or_

from ...models import Word


def search_words(q: str, limit: int = 100):
    """
    Search for words matching the query string across multiple fields.
    """
    query = Word.query

    if q:
        # Case-insensitive search across multiple fields
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Word.surface.ilike(search_term),
                Word.reading["kana"].astext.ilike(search_term),
                Word.reading["kanji"].astext.ilike(search_term),
                Word.reading["english"].astext.ilike(search_term),
            )
        )

    return query.order_by(Word.id.asc()).limit(limit).all()
