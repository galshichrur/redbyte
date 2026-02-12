import socket
import threading
from network.handler import handle_enroll, handle_auth, handle_alert
from network.protocol import recv_message, MessageType
from services.agent_services import update_agent_status
from config import Config
from database import get_db


class TCPServer:
    def __init__(self, host = Config.TCP_SERVER_HOST, port = Config.TCP_SERVER_PORT):
        self.host = host
        self.port = port
        self.socket: socket.socket | None = None
        self.is_running: bool = False
        self.accept_thread: threading.Thread | None = None
        self.client_threads: set[threading.Thread] = set()
        self.lock = threading.Lock()

    def start_server(self) -> None:
        if self.is_running:
            print("Server is already running.")
            return

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((self.host, self.port))
        self.socket.listen()
        self.socket.settimeout(1.0)
        self.is_running = True
        print(f"Server started at {self.host}:{self.port}")

        # Accept new connections in separate thread
        self.accept_thread = threading.Thread(target=self._accept_new_connections, daemon=True)
        self.accept_thread.start()

    def stop_server(self) -> None:
        if not self.is_running:
            print("Server is not running.")
            return

        if not self.socket:
            print("Server socket not found.")
            return

        self.socket.close()
        self.is_running = False
        self.socket = None

        with self.lock:
            for client_thread in self.client_threads:
                client_thread.join(timeout=1)

        print("Server stopped.")

    def _accept_new_connections(self) -> None:
        while self.is_running:
            client_sock, client_addr = self.socket.accept()
            client_thread = threading.Thread(target=self._handle_client, args=(client_sock, client_addr), daemon=True)

            with self.lock:
                self.client_threads.add(client_thread)

            client_thread.start()

    def _handle_client(self, client_sock: socket.socket, client_addr: tuple[str, int]) -> None:
        print(f"Client connected from {client_addr[0]}:{client_addr[1]}")

        agent = None

        try:
            # Handshake phase, only ENROLL or AUTH messages allowed.
            msg_type, payload = recv_message(client_sock)

            if msg_type == MessageType.ENROLL:
                agent = handle_enroll(client_sock, client_addr, payload)

            elif msg_type == MessageType.AUTH:
                agent = handle_auth(client_sock, client_addr, payload)

            else:
                print("Invalid connection establish message type: ", msg_type)
                return  # Close connection

            if not agent:
                print(f"Authentication failed for {client_addr}")
                return  # Close connection

            print(f"Connection established with agent {agent.id}.")

            # Enrolled connection phase
            while self.is_running:
                try:
                    msg_type, payload = recv_message(client_sock)
                except ConnectionResetError:
                    break  # Client disconnected forcefully

                if not msg_type:
                        break  # Client close connection (empty message)

                if msg_type == MessageType.ALERT:
                    handle_alert(client_sock, client_addr, agent, payload)
                elif msg_type == MessageType.TERMINATE:
                    print(f"Client {agent.id} terminated the connection.")
                    break
                else:
                    print(f"Unknown message type receive from agent {agent.id}. Received: {msg_type}")

        except Exception as e:
            print(e)

        finally:
            if agent:
                update_agent_status(next(get_db()), agent.id, False)

            # Close client connection
            client_sock.close()
            print(f"Client disconnected from {client_addr[0]}:{client_addr[1]}")

            with self.lock:
                self.client_threads.discard(threading.current_thread())