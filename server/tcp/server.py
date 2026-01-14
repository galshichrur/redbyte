import socket
import threading
from config import Config


class Server:
    def __init__(self):
        self.socket: socket.socket | None = None
        self.is_running: bool = False
        self.server_thread: threading.Thread | None = None

    def start(self, host = Config.TCP_SERVER_HOST, port = Config.TCP_SERVER_PORT) -> None:
        if self.is_running:
            print("Server is already running.")
            return

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((host, port))
        self.socket.listen()
        self.is_running = True
        print(f"Server started at {host}:{port}")

        # Accept new connection in separate thread
        # self.server_thread = threading.Thread(target=)
        # self.server_thread.daemon = True
        # self.server_thread.start()

    def stop(self) -> None:
        if not self.is_running:
            print("Server is not running.")
            return

        if not self.socket:
            return

        self.socket.close()
        self.is_running = False
        self.socket = None
        print("Server stopped.")

    def accept_new_connections(self) -> None:

        while self.is_running:
