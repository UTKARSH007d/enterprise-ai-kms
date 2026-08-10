from fastapi import APIRouter, Depends, HTTPException

from app.schemas.chat import ChatRequest
from app.services.chat_service import generate_ai_response

from app.utils.embedding_generator import generate_embedding
from app.database.vector_db import search_similar_chunks

from sqlalchemy.orm import Session
from app.database.database import get_db
from app.auth.dependencies import get_current_user

from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


# ==========================================================
# CLEAN SOURCES
# ==========================================================

def clean_sources(metadata_list):

    sources = []
    seen = set()

    for metadata in metadata_list:

        document_id = metadata.get("document_id")

        if document_id not in seen:

            seen.add(document_id)

            sources.append({
                "document_id": document_id,
                "title": metadata.get("title"),
                "department_id": metadata.get("department_id")
            })

    return sources


# ==========================================================
# CHAT
# ==========================================================

@router.post("/")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # ======================================================
    # CREATE OR LOAD CHAT SESSION
    # ======================================================

    if request.session_id is None:

        session = ChatSession(
            user_id=current_user.id,
            title=request.question[:100]
        )

        db.add(session)
        db.commit()
        db.refresh(session)

    else:

        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == request.session_id,
                ChatSession.user_id == current_user.id
            )
            .first()
        )

        if session is None:
            raise HTTPException(
                status_code=404,
                detail="Chat session not found"
            )


    # ======================================================
    # GET PREVIOUS CONVERSATION
    # ======================================================

    previous_messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.chat_session_id == session.id
        )
        .order_by(ChatMessage.created_at)
        .all()
    )


    conversation_history = "\n".join(
        f"{message.sender}: {message.message}"
        for message in previous_messages
    )


    # ======================================================
    # SAVE USER MESSAGE
    # ======================================================

    user_message = ChatMessage(
        chat_session_id=session.id,
        sender="user",
        message=request.question
    )

    db.add(user_message)
    db.commit()


    # ======================================================
    # GENERATE QUESTION EMBEDDING
    # ======================================================

    question_embedding = generate_embedding(
        request.question
    )


    # ======================================================
    # DOCUMENT ACCESS CONTROL
    # ======================================================
    #
    # Employee:
    #   - Own department documents
    #   - Company-wide documents
    #
    # Admin:
    #   - All documents
    #
    # Super Admin:
    #   - All documents
    #
    # ======================================================

    user_role = current_user.role.lower()


    if user_role in ["admin", "super_admin"]:

        # Admin and Super Admin can search
        # the entire organization knowledge base.

        department_id = None

    else:

        # Employees are restricted to their
        # own department + company-wide documents.

        department_id = current_user.department_id


    # ======================================================
    # SEARCH VECTOR DATABASE
    # ======================================================

    results = search_similar_chunks(
        question_embedding,
        top_k=5,
        department_id=department_id
    )


    # ======================================================
    # GET RETRIEVED CHUNKS
    # ======================================================

    retrieved_chunks = results["documents"][0]


    # ======================================================
    # GENERATE AI RESPONSE
    # ======================================================

    answer = generate_ai_response(
        request.question,
        retrieved_chunks,
        conversation_history
    )


    # ======================================================
    # SAVE AI RESPONSE
    # ======================================================

    ai_message = ChatMessage(
        chat_session_id=session.id,
        sender="assistant",
        message=answer
    )

    db.add(ai_message)
    db.commit()


    # ======================================================
    # CLEAN SOURCE INFORMATION
    # ======================================================

    sources = clean_sources(
        results["metadatas"][0]
    )


    # ======================================================
    # RETURN RESPONSE
    # ======================================================

    return {
        "session_id": session.id,
        "answer": answer,
        "sources": sources
    }