from datetime import datetime

from sqlalchemy.dialects.postgresql import ARRAY, JSONB

from ..config.database import db


class UserOwnWord(db.Model):
    __tablename__ = "user_own_words"

    id = db.Column(db.Integer, db.Sequence("user_own_words_id_seq", start=100000), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # Optional link to the original global word if this is an override/shadow
    original_word_id = db.Column(db.Integer, db.ForeignKey("words.id"), nullable=True, index=True)

    surface = db.Column(db.Text, nullable=False, default="")

    # JSONB columns for nested data
    reading = db.Column(JSONB, nullable=False, default={})
    level = db.Column(JSONB, nullable=False, default={})

    # Postgres Arrays
    part_of_speech = db.Column(ARRAY(db.Text), default=[])
    category = db.Column(ARRAY(db.Text), default=[])

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        # Ensure efficient lookup for a user's specific override of a word
        db.Index("ix_user_own_words_user_original", "user_id", "original_word_id"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "original_word_id": self.original_word_id,
            "surface": self.surface,
            "reading": self.reading,
            "level": self.level,
            "part_of_speech": self.part_of_speech,
            "category": self.category,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_user_word": True,
        }

    def __repr__(self):
        return f"<UserOwnWord id={self.id} user={self.user_id} surface='{self.surface}'>"
