from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
import uuid
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, SearchHistory
from app.services.search_service import search_service
from app.schemas import SearchQueryRequest, SearchQueryResponse

router = APIRouter(prefix="", tags=["Search"])


class ProductUrlRequest(BaseModel):
    provider_product_token: str
    merchant: str

def _record_search_history(db: Session, user: Optional[User], query: str, search_type: str):
    sh = SearchHistory(
        id=f"sh_{uuid.uuid4().hex[:10]}",
        user_id=user.id if user else None,
        query=query,
        search_type=search_type,
    )
    db.add(sh)
    db.commit()

@router.post("/search")
async def text_search(
    req: SearchQueryRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    
    res = await search_service.process_text_search(req.query, db=db, page=req.page)
    _record_search_history(db, current_user, req.query, "text")
    return res

@router.get("/search")
async def text_search_get(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    res = await search_service.process_text_search(q, db=db, page=page)
    _record_search_history(db, current_user, q, "text")
    return res

@router.get("/search/suggestions")
async def search_suggestions(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    return {"query": q, "suggestions": await search_service.get_suggestions(q, db=db)}


@router.post("/search/resolve-product-url")
async def resolve_product_url(req: ProductUrlRequest, db: Session = Depends(get_db)):
    product_url = await search_service.resolve_external_product_url(
        req.provider_product_token,
        req.merchant,
        db=db,
    )
    return {"product_url": product_url}

@router.post("/search/voice")
async def voice_search(
    req: SearchQueryRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    res = await search_service.process_voice_search(req.query, db=db)
    _record_search_history(db, current_user, req.query, "voice")
    return res

@router.post("/search/url")
async def url_search(
    req: SearchQueryRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    res = await search_service.process_url_search(req.query, db=db)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    _record_search_history(db, current_user, req.query, "url")
    return res

@router.post("/search/image")
async def image_search(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    contents = await file.read()
    res = await search_service.process_image_search(file.filename, contents, db=db)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    _record_search_history(db, current_user, f"Image Upload: {file.filename}", "image")
    return res
