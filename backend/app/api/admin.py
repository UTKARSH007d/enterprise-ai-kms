from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.auth.permissions import (
    require_admin,
    require_super_admin
)

from app.models.user import User
from app.models.department import Department
from app.models.document import Document
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.models.audit_log import AuditLog

from app.schemas.user import AdminCreateUser
from app.auth.security import hash_password


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ==========================================================
# GET ALL USERS
# ==========================================================

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department_id": user.department_id,
            "is_active": user.is_active
        }
        for user in users
    ]


# ==========================================================
# CREATE USER
# ==========================================================

@router.post("/users")
def create_user(
    user_data: AdminCreateUser,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    # ------------------------------------------------------
    # SECURITY:
    # New users are ALWAYS created as Employees.
    # Only Super Admin can promote an Employee to Admin later.
    # ------------------------------------------------------

    # Check duplicate email
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Check department
    department = (
        db.query(Department)
        .filter(Department.id == user_data.department_id)
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="employee",
        department_id=user_data.department_id,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Audit log
    db.add(
        AuditLog(
            user_id=current_user.id,
            action=f"CREATE_USER: {new_user.email} (employee)"
        )
    )

    db.commit()

    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "department_id": new_user.department_id
        }
    }


# ==========================================================
# PROMOTE EMPLOYEE → ADMIN
# ==========================================================

@router.put("/users/{user_id}/promote")
def promote_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Cannot promote super admin
    if user.role == "super_admin":
        raise HTTPException(
            status_code=400,
            detail="User is already a Super Admin"
        )

    # Already admin
    if user.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="User is already an Admin"
        )

    old_role = user.role

    user.role = "admin"

    db.commit()
    db.refresh(user)

    # Audit log
    db.add(
        AuditLog(
            user_id=current_user.id,
            action=f"PROMOTE_USER: {user.email} ({old_role} -> admin)"
        )
    )

    db.commit()

    return {
        "message": "User promoted to Admin successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department_id": user.department_id
        }
    }


# ==========================================================
# DEMOTE ADMIN → EMPLOYEE
# ==========================================================

@router.put("/users/{user_id}/demote")
def demote_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Cannot demote a super admin
    if user.role == "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Super Admin cannot be demoted"
        )

    # Already employee
    if user.role == "employee":
        raise HTTPException(
            status_code=400,
            detail="User is already an Employee"
        )

    user.role = "employee"

    db.commit()
    db.refresh(user)

    db.add(
        AuditLog(
            user_id=current_user.id,
            action=f"DEMOTE_USER: {user.email} (admin -> employee)"
        )
    )

    db.commit()

    return {
        "message": "Admin demoted to Employee successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department_id": user.department_id
        }
    }


# ==========================================================
# DELETE USER
# ==========================================================

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # ------------------------------------------------------
    # Nobody can delete themselves
    # ------------------------------------------------------

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )

    # ------------------------------------------------------
    # Normal Admin:
    # Can delete Employees only.
    # ------------------------------------------------------

    if current_user.role == "admin":

        if user.role in ["admin", "super_admin"]:
            raise HTTPException(
                status_code=403,
                detail="Admins cannot delete another Admin or Super Admin"
            )

    # ------------------------------------------------------
    # Super Admin:
    # Can delete Employees and Admins.
    # Cannot delete another Super Admin.
    # ------------------------------------------------------

    if current_user.role == "super_admin":

        if user.role == "super_admin":
            raise HTTPException(
                status_code=403,
                detail="Super Admin accounts cannot be deleted"
            )

    user_email = user.email
    user_role = user.role

    # ------------------------------------------------------
    # DELETE CHAT MESSAGES FIRST
    # ------------------------------------------------------

    chat_sessions = (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == user.id
        )
        .all()
    )

    for session in chat_sessions:

        db.query(ChatMessage).filter(
            ChatMessage.chat_session_id == session.id
        ).delete(
            synchronize_session=False
        )

    # ------------------------------------------------------
    # DELETE CHAT SESSIONS
    # ------------------------------------------------------

    db.query(ChatSession).filter(
        ChatSession.user_id == user.id
    ).delete(
        synchronize_session=False
    )

    # ------------------------------------------------------
    # DELETE USER
    # ------------------------------------------------------

    db.delete(user)

    # ------------------------------------------------------
    # AUDIT LOG
    # ------------------------------------------------------

    db.add(
        AuditLog(
            user_id=current_user.id,
            action=f"DELETE_USER: {user_email} ({user_role})"
        )
    )

    db.commit()

    return {
        "message": "User deleted successfully"
    }
# ==========================================================
# ADMIN STATISTICS
# ==========================================================

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    total_users = db.query(User).count()
    total_documents = db.query(Document).count()
    total_sessions = db.query(ChatSession).count()
    total_messages = db.query(ChatMessage).count()

    return {
        "total_users": total_users,
        "total_documents": total_documents,
        "total_chat_sessions": total_sessions,
        "total_chat_messages": total_messages
    }


# ==========================================================
# GET ALL DEPARTMENTS
# ==========================================================

@router.get("/departments")
def get_all_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    departments = db.query(Department).all()

    return [
        {
            "id": department.id,
            "name": department.name
        }
        for department in departments
    ]