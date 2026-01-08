import socket
from config import Config


class Server:
    def __init__(self):
        self.socket: socket.socket | None = None
        self.is_running: bool = False

    def start(self, host = Config.TCP_SERVER_HOST, port = Config.TCP_SERVER_PORT):

        if self.is_running:
            print("Server is already running")
            return

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((host, port))
        self.socket.listen()
