from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException
)

from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from sqlalchemy import or_

from typing import Optional

import shutil
import uuid
import os

from app.database.database import get_db

from app.models.document import Document

from app.models.user import User

from app.auth.dependencies import get_current_user

from app.auth.permissions import require_admin

from app.schemas.document import (
    DocumentResponse,
    DocumentUpdate
)

from app.utils.text_extractor import extract_text

from app.utils.text_chunker import chunk_text

from app.utils.embedding_generator import (
    generate_embedding
)

from app.database.vector_db import (
    store_embedding,
    delete_document_embeddings
)

from app.services.document_service import (
    summarize_document
)

from app.services.audit_service import (
    create_audit_log
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# ==========================================================
# ALLOWED FILE TYPES
# ==========================================================

ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
]


# ==========================================================
# ADMIN / SUPER ADMIN CHECK
# ==========================================================

def require_admin_or_super_admin(
    current_user: User
):
    """
    Allow both Admin and Super Admin.
    """

    role = (
        current_user.role or ""
    ).lower()

    if role not in [
        "admin",
        "super_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Administrator access required."
        )

    return current_user


# ==========================================================
# UPLOAD DOCUMENT
# ==========================================================

@router.post("/upload")
def upload_document(

    title: str = Form(...),

    category: str = Form(...),

    department_id: Optional[int] = Form(None),

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # ------------------------------------------------------
    # ADMIN + SUPER ADMIN ONLY
    # ------------------------------------------------------

    require_admin_or_super_admin(
        current_user
    )

    # ------------------------------------------------------
    # FILE TYPE VALIDATION
    # ------------------------------------------------------

    if file.content_type not in ALLOWED_FILE_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are allowed."
        )

    # ------------------------------------------------------
    # CREATE UNIQUE FILE NAME
    # ------------------------------------------------------

    filename, extension = os.path.splitext(
        file.filename
    )

    unique_filename = (
        f"{uuid.uuid4()}{extension}"
    )

    # ------------------------------------------------------
    # UPLOAD DIRECTORY
    # ------------------------------------------------------

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    file_path = (
        f"uploads/{unique_filename}"
    )

    # ------------------------------------------------------
    # SAVE FILE
    # ------------------------------------------------------

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    # ------------------------------------------------------
    # EXTRACT TEXT
    # ------------------------------------------------------

    document_text = extract_text(
        file_path,
        extension.lower()
    )

    # ------------------------------------------------------
    # CREATE CHUNKS
    # ------------------------------------------------------

    chunks = chunk_text(
        document_text
    )

    # ------------------------------------------------------
    # CREATE DATABASE DOCUMENT
    # ------------------------------------------------------

    document = Document(

        title=title,

        category=category,

        original_filename=file.filename,

        stored_filename=unique_filename,

        file_path=file_path,

        file_type=extension.lower(),

        document_text=document_text,

        department_id=department_id,

        uploaded_by=current_user.id,

        status="Uploaded"

    )

    db.add(document)

    db.commit()

    db.refresh(document)

    # ------------------------------------------------------
    # AUDIT LOG
    # ------------------------------------------------------

    create_audit_log(
        db,
        current_user.id,
        f"UPLOAD_DOCUMENT: {document.title}"
    )

    # ------------------------------------------------------
    # CREATE EMBEDDINGS
    # ------------------------------------------------------

    for index, chunk in enumerate(
        chunks
    ):

        embedding = generate_embedding(
            chunk
        )

        store_embedding(

            chunk_id=(
                f"doc_{document.id}_chunk_{index}"
            ),

            chunk_text=chunk,

            embedding=embedding,

            metadata={

                "document_id": str(
                    document.id
                ),

                "title": document.title,

                "department_id": (
                    str(
                        document.department_id
                    )
                    if document.department_id
                    is not None
                    else "company-wide"
                )
            }
        )

    # ------------------------------------------------------
    # RESPONSE
    # ------------------------------------------------------

    return {
        "message":
            "Document uploaded successfully",

        "document_id":
            document.id,

        "title":
            document.title
    }


# ==========================================================
# GET ALL DOCUMENTS
# ==========================================================

