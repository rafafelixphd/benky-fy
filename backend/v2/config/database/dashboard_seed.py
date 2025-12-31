import random

from ...logger import get_logger
from ...models import UserWordMap, Word

logger = get_logger()


def seed_user_progress(app, db):
    """
    Seeds the UserWordMap table with dummy data for User ID 1.
    """
    logger.info("Seeding user progress for dashboard...")

    with app.app_context():
        for user_id in range(1, 7):
            user_id = 1
            # Check if we already have stats to avoid overwriting valuable data if any
            # But user asked for dummy data so we might want to clear or append.
            # Let's assume we append/overwrite for a specific set of words to ensure data exists.

            all_words = Word.query.all()
            if not all_words:
                logger.warning("No words found to seed progress for!")
                return

            # Create varied stats
            # 1. Mastered words (Correct > 80%, Attempts > 5)
            # 2. Learning words (Varied accuracy, Attempts > 0)
            # 3. New/Unseen words (handled by not having an entry)

            # Pick ~20 words for "Mastered"
            mastered_candidates = random.sample(all_words, min(len(all_words), 20))
            remaining = [w for w in all_words if w not in mastered_candidates]

            # Pick ~20 for "Learning" / "Hard"
            learning_candidates = random.sample(remaining, min(len(remaining), 20))

            new_maps = []

            for w in mastered_candidates:
                attempts = random.randint(6, 15)
                correct = int(attempts * random.uniform(0.8, 1.0))

                stats = {
                    "total": random.randint(3, 10),  # Views
                    "requested_input": {"kana": attempts},
                    "requested_stats": {"kana": correct},
                    "display": {"kanji": random.randint(1, 5)},
                }

                # Check exist
                existing = UserWordMap.query.filter_by(user_id=user_id, word_id=w.id).first()
                if existing:
                    existing.stats = stats
                else:
                    new_maps.append(UserWordMap(user_id=user_id, word_id=w.id, stats=stats))

            for w in learning_candidates:
                attempts = random.randint(1, 10)
                # Mix of good and bad performance to create "Hardest" candidates
                accuracy = random.uniform(0.1, 0.7)
                correct = int(attempts * accuracy)

                stats = {
                    "total": random.randint(1, 15),  # Views (make some high for "Most Viewed")
                    "requested_input": {"kana": attempts},
                    "requested_stats": {"kana": correct},
                    "display": {"kanji": random.randint(1, 5)},
                }

                existing = UserWordMap.query.filter_by(user_id=user_id, word_id=w.id).first()
                if existing:
                    existing.stats = stats
                else:
                    new_maps.append(UserWordMap(user_id=user_id, word_id=w.id, stats=stats))

            if new_maps:
                db.session.add_all(new_maps)

            db.session.commit()
            logger.info(
                f"Seeded UserWordMap with {len(mastered_candidates)} "
                f"mastered and {len(learning_candidates)} learning words."
            )
