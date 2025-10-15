from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.deps.auth import get_current_user, get_db
from src.database.models import Keyword


class KeywordIn(BaseModel):
    site_id: int
    keyword: str
    language: str = "vi"


router = APIRouter(prefix="/keywords", tags=["keywords"])


@router.get("/", response_model=list[KeywordIn])
def list_keywords(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Keyword).all()
    return [KeywordIn.model_validate({
        "site_id": r.site_id,
        "keyword": r.keyword,
        "language": r.language,
    }) for r in rows]


@router.post("/", response_model=KeywordIn)
def create_keyword(body: KeywordIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = Keyword(**body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return body


