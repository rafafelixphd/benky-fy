from datetime import datetime

from sqlalchemy.dialects.postgresql import JSONB

from ..config.database import db


class WordExample(db.Model):
    __tablename__ = "word_examples"

    id = db.Column(db.Integer, primary_key=True)

    # Links to either global word or user word
    word_id = db.Column(db.Integer, db.ForeignKey("words.id"), nullable=True, index=True)
    user_own_word_id = db.Column(db.Integer, db.ForeignKey("user_own_words.id"), nullable=True, index=True)

    # Specific schema requested by user
    japanese = db.Column(db.Text, nullable=False, default="")  # Full sentence
    english = db.Column(db.Text, nullable=False, default="")  # Translation
    kana = db.Column(db.Text, nullable=False, default="")  # Full kana reading
    reading = db.Column(JSONB, nullable=False, default=[])  # Structured segments (tokens)

    type = db.Column(db.String(50), nullable=True)  # e.g. "N5", "N4"
    source = db.Column(db.String(50), default="generated")  # e.g. "generated", "user"

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "word_id": self.word_id,
            "user_own_word_id": self.user_own_word_id,
            "japanese": self.japanese,
            "english": self.english,
            "kana": self.kana,
            "reading": self.reading,
            "type": self.type,
            "source": self.source,
        }
