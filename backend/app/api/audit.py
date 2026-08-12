from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.dependencies import get_current_user
from app.models.audit_log import AuditLog

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.get("/")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Admin and Super Admin can view audit logs
    if current_user.role.lower() not in ("admin", "superadmin"):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "created_at": log.created_at
        }
        for log in logs
    ]