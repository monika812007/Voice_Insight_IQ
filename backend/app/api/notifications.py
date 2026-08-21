from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import require_current_user
from app.models import User, Notification
from app.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# Demo sample notification fallback for logged in users
DEMO_NOTIFICATIONS = [
    {
        "id": "notif_1",
        "user_id": "demo_user",
        "product_id": "prod_iphone16_128gb",
        "type": "price_drop",
        "message": "Good news! Apple iPhone 16 (128 GB) is now ₹2,000 cheaper on Amazon.",
        "read": False,
        "old_price": 48999,
        "new_price": 46999,
        "platform_name": "Amazon",
        "savings": 2000,
        "created_at": "2026-08-18T10:00:00Z"
    },
    {
        "id": "notif_2",
        "user_id": "demo_user",
        "product_id": "prod_sony_xm5",
        "type": "price_drop",
        "message": "Sony WH-1000XM5 headphones dropped to ₹22,490 on Amazon! (35% OFF)",
        "read": True,
        "old_price": 24990,
        "new_price": 22490,
        "platform_name": "Amazon",
        "savings": 2500,
        "created_at": "2026-08-17T15:30:00Z"
    }
]

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    db_notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    if not db_notifs:
        # Return fallback realistic demo notifications
        return DEMO_NOTIFICATIONS
    return db_notifs

@router.patch("/{notif_id}/read")
def mark_notification_read(
    notif_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"status": "success", "read_id": notif_id}
