from datetime import datetime
from models.event import Event
from ws.ws_manager import ws_manager
from ws.events import event_to_dict


def create_event(db, user_id: int, agent_id: int, event_type: str, name: str, severity: int,
                 description: str, is_blocked: bool, suspected_ip: str, detected_at: datetime) -> Event:

    event = Event(
        user_id=user_id,
        agent_id=agent_id,

        event_type=event_type,
        name=name,
        severity=severity,
        description=description,
        is_blocked=is_blocked,
        suspected_ip=suspected_ip,
        detected_at=detected_at
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    ws_manager.notify(user_id, {
        "type": "event_created",
        "event": event_to_dict(event),
    })

    return event