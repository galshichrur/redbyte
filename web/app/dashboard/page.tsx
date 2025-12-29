"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { createEnrollmentCode } from "@/lib/api"
import { Copy, Check, Download, Key, Monitor, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [enrollment, setEnrollment] = useState<{ token: string; expires_at: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("")

  const calculateTimeLeft = useCallback(() => {
    if (!enrollment?.expires_at) return ""
    const now = new Date().getTime()
    const expiry = new Date(enrollment.expires_at).getTime()
    const diff = expiry - now

    if (diff <= 0) {
      setEnrollment(null)
      return ""
    }

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [enrollment?.expires_at])

  useEffect(() => {
    if (!enrollment?.expires_at) return

    const interval = setInterval(() => {
      const time = calculateTimeLeft()
      setTimeLeft(time)
      if (!time) {
        clearInterval(interval)
      }
    }, 1000)

    setTimeLeft(calculateTimeLeft())
    return () => clearInterval(interval)
  }, [enrollment?.expires_at, calculateTimeLeft])

  const generateCode = async () => {
    if (!token) return
    setIsGenerating(true)
    setError(null)

    try {
      const response = await createEnrollmentCode(token)
      setEnrollment({ token: response.token, expires_at: response.expires_at || "" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate code"
      if (message.includes("already registered")) {
        setError("You already have an active code. Wait for it to expire or use it to connect.")
      } else {
        setError(message)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const copyCode = async () => {
    if (!enrollment?.token) return
    await navigator.clipboard.writeText(enrollment.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="py-8">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.full_name?.split(" ")[0] || "User"}</h1>
        <p className="text-muted-foreground mt-2">Connect your computers to start monitoring</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Steps */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">How to connect</h2>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">1. Download the agent</div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Get the Windows agent from the{" "}
                  <Link href="/download" className="text-primary hover:underline">
                    download page
                  </Link>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">2. Enter your code</div>
                <p className="text-sm text-muted-foreground mt-0.5">Generate a code and paste it in the agent</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">3. You're protected</div>
                <p className="text-sm text-muted-foreground mt-0.5">Your computer will appear here once connected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Enrollment Code */}
        <div className="bg-background border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Enrollment Code</h2>
          <p className="text-sm text-muted-foreground mb-6">Generate a one-time code to link a new computer</p>

          {!enrollment ? (
            <button
              onClick={generateCode}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  Generate Code
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Code display */}
              <div className="bg-muted/50 rounded-xl p-5 text-center relative">
                <code className="text-3xl font-mono font-bold text-foreground tracking-widest">{enrollment.token}</code>
                {timeLeft && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border border-border">
                    <Clock className="w-3 h-3" />
                    {timeLeft}
                  </div>
                )}
              </div>

              {/* Copy button */}
              <button
                onClick={copyCode}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">Copy code</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                Code expires when timer runs out. Once used, generate a new one.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-4 text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}
