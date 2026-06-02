import json
import os
import socket
import struct
from typing import Any, Dict
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from network.protocol import LENGTH_SIZE, MAX_FRAME_LEN, recv_exact


class Crypto:
    NONCE_SIZE = 12
    TAG_SIZE = 16
    PUBLIC_KEY_SIZE = 32
    MIN_ENCRYPTED_FRAME_LEN = NONCE_SIZE + TAG_SIZE

    _keys: dict[socket.socket, bytes] = {}

    @staticmethod
    def start_secure_session(sock: socket.socket) -> None:
        """Handshake: public_key(32 bytes)."""
        client_public_key = Crypto._recv_public_key(sock)

        server_private_key = x25519.X25519PrivateKey.generate()
        server_public_bytes = server_private_key.public_key().public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw,
        )
        shared_secret = server_private_key.exchange(client_public_key)
        aes_key = Crypto._make_aes_key(shared_secret)

        Crypto._send_public_key(sock, server_public_bytes)
        Crypto._keys[sock] = aes_key

    @staticmethod
    def close_secure_session(sock: socket.socket) -> None:
        Crypto._keys.pop(sock, None)

    @staticmethod
    def recv_secure(sock: socket.socket) -> Dict[str, Any]:
        """Frame: length(4) | nonce(12) | ciphertext | tag(16)."""
        key = Crypto._get_key(sock)
        length_bytes = recv_exact(sock, LENGTH_SIZE)
        length = struct.unpack("<I", length_bytes)[0]

        if length < Crypto.MIN_ENCRYPTED_FRAME_LEN or length > MAX_FRAME_LEN:
            raise Exception("Invalid encrypted frame length")

        frame = recv_exact(sock, length)
        nonce = frame[:Crypto.NONCE_SIZE]
        ciphertext_and_tag = frame[Crypto.NONCE_SIZE:]

        try:
            plaintext = AESGCM(key).decrypt(nonce, ciphertext_and_tag, None)
            payload = json.loads(plaintext.decode("utf-8"))
        except (InvalidTag, UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise Exception("Failed to decrypt or decode frame") from exc

        if not isinstance(payload, dict):
            raise Exception("Encrypted payload must be a JSON object")

        print(f"Received secure: {payload}\n")
        return payload

    @staticmethod
    def send_secure(sock: socket.socket, payload: Dict[str, Any] | None = None) -> None:
        """Frame: length(4) | nonce(12) | ciphertext | tag(16)."""
        key = Crypto._get_key(sock)
        payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        nonce = os.urandom(Crypto.NONCE_SIZE)
        ciphertext_and_tag = AESGCM(key).encrypt(nonce, payload_bytes, None)
        frame_body = nonce + ciphertext_and_tag

        if len(frame_body) > MAX_FRAME_LEN:
            raise ValueError("Payload too large")

        frame = struct.pack("<I", len(frame_body)) + frame_body
        print(f"Sent secure: {payload}\n")
        sock.sendall(frame)

    @staticmethod
    def _make_aes_key(shared_secret: bytes) -> bytes:
        return HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=None,
            info=None,
        ).derive(shared_secret)

    @staticmethod
    def _recv_public_key(sock: socket.socket) -> x25519.X25519PublicKey:
        public_key_bytes = recv_exact(sock, Crypto.PUBLIC_KEY_SIZE)

        try:
            return x25519.X25519PublicKey.from_public_bytes(public_key_bytes)
        except ValueError as exc:
            raise Exception("Invalid handshake public key") from exc

    @staticmethod
    def _send_public_key(sock: socket.socket, public_key_bytes: bytes) -> None:
        if len(public_key_bytes) != Crypto.PUBLIC_KEY_SIZE:
            raise Exception("Invalid local public key length")

        sock.sendall(public_key_bytes)

    @staticmethod
    def _get_key(sock: socket.socket) -> bytes:
        key = Crypto._keys.get(sock)
        if key is None:
            raise Exception("Secure context not established")
        return key
