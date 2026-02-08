import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-primary rounded-3xl p-12 md:p-20">
          <h2 className="text-3xl md:text-5xl font-semibold text-primary-foreground mb-5 tracking-tight">
            Ready to protect your network?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto font-light">
            Get started today and set up your first computer in less than 5 minutes.
          </p>
          <Button size="lg" variant="secondary" className="text-base px-8 py-6 rounded-full" asChild>
            <Link href="/register">
              Sign Up Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
