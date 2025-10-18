from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from src.api.deps.auth import get_current_user, get_db
from src.database.models import Keyword, Site


class KeywordIn(BaseModel):
    site_id: int
    keyword: str
    category: Optional[str] = None
    status: str = "active"


class KeywordOut(BaseModel):
    id: int
    keyword: str
    category: Optional[str] = None
    site_id: int
    site_name: str
    status: str
    search_volume: Optional[int] = None
    difficulty: Optional[int] = None
    created_at: str
    updated_at: str


class KeywordUpdate(BaseModel):
    keyword: Optional[str] = None
    category: Optional[str] = None
    site_id: Optional[int] = None
    status: Optional[str] = None


router = APIRouter(prefix="/api/keywords", tags=["keywords"])


@router.get("/", response_model=list[KeywordOut])
def list_keywords(
    db: Session = Depends(get_db), 
    user=Depends(get_current_user),
    limit: int = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    query = db.query(Keyword).join(Site)
    
    if q:
        query = query.filter(Keyword.keyword.contains(q))
    if status:
        query = query.filter(Keyword.status == status)
    if category:
        query = query.filter(Keyword.category.contains(category))
    
    offset = (page - 1) * limit
    rows = query.offset(offset).limit(limit).all()
    
    return [
        KeywordOut(
            id=r.id,
            keyword=r.keyword,
            category=getattr(r, 'category', None),
            site_id=r.site_id,
            site_name=r.site.name,
            status=getattr(r, 'status', 'active'),
            search_volume=getattr(r, 'search_volume', None),
            difficulty=getattr(r, 'difficulty', None),
            created_at=r.created_at.isoformat() if r.created_at else "",
            updated_at=r.updated_at.isoformat() if hasattr(r, 'updated_at') and r.updated_at else r.created_at.isoformat() if r.created_at else ""
        ) for r in rows
    ]


@router.post("/", response_model=KeywordOut)
def create_keyword(body: KeywordIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Verify site exists
    site = db.get(Site, body.site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    keyword_data = body.model_dump()
    keyword_data['status'] = body.status
    keyword_data['category'] = body.category
    
    row = Keyword(**keyword_data)
    db.add(row)
    db.commit()
    db.refresh(row)
    
    return KeywordOut(
        id=row.id,
        keyword=row.keyword,
        category=getattr(row, 'category', None),
        site_id=row.site_id,
        site_name=row.site.name,
        status=getattr(row, 'status', 'active'),
        search_volume=getattr(row, 'search_volume', None),
        difficulty=getattr(row, 'difficulty', None),
        created_at=row.created_at.isoformat() if row.created_at else "",
        updated_at=row.updated_at.isoformat() if hasattr(row, 'updated_at') and row.updated_at else row.created_at.isoformat() if row.created_at else ""
    )


@router.patch("/{keyword_id}", response_model=KeywordOut)
def update_keyword(
    keyword_id: int,
    body: KeywordUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    keyword = db.get(Keyword, keyword_id)
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(keyword, field, value)
    
    db.add(keyword)
    db.commit()
    db.refresh(keyword)
    
    return KeywordOut(
        id=keyword.id,
        keyword=keyword.keyword,
        category=getattr(keyword, 'category', None),
        site_id=keyword.site_id,
        site_name=keyword.site.name,
        status=getattr(keyword, 'status', 'active'),
        search_volume=getattr(keyword, 'search_volume', None),
        difficulty=getattr(keyword, 'difficulty', None),
        created_at=keyword.created_at.isoformat() if keyword.created_at else "",
        updated_at=keyword.updated_at.isoformat() if hasattr(keyword, 'updated_at') and keyword.updated_at else keyword.created_at.isoformat() if keyword.created_at else ""
    )


@router.delete("/{keyword_id}")
def delete_keyword(
    keyword_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    keyword = db.get(Keyword, keyword_id)
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
    db.delete(keyword)
    db.commit()
    return {"message": "Keyword deleted successfully"}


