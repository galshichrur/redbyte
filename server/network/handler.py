import os
from typing import Any, Dict
from database import get_db
from network.protocol import MessageType, send_message
from services.enrollment_services import verify_enrollment_code
from services.agent_services import create_agent, validate_agent

def handle_enroll(sock, payload: Dict[str, Any]):
    token: str = payload.get("token")
    if token is None:
        return None

    user = verify_enrollment_code(next(get_db()), token)

    # Send fail error ENROLL message
    if user is None:
        print("User not found, invalid token: ", token)
        fail_enroll_response = {
            "status": False
        }
        send_message(sock, MessageType.ENROLL, fail_enroll_response)
        return None

    agent_id = os.urandom(8)
    agent_secret = os.urandom(32)

    agent = create_agent(next(get_db()), agent_id, user.id, agent_secret)

    # Send success ENROLL message
    success_enroll_response = {
        "status": True,
        "agent_id": agent_id,
        "agent_secret": agent_secret,
    }
    send_message(sock, MessageType.ENROLL, success_enroll_response)
    print("User successfully enrolled.")
    return agent

def handle_auth(sock, payload: Dict[str, Any]):
    agent_id = payload.get("agent_id")
    agent_secret = payload.get("agent_secret")

    if agent_id is None or agent_secret is None:
        return None

    agent = validate_agent(next(get_db()), agent_id, agent_secret)

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