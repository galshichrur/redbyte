import base64
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from services.enrollment_services import update_user_enrollment_code
from services.validate_token import get_current_user_id
from services.auth_services import get_user_by_userid
from os import urandom


enrollment_router = APIRouter(prefix="/enrollment", tags=["dashboard"])


@enrollment_router.post("/code")
def create_enrollment_code(user_id: int = Depends(get_current_user_id), db = Depends(get_db)):
    user = get_user_by_userid(db, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate the enrollment token
    token: bytes = urandom(8)
    token_b64: str = base64.urlsafe_b64encode(token).decode().rstrip("=")
    # Save enrollment token to the user table in db
    user = update_user_enrollment_code(db, user, token_b64)

    return {
        "token": token,
        "expires_at": user.enrollment_code_expires_at,
    }
