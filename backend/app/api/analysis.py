from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.document import Document
from app.models.user import User
from app.auth.dependencies import get_current_user

from app.services.chat_service import generate_ai_response


router = APIRouter(
    prefix="/analysis",
    tags=["AI Document Analysis"]
)


@router.get("/{document_id}")
def analyze_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ---------------------------------------------------------
    # FIND DOCUMENT
    # ---------------------------------------------------------

    query = db.query(Document).filter(
        Document.id == document_id
    )


    # ---------------------------------------------------------
    # ROLE-BASED DOCUMENT ACCESS
    # ---------------------------------------------------------

    user_role = (
        current_user.role.lower()
        if current_user.role
        else ""
    )


    # Admin and Super Admin can analyze ALL documents
    if user_role not in ["admin", "super_admin"]:

        query = query.filter(
            (Document.department_id == current_user.department_id)
            |
            (Document.department_id.is_(None))
        )


    document = query.first()


    # ---------------------------------------------------------
    # DOCUMENT NOT FOUND / NO ACCESS
    # ---------------------------------------------------------

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found or you do not have access to it"
        )


    # ---------------------------------------------------------
    # CHECK DOCUMENT TEXT
    # ---------------------------------------------------------

    if not document.document_text:

        raise HTTPException(
            status_code=400,
            detail="Document does not contain readable text"
        )


    # ---------------------------------------------------------
    # CREATE AI ANALYSIS PROMPT
    # ---------------------------------------------------------

    prompt = f"""
You are an AI document analysis assistant for ABC Technologies.

Analyze the following enterprise document.

Provide the response in this format:

Summary:
Give a concise summary of the document.

Key Points:

- List the most important points.
- Keep them concise and useful.

Important Topics:

- List the main topics covered in the document.

Use ONLY the document content.
Do not invent information.

Document Title:
{document.title}

Document Content:
{document.document_text}
"""


    # ---------------------------------------------------------
    # GENERATE AI ANALYSIS
    # ---------------------------------------------------------

    try:

        result = generate_ai_response(
            "Analyze this document",
            [prompt],
            []
        )


        return {
            "document_id": document.id,
            "title": document.title,
            "analysis": result
        }


    except Exception as e:

        print(
            "AI DOCUMENT ANALYSIS ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )