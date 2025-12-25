import os
import hashlib
import base64
import hmac
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
def register(email: str, password: str, db = Depends(get_db)) -> dict:
    """
    Register a new user if email doesn't already exist.
    Saves the user into the database with hashed salt and pepper password.
    """
    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing fields")

    existing = check_user_exists(db, email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    salt: bytes = os.urandom(16)
    password_hash: bytes = hashlib.pbkdf2_hmac(
        hash_name="sha256",
        password=password.encode(),
        salt=salt,
        iterations=100000,
    )
    salt_b64 = base64.b64encode(salt).decode()
    hash_b64 = base64.b64encode(password_hash).decode()
    digest = f"pbkdf2_sha256$100000${salt_b64}${hash_b64}"

    user = create_user(db, email, digest)
    return {"status": "ok", "user_id": user.id}

@router.post("/login")
def login(email: str, password: str, db = Depends(get_db)) -> dict:
    """
    Authenticate a user with given email and password.
    """
    user = check_user_exists(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    algo, iterations, salt_b64, hash_b64 = user.password_hash.split("$")
    if algo != "pbkdf2_sha256":
        raise HTTPException(status_code=500, detail="Unsupported hash algorithm")

    salt = base64.b64decode(salt_b64)
    stored_hash = base64.b64decode(hash_b64)

    # Compute input password hash
    computed_hash = hashlib.pbkdf2_hmac(
        hash_name="sha256",
        password=password.encode(),
        salt=salt,
        iterations=int(iterations),
    )

    if not hmac.compare_digest(stored_hash, computed_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "status": "ok",
        "user_id": user.id
    }