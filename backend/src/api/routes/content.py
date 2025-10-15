from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.deps.auth import get_current_user, get_db
from src.database.models import ContentQueue


class ContentIn(BaseModel):
    site_id: int
    title: str
    body: str | None = None
    status: str = "pending"


router = APIRouter(prefix="/content", tags=["content"])


@router.get("/", response_model=list[ContentIn])
def list_content(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(ContentQueue).all()
    return [ContentIn.model_validate({
        "site_id": r.site_id,
        "title": r.title,
        "body": r.body,
        "status": r.status,
    }) for r in rows]


@router.post("/", response_model=ContentIn)
def create_content(body: ContentIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = ContentQueue(**body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return body


