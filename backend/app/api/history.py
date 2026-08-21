from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import require_current_user
from app.models import User, SearchHistory
from app.schemas import SearchHistoryOut

router = APIRouter(prefix="/history", tags=["Search History"])

@router.get("", response_model=List[SearchHistoryOut])
def get_user_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    db_history = db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).order_by(SearchHistory.created_at.desc()).all()
    return db_history

@router.delete("/{history_id}")
def delete_history_item(
    history_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    sh = db.query(SearchHistory).filter(SearchHistory.id == history_id, SearchHistory.user_id == current_user.id).first()
    if sh:
        db.delete(sh)
        db.commit()
    return {"message": "History item removed successfully."}
