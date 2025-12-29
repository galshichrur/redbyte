from jose import jwt
from datetime import datetime, timedelta, timezone
from config import Config


def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(seconds=Config.JWT_EXPIRE_SECONDS)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)
