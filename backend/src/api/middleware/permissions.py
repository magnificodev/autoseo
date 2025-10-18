from fastapi import Depends, HTTPException
from src.api.deps.auth import get_current_user
from src.core.permissions import check_permission, can_manage_user
from src.database.models import User


def require_permission(permission: str):
    """
    Decorator to require specific permission
    """
    def decorator(func):
        def wrapper(current_user: User = Depends(get_current_user)):
            if not check_permission(current_user, permission):
                raise HTTPException(
                    status_code=403,
                    detail="Insufficient permissions"
                )
            return func
        return wrapper
    return decorator


def require_admin(func):
    """
    Decorator to require admin role
    """
    def wrapper(current_user: User = Depends(get_current_user)):
        if not current_user.role or current_user.role.name != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )
        return func
    return wrapper


def require_manager_or_admin(func):
    """
    Decorator to require manager or admin role
    """
    def wrapper(current_user: User = Depends(get_current_user)):
        if not current_user.role or current_user.role.name not in ["admin", "manager"]:
            raise HTTPException(
                status_code=403,
                detail="Manager or admin access required"
            )
        return func
    return wrapper


def require_user_management_permission(func):
    """
    Decorator to require user management permission
    """
    def wrapper(current_user: User = Depends(get_current_user)):
        if not check_permission(current_user, "users.manage"):
            raise HTTPException(
                status_code=403,
                detail="User management permission required"
            )
        return func
    return wrapper
