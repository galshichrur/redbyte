import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-40 pb-32 px-6 overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="opacity-0 animate-fade-up text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 text-balance">
            Protect your network
            <br />
            <span className="text-primary">without the complexity</span>
          </h1>

          <p className="opacity-0 animate-fade-up animation-delay-100 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
            Detect and respond to cyber attacks in real-time. Simple setup, powerful protection.
          </p>

          <div className="opacity-0 animate-fade-up animation-delay-200 flex items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow" asChild>
              <Link href="/register">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-full bg-transparent" asChild>
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Product preview image placeholder */}
        <div className="opacity-0 animate-scale-in animation-delay-300 relative max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-foreground/5 overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
              <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-secondary via-background to-secondary/50 flex items-center justify-center">
            </div>
          </div>
          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl -z-10" />
        </div>

        {/* Stats */}
        <div className="opacity-0 animate-fade-up animation-delay-400 mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-foreground">Real-time</div>
            <div className="text-sm text-muted-foreground mt-1">Threat detection</div>
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
