from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.deps.auth import get_current_user, get_db
from src.api.middleware.permissions import require_admin, require_user_management_permission
from src.core.permissions import can_manage_user
from src.database.models import User, Role

router = APIRouter(prefix="/api/users", tags=["users"])


class UserOut(BaseModel):
    id: int
    email: str
    role_name: str
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True


class RoleOut(BaseModel):
    id: int
    name: str
    max_users: int
    permissions: str

    class Config:
        from_attributes = True


class AssignRoleIn(BaseModel):
    user_id: int
    role_name: str


@router.get("/", response_model=List[UserOut])
@require_admin
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all users with their roles"""
    users = db.query(User).all()
    return [
        UserOut(
            id=user.id,
            email=user.email,
            role_name=user.role.name if user.role else "unknown",
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else ""
        )
        for user in users
    ]


@router.get("/roles", response_model=List[RoleOut])
@require_admin
def list_roles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List available roles"""
    roles = db.query(Role).all()
    return [
        RoleOut(
            id=role.id,
            name=role.name,
            max_users=role.max_users,
            permissions=role.permissions
        )
        for role in roles
    ]


@router.post("/assign-role")
@require_admin
def assign_role(
    body: AssignRoleIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign role to user"""
    # Get target user
    target_user = db.get(User, body.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if current user can manage target user
    if not can_manage_user(current_user, target_user):
        raise HTTPException(
            status_code=403,
            detail="Cannot manage user with equal or higher role"
        )
    
    # Get role
    role = db.query(Role).filter(Role.name == body.role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check role limits
    if role.max_users != -1:  # Not unlimited
        current_count = db.query(User).filter(User.role_id == role.id).count()
        if current_count >= role.max_users:
            raise HTTPException(
                status_code=400,
                detail=f"Role {role.name} has reached maximum users ({role.max_users})"
            )
    
    # Assign role
    target_user.role_id = role.id
    db.commit()
    
    return {"message": f"User assigned to {role.name} role"}


@router.patch("/{user_id}/toggle-active")
@require_admin
def toggle_user_active(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle user active status"""
    target_user = db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Cannot deactivate yourself
    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot deactivate your own account"
        )
    
    # Check if current user can manage target user
    if not can_manage_user(current_user, target_user):
        raise HTTPException(
            status_code=403,
            detail="Cannot manage user with equal or higher role"
        )
    
    target_user.is_active = not target_user.is_active
    db.commit()
    
    status_text = "activated" if target_user.is_active else "deactivated"
    return {"message": f"User {status_text} successfully"}
