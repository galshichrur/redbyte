import base64
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.validate_token import get_current_user_id_ws
from ws.ws_manager import ws_manager
from database import SessionLocal
from models import Agent, Event


router = APIRouter()


def agent_to_dict(a: Agent) -> dict[str, Any]:
    return {
        "agent_id": base64.urlsafe_b64encode(a.agent_id).decode(),
        "status": a.status,
        "hostname": a.hostname,
        "os": a.os,
        "local_ip_addr": a.local_ip_addr,
        "public_ip_addr": a.public_ip_addr,
        "port": a.port,
        "mac_addr": a.mac_addr,
        "network_type": a.network_type,
        "username": a.username,
        "first_seen": a.first_seen.isoformat(),
        "connected_at": a.connected_at.isoformat() if a.connected_at else None,
        "disconnected_at": a.disconnected_at.isoformat() if a.disconnected_at else None,
    }

def event_to_dict(e: Event) -> dict[str, Any]:
    return {
        "id": e.id,
        "agent_id": e.agent_id,
        "event_type": e.event_type,
        "name": e.name,
        "severity": e.severity,
        "description": e.description,
        "is_blocked": e.is_blocked,
        "suspected_ip": e.suspected_ip,
        "detected_at": e.detected_at.isoformat() if e.detected_at else None,
        "received_at": e.received_at.isoformat() if e.received_at else None,
    }


def get_snapshot(user_id: int):
    with SessionLocal() as db:
        agents = db.query(Agent).filter(Agent.user_id == user_id).all()
        events = db.query(Event).filter(Event.user_id == user_id).all()

        return {
            "agents": [agent_to_dict(a) for a in agents],
            "events": [event_to_dict(e) for e in events],
        }

@router.websocket("/ws")
async def ws_main(ws: WebSocket):
    user_id = get_current_user_id_ws(ws)
    if not user_id:
        await ws.close()
        return

    # Register WebSocket connection for this user
    await ws_manager.connect(user_id, ws)

    try:
        # Send initial snapshot of all user's agents
        snapshot = get_snapshot(user_id)

        await ws.send_json({
            "type": "snapshot",
            **snapshot
        })

        # Keep the connection alive
        while True:
            await ws.receive_text()

    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(user_id, ws)