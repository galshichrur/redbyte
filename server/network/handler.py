import os
from database import get_db
from models import Agent
from network.protocol import MessageType, send_message
from services.enrollment_services import verify_enrollment_code
from services.agent_services import create_agent, validate_agent

def handle_enroll(sock, payload: bytes) -> Agent | None:
    token = payload.decode("ascii")
    user = verify_enrollment_code(get_db(), token)

    # Send fail error ENROLL message
    if user is None:
        send_message(sock, MessageType.ENROLL, b'\x00')
        return None

    # Send success ENROLL message
    agent_id = os.urandom(8)
    agent_secret = os.urandom(32)

    agent = create_agent(get_db(), int(agent_id), user.id, agent_secret)

    # status (1 byte) | agent_id (8 bytes) | agent_secret (32 bytes)
    response = b'\x01' + agent_id + agent_secret
    send_message(sock, MessageType.ENROLL, response)

    return agent

def handle_auth(sock, payload: bytes):
    agent_id = int(payload[:8])
    agent_secret = payload[8:]

    agent = validate_agent(get_db(), agent_id, agent_secret)

    if agent is None:
        send_message(sock, MessageType.AUTH, b'\x00')
    else:
        send_message(sock, MessageType.AUTH, b'\x01')

    return agent