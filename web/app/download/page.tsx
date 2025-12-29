import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Monitor, Download, UserPlus, Link2 } from "lucide-react"

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Download the Agent</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Install the redbyte agent on your computer to start monitoring your network. Available for Windows.
            </p>
          </div>

          {/* Download Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Windows 64-bit */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Monitor className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">Windows 64-bit</h3>
                    <p className="text-sm text-muted-foreground">Recommended for most users</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  For Windows 10, 11 and newer 64-bit systems. Best performance and compatibility.
                </p>
                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download for Windows x64
                </Button>
              </CardContent>
            </Card>

            {/* Windows 32-bit */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center">
                    <Monitor className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">Windows 32-bit</h3>
                    <p className="text-sm text-muted-foreground">For older systems</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  For older Windows systems running 32-bit architecture. Legacy support.
                </p>
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Download for Windows x86
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* How to get started */}
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">How to get started</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Step 1</div>
                <h3 className="font-semibold text-foreground mb-2">Create an account</h3>
                <p className="text-sm text-muted-foreground">
                  Register to get access to your dashboard and link your agents.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Step 2</div>
                <h3 className="font-semibold text-foreground mb-2">Download the agent</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the right version for your system and install it.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Step 3</div>
                <h3 className="font-semibold text-foreground mb-2">Link to your account</h3>
                <p className="text-sm text-muted-foreground">
                  Log in through the agent to connect it to your dashboard.
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Button size="lg">Create your account</Button>
            </div>
          </div>

          {/* System Requirements */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">System Requirements</h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Operating System</h4>
                  <p className="text-muted-foreground">Windows 10 or later (64-bit recommended)</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Memory</h4>
                  <p className="text-muted-foreground">Minimum 2GB RAM</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Disk Space</h4>
                  <p className="text-muted-foreground">50MB available space</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Network</h4>
                  <p className="text-muted-foreground">Internet connection required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
