from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)

    chat_session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id"),
        nullable=False
    )

    sender = Column(String(20), nullable=False)

    message = Column(String(5000), nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    chat_session = relationship("ChatSession")