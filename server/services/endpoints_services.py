import hashlib
from datetime import datetime, timezone, timedelta
from models.user import User
from config import Config


def update_user_enrollment_code(db, user: User, token: str) -> User:
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    user.enrollment_code_hash = token_hash
    user.enrollment_code_expires_at = datetime.now(timezone.utc) + timedelta(seconds=Config.ENROLLMENT_TOKEN_EXPIRE_SECONDS)
    db.commit()
    db.refresh(user)
    return user


# def verify_enrollment_token(db, token: str):
#     token_hash = hashlib.sha256(token.encode()).hexdigest()
#
#     enrollment_token = check_enrollment_token_exists(db, token_hash)
#     if (enrollment_token is not None) and (enrollment_token.expires_at > datetime.now(timezone.utc)):
#         db.remove(enrollment_token)
#         db.commit()
#         return True
#
#     return False

