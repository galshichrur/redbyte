import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Download, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Hero */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Download RedByte
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Install the agent on your Windows computer and start protecting your network in minutes.
            </p>
          </div>

          {/* Download Card */}
          <div className="bg-card border border-border rounded-3xl p-10 md:p-14 mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-semibold text-foreground mb-3">Windows 64-bit</h2>
            <p className="text-muted-foreground mb-8">
              For Windows 10, 11 and newer systems
            </p>

            <a 
              href="https://github.com/galshichrur/redbyte/releases/download/production/RedByte.Setup.0.1.0.exe"
              download
            >
              <Button size="lg" className="text-base px-10 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                <Download className="w-5 h-5 mr-2" />
                Download RedByte
              </Button>
            </a>
          </div>

          {/* Getting Started Steps */}
          <div className="bg-secondary/30 rounded-2xl p-8 md:p-10">
            <h3 className="text-xl font-semibold text-foreground mb-6">Quick setup</h3>
            
            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">Create an account</p>
                  <p className="text-sm text-muted-foreground">Sign up to get your enrollment code</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">Install the agent</p>
                  <p className="text-sm text-muted-foreground">Run the installer on your computer</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">Enter your code</p>
                  <p className="text-sm text-muted-foreground">Link the agent to your account</p>
                </div>
              </div>
            </div>

            <Button size="lg" variant="outline" className="bg-transparent" asChild>
              <Link href="/register">
                Create your account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
