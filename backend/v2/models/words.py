# models/words.py
from datetime import datetime

from sqlalchemy.dialects.postgresql import ARRAY, JSONB

from ..config.database import db


class Word(db.Model):
    __tablename__ = "words"

    id = db.Column(db.Integer, primary_key=True)

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

    def to_dict(self):
        return {
            "id": self.id,
            "reading": self.reading,
            "level": self.level,
            "part_of_speech": self.part_of_speech,
            "category": self.category,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Word id={self.id} {self.reading['kanji']}>"
