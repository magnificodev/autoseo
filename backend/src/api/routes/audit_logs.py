from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.deps.auth import get_current_user, get_db
from src.database.models import AuditLog, User


router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


class AuditLogOut(BaseModel):
    id: int
    actor_user_id: int
    action: str
    target_type: str
    target_id: int
    note: str | None
    created_at: str | None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AuditLogOut])
def list_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100,
):
    # Any authenticated user can view for now; can refine policy later
    rows = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .limit(max(1, min(limit, 500)))
        .all()
    )
    return rows


