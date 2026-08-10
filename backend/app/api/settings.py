from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.settings import Settings
from app.models.user import User
from app.auth.permissions import require_admin
from app.models.audit_log import AuditLog

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


@router.get("/")
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    settings = db.query(Settings).all()

    return [
        {
            "id": setting.id,
            "key": setting.key,
            "value": setting.value,
            "updated_at": setting.updated_at
        }
        for setting in settings
    ]


@router.put("/{key}")
def update_setting(
    key: str,
    value: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    setting = (
        db.query(Settings)
        .filter(Settings.key == key)
        .first()
    )

    if setting is None:
        setting = Settings(
            key=key,
            value=value
        )
        db.add(setting)
    else:
        setting.value = value

    db.commit()
    db.refresh(setting)
    

    
    audit_log = AuditLog(
        user_id=current_user.id,
        action=f"UPDATE_SETTING: {key}"
    )

    db.add(audit_log)
    db.commit()
    return {
        "message": "Setting updated successfully",
        "key": setting.key,
        "value": setting.value
    }