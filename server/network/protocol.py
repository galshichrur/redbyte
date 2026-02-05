import struct
import socket
from enum import IntEnum

LENGTH_SIZE = 4
TYPE_SIZE = 1
HEADER_SIZE = LENGTH_SIZE + TYPE_SIZE
MAX_FRAME_LEN = 2 * 1024 * 1024  # 2MB safety cap

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

def recv_message(sock: socket.socket) -> tuple[MessageType, bytes]:
    # Read length
    raw_len = recv_exact(sock, LENGTH_SIZE)
    (msg_length, ) = struct.unpack("<I", raw_len)

    # Read message type
    msg_type = recv_exact(sock, TYPE_SIZE)[0]

    # Read payload
    payload_size = msg_length - 1
    payload = recv_exact(sock, payload_size)

    return MessageType(msg_type), payload

def send_message(sock: socket.socket, msg_type: MessageType, payload: bytes = b''):
    length = 1 + len(payload)
    sock.sendall(struct.pack("<I", length))
    sock.sendall(struct.pack("B", msg_type))
    if payload:
        sock.sendall(payload)