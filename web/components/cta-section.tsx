import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-primary rounded-3xl p-10 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to protect your network?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
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
