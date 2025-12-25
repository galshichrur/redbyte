from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base

class EnrollmentToken(Base):
    __tablename__ = "enrollment_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    token_hash = Column(String, nullable=False)
    expires_at = Column(DateTime)
    used_at = Column(DateTime)
