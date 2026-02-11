import hashlib
from datetime import datetime, UTC
from models.agent import Agent
from api.ws_manager import ws_manager
from api.ws import agent_to_dict


def create_agent(db, user_id: int, agent_id: bytes, agent_secret: bytes, hostname: str, os: str,
                 local_ip_addr: str, public_ip_addr: str, port: int, mac_addr: str) -> Agent:
    agent_secret_hash = hashlib.sha256(agent_secret).digest()

    agent = Agent(
        user_id=user_id,
        agent_id=agent_id,
        secret_hash=agent_secret_hash,
        secret_created_at=datetime.now(UTC),

        status=True,
        hostname=hostname,
        os=os,
        local_ip_addr=local_ip_addr,
        public_ip_addr=public_ip_addr,
        port=port,
        mac_addr=mac_addr,

        connected_at=datetime.now(UTC),
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)

    ws_manager.notify(agent.user_id, {
        "type": "agent_created",
        "agent": agent_to_dict(agent),
    })

    return agent


def validate_agent(db, agent_id: bytes, agent_secret: bytes, hostname: str, os: str,
                 local_ip_addr: str, public_ip_addr: str, port: int, mac_addr: str):
    agent_secret_hash = hashlib.sha256(agent_secret).digest()
    agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
    if not agent:
        return None
    if agent.secret_hash != agent_secret_hash:
        return None

    agent.status = True
    agent.hostname = hostname
    agent.os = os
    agent.local_ip_addr = local_ip_addr
    agent.public_ip_addr = public_ip_addr
    agent.port = port
    agent.mac_addr = mac_addr
    agent.connected_at = datetime.now(UTC)

    db.commit()
    db.refresh(agent)

    ws_manager.notify(agent.user_id, {
        "type": "agent_updated",
        "agent_id": agent.id,
        "fields": agent_to_dict(agent),
    })

    return agent


def update_agent_status(db, primary_id: int, status: bool) -> bool:
    agent = db.query(Agent).filter(Agent.id == primary_id).first()
    if not agent:
        return False
    agent.status = status
    if not status:
        agent.disconnected_at = datetime.now(UTC)
    else:
        agent.connected_at = datetime.now(UTC)

    db.commit()
    db.refresh(agent)

    ws_manager.notify(agent.user_id, {
        "type": "agent_updated",
        "agent_id": agent.id,
        "fields": agent_to_dict(agent),
    })

    return True