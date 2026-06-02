import socket
import struct

LENGTH_SIZE = 4
MAX_FRAME_LEN = 2 * 1024 * 1024  # 2 MB


def recv_exact(sock: socket.socket, size: int) -> bytes:
    """Receive exactly size bytes from a TCP socket."""
    if size < 0:
        raise ValueError("size cannot be negative")

    data = bytearray()
    while len(data) < size:
        chunk = sock.recv(size - len(data))
        if not chunk:
            raise ConnectionError("Socket closed")
        data.extend(chunk)

    return bytes(data)


def recv_frame(sock: socket.socket) -> bytes:
    """Receive one length-prefixed binary frame: length(4 LE) | body."""
    length_bytes = recv_exact(sock, LENGTH_SIZE)
    length = struct.unpack("<I", length_bytes)[0]

    if length < 1 or length > MAX_FRAME_LEN:
        raise ValueError(f"Invalid frame length: {length}")

    return recv_exact(sock, length)


def send_frame(sock: socket.socket, body: bytes) -> None:
    """Send one length-prefixed binary frame: length(4 LE) | body."""
    if not body:
        raise ValueError("Frame body cannot be empty")

    if len(body) > MAX_FRAME_LEN:
        raise ValueError("Frame body too large")

    sock.sendall(struct.pack("<I", len(body)) + body)
