"use client"

import type { Agent } from "@/lib/types"
import { Monitor, ShieldAlert } from "lucide-react"

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const utc = dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`
  const date = new Date(utc)
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const utc = dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`
  const diff = Date.now() - new Date(utc).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function AgentCard({ agent }: { agent: Agent }) {
  const isOnline = agent.status
  const isAttacked = agent.under_attack
  const connectionTime = isOnline ? agent.connected_at : agent.disconnected_at

  return (
    <div
      className={`
      bg-card rounded-xl border transition-all duration-200
      ${
        isAttacked
          ? "border-destructive/30"
          : isOnline
            ? "border-border hover:border-primary/20"
            : "border-border opacity-70 hover:opacity-100"
      }
    `}
    >
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`
              w-14 h-14 rounded-xl flex items-center justify-center shrink-0
              ${isAttacked ? "bg-destructive/10" : isOnline ? "bg-primary/10" : "bg-muted"}
            `}
            >
              <Monitor
                className={`w-6 h-6 ${isAttacked ? "text-destructive" : isOnline ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">{agent.hostname}</h3>
              <p className="text-sm text-muted-foreground mt-1">{agent.os}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isAttacked && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
                <ShieldAlert className="w-4 h-4" />
                Threat
              </div>
            )}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isOnline ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"}`}
              />
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Local IP</div>
              <div className="text-base text-foreground font-medium">{agent.local_ip_addr}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">MAC Address</div>
              <div className="text-base text-foreground font-medium">{agent.mac_addr}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Public IP</div>
              <div className="text-base text-foreground font-medium">{agent.public_ip_addr}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Port</div>
              <div className="text-base text-foreground font-medium">{agent.port}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{isOnline ? "Connected" : "Disconnected"}</div>
          <div className="text-base text-foreground font-medium">{formatRelativeTime(connectionTime)} • {formatDateTime(connectionTime)}</div>
        </div>
      </div>
    </div>
  )
}
