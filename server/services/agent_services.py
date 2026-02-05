import hashlib
from datetime import datetime
from models.agent import Agent

def create_agent(db, agent_id: int, user_id: int, agent_secret: bytes) -> Agent:
    secret = hashlib.sha256(agent_secret).digest().decode()

    agent = Agent(id=agent_id, user_id=user_id, secret=secret, created_at=datetime.utcnow(), status=True)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent
