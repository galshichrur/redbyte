from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Endpoint(Base):
    __tablename__ = "endpoints"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    secret_hash = Column(String, nullable=False)
    secret_created_at = Column(DateTime)

    status = Column(String, default="offline")
    hostname = Column(String)
    os = Column(String)
    local_ip_address = Column(String)
    public_ip_address = Column(String)
    port = Column(Integer)

    first_seen = Column(DateTime, server_default=func.now())
    last_seen = Column(DateTime)
