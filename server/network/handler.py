import os
from database import get_db
from models import Agent
from network.protocol import MessageType, send_message
from services.enrollment_services import verify_enrollment_code
from services.agent_services import create_agent, validate_agent

def handle_enroll(sock, payload: bytes):
    try:
        token = payload.decode()
    except Exception as e:
        print(e)
        return None

    user = verify_enrollment_code(next(get_db()), token)

    # Send fail error ENROLL message
    if user is None:
        print("User not found, invalid token: ", token)
        send_message(sock, MessageType.ENROLL, b'\x00')
        return None

    # Send success ENROLL message
    agent_id = os.urandom(8)
    agent_secret = os.urandom(32)

    agent = create_agent(next(get_db()), agent_id, user.id, agent_secret)

    # status (1 byte) | agent_id (8 bytes) | agent_secret (32 bytes)
    response = b'\x01' + agent_id + agent_secret
    send_message(sock, MessageType.ENROLL, response)
    print("User successfully enrolled.")
    return agent

def handle_auth(sock, payload: bytes):
    agent_id = payload[:8]
    agent_secret = payload[8:]

    agent = validate_agent(next(get_db()), agent_id, agent_secret)

    if agent is None:
        send_message(sock, MessageType.AUTH, b'\x00')
    else:
        send_message(sock, MessageType.AUTH, b'\x01')

    return agent