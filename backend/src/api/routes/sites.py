from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.deps.auth import get_current_user, get_db
from src.database.models import Site


class SiteIn(BaseModel):
    name: str
    wp_url: str
    wp_username: str
    wp_password_enc: str


router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("/", response_model=list[SiteIn])
def list_sites(db: Session = Depends(get_db), user=Depends(get_current_user)):
    records = db.query(Site).all()
    return [SiteIn.model_validate({
        "name": r.name,
        "wp_url": r.wp_url,
        "wp_username": r.wp_username,
        "wp_password_enc": r.wp_password_enc,
    }) for r in records]


@router.post("/", response_model=SiteIn)
def create_site(body: SiteIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    site = Site(**body.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return body


