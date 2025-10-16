from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.api.deps.auth import get_current_user, get_db
from src.core.wordpress_client import WordPressClient, WordPressCredentials
from src.database.models import Site


class SiteIn(BaseModel):
    name: str
    wp_url: str
    wp_username: str
    wp_password_enc: str


class SiteOut(SiteIn):
    is_auto_enabled: bool | None = None
    schedule_cron: str | None = None
    daily_quota: int | None = None
    active_start_hour: int | None = None
    active_end_hour: int | None = None


class SiteUpdate(BaseModel):
    is_auto_enabled: bool | None = None
    schedule_cron: str | None = None
    daily_quota: int | None = None
    active_start_hour: int | None = None
    active_end_hour: int | None = None


router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("/", response_model=list[SiteOut])
def list_sites(db: Session = Depends(get_db), user=Depends(get_current_user)):
    records = db.query(Site).all()
    return [
        SiteOut.model_validate(
            {
                "name": r.name,
                "wp_url": r.wp_url,
                "wp_username": r.wp_username,
                "wp_password_enc": r.wp_password_enc,
                "is_auto_enabled": getattr(r, "is_auto_enabled", None),
                "schedule_cron": getattr(r, "schedule_cron", None),
                "daily_quota": getattr(r, "daily_quota", None),
                "active_start_hour": getattr(r, "active_start_hour", None),
                "active_end_hour": getattr(r, "active_end_hour", None),
            }
        )
        for r in records
    ]


@router.post("/", response_model=SiteIn)
def create_site(
    body: SiteIn, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    site = Site(**body.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return body


@router.patch("/{site_id}", response_model=SiteOut)
def update_site(
    site_id: int,
    body: SiteUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.get(Site, site_id)
    if not site:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="site_not_found")
    changed = False
    for field in [
        "is_auto_enabled",
        "schedule_cron",
        "daily_quota",
        "active_start_hour",
        "active_end_hour",
    ]:
        value = getattr(body, field)
        if value is not None:
            setattr(site, field, value)
            changed = True
    if changed:
        db.add(site)
        db.commit()
        db.refresh(site)
    return SiteOut.model_validate(
        {
            "name": site.name,
            "wp_url": site.wp_url,
            "wp_username": site.wp_username,
            "wp_password_enc": site.wp_password_enc,
            "is_auto_enabled": getattr(site, "is_auto_enabled", None),
            "schedule_cron": getattr(site, "schedule_cron", None),
            "daily_quota": getattr(site, "daily_quota", None),
            "active_start_hour": getattr(site, "active_start_hour", None),
            "active_end_hour": getattr(site, "active_end_hour", None),
        }
    )


class TestConnectionOut(BaseModel):
    ok: bool


@router.post("/test-connection", response_model=TestConnectionOut)
def test_connection(body: SiteIn, user=Depends(get_current_user)):
    # Normalize URL to include scheme
    wp_url = body.wp_url.strip()
    if not (wp_url.startswith("http://") or wp_url.startswith("https://")):
        wp_url = "https://" + wp_url
    creds = WordPressCredentials(
        base_url=wp_url,
        username=body.wp_username,
        password=body.wp_password_enc,
    )
    try:
        client = WordPressClient(creds)
        ok = client.test_connection()
        return TestConnectionOut(ok=ok)
    except Exception as e:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail=f"wp_connection_failed: {e}")
