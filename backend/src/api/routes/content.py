from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.api.deps.auth import get_current_user, get_db
from src.database.models import ContentQueue
from src.core.wordpress_client import WordPressClient, WordPressCredentials
from src.database.models import Site


class ContentIn(BaseModel):
    site_id: int
    title: str
    body: Optional[str] = None
    status: str = "pending"


router = APIRouter(prefix="/content", tags=["content"])


@router.get("/", response_model=list[ContentIn])
def list_content(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(ContentQueue).all()
    return [
        ContentIn.model_validate(
            {
                "site_id": r.site_id,
                "title": r.title,
                "body": r.body,
                "status": r.status,
            }
        )
        for r in rows
    ]


@router.post("/", response_model=ContentIn)
def create_content(
    body: ContentIn = Body(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        row = ContentQueue(**body.model_dump())
        db.add(row)
        db.commit()
        db.refresh(row)
        return body
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"content_create_failed: {e}")


class PublishIn(BaseModel):
    site_id: int
    title: str
    body: Optional[str] = None
    status: str = "draft"  # draft|publish


@router.post("/publish")
def publish_content(
    body: PublishIn = Body(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site: Site | None = db.query(Site).get(body.site_id)
    if not site:
        raise HTTPException(status_code=404, detail="site_not_found")
    creds = WordPressCredentials(
        base_url=site.wp_url,
        username=site.wp_username,
        password=site.wp_password_enc,
    )
    client = WordPressClient(creds)
    try:
        result = client.create_post(title=body.title, content=body.body or "", status=body.status)
        # result typically has 'id' and 'link'
        return {"ok": True, "post_id": result.get("id"), "link": result.get("link"), "raw": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"wp_publish_failed: {e}")
