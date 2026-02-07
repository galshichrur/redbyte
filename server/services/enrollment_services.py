import hashlib
from datetime import datetime, timezone, timedelta
from models.user import User
from config import Config


def update_user_enrollment_code(db, user: User, token_b64: str) -> User:
    token_hash = hashlib.sha256(token_b64.encode()).hexdigest()
    user.enrollment_code_hash = token_hash
    user.enrollment_code_expires_at = datetime.now(timezone.utc) + timedelta(seconds=Config.ENROLLMENT_TOKEN_EXPIRE_SECONDS)
    db.commit()
    db.refresh(user)
    return user


def verify_enrollment_code(db, token_b64: str):
    token_hash = hashlib.sha256(token_b64.encode()).hexdigest()
    now = datetime.now(timezone.utc)

    user = db.query(User).filter(
        User.enrollment_code_hash == token_hash,
        User.enrollment_code_expires_at > now
    ).one_or_none()

    if user is None:
        return None

    # Reset user enrollment code
    user.enrollment_code_hash = None
    user.enrollment_code_expires_at = None

    db.commit()
    db.refresh(user)
    return user
