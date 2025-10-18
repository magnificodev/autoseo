from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.deps.auth import get_current_user, get_db
from src.api.middleware.permissions import require_permission
from src.database.models import User, Role, RoleApplication


router = APIRouter(prefix="/api/role-applications", tags=["role-applications"])


class RoleApplicationOut(BaseModel):
    id: int
    user_email: str
    requested_role: str
    reason: str
    status: str
    admin_notes: str
    created_at: str
    reviewed_at: str
    reviewer_email: str

    class Config:
        from_attributes = True


class RoleApplicationIn(BaseModel):
    requested_role: str
    reason: str


class ReviewApplicationIn(BaseModel):
    status: str  # "approved" or "rejected"
    admin_notes: str


@router.get("/", response_model=List[RoleApplicationOut])
def list_applications(
    current_user: User = Depends(require_permission("users.manage")),
    db: Session = Depends(get_db)
):
    """List all role applications (admin only)"""
    applications = db.query(RoleApplication).order_by(RoleApplication.created_at.desc()).all()
    
    return [
        RoleApplicationOut(
            id=app.id,
            user_email=app.user.email,
            requested_role=app.requested_role,
            reason=app.reason or "",
            status=app.status,
            admin_notes=app.admin_notes or "",
            created_at=app.created_at.isoformat() if app.created_at else "",
            reviewed_at=app.reviewed_at.isoformat() if app.reviewed_at else "",
            reviewer_email=app.reviewer.email if app.reviewer else ""
        )
        for app in applications
    ]


@router.get("/my-applications", response_model=List[RoleApplicationOut])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's role applications"""
    applications = db.query(RoleApplication).filter(
        RoleApplication.user_id == current_user.id
    ).order_by(RoleApplication.created_at.desc()).all()
    
    return [
        RoleApplicationOut(
            id=app.id,
            user_email=app.user.email,
            requested_role=app.requested_role,
            reason=app.reason or "",
            status=app.status,
            admin_notes=app.admin_notes or "",
            created_at=app.created_at.isoformat() if app.created_at else "",
            reviewed_at=app.reviewed_at.isoformat() if app.reviewed_at else "",
            reviewer_email=app.reviewer.email if app.reviewer else ""
        )
        for app in applications
    ]


@router.post("/", response_model=RoleApplicationOut, status_code=201)
def create_application(
    body: RoleApplicationIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new role application"""
    # Validate requested role
    if body.requested_role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Requested role must be 'manager' or 'admin'"
        )
    
    # Check if user already has pending application
    existing = db.query(RoleApplication).filter(
        RoleApplication.user_id == current_user.id,
        RoleApplication.status == "pending"
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending role application"
        )
    
    # Check if user already has the requested role or higher
    if body.requested_role == "manager" and current_user.role.name in ["manager", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="You already have manager or admin role"
        )
    
    if body.requested_role == "admin" and current_user.role.name == "admin":
        raise HTTPException(
            status_code=400,
            detail="You already have admin role"
        )
    
    # Create application
    application = RoleApplication(
        user_id=current_user.id,
        requested_role=body.requested_role,
        reason=body.reason,
        status="pending"
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return RoleApplicationOut(
        id=application.id,
        user_email=application.user.email,
        requested_role=application.requested_role,
        reason=application.reason or "",
        status=application.status,
        admin_notes="",
        created_at=application.created_at.isoformat() if application.created_at else "",
        reviewed_at="",
        reviewer_email=""
    )


@router.post("/{application_id}/review")
def review_application(
    application_id: int,
    body: ReviewApplicationIn,
    current_user: User = Depends(require_permission("users.manage")),
    db: Session = Depends(get_db)
):
    """Review a role application (admin only)"""
    application = db.query(RoleApplication).filter(
        RoleApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Application has already been reviewed"
        )
    
    # Update application
    application.status = body.status
    application.reviewed_by = current_user.id
    application.reviewed_at = datetime.utcnow()
    application.admin_notes = body.admin_notes
    
    # If approved, update user's role
    if body.status == "approved":
        role = db.query(Role).filter(Role.name == application.requested_role).first()
        if not role:
            raise HTTPException(status_code=400, detail="Requested role not found")
        
        # Check role limits
        if role.max_users != -1:  # Not unlimited
            current_count = db.query(User).filter(User.role_id == role.id).count()
            if current_count >= role.max_users:
                raise HTTPException(
                    status_code=400,
                    detail=f"Role {role.name} has reached maximum users ({role.max_users})"
                )
        
        application.user.role_id = role.id
    
    db.commit()
    
    return {"message": f"Application {body.status} successfully"}


@router.delete("/{application_id}")
def cancel_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel own pending application"""
    application = db.query(RoleApplication).filter(
        RoleApplication.id == application_id,
        RoleApplication.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Can only cancel pending applications"
        )
    
    db.delete(application)
    db.commit()
    
    return {"message": "Application cancelled successfully"}
