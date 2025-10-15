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


router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("/", response_model=list[SiteIn])
def list_sites(db: Session = Depends(get_db), user=Depends(get_current_user)):
    records = db.query(Site).all()
    return [
        SiteIn.model_validate(
            {
                "name": r.name,
                "wp_url": r.wp_url,
                "wp_username": r.wp_username,
                "wp_password_enc": r.wp_password_enc,
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


@router.post("/test-connection")
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
        return {"ok": ok}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"wp_connection_failed: {e}")
