export interface Agent {
  agent_id: string | number
  status: boolean
  hostname: string
  os: string
  local_ip_addr: string
  public_ip_addr: string
  port: number
  mac_addr: string
  risk_score: number
  under_attack: boolean
  connected_at: string | null
  disconnected_at: string | null
}

export interface SnapshotEvent {
  type: "snapshot"
  agents: Agent[]
}

export interface AgentCreatedEvent {
  type: "agent_created"
  agent: Agent
}

export interface AgentUpdatedEvent {
  type: "agent_updated"
  agent_id: string | number
  fields: Partial<Agent>
}

export type WebSocketEvent = SnapshotEvent | AgentCreatedEvent | AgentUpdatedEvent
