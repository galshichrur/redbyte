from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, LargeBinary
from sqlalchemy.sql import func
from database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    agent_id = Column(LargeBinary(8), unique=True, nullable=False)
    secret_hash = Column(LargeBinary(32), nullable=False)
    secret_created_at = Column(DateTime)

    status = Column(Boolean, default=False, nullable=False)
    hostname = Column(String)
    os = Column(String)
    local_ip_address = Column(String)
    public_ip_address = Column(String)
    port = Column(Integer)

    first_seen = Column(DateTime, server_default=func.now())
    last_seen = Column(DateTime)
