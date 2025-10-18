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


router = APIRouter(prefix="/api/content-queue", tags=["content"])


class ContentOut(BaseModel):
    id: int
    title: str
    content: str
    status: str
    site_id: int
    site_name: str
    created_at: str
    updated_at: str


@router.get("/", response_model=list[ContentOut])
def list_content(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    limit: int = 10,
    page: int = 1,
    q: Optional[str] = None,
    status: Optional[str] = None,
):
    query = db.query(ContentQueue).join(Site)

    if q:
        query = query.filter(ContentQueue.title.contains(q))
    if status:
        query = query.filter(ContentQueue.status == status)

    offset = (page - 1) * limit
    rows = query.offset(offset).limit(limit).all()

    return [
        ContentOut(
            id=r.id,
            title=r.title,
            content=r.body or "",
            status=r.status,
            site_id=r.site_id,
            site_name=r.site.name,
            created_at=r.created_at.isoformat() if r.created_at else "",
            updated_at=r.updated_at.isoformat()
            if r.updated_at
            else r.created_at.isoformat()
            if r.created_at
            else "",
        )
        for r in rows
    ]


@router.post("/", response_model=ContentOut)
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

        return ContentOut(
            id=row.id,
            title=row.title,
            content=row.body or "",
            status=row.status,
            site_id=row.site_id,
            site_name=row.site.name,
            created_at=row.created_at.isoformat() if row.created_at else "",
            updated_at=row.updated_at.isoformat()
            if row.updated_at
            else row.created_at.isoformat()
            if row.created_at
            else "",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"content_create_failed: {e}")


@router.get("/{content_id}", response_model=ContentOut)
def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    content = db.get(ContentQueue, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return ContentOut(
        id=content.id,
        title=content.title,
        content=content.body or "",
        status=content.status,
        site_id=content.site_id,
        site_name=content.site.name,
        created_at=content.created_at.isoformat() if content.created_at else "",
        updated_at=content.updated_at.isoformat()
        if content.updated_at
        else content.created_at.isoformat()
        if content.created_at
        else "",
    )


@router.put("/{content_id}", response_model=ContentOut)
def update_content_full(
    content_id: int,
    body: ContentIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    content = db.get(ContentQueue, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Update all fields
    content.site_id = body.site_id
    content.title = body.title
    content.body = body.body
    content.status = body.status
    
    db.add(content)
    db.commit()
    db.refresh(content)
    
    return ContentOut(
        id=content.id,
        title=content.title,
        content=content.body or "",
        status=content.status,
        site_id=content.site_id,
        site_name=content.site.name,
        created_at=content.created_at.isoformat() if content.created_at else "",
        updated_at=content.updated_at.isoformat()
        if content.updated_at
        else content.created_at.isoformat()
        if content.created_at
        else "",
    )


@router.patch("/{content_id}", response_model=ContentOut)
def update_content(
    content_id: int,
    body: ContentIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    content = db.get(ContentQueue, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Update only provided fields
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(content, field, value)
    
    db.add(content)
    db.commit()
    db.refresh(content)
    
    return ContentOut(
        id=content.id,
        title=content.title,
        content=content.body or "",
        status=content.status,
        site_id=content.site_id,
        site_name=content.site.name,
        created_at=content.created_at.isoformat() if content.created_at else "",
        updated_at=content.updated_at.isoformat()
        if content.updated_at
        else content.created_at.isoformat()
        if content.created_at
        else "",
    )


@router.delete("/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    content = db.get(ContentQueue, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}


@router.patch("/{content_id}/status")
def update_content_status(
    content_id: int,
    status: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    content = db.get(ContentQueue, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    content.status = status
    db.add(content)
    db.commit()

    return {"message": "Status updated successfully"}


class PublishIn(BaseModel):
    site_id: int
    title: str
    body: Optional[str] = None
    status: str = "draft"  # draft|publish


class PublishOut(BaseModel):
    ok: bool
    post_id: int | None = None
    link: str | None = None
    raw: dict | None = None


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
def checklist_content(body: ChecklistIn):
    report = _checklist(title=body.title or "", body=body.body or "")
    return report


@router.post("/{content_id}/publish", response_model=PublishOut)
def publish_content(
    content_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    content = db.get(ContentQueue, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    site: Site | None = db.get(Site, content.site_id)
    if not site:
        raise HTTPException(status_code=404, detail="site_not_found")
    
    report = _checklist(title=content.title or "", body=content.body or "")
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
            title=content.title, content=content.body or "", status="publish"
        )
        # Update content status to published
        content.status = "published"
        db.add(content)
        db.commit()
        
        return {
            "ok": True,
            "post_id": result.get("id"),
            "link": result.get("link"),
            "raw": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"wp_publish_failed: {e}")


@router.post("/publish", response_model=PublishOut)
def publish_content_direct(
    body: PublishIn = Body(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site: Site | None = db.get(Site, body.site_id)
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
