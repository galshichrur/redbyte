import hashlib
import base64
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from services.endpoints_services import create_enrollment_token
from services.validate_token import get_current_user_id
from services.auth_services import get_user_by_userid
from os import urandom


enrollment_router = APIRouter(prefix="/enrollment", tags=["dashboard"])


@enrollment_router.post("/code")
def create_enrollment_code(user_id: int = Depends(get_current_user_id), db = Depends(get_db)):
    user = get_user_by_userid(db, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    token = base64.urlsafe_b64encode(urandom(8)).decode().rstrip("=")  # 64 bit
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    enrollment_token = create_enrollment_token(db, user_id, token_hash)

    return {
        "token": token,
        "expires_at": enrollment_token.expires_at,
    }