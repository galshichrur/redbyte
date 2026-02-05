import hashlib
from datetime import datetime
from models.agent import Agent

def create_agent(db, agent_id: bytes, user_id: int, agent_secret: bytes) -> Agent:
    agent_secret_hash = hashlib.sha256(agent_secret).digest().decode()

    agent = Agent(agent_id=agent_id, user_id=user_id, secret_hash=agent_secret_hash, created_at=datetime.utcnow(), status=True)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

def validate_agent(db, agent_id: int, agent_secret: bytes):
    agent_secret_hash = hashlib.sha256(agent_secret).digest().decode()
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        return None
    if agent.secret_hash == agent_secret_hash:
        return agent
    return None
