from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user, require_current_user
from app.models import User
from app.schemas import UserCreate, UserLogin, Token, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")

    new_user = User(
        id=f"user_{uuid.uuid4().hex[:10]}",
        name=user_in.name,
        email=user_in.email.lower(),
        password_hash=get_password_hash(user_in.password),
        preferences={}
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(subject=new_user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully."}

@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(require_current_user)):
    return user
