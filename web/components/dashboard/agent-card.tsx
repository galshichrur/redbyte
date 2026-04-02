"use client"

import type { Agent } from "@/lib/types"
import { Monitor, ShieldAlert, Network, User, Wifi, Globe, Hash, Clock, CalendarClock, CircleSlash } from "lucide-react"

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

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType
  label: string
  value: string | number | null | undefined
  mono?: boolean
}) {
  const display = value != null && value !== "" ? String(value) : "—"
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</div>
        <div className={`text-sm text-foreground font-medium truncate ${mono ? "font-mono" : ""}`}>{display}</div>
      </div>
    </div>
  )
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
          ? "border-destructive/40 shadow-sm shadow-destructive/10"
          : isOnline
            ? "border-border hover:border-primary/30"
            : "border-border opacity-75 hover:opacity-100"
      }
    `}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`
              w-12 h-12 rounded-xl flex items-center justify-center shrink-0
              ${isAttacked ? "bg-destructive/10" : isOnline ? "bg-primary/10" : "bg-muted"}
            `}
            >
              <Monitor
                className={`w-5 h-5 ${isAttacked ? "text-destructive" : isOnline ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground tracking-tight leading-tight truncate">
                {agent.hostname || "Unknown Host"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{agent.os || "Unknown OS"}</p>
              {agent.username && (
                <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                  <span className="font-mono">{agent.username}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {isAttacked && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                Threat
              </div>
            )}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                isOnline ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"}`}
              />
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60 mx-6" />

      {/* Network section */}
      <div className="px-6 py-5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Network</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow icon={Wifi} label="Local IP" value={agent.local_ip_addr} mono />
          <InfoRow icon={Globe} label="Public IP" value={agent.public_ip_addr} mono />
          <InfoRow icon={Hash} label="Port" value={agent.port} mono />
          <InfoRow icon={Network} label="MAC Address" value={agent.mac_addr} mono />
          <InfoRow icon={Network} label="Network Type" value={agent.network_type} />
          <InfoRow icon={User} label="Username" value={agent.username} mono />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60 mx-6" />

      {/* Timestamps section */}
      <div className="px-6 py-5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Connectivity</div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">First Seen</div>
              <div className="text-sm text-foreground font-medium">{formatDateTime(agent.first_seen)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isOnline ? "bg-emerald-500/10" : "bg-muted"}`}>
              <Clock className={`w-3.5 h-3.5 ${isOnline ? "text-emerald-500" : "text-muted-foreground"}`} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                {isOnline ? "Connected" : "Last Connected"}
              </div>
              <div className="text-sm text-foreground font-medium">
                {agent.connected_at
                  ? `${formatRelativeTime(agent.connected_at)} · ${formatDateTime(agent.connected_at)}`
                  : "—"}
              </div>
            </div>
          </div>

          {agent.disconnected_at && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                <CircleSlash className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Disconnected</div>
                <div className="text-sm text-foreground font-medium">
                  {formatRelativeTime(agent.disconnected_at)} · {formatDateTime(agent.disconnected_at)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
