from fastapi import APIRouter, Depends, HTTPException
from database import SessionLocal
from services.auth_service import create_user, check_user_exists

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(data: dict, db = Depends(get_db)) -> dict:
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing fields")

    existing = check_user_exists(db, email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    password_hash = password

    user = create_user(db, email, password_hash)
    return {"status": "ok", "user_id": user.id}

@router.post("/login")
def login(data: dict, db = Depends(get_db)) -> dict:
    email = data.get("email")
    password = data.get("password")

    user = check_user_exists(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.password_hash != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "status": "ok",
        "user_id": user.id
    }