from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from database import SessionLocal
from models import Event
from services.validate_token import get_current_user_id_ws
from ws.ws_manager import ws_manager


router = APIRouter()


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

def format_events(user_id: int) -> list[dict[str, Any]]:
    with SessionLocal() as db:
        events = db.query(Event).filter(Event.user_id == user_id).all()
        return [event_to_dict(e) for e in events]

@router.websocket("/ws/events")
async def ws_events(ws: WebSocket):
    user_id = get_current_user_id_ws(ws)
    if not user_id:
        await ws.close()
        return

    await ws_manager.connect(user_id, ws)

    try:
        # Send initial snapshot
        events_data = format_events(user_id)

        await ws.send_json({
            "type": "snapshot",
            "events": events_data,
        })

        while True:
            await ws.receive_text()

    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(user_id, ws)