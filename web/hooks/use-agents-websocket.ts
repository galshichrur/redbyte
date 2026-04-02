"use client"

import { useState, useEffect, useMemo } from "react"
import type { Agent, AlertEvent, WebSocketMessage } from "@/lib/types"

const WS_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/^http/, "ws")

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

let activeWs: WebSocket | null = null
let activeToken: string | null = null

export function useWebSocket(token: string | null) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [events, setEvents] = useState<AlertEvent[]>([])
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

      const ws = new WebSocket(`${WS_BASE_URL}/ws?token=${token}`)
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
          const data: WebSocketMessage = JSON.parse(event.data)
          console.log("[v0] ws message:", data.type, data)

          switch (data.type) {
            case "snapshot":
              setAgents(data.agents)
              setEvents(data.events)
              break
            case "agent.created":
              setAgents((prev) => [...prev, data.agent])
              break
            case "agent.updated": {
              const updateId = data.agent_id
              setAgents((prev) =>
                prev.map((a) => (String(a.agent_id) === String(updateId) ? { ...a, ...data.fields } : a))
              )
              break
            }
            case "event.created":
              setEvents((prev) => [data.event, ...prev])
              break
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
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (activeWs) {
        activeWs.close()
        activeWs = null
        activeToken = null
      }
    }
  }, [token])

  const onlineAgents = useMemo(() => agents.filter((a) => a.status), [agents])
  const offlineAgents = useMemo(() => agents.filter((a) => !a.status), [agents])

  return { agents, onlineAgents, offlineAgents, events, connectionStatus }
}
