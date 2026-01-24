import { Shield, Zap, Eye, Bell, Lock, MonitorSmartphone } from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Real-time monitoring",
    description: "Watch your entire network from one place. See what's happening on every computer.",
  },
  {
    icon: Zap,
    title: "Instant detection",
    description: "Spot attacks the moment they happen. Port scans, DDoS attacks, and more.",
  },
  {
    icon: Bell,
    title: "Smart alerts",
    description: "Get notified when something suspicious happens. No noise, just what matters.",
  },
  {
    icon: Shield,
    title: "Automatic response",
    description: "Don't just detect threats—stop them before they cause damage.",
  },
  {
    icon: Lock,
    title: "Encrypted everything",
    description: "AES-256 encryption protects all communication between your computers.",
  },
  {
    icon: MonitorSmartphone,
    title: "Easy dashboard",
    description: "No technical knowledge needed. A clean interface shows exactly what you need.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 opacity-0 animate-fade-up">
          <p className="text-primary font-medium text-sm uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Everything you need to stay safe</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful protection made simple.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="opacity-0 animate-fade-up group bg-card p-6 rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
