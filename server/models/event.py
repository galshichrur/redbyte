
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)

    type = Column(String)
    name = Column(String)
    severity = Column(Integer)
    description = Column(String)
    is_blocked = Column(Boolean)
    suspected_ip = Column(String)

    detected_at = Column(DateTime, nullable=False)
    received_at = Column(DateTime, server_default=func.now())
