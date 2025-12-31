import json
from pathlib import Path

from ...logger import get_logger
from ...models import Word

logger = get_logger()

BASE_DIR = Path(__file__).parent.parent.parent.parent
DATA_DIR = BASE_DIR / "seed/data"
JSON_FILE = DATA_DIR / "words.json"


def seed_words(app, db):
    """
    Seeds the words table from proper JSON data.
    """
    if not JSON_FILE.exists():
        logger.warning(f"Words seed file not found: {JSON_FILE}")
        return

    logger.info(f"Seeding words from {JSON_FILE}...")

    with app.app_context():
        with open(JSON_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        new_count = 0
        updated_count = 0

        for item in data:
            word_id = item.get("id")
            existing = None
            if word_id:
                existing = Word.query.get(word_id)

            if existing:
                # Update existing record
                existing.reading = item.get("reading", {})
                existing.level = item.get("level", {})
                existing.part_of_speech = item.get("part_of_speech", [])
                existing.category = item.get("category", [])
                updated_count += 1
            else:
                # Create Word object
                word = Word(
                    id=item.get("id"),
                    surface=item.get("surface"),
                    reading=item.get("reading", {}),
                    level=item.get("level", {}),
                    part_of_speech=item.get("part_of_speech", []),
                    category=item.get("category", []),
                )
                db.session.add(word)
                new_count += 1

        db.session.commit()
        logger.info(f"Seeded words: {new_count} new, {updated_count} updated.")

        # Reset Postgres sequence
        try:
            db.session.execute(
                db.text(
                    "SELECT setval(pg_get_serial_sequence('words', 'id'), coalesce(max(id),0) + 1, false) FROM words;"
                )
            )
            db.session.commit()
        except Exception as e:
            logger.warning(f"Could not reset sequence for words: {e}")
