import { Download, Key, Activity } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Download,
    title: "Install the agent",
    description: "Download our lightweight app and install it on any Windows computer you want to protect.",
  },
  {
    step: "02",
    icon: Key,
    title: "Enter your code",
    description: "Get a unique authentication code from your dashboard and enter it in the app. That's it.",
  },
  {
    step: "03",
    icon: Activity,
    title: "Stay protected",
    description:
      "Your computer is now monitored 24/7. View status, receive alerts, and manage everything from your dashboard.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Up and running in minutes</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to protect your entire network.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-primary/10 mb-4">{step.step}</div>
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4">
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 right-0 w-1/2 h-px bg-border transform translate-x-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
