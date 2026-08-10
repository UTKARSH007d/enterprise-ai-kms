from pydantic import BaseModel

from datetime import datetime

from typing import Optional

class DocumentCreate(BaseModel):

    title: str

    category: str

    department_id: Optional[int] = None


class DocumentResponse(BaseModel):

    id: int

    title: str

    category: str

    original_filename: str

    file_type: str

    status: str

    created_at: datetime

    class Config:

        from_attributes = True

class DocumentUpdate(BaseModel):

    title: str

    category: str

    department_id: Optional[int] = None