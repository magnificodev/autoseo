from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.api.deps.auth import get_current_user, get_db
from src.core.wordpress_client import WordPressClient, WordPressCredentials
from src.database.models import ContentQueue, Site


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


def _checklist(title: str, body: str) -> dict:
    issues: list[str] = []
    warnings: list[str] = []
    score = 100
    if len(title.strip()) < 10:
        issues.append("title_too_short(<10)")
        score -= 20
    if len(title.strip()) > 120:
        warnings.append("title_too_long(>120)")
        score -= 5
    if len(body.strip()) < 200:
        issues.append("content_too_short(<200)")
        score -= 30
    # simple heading check
    has_heading = any(h in body for h in ["\n# ", "\n## ", "<h1", "<h2"])
    if not has_heading:
        warnings.append("no_headings_found")
        score -= 10
    # simple alt presence (for HTML img)
    if "<img" in body and "alt=" not in body:
        warnings.append("image_without_alt")
        score -= 10
    score = max(0, score)
    passed = score >= 60 and not issues
    return {"passed": passed, "score": score, "issues": issues, "warnings": warnings}


class ChecklistIn(BaseModel):
    title: str
    body: Optional[str] = None


@router.post("/checklist")
def checklist(body: ChecklistIn):
    report = _checklist(title=body.title or "", body=body.body or "")
    return report


@router.post("/publish")
def publish_content(
    body: PublishIn = Body(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site: Site | None = db.query(Site).get(body.site_id)
    if not site:
        raise HTTPException(status_code=404, detail="site_not_found")
    report = _checklist(title=body.title or "", body=body.body or "")
    if not report.get("passed"):
        raise HTTPException(status_code=400, detail={"checklist_failed": report})
    creds = WordPressCredentials(
        base_url=site.wp_url,
        username=site.wp_username,
        password=site.wp_password_enc,
    )
    client = WordPressClient(creds)
    try:
        result = client.create_post(
            title=body.title, content=body.body or "", status=body.status
        )
        # result typically has 'id' and 'link'
        return {
            "ok": True,
            "post_id": result.get("id"),
            "link": result.get("link"),
            "raw": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"wp_publish_failed: {e}")
