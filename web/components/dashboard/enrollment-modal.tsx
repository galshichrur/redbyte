"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createEnrollmentCode } from "@/lib/api"
import { Copy, Check, Download, Key, Monitor, Clock, RotateCw } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EnrollmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
}

export function EnrollmentModal({ open, onOpenChange, token }: EnrollmentModalProps) {
  const [enrollmentToken, setEnrollmentToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft("")
      return
    }

    const calculateTime = () => {
      const utcExpiry = expiresAt.endsWith("Z") ? expiresAt : `${expiresAt}Z`
      const diff = new Date(utcExpiry).getTime() - Date.now()

      if (diff <= 0) {
        setEnrollmentToken(null)
        setExpiresAt(null)
        setTimeLeft("")
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }

    calculateTime()
    timerRef.current = setInterval(calculateTime, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [expiresAt])

  const generateCode = useCallback(async () => {
    if (!token) return
    setIsGenerating(true)
    setError(null)
    setCopied(false)

    try {
      const response = await createEnrollmentCode(token)
      setEnrollmentToken(response.token)
      setExpiresAt(response.expires_at || null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate code"
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }, [token])

  const copyCode = useCallback(async () => {
    if (!enrollmentToken) return
    await navigator.clipboard.writeText(enrollmentToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [enrollmentToken])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl font-semibold tracking-tight">Add a new agent</DialogTitle>
          <DialogDescription className="text-sm">
            Follow these steps to connect your Windows machine to RedByte
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          <div className="space-y-3">
            {[
              {
                icon: Download,
                title: "Download the agent",
                desc: (
                  <>
                    Get it from the{" "}
                    <Link href="/download" className="text-primary hover:underline font-medium">
                      download page
                    </Link>
                  </>
                ),
              },
              { icon: Key, title: "Generate and copy your code", desc: "Use the button below to create a new enrollment code" },
              { icon: Monitor, title: "Enter code in the agent", desc: "Paste the code when prompted and your agent will connect automatically" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="font-medium text-foreground text-sm">{step.title}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            {!enrollmentToken ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
                  <Key className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Ready to connect?</p>
                  <p className="text-xs text-muted-foreground">Generate your enrollment code to get started</p>
                </div>
                <button
                  type="button"
                  onClick={generateCode}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Generate Code
                    </>
                  )}
                </button>
                {error && <p className="text-xs text-destructive mt-2">{error}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-6 text-center relative border border-border">
                  <div className="text-xs text-muted-foreground mb-3 font-medium">Your enrollment code</div>
                  <code className="text-3xl font-mono font-bold text-foreground tracking-widest block select-all">
                    {enrollmentToken}
                  </code>
                  {timeLeft && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-2.5 py-1.5 rounded-md border border-border">
                      <Clock className="w-3 h-3" />
                      {timeLeft}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={generateCode}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                        <span className="text-foreground">Generating...</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">New Code</span>
                      </>
                    )}
                  </button>
                </div>
                {error && <p className="text-xs text-destructive text-center">{error}</p>}
                <p className="text-xs text-center text-muted-foreground">
                  Code expires in {timeLeft}. Generate a new one after each use.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
