import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground mb-8">
          <Shield className="w-4 h-4 text-primary" />
          <span>Network security for everyone</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight mb-6 text-balance">
          Protect your network
          <br />
          <span className="text-primary">without the complexity</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Detect and respond to cyber attacks in real-time. Simple setup, powerful protection. No technical expertise
          required.
        </p>

        <div className="flex items-center justify-center">
          <Button size="lg" className="text-base px-8 py-6 rounded-full" asChild>
            <Link href="/register">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-foreground">99.9%</div>
            <div className="text-sm text-muted-foreground mt-1">Detection rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-foreground">{"<"}1s</div>
            <div className="text-sm text-muted-foreground mt-1">Alert time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-foreground">24/7</div>
            <div className="text-sm text-muted-foreground mt-1">Monitoring</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-foreground">5min</div>
            <div className="text-sm text-muted-foreground mt-1">Setup time</div>
          </div>
        </div>
      </div>
    </section>
  )
}
