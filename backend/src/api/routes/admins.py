from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.api.deps.auth import get_current_user, get_db
from src.database.models import TelegramAdmin, User


router = APIRouter(prefix="/api/admins", tags=["admins"])


class AdminOut(BaseModel):
    user_id: int

    class Config:
        from_attributes = True


class AdminCreateIn(BaseModel):
    user_id: int = Field(..., ge=1)


def _ensure_dashboard_admin(user: User) -> None:
    # Simple policy: only the first user (id==1) can manage admins via dashboard/API.
    # This can be evolved to role-based access later.
    if user.id != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")


@router.get("/", response_model=List[AdminOut])
def list_admins(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _ensure_dashboard_admin(current_user)
    rows = db.query(TelegramAdmin).all()
    return [AdminOut(user_id=r.user_id) for r in rows]


@router.post("/", response_model=AdminOut, status_code=201)
def create_admin(
    body: AdminCreateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_dashboard_admin(current_user)
    exists = db.query(TelegramAdmin).filter(TelegramAdmin.user_id == body.user_id).first()
    if exists:
        return AdminOut(user_id=exists.user_id)
    row = TelegramAdmin(user_id=body.user_id)
    db.add(row)
    db.commit()
    return AdminOut(user_id=row.user_id)


@router.delete("/{user_id}", status_code=204)
def delete_admin(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_dashboard_admin(current_user)
    row = db.query(TelegramAdmin).filter(TelegramAdmin.user_id == user_id).first()
    if not row:
        return
    db.delete(row)
    db.commit()
    return


