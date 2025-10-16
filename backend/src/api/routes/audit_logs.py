from typing import List

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
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
    created_at: datetime | None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AuditLogOut])
def list_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    action: str | None = Query(None),
    start: str | None = Query(None, description="ISO datetime, e.g. 2025-10-16T00:00:00"),
    end: str | None = Query(None, description="ISO datetime, e.g. 2025-10-16T23:59:59"),
):
    # Any authenticated user can view for now; can refine policy later
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    try:
        if start:
            dt = datetime.fromisoformat(start)
            q = q.filter(AuditLog.created_at >= dt)
        if end:
            dt = datetime.fromisoformat(end)
            q = q.filter(AuditLog.created_at <= dt)
    except Exception:
        # Tránh 500: trả 422 rõ ràng thay vì internal_error
        raise HTTPException(status_code=422, detail="invalid datetime format")
    rows = q.order_by(AuditLog.id.desc()).limit(limit).all()
    return rows


