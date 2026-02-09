from typing import Dict, Set, Any
from fastapi import WebSocket


class ConnectionManager:
    """Manages active WebSocket connections per user."""

    def __init__(self) -> None:
        self._connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, ws: WebSocket) -> None:
        """Register a new WebSocket connection for a user."""
        await ws.accept()

        if user_id not in self._connections:
            self._connections[user_id] = set()

        self._connections[user_id].add(ws)

    def disconnect(self, user_id: int, ws: WebSocket) -> None:
        """Remove a WebSocket connection and clean up if needed."""
        conns = self._connections.get(user_id)
        if not conns:
            return

        conns.discard(ws)

        if not conns:
            del self._connections[user_id]

    async def notify_user(self, user_id: int, event: Dict[str, Any]) -> None:
        """Send a JSON event to all active WebSocket connections of a user."""
        for ws in self._connections.get(user_id, []):
            await ws.send_json(event)


# Single global instance used across the app
ws_manager = ConnectionManager()
