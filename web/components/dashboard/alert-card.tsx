"use client"

import type { AlertEvent } from "@/lib/types"
import { ShieldCheck, ShieldAlert } from "lucide-react"

function formatTime(dateStr: string): string {
  const utc = dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`
  return new Date(utc).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SeverityBadge({ severity }: { severity: number }) {
  if (severity >= 7) return <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-destructive/10 text-destructive">High</span>
  if (severity >= 4) return <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-500/10 text-orange-500">Medium</span>
  return <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground">Low</span>
}

export function AlertCard({ event }: { event: AlertEvent }) {
  const isHigh = event.severity >= 7

  return (
    <div className={`bg-card rounded-xl border p-5 ${isHigh ? "border-destructive/30" : "border-border"}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isHigh ? "bg-destructive/10" : "bg-muted"}`}>
            {event.is_blocked
              ? <ShieldCheck className={`w-4 h-4 ${isHigh ? "text-destructive" : "text-muted-foreground"}`} />
              : <ShieldAlert className={`w-4 h-4 ${isHigh ? "text-destructive" : "text-muted-foreground"}`} />
            }
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{event.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{event.event_type}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SeverityBadge severity={event.severity} />
          {event.is_blocked && (
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600">Blocked</span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Agent ID</div>
          <div className="text-sm text-foreground font-medium">{event.agent_id}</div>
        </div>
        {event.suspected_ip && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Suspected IP</div>
            <div className="text-sm text-foreground font-medium">{event.suspected_ip}</div>
          </div>
        )}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Detected</div>
          <div className="text-sm text-foreground font-medium">{formatTime(event.detected_at)}</div>
        </div>
      </div>
    </div>
  )
}
