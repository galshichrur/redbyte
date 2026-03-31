import struct
import socket
import json
from typing import Dict, Any

LENGTH_SIZE = 4
MAX_FRAME_LEN = 2 * 1024 * 1024 # 2 MB

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

def recv_message(sock: socket.socket) -> Dict[str, Any]:
    """
    Receive a message and return the message as dict.
    """
    length_bytes = recv_exact(sock, LENGTH_SIZE)
    length = struct.unpack("<I", length_bytes)[0]

    if length < 1 or length > MAX_FRAME_LEN:
        raise ValueError("Invalid frame length")

    payload_bytes = recv_exact(sock, length)

    try:
        payload = json.loads(payload_bytes.decode())
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON payload")

    print(f"Received: {payload}\n")
    return payload

def send_message(sock: socket.socket, payload: Dict[str, Any] | None = None):
    """
    Send a given dict payload as JSON.
    """

    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    length = len(payload_bytes)

    if length > MAX_FRAME_LEN:
        raise ValueError("Payload too large")

    frame = struct.pack("<I", length) + payload_bytes
    print(f"Sent: {payload}\n")
    sock.sendall(frame)