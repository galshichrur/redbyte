import hashlib
from datetime import datetime
from models.agent import Agent


def create_agent(db, user_id: int, agent_id: bytes, agent_secret: bytes, hostname: str, os: str, os_version: str,
                 local_ip_addr: str, public_ip_addr: str, port: int, mac_addr: str) -> Agent:
    agent_secret_hash = hashlib.sha256(agent_secret).digest()

    agent = Agent(
        user_id=user_id,
        agent_id=agent_id,
        secret_hash=agent_secret_hash,
        secret_created_at=datetime.utcnow(),

        status=True,
        hostname=hostname,
        os=os,
        os_version=os_version,
        local_ip_addr=local_ip_addr,
        public_ip_addr=public_ip_addr,
        port=port,
        mac_address=mac_addr,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


def validate_agent(db, agent_id: bytes, agent_secret: bytes, hostname: str, os: str, os_version: str,
                 local_ip_addr: str, public_ip_addr: str, port: int, mac_addr: str):
    agent_secret_hash = hashlib.sha256(agent_secret).digest()
    agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
    if not agent:
        return None
    if agent.secret_hash != agent_secret_hash:
        return None

    # Update agent info
    agent.status = True
    agent.hostname = hostname
    agent.os = os
    agent.os_version = os_version
    agent.local_ip_addr = local_ip_addr
    agent.public_ip_addr = public_ip_addr
    agent.port = port
    agent.mac_address = mac_addr
    db.commit()
    db.refresh(agent)

    return agent

def update_agent_status(db, primary_id: int, status: bool) -> bool:
    agent = db.query(Agent).filter(Agent.id == primary_id).first()
    if not agent:
        return False
    agent.status = status
    db.commit()
    db.refresh(agent)
    return True