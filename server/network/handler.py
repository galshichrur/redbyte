import base64
import os
from typing import Any, Dict
from database import get_db
from network.protocol import MessageType, send_message
from services.enrollment_services import verify_enrollment_code
from services.agent_services import create_agent, validate_agent

def handle_enroll(sock, sock_addr: tuple[str, int], payload: Dict[str, Any]):
    token: str = payload.get("token")
    if token is None:
        return None

    user = verify_enrollment_code(next(get_db()), token)

    # Send fail error ENROLL message
    if user is None:
        fail_enroll_response = {
            "status": False
        }
        send_message(sock, MessageType.ENROLL, fail_enroll_response)
        return None

    # Generate agent credentials
    agent_id: bytes = os.urandom(8)
    agent_secret: bytes = os.urandom(32)

    agent = create_agent(
        db=next(get_db()),
        user_id=user.id,
        agent_id=agent_id,
        agent_secret=agent_secret,
        hostname=payload.get("hostname"),
        os=payload.get("os"),
        local_ip_addr=payload.get("ip"),
        public_ip_addr=sock_addr[0],
        port=sock_addr[1],
        mac_addr=payload.get("mac")
    )

    # Encode to base64 format for sending in JSON
    agent_id_b64: str = base64.b64encode(agent_id).decode()
    agent_secret_b64: str = base64.b64encode(agent_secret).decode()

    # Send success ENROLL message
    success_enroll_response = {
        "status": True,
        "agent_id": agent_id_b64,
        "agent_secret": agent_secret_b64,
    }
    send_message(sock, MessageType.ENROLL, success_enroll_response)
    print("User successfully enrolled.")
    return agent

def handle_auth(sock, sock_addr: tuple[str, int], payload: Dict[str, Any]):
    agent_id_b64 = payload.get("agent_id")
    agent_secret_b64 = payload.get("agent_secret")

    if agent_id_b64 is None or agent_secret_b64 is None:
        return None

    agent_id = base64.b64decode(agent_id_b64)
    agent_secret = base64.b64decode(agent_secret_b64)

    agent = validate_agent(
        db = next(get_db()),
        agent_id = agent_id,
        agent_secret = agent_secret,
        hostname = payload.get("hostname"),
        os = payload.get("os"),
        local_ip_addr = payload.get("ip"),
        public_ip_addr = sock_addr[0],
        port = sock_addr[1],
        mac_addr = payload.get("mac")
    )

    if agent is None:
        fail_auth_response = {
            "status": False,
        }
        send_message(sock, MessageType.AUTH, fail_auth_response)
    else:
        success_auth_response = {
            "status": True,
        }
        send_message(sock, MessageType.AUTH, success_auth_response)

    return agent