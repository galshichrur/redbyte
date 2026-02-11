"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useAgentsWebSocket } from "@/hooks/use-agents-websocket"
import { AgentCard } from "@/components/dashboard/agent-card"
import { ConnectionStatusBadge } from "@/components/dashboard/connection-status"
import { EnrollmentModal } from "@/components/dashboard/enrollment-modal"
import { Monitor, Plus } from "lucide-react"

export default function DashboardPage() {
  const { user, token } = useAuth()
  const { agents, onlineAgents, offlineAgents, connectionStatus } = useAgentsWebSocket(token)
  const [showEnrollment, setShowEnrollment] = useState(false)

  const threatCount = agents.filter((a) => a.under_attack).length

  return (
    <>
      <EnrollmentModal open={showEnrollment} onOpenChange={setShowEnrollment} token={token} />

      <div className="py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Welcome back, {user?.full_name?.split(" ")[0] || "User"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Monitor and manage your connected agents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatusBadge status={connectionStatus} />
            <button
              type="button"
              onClick={() => setShowEnrollment(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Agent
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-2xl font-semibold text-foreground tracking-tight">{agents.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Total agents</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-2xl font-semibold text-foreground tracking-tight">{onlineAgents.length}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Online</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <span className="text-2xl font-semibold text-foreground tracking-tight">{offlineAgents.length}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Offline</div>
          </div>
        </div>

        {agents.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-foreground tracking-tight">Agents</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {threatCount > 0 && (
                  <span className="text-destructive font-medium">{threatCount} active {threatCount === 1 ? "threat" : "threats"}</span>
                )}
                <span>{agents.length} total</span>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-5">
              {[...onlineAgents, ...offlineAgents].map((agent) => (
                <AgentCard key={String(agent.agent_id)} agent={agent} />
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl py-20 text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">No agents connected</h3>
            <p className="text-muted-foreground text-sm">Click "Add Agent" to connect your first machine</p>
          </div>
        )}
      </div>
    </>
  )
}
