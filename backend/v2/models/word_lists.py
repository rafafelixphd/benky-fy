from datetime import datetime

from ..config.database import db


class WordList(db.Model):
    __tablename__ = "word_lists"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    user = db.relationship("User", backref=db.backref("word_lists", cascade="all, delete-orphan"))
    entries = db.relationship("WordListEntry", backref="word_list", cascade="all, delete-orphan")

    __table_args__ = (db.UniqueConstraint("user_id", "name", name="uq_word_lists_user_name"),)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "entry_count": len(self.entries),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<WordList id={self.id} name='{self.name}'>"


class WordListEntry(db.Model):
    __tablename__ = "word_list_entries"

    word_list_id = db.Column(db.Integer, db.ForeignKey("word_lists.id"), primary_key=True)
    word_id = db.Column(db.Integer, db.ForeignKey("words.id"), primary_key=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to Word (WordList is handled by backref above)
    word = db.relationship("Word")

    def to_dict(self):
        return {
            "word_list_id": self.word_list_id,
            "word_id": self.word_id,
            "word": self.word.to_dict() if self.word else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<WordListEntry list={self.word_list_id} word={self.word_id}>"
