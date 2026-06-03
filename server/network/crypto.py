import json
import os
import socket
from typing import Any
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from network.protocol import MAX_FRAME_LEN, recv_exact, recv_frame, send_frame

class Crypto:
    NONCE_SIZE = 12
    TAG_SIZE = 16
    PUBLIC_KEY_SIZE = 32
    KEY_SIZE = 32
    MIN_ENCRYPTED_BODY_SIZE = NONCE_SIZE + TAG_SIZE

    _keys: dict[socket.socket, bytes] = {}

    @staticmethod
    def start_secure_session(sock: socket.socket) -> None:
        client_public_key = Crypto._recv_public_key(sock)

        server_private_key = x25519.X25519PrivateKey.generate()
        server_public_key = server_private_key.public_key().public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw,
        )

        shared_secret = server_private_key.exchange(client_public_key)
        Crypto._keys[sock] = Crypto._derive_aes_key(shared_secret)
        sock.sendall(server_public_key)

    @staticmethod
    def close_secure_session(sock: socket.socket) -> None:
        Crypto._keys.pop(sock, None)

    @staticmethod
    def recv_secure(sock: socket.socket) -> dict[str, Any]:
        key = Crypto._get_key(sock)
        body = recv_frame(sock)

        if len(body) < Crypto.MIN_ENCRYPTED_BODY_SIZE or len(body) > MAX_FRAME_LEN:
            raise ValueError(f"Invalid encrypted frame length: {len(body)}")

        nonce = body[:Crypto.NONCE_SIZE]
        ciphertext_and_tag = body[Crypto.NONCE_SIZE:]

        try:
            plaintext = AESGCM(key).decrypt(nonce, ciphertext_and_tag, None)
            payload = json.loads(plaintext.decode("utf-8"))
        except InvalidTag as exc:
            raise ValueError("Invalid encrypted frame tag") from exc
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError("Invalid encrypted JSON payload") from exc

        if not isinstance(payload, dict):
            raise ValueError("Encrypted payload must be a JSON object")

        return payload

    @staticmethod
    def send_secure(sock: socket.socket, payload: dict[str, Any]) -> None:
        key = Crypto._get_key(sock)
        plaintext = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        nonce = os.urandom(Crypto.NONCE_SIZE)

        # pyca/cryptography AESGCM returns ciphertext || tag.
        ciphertext_and_tag = AESGCM(key).encrypt(nonce, plaintext, None)
        body = nonce + ciphertext_and_tag

        if len(body) > MAX_FRAME_LEN:
            raise ValueError("Encrypted frame too large")

        send_frame(sock, body)

    @staticmethod
    def _recv_public_key(sock: socket.socket) -> x25519.X25519PublicKey:
        public_key_bytes = recv_exact(sock, Crypto.PUBLIC_KEY_SIZE)
        try:
            return x25519.X25519PublicKey.from_public_bytes(public_key_bytes)
        except ValueError as exc:
            raise ValueError("Invalid client public key") from exc

    @staticmethod
    def _derive_aes_key(shared_secret: bytes) -> bytes:
        return HKDF(
            algorithm=hashes.SHA256(),
            length=Crypto.KEY_SIZE,
            salt=None,
            info=None,
        ).derive(shared_secret)

    @staticmethod
    def _get_key(sock: socket.socket) -> bytes:
        key = Crypto._keys.get(sock)
        if key is None:
            raise RuntimeError("Secure session was not started")
        return key
