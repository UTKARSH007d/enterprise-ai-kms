from fastapi import Depends, HTTPException

from app.auth.dependencies import get_current_user
from app.models.user import User


# ==========================================================
# ADMIN PERMISSION
# ==========================================================

def require_admin(
    current_user: User = Depends(get_current_user)
):
    """
    Allows both admins and super admins
    to access normal admin functionality.
    """

    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


# ==========================================================
# SUPER ADMIN PERMISSION
# ==========================================================

def require_super_admin(
    current_user: User = Depends(get_current_user)
):
    """
    Only a super admin can access this functionality.
    """

    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Super Admin access required"
        )

    return current_user