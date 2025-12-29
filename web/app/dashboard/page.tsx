"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.full_name.split(" ")[0]}</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage your network security</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Active Agents</h3>
              </div>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-1">No agents connected yet</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <h3 className="font-semibold">Network Status</h3>
              </div>
              <p className="text-3xl font-bold text-green-500">Secure</p>
              <p className="text-sm text-muted-foreground mt-1">No threats detected</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <span className="text-orange-500 font-bold">!</span>
                </div>
                <h3 className="font-semibold">Alerts</h3>
              </div>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-1">No alerts today</p>
            </div>
          </div>

          <div className="mt-8 bg-card border border-border rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Get started with redbyte</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Download and install the redbyte agent on your computers to start monitoring your network.
            </p>
            <a
              href="/download"
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              Download Agent
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
