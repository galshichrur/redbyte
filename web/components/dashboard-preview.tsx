import { Shield, CheckCircle, Monitor } from "lucide-react"

export function DashboardPreview() {
  return (
    <section id="dashboard" className="py-20 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Your network at a glance</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See everything that matters. Clean, simple, powerful.
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
          <div className="bg-foreground/5 px-6 py-4 border-b border-border flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/60" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <span className="ml-4 text-sm text-muted-foreground">dashboard.redbyte.io</span>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Network Overview</h3>
                <p className="text-sm text-muted-foreground">Last updated: Just now</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                All systems secure
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-secondary/80 rounded-xl p-4">
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-sm text-muted-foreground">Devices protected</div>
              </div>
              <div className="bg-secondary/80 rounded-xl p-4">
                <div className="text-2xl font-bold text-foreground">11</div>
                <div className="text-sm text-muted-foreground">Online now</div>
              </div>
              <div className="bg-secondary/80 rounded-xl p-4">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Threats blocked</div>
              </div>
              <div className="bg-secondary/80 rounded-xl p-4">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">Active alerts</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">DESKTOP-MAIN</div>
                    <div className="text-xs text-muted-foreground">192.168.1.101</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Online
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">LAPTOP-WORK</div>
                    <div className="text-xs text-muted-foreground">192.168.1.102</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Online
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">SERVER-01</div>
                    <div className="text-xs text-primary">Port scan blocked • 2 min ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Protected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
