import struct
import socket
import json
from enum import IntEnum
from typing import Tuple, Dict, Any

LENGTH_SIZE = 4
TYPE_SIZE = 1
HEADER_SIZE = LENGTH_SIZE + TYPE_SIZE
MAX_FRAME_LEN = 2 * 1024 * 1024  # 2MB safety cap
HEADER = struct.Struct("<IB")

class MessageType(IntEnum):
    ENROLL    = 0x01
    AUTH      = 0x02
    HEARTBEAT = 0x03
    ALERT     = 0x04
    COMMAND   = 0x05
    TERMINATE = 0x06

def recv_exact(sock: socket.socket, size: int) -> bytes:
    """Receive exactly the given size bytes from the given socket."""
    data = b''
    if size <= 0:
        return b''
    while len(data) < size:
        chunk = sock.recv(size - len(data))
        if not chunk:
            raise ConnectionError("Socket closed")
        data += chunk
    return data

def recv_message(sock: socket.socket) -> Tuple[MessageType, Dict[str, Any]]:
    """
    Receive a message and return: (MessageType, payload) as dict
    """
    # Receive length header
    header = recv_exact(sock, HEADER.size)
    length, msg_type = HEADER.unpack(header)

    if length < 1 or length > MAX_FRAME_LEN:
        raise ValueError("Invalid frame length")

    # Receive payload
    payload_bytes = recv_exact(sock, length - 1)
    # Parse to json
    try:
        payload = json.loads(payload_bytes.decode())
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON payload")

    return MessageType(msg_type), payload

def send_message(sock: socket.socket, msg_type: MessageType, payload: Dict[str, Any] | None = None):
    """
    Send a message with JSON payload.
    """

    if payload is None:
        payload = {}

    # Dump to json and encode to bytes
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    length = 1 + len(payload_bytes)

    if length > MAX_FRAME_LEN:
        raise ValueError("Payload too large")

    frame = HEADER.pack(length, msg_type) + payload_bytes
    sock.sendall(frame)