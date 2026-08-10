from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)

    title = Column(String(255), nullable=False)

    category = Column(String(50),nullable=False)

    file_path = Column(String(500), nullable=False)

    file_type = Column(String(10), nullable=False)

    document_text = Column(Text, nullable=True)

    original_filename = Column(String(255), nullable=False)

    stored_filename = Column(String(255), nullable=False)

    status = Column(
        String(20),
        default="Uploaded",
        nullable=False
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    uploader = relationship("User")

    department = relationship("Department")