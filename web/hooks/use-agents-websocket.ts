"use client"

import { useState, useEffect, useMemo } from "react"
import type { Agent, WebSocketEvent } from "@/lib/types"

const WS_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/^http/, "ws")

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

let activeWs: WebSocket | null = null
let activeToken: string | null = null

export function useAgentsWebSocket(token: string | null) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")

  useEffect(() => {
    if (!token) return

    if (activeWs && activeToken === token && (activeWs.readyState === WebSocket.OPEN || activeWs.readyState === WebSocket.CONNECTING)) {
      return
    }

    if (activeWs) {
      activeWs.close()
      activeWs = null
      activeToken = null
    }

    let reconnectTimeout: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    let disposed = false

    const connect = () => {
      if (disposed) return

      setConnectionStatus("connecting")

      const ws = new WebSocket(`${WS_BASE_URL}/ws/agents?token=${token}`)
      activeWs = ws
      activeToken = token

      ws.onopen = () => {
        if (disposed) return
        setConnectionStatus("connected")
        reconnectAttempts = 0
      }

      ws.onmessage = (event) => {
        if (disposed) return
        try {
          const data: WebSocketEvent = JSON.parse(event.data)

          switch (data.type) {
            case "snapshot":
              setAgents(data.agents)
              break
            case "agent_created":
              setAgents((prev) => [...prev, data.agent])
              break
            case "agent_updated": {
              const updateId = data.fields.agent_id ?? data.agent_id
              setAgents((prev) =>
                prev.map((a) => (String(a.agent_id) === String(updateId) ? { ...a, ...data.fields } : a))
              )
              break
            }
          }
        } catch {
          // ignore malformed messages
        }
      }

      ws.onerror = () => {
        if (disposed) return
        setConnectionStatus("error")
      }

      ws.onclose = () => {
        if (disposed) return

        activeWs = null
        activeToken = null
        setConnectionStatus("disconnected")

        if (reconnectAttempts < 10) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000)
          reconnectAttempts += 1
          reconnectTimeout = setTimeout(connect, delay)
        }
      }
    }

    connect()

    return () => {
      disposed = true

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }

      if (activeWs) {
        activeWs.close()
        activeWs = null
        activeToken = null
      }
    }
  }, [token])

  const onlineAgents = useMemo(() => agents.filter((a) => a.status), [agents])
  const offlineAgents = useMemo(() => agents.filter((a) => !a.status), [agents])

  return { agents, onlineAgents, offlineAgents, connectionStatus }
}
