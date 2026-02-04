import socket
import threading
from protocol import recv_message, MessageType
from config import Config


class TCPServer:
    def __init__(self, host = Config.TCP_SERVER_HOST, port = Config.TCP_SERVER_PORT):
        self.host = host
        self.port = port
        self.socket: socket.socket | None = None
        self.is_running: bool = False
        self.accept_thread: threading.Thread | None = None

    def start(self) -> None:
        if self.is_running:
            print("Server is already running.")
            return

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((self.host, self.port))
        self.socket.listen()
        self.is_running = True
        print(f"Server started at {self.host}:{self.port}")

        # Accept new connection in separate thread
        self.accept_thread = threading.Thread(target=, daemon=True)
        self.accept_thread.start()

    def stop(self) -> None:
        if not self.is_running:
            print("Server is not running.")
            return

        if not self.socket:
            print("Server socket not found.")
            return

        self.socket.close()
        self.is_running = False
        self.socket = None
        print("Server stopped.")
