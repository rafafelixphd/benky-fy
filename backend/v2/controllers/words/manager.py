from ...config.database import db
from ...models.user_own_words import UserOwnWord
from ...models.word_examples import WordExample
from ...models.words import Word


class WordManager:
    def __init__(self, user_id=None):
        self.user_id = user_id

    def get_word(self, word_id: int):
        """Fetch a word by ID, prioritizing UserOwnWord shadow copies."""
        if self.user_id:
            # Check UserOwnWord by ID
            user_word = UserOwnWord.query.filter_by(id=word_id, user_id=self.user_id).first()
            if user_word:
                return user_word

            # Check if it's a Global Word shadowed by user
            shadow_word = UserOwnWord.query.filter_by(original_word_id=word_id, user_id=self.user_id).first()
            if shadow_word:
                return shadow_word

        # Fallback to Global Word
        # Using get_or_404 might be tricky if not in a route context where we want 404 immediately,
        # but for manager, returning None is often better, let caller handle 404.
        # However, to keep consistent with `get_or_404` usage in views:
        word = Word.query.get(word_id)
        return word

    def _update_examples(self, word_obj, examples_data):
        """Reference helper execution logic for examples."""
        # Clean existing examples if UserOwnWord
        if isinstance(word_obj, UserOwnWord):
            for ex in word_obj.examples:
                db.session.delete(ex)

        for ex in examples_data:
            new_ex = WordExample(
                user_own_word_id=word_obj.id if isinstance(word_obj, UserOwnWord) else None,
                word_id=word_obj.id if isinstance(word_obj, Word) else None,
                japanese=ex.get("japanese", ""),
                english=ex.get("english", ""),
                kana=ex.get("kana", ""),
                reading=ex.get("reading", []),
                type=ex.get("type", ""),
                source=ex.get("source", "user"),
            )
            db.session.add(new_ex)

    def update_word(self, word_id: int, data: dict):
        """Update a word (creates shadow copy if global)."""
        if not self.user_id:
            raise PermissionError("User must be authenticated")

        existing_user_word = UserOwnWord.query.filter_by(id=word_id, user_id=self.user_id).first()

        if existing_user_word:
            target_word = existing_user_word
            # Update fields
            for field in ["surface", "reading", "level", "part_of_speech", "category"]:
                if field in data:
                    setattr(target_word, field, data[field])

            if "examples" in data:
                self._update_examples(target_word, data["examples"])

            db.session.commit()
            return target_word
        else:
            # Shadow copy logic
            global_word = Word.query.get(word_id)
            if not global_word:
                return None  # Or raise not found

            new_user_word = UserOwnWord(
                user_id=self.user_id,
                original_word_id=global_word.id,
                surface=data.get("surface", global_word.surface),
                reading=data.get("reading", global_word.reading),
                level=data.get("level", global_word.level),
                part_of_speech=data.get("part_of_speech", global_word.part_of_speech),
                category=data.get("category", global_word.category),
            )
            db.session.add(new_user_word)
            db.session.flush()

            if "examples" in data:
                self._update_examples(new_user_word, data["examples"])

            db.session.commit()
            return new_user_word

    def create_word(self, data: dict):
        """Create a new custom word."""
        if not self.user_id:
            raise PermissionError("User must be authenticated")

        new_word = UserOwnWord(
            user_id=self.user_id,
            surface=data.get("surface", ""),
            reading=data.get("reading", {}),
            level=data.get("level", {}),
            part_of_speech=data.get("part_of_speech", []),
            category=data.get("category", []),
            original_word_id=None,
        )
        db.session.add(new_word)
        db.session.flush()

        if "examples" in data:
            self._update_examples(new_word, data["examples"])

        db.session.commit()
        return new_word
