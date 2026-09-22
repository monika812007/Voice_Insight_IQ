import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    # If using relative SQLite path, ensure it resolves to where voice_insight_iq.db actually lives
    backend_dir = Path(__file__).resolve().parent.parent.parent
    db_file = backend_dir / "voice_insight_iq.db"
    if db_url in ("sqlite:///./voice_insight_iq.db", "sqlite:///voice_insight_iq.db") and db_file.exists():
        db_url = f"sqlite:///{db_file.as_posix()}"

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
