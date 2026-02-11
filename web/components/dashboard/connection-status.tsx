"use client"

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

const statusConfig: Record<ConnectionStatus, { label: string; dotColor: string; textColor: string }> = {
  connecting: { label: "Connecting", dotColor: "bg-yellow-500 animate-pulse", textColor: "text-yellow-600" },
  connected: { label: "Live", dotColor: "bg-emerald-500 animate-pulse", textColor: "text-emerald-600" },
  disconnected: { label: "Disconnected", dotColor: "bg-muted-foreground/50", textColor: "text-muted-foreground" },
  error: { label: "Connection error", dotColor: "bg-destructive", textColor: "text-destructive" },
}

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
      <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
    </div>
  )
}
