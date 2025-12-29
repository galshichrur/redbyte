import { Shield, Zap, Eye, Bell, Lock, MonitorSmartphone } from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Real-time monitoring",
    description: "Watch your entire network from one place. See what's happening on every computer, every second.",
  },
  {
    icon: Zap,
    title: "Instant detection",
    description: "Spot attacks the moment they happen. Our system catches port scans, DDoS attacks, and more.",
  },
  {
    icon: Bell,
    title: "Smart alerts",
    description: "Get notified immediately when something suspicious happens. No noise, just what matters.",
  },
  {
    icon: Shield,
    title: "Automatic response",
    description: "Don't just detect threats—stop them. Our system can block attacks before they cause damage.",
  },
  {
    icon: Lock,
    title: "Encrypted everything",
    description: "Military-grade AES-256 encryption protects all communication between your computers and our system.",
  },
  {
    icon: MonitorSmartphone,
    title: "Easy dashboard",
    description: "No technical knowledge needed. A clean, simple interface shows you exactly what you need to know.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need to stay safe</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful protection made simple. Here's what redbyte does for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
