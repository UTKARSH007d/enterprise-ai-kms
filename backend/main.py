from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.database.database import engine, Base
from app.api.document import router as document_router
from app.api.chat import router as chat_router
from app.api.admin import router as admin_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.audit import router as audit_router
from app.api.settings import router as settings_router
from app.api.analysis import router as analysis_router

# Import all models
from app.models.department import Department
from app.models.user import User
from app.models.document import Document
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.models.audit_log import AuditLog
from app.models.settings import Settings


# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(document_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(audit_router)
app.include_router(settings_router)
app.include_router(analysis_router)
@app.get("/")
def root():
    return {
        "message": "Enterprise AI Knowledge Management System"
    }
