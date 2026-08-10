from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    session_id: int | None = None