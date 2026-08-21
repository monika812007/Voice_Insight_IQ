from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Platform

router = APIRouter(prefix="/stores", tags=["Stores"])


@router.get("")
async def get_stores(db: Session = Depends(get_db)):
    stores = db.query(Platform).all()
    return {
        "success": True,
        "data": [
            {
                "id": store.id,
                "name": store.name,
                "logo": store.logo_url,
                "website": store.base_url,
                "active": store.status == "active",
            }
            for store in stores
        ],
    }
