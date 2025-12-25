from fastapi import APIRouter, Depends, HTTPException
from database import SessionLocal
from services.auth_service import create_user, get_user_by_email

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(data: dict, db = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing fields")

    existing = get_user_by_email(db, email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    password_hash = password

    user = create_user(db, email, password_hash)
    return {"status": "ok", "user_id": user.id}
