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


def get_enrollment_token(db, user_id: int):
    return db.query(EnrollmentToken).filter(EnrollmentToken.user_id == user_id).first()


def check_enrollment_token_exists(db, token_hash: str):
    return db.query(EnrollmentToken).filter(EnrollmentToken.token_hash == token_hash).first()


def verify_enrollment_token(db, token: str):
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    enrollment_token = check_enrollment_token_exists(db, token_hash)
    if enrollment_token is not None:
        db.remove(enrollment_token)
        db.commit()
        return True

    return False

