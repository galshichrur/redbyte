"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Agent, AlertEvent, WebSocketMessage } from "@/lib/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE_URL = apiUrl.startsWith("https")
  ? apiUrl.replace(/^https/, "wss")
  : apiUrl.replace(/^http/, "ws");

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useWebSocket(token: string | null) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  // Keep a stable ref to the current ws so the cleanup always closes the right socket
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    // Each effect instance gets its own disposed flag; flipped to true in cleanup
    let disposed = false;

    const connect = () => {
      if (disposed) return;

      setConnectionStatus("connecting");

      const ws = new WebSocket(`${WS_BASE_URL}/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (disposed) {
          ws.close();
          return;
        }
        setConnectionStatus("connected");
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        if (disposed) return;
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          switch (data.type) {
            case "snapshot":
              setAgents(data.agents);
              setEvents(data.events);
              break;
            case "agent.created":
              setAgents((prev) => [...prev, data.agent]);
              break;
            case "agent.updated": {
              const updateId = data.agent_id;
              setAgents((prev) =>
                prev.map((a) =>
                  String(a.agent_id) === String(updateId)
                    ? { ...a, ...data.fields }
                    : a,
                ),
              );
              break;
            }
            case "event.created":
              setEvents((prev) => [data.event, ...prev]);
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        if (disposed) return;
        setConnectionStatus("error");
      };

      ws.onclose = () => {
        // If this close was triggered by our own cleanup, do nothing
        if (disposed) return;

        wsRef.current = null;
        setConnectionStatus("disconnected");

        if (reconnectAttempts < 10) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
          reconnectAttempts += 1;
          reconnectTimeout = setTimeout(connect, delay);
        }
      };
    };

    connect();

    return () => {
      // Mark this effect instance as dead so none of its callbacks touch state
      disposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      // Close and release the socket that belongs to this effect run
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null; // prevent onclose from scheduling another reconnect
        ws.close();
        wsRef.current = null;
      }
    };
  }, [token]);

  const onlineAgents = useMemo(() => agents.filter((a) => a.status), [agents]);
  const offlineAgents = useMemo(
    () => agents.filter((a) => !a.status),
    [agents],
  );

  return { agents, onlineAgents, offlineAgents, events, connectionStatus };
}
