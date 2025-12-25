from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base

class EndpointAuth(Base):
    __tablename__ = "endpoint_auth"

    endpoint_id = Column(Integer, ForeignKey("endpoints.id"), primary_key=True)
    secret_hash = Column(String, nullable=False)
    created_at = Column(DateTime)
