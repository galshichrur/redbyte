"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createEnrollmentCode } from "@/lib/api"
import { Copy, Check, Download, Key, Monitor, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [enrollmentCode, setEnrollmentCode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = async () => {
    if (!token) return
    setIsGenerating(true)
    setError(null)

    try {
      const response = await createEnrollmentCode(token)
      setEnrollmentCode(response.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate code")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyCode = async () => {
    if (!enrollmentCode) return
    await navigator.clipboard.writeText(enrollmentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.full_name?.split(" ")[0] || "User"}</h1>
        <p className="text-muted-foreground mt-1">Connect your computers to start monitoring</p>
      </div>

      {/* Connect Agent Section */}
      <div className="bg-background border border-border rounded-xl p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground mb-6">Connect an Agent</h2>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-medium text-foreground mb-1">1. Download</div>
            <p className="text-xs text-muted-foreground">Get the agent for Windows</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-medium text-foreground mb-1">2. Enter Code</div>
            <p className="text-xs text-muted-foreground">Use your enrollment code</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-medium text-foreground mb-1">3. Done</div>
            <p className="text-xs text-muted-foreground">Your computer is protected</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Enrollment Code */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Your Enrollment Code</h3>
            {enrollmentCode && (
              <button
                onClick={generateCode}
                disabled={isGenerating}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                New code
              </button>
            )}
          </div>

          {!enrollmentCode ? (
            <button
              onClick={generateCode}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Generate Enrollment Code
                </>
              )}
            </button>
          ) : (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <code className="text-2xl font-mono font-bold text-foreground tracking-wider">{enrollmentCode}</code>
                <button
                  onClick={copyCode}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Enter this code in the agent to link your computer</p>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Download Link */}
        <div className="mt-6 pt-6 border-t border-border">
          <Link href="/download" className="text-sm text-primary hover:underline flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            Download the agent for Windows
          </Link>
        </div>
      </div>
    </div>
  )
}
