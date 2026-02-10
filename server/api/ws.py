import base64
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Agent
from services.validate_token import get_current_user_id
from api.ws_manager import ws_manager


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
        "risk_score": a.risk_score,
        "under_attack": a.under_attack,
        "connected_at": a.connected_at.isoformat() if a.connected_at else None,
        "disconnected_at": a.disconnected_at.isoformat() if a.disconnected_at else None,
    }


@router.websocket("/ws/agents")
async def ws_agents(ws: WebSocket, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):

    # Register WebSocket connection for this user
    await ws_manager.connect(user_id, ws)

    try:
        # Send initial snapshot of all user's agents
        agents = db.query(Agent).filter(Agent.user_id == user_id).all()
        await ws.send_json({
            "type": "snapshot",
            "agents": [agent_to_dict(a) for a in agents],
        })

        # Keep the connection alive
        while True:
            await ws.receive_text()

    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(user_id, ws)
