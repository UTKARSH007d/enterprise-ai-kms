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
class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)

    key = Column(String(100), unique=True, nullable=False)

    value = Column(String(500), nullable=False)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )