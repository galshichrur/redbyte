"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { registerUser } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const passwordRules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
]

export function RegisterForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" })
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; api?: string }>({})

  const allPasswordRulesMet = passwordRules.every((rule) => rule.test(formData.password))

  const validate = () => {
    const newErrors: { fullName?: string; email?: string; password?: string } = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters"
    }
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!allPasswordRulesMet) {
      newErrors.password = "Password doesn't meet requirements"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await registerUser(formData.email, formData.fullName, formData.password)
      await login(response.access_token)
      router.push("/dashboard")
    } catch (err) {
      setErrors({ api: err instanceof Error ? err.message : "Registration failed" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.api && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{errors.api}</div>}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder=""
          value={formData.fullName}
          onChange={(e) => {
            setFormData({ ...formData, fullName: e.target.value })
            if (errors.fullName) setErrors({ ...errors, fullName: undefined })
          }}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="support@redbyte.app"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value })
            if (errors.email) setErrors({ ...errors, email: undefined })
          }}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value })
              if (errors.password) setErrors({ ...errors, password: undefined })
            }}
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}

        {formData.password && (
          <div className="grid grid-cols-2 gap-1 pt-1">
            {passwordRules.map((rule, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                {rule.test(formData.password) ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground" />
                )}
                <span className={rule.test(formData.password) ? "text-foreground" : "text-muted-foreground"}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  )
}