@router.get(
    "/",
    response_model=list[DocumentResponse]
)
def get_all_documents(

    search: Optional[str] = None,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    query = db.query(
        Document
    )

    # ======================================================
    # ROLE BASED DOCUMENT ACCESS
    # ======================================================

    role = (
        current_user.role or ""
    ).lower()

    # ------------------------------------------------------
    # EMPLOYEE
    # ------------------------------------------------------
    # Employees can only see:
    #
    # 1. Their department documents
    # 2. Company-wide documents
    # ------------------------------------------------------

    if role not in [
        "admin",
        "super_admin"
    ]:

        query = query.filter(
            or_(
                Document.department_id
                == current_user.department_id,

                Document.department_id.is_(None)
            )
        )

    # ------------------------------------------------------
    # ADMIN / SUPER ADMIN
    # ------------------------------------------------------
    #
    # No department filter.
    #
    # They can see ALL organization documents.
    # ------------------------------------------------------

    # ======================================================
    # SEARCH
    # ======================================================

    if search:

        query = query.filter(
            or_(
                Document.title.ilike(
                    f"%{search}%"
                ),

                Document.category.ilike(
                    f"%{search}%"
                )
            )
        )

    return query.all()


# ==========================================================
# GET SINGLE DOCUMENT
# ==========================================================

@router.get(
    "/{document_id}",
    response_model=DocumentResponse
)
def get_document(

    document_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    query = db.query(
        Document
    ).filter(
        Document.id == document_id
    )

    # ======================================================
    # EMPLOYEE ACCESS
    # ======================================================

    role = (
        current_user.role or ""
    ).lower()

    if role not in [
        "admin",
        "super_admin"
    ]:

        query = query.filter(
            or_(
                Document.department_id
                == current_user.department_id,

                Document.department_id.is_(None)
            )
        )

    document = query.first()

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document


# ==========================================================
# UPDATE DOCUMENT
# ==========================================================

@router.put(
    "/{document_id}",
    response_model=DocumentResponse
)
def update_document(

    document_id: int,

    document_data: DocumentUpdate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # ------------------------------------------------------
    # ADMIN + SUPER ADMIN ONLY
    # ------------------------------------------------------

    require_admin_or_super_admin(
        current_user
    )

    # ------------------------------------------------------
    # FIND DOCUMENT
    # ------------------------------------------------------

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id
        )
        .first()
    )

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # ------------------------------------------------------
    # UPDATE DATABASE INFORMATION
    # ------------------------------------------------------

    document.title = (
        document_data.title
    )

    document.category = (
        document_data.category
    )

    document.department_id = (
        document_data.department_id
    )

    db.commit()

    db.refresh(document)

    # ======================================================
    # IMPORTANT:
    # REBUILD VECTOR METADATA
    # ======================================================
    #
    # The PostgreSQL document has now been updated.
    #
    # However, ChromaDB still contains the old department
    # metadata from the time the document was uploaded.
    #
    # Therefore we delete the old embeddings and recreate
    # them using the current document information.
    # ======================================================

    delete_document_embeddings(
        document.id
    )

    # ------------------------------------------------------
    # RECREATE DOCUMENT CHUNKS
    # ------------------------------------------------------

    chunks = chunk_text(
        document.document_text or ""
    )

    # ------------------------------------------------------
    # RECREATE EMBEDDINGS
    # ------------------------------------------------------

    for index, chunk in enumerate(
        chunks
    ):

        embedding = generate_embedding(
            chunk
        )

        store_embedding(

            chunk_id=(
                f"doc_{document.id}_chunk_{index}"
            ),

            chunk_text=chunk,

            embedding=embedding,

            metadata={

                "document_id": str(
                    document.id
                ),

                "title": document.title,

                "department_id": (
                    str(
                        document.department_id
                    )
                    if document.department_id
                    is not None
                    else "company-wide"
                )
            }
        )

    # ------------------------------------------------------
    # AUDIT LOG
    # ------------------------------------------------------

    create_audit_log(
        db,
        current_user.id,
        f"UPDATE_DOCUMENT: {document.title}"
    )

    return document


# ==========================================================
# DELETE DOCUMENT
# ==========================================================

@router.delete(
    "/{document_id}"
)
def delete_document(

    document_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # ------------------------------------------------------
    # ADMIN + SUPER ADMIN ONLY
    # ------------------------------------------------------

    require_admin_or_super_admin(
        current_user
    )

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id
        )
        .first()
    )

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # ------------------------------------------------------
    # DELETE FILE
    # ------------------------------------------------------

    if os.path.exists(
        document.file_path
    ):

        os.remove(
            document.file_path
        )

    # ------------------------------------------------------
    # DELETE VECTOR EMBEDDINGS
    # ------------------------------------------------------

    delete_document_embeddings(
        document.id
    )

    # ------------------------------------------------------
    # AUDIT LOG
    # ------------------------------------------------------

    create_audit_log(
        db,
        current_user.id,
        f"DELETE_DOCUMENT: {document.title}"
    )

    # ------------------------------------------------------
    # DELETE DATABASE RECORD
    # ------------------------------------------------------

    db.delete(
        document
    )

    db.commit()

    return {
        "message":
            "Document deleted successfully"
    }


# ==========================================================
# DOWNLOAD DOCUMENT
# ==========================================================

@router.get(
    "/{document_id}/download"
)
def download_document(

    document_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    query = db.query(
        Document
    ).filter(
        Document.id == document_id
    )

    # ======================================================
    # EMPLOYEE ACCESS
    # ======================================================

    role = (
        current_user.role or ""
    ).lower()

    if role not in [
        "admin",
        "super_admin"
    ]:

        query = query.filter(
            or_(
                Document.department_id
                == current_user.department_id,

                Document.department_id.is_(None)
            )
        )

    document = query.first()

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # ------------------------------------------------------
    # AUDIT LOG
    # ------------------------------------------------------

    create_audit_log(
        db,
        current_user.id,
        f"DOWNLOAD_DOCUMENT: {document.title}"
    )

    # ------------------------------------------------------
    # FILE
    # ------------------------------------------------------

    return FileResponse(
        path=document.file_path,
        filename=document.original_filename
    )


# ==========================================================
# SUMMARIZE DOCUMENT
# ==========================================================

@router.post(
    "/{document_id}/summarize"
)
def summarize_document_api(

    document_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id
        )
        .first()
    )

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # ------------------------------------------------------
    # EMPLOYEE DEPARTMENT RESTRICTION
    # ------------------------------------------------------

    role = (
        current_user.role or ""
    ).lower()

    if role not in [
        "admin",
        "super_admin"
    ]:

        if (
            document.department_id
            != current_user.department_id
            and document.department_id
            is not None
        ):

            raise HTTPException(
                status_code=403,
                detail="You do not have access to this document."
            )

    # ------------------------------------------------------
    # SUMMARY
    # ------------------------------------------------------

    summary = summarize_document(
        document.document_text
    )

    return {
        "document_id":
            document.id,

        "title":
            document.title,

        "summary":
            summary
    }