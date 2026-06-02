import socket
import threading
from config import Config
from database import get_db
from network.crypto import Crypto
from network.handler import handle_alert, handle_auth, handle_enroll
from services.agent_services import update_agent_status


class TCPServer:
    def __init__(self, host=Config.TCP_SERVER_HOST, port=Config.TCP_SERVER_PORT):
        self.host = host
        self.port = port
        self.socket: socket.socket | None = None
        self.is_running = False
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
        self.is_running = True

        print(f"Server started at {self.host}:{self.port}")

        self.accept_thread = threading.Thread(target=self._accept_new_connections, daemon=True)
        self.accept_thread.start()

    def stop_server(self) -> None:
        if not self.is_running:
            print("Server is not running.")
            return

        self.is_running = False

        if self.socket is not None:
            self.socket.close()
            self.socket = None

        with self.lock:
            threads = list(self.client_threads)

        for client_thread in threads:
            client_thread.join(timeout=1)

        print("Server stopped.")

    def _accept_new_connections(self) -> None:
        while self.is_running:
            try:
                if self.socket is None:
                    break
                client_sock, client_addr = self.socket.accept()
            except OSError:
                break

            client_thread = threading.Thread(
                target=self._handle_client,
                args=(client_sock, client_addr),
                daemon=True,
            )

            with self.lock:
                self.client_threads.add(client_thread)

            client_thread.start()

    def _handle_client(self, client_sock: socket.socket, client_addr: tuple[str, int]) -> None:
        print(f"Client connected from {client_addr[0]}:{client_addr[1]}")
        agent = None

        try:
            Crypto.start_secure_session(client_sock)

            first_payload = Crypto.recv_secure(client_sock)
            msg_type = first_payload.get("type")

            if msg_type == "ENROLL":
                agent = handle_enroll(client_sock, client_addr, first_payload)
            elif msg_type == "AUTH":
                agent = handle_auth(client_sock, client_addr, first_payload)
            else:
                print(f"Invalid first message type: {msg_type}")
                return

            if agent is None:
                print(f"Authentication failed for {client_addr[0]}:{client_addr[1]}")
                return

            print(f"Connection established with agent {agent.id}.")

            while self.is_running:
                try:
                    payload = Crypto.recv_secure(client_sock)
                except ConnectionError:
                    break
                except Exception as exc:
                    print(f"Secure connection failed for agent {agent.id}: {exc}")
                    break

                msg_type = payload.get("type")
                if msg_type == "ALERT":
                    handle_alert(agent, payload)
                elif msg_type == "TERMINATE":
                    print(f"Client {agent.id} terminated the connection.")
                    break
                else:
                    print(f"Unknown message type from agent {agent.id}: {msg_type}")

        except Exception as exc:
            print(f"Client setup failed from {client_addr[0]}:{client_addr[1]}: {exc}")

        finally:
            Crypto.close_secure_session(client_sock)

            if agent is not None:
                update_agent_status(next(get_db()), agent.id, False)

            try:
                client_sock.close()
            except OSError:
                pass

            print(f"Client disconnected from {client_addr[0]}:{client_addr[1]}")

            with self.lock:
                self.client_threads.discard(threading.current_thread())
