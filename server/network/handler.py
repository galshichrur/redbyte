import os
from database import get_db
from protocol import MessageType, send_message
from services.enrollment_services import verify_enrollment_code

def handle_enroll(sock, payload: bytes):
    token = payload.decode("ascii")
    user = verify_enrollment_code(get_db(), token)

    # Send fail error ENROLL message
    if user is None:
        send_message(sock, MessageType.ENROLL, b'\x00')
        return

    # Send success ENROLL message
    agent_id = os.urandom(8)
    agent_secret = os.urandom(32)

    # status (1 byte) | agent_id (8 bytes) | agent_secret (32 bytes)
    response = b'\x01' + agent_id + agent_secret
    send_message(sock, MessageType.ENROLL, response)

    # Create new endpoint


def handle_auth(sock, payload: bytes):
    agent_id = payload[:8]
    agent_secret = payload[8:]


