import hashlib
from datetime import datetime, timezone, timedelta
from models.enrollment_token import EnrollmentToken
from config import Config

def create_enrollment_token(db, user_id: int, token_hash: str) -> EnrollmentToken:
    enrollment_token = EnrollmentToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=(datetime.now(timezone.utc) + timedelta(Config.ENROLLMENT_TOKEN_EXPIRE_SECONDS))
    )
    db.add(enrollment_token)
    db.commit()
    db.add(enrollment_token)
    db.commit()
    db.refresh(enrollment_token)
    return enrollment_token

#
# def verify_token(db, token: str):
#     token_hash = hashlib.sha256(token.encode()).hexdigest()
#
#     return get_valid_token(db, token_hash)
