export interface Agent {
  agent_id: string | number
  status: boolean
  hostname: string
  os: string
  local_ip_addr: string
  public_ip_addr: string
  port: number
  mac_addr: string
  under_attack: boolean
  connected_at: string | null
  disconnected_at: string | null
}

export interface AlertEvent {
  id: number
  agent_id: number
  event_type: string
  name: string
  severity: number
  description: string
  is_blocked: boolean
  suspected_ip: string | null
  detected_at: string
  received_at: string
}

export type WebSocketMessage =
  | { type: "snapshot"; agents: Agent[]; events: AlertEvent[] }
  | { type: "agent.created"; agent: Agent }
  | { type: "agent.updated"; agent_id: number; fields: Partial<Agent> }
  | { type: "event.created"; event: AlertEvent }
