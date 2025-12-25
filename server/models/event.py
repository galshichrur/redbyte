from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    endpoint_id = Column(Integer, ForeignKey("endpoints.id"), nullable=False)

    type = Column(String)
    severity = Column(String)
    payload = Column(JSON)

    created_at = Column(DateTime, server_default=func.now())
