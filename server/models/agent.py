from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, LargeBinary
from sqlalchemy.sql import func
from database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Credentials
    agent_id = Column(LargeBinary(8), unique=True, nullable=False)
    secret_hash = Column(LargeBinary(32), nullable=False)
    secret_created_at = Column(DateTime)

    # Status
    status = Column(Boolean, default=False, nullable=False)

    # Agen machine info
    hostname = Column(String)
    os = Column(String)
    local_ip_address = Column(String)
    public_ip_address = Column(String)  # from TCP connection
    port = Column(Integer)  # from TCP connection
    mac_address = Column(String)

    # Connectivity
    first_seen = Column(DateTime, server_default=func.now())
    connected_at = Column(DateTime)
    disconnected_at = Column(DateTime)

    # Security
    risk_score = Column(Integer, default=0)
    under_attack = Column(Boolean, default=False)

