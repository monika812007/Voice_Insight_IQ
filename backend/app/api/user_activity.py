import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_current_user
from app.models import LikedProduct, User, ViewedProduct

router = APIRouter(prefix="/activity", tags=["User Activity"])


@router.get("/likes")
def get_likes(db: Session = Depends(get_db), user: User = Depends(require_current_user)):
    rows = db.query(LikedProduct).filter(LikedProduct.user_id == user.id).order_by(LikedProduct.created_at.desc()).all()
    return {"product_ids": [row.product_id for row in rows]}


@router.post("/likes/{product_id}")
def add_like(product_id: str, db: Session = Depends(get_db), user: User = Depends(require_current_user)):
    row = db.query(LikedProduct).filter(LikedProduct.user_id == user.id, LikedProduct.product_id == product_id).first()
    if not row:
        db.add(LikedProduct(id=f"like_{uuid.uuid4().hex[:12]}", user_id=user.id, product_id=product_id))
        db.commit()
    return {"liked": True, "product_id": product_id}


@router.delete("/likes/{product_id}")
def remove_like(product_id: str, db: Session = Depends(get_db), user: User = Depends(require_current_user)):
    row = db.query(LikedProduct).filter(LikedProduct.user_id == user.id, LikedProduct.product_id == product_id).first()
    if row:
        db.delete(row)
        db.commit()
    return {"liked": False, "product_id": product_id}


@router.post("/views/{product_id}")
def record_view(product_id: str, db: Session = Depends(get_db), user: User = Depends(require_current_user)):
    row = db.query(ViewedProduct).filter(ViewedProduct.user_id == user.id, ViewedProduct.product_id == product_id).first()
    if row:
        row.viewed_at = datetime.utcnow()
    else:
        db.add(ViewedProduct(id=f"view_{uuid.uuid4().hex[:12]}", user_id=user.id, product_id=product_id))
    db.commit()
    return {"recorded": True, "product_id": product_id}


@router.get("/views")
def get_views(db: Session = Depends(get_db), user: User = Depends(require_current_user)):
    rows = db.query(ViewedProduct).filter(ViewedProduct.user_id == user.id).order_by(ViewedProduct.viewed_at.desc()).all()
    return {"product_ids": [row.product_id for row in rows]}