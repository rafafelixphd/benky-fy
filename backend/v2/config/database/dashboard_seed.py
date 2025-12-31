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


def seed_user_8_anki_test(app, db):
    """
    Seeds user 8 with 10 specific words for Anki verification.
    7 seen words (varied accuracy/recency), 3 unseen words will be picked by logic.
    """
    from datetime import datetime, timedelta

    logger.info("Seeding User 8 for Anki verification...")

    with app.app_context():
        # 1. Cleanup User 8
        UserWordMap.query.filter_by(user_id=8).delete()

        # 2. Get 10 words (IDs 1-10 ideally, or first 10 available)
        words = Word.query.order_by(Word.id).limit(10).all()
        if len(words) < 10:
            logger.warning("Not enough words database to seed full test set.")

        # We need to Create 7 "Seen" words.
        # Let's create a mix to test the heuristic.
        # Heuristic: Score = 0.5 * (1 - Accuracy) + 0.5 * (1 - e^(-0.1 * Days))
        # High Score (Priority) = Low Accuracy OR Long Time

        test_cases = [
            # (Index in 'words', correct, attempts, days_since)
            (0, 0, 5, 10.0),  # Word 1: 0% Acc, 10 days -> High Priority
            (1, 1, 5, 10.0),  # Word 2: 20% Acc, 10 days
            (2, 5, 5, 10.0),  # Word 3: 100% Acc, 10 days -> Medium Priority (due to time)
            (3, 0, 5, 1.0),  # Word 4: 0% Acc, 1 day -> High Priority (due to acc)
            (4, 1, 5, 1.0),  # Word 5: 20% Acc, 1 day
            (5, 5, 5, 1.0),  # Word 6: 100% Acc, 1 day -> Low Priority
            (6, 2, 4, 5.0),  # Word 7: 50% Acc, 5 days
        ]

        new_maps = []
        for idx, correct, attempts, days in test_cases:
            if idx >= len(words):
                continue

            w = words[idx]
            stats = {
                "total": attempts,
                "requested_input": {"kana": attempts},
                "requested_stats": {"kana": correct},
                "display": {"kanji": 1},
            }

            updated_at = datetime.utcnow() - timedelta(days=days)

            new_maps.append(
                UserWordMap(user_id=8, word_id=w.id, stats=stats, created_at=updated_at, updated_at=updated_at)
            )

        if new_maps:
            db.session.add_all(new_maps)

        db.session.commit()
        logger.info(f"Seeded {len(new_maps)} records for User 8. (Words {', '.join(str(w.word_id) for w in new_maps)})")
