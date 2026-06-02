import base64
import binascii
import os
from typing import Any
from database import get_db
from models.agent import Agent
from network.crypto import Crypto
from services.agent_services import create_agent, validate_agent
from services.enrollment_services import verify_enrollment_code
from services.event_services import create_event


def handle_enroll(sock, sock_addr: tuple[str, int], payload: dict[str, Any]):
    token = payload.get("token")
    if not isinstance(token, str) or not token:
        Crypto.send_secure(sock, {"type": "ENROLL", "status": False})
        return None

    user = verify_enrollment_code(next(get_db()), token)
    if user is None:
        Crypto.send_secure(sock, {"type": "ENROLL", "status": False})
        return None

    agent_id = os.urandom(8)
    agent_secret = os.urandom(32)

    agent = create_agent(
        db=next(get_db()),
        user_id=user.id,
        agent_id=agent_id,
        agent_secret=agent_secret,
        hostname=payload.get("hostname"),
        os=payload.get("os"),
        local_ip_addr=payload.get("local_ip"),
        public_ip_addr=sock_addr[0],
        port=sock_addr[1],
        mac_addr=payload.get("mac"),
        network_type=payload.get("network_type"),
        username=payload.get("username"),
    )

    Crypto.send_secure(sock, {
        "type": "ENROLL",
        "status": True,
        "agent_id": base64.b64encode(agent_id).decode("ascii"),
        "agent_secret": base64.b64encode(agent_secret).decode("ascii"),
    })

    print("Agent successfully enrolled.")
    return agent


def handle_auth(sock, sock_addr: tuple[str, int], payload: dict[str, Any]):
    agent_id_b64 = payload.get("agent_id")
    agent_secret_b64 = payload.get("agent_secret")

    if not isinstance(agent_id_b64, str) or not isinstance(agent_secret_b64, str):
        Crypto.send_secure(sock, {"type": "AUTH", "status": False})
        return None

    try:
        agent_id = base64.b64decode(agent_id_b64, validate=True)
        agent_secret = base64.b64decode(agent_secret_b64, validate=True)
    except (binascii.Error, ValueError):
        Crypto.send_secure(sock, {"type": "AUTH", "status": False})
        return None

    agent = validate_agent(
        db=next(get_db()),
        agent_id=agent_id,
        agent_secret=agent_secret,
        hostname=payload.get("hostname"),
        os=payload.get("os"),
        local_ip_addr=payload.get("local_ip"),
        public_ip_addr=sock_addr[0],
        port=sock_addr[1],
        mac_addr=payload.get("mac"),
        network_type=payload.get("network_type"),
        username=payload.get("username"),
    )

    Crypto.send_secure(sock, {"type": "AUTH", "status": agent is not None})
    return agent


def handle_alert(agent: Agent, payload: dict[str, Any]):
    return create_event(
        db=next(get_db()),
        user_id=agent.user_id,
        agent_id=agent.agent_id,
        event_type=payload.get("event_type"),
        name=payload.get("name"),
        severity=payload.get("severity"),
        description=payload.get("description"),
        is_blocked=payload.get("is_blocked"),
        suspected_ip=payload.get("suspected_ip"),
        detected_at=payload.get("detected_at"),
    )
