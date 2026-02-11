from typing import List, Optional

from sqlalchemy import exc

from ..config.database import db
from ..models.word_lists import WordList, WordListEntry
from ..models.words import Word


class WordListController:
    @staticmethod
    def create_list(user_id: int, name: str, description: Optional[str] = None) -> WordList:
        """Create a new word list for a user."""
        try:
            # Check for existing list with same name
            existing = WordList.query.filter_by(user_id=user_id, name=name).first()
            if existing:
                raise ValueError(f"List with name '{name}' already exists.")

            new_list = WordList(user_id=user_id, name=name, description=description)
            db.session.add(new_list)
            db.session.commit()
            return new_list
        except exc.SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_user_lists(user_id: int) -> List[WordList]:
        """Get all word lists for a user."""
        return WordList.query.filter_by(user_id=user_id).order_by(WordList.created_at.desc()).all()

    @staticmethod
    def get_list_by_id(user_id: int, list_id: int) -> Optional[WordList]:
        """Get a specific word list by ID, ensuring it belongs to the user."""
        return WordList.query.filter_by(id=list_id, user_id=user_id).first()

    @staticmethod
    def update_list(
        user_id: int, list_id: int, name: Optional[str] = None, description: Optional[str] = None
    ) -> Optional[WordList]:
        """Update a word list's metadata."""
        word_list = WordListController.get_list_by_id(user_id, list_id)
        if not word_list:
            return None

        try:
            if name:
                # Check uniqueness if name changes
                if name != word_list.name:
                    existing = WordList.query.filter_by(user_id=user_id, name=name).first()
                    if existing:
                        raise ValueError(f"List with name '{name}' already exists.")
                word_list.name = name

            if description is not None:
                word_list.description = description

            db.session.commit()
            return word_list
        except exc.SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_list(user_id: int, list_id: int) -> bool:
        """Delete a word list."""
        word_list = WordListController.get_list_by_id(user_id, list_id)
        if not word_list:
            return False

        try:
            db.session.delete(word_list)
            db.session.commit()
            return True
        except exc.SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def add_word_to_list(user_id: int, list_id: int, word_id: int) -> Optional[WordListEntry]:
        """Add a word to a list."""
        word_list = WordListController.get_list_by_id(user_id, list_id)
        if not word_list:
            return None  # List not found or not owned by user

        # Verify word exists
        word = Word.query.get(word_id)
        if not word:
            raise ValueError(f"Word with ID {word_id} not found.")

        # Check existing entry
        existing = WordListEntry.query.filter_by(word_list_id=list_id, word_id=word_id).first()
        if existing:
            return existing  # Already added

        try:
            entry = WordListEntry(word_list_id=list_id, word_id=word_id)
            db.session.add(entry)
            db.session.commit()
            return entry
        except exc.SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def remove_word_from_list(user_id: int, list_id: int, word_id: int) -> bool:
        """Remove a word from a list."""
        word_list = WordListController.get_list_by_id(user_id, list_id)
        if not word_list:
            return False

        entry = WordListEntry.query.filter_by(word_list_id=list_id, word_id=word_id).first()
        if not entry:
            return False  # Not in list

        try:
            db.session.delete(entry)
            db.session.commit()
            return True
        except exc.SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_list_words(user_id: int, list_id: int) -> List[Word]:
        """Get all words in a list."""
        word_list = WordListController.get_list_by_id(user_id, list_id)
        if not word_list:
            return []

        # Query entries joined with words
        entries = WordListEntry.query.filter_by(word_list_id=list_id).join(Word).all()
        return [entry.word for entry in entries]
