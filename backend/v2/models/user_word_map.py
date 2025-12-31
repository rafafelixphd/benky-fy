from datetime import datetime

from sqlalchemy.dialects.postgresql import JSONB

from ..config.database import db


class UserWordMap(db.Model):
    __tablename__ = "user_word_map"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    word_id = db.Column(db.Integer, db.ForeignKey("words.id"), nullable=False, index=True)

    # Store stats for this word for this user
    # Structure:
    # {
    #   "total": int,
    #   "display": {"en": int, "kana": int, "kanji": int},
    #   "requested_input": {"en": int, "kana": int, "kanji": int},
    #   "last_result": "correct" | "incorrect" | "gave_up"
    # }
    stats = db.Column(JSONB, nullable=False, default={})

    # Track the last session this word was part of
    latest_session_id = db.Column(db.String(255), nullable=True, index=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (db.UniqueConstraint("user_id", "word_id", name="uq_user_word_map_user_word"),)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "word_id": self.word_id,
            "stats": self.stats,
            "latest_session_id": self.latest_session_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<UserWordMap user={self.user_id} word={self.word_id}>"
