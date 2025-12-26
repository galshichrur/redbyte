from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.enrollment_token import EnrollmentToken
from services.validate_token import get_current_user_id
from services.auth_services import get_user_by_userid

router = APIRouter(prefix="/enrollment", tags=["dashboard"])


@router.post("/code")
def create_enrollment_code(user_id: int = Depends(get_current_user_id), db = Depends(get_db)):
    user = get_user_by_userid(db, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

